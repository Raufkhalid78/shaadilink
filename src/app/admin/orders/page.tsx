import { createServiceClient } from '@/lib/supabase/server';
import OrdersClient from './orders-client';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const supabase = createServiceClient();

  // Try querying with full manual bank columns
  let ordersQuery = await supabase
    .from('orders')
    .select(`
      id,
      invitation_id,
      plan,
      amount,
      currency,
      status,
      created_at,
      tracker,
      payment_method,
      receipt_url,
      transaction_ref,
      sender_details,
      rejected_reason,
      invitations(id, slug, title, partner1_name, partner2_name)
    `)
    .order('created_at', { ascending: false });

  let orders: any = ordersQuery.data;

  // Fallback to base columns + tracker if migration not yet run
  if (ordersQuery.error) {
    const fallbackQuery = await supabase
      .from('orders')
      .select(`
        id,
        invitation_id,
        plan,
        amount,
        currency,
        status,
        created_at,
        tracker,
        invitations(id, slug, title, partner1_name, partner2_name)
      `)
      .order('created_at', { ascending: false });

    orders = fallbackQuery.data;
  }

  // Normalize data using tracker fallback
  const normalizedOrders = (orders || []).map((order: any) => {
    let parsedTracker: any = null;
    if (order.tracker && typeof order.tracker === 'string' && order.tracker.startsWith('{')) {
      try {
        parsedTracker = JSON.parse(order.tracker);
      } catch {}
    }

    return {
      ...order,
      payment_method: order.payment_method || parsedTracker?.paymentMethod || 'safepay',
      receipt_url: order.receipt_url || parsedTracker?.receiptUrl || null,
      transaction_ref: order.transaction_ref || parsedTracker?.transactionRef || null,
      sender_details: order.sender_details || parsedTracker?.senderDetails || null,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">Orders &amp; Payments</h1>
        <p className="text-muted-foreground text-sm">
          Review and approve online card and manual bank transfer orders.
        </p>
      </div>

      <OrdersClient initialOrders={normalizedOrders} />
    </div>
  );
}
