import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { invitationInputSchema } from '@/lib/validation-schemas'

/* POST /api/invitations — create new invitation */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parseResult = invitationInputSchema.safeParse(body)
    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues[0]?.message || 'Invalid invitation details'
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const validData = parseResult.data
    const {
      templateId, plan, partner1Name, partner2Name, venue, venueAddress,
      welcomeMessage, backgroundMusic, dressCodeWomen, dressCodeMen,
      transportation, accommodation, gifts, heroImageUrl, slideshowImageUrls,
      youtubeVideoId, guestLinksQuota, events, slug,
    } = validData

    let finalSlug = slug?.trim()
    if (!finalSlug) {
      const p1 = (partner1Name || 'groom')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      const p2 = (partner2Name || 'bride')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      let baseSlug = `${p1}-${p2}`
      if (baseSlug === '-') baseSlug = 'wedding'
      finalSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`
    }

    const { data: invitation, error: invErr } = await supabase
      .from('invitations')
      .insert({
        user_id: user.id,
        template_id: templateId || 'emerald-noir',
        plan: plan || 'classic',
        partner1_name: partner1Name || '',
        partner2_name: partner2Name || '',
        venue: venue || '',
        venue_address: venueAddress || '',
        welcome_message: welcomeMessage || '',
        background_music: backgroundMusic || '',
        dress_code_women: dressCodeWomen || '',
        dress_code_men: dressCodeMen || '',
        transportation: transportation || '',
        accommodation: accommodation || '',
        gifts: gifts || '',
        hero_image_url: heroImageUrl || '',
        slideshow_image_urls: slideshowImageUrls || [],
        youtube_video_id: youtubeVideoId || '',
        guest_links_quota: guestLinksQuota ?? 0,
        is_active: false,
        show_bismillah: validData.showBismillah ?? true,
        show_quran_verse: validData.showQuranVerse ?? true,
        custom_verse_text: validData.customVerseText || null,
        custom_verse_source: validData.customVerseSource || null,
        host_bride_family: validData.primaryHostFamily || null,
        host_groom_family: validData.secondaryHostFamily || null,
        host_bride_city: validData.primaryHostCity || null,
        host_groom_city: validData.secondaryHostCity || null,
        contact_phone: validData.contactPhone || null,
        is_segregated: (body as any).isSegregated || false,
        venue_details_segregated: validData.venueDetailsSegregated || null,
        show_nikah_registration: validData.showNikahRegistration || false,
        slug: finalSlug,
        title: validData.title || (partner1Name && partner2Name ? `${partner1Name} & ${partner2Name}` : partner1Name || 'Event Invitation'),
        category: validData.category || 'wedding',
        hide_digital_shagun: validData.hideDigitalShagun ?? false,
        custom_music_url: validData.customMusicUrl || null,
        custom_music_name: validData.customMusicName || null,
        agency_name: validData.agencyName || null,
        agency_phone: validData.agencyPhone || null,
        white_label_footer: validData.whiteLabelFooter || null,
        voice_note_url: validData.voiceNoteUrl || null,
        voice_note_title: validData.voiceNoteTitle || null,
        voice_note_sender: validData.voiceNoteSender || null,
      })
      .select()
      .single()

    let finalInvitation = invitation
    let finalError = invErr

    if (invErr && invErr.code === '42703') {
      // Fallback if columns are not yet applied in DB
      const { data: retryInv, error: retryErr } = await supabase
        .from('invitations')
        .insert({
          user_id: user.id,
          template_id: templateId || 'emerald-noir',
          plan: plan || 'classic',
          partner1_name: partner1Name || '',
          partner2_name: partner2Name || '',
          venue: venue || '',
          venueAddress: venueAddress || '',
          welcome_message: welcomeMessage || '',
          background_music: backgroundMusic || '',
          dress_code_women: dressCodeWomen || '',
          dress_code_men: dressCodeMen || '',
          transportation: transportation || '',
          accommodation: accommodation || '',
          gifts: gifts || '',
          hero_image_url: heroImageUrl || null,
          slideshow_image_urls: slideshowImageUrls || [],
          youtube_video_id: youtubeVideoId || '',
          guest_links_quota: guestLinksQuota || 10,
          show_bismillah: validData.showBismillah ?? true,
          show_quran_verse: validData.showQuranVerse ?? true,
          custom_verse_text: validData.customVerseText || null,
          custom_verse_source: validData.customVerseSource || null,
          host_bride_family: validData.primaryHostFamily || null,
          host_groom_family: validData.secondaryHostFamily || null,
          host_bride_city: validData.primaryHostCity || null,
          host_groom_city: validData.secondaryHostCity || null,
          contact_phone: validData.contactPhone || null,
          is_segregated: (body as any).isSegregated || false,
          venue_details_segregated: validData.venueDetailsSegregated || null,
          show_nikah_registration: validData.showNikahRegistration || false,
          slug: finalSlug,
          title: validData.title || (partner1Name && partner2Name ? `${partner1Name} & ${partner2Name}` : partner1Name || 'Event Invitation'),
          category: validData.category || 'wedding',
          hide_digital_shagun: validData.hideDigitalShagun ?? false,
          custom_music_url: validData.customMusicUrl || null,
          custom_music_name: validData.customMusicName || null,
          agency_name: validData.agencyName || null,
          white_label_footer: validData.whiteLabelFooter || null,
        })
        .select()
        .single()
      finalInvitation = retryInv
      finalError = retryErr
    }

    if (finalError || !finalInvitation) {
      console.error('Invitation insert error:', finalError)
      if (finalError?.code === '23505') {
        return NextResponse.json({ error: 'This custom link slug is already taken. Please try another one.' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Failed to create invitation. Please check your information.' }, { status: 500 })
    }

    // Insert events
    if (events && events.length > 0) {
      const eventRows = events
        .filter((e: { name: string }) => e.name)
        .map((e: { id?: string; name: string; date: string; time: string; venue?: string }, idx: number) => {
          const row: any = {
            invitation_id: invitation.id,
            name: e.name,
            date: e.date || '',
            time: e.time || '',
            venue: e.venue || '',
            order_index: idx,
          };
          if (e.id && e.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
             row.id = e.id;
          }
          return row;
        })

      if (eventRows.length > 0) {
        const service = createServiceClient()
        const { error: evErr } = await service.from('events').insert(eventRows)
        if (evErr) {
          console.error('Events insert error:', evErr)
          // Return the invitation ID but signal a partial failure
          return NextResponse.json(
            { invitationId: invitation.id, warning: 'Invitation created but events could not be saved: ' + evErr.message },
            { status: 201 }
          )
        }
      }
    }

    return NextResponse.json({ invitationId: invitation.id }, { status: 201 })
  } catch (error) {
    console.error('POST /api/invitations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/* GET /api/invitations — list user's invitations with stats */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let { data: invitations, error }: { data: any; error: any } = await supabase
      .from('invitations')
      .select(`
        id, template_id, plan, partner1_name, partner2_name, venue,
        hero_image_url, is_active, created_at, updated_at, slug, guest_links_quota, view_count,
        client_approval_status, client_approval_notes, client_approved_at, agency_phone,
        events(id, name, date, time, order_index),
        rsvps(id, status),
        wishes(id)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error && error.code === '42703') {
      const fallback = await supabase
        .from('invitations')
        .select(`
          id, template_id, plan, partner1_name, partner2_name, venue,
          hero_image_url, is_active, created_at, updated_at, slug, guest_links_quota, view_count,
          events(id, name, date, time, order_index),
          rsvps(id, status),
          wishes(id)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      invitations = fallback.data?.map((item: any) => ({
        ...item,
        client_approval_status: 'pending',
        client_approval_notes: null,
        client_approved_at: null,
        agency_phone: null,
      })) || null
      error = fallback.error
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ invitations })
  } catch (error) {
    console.error('GET /api/invitations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
