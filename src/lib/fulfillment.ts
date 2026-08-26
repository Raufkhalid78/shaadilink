import { createServiceClient } from '@/lib/supabase/server';

export async function fulfillOrderIfPending(orderId: string): Promise<boolean> {
  const service = createServiceClient();
  
  const { data: order, error: orderErr } = await service
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
      
  if (orderErr || !order) return false;
  if (order.status === 'paid') return true;

  const { data: updatedOrder, error: updateOrderErr } = await service
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', order.id)
      .eq('status', 'pending')
      .select()
      .single();
      
  if (updateOrderErr || !updatedOrder) return true;
  
  const invUpdate: Record<string, unknown> = { is_active: true, plan: order.plan };
  if (order.target_guest_links_quota > 0) {
      invUpdate.guest_links_quota = order.target_guest_links_quota;
  }
  
  await Promise.all([
    service.from('invitations').update(invUpdate).eq('id', order.invitation_id),
    service.from('profiles').update({ plan: order.plan }).eq('id', order.user_id)
  ]);

  if (order.promo_code) {
      await service.rpc('increment_promo_usage', { code_val: order.promo_code }).catch(console.error);
      
      const { data: refCode } = await service
        .from('referral_codes')
        .select('user_id')
        .eq('code', order.promo_code)
        .single();
        
      if (refCode?.user_id) {
        await service.from('affiliate_commissions').insert({
          affiliate_id: refCode.user_id,
          order_id: order.id,
          referral_code: order.promo_code,
          commission_amount: order.amount * 0.10,
          status: 'pending'
        }).catch(console.error);
      }
  }
  return true;
}