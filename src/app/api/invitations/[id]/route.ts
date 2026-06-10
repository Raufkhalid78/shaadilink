import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/* GET /api/invitations/[id] — fetch single invitation (public if active) */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const service = createServiceClient()

    const { data: invitation, error } = await service
      .from('invitations')
      .select(`
        *, events(id, name, date, time, venue, order_index),
        wishes(id, sender_name, message, created_at)
      `)
      .eq('id', id)
      .single()

    if (error || !invitation) {
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
    const service = createServiceClient()

    // Verify ownership
    const { data: existing } = await service
      .from('invitations')
      .select('user_id')
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
      slideshowImageUrls: 'slideshow_image_urls', isActive: 'is_active',
    }
    for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
      if (body[jsKey] !== undefined) updateData[dbKey] = body[jsKey]
    }

    const { data: updated, error } = await service
      .from('invitations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Update events if provided
    if (body.events) {
      await service.from('events').delete().eq('invitation_id', id)
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

    const service = createServiceClient()

    // Verify ownership
    const { data: existing } = await service
      .from('invitations')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await service.from('invitations').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/invitations/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
