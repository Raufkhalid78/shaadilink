import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const PLAN_AMOUNTS: Record<string, number> = {
  classic: 3499,
  royal: 5799,
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { invitationId, plan, personalizedGuestLinks } = body

    if (!invitationId || !plan) {
      return NextResponse.json({ error: 'invitationId and plan are required' }, { status: 400 })
    }

    const service = createServiceClient()

    // Verify invitation ownership
    const { data: inv, error: invError } = await service
      .from('invitations')
      .select('user_id')
      .eq('id', invitationId)
      .single()

    if (invError || !inv || inv.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Save personalized guest links preference to the invitation
    await service
      .from('invitations')
      .update({ personalized_guest_links: !!personalizedGuestLinks })
      .eq('id', invitationId)

    // Calculate total price
    const basePrice = PLAN_AMOUNTS[plan] ?? PLAN_AMOUNTS.classic
    const addOnPrice = personalizedGuestLinks ? 1000 : 0
    const totalAmount = basePrice + addOnPrice

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
      })
      .select()
      .single()

    if (orderErr || !order) {
      console.error('Failed to create pending order:', orderErr)
      return NextResponse.json({ error: 'Failed to initialize order record' }, { status: 500 })
    }

    const safepayApiKey = process.env.SAFEPAY_API_KEY
    const safepayEnv = process.env.SAFEPAY_ENVIRONMENT || 'sandbox'
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    if (!safepayApiKey) {
      console.error('SAFEPAY_API_KEY is missing')
      return NextResponse.json({ error: 'Payment gateway configuration error' }, { status: 500 })
    }

    // Call Safepay /order/v1/init
    const initUrl = safepayEnv === 'production' 
      ? 'https://api.getsafepay.com/order/v1/init'
      : 'https://sandbox.api.getsafepay.com/order/v1/init'

    const safepayRes = await fetch(initUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client: safepayApiKey,
        amount: totalAmount,
        currency: 'PKR',
        environment: safepayEnv,
      }),
    })

    if (!safepayRes.ok) {
      const errorText = await safepayRes.text()
      console.error('Safepay session initiation failed:', errorText)
      return NextResponse.json({ error: 'Failed to initiate checkout session with payment gateway' }, { status: 502 })
    }

    const safepayData = await safepayRes.json()
    const trackerToken = safepayData?.data?.token

    if (!trackerToken) {
      console.error('Safepay response missing token:', safepayData)
      return NextResponse.json({ error: 'Payment gateway did not return a valid session token' }, { status: 502 })
    }

    // Build the Safepay checkout redirect URL
    const checkoutBase = safepayEnv === 'production'
      ? 'https://api.getsafepay.com/checkout/pay'
      : 'https://sandbox.api.getsafepay.com/checkout/pay'

    const callbackUrl = `${siteUrl}/api/payment/callback`
    const cancelUrl = `${siteUrl}/?step=payment`

    const checkoutUrl = `${checkoutBase}?env=${safepayEnv}&beacon=${trackerToken}&client=${safepayApiKey}&order_id=${order.id}&redirect_url=${encodeURIComponent(callbackUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}&source=custom`

    return NextResponse.json({ checkoutUrl })
  } catch (error) {
    console.error('POST /api/payment/initiate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
