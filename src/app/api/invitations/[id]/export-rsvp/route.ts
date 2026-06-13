import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const service = createServiceClient()
    const { data: inv } = await service.from('invitations').select('user_id, partner1_name, partner2_name').eq('id', id).single()
    if (!inv || inv.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const { data: rsvps, error } = await service
      .from('rsvps')
      .select('guest_name, guest_email, status, created_at')
      .eq('invitation_id', id)
      .order('created_at', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const header = 'Guest Name,Guest Email,Status,Date Submitted'
    const rows = (rsvps || []).map(r =>
      `"${(r.guest_name||'').replace(/"/g,'""')}","${(r.guest_email||'').replace(/"/g,'""')}","${r.status}","${new Date(r.created_at).toLocaleString('en-PK')}"`
    )
    const csv = [header, ...rows].join('\n')
    const filename = `rsvp-${id.slice(0,8)}.csv`
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('export-rsvp error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
