'use server';

import { requireAdmin } from '@/lib/auth-helpers';
import { createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteSubscriber(id: string) {
  try {
    await requireAdmin();
  } catch (err: any) {
    return { error: err.message || 'Unauthorized' };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/subscribers');
  return { success: true };
}
