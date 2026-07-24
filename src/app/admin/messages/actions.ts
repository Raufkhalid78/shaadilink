'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteContactMessage(id: string) {
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
