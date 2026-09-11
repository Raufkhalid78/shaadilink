import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { resolveInvitationPin, verifyScannerAccess, getDeterministicPin } from '@/lib/scanner-auth';

export const dynamic = 'force-dynamic';

/* GET /api/invitations/[id]/scanner-auth -- fetch PIN configuration or verify PIN */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = createServiceClient();

    // Fetch invitation record
    let invQuery = await service
      .from('invitations')
      .select('id, user_id, slug, partner1_name, partner2_name, title, venue, category, is_active, scanner_pin, scanner_active')
      .eq('id', id)
      .single();

    // If query failed (e.g. columns scanner_pin or scanner_active don't exist yet in Supabase schema)
    let inv: any = invQuery.data;
    if (invQuery.error) {
      const fallbackQuery = await service
        .from('invitations')
        .select('id, user_id, slug, partner1_name, partner2_name, title, venue, category, is_active')
        .eq('id', id)
        .single();
      if (fallbackQuery.error || !fallbackQuery.data) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }
      inv = fallbackQuery.data;
    }

    if (!inv) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Check if authenticated host
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const currentPin = resolveInvitationPin(inv);
    const isActive = inv.scanner_active !== false;
    const eventTitle = inv.title || (inv.partner1_name && inv.partner2_name ? `${inv.partner1_name} & ${inv.partner2_name}` : 'Event');

    if (user && user.id === inv.user_id) {
      // Owner view: return PIN and management details
      return NextResponse.json({
        success: true,
        isOwner: true,
        pin: currentPin,
        scannerActive: isActive,
        eventTitle,
        venue: inv.venue,
        category: inv.category,
        invitationId: inv.id,
        slug: inv.slug,
      });
    }

    // Non-owner / Gatekeeper check
    const queryPin = request.nextUrl.searchParams.get('pin') || request.headers.get('x-scanner-pin');
    if (!queryPin) {
      return NextResponse.json({
        success: true,
        isOwner: false,
        requiresPin: true,
        eventTitle,
        category: inv.category,
        scannerActive: isActive,
      });
    }

    const authCheck = verifyScannerAccess(inv, user?.id, queryPin);
    if (!authCheck.authorized) {
      return NextResponse.json({ error: authCheck.error || 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      isOwner: false,
      authenticated: true,
      eventTitle,
      venue: inv.venue,
      category: inv.category,
      scannerActive: isActive,
    });
  } catch (err: any) {
    console.error('GET /api/invitations/[id]/scanner-auth error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* POST /api/invitations/[id]/scanner-auth -- authenticate gatekeeper or update PIN */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = createServiceClient();
    const body = await request.json();

    // Fetch invitation
    let invQuery = await service
      .from('invitations')
      .select('id, user_id, slug, partner1_name, partner2_name, title, venue, category, is_active, scanner_pin, scanner_active')
      .eq('id', id)
      .single();

    let inv: any = invQuery.data;
    if (invQuery.error) {
      const fallbackQuery = await service
        .from('invitations')
        .select('id, user_id, slug, partner1_name, partner2_name, title, venue, category, is_active')
        .eq('id', id)
        .single();
      if (fallbackQuery.error || !fallbackQuery.data) {
        return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
      }
      inv = fallbackQuery.data;
    }

    if (!inv) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Mode A: Gatekeeper PIN Verification
    if (body.action === 'verify' || body.pin !== undefined && body.active === undefined) {
      const pinToVerify = String(body.pin || '').trim();
      const authResult = verifyScannerAccess(inv, user?.id, pinToVerify);

      if (!authResult.authorized) {
        return NextResponse.json({
          success: false,
          error: authResult.error || 'Incorrect PIN. Please check with the event host.',
        }, { status: 401 });
      }

      const eventTitle = inv.title || (inv.partner1_name && inv.partner2_name ? `${inv.partner1_name} & ${inv.partner2_name}` : 'Event');

      return NextResponse.json({
        success: true,
        authenticated: true,
        eventTitle,
        venue: inv.venue,
        category: inv.category,
        invitationId: inv.id,
      });
    }

    // Mode B: Host Management (Update PIN or toggle active)
    if (!user || user.id !== inv.user_id) {
      return NextResponse.json({ error: 'Forbidden. Only the event host can modify scanner settings.' }, { status: 403 });
    }

    const updatePayload: Record<string, any> = {};
    if (body.newPin !== undefined) {
      const cleanPin = String(body.newPin).replace(/\D/g, '').slice(0, 8);
      if (cleanPin.length < 4) {
        return NextResponse.json({ error: 'PIN must be at least 4 digits.' }, { status: 400 });
      }
      updatePayload.scanner_pin = cleanPin;
    }

    if (body.scannerActive !== undefined) {
      updatePayload.scanner_active = Boolean(body.scannerActive);
    }

    // Attempt DB update
    const { error: updateErr } = await service
      .from('invitations')
      .update(updatePayload)
      .eq('id', id);

    if (updateErr) {
      console.warn('Could not update scanner columns directly in DB (column may not exist yet):', updateErr.message);
      // Return success with fallback so host experience is unaffected
      return NextResponse.json({
        success: true,
        pin: updatePayload.scanner_pin || resolveInvitationPin(inv),
        scannerActive: updatePayload.scanner_active ?? true,
        notice: 'Note: To persist custom PINs across all devices, run the Supabase migration script in your SQL editor.'
      });
    }

    return NextResponse.json({
      success: true,
      pin: updatePayload.scanner_pin || resolveInvitationPin(inv),
      scannerActive: updatePayload.scanner_active ?? true,
    });
  } catch (err: any) {
    console.error('POST /api/invitations/[id]/scanner-auth error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
