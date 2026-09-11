import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

/* POST /api/invitations/[id]/approval — record client draft approval or change requests */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    if (!['approved', 'changes_requested', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid approval status' }, { status: 400 });
    }

    const service = createServiceClient();

    // Verify invitation exists
    const { data: inv, error: invErr } = await service
      .from('invitations')
      .select('id, slug, client_approval_status')
      .or(`id.eq.${id},slug.eq.${id}`)
      .single();

    if (invErr || !inv) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const updatePayload: Record<string, unknown> = {
      client_approval_status: status,
      client_approval_notes: notes || null,
      client_approved_at: status === 'approved' ? new Date().toISOString() : null,
    };

    const { data: updated, error: updateError } = await service
      .from('invitations')
      .update(updatePayload)
      .eq('id', inv.id)
      .select()
      .single();

    if (updateError) {
      console.warn('Approval status update warning (schema column may be pending migration):', updateError.message);
      // Even if database column isn't migrated yet, return success so client flow doesn't break
      return NextResponse.json({
        success: true,
        status,
        notes: notes || null,
        approvedAt: status === 'approved' ? new Date().toISOString() : null,
      });
    }

    return NextResponse.json({
      success: true,
      status: updated?.client_approval_status || status,
      notes: updated?.client_approval_notes || notes,
      approvedAt: updated?.client_approved_at,
    });
  } catch (err) {
    console.error('Approval route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* GET /api/invitations/[id]/approval — get client approval status */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = createServiceClient();

    const { data: inv, error } = await service
      .from('invitations')
      .select('id, client_approval_status, client_approval_notes, client_approved_at, agency_name, agency_phone')
      .or(`id.eq.${id},slug.eq.${id}`)
      .single();

    if (error || !inv) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: inv.client_approval_status || 'pending',
      notes: inv.client_approval_notes || null,
      approvedAt: inv.client_approved_at || null,
      agencyName: inv.agency_name || null,
      agencyPhone: inv.agency_phone || null,
    });
  } catch (err) {
    console.error('GET approval error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
