import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// Vercel Cron Endpoint: /api/cron/shaadilink_secure_cron_auto_delete
export async function GET(request: Request) {
  // 1. Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const supabase = createServiceClient();

    // 2. Calculate the threshold (72 hours / 3 days ago)
    const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

    // 3. Delete pending orders older than 72 hours
    const { data, error } = await supabase
      .from('orders')
      .delete()
      .eq('status', 'pending')
      .lt('created_at', seventyTwoHoursAgo)
      .select('id');

    if (error) {
      throw error;
    }

    const deletedCount = data ? data.length : 0;
    console.log(`Deleted ${deletedCount} expired pending orders.`);

    return NextResponse.json({ message: `Successfully deleted ${deletedCount} pending orders.`, deletedCount }, { status: 200 });

  } catch (err: any) {
    console.error('Cron shaadilink_secure_cron_auto_delete error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
