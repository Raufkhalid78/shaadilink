import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendDraftRecoveryEmail } from '@/lib/resend';

// Vercel Cron Endpoint: /api/cron/abandoned-drafts
export async function GET(request: Request) {
  // 1. Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const supabase = createServiceClient();

    // 2. Fetch inactive drafts older than 4 hours where no reminder has been sent yet
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

    const { data: abandonedDrafts, error } = await supabase
      .from('invitations')
      .select('id, user_id, plan, updated_at, reminder_sent_at, is_active')
      .eq('is_active', false)
      .is('reminder_sent_at', null)
      .lt('updated_at', fourHoursAgo);

    if (error) {
      throw error;
    }

    if (!abandonedDrafts || abandonedDrafts.length === 0) {
      return NextResponse.json({ message: 'No abandoned drafts found.' }, { status: 200 });
    }

    let emailsSent = 0;

    // 3. Send emails and update the reminder_sent_at flag
    for (const draft of abandonedDrafts) {
      // Get user email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', draft.user_id)
        .single();

      if (profile?.email) {
        // Fallback to Classic if plan is empty for some reason
        const planName = draft.plan || 'Classic';
        
        await sendDraftRecoveryEmail(profile.email, planName);
        
        // Update the flag directly on the invitation record so it's only sent ONCE
        await supabase
          .from('invitations')
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq('id', draft.id);
          
        emailsSent++;
      }
    }

    return NextResponse.json({ message: `Successfully processed ${emailsSent} abandoned drafts.` }, { status: 200 });

  } catch (err: any) {
    console.error('Cron abandoned-drafts error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
