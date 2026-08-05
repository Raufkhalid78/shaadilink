'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { markCommissionPaid } from '@/app/admin/affiliates/actions';
import { toast } from 'sonner';

export function PayoutManager({ commissions }: { commissions: any[] }) {
  const [data, setData] = useState(commissions);

  async function handleMarkPaid(id: string) {
    if (!confirm('Have you successfully transferred the payout to this affiliate?')) return;
    
    const res = await markCommissionPaid(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      setData(data.map(c => c.id === id ? { ...c, status: 'paid' } : c));
      toast.success('Commission marked as paid');
    }
  }

  const pendingCommissions = data.filter(c => c.status !== 'paid');
  const paidCommissions = data.filter(c => c.status === 'paid');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Pending Payouts</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Affiliate ID</th>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3 text-right">Commission</th>
                <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {pendingCommissions.length ? (
                pendingCommissions.map((c: any) => (
                  <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground text-xs font-mono">{c.affiliate_id}</td>
                    <td className="px-4 py-3 text-xs font-mono">{c.order_id}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-500">
                      Rs {Number(c.commission_amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10 h-8 gap-2"
                        onClick={() => handleMarkPaid(c.id)}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Mark Paid
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No pending payouts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Paid History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Date</th>
                <th className="px-4 py-3">Affiliate ID</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Commission Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paidCommissions.length ? (
                paidCommissions.map((c: any) => (
                  <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground text-xs font-mono">{c.affiliate_id}</td>
                    <td className="px-4 py-3 text-right font-semibold text-muted-foreground">
                      Rs {Number(c.commission_amount).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    No paid history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
