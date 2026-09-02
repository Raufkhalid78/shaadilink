import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getClientIp } from '@/lib/rate-limit'

// In-memory view cooldown cache: key = `${invId}_${ip}`, value = timestamp
const viewCooldowns = new Map<string, number>()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cleanId = id.replace(/%20| /g, "-")
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId)
    const service = createServiceClient()
    const ip = getClientIp(request)
    
    // Increment view_count atomically for valid invitations
    const { data: inv } = await (isUuid
      ? service.from('invitations').select('id, is_active').eq('id', cleanId)
      : service.from('invitations').select('id, is_active').eq('slug', cleanId)
    ).single()

    if (inv) {
      const cooldownKey = `${inv.id}_${ip}`
      const now = Date.now()
      const lastView = viewCooldowns.get(cooldownKey) || 0

      // Count at most 1 view per visitor IP per 15 minutes to prevent analytics inflation
      if (now - lastView > 15 * 60 * 1000) {
        viewCooldowns.set(cooldownKey, now)

        if (viewCooldowns.size > 5000) {
          for (const [k, t] of viewCooldowns.entries()) {
            if (now - t > 30 * 60 * 1000) viewCooldowns.delete(k)
          }
        }

        const { error: rpcError } = await service.rpc('increment_view_count', { inv_id: inv.id })
        if (rpcError) console.error('RPC Error:', rpcError)
      }

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
      } catch {
        // Ignore json parse error if body is empty
      }
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false })
  }
}
