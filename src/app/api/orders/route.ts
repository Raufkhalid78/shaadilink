import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const PLAN_AMOUNTS: Record<string, number> = {
  classic: 3499,
  royal: 5799,
}

/* POST /api/orders — create order and activate invitation */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { invitationId, plan } = body

    if (!invitationId || !plan) {
      return NextResponse.json({ error: 'invitationId and plan are required' }, { status: 400 })
    }

    const service = createServiceClient()

    // Verify invitation ownership
    const { data: inv } = await service
      .from('invitations')
      .select('user_id, plan')
      .eq('id', invitationId)
      .single()

    if (!inv || inv.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const amount = PLAN_AMOUNTS[plan] ?? PLAN_AMOUNTS.classic

    // Create order record
    const { data: order, error: orderErr } = await service
      .from('orders')
      .insert({
        user_id: user.id,
        invitation_id: invitationId,
        plan,
        amount,
        currency: 'PKR',
        status: 'paid',
      })
      .select()
      .single()

    if (orderErr) {
      return NextResponse.json({ error: orderErr.message }, { status: 500 })
    }

    // Activate invitation
    await service
      .from('invitations')
      .update({ is_active: true, plan })
      .eq('id', invitationId)

    // Update profile plan
    await service
      .from('profiles')
      .update({ plan })
      .eq('id', user.id)

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('POST /api/orders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
