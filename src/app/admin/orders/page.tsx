import { createClient } from '@/lib/supabase/server';
import OrdersClient from './orders-client';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      invitation_id,
      plan,
      amount,
      currency,
      status,
      created_at,
      invitations(partner1_name, partner2_name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return <div>Error loading orders.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">Orders</h1>
        <p className="text-muted-foreground text-sm">Manage addon purchases.</p>
      </div>

      <OrdersClient initialOrders={orders || []} />
    </div>
  );
}
