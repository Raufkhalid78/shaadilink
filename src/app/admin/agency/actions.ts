'use server';

import { requireAdmin } from '@/lib/auth-helpers';
import { createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateAgencyApplicationStatus(id: string, status: 'approved' | 'rejected') {
  try {
    await requireAdmin();
  } catch (err: any) {
    return { error: err.message || 'Unauthorized' };
  }

  const supabase = createServiceClient();

  const { data: application, error: fetchErr } = await supabase
    .from('agency_applications')
    .select('email, contact_name, company_name, user_id')
    .eq('id', id)
    .single();

  if (fetchErr || !application) {
    return { error: 'Application not found' };
  }

  const { error } = await supabase
    .from('agency_applications')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  // If approved, update profile
  if (status === 'approved') {
    try {
      if (application.user_id) {
        await supabase
          .from('profiles')
          .update({
            is_agency: true,
            agency_name: application.company_name,
          })
          .eq('id', application.user_id);
      } else if (application.email) {
        await supabase
          .from('profiles')
          .update({
            is_agency: true,
            agency_name: application.company_name,
          })
          .eq('email', application.email.toLowerCase());
      }
    } catch (e) {
      console.error('Failed to sync profile is_agency:', e);
    }
  }

  revalidatePath('/admin/agency');
  revalidatePath('/admin/affiliates');
  revalidatePath('/dashboard/agency');
  return { success: true };
}

export async function approveAgencyCreditOrder(orderId: string) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return { error: err.message || 'Unauthorized' };
  }

  const supabase = createServiceClient();

  // 1. Get order
  const { data: order, error: orderErr } = await supabase
    .from('agency_credit_orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderErr || !order) {
    return { error: 'Order not found' };
  }

  if (order.status === 'approved') {
    return { error: 'Order has already been approved' };
  }

  // 2. Mark order approved
  const { error: updateOrderErr } = await supabase
    .from('agency_credit_orders')
    .update({
      status: 'approved',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (updateOrderErr) {
    return { error: updateOrderErr.message };
  }

  // 3. Top-up agency_applications balance
  const { data: app } = await supabase
    .from('agency_applications')
    .select('id, credits_balance, user_id')
    .eq('id', order.agency_id)
    .single();

  if (app) {
    const current = Number(app.credits_balance ?? 0);
    const newBalance = current + Number(order.credits_count);

    await supabase
      .from('agency_applications')
      .update({
        credits_balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', app.id);

    // Also sync profiles table if user_id exists
    const targetUserId = app.user_id || order.user_id;
    if (targetUserId) {
      try {
        await supabase
          .from('profiles')
          .update({ agency_credits: newBalance, is_agency: true })
          .eq('id', targetUserId);
      } catch (e) {
        console.error('Profile credit sync note:', e);
      }
    }
  }

  revalidatePath('/admin/agency');
  revalidatePath('/dashboard/agency');
  return { success: true };
}

export async function rejectAgencyCreditOrder(orderId: string, reason?: string) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return { error: err.message || 'Unauthorized' };
  }

  const supabase = createServiceClient();

  const { error } = await supabase
    .from('agency_credit_orders')
    .update({
      status: 'rejected',
      admin_notes: reason || 'Payment could not be verified with bank statement',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/agency');
  revalidatePath('/dashboard/agency');
  return { success: true };
}

export async function adjustAgencyCredits(agencyId: string, creditsAdjustment: number, reason: string) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return { error: err.message || 'Unauthorized' };
  }

  const supabase = createServiceClient();

  const { data: app, error: appErr } = await supabase
    .from('agency_applications')
    .select('id, credits_balance, company_name, user_id')
    .eq('id', agencyId)
    .single();

  if (appErr || !app) {
    return { error: 'Agency not found' };
  }

  const newBalance = Math.max(0, Number(app.credits_balance ?? 0) + creditsAdjustment);

  const { error } = await supabase
    .from('agency_applications')
    .update({
      credits_balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq('id', agencyId);

  if (error) {
    return { error: error.message };
  }

  // Record audit order
  await supabase.from('agency_credit_orders').insert({
    agency_id: agencyId,
    user_id: app.user_id,
    agency_name: app.company_name,
    pack_name: `Manual Admin Adjustment (${creditsAdjustment > 0 ? '+' : ''}${creditsAdjustment} credits)`,
    credits_count: creditsAdjustment,
    amount_pkr: 0,
    payment_method: 'manual_bank',
    status: 'approved',
    admin_notes: reason,
  });

  revalidatePath('/admin/agency');
  revalidatePath('/dashboard/agency');
  return { success: true, newBalance };
}

/**
 * Admin approves agency deletion request.
 * Safeguard: Preserves active invitations by setting auto_delete_at = now() + 90 days (3 months)
 * and unlinking user_id so links remain accessible for guests!
 */
export async function approveAgencyDeletionRequest(agencyId: string) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return { error: err.message || 'Unauthorized' };
  }

  const supabase = createServiceClient();

  const { data: app, error: appErr } = await supabase
    .from('agency_applications')
    .select('id, user_id, company_name, email')
    .eq('id', agencyId)
    .single();

  if (appErr || !app) {
    return { error: 'Agency not found' };
  }

  const targetUserId = app.user_id;

  if (targetUserId) {
    // 1. Preserve active invitations with 3-month (90-day) retention and decouple from user
    const ninetyDaysFromNow = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('invitations')
      .update({
        auto_delete_at: ninetyDaysFromNow,
        user_id: null, // Decouple so deleting auth user doesn't delete invitation
      })
      .eq('user_id', targetUserId)
      .eq('is_active', true);

    // 2. Delete any unpaid drafts
    await supabase
      .from('invitations')
      .delete()
      .eq('user_id', targetUserId)
      .eq('is_active', false);

    // 3. Delete credit orders
    await supabase
      .from('agency_credit_orders')
      .delete()
      .eq('user_id', targetUserId);
  }

  // 4. Delete agency application
  await supabase
    .from('agency_applications')
    .delete()
    .eq('id', agencyId);

  // 5. Delete Supabase auth user
  if (targetUserId) {
    try {
      await supabase.auth.admin.deleteUser(targetUserId);
    } catch (e) {
      console.error('Admin delete user error note:', e);
    }
  }

  revalidatePath('/admin/agency');
  return { success: true };
}

export async function rejectAgencyDeletionRequest(agencyId: string, rejectionReason?: string) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return { error: err.message || 'Unauthorized' };
  }

  const supabase = createServiceClient();

  const { error } = await supabase
    .from('agency_applications')
    .update({
      deletion_requested: false,
      deletion_reason: rejectionReason || 'Deletion request declined by administrator',
      updated_at: new Date().toISOString(),
    })
    .eq('id', agencyId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/agency');
  return { success: true };
}

