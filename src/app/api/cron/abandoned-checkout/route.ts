import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { sendRecoveryEmail } from '@/lib/resend';

// Vercel Cron Endpoint: /api/cron/abandoned-checkout
export async function GET(request: Request) {
  // 1. Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const supabase = createServiceClient();

    // 2. Fetch pending orders older than 6 hours where no reminder has been sent yet
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

    const { data: abandonedOrders, error } = await supabase
      .from('orders')
      .select('id, amount, status, created_at, reminder_sent_at, user_id, plan')
      .eq('status', 'pending')
      .is('reminder_sent_at', null)
      .lt('created_at', sixHoursAgo);

    if (error) {
      throw error;
    }

    if (!abandonedOrders || abandonedOrders.length === 0) {
      return NextResponse.json({ message: 'No abandoned checkouts found.' }, { status: 200 });
    }

    let emailsSent = 0;

    // 3. Send emails and update the reminder_sent_at flag
    for (const order of abandonedOrders) {
      // Get user email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', order.user_id)
        .single();

      if (profile?.email) {
        // Find plan name from plan column or amount
        const planName = order.plan || (order.amount > 5000 ? 'Royal' : 'Classic');
        
        await sendRecoveryEmail(profile.email, order.id, planName);
        
        // Update the flag
        await supabase
          .from('orders')
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq('id', order.id);
          
        emailsSent++;
      }
    }

    return NextResponse.json({ message: `Successfully processed ${emailsSent} abandoned checkouts.` }, { status: 200 });

  } catch (err: any) {
    console.error('Cron abandoned-checkout error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
