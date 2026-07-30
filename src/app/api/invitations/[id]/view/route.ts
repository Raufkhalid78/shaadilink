import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cleanId = id.replace(/%20| /g, "-")
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId)
    const service = createServiceClient()
    
    // Increment view_count atomically using a raw update
    const { data: inv } = await (isUuid
      ? service.from('invitations').select('id').eq('id', cleanId)
      : service.from('invitations').select('id').eq('slug', cleanId)
    ).single()

    if (inv) {
      // Call the RPC to increment the view count atomically and log the view
      await service.rpc('increment_view_count', { inv_id: inv.id })

      // Handle guest link specific view count if guestSlug is provided
      try {
        const body = await request.json()
        if (body?.guestSlug) {
          const { data: guestLink } = await service
            .from('guest_links')
            .select('id, view_count, status')
            .eq('invitation_id', inv.id)
            .eq('guest_slug', body.guestSlug)
            .single()

          if (guestLink) {
            const updates: any = {
              view_count: (guestLink.view_count || 0) + 1,
              last_viewed_at: new Date().toISOString()
            }
            if (guestLink.status === 'pending' || guestLink.status === 'sent') {
              updates.status = 'opened'
            }
            await service.from('guest_links').update(updates).eq('id', guestLink.id)
          }
        }
      } catch (e) {
        // Ignore json parse error if body is empty
      }
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false })
  }
}
