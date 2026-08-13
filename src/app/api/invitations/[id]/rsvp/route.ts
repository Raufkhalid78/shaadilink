import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendRsvpNotification } from '@/lib/resend'

/* POST /api/invitations/[id]/rsvp — submit RSVP (public) */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = rawId.replace(/%20| /g, "-")
    const body = await request.json()
    const { guestName, guestEmail, status } = body

    if (!guestName?.trim()) {
      return NextResponse.json({ error: 'Guest name is required' }, { status: 400 })
    }
    if (!['accept', 'decline'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Fetch invitation to get user_id for sending notifications, including profile email
    const { data: inv } = await supabase
      .from('invitations')
      .select('is_active, user_id, profiles(email)')
      .eq('id', id)
      .single()

    if (!inv) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }
    if (!inv.is_active) {
      return NextResponse.json({ error: 'Invitation is not active' }, { status: 403 })
    }

    // Check for existing RSVP
    let rsvpQuery = supabase.from('rsvps').select('id').eq('invitation_id', id)
    if (guestEmail?.trim()) {
      rsvpQuery = rsvpQuery.eq('guest_email', guestEmail.trim())
    } else {
      rsvpQuery = rsvpQuery.eq('guest_name', guestName.trim())
    }
    const { data: existingRsvp } = await rsvpQuery.limit(1).maybeSingle()
    if (existingRsvp) {
      return NextResponse.json({ error: 'You have already submitted an RSVP for this invitation.' }, { status: 409 })
    }

    const { data, error } = await supabase
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

    // Send Notification Email if email exists
    try {
      const hostEmail = (inv.profiles as any)?.email;
      if (hostEmail) {
        await sendRsvpNotification(hostEmail, guestName.trim(), status)
      }
    } catch (e) {
      console.error('Failed to send RSVP notification:', e)
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
    const { id: rawId } = await params
    const id = rawId.replace(/%20| /g, "-")
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const { data: inv } = await supabase
      .from('invitations')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!inv || inv.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: rsvps, error } = await supabase
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
