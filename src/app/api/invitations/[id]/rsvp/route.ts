import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendRsvpNotification } from '@/lib/resend'
import { rsvpLimiter, getClientIp } from '@/lib/rate-limit'
import { rsvpSchema } from '@/lib/validation-schemas'

/* POST /api/invitations/[id]/rsvp — submit RSVP (public) */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = rawId.replace(/%20| /g, "-")

    const ip = getClientIp(request)
    const { success } = await rsvpLimiter.limit(`rsvp_${ip}_${id}`)
    if (!success) {
      return NextResponse.json({ error: 'Too many RSVP submissions. Please try again shortly.' }, { status: 429 })
    }

    const body = await request.json()
    const parseResult = rsvpSchema.safeParse(body)
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues[0]?.message || 'Invalid RSVP input'
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const { guestName, guestEmail, status } = parseResult.data
    const cleanEmail = guestEmail ? guestEmail.trim().toLowerCase() : null
    const cleanName = guestName.trim()

    const supabase = createServiceClient()
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    // Fetch invitation to get user_id for sending notifications, including profile email
    let invQuery = supabase
      .from('invitations')
      .select('id, is_active, user_id, profiles(email)')

    if (isUUID) {
      invQuery = invQuery.eq('id', id)
    } else {
      invQuery = invQuery.eq('slug', id)
    }

    const { data: inv } = await invQuery.maybeSingle()

    if (!inv) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }
    if (!inv.is_active) {
      return NextResponse.json({ error: 'Invitation is not active' }, { status: 403 })
    }

    const invitationId = inv.id

    // Check for existing RSVP using canonicalized email or name
    let rsvpQuery = supabase.from('rsvps').select('id').eq('invitation_id', invitationId)
    if (cleanEmail) {
      rsvpQuery = rsvpQuery.eq('guest_email', cleanEmail)
    } else {
      rsvpQuery = rsvpQuery.eq('guest_name', cleanName)
    }
    const { data: existingRsvp } = await rsvpQuery.limit(1).maybeSingle()
    if (existingRsvp) {
      return NextResponse.json({ error: 'You have already submitted an RSVP for this invitation.' }, { status: 409 })
    }

    const { data, error } = await supabase
      .from('rsvps')
      .insert({
        invitation_id: invitationId,
        guest_name: cleanName,
        guest_email: cleanEmail,
        status,
      })
      .select()
      .maybeSingle()

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json({ error: 'You have already submitted an RSVP for this invitation.' }, { status: 409 })
      }
      console.error('RSVP insert error:', error)
      return NextResponse.json({ error: 'Unable to save RSVP. Please try again.' }, { status: 500 })
    }

    // Send Notification Email if email exists
    try {
      const hostEmail = (inv.profiles as any)?.email;
      if (hostEmail) {
        await sendRsvpNotification(hostEmail, cleanName, status)
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

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    // Verify ownership
    let invQuery = supabase
      .from('invitations')
      .select('id, user_id')

    if (isUUID) {
      invQuery = invQuery.eq('id', id)
    } else {
      invQuery = invQuery.eq('slug', id)
    }

    const { data: inv } = await invQuery.maybeSingle()

    if (!inv || inv.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: rsvps, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('invitation_id', inv.id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ rsvps })
  } catch (error) {
    console.error('GET /rsvp error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
