'use server';

import { createClient, createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteSubscriber(id: string) {
  const authSupabase = await createClient();
  const { data: { session } } = await authSupabase.auth.getSession();
  
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    return { error: 'Unauthorized' };
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/subscribers');
  return { success: true };
}
