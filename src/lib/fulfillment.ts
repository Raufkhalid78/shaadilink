import { createServiceClient } from '@/lib/supabase/server';
import { sendOrderConfirmationEmail } from '@/lib/resend';

export async function fulfillOrderIfPending(orderId: string): Promise<boolean> {
  const service = createServiceClient();

  // Try calling the database-level atomic transaction RPC first
  try {
    const { data: rpcResult, error: rpcError } = await service.rpc('fulfill_order_atomic', {
      p_order_id: orderId,
    });

    if (!rpcError && rpcResult && (rpcResult as any).success) {
      console.log(`Order ${orderId} atomically fulfilled via fulfill_order_atomic RPC.`);
      return true;
    }
  } catch (e) {
    console.warn('fulfill_order_atomic RPC fallback:', e);
  }

  // Fallback: Safe state-checked atomic transition in application code
  const { data: order, error: orderErr } = await service
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (orderErr || !order) return false;
  if (order.status === 'paid') return true;

  // Atomically claim the pending order so duplicate webhooks/callbacks cannot double-fulfill
  const { data: updatedOrder, error: updateOrderErr } = await service
    .from('orders')
    .update({ status: 'paid' })
    .eq('id', order.id)
    .eq('status', 'pending')
    .select()
    .single();

  // If another thread already claimed it, return true safely
  if (updateOrderErr || !updatedOrder) return true;

  const invUpdate: Record<string, unknown> = {
    is_active: true,
    plan: order.plan,
  };
  if (order.target_guest_links_quota && order.target_guest_links_quota > 0) {
    invUpdate.guest_links_quota = order.target_guest_links_quota;
  }

  if (order.invitation_id) {
    await service.from('invitations').update(invUpdate).eq('id', order.invitation_id);
  }
  if (order.user_id) {
    await service.from('profiles').update({ plan: order.plan }).eq('id', order.user_id);

    // Send order confirmation receipt email
    try {
      const { data: profile } = await service.from('profiles').select('email').eq('id', order.user_id).single();
      if (profile?.email) {
        let invLink = 'https://www.smartinvites.com.pk/dashboard';
        if (order.invitation_id) {
          const { data: inv } = await service.from('invitations').select('slug').eq('id', order.invitation_id).single();
          if (inv?.slug) {
            invLink = `https://www.smartinvites.com.pk/inv/${inv.slug}`;
          }
        }
        await sendOrderConfirmationEmail({
          toEmail: profile.email,
          orderId: order.id,
          plan: order.plan,
          amount: Number(order.amount),
          currency: order.currency || 'PKR',
          invitationUrl: invLink,
        });
      }
    } catch (emailErr) {
      console.warn('Order confirmation email note:', emailErr);
    }
  }

  // Atomically increment promo usage and credit affiliate commission
  if (order.promo_code) {
    try {
      await service.rpc('increment_promo_usage', { code_val: order.promo_code });

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
          commission_amount: Number(order.amount) * 0.10,
          status: 'pending',
        });
      }
    } catch (promoErr) {
      console.error('Promo/affiliate fulfillment note:', promoErr);
    }
  }

  return true;
}