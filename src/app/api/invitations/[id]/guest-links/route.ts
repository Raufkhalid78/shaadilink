import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/* GET /api/invitations/[id]/guest-links -- fetch all guest links (owner only) */
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
    const { data: inv } = await service.from('invitations').select('id, user_id').eq('id', id).single()
    if (!inv || inv.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const { data: links, error } = await service
      .from('guest_links')
      .select('*')
      .eq('invitation_id', id)
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ links: links ?? [] })
  } catch (err) {
    console.error('GET /guest-links error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/* POST /api/invitations/[id]/guest-links -- create guest link with server-side quota check */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { guestName, guestSlug, url, allowedEvents, seats } = body
    if (!guestName?.trim() || !guestSlug?.trim() || !url?.trim()) {
      return NextResponse.json({ error: 'guestName, guestSlug, and url are required' }, { status: 400 })
    }
    const service = createServiceClient()
    const { data: inv } = await service
      .from('invitations')
      .select('id, user_id, guest_links_quota')
      .eq('id', id)
      .single()
    if (!inv || inv.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const quota = inv.guest_links_quota ?? 0
    const { count } = await service
      .from('guest_links')
      .select('id', { count: 'exact', head: true })
      .eq('invitation_id', id)
    if ((count ?? 0) >= quota) {
      return NextResponse.json(
        { error: "You have reached your limit of " + quota + " personalized links." },
        { status: 403 }
      )
    }
    const { data: link, error: insertErr } = await service
      .from('guest_links')
      .insert({
        invitation_id: id,
        guest_name: guestName.trim(),
        guest_slug: guestSlug.trim(),
        url: url.trim(),
        allowed_events: Array.isArray(allowedEvents) && allowedEvents.length > 0 ? allowedEvents : null,
        seats: typeof seats === 'number' && seats >= 0 ? seats : 1,
      })
      .select()
      .single()
    if (insertErr || !link) {
      return NextResponse.json({ error: insertErr?.message ?? 'Insert failed' }, { status: 500 })
    }
    return NextResponse.json({ link }, { status: 201 })
  } catch (err) {
    console.error('POST /guest-links error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}