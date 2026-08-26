import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(
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
    const { guests } = body // Expected array of { guestName, guestSlug, url, allowedEvents, seats }
    
    if (!guests || !Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json({ error: 'Valid guests array is required' }, { status: 400 })
    }

    const service = createServiceClient()
    
    // Validate invitation ownership and quota
    const { data: inv } = await service
      .from('invitations')
      .select('id, user_id, guest_links_quota, is_active')
      .eq('id', id)
      .single()
      
    if (!inv || inv.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!inv.is_active) {
      return NextResponse.json({ error: 'Invitation is not active yet.' }, { status: 403 })
    }

    const quota = inv.guest_links_quota ?? 0
    const { count } = await service
      .from('guest_links')
      .select('id', { count: 'exact', head: true })
      .eq('invitation_id', id)

    const currentCount = count ?? 0
    
    if (currentCount + guests.length > quota) {
      return NextResponse.json(
        { error: `Quota exceeded. You can only create ${Math.max(0, quota - currentCount)} more links.` },
        { status: 403 }
      )
    }

    const rowsToInsert = guests.map((g: any) => ({
      invitation_id: id,
      guest_name: g.guestName?.trim(),
      guest_slug: g.guestSlug?.trim(),
      url: g.url?.trim(),
      allowed_events: Array.isArray(g.allowedEvents) && g.allowedEvents.length > 0 ? g.allowedEvents : null,
      seats: typeof g.seats === 'number' && g.seats >= 0 ? g.seats : 1,
    }))

    const { data: insertedLinks, error: insertErr } = await service
      .from('guest_links')
      .insert(rowsToInsert)
      .select()

    if (insertErr || !insertedLinks) {
      return NextResponse.json({ error: insertErr?.message ?? 'Bulk insert failed' }, { status: 500 })
    }

    return NextResponse.json({ links: insertedLinks }, { status: 201 })
  } catch (err) {
    console.error('POST /guest-links/bulk error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
