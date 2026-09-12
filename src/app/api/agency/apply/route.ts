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

    // 1. Check for existing agency application
    const { data: existingApp } = await service
      .from('agency_applications')
      .select('id, status, company_name')
      .or(user?.id ? `user_id.eq.${user.id},email.eq.${cleanEmail}` : `email.eq.${cleanEmail}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let isReapplication = false;

    if (existingApp) {
      if (existingApp.status === 'approved') {
        return NextResponse.json(
          { error: 'Your agency application is already approved! You can access the Agency Portal directly from your dashboard.' },
          { status: 400 }
        );
      }

      if (existingApp.status === 'pending') {
        return NextResponse.json(
          { error: 'You already have an agency application under review. Our team will review it within 24 hours. Contact admin on WhatsApp if urgent.' },
          { status: 400 }
        );
      }

      // If status is 'rejected' or update requested, update the application back to pending
      isReapplication = true;
      const { error: updateError } = await service
        .from('agency_applications')
        .update({
          user_id: user?.id || null,
          company_name: cleanCompany,
          contact_name: cleanContact,
          email: cleanEmail,
          phone: cleanPhone,
          city: cleanCity,
          website_or_social: cleanWeb,
          monthly_events: cleanEvents,
          notes: cleanNotes ? `[UPDATED APPLICATION]\n${cleanNotes}` : '[UPDATED APPLICATION]',
          status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingApp.id);

      if (updateError) {
        console.error('Failed to update agency re-application:', updateError);
        return NextResponse.json({ error: 'Failed to update application. Please try again.' }, { status: 500 });
      }
    } else {
      // Clean new insert
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
    }

    // 2. Dispatch emails via Resend in background
    Promise.allSettled([
      sendAgencyApplicationAdminAlert({
        companyName: isReapplication ? `${cleanCompany} [RE-APPLICATION]` : cleanCompany,
        contactName: cleanContact,
        email: cleanEmail,
        phone: cleanPhone,
        city: cleanCity || undefined,
        websiteOrSocial: cleanWeb || undefined,
        monthlyEvents: cleanEvents || undefined,
        notes: isReapplication ? `[RE-APPLICATION WITH UPDATED DETAILS]\n${cleanNotes || 'None'}` : cleanNotes || undefined,
      }),
      sendAgencyApplicationConfirmation(cleanEmail, cleanContact, cleanCompany),
    ]).catch((err) => console.error('Failed to dispatch agency application emails:', err));

    return NextResponse.json({
      success: true,
      message: isReapplication
        ? 'Your updated Agency & Planner application has been re-submitted for expedited review!'
        : 'Your Agency & Planner application has been submitted successfully!',
    });
  } catch (err: any) {
    console.error('Agency application route error:', err);
    return NextResponse.json({ error: 'Server error processing application' }, { status: 500 });
  }
}
