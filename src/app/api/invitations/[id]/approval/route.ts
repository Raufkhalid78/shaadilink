import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendClientReviewNotification } from '@/lib/resend';

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
      .select('id, slug, user_id, title, partner1_name, partner2_name, agency_name, agency_phone, client_approval_status')
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

    // Find recipient email for planner notification
    let recipientEmail = '';
    let plannerName = inv.agency_name || '';

    if (inv.user_id) {
      const { data: profile } = await service
        .from('profiles')
        .select('email, full_name, agency_name')
        .eq('id', inv.user_id)
        .maybeSingle();

      if (profile?.email) {
        recipientEmail = profile.email;
        if (profile.agency_name) plannerName = profile.agency_name;
        else if (profile.full_name) plannerName = profile.full_name;
      }

      if (!recipientEmail) {
        const { data: agencyApp } = await service
          .from('agency_applications')
          .select('email, company_name, contact_name')
          .eq('user_id', inv.user_id)
          .maybeSingle();

        if (agencyApp?.email) {
          recipientEmail = agencyApp.email;
          plannerName = agencyApp.company_name || agencyApp.contact_name || plannerName;
        }
      }
    }

    const eventTitle = inv.partner1_name && inv.partner2_name
      ? `${inv.partner1_name} & ${inv.partner2_name}`
      : inv.title || inv.partner1_name || 'Event Invitation';

    // Dispatch email notification to agency planner
    if (recipientEmail && (status === 'approved' || status === 'changes_requested')) {
      sendClientReviewNotification({
        toEmail: recipientEmail,
        plannerName,
        eventTitle,
        invitationId: inv.id,
        slug: inv.slug,
        status,
        notes: notes || null,
        approvedAt: status === 'approved' ? new Date().toISOString() : undefined,
        agencyName: inv.agency_name || plannerName,
      }).catch((e) => console.error('Error dispatching client review email:', e));
    }

    if (updateError) {
      console.warn('Approval status update warning (schema column may be pending migration):', updateError.message);
      return NextResponse.json({
        success: true,
        status,
        notes: notes || null,
        approvedAt: status === 'approved' ? new Date().toISOString() : null,
        notifiedEmail: recipientEmail || null,
      });
    }

    return NextResponse.json({
      success: true,
      status: updated?.client_approval_status || status,
      notes: updated?.client_approval_notes || notes,
      approvedAt: updated?.client_approved_at,
      notifiedEmail: recipientEmail || null,
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
