import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { verifyScannerAccess } from '@/lib/scanner-auth';

export const dynamic = 'force-dynamic';

async function fetchInvitation(service: any, id: string) {
  let invQuery = await service
    .from('invitations')
    .select('id, user_id, slug, partner1_name, partner2_name, scanner_pin, scanner_active')
    .eq('id', id)
    .single();

  if (invQuery.error) {
    const fallback = await service
      .from('invitations')
      .select('id, user_id, slug, partner1_name, partner2_name')
      .eq('id', id)
      .single();
    return fallback.data || null;
  }
  return invQuery.data || null;
}

/* GET /api/invitations/[id]/check-in -- fetch check-in stats, search, & recent list */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = createServiceClient();
    const inv = await fetchInvitation(service, id);

    if (!inv) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Authenticate: Host session OR Gatekeeper PIN
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const pin = request.headers.get('x-scanner-pin') || request.nextUrl.searchParams.get('pin');

    const auth = verifyScannerAccess(inv, user?.id, pin);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const searchQuery = request.nextUrl.searchParams.get('search')?.trim();

    // If gatekeeper is searching for a guest by name or slug
    if (searchQuery) {
      const { data: searchResults, error: searchError } = await service
        .from('guest_links')
        .select('*')
        .eq('invitation_id', id)
        .ilike('guest_name', `%${searchQuery}%`)
        .limit(20);

      if (searchError) {
        return NextResponse.json({ error: searchError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        searchResults: searchResults?.map(g => ({
          id: g.id,
          name: g.guest_name,
          slug: g.guest_slug,
          seats: g.seats || 1,
          allowedEvents: g.allowed_events,
          status: g.status,
          checkedInAt: g.last_viewed_at,
        })) || [],
      });
    }

    // Fetch all guest links for this invitation
    const { data: links, error } = await service
      .from('guest_links')
      .select('*')
      .eq('invitation_id', id)
      .order('last_viewed_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalGuests = links?.length || 0;
    const checkedInGuests = links?.filter(l => l.status === 'checked_in') || [];
    const checkedInCount = checkedInGuests.length;

    const totalSeats = links?.reduce((acc, l) => acc + (l.seats || 1), 0) || 0;
    const checkedInSeats = checkedInGuests.reduce((acc, l) => acc + (l.seats || 1), 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalGuests,
        checkedInCount,
        totalSeats,
        checkedInSeats,
      },
      recentCheckIns: checkedInGuests.slice(0, 25).map(g => ({
        id: g.id,
        name: g.guest_name,
        slug: g.guest_slug,
        seats: g.seats || 1,
        allowedEvents: g.allowed_events,
        checkedInAt: g.last_viewed_at,
      })),
    });
  } catch (err) {
    console.error('GET /api/invitations/[id]/check-in error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* POST /api/invitations/[id]/check-in -- scan & verify a guest ticket */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = createServiceClient();
    const inv = await fetchInvitation(service, id);

    if (!inv) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Authenticate: Host session OR Gatekeeper PIN
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json().catch(() => ({}));
    const pin = request.headers.get('x-scanner-pin') || body.pin || request.nextUrl.searchParams.get('pin');

    const auth = verifyScannerAccess(inv, user?.id, pin);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    let { guestSlug, qrData, gate } = body;

    // If full URL was scanned, extract guest query parameter
    if (!guestSlug && qrData) {
      try {
        if (qrData.includes('guest=')) {
          const urlObj = new URL(qrData.startsWith('http') ? qrData : `https://example.com/${qrData}`);
          guestSlug = urlObj.searchParams.get('guest');
        } else if (qrData.includes('/')) {
          const parts = qrData.split('/');
          guestSlug = parts[parts.length - 1];
        } else {
          guestSlug = qrData.trim();
        }
      } catch {
        guestSlug = qrData.trim();
      }
    }

    if (!guestSlug) {
      return NextResponse.json({ error: 'No guest code or slug provided' }, { status: 400 });
    }

    // Clean up slug
    guestSlug = String(guestSlug).trim();

    // Query guest_links for matching record
    const { data: guest, error: guestErr } = await service
      .from('guest_links')
      .select('*')
      .eq('invitation_id', id)
      .eq('guest_slug', guestSlug)
      .single();

    if (guestErr || !guest) {
      // Also try searching by exact name or ID if manual entry
      const { data: fallbackGuest } = await service
        .from('guest_links')
        .select('*')
        .eq('invitation_id', id)
        .ilike('guest_name', guestSlug)
        .limit(1)
        .single();

      if (fallbackGuest) {
        return handleGuestCheckIn(service, fallbackGuest, gate);
      }

      // Check if it matches the main invitation itself
      if (guestSlug === inv.slug || guestSlug === inv.id) {
        return NextResponse.json({
          success: true,
          generalInvite: true,
          alreadyCheckedIn: false,
          guest: {
            name: "General Invitation Attendee",
            seats: 1,
            status: "checked_in",
            checkedInAt: new Date().toISOString(),
            gate: gate || 'Entrance',
          }
        });
      }

      return NextResponse.json({
        success: false,
        error: `Pass not recognized. No guest found matching "${guestSlug}".`,
      }, { status: 404 });
    }

    return handleGuestCheckIn(service, guest, gate);
  } catch (err) {
    console.error('POST /api/invitations/[id]/check-in error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleGuestCheckIn(service: any, guest: any, gate?: string) {
  const isAlreadyCheckedIn = guest.status === 'checked_in';

  if (isAlreadyCheckedIn) {
    return NextResponse.json({
      success: true,
      alreadyCheckedIn: true,
      guest: {
        id: guest.id,
        name: guest.guest_name,
        slug: guest.guest_slug,
        seats: guest.seats || 1,
        allowedEvents: guest.allowed_events,
        status: guest.status,
        checkedInAt: guest.last_viewed_at || new Date().toISOString(),
        gate: gate || 'Entrance',
      },
    });
  }

  // Update status to checked_in with timestamp
  const now = new Date().toISOString();
  const { error: updateErr } = await service
    .from('guest_links')
    .update({
      status: 'checked_in',
      last_viewed_at: now,
    })
    .eq('id', guest.id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    alreadyCheckedIn: false,
    guest: {
      id: guest.id,
      name: guest.guest_name,
      slug: guest.guest_slug,
      seats: guest.seats || 1,
      allowedEvents: guest.allowed_events,
      status: 'checked_in',
      checkedInAt: now,
      gate: gate || 'Entrance',
    },
  });
}
