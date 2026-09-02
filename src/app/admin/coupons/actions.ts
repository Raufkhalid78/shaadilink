'use server';

import { requireAdmin } from '@/lib/auth-helpers';
import { createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addCoupon(formData: FormData) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return { error: err.message || 'Unauthorized' };
  }

  const code = formData.get('code') as string;
  const discount_percent = Number(formData.get('discount_percent'));
  const max_uses = formData.get('max_uses') ? Number(formData.get('max_uses')) : null;

  const supabase = createServiceClient();
  const { error } = await supabase.from('referral_codes').insert({
    code: code.toUpperCase(),
    discount_percent,
    max_uses
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/coupons');
  return { success: true };
}

export async function deleteCoupon(id: string) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return { error: err.message || 'Unauthorized' };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from('referral_codes').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/coupons');
  return { success: true };
}
