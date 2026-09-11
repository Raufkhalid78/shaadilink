import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getOrCreateReviewToken, resetReviewToken } from '@/lib/review-token';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = id.replace(/%20| /g, '-');
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);

    const service = createServiceClient();
    const { data: inv, error: invError } = await (isUuid
      ? service.from('invitations').select('id, user_id, slug, is_active').eq('id', cleanId)
      : service.from('invitations').select('id, user_id, slug, is_active').eq('slug', cleanId)
    ).single();

    if (invError || !inv) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Check authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership or admin/agency
    const isOwner = user.id === inv.user_id;
    let isAgencyOrAdmin = isOwner;

    if (!isOwner) {
      const { data: profile } = await service
        .from('profiles')
        .select('role, is_agency')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin' || profile?.is_agency) {
        isAgencyOrAdmin = true;
      }
    }

    if (!isAgencyOrAdmin) {
      return NextResponse.json({ error: 'Forbidden. Agency access required.' }, { status: 403 });
    }

    const tokenInfo = await getOrCreateReviewToken(inv.id);
    const origin = request.nextUrl.origin;
    const reviewUrl = `${origin}/inv/${inv.slug || inv.id}?token=${tokenInfo.token}`;

    return NextResponse.json({
      success: true,
      token: tokenInfo.token,
      viewsCount: tokenInfo.viewsCount,
      maxViews: tokenInfo.maxViews,
      isExpired: tokenInfo.isExpired,
      reviewUrl,
    });
  } catch (error: any) {
    console.error('Error fetching review token:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = id.replace(/%20| /g, '-');
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);

    const service = createServiceClient();
    const { data: inv, error: invError } = await (isUuid
      ? service.from('invitations').select('id, user_id, slug, is_active').eq('id', cleanId)
      : service.from('invitations').select('id, user_id, slug, is_active').eq('slug', cleanId)
    ).single();

    if (invError || !inv) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isOwner = user.id === inv.user_id;
    let isAgencyOrAdmin = isOwner;

    if (!isOwner) {
      const { data: profile } = await service
        .from('profiles')
        .select('role, is_agency')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin' || profile?.is_agency) {
        isAgencyOrAdmin = true;
      }
    }

    if (!isAgencyOrAdmin) {
      return NextResponse.json({ error: 'Forbidden. Agency access required.' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action || 'reset';

    if (action === 'reset') {
      const tokenInfo = await resetReviewToken(inv.id);
      const origin = request.nextUrl.origin;
      const reviewUrl = `${origin}/inv/${inv.slug || inv.id}?token=${tokenInfo.token}`;

      return NextResponse.json({
        success: true,
        message: 'Fresh review link generated with 0/7 views',
        token: tokenInfo.token,
        viewsCount: tokenInfo.viewsCount,
        maxViews: tokenInfo.maxViews,
        isExpired: false,
        reviewUrl,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error modifying review token:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
