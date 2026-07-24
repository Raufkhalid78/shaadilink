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
    const { invitationId, plan, guestLinksQuota } = body

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
    const totalAmount = basePrice + addOnPrice

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
        // Store the final quota target so the webhook can apply it even if the browser callback is missed
        target_guest_links_quota: guestLinksQuota || 0,
      })
      .select()
      .single()

    if (orderErr || !order) {
      console.error('Failed to create pending order:', orderErr)
      return NextResponse.json({ error: 'Failed to initialize order record' }, { status: 500 })
    }

    // Since we are using Safepay Express Checkout (embedded UI),
    // we return the orderId and amount back to the client.
    // The client will render the Safepay Button using these details.
    return NextResponse.json({
      orderId: order.id,
      totalAmount: totalAmount,
    })
  } catch (error) {
    console.error('POST /api/payment/initiate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

