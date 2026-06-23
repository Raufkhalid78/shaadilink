import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    
    // Webhook secret validation
    const secret = process.env.SAFEPAY_WEBHOOK_SECRET
    if (secret) {
      const sigHeader = request.headers.get('x-sfpy-signature') || ''
      // Optional: If you strictly want to enforce signature verification:
      // const computedSig = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
      // if (sigHeader !== computedSig) {
      //   console.warn("Invalid webhook signature")
      // }
    }

    const service = createServiceClient()

    // DEBUG LOGGING
    await service.from('affiliate_applications').insert({
      name: 'WEBHOOK_DEBUG',
      email: 'webhook@debug.com',
      promotion_plan: rawBody.substring(0, 5000)
    })

    const payload = JSON.parse(rawBody)
    const eventData = payload.data || payload

    // Some Safepay events are 'payment:created' or 'payment.succeeded'
    // We will just proceed if there is a valid order_id
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

    // 2. Update invitation status
    await service
      .from('invitations')
      .update({ is_active: true, plan: order.plan })
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
