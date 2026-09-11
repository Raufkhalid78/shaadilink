import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { uploadLimiter, getClientIp } from '@/lib/rate-limit';

function isValidImageBytes(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false;
  const bytes = new Uint8Array(buffer.slice(0, 12));

  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return true;
  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return true;
  // GIF: 47 49 46 38
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return true;
  // WebP: RIFF ... WEBP
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return true;
  }
  // HEIC / HEIF: ftyp box
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return true;

  return false;
}

/* GET /api/invitations/[id]/snaps — fetch all approved snaps for the photo wall */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = createServiceClient();

    // Verify invitation ID / slug
    const cleanId = id.replace(/%20| /g, "-");
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
    const { data: inv } = await (isUuid
      ? service.from('invitations').select('id, partner1_name, partner2_name, title, slug').eq('id', cleanId)
      : service.from('invitations').select('id, partner1_name, partner2_name, title, slug').eq('slug', cleanId)
    ).single();

    if (!inv) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const { data: snaps, error } = await service
      .from('guest_snaps')
      .select('id, guest_name, photo_url, caption, table_number, is_approved, created_at')
      .eq('invitation_id', inv.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      // Table may not be migrated yet in Supabase
      console.warn('guest_snaps fetch warning:', error.message);
      return NextResponse.json({
        snaps: [],
        invitation: {
          id: inv.id,
          title: inv.title || `${inv.partner1_name} & ${inv.partner2_name}`,
          slug: inv.slug,
        },
      });
    }

    return NextResponse.json({
      snaps: snaps || [],
      invitation: {
        id: inv.id,
        title: inv.title || `${inv.partner1_name} & ${inv.partner2_name}`,
        slug: inv.slug,
      },
    });
  } catch (err) {
    console.error('GET snaps error:', err);
    return NextResponse.json({ error: 'Failed to fetch snaps' }, { status: 500 });
  }
}

/* POST /api/invitations/[id]/snaps — public guest photo upload to crowd photo wall */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = createServiceClient();

    // Resolve invitation
    const cleanId = id.replace(/%20| /g, "-");
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
    const { data: inv } = await (isUuid
      ? service.from('invitations').select('id, is_active').eq('id', cleanId)
      : service.from('invitations').select('id, is_active').eq('slug', cleanId)
    ).single();

    if (!inv) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Rate limiting per IP
    const ip = getClientIp(request);
    const { success: rateLimitOk } = await uploadLimiter.limit(`snap_${inv.id}_${ip}`);
    if (!rateLimitOk) {
      return NextResponse.json({ error: 'Upload rate limit reached. Please wait a moment.' }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const guestName = ((formData.get('guestName') as string) || 'Event Guest').trim().slice(0, 100);
    const caption = ((formData.get('caption') as string) || '').trim().slice(0, 300);
    const tableNumber = ((formData.get('tableNumber') as string) || '').trim().slice(0, 50);

    if (!file || typeof file !== 'object' || file.size === 0) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // 8MB limit for mobile phone camera photos
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image size must be under 8MB.' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    if (!isValidImageBytes(buffer)) {
      return NextResponse.json({ error: 'Invalid image format. Supported: JPG, PNG, WebP, HEIC.' }, { status: 400 });
    }

    const rawExt = file.name?.split('.').pop()?.toLowerCase() ?? 'jpg';
    const cleanExt = ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(rawExt) ? rawExt : 'jpg';
    const filePath = `snaps/${inv.id}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${cleanExt}`;

    const { error: uploadErr } = await service.storage
      .from('invitation-images')
      .upload(filePath, buffer, {
        contentType: file.type || `image/${cleanExt === 'jpg' ? 'jpeg' : cleanExt}`,
        upsert: false,
      });

    if (uploadErr) {
      console.error('Storage snap upload error:', uploadErr);
      return NextResponse.json({ error: 'Failed to store image. Please try again.' }, { status: 500 });
    }

    const { data: { publicUrl } } = service.storage
      .from('invitation-images')
      .getPublicUrl(filePath);

    // Save record in guest_snaps table
    const { data: snapRecord, error: insertErr } = await service
      .from('guest_snaps')
      .insert({
        invitation_id: inv.id,
        guest_name: guestName,
        photo_url: publicUrl,
        caption: caption || null,
        table_number: tableNumber || null,
        is_approved: true,
      })
      .select()
      .single();

    if (insertErr) {
      console.warn('guest_snaps insert warning (table may be pending migration):', insertErr.message);
      // Return publicUrl even if table isn't created yet so guest experience doesn't fail
      return NextResponse.json({
        success: true,
        snap: {
          id: `temp-${Date.now()}`,
          photo_url: publicUrl,
          guest_name: guestName,
          caption,
          table_number: tableNumber,
          created_at: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ success: true, snap: snapRecord });
  } catch (err) {
    console.error('POST /api/invitations/[id]/snaps error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* DELETE /api/invitations/[id]/snaps — host moderation (delete snap) */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const snapId = searchParams.get('snapId');

    if (!snapId) {
      return NextResponse.json({ error: 'snapId is required' }, { status: 400 });
    }

    const service = createServiceClient();

    // Verify user owns the invitation
    const { data: inv } = await service
      .from('invitations')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (!inv || inv.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await service
      .from('guest_snaps')
      .delete()
      .eq('id', snapId)
      .eq('invitation_id', inv.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE snap error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
