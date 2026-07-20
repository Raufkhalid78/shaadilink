import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/* DELETE /api/invitations/[id]/guest-links/[linkId] -- revoke a guest link (owner only) */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; linkId: string }> }
) {
  try {
    const { id, linkId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const service = createServiceClient()

    // Verify invitation ownership first
    const { data: inv } = await service
      .from('invitations')
      .select('id, user_id')
      .eq('id', id)
      .single()
    if (!inv || inv.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete the specific link (must belong to this invitation)
    const { error: deleteErr } = await service
      .from('guest_links')
      .delete()
      .eq('id', linkId)
      .eq('invitation_id', id)

    if (deleteErr) {
      return NextResponse.json({ error: deleteErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /guest-links/[linkId] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}