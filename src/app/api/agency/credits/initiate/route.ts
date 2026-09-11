import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { WHOLESALE_CREDIT_PACKS } from '@/lib/agency';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { packId } = body;

    const pack = WHOLESALE_CREDIT_PACKS.find((p) => p.id === packId);
    if (!pack) {
      return NextResponse.json({ error: 'Invalid credit pack selected' }, { status: 400 });
    }

    const service = createServiceClient();

    // Verify agency application is approved
    const { data: app, error: appErr } = await service
      .from('agency_applications')
      .select('id, company_name')
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .eq('status', 'approved')
      .single();

    if (appErr || !app) {
      return NextResponse.json({ error: 'Approved agency account not found' }, { status: 403 });
    }

    // Insert pending credit order
    const { data: order, error: orderErr } = await service
      .from('agency_credit_orders')
      .insert({
        user_id: user.id,
        agency_id: app.id,
        agency_name: app.company_name,
        pack_name: pack.name,
        credits_count: pack.credits,
        amount_pkr: pack.pricePKR,
        payment_method: 'safepay',
        status: 'pending',
      })
      .select()
      .single();

    if (orderErr || !order) {
      console.error('Failed to create pending agency credit order:', orderErr);
      return NextResponse.json({ error: 'Failed to initialize order record' }, { status: 500 });
    }

    // Initialize Safepay SDK
    const safepaySecret = process.env.SAFEPAY_V1_SECRET || process.env.SAFEPAY_SECRET_KEY;
    const safepayMerchantKey = process.env.SAFEPAY_API_KEY || process.env.SAFEPAY_MERCHANT_API_KEY;

    if (!safepaySecret || !safepayMerchantKey) {
      console.error('Safepay credentials not configured for agency credits.');
      return NextResponse.json(
        { error: 'Safepay payment gateway is not properly configured. Please contact support.' },
        { status: 503 }
      );
    }

    const safepayFactory = require('@sfpy/node-core');
    const safepay = safepayFactory(safepaySecret, {
      authType: 'secret',
      host:
        process.env.SAFEPAY_HOST ||
        (process.env.SAFEPAY_ENVIRONMENT === 'sandbox'
          ? 'https://sandbox.api.getsafepay.com'
          : 'https://api.getsafepay.com'),
    });

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol =
      req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const siteUrl = `${protocol}://${host}`;

    // Step 1: Create Safepay payment session
    const sessionResponse = await safepay.payments.session.setup({
      merchant_api_key: safepayMerchantKey,
      intent: 'CYBERSOURCE',
      mode: 'payment',
      currency: 'PKR',
      amount: Math.round(pack.pricePKR * 100), // In lowest denomination (Paisa)
      metadata: {
        order_id: String(order.id),
        agency_credit_order_id: String(order.id),
        pack_id: String(pack.id),
        credits: String(pack.credits),
        agency_id: String(app.id),
      },
    });

    const trackerToken =
      sessionResponse.data?.tracker?.token ||
      sessionResponse.data?.token ||
      sessionResponse.tracker?.token;

    if (!trackerToken) {
      throw new Error(`Safepay failed to return a tracker token: ${JSON.stringify(sessionResponse)}`);
    }

    // Step 2: Store tracker on the agency credit order
    await service
      .from('agency_credit_orders')
      .update({ safepay_tracker: trackerToken })
      .eq('id', order.id);

    // Step 3: Create short-lived passport auth token
    const passportResponse = await safepay.client.passport.create();
    const tbt = passportResponse.data;
    if (!tbt) {
      throw new Error(`Safepay failed to return an auth token: ${JSON.stringify(passportResponse)}`);
    }

    // Step 4: Generate Checkout URL
    const env = process.env.SAFEPAY_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
    const checkoutUrl = safepay.checkout.createCheckoutUrl({
      env,
      tracker: trackerToken,
      tbt,
      cancel_url: `${siteUrl}/dashboard/agency?payment=cancelled`,
      redirect_url: `${siteUrl}/api/agency/credits/callback?orderId=${order.id}`,
      source: 'hosted',
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amountPkr: pack.pricePKR,
      credits: pack.credits,
      checkoutUrl,
    });
  } catch (err: any) {
    console.error('POST /api/agency/credits/initiate error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to initiate Safepay credit checkout' },
      { status: 500 }
    );
  }
}
