import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { getEmailWrapper } from '@/lib/email-templates'
import { contactLimiter } from '@/lib/rate-limit'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const { success } = await contactLimiter.limit(`contact_${ip}`)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

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

    // Try to send email, but don't fail the request if it fails
    try {
      if (process.env.RESEND_API_KEY) {
        const { data, error } = await resend.emails.send({
          from: 'ShaadiLink Contact <hello@shaadilink.com.pk>',
          to: ['hello@shaadilink.com.pk'],
          replyTo: email.trim().toLowerCase(),
          subject: `New Contact Request from ${name}`,
          text: `New Contact Message\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
          html: getEmailWrapper(
            'New Contact Message',
            `You have a new message from ${name}`,
            `
              <h2 style="color: #022c22; margin-top: 0;">New Contact Message</h2>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; color: #334155;"><strong>Name:</strong> ${name}</p>
                <p style="margin: 0 0 10px 0; color: #334155;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #059669; text-decoration: none;">${email}</a></p>
                <p style="margin: 0 0 5px 0; color: #334155;"><strong>Message:</strong></p>
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; color: #1e293b; font-size: 15px; line-height: 1.6;">
                  ${message.replace(/\n/g, '<br/>')}
                </div>
              </div>
            `
          ),
        });
        
        if (error) {
          console.error('Resend API Error:', error)
        } else {
          console.log('Resend API Success:', data)
        }
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('POST /api/contact error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
