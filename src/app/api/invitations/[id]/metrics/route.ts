import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// In-memory counter cache to buffer high-frequency milestone events without overloading DB
const metricsBuffer = new Map<string, { door_opened: number; music_played: number; pass_viewed: number }>();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const event = body?.event; // 'door_opened' | 'music_played' | 'pass_viewed'

    if (!['door_opened', 'music_played', 'pass_viewed'].includes(event)) {
      return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
    }

    // Buffer counts in memory
    const current = metricsBuffer.get(id) || { door_opened: 0, music_played: 0, pass_viewed: 0 };
    current[event as keyof typeof current] = (current[event as keyof typeof current] || 0) + 1;
    metricsBuffer.set(id, current);

    return NextResponse.json({ success: true, event, count: current[event as keyof typeof current] });
  } catch (err) {
    console.error('POST /api/invitations/[id]/metrics error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const current = metricsBuffer.get(id) || { door_opened: 0, music_played: 0, pass_viewed: 0 };

    return NextResponse.json({
      success: true,
      metrics: current,
    });
  } catch (err) {
    console.error('GET /api/invitations/[id]/metrics error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
