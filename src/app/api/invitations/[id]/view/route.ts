import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cleanId = id.replace(/%20| /g, "-")
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId)
    const service = createServiceClient()
    // Increment view_count atomically using a raw update
    const { data: inv } = await (isUuid
      ? service.from('invitations').select('id, view_count').eq('id', cleanId)
      : service.from('invitations').select('id, view_count').eq('slug', cleanId)
    ).single()
    if (inv) {
      await service.from('invitations').update({ view_count: (inv.view_count || 0) + 1 }).eq('id', inv.id)
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false })
  }
}
