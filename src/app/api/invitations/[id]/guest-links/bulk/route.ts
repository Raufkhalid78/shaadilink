import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const guestSchema = z.object({
  guestName: z.string().trim().min(1, 'Guest name is required').max(100),
  guestSlug: z.string().trim().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  url: z.string().url().max(500),
  allowedEvents: z.array(z.string()).nullable().optional(),
  seats: z.number().int().min(0).max(100).default(1),
})

const bulkGuestsSchema = z.object({
  guests: z.array(guestSchema).min(1).max(500, 'Maximum 500 guests allowed per batch'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parseResult = bulkGuestsSchema.safeParse(body)
    
    if (!parseResult.success) {
      return NextResponse.json({ 
        error: 'Invalid request payload', 
        details: parseResult.error.issues 
      }, { status: 400 })
    }

    const { guests } = parseResult.data
    const service = createServiceClient()
    
    // Call the atomic RPC function
    const { data, error } = await service.rpc('insert_guest_links_atomic', {
      p_invitation_id: id,
      p_user_id: user.id,
      p_guests: guests
    })

    if (error) {
      console.error('Atomic insert failed:', error)
      // Check for specific custom errors raised by the RPC
      if (error.message.includes('Quota exceeded')) {
        return NextResponse.json({ error: error.message }, { status: 403 })
      }
      if (error.message.includes('Invitation not found')) {
        return NextResponse.json({ error: 'Forbidden or invitation not active' }, { status: 403 })
      }
      return NextResponse.json({ error: 'Failed to create guest links' }, { status: 500 })
    }

    return NextResponse.json({ links: data }, { status: 201 })

  } catch (error) {
    console.error('POST bulk guest links error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
