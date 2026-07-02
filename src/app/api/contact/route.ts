import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    if (!email?.trim()) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    if (!message?.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 })

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase.from('contact_messages').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    })

    if (error) {
      console.error('Contact insert error:', error)
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('POST /api/contact error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
