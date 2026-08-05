import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/resend'
import { newsletterLimiter } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const { success } = await newsletterLimiter.limit(`newsletter_${ip}`)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const { email } = await request.json()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }
    
    // 1. Save to Supabase
    const service = createServiceClient()
    const { error } = await service
      .from('newsletter_subscribers')
      .upsert({ email }, { onConflict: 'email', ignoreDuplicates: true })
      
    if (error) {
      console.error('Newsletter subscribe error:', error)
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
    }

    // 2. Send welcome email via Resend
    // This runs asynchronously so it doesn't block the UI response
    sendWelcomeEmail(email).catch(e => console.error('Failed to send Resend welcome email:', e))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/newsletter error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
