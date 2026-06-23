import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import crypto from 'crypto'

function secureCompare(a: string, b: string) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'))
}

async function handleCallback(request: NextRequest) {
  // Dynamically resolve site URL from request headers (supports local dev and Vercel automatically)
  const host = request.headers.get('host') || 'localhost:3000'
  const protocol = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  const siteUrl = `${protocol}://${host}`
  
  try {
    const searchParams = request.nextUrl.searchParams
    
    let tracker = searchParams.get('tracker') || ''
    let sig = searchParams.get('sig') || ''
    let orderId = searchParams.get('order_id') || searchParams.get('reference') || ''

    // If Safepay redirects via POST, extract parameters from the body
    if (request.method === 'POST') {
      try {
        const contentType = request.headers.get('content-type') || ''
        if (contentType.includes('application/x-www-form-urlencoded')) {
          const formData = await request.formData()
          tracker = tracker || (formData.get('tracker') as string) || ''
          sig = sig || (formData.get('sig') as string) || ''
          orderId = orderId || (formData.get('order_id') as string) || (formData.get('reference') as string) || ''
        } else if (contentType.includes('application/json')) {
          const body = await request.json()
          tracker = tracker || body.tracker || ''
          sig = sig || body.sig || ''
          orderId = orderId || body.order_id || body.reference || ''
        }
      } catch (e) {
        console.error('Failed to parse POST body in payment callback:', e)
      }
    }

    if (!tracker || !sig || !orderId) {
      console.warn('Callback missing required fields:', { tracker, sig, orderId })
      return NextResponse.redirect(
        `${siteUrl}/?step=payment&paymentError=${encodeURIComponent('Missing payment signature parameters')}`,
        { status: 303 }
      )
    }

    const secret = process.env.SAFEPAY_V1_SECRET
    if (!secret) {
      console.error('SAFEPAY_V1_SECRET environment variable is missing')
      return NextResponse.redirect(
        `${siteUrl}/?step=payment&paymentError=${encodeURIComponent('Payment gateway secret key is not configured')}`,
        { status: 303 }
      )
    }

    // Compute expected HMAC SHA256 signature
    const computedSig = crypto
      .createHmac('sha256', secret)
      .update(tracker)
      .digest('hex')

    const isValid = secureCompare(computedSig, sig)

    if (!isValid) {
      console.warn('Invalid signature comparison:', { computedSig, sig })
      return NextResponse.redirect(
        `${siteUrl}/?step=payment&paymentError=${encodeURIComponent('Invalid payment signature verification failed')}`,
        { status: 303 }
      )
    }

    const service = createServiceClient()

    // Fetch the order
    const { data: order, error: orderErr } = await service
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderErr || !order) {
      console.error('Order not found in database:', orderId, orderErr)
      return NextResponse.redirect(
        `${siteUrl}/?step=payment&paymentError=${encodeURIComponent('Associated order record not found')}`,
        { status: 303 }
      )
    }

    // If order was already paid, just redirect to success page
    if (order.status === 'paid') {
      return NextResponse.redirect(`${siteUrl}/?step=success&invitationId=${order.invitation_id}`, { status: 303 })
    }

    // Update order status to paid
    const { error: updateOrderErr } = await service
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', orderId)

    if (updateOrderErr) {
      console.error('Failed to update order status:', updateOrderErr)
      return NextResponse.redirect(
        `${siteUrl}/?step=payment&paymentError=${encodeURIComponent('Failed to update order record status')}`,
        { status: 303 }
      )
    }

    // Activate the invitation and update the selected plan
    const { error: updateInvErr } = await service
      .from('invitations')
      .update({ is_active: true, plan: order.plan })
      .eq('id', order.invitation_id)

    if (updateInvErr) {
      console.error('Failed to update invitation status:', updateInvErr)
    }

    // Update the profile plan for the user
    const { error: updateProfileErr } = await service
      .from('profiles')
      .update({ plan: order.plan })
      .eq('id', order.user_id)

    if (updateProfileErr) {
      console.error('Failed to update profile plan:', updateProfileErr)
    }

    // Successful checkout: redirect browser to Success step
    return NextResponse.redirect(`${siteUrl}/?step=success&invitationId=${order.invitation_id}`, { status: 303 })
  } catch (error) {
    console.error('Safepay payment callback exception:', error)
    return NextResponse.redirect(
      `${siteUrl}/?step=payment&paymentError=${encodeURIComponent('An internal server error occurred processing payment')}`,
      { status: 303 }
    )
  }
}

export async function GET(request: NextRequest) {
  return handleCallback(request)
}

export async function POST(request: NextRequest) {
  return handleCallback(request)
}
