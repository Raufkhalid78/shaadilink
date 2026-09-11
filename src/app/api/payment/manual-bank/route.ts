import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { paymentLimiter, getClientIp } from '@/lib/rate-limit';
import { sendManualBankTransferAdminAlert } from '@/lib/resend';

export const dynamic = 'force-dynamic';

const PLAN_AMOUNTS: Record<string, number> = {
  classic: 3499,
  royal: 5799,
};

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { success } = await paymentLimiter.limit(`payment_manual_${ip}`);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await request.json();
    const {
      invitationId,
      plan = 'classic',
      guestLinksQuota = 0,
      promoCode,
      receiptUrl,
      transactionRef,
      senderDetails,
    } = body;

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
    }

    if (!receiptUrl || typeof receiptUrl !== 'string' || !receiptUrl.trim()) {
      return NextResponse.json(
        { error: 'Payment receipt screenshot is required. Please upload your transfer slip.' },
        { status: 400 }
      );
    }

    if (!transactionRef || typeof transactionRef !== 'string' || transactionRef.trim().length < 3) {
      return NextResponse.json(
        { error: 'Valid transaction reference / STAN number is required.' },
        { status: 400 }
      );
    }

    const cleanReceipt = receiptUrl.trim();
    const cleanRef = transactionRef.trim();
    const cleanSender = senderDetails?.trim() || null;

    const service = createServiceClient();

    // Verify invitation ownership
    const { data: inv, error: invError } = await service
      .from('invitations')
      .select('id, user_id, is_active, guest_links_quota, plan, title, partner1_name, partner2_name')
      .eq('id', invitationId)
      .single();

    if (invError || !inv || inv.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden. You do not own this invitation.' }, { status: 403 });
    }

    // Calculate verified total amount
    let basePrice = 0;
    if (inv.is_active) {
      if (inv.plan !== plan) {
        const currentPrice = PLAN_AMOUNTS[inv.plan as keyof typeof PLAN_AMOUNTS] ?? 0;
        const newPrice = PLAN_AMOUNTS[plan as keyof typeof PLAN_AMOUNTS] ?? 0;
        basePrice = Math.max(0, newPrice - currentPrice);
      }
    } else {
      basePrice = PLAN_AMOUNTS[plan as keyof typeof PLAN_AMOUNTS] ?? PLAN_AMOUNTS.classic;
    }

    const addedQuota = Math.max(0, (guestLinksQuota || 0) - (inv.guest_links_quota || 0));
    const addOnPrice = (addedQuota / 50) * 1000;
    let totalAmount = basePrice + addOnPrice;

    // Apply promo code if provided
    if (promoCode && totalAmount > 0) {
      const { data: promo } = await service
        .from('referral_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase().trim())
        .single();

      if (promo && (promo.max_uses === null || promo.current_uses < promo.max_uses)) {
        if (promo.discount_percent) {
          const discount = Math.floor(totalAmount * (promo.discount_percent / 100));
          totalAmount = Math.max(0, totalAmount - discount);
        }
      }
    }

    if (totalAmount <= 0) {
      return NextResponse.json({ error: 'No new charges to apply.' }, { status: 400 });
    }

    const trackerRef = `mb_${(cleanRef || 'ref').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32)}_${Date.now()}`.slice(0, 255);

    // Attempt insert with new columns, with graceful fallback to tracker column
    let order: any = null;
    const { data: insertedOrder, error: insertError } = await service
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
        payment_method: 'manual_bank',
        receipt_url: cleanReceipt,
        transaction_ref: cleanRef,
        sender_details: cleanSender,
        tracker: trackerRef,
      })
      .select()
      .single();

    if (insertError) {
      console.warn('Direct columns insert failed, falling back to base columns + tracker:', insertError.message);
      const compactTracker = JSON.stringify({
        m: 'manual_bank',
        ref: cleanRef ? cleanRef.slice(0, 40) : '',
        ts: Date.now(),
      }).slice(0, 255);

      const fallbackResult = await service
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
          tracker: compactTracker,
        })
        .select()
        .single();

      if (fallbackResult.error || !fallbackResult.data) {
        console.error('Fallback order creation failed:', fallbackResult.error);
        return NextResponse.json({ error: 'Failed to create order record' }, { status: 500 });
      }
      order = fallbackResult.data;
    } else {
      order = insertedOrder;
    }

    const eventTitle =
      inv.title ||
      (inv.partner1_name && inv.partner2_name
        ? `${inv.partner1_name} & ${inv.partner2_name}`
        : 'Event Invitation');

    // Trigger Admin Email Alert in background
    sendManualBankTransferAdminAlert({
      orderId: order.id,
      userEmail: user.email || 'customer@smartinvites.com.pk',
      amount: totalAmount,
      transactionRef: cleanRef,
      senderDetails: cleanSender || undefined,
      receiptUrl: cleanReceipt,
      plan,
      invitationTitle: eventTitle,
    }).catch((err) => console.error('Failed to dispatch manual bank transfer admin email:', err));

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: totalAmount,
      currency: 'PKR',
      status: 'pending',
      transactionRef: cleanRef,
      receiptUrl: cleanReceipt,
      message: 'Bank transfer submitted successfully! Your order is currently under verification.',
    });
  } catch (err: any) {
    console.error('POST /api/payment/manual-bank error:', err);
    return NextResponse.json({ error: 'Internal server error processing bank transfer' }, { status: 500 });
  }
}
