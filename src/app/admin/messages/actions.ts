'use server'

import { requireAdmin } from '@/lib/auth-helpers';
import { createServiceClient, createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteContactMessage(id: string) {
  await requireAdmin();

  const supabase = createServiceClient()
  
  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Failed to delete message:', error)
    throw new Error('Failed to delete message')
  }

  revalidatePath('/admin/messages')
}
