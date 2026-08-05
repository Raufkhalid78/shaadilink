import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    const excludeId = searchParams.get('excludeId'); // ID to ignore (for edits)

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const service = createServiceClient();

    let query = service
      .from('invitations')
      .select('id')
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.limit(1).maybeSingle();

    if (error) {
      console.error('Database error checking slug:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // If data exists, the slug is taken
    const isAvailable = !data;

    return NextResponse.json({ available: isAvailable });
  } catch (error) {
    console.error('GET /api/invitations/check-slug error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
