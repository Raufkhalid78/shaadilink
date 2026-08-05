'use server';

import { createClient, createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function updateAffiliateStatus(id: string, status: 'approved' | 'rejected') {
  const authSupabase = await createClient();
  const { data: { session } } = await authSupabase.auth.getSession();
  
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    return { error: 'Unauthorized' };
  }

  const supabase = createServiceClient();
  const { data: application } = await supabase
    .from('affiliate_applications')
    .select('email, name')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('affiliate_applications')
    .update({ status })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  // Send email if approved
  if (status === 'approved' && application?.email && process.env.RESEND_API_KEY) {
    try {
      await resend.emails.send({
        from: 'ShaadiLink Partners <hello@shaadilink.com.pk>',
        to: application.email,
        subject: 'Welcome to the ShaadiLink Affiliate Program!',
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #047857;">Congratulations, ${application.name}!</h2>
            <p>Your application to join the ShaadiLink Affiliate Program has been <strong>approved</strong>.</p>
            <p>You can now access your affiliate dashboard, generate your unique 10% discount code, and start earning a 10% commission on every successful referral.</p>
            <p style="margin-top: 30px;">
              <a href="https://shaadilink.com.pk/dashboard/affiliate" style="background-color: #f59e0b; color: #064e3b; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Go to Affiliate Dashboard
              </a>
            </p>
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Welcome aboard,<br/>
              The ShaadiLink Team
            </p>
          </div>
        `
      });
    } catch (err) {
      console.error('Failed to send affiliate approval email:', err);
    }
  } else if (status === 'rejected' && application?.email && process.env.RESEND_API_KEY) {
    try {
      await resend.emails.send({
        from: 'ShaadiLink Partners <hello@shaadilink.com.pk>',
        to: application.email,
        subject: 'Update on your ShaadiLink Affiliate Application',
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
            <p>Hi ${application.name},</p>
            <p>Thank you for your interest in joining the ShaadiLink Affiliate Program.</p>
            <p>After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Best regards,<br/>
              The ShaadiLink Team
            </p>
          </div>
        `
      });
    } catch (err) {
      console.error('Failed to send affiliate rejection email:', err);
    }
  }

  revalidatePath('/admin/affiliates');
  return { success: true };
}

export async function deleteAffiliate(id: string) {
  const authSupabase = await createClient();
  const { data: { session } } = await authSupabase.auth.getSession();
  
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    return { error: 'Unauthorized' };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('affiliate_applications')
    .delete()
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/affiliates');
  return { success: true };
}

export async function markCommissionPaid(id: string) {
  const authSupabase = await createClient();
  const { data: { session } } = await authSupabase.auth.getSession();
  
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    return { error: 'Unauthorized' };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('affiliate_commissions')
    .update({ status: 'paid' })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/affiliates');
  return { success: true };
}
