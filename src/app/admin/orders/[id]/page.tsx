import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminOrderDetails(props: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const params = await props.params;
  
  const { data: order } = await supabase.from('orders').select('*').eq('id', params.id).single();

  if (!order) {
    return <div>Order not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="text-sm text-gold hover:underline">&larr; Back to Orders</Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">Order #{order.id}</h1>
        <p className="text-muted-foreground text-sm">Created on {new Date(order.created_at).toLocaleString()}</p>
      </div>

      <Card className="border-border/50 bg-card/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShoppingBag className="w-5 h-5"/> Order Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block">Status</span>
              <span className="font-semibold text-emerald-500 capitalize">{order.status}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Amount</span>
              <span className="font-semibold">Rs {order.amount}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Invitation ID</span>
              <span className="font-semibold">{order.invitation_id || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">User ID</span>
              <span className="font-semibold">{order.user_id || 'N/A'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
