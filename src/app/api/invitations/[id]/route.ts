import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/* GET /api/invitations/[id] — fetch single invitation (public if active) */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cleanId = id.replace(/%20| /g, "-")
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId)
    const supabase = await createClient()

    const query = supabase
      .from('invitations')
      .select(`
        *, events(id, name, date, time, venue, order_index),
        wishes(id, sender_name, message, created_at)
      `)

    const { data: invitation, error } = await (isUuid
      ? query.eq('id', cleanId)
      : query.eq('slug', cleanId)
    ).single()

    if (error || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // RLS handles visibility (active or owner only). We still fetch user to double check
    const { data: { user } } = await supabase.auth.getUser()
    if (!invitation.is_active && invitation.user_id !== user?.id) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    return NextResponse.json({ invitation })
  } catch (error) {
    console.error('GET /api/invitations/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/* PUT /api/invitations/[id] — update invitation (owner only) */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    // Verify ownership
    const { data: existing } = await supabase
      .from('invitations')
      .select('user_id, partner1_name, partner2_name, is_active, events(*)')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Concluded Event Locking Rule: If invitation is LIVE and all events have concluded, edits are locked
    if (existing.is_active && Array.isArray(existing.events) && existing.events.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const isConcluded = existing.events.every((ev: { date: string }) => {
        if (!ev.date) return false
        const evDate = new Date(ev.date)
        return evDate < today
      })
      if (isConcluded) {
        return NextResponse.json({ error: 'This event has concluded. Edits are locked to preserve event records.' }, { status: 403 })
      }
    }

    const updateData: Record<string, unknown> = {}
    const fieldMap: Record<string, string> = {
      partner1Name: 'partner1_name', partner2Name: 'partner2_name',
      venue: 'venue', venueAddress: 'venue_address',
      welcomeMessage: 'welcome_message', backgroundMusic: 'background_music',
      dressCodeWomen: 'dress_code_women', dressCodeMen: 'dress_code_men',
      transportation: 'transportation', accommodation: 'accommodation',
      gifts: 'gifts', heroImageUrl: 'hero_image_url',
      slideshowImageUrls: 'slideshow_image_urls',
      showBismillah: 'show_bismillah',
      showQuranVerse: 'show_quran_verse',
      customVerseText: 'custom_verse_text',
      customVerseSource: 'custom_verse_source',
      youtubeVideoId: 'youtube_video_id',
      slug: 'slug',
      primaryHostFamily: 'host_bride_family',
      secondaryHostFamily: 'host_groom_family',
      primaryHostCity: 'host_bride_city',
      secondaryHostCity: 'host_groom_city',
      contactPhone: 'contact_phone',
      isSegregated: 'is_segregated',
      venueDetailsSegregated: 'venue_details_segregated',
      showNikahRegistration: 'show_nikah_registration',
      title: 'title',
      category: 'category',
      hideDigitalShagun: 'hide_digital_shagun',
      customMusicUrl: 'custom_music_url',
      customMusicName: 'custom_music_name',
      voiceNoteUrl: 'voice_note_url',
      voiceNoteTitle: 'voice_note_title',
      voiceNoteSender: 'voice_note_sender',
      agencyName: 'agency_name',
      agencyPhone: 'agency_phone',
      whiteLabelFooter: 'white_label_footer',
      clientApprovalStatus: 'client_approval_status',
      clientApprovalNotes: 'client_approval_notes',
      clientApprovedAt: 'client_approved_at',
    }
    for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
      if (body[jsKey] !== undefined) {
        if (jsKey === 'slug') {
          let updatedSlug = (body[jsKey] as string)?.trim()
          if (!updatedSlug) {
            const p1Name = body.partner1Name || existing?.partner1_name || 'groom'
            const p2Name = body.partner2Name || existing?.partner2_name || 'bride'
            const p1 = p1Name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '')
            const p2 = p2Name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '')
            let baseSlug = `${p1}-${p2}`
            if (baseSlug === '-') baseSlug = 'wedding'
            updatedSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`
          }
          updateData[dbKey] = updatedSlug
        } else {
          updateData[dbKey] = body[jsKey]
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    let { data: updated, error } = await supabase
      .from('invitations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error && error.code === '42703') {
      // Graceful fallback if new schema columns are not yet applied in DB
      const fallbackData = { ...updateData }
      delete fallbackData.voice_note_url
      delete fallbackData.voice_note_title
      delete fallbackData.voice_note_sender
      delete fallbackData.agency_phone
      delete fallbackData.client_approval_status
      delete fallbackData.client_approval_notes
      delete fallbackData.client_approved_at
      const retry = await supabase
        .from('invitations')
        .update(fallbackData)
        .eq('id', id)
        .select()
        .single()
      updated = retry.data
      error = retry.error
    }

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'This custom link slug is already taken. Please try another one.' }, { status: 400 })
      }
      console.error('Invitation update error:', error)
      return NextResponse.json({ error: 'Failed to update invitation. Please try again.' }, { status: 500 })
    }

    // Update events if provided (dates are locked on live invitations)
    if (body.events) {
      const service = createServiceClient()
      const isLive = Boolean(existing.is_active)
      const existingDatesMap: Record<number, string> = {}

      if (isLive) {
        const { data: currentEvents } = await service
          .from('events')
          .select('order_index, date')
          .eq('invitation_id', id)
          .order('order_index', { ascending: true })

        if (currentEvents) {
          for (const ev of currentEvents) {
            if (ev.order_index !== null && ev.order_index !== undefined && ev.date) {
              existingDatesMap[ev.order_index] = ev.date
            }
          }
        }
      }

      await service.from('events').delete().eq('invitation_id', id)
      const eventRows = body.events
        .filter((e: { name: string }) => e.name)
        .map((e: { id?: string; name: string; date: string; time: string; venue?: string }, idx: number) => ({
          invitation_id: id,
          name: e.name,
          date: isLive && existingDatesMap[idx] ? existingDatesMap[idx] : (e.date || ''),
          time: e.time || '',
          venue: e.venue || '',
          order_index: idx,
        }))
      if (eventRows.length > 0) {
        await service.from('events').insert(eventRows)
      }
    }

    return NextResponse.json({ invitation: updated })
  } catch (error) {
    console.error('PUT /api/invitations/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/* DELETE /api/invitations/[id] — delete invitation (owner only) */
export async function DELETE(
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

    // Verify ownership
    const { data: existing } = await supabase
      .from('invitations')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase.from('invitations').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/invitations/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
