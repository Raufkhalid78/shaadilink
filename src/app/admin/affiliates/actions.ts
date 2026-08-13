'use server';

import { createClient, createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { resend } from '@/lib/resend';
import { getEmailWrapper } from '@/lib/email-templates';

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
  if (status === 'approved' && application?.email && resend) {
    try {
      await resend.emails.send({
        from: 'ShaadiLink Partners <hello@shaadilink.com.pk>',
        to: [application.email],
        subject: 'Welcome to the ShaadiLink Partner Program! 🎉',
        html: getEmailWrapper(
          'Application Approved!',
          'Great news! Your affiliate application has been approved.',
          `
            <h2 style="color: #022c22; margin-top: 0;">Welcome to the Team!</h2>
            <p>Hi ${application.name},</p>
            <p>Great news! Your application to the <strong>ShaadiLink Partner Program</strong> has been approved.</p>
            <p>You can now log in to your dashboard to get your unique referral links, track your earnings, and view resources to help you promote ShaadiLink.</p>
            
            <br/>
            <center>
              <a href="https://shaadilink.com.pk/affiliate/dashboard" style="background-color: #d4af37; color: #111827; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
            </center>
            
            <br/>
            <p>We're thrilled to have you partner with us. If you have any questions, don't hesitate to reach out.</p>
            <p>Best regards,</p>
            <p><strong>The ShaadiLink Team</strong></p>
          `
        )
      });
    } catch (err) {
      console.error('Failed to send affiliate approval email:', err);
    }
  } else if (status === 'rejected' && application?.email && resend) {
    try {
      await resend.emails.send({
        from: 'ShaadiLink Partners <hello@shaadilink.com.pk>',
        to: [application.email],
        subject: 'Update on your ShaadiLink Partner Application',
        html: getEmailWrapper(
          'Application Update',
          'An update regarding your application to the ShaadiLink Partner Program.',
          `
            <h2 style="color: #022c22; margin-top: 0;">Application Update</h2>
            <p>Hi ${application.name},</p>
            <p>Thank you for applying to the ShaadiLink Partner Program. We appreciate your interest in partnering with us.</p>
            <p>After careful consideration, we are unable to approve your application at this time. We receive many applications and unfortunately cannot accept everyone into the program.</p>
            <p>We wish you the best of luck in your future endeavors!</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>The ShaadiLink Team</strong></p>
          `
        )
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
