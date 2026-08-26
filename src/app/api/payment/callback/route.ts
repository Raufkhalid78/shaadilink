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
    const targetGuestLinksQuota = parseInt(searchParams.get('guest_links_quota') || '0', 10)

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

    // In Safepay V3, the browser redirect might not include tracker and sig.
    // However, the webhook will process the payment in the background.
    // If the signature is missing, we must rely solely on the database state.
    let isSignatureValid = false;
    let signatureError = '';

    if (tracker && sig && orderId) {
      const secret = process.env.SAFEPAY_V1_SECRET;
      if (!secret) {
        signatureError = 'Payment gateway secret key is not configured';
      } else {
        const computedSig = crypto.createHmac('sha256', secret).update(tracker).digest('hex');
        isSignatureValid = secureCompare(computedSig, sig);
        if (!isSignatureValid) {
          signatureError = 'Invalid payment signature verification failed';
        }
      }
    } else if (!orderId) {
      return NextResponse.redirect(
        `${siteUrl}/?step=payment&paymentError=${encodeURIComponent('Missing order ID in payment callback')}`,
        { status: 303 }
      );
    }

    const service = createServiceClient()

    // Fetch the order securely. If the signature is valid, fetch via the verified tracker.
    // If not, fetch via orderId just to check if it's already paid by a webhook.
    let orderQuery = service.from('orders').select('*');
    if (isSignatureValid && tracker) {
      orderQuery = orderQuery.eq('tracker', tracker);
    } else {
      orderQuery = orderQuery.eq('id', orderId);
    }

    const { data: order, error: orderErr } = await orderQuery.single()

    if (orderErr || !order) {
      console.error('Order not found in database:', isSignatureValid ? tracker : orderId, orderErr)
      return NextResponse.redirect(
        `${siteUrl}/?step=payment&paymentError=${encodeURIComponent('Associated order record not found')}`,
        { status: 303 }
      )
    }

    // If order was already paid (e.g. by webhook), just redirect to success page
    if (order.status === 'paid') {
      return NextResponse.redirect(`${siteUrl}/?step=success&invitationId=${order.invitation_id}`, { status: 303 })
    }

    // If order is not paid yet, and we don't have a valid signature from the redirect URL,
    // we cannot mark it as paid. We must wait for the webhook.
    if (!isSignatureValid) {
      // If there was a signature but it was invalid, return error
      if (signatureError) {
        return NextResponse.redirect(
          `${siteUrl}/?step=payment&paymentError=${encodeURIComponent(signatureError)}`,
          { status: 303 }
        );
      }
      
      // If there was simply no signature (V3 browser redirect), and the order is still pending,
      // it means the webhook hasn't processed it yet. 
      // We can redirect the user to a pending state, or back to the payment page with a gentle message.
      return NextResponse.redirect(
        `${siteUrl}/?step=payment&paymentError=${encodeURIComponent('Payment is processing. Please wait a moment and refresh.')}`,
        { status: 303 }
      );
    }

    // Order fetch already happened above. Now we just process the paid logic if signature is valid.

    // Activate the invitation and update the selected plan
    const updatePayload: any = { is_active: true, plan: order.plan }
    
    // STRICT QUOTA ENFORCEMENT: ONLY USE DB QUOTA (Fix C-02)
    const resolvedQuota = order.target_guest_links_quota > 0 ? order.target_guest_links_quota : null;
    if (resolvedQuota !== null) {
      updatePayload.guest_links_quota = resolvedQuota
    }

    // Run updates concurrently securely using the verified order.id
    const [orderUpdate, invUpdateRes, profileUpdate] = await Promise.all([
      service.from('orders').update({ status: 'paid' }).eq('id', order.id).eq('status', 'pending'),
      service.from('invitations').update(updatePayload).eq('id', order.invitation_id),
      service.from('profiles').update({ plan: order.plan }).eq('id', order.user_id)
    ]);

    if (orderUpdate.error) {
      console.error('Failed to update order status:', orderUpdate.error)
      return NextResponse.redirect(
        `${siteUrl}/?step=payment&paymentError=${encodeURIComponent('Failed to update order record status')}`,
        { status: 303 }
      )
    }
    if (invUpdateRes.error) {
      console.error('Failed to update invitation status:', invUpdateRes.error)
    }
    if (profileUpdate.error) {
      console.error('Failed to update profile plan:', profileUpdate.error)
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
