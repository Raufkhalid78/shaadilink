import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = rawId.replace(/%20| /g, "-")
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
      .select('*')
      .eq('invitation_id', id)
      .order('created_at', { ascending: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const header = 'Guest Name,Guest Email,Status,Adults,Children,Total Attendees,Dietary Notes,Attending Ceremonies,Date Submitted'
    const rows = (rsvps || []).map(r => {
      const isAccept = r.status === 'accept'
      const adults = typeof r.adults_count === 'number' ? r.adults_count : (isAccept ? 1 : 0)
      const children = typeof r.children_count === 'number' ? r.children_count : 0
      const totalAttendees = isAccept ? (adults + children) : 0
      const dietary = (r.dietary_notes || '').replace(/"/g, '""')
      const ceremonies = (Array.isArray(r.attending_events) ? r.attending_events.join('; ') : '').replace(/"/g, '""')
      const guestName = (r.guest_name || '').replace(/"/g, '""')
      const guestEmail = (r.guest_email || '').replace(/"/g, '""')
      const dateStr = r.created_at ? new Date(r.created_at).toLocaleString('en-PK') : ''

      return `"${guestName}","${guestEmail}","${r.status}",${adults},${children},${totalAttendees},"${dietary}","${ceremonies}","${dateStr}"`
    })
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
