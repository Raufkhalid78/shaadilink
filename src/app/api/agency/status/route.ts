import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ isAgency: false, status: 'none' });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || 'rauf.khaled78@gmail.com').toLowerCase();
    const userEmail = (user.email || '').toLowerCase();
    const isAdmin = userEmail === adminEmail;

    const service = createServiceClient();

    // 1. Check agency_applications table FIRST (authoritative source of truth)
    try {
      const { data: application } = await service
        .from('agency_applications')
        .select('status, company_name, credits_balance')
        .or(`user_id.eq.${user.id},email.eq.${userEmail}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (application) {
        return NextResponse.json({
          isAgency: application.status === 'approved',
          status: application.status,
          companyName: application.company_name,
          creditsBalance: Number(application.credits_balance || 0),
        });
      }
    } catch {
      // fallback
    }

    // 2. Check profile table for legacy agency flag only if no application exists
    try {
      const { data: profile } = await service
        .from('profiles')
        .select('agency_name, is_agency')
        .eq('id', user.id)
        .single();

      if (profile?.is_agency && profile?.agency_name) {
        return NextResponse.json({ isAgency: true, status: 'approved', companyName: profile.agency_name });
      }
    } catch {
      // Ignore if table or column missing
    }

    // 4. Check affiliate_applications table fallback
    try {
      const { data: affApp } = await service
        .from('affiliate_applications')
        .select('status, promotion_plan')
        .or(`user_id.eq.${user.id},email.eq.${userEmail}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (affApp && affApp.promotion_plan?.includes('[AGENCY APPLICATION]')) {
        return NextResponse.json({
          isAgency: affApp.status === 'approved',
          status: affApp.status,
        });
      }
    } catch {
      // Ignore
    }

    return NextResponse.json({ isAgency: false, status: 'none' });
  } catch (err) {
    console.error('Error fetching agency status:', err);
    return NextResponse.json({ isAgency: false, status: 'none' });
  }
}
