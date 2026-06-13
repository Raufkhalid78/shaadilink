import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const service = createServiceClient()
    // Increment view_count atomically using a raw update
    const { data: inv } = await service.from('invitations').select('view_count').eq('id', id).single()
    if (inv) {
      await service.from('invitations').update({ view_count: (inv.view_count || 0) + 1 }).eq('id', id)
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false })
  }
}
