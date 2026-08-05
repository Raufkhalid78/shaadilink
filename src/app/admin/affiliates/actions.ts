'use server';

import { createClient, createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateAffiliateStatus(id: string, status: 'approved' | 'rejected') {
  const authSupabase = await createClient();
  const { data: { session } } = await authSupabase.auth.getSession();
  
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    return { error: 'Unauthorized' };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('affiliate_applications')
    .update({ status })
    .eq('id', id);

  if (error) {
    return { error: error.message };
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
