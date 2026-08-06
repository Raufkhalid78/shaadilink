const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

(async () => {
  try {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    console.log('Fetching orders older than:', sixHoursAgo);
    const { data: abandonedOrders, error } = await supabase
      .from('orders')
      .select('id, amount, status, created_at, reminder_sent_at, user_id, metadata')
      .eq('status', 'pending')
      .is('reminder_sent_at', null)
      .lt('created_at', sixHoursAgo);

    if (error) throw error;
    console.log('Abandoned orders found:', abandonedOrders.length);

    for (const order of abandonedOrders) {
      const { data: profile } = await supabase.from('profiles').select('email').eq('id', order.user_id).single();
      console.log('Would send to:', profile?.email, 'Order:', order.id);
      
      // Let's actually send it if we want, or just log
      if (profile?.email) {
        const planName = order.metadata?.plan || (order.amount > 5000 ? 'Royal' : 'Classic');
        
        console.log('Sending email...');
        const resendData = await resend.emails.send({
          from: 'ShaadiLink <hello@shaadilink.com.pk>',
          to: [profile.email],
          subject: 'Complete Your Dream Invitation & Get 10% Off! 💍',
          html: `<p>Testing Abandoned Checkout Email to ${profile.email}</p>`
        });
        console.log('Resend Response:', resendData);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
})();
