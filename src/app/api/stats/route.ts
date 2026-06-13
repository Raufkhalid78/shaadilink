import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const service = createServiceClient()
    const [invResult, rsvpResult, wishResult] = await Promise.all([
      service.from('invitations').select('id', { count: 'exact', head: true }).eq('is_active', true),
      service.from('rsvps').select('id', { count: 'exact', head: true }),
      service.from('wishes').select('id', { count: 'exact', head: true }),
    ])
    return NextResponse.json({
      invitations: invResult.count ?? 0,
      rsvps: rsvpResult.count ?? 0,
      wishes: wishResult.count ?? 0,
    }, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' }
    })
  } catch {
    return NextResponse.json({ invitations: 0, rsvps: 0, wishes: 0 })
  }
}
