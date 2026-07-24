"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState<'pending' | 'paid'>('pending');
  const supabase = createClient();

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'paid') {
      return o.status === 'paid' || o.status === 'completed';
    }
    // For pending tab, only show if it's the newest pending order for this invitation
    if (o.status === 'pending') {
      const isNewest = !orders.some(other => 
        other.status === 'pending' && 
        other.invitation_id === o.invitation_id && 
        new Date(other.created_at).getTime() > new Date(o.created_at).getTime()
      );
      return isNewest;
    }
    return false;
  });

  const handleMarkPaid = async (id: string, currentStatus: string) => {
    if (currentStatus !== 'pending') return;

    const { error } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update order status');
      return;
    }

    setOrders(orders.map(o => o.id === id ? { ...o, status: 'paid' } : o));
    toast.success('Order marked as Paid');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border/50 pb-2">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'pending' ? 'text-gold border-gold bg-gold/5' : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border/50'}`}
        >
          Pending
        </button>
        <button 
          onClick={() => setActiveTab('paid')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'paid' ? 'text-emerald border-emerald bg-emerald/5' : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border/50'}`}
        >
          Paid
        </button>
      </div>

      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
            No {activeTab} orders found.
          </div>
        ) : filteredOrders.map((order) => (
          <div key={order.id} className="p-4 rounded-xl border border-border/50 bg-card/30 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {order.invitations?.partner1_name} & {order.invitations?.partner2_name}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted uppercase">
                  {order.plan}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Payment: <span className="uppercase">SafePay / Bank</span> · Amount: {order.currency} {order.amount}
              </p>
              <p className="text-xs text-muted-foreground/60" suppressHydrationWarning>
                Created: {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {(order.status === 'paid' || order.status === 'completed') ? (
                <div className="flex items-center gap-1 text-emerald-500 text-sm font-medium px-3 py-1.5 bg-emerald-500/10 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" /> Paid
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-amber-500 text-sm font-medium px-3 py-1.5 bg-amber-500/10 rounded-lg">
                    <Clock className="w-4 h-4" /> Pending
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleMarkPaid(order.id, order.status)}
                    className="bg-emerald hover:bg-emerald-dark text-white"
                  >
                    Mark Paid
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
