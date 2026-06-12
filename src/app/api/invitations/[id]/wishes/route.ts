import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/* POST /api/invitations/[id]/wishes — submit wish (public) */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { senderName, message } = body

    if (!senderName?.trim()) {
      return NextResponse.json({ error: 'Sender name is required' }, { status: 400 })
    }
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const service = createServiceClient()
    const { data, error } = await service
      .from('wishes')
      .insert({
        invitation_id: id,
        sender_name: senderName.trim(),
        message: message.trim(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ wish: data }, { status: 201 })
  } catch (error) {
    console.error('POST /wishes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/* GET /api/invitations/[id]/wishes — get all wishes (public) */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const service = createServiceClient()

    const { data: wishes, error } = await service
      .from('wishes')
      .select('*')
      .eq('invitation_id', id)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ wishes })
  } catch (error) {
    console.error('GET /wishes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/* DELETE /api/invitations/[id]/wishes — delete wish (owner only) */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const wishId = searchParams.get('wishId')

    if (!wishId) {
      return NextResponse.json({ error: 'Wish ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = createServiceClient()

    // Verify ownership
    const { data: inv } = await service
      .from('invitations')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!inv || inv.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete wish
    const { error: deleteError } = await service
      .from('wishes')
      .delete()
      .eq('id', wishId)
      .eq('invitation_id', id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /wishes error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
