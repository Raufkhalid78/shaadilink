import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
      .select('user_id, partner1_name, partner2_name')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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
      youtubeVideoId: 'youtube_video_id',
      slug: 'slug',
      hostBrideFamily: 'host_bride_family',
      hostGroomFamily: 'host_groom_family',
      hostBrideCity: 'host_bride_city',
      hostGroomCity: 'host_groom_city',
      contactPhone: 'contact_phone',
      isSegregated: 'is_segregated',
      venueDetailsSegregated: 'venue_details_segregated',
      showNikahRegistration: 'show_nikah_registration',
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

    const { data: updated, error } = await supabase
      .from('invitations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'This custom link slug is already taken. Please try another one.' }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update events if provided
    if (body.events) {
      await supabase.from('events').delete().eq('invitation_id', id)
      const eventRows = body.events
        .filter((e: { name: string }) => e.name)
        .map((e: { name: string; date: string; time: string; venue?: string }, idx: number) => ({
          invitation_id: id,
          name: e.name,
          date: e.date || '',
          time: e.time || '',
          venue: e.venue || '',
          order_index: idx,
        }))
      if (eventRows.length > 0) {
        await supabase.from('events').insert(eventRows)
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
