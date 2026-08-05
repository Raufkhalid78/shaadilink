import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { paymentLimiter } from '@/lib/rate-limit'

const PLAN_AMOUNTS: Record<string, number> = {
  classic: 3499,
  royal: 5799,
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const { success } = await paymentLimiter.limit(`payment_${ip}`)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { invitationId, plan, guestLinksQuota, promoCode } = body

    if (!invitationId || !plan) {
      return NextResponse.json({ error: 'invitationId and plan are required' }, { status: 400 })
    }

    const service = createServiceClient()

    // Verify invitation ownership
    const { data: inv, error: invError } = await service
      .from('invitations')
      .select('user_id, is_active, guest_links_quota')
      .eq('id', invitationId)
      .single()

    if (invError || !inv || inv.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // We no longer update the invitation's quota here to prevent free links on cancelled checkouts.
    // The target quota is instead passed to the callback URL.

    // Calculate total price
    const basePrice = inv.is_active ? 0 : (PLAN_AMOUNTS[plan] ?? PLAN_AMOUNTS.classic)
    const addedQuota = Math.max(0, (guestLinksQuota || 0) - (inv.guest_links_quota || 0))
    const addOnPrice = (addedQuota / 50) * 1000
    let totalAmount = basePrice + addOnPrice

    // Apply promo code if provided
    if (promoCode && totalAmount > 0) {
      const { data: promo } = await service
        .from('referral_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase().trim())
        .single()
        
      if (promo && (promo.max_uses === null || promo.current_uses < promo.max_uses)) {
        if (promo.discount_percent) {
          const discount = Math.floor(totalAmount * (promo.discount_percent / 100))
          totalAmount = Math.max(0, totalAmount - discount)
        }
      }
    }

    if (totalAmount <= 0) {
      return NextResponse.json({ error: 'No new charges to apply.' }, { status: 400 })
    }

    // Create a pending order record
    const { data: order, error: orderErr } = await service
      .from('orders')
      .insert({
        user_id: user.id,
        invitation_id: invitationId,
        plan,
        amount: totalAmount,
        currency: 'PKR',
        status: 'pending',
        target_guest_links_quota: guestLinksQuota || 0,
        promo_code: promoCode ? promoCode.toUpperCase().trim() : null,
      })
      .select()
      .single()

    if (orderErr || !order) {
      console.error('Failed to create pending order:', orderErr)
      return NextResponse.json({ error: 'Failed to initialize order record' }, { status: 500 })
    }

    // Initialize Safepay SDK
    // Safepay confusingly calls the public key "sec_..." and the secret key a long hex string
    const safepaySecret = process.env.SAFEPAY_V1_SECRET || process.env.SAFEPAY_SECRET_KEY;
    const safepayMerchantKey = process.env.SAFEPAY_API_KEY || process.env.SAFEPAY_MERCHANT_API_KEY;

    if (!safepaySecret) throw new Error("SAFEPAY_V1_SECRET is not configured.");
    if (!safepayMerchantKey) throw new Error("SAFEPAY_API_KEY is not configured.");

    const safepayFactory = require('@sfpy/node-core');
    const safepay = safepayFactory(safepaySecret, {
      authType: 'secret',
      host: process.env.SAFEPAY_HOST || (process.env.SAFEPAY_ENVIRONMENT === 'sandbox' ? 'https://sandbox.api.getsafepay.com' : 'https://api.getsafepay.com'),
    });

    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
    const siteUrl = `${protocol}://${host}`

    // Create Payment Session
    const sessionResponse = await safepay.payments.session.setup({
      merchant_api_key: safepayMerchantKey,
      intent: 'CYBERSOURCE',
      mode: 'payment',
      currency: 'PKR',
      amount: Math.round(totalAmount * 100), // Lowest denomination (Paisa)
      metadata: {
        order_id: order.id,
      }
    });

    const trackerToken = sessionResponse.data?.tracker?.token || sessionResponse.data?.token || sessionResponse.tracker?.token;
    if (!trackerToken) {
      throw new Error(`Safepay failed to return a tracker token. Response: ${JSON.stringify(sessionResponse)}`);
    }

    // Update order with the tracker token for webhook reconciliation
    await service.from('orders').update({ tracker: trackerToken }).eq('id', order.id);

    // Generate Checkout URL using the Safepay helper
// Step 1: Create a short-lived auth token (required by Safepay for the checkout URL)
    const passportResponse = await safepay.client.passport.create();
    const tbt = passportResponse.data;
    if (!tbt) {
      throw new Error(`Safepay failed to return an auth token. Response: ${JSON.stringify(passportResponse)}`);
    }

    // Step 2: Generate Checkout URL using the Safepay helper — note the correct param names
    const env = process.env.SAFEPAY_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
    const checkoutUrl = safepay.checkout.createCheckoutUrl({
      env,                 // NOT "environment"
      tracker: trackerToken,
      tbt,                 // the auth token from Step 1 — was missing entirely
      cancel_url: `${siteUrl}/order/cancel`,     // NOT "cancelUrl"
      redirect_url: `${siteUrl}/order/complete`, // NOT "redirectUrl"
      source: 'hosted',    // "custom" isn't a documented/valid value — see note below
    });

    return NextResponse.json({
      orderId: order.id,
      totalAmount: totalAmount,
      checkoutUrl: checkoutUrl
    })
  } catch (error: any) {
    console.error('POST /api/payment/initiate error:', error)
    // Safepay SDK errors usually have error.message or error.data
    const errorMessage = error.message || (error.data && error.data.message) || 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

