import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { fulfillAgencyCreditOrder } from '@/app/dashboard/agency/actions';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function secureCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function GET(req: Request) {
  return handleCallback(req);
}

export async function POST(req: Request) {
  return handleCallback(req);
}

async function handleCallback(req: Request) {
  const url = new URL(req.url);
  const host = req.headers.get('host') || 'localhost:3000';
  const protocol =
    req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const siteUrl = `${protocol}://${host}`;

  try {
    let orderId = url.searchParams.get('orderId') || url.searchParams.get('order_id');
    let tracker = url.searchParams.get('tracker');
    let sig = url.searchParams.get('sig');

    // If POST, check body as well
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        orderId = orderId || body.order_id || body.orderId;
        tracker = tracker || body.tracker;
        sig = sig || body.sig;
      } catch {
        // Fall back to query params
      }
    }

    let isSignatureValid = false;
    const secret = process.env.SAFEPAY_V1_SECRET || process.env.SAFEPAY_SECRET_KEY;

    if (tracker && sig && secret) {
      const computedSig = crypto.createHmac('sha256', secret).update(tracker).digest('hex');
      isSignatureValid = secureCompare(computedSig, sig);
    }

    const service = createServiceClient();
    let orderQuery = service.from('agency_credit_orders').select('*');

    if (tracker) {
      orderQuery = orderQuery.or(`safepay_tracker.eq.${tracker},id.eq.${orderId || tracker}`);
    } else if (orderId) {
      orderQuery = orderQuery.eq('id', orderId);
    } else {
      return NextResponse.redirect(
        `${siteUrl}/dashboard/agency?paymentError=${encodeURIComponent('Missing order identifier in callback')}`,
        { status: 303 }
      );
    }

    const { data: order, error: orderErr } = await orderQuery.maybeSingle();

    if (orderErr || !order) {
      console.error('Agency credit order not found in callback:', orderId || tracker, orderErr);
      return NextResponse.redirect(
        `${siteUrl}/dashboard/agency?paymentError=${encodeURIComponent('Associated credit order record not found')}`,
        { status: 303 }
      );
    }

    // If already fulfilled (e.g. by webhook), redirect with success
    if (order.status === 'completed' || order.status === 'approved') {
      return NextResponse.redirect(
        `${siteUrl}/dashboard/agency?creditsAdded=${order.credits_count}&pack=${encodeURIComponent(order.pack_name)}`,
        { status: 303 }
      );
    }

    // Fulfill order and credit wallet
    const fulfillResult = await fulfillAgencyCreditOrder(order.id);

    if (fulfillResult.error) {
      console.error('Failed to fulfill agency credit order in callback:', fulfillResult.error);
      return NextResponse.redirect(
        `${siteUrl}/dashboard/agency?paymentError=${encodeURIComponent(fulfillResult.error)}`,
        { status: 303 }
      );
    }

    return NextResponse.redirect(
      `${siteUrl}/dashboard/agency?creditsAdded=${order.credits_count}&pack=${encodeURIComponent(order.pack_name)}`,
      { status: 303 }
    );
  } catch (err: any) {
    console.error('Agency credit callback exception:', err);
    return NextResponse.redirect(
      `${siteUrl}/dashboard/agency?paymentError=${encodeURIComponent('Error verifying payment completion')}`,
      { status: 303 }
    );
  }
}
