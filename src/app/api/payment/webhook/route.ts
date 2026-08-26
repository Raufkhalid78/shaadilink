import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { fulfillOrderIfPending } from '@/lib/fulfillment'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    
    // Webhook secret validation
    const secret = process.env.SAFEPAY_WEBHOOK_SECRET
    if (!secret) {
      console.error('SAFEPAY_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    // Verify Webhook Signature using crypto (HMAC SHA-512)
    const sigHeader = request.headers.get('x-sfpy-signature') || ''
    const expectedSig = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
    const expectedSig256 = crypto.createHmac('sha256', secret).update(rawBody).digest('hex') // Legacy fallback

    const secureCompare = (a: string, b: string) => {
      if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
      return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
    }

    let isValid = false
    if (secureCompare(sigHeader, expectedSig) || secureCompare(sigHeader, expectedSig256)) {
      isValid = true
    }

    if (!isValid) {
      console.warn("Invalid webhook signature")
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody)

    const service = createServiceClient()
    const eventData = payload.data || payload
    
    // Safely extract the event name/type
    const eventName = (payload.name || payload.type || payload.event || '').toLowerCase()

    const successEvents = ['payment.succeeded']
    const failedEvents = ['payment.failed', 'payment:failed']

    if (!successEvents.includes(eventName) && !failedEvents.includes(eventName)) {
      console.log(`Webhook received unhandled event: ${eventName}. Ignoring.`)
      return NextResponse.json({ received: true, ignored: true, reason: 'Unhandled event' })
    }

    // Hosted checkout webhooks provide the tracker token
    const trackerToken = eventData.tracker?.token || eventData.tracker || payload.tracker || '';
    if (!trackerToken) {
      console.warn("Webhook payload missing tracker token")
      return NextResponse.json({ error: "Missing tracker" }, { status: 400 })
    }

    // Find the order by tracker token (added via our migration)
    const { data: order, error: orderErr } = await service
      .from('orders')
      .select('*')
      .eq('tracker', trackerToken)
      .single()

    if (orderErr || !order) {
      console.error("Order not found for webhook tracker:", trackerToken)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

 if (order.status === 'paid') {
      return NextResponse.json({ received: true, status: 'already_paid' })
    }


    if (failedEvents.includes(eventName)) {
      // Just mark it as failed, but it can be retried, so be careful.
      // Usually we leave it as pending so user can retry, or mark it failed.
      await service.from('orders').update({ status: 'failed' }).eq('id', order.id);
      return NextResponse.json({ received: true, status: 'failed' })
    }

    // Verify payment amount matches order amount
    const paidAmount = eventData.purchase_totals?.base_amount?.amount || 
                       eventData.amount || 
                       eventData.notification?.amount;

    if (paidAmount !== undefined && paidAmount !== null) {
      // Handle potential denomination differences (e.g., amount in Paisa vs PKR)
      const numericPaid = Number(paidAmount);
      const isMatch = numericPaid === order.amount || numericPaid === order.amount * 100 || numericPaid === order.amount / 100;
      
      if (!isMatch) {
        console.error(`Security alert: Payment amount mismatch for order ${order.id}. Expected: ${order.amount}, Got: ${paidAmount}`);
        return NextResponse.json({ error: "Payment amount mismatch. Security verification failed." }, { status: 400 });
      }
    }

    await fulfillOrderIfPending(order.id);
    console.log("Safepay webhook successfully processed payment for order:", order.id)

    return NextResponse.json({ received: true, success: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
