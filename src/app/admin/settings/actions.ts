'use server';

import { createClient, createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateSettings(formData: FormData) {
  const authSupabase = await createClient();
  const { data: { session } } = await authSupabase.auth.getSession();
  
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    return { error: 'Unauthorized' };
  }

  const admin_email = formData.get('admin_email') as string;
  const maintenance_mode = formData.get('maintenance_mode') === 'true';

  const supabase = createServiceClient();
  
  // Try to update existing record, or insert if none exists
  // First, get the first row ID
  const { data: existing } = await supabase.from('site_settings').select('id').limit(1).single();

  let error;
  if (existing?.id) {
    const { error: updateError } = await supabase
      .from('site_settings')
      .update({ admin_email, maintenance_mode, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    error = updateError;
  } else {
    // If no row exists (shouldn't happen if migration is run, but just in case)
    const { error: insertError } = await supabase
      .from('site_settings')
      .insert({ admin_email, maintenance_mode });
    error = insertError;
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/settings');
  revalidatePath('/'); // Revalidate everywhere in case maintenance mode changed
  return { success: true };
}
