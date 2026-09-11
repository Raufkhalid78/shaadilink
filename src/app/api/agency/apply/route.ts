import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import {
  sendAgencyApplicationAdminAlert,
  sendAgencyApplicationConfirmation,
} from '@/lib/resend';
import { affiliateLimiter, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { success } = await affiliateLimiter.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again tomorrow.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      companyName,
      contactName,
      email,
      phone,
      city,
      websiteOrSocial,
      monthlyEvents,
      notes,
    } = body;

    if (!companyName?.trim()) {
      return NextResponse.json({ error: 'Agency / Company name is required' }, { status: 400 });
    }
    if (!contactName?.trim()) {
      return NextResponse.json({ error: 'Contact person name is required' }, { status: 400 });
    }
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }
    if (!phone?.trim()) {
      return NextResponse.json({ error: 'WhatsApp / Phone number is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const cleanCompany = companyName.trim();
    const cleanContact = contactName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanCity = city?.trim() || null;
    const cleanWeb = websiteOrSocial?.trim() || null;
    const cleanEvents = monthlyEvents?.trim() || null;
    const cleanNotes = notes?.trim() || null;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const service = createServiceClient();

    // 1. Try inserting into agency_applications table
    const { error: agencyError } = await service.from('agency_applications').insert({
      user_id: user?.id || null,
      company_name: cleanCompany,
      contact_name: cleanContact,
      email: cleanEmail,
      phone: cleanPhone,
      city: cleanCity,
      website_or_social: cleanWeb,
      monthly_events: cleanEvents,
      notes: cleanNotes,
      status: 'pending',
    });

    // Fallback if table does not exist: also record in affiliate_applications
    if (agencyError) {
      console.warn('agency_applications table insert failed, falling back to affiliate_applications:', agencyError.message);
      await service.from('affiliate_applications').insert({
        user_id: user?.id || null,
        name: `${cleanCompany} (${cleanContact})`,
        email: cleanEmail,
        social_id: cleanWeb || cleanPhone,
        promotion_plan: `[AGENCY APPLICATION]\nCompany: ${cleanCompany}\nContact: ${cleanContact}\nPhone: ${cleanPhone}\nCity: ${cleanCity || 'N/A'}\nMonthly Events: ${cleanEvents || 'N/A'}\nNotes: ${cleanNotes || 'None'}`,
        status: 'pending',
      });
    }

    // 2. Dispatch emails via Resend in background
    Promise.allSettled([
      sendAgencyApplicationAdminAlert({
        companyName: cleanCompany,
        contactName: cleanContact,
        email: cleanEmail,
        phone: cleanPhone,
        city: cleanCity || undefined,
        websiteOrSocial: cleanWeb || undefined,
        monthlyEvents: cleanEvents || undefined,
        notes: cleanNotes || undefined,
      }),
      sendAgencyApplicationConfirmation(cleanEmail, cleanContact, cleanCompany),
    ]).catch((err) => console.error('Failed to dispatch agency application emails:', err));

    return NextResponse.json({
      success: true,
      message: 'Your Agency & Planner application has been submitted successfully!',
    });
  } catch (err: any) {
    console.error('Agency application route error:', err);
    return NextResponse.json({ error: 'Server error processing application' }, { status: 500 });
  }
}
