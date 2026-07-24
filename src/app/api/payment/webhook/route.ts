import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    
    // Webhook secret validation
    const secret = process.env.SAFEPAY_WEBHOOK_SECRET
    if (!secret) {
      console.error('SAFEPAY_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const payload = JSON.parse(rawBody)

    // Initialize the official SDK to verify the webhook signature
    const { Safepay } = await import('@sfpy/node-sdk')
    const safepayEnv = (process.env.SAFEPAY_ENVIRONMENT || 'sandbox') as 'sandbox' | 'development' | 'production'
    const safepay = new Safepay({
      environment: safepayEnv as any,
      apiKey: process.env.SAFEPAY_API_KEY || '',
      v1Secret: process.env.SAFEPAY_V1_SECRET || '',
      webhookSecret: secret,
    })

    const sigHeader = request.headers.get('x-sfpy-signature') || ''
    
    // We try to verify using the SDK's built-in verifier which uses sha512.
    // As a fallback for older webhook versions, we also check sha256 of the raw body.
    let isValid = false
    try {
      isValid = safepay.verify.webhook({
        body: payload,
        headers: { 'x-sfpy-signature': sigHeader }
      })
    } catch (err) {
      console.warn("SDK webhook validation error:", err)
    }

    if (!isValid) {
      const fallbackSig = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
      if (sigHeader === fallbackSig) {
        isValid = true
        console.log("Webhook validated using legacy sha256 fallback")
      }
    }

    if (!isValid) {
      console.warn("Invalid webhook signature")
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const service = createServiceClient()
    const eventData = payload.data || payload
    
    // Safely extract the event name/type (handles both v1.0.0 and v2.0.0 webhook formats)
    const eventName = payload.name || payload.type || payload.event || ''

    // ONLY proceed with fulfilling the order if it's a confirmed success event
    const successEvents = ['payment.succeeded', 'payment:created']
    if (!successEvents.includes(eventName)) {
      console.log(`Webhook received non-success event: ${eventName}. Ignoring.`)
      return NextResponse.json({ received: true, ignored: true, reason: 'Not a success event' })
    }

    // Safely extract orderId from various possible payload locations
    const orderId = eventData.notification?.metadata?.order_id || 
                    eventData.notification?.reference || 
                    eventData.reference || 
                    eventData.order_id
    if (!orderId) {
      console.warn("Webhook payload missing reference/orderId")
      return NextResponse.json({ error: "Missing reference" }, { status: 400 })
    }

    // Find the order
    const { data: order, error: orderErr } = await service
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderErr || !order) {
      console.error("Order not found for webhook reference:", orderId)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Only process if pending
    if (order.status === 'paid') {
      return NextResponse.json({ received: true, already_paid: true })
    }

    // 1. Update order status
    const { error: updateOrderErr } = await service
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', orderId)

    if (updateOrderErr) {
      console.error("Failed to update order in webhook:", updateOrderErr)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    // 2. Update invitation status and quota (if a quota top-up was ordered)
    const invUpdate: Record<string, unknown> = { is_active: true, plan: order.plan }
    if (order.target_guest_links_quota > 0) {
      invUpdate.guest_links_quota = order.target_guest_links_quota
    }
    await service
      .from('invitations')
      .update(invUpdate)
      .eq('id', order.invitation_id)

    // 3. Update profile plan
    await service
      .from('profiles')
      .update({ plan: order.plan })
      .eq('id', order.user_id)

    console.log("Safepay webhook successfully processed payment for order:", orderId)

    return NextResponse.json({ received: true, success: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
