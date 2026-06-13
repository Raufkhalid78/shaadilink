import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/* POST /api/invitations/[id]/rsvp — submit RSVP (public) */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { guestName, guestEmail, status } = body

    if (!guestName?.trim()) {
      return NextResponse.json({ error: 'Guest name is required' }, { status: 400 })
    }
    if (!['accept', 'decline'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const service = createServiceClient()

    // Check invitation exists and is active
    const { data: inv } = await service.from('invitations').select('is_active').eq('id', id).single()
    if (!inv?.is_active) return NextResponse.json({ error: 'This invitation is not yet published' }, { status: 403 })

    // Check for existing RSVP
    let query = service.from('rsvps').select('id').eq('invitation_id', id)
    if (guestEmail?.trim()) {
      query = query.eq('guest_email', guestEmail.trim())
    } else {
      query = query.eq('guest_name', guestName.trim())
    }
    const { data: existingRsvp } = await query.limit(1).maybeSingle()
    if (existingRsvp) {
      return NextResponse.json({ error: 'You have already submitted an RSVP for this invitation.' }, { status: 409 })
    }

    const { data, error } = await service
      .from('rsvps')
      .insert({
        invitation_id: id,
        guest_name: guestName.trim(),
        guest_email: guestEmail?.trim() || null,
        status,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ rsvp: data }, { status: 201 })
  } catch (error) {
    console.error('POST /rsvp error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/* GET /api/invitations/[id]/rsvp — get all RSVPs (owner only) */
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

    // Verify ownership
    const { data: inv } = await service
      .from('invitations')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!inv || inv.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: rsvps, error } = await service
      .from('rsvps')
      .select('*')
      .eq('invitation_id', id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ rsvps })
  } catch (error) {
    console.error('GET /rsvp error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
