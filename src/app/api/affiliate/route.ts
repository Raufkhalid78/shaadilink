import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import {
  sendAffiliateApplicationAdminAlert,
  sendAffiliateApplicationConfirmation,
} from '@/lib/resend'
import { affiliateLimiter } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const { success } = await affiliateLimiter.limit(ip)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please try again tomorrow.' }, { status: 429 })
    }

    const body = await request.json()
    const { name, email, socialId, promotionPlan } = body

    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    if (!email?.trim()) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    if (!promotionPlan?.trim()) {
      return NextResponse.json({ error: 'Promotion plan description is required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (name.length > 100 || email.length > 255 || (socialId && socialId.length > 255) || promotionPlan.length > 1000) {
      return NextResponse.json({ error: 'Payload size exceeded limits' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = name.trim()
    const cleanSocialId = socialId?.trim() || null
    const cleanPlan = promotionPlan.trim()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const service = createServiceClient()
    const { error } = await service.from('affiliate_applications').insert({
      user_id: user?.id || null,
      name: cleanName,
      email: cleanEmail,
      social_id: cleanSocialId,
      promotion_plan: cleanPlan,
      status: 'pending',
    })

    if (error) {
      console.error('Affiliate insert error:', error)
      return NextResponse.json({ error: 'Failed to save application' }, { status: 500 })
    }

    // Send Admin Alert & Applicant Confirmation in background without blocking response
    try {
      await Promise.allSettled([
        sendAffiliateApplicationAdminAlert({
          name: cleanName,
          email: cleanEmail,
          socialId: cleanSocialId,
          promotionPlan: cleanPlan,
        }),
        sendAffiliateApplicationConfirmation(cleanEmail, cleanName),
      ])
    } catch (mailErr) {
      console.error('Affiliate email dispatch warning:', mailErr)
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('POST /api/affiliate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
