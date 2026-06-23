import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/* POST /api/invitations — create new invitation */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      templateId, plan, partner1Name, partner2Name, venue, venueAddress,
      welcomeMessage, backgroundMusic, dressCodeWomen, dressCodeMen,
      transportation, accommodation, gifts, heroImageUrl, slideshowImageUrls,
      youtubeVideoId, personalizedGuestLinks, events, slug,
    } = body

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

    // Use service client to bypass RLS for reliable insert
    const service = createServiceClient()

    const { data: invitation, error: invErr } = await service
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
        personalized_guest_links: personalizedGuestLinks ?? false,
        is_active: false,
        show_bismillah: body.showBismillah ?? true,
        show_quran_verse: body.showQuranVerse ?? true,
        slug: finalSlug,
      })
      .select()
      .single()

    if (invErr) {
      console.error('Invitation insert error:', invErr)
      if (invErr.code === '23505') {
        return NextResponse.json({ error: 'This custom link slug is already taken. Please try another one.' }, { status: 400 })
      }
      return NextResponse.json({ error: invErr.message }, { status: 500 })
    }

    // Insert events
    if (events && events.length > 0) {
      const eventRows = events
        .filter((e: { name: string }) => e.name)
        .map((e: { name: string; date: string; time: string; venue?: string }, idx: number) => ({
          invitation_id: invitation.id,
          name: e.name,
          date: e.date || '',
          time: e.time || '',
          venue: e.venue || '',
          order_index: idx,
        }))

      if (eventRows.length > 0) {
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

    const service = createServiceClient()

    const { data: invitations, error } = await service
      .from('invitations')
      .select(`
        id, template_id, plan, partner1_name, partner2_name, venue,
        hero_image_url, is_active, created_at, updated_at, slug, personalized_guest_links,
        events(id, name, date, time, order_index),
        rsvps(id, status),
        wishes(id)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ invitations })
  } catch (error) {
    console.error('GET /api/invitations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
