'use server';

import { requireAdmin } from '@/lib/auth-helpers';
import { fulfillOrderIfPending } from '@/lib/fulfillment';
import { createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function adminMarkOrderPaid(orderId: string) {
  try {
    await requireAdmin();
    const success = await fulfillOrderIfPending(orderId);
    revalidatePath('/admin/orders');
    return { success };
  } catch (error) {
    console.error('adminMarkOrderPaid error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function adminRejectOrder(orderId: string, reason?: string) {
  try {
    await requireAdmin();
    const service = createServiceClient();

    const updatePayload: Record<string, any> = { status: 'failed' };
    if (reason) updatePayload.rejected_reason = reason;

    const { error } = await service.from('orders').update(updatePayload).eq('id', orderId);
    if (error) {
      await service.from('orders').update({ status: 'failed' }).eq('id', orderId);
    }

    revalidatePath('/admin/orders');
    return { success: true };
  } catch (error) {
    console.error('adminRejectOrder error:', error);
    return { success: false, error: (error as Error).message };
  }
}
