"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import {
  CheckCircle2, Clock, Building2, CreditCard, Eye, ExternalLink,
  X, Check, AlertCircle, RefreshCw, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { adminMarkOrderPaid, adminRejectOrder } from './actions';

export default function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState<'pending' | 'paid' | 'all'>('pending');
  const [methodFilter, setMethodFilter] = useState<'all' | 'manual_bank' | 'safepay'>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Modal preview for receipt slip
  const [previewReceipt, setPreviewReceipt] = useState<{
    url: string;
    orderId: string;
    amount: number;
    transactionRef?: string;
    senderDetails?: string;
  } | null>(null);

  const filteredOrders = orders.filter((o) => {
    // 1. Status Filter
    if (activeTab === 'paid') {
      if (o.status !== 'paid' && o.status !== 'completed') return false;
    } else if (activeTab === 'pending') {
      if (o.status !== 'pending') return false;
    }

    // 2. Method Filter
    if (methodFilter === 'manual_bank') {
      if (o.payment_method !== 'manual_bank') return false;
    } else if (methodFilter === 'safepay') {
      if (o.payment_method === 'manual_bank') return false;
    }

    return true;
  });

  const handleMarkPaid = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await adminMarkOrderPaid(id);
      if (!res.success) {
        toast.error('Failed to fulfill and mark order as paid');
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: 'paid' } : o))
      );
      setPreviewReceipt(null);
      toast.success('Order fulfilled and invitation activated successfully!');
    } catch {
      toast.error('Error updating order');
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt(
      'Enter reason for rejecting this bank transfer (or leave blank):',
      'Slip unverified or amount not received'
    );
    if (reason === null) return; // cancelled prompt

    setLoadingId(id);
    try {
      const res = await adminRejectOrder(id, reason);
      if (!res.success) {
        toast.error('Failed to reject order');
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: 'failed', rejected_reason: reason } : o))
      );
      setPreviewReceipt(null);
      toast.info('Order marked as rejected.');
    } catch {
      toast.error('Error updating order');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
              activeTab === 'pending'
                ? 'text-gold border-gold bg-gold/5 font-bold'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Pending Verification ({orders.filter((o) => o.status === 'pending').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paid')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
              activeTab === 'paid'
                ? 'text-emerald border-emerald bg-emerald/5 font-bold'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            Paid / Active ({orders.filter((o) => o.status === 'paid' || o.status === 'completed').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
              activeTab === 'all'
                ? 'text-foreground border-foreground bg-white/5 font-bold'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            All Orders ({orders.length})
          </button>
        </div>

        {/* Method filter chips */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-muted-foreground mr-1 hidden sm:inline">Method:</span>
          <button
            type="button"
            onClick={() => setMethodFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              methodFilter === 'all'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setMethodFilter('manual_bank')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              methodFilter === 'manual_bank'
                ? 'bg-gold/20 text-gold font-semibold border border-gold/40'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>Bank (IBFT)</span>
          </button>
          <button
            type="button"
            onClick={() => setMethodFilter('safepay')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              methodFilter === 'safepay'
                ? 'bg-primary/20 text-primary font-semibold border border-primary/40'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <CreditCard className="w-3 h-3" />
            <span>Safepay</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="grid gap-3">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground border border-dashed rounded-2xl bg-card/20 space-y-1">
            <p className="text-sm font-semibold text-foreground">No orders matching this filter.</p>
            <p className="text-xs text-muted-foreground">New online or manual orders will appear here.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isManualBank = order.payment_method === 'manual_bank';
            const isPaid = order.status === 'paid' || order.status === 'completed';
            const isFailed = order.status === 'failed';
            const coupleTitle =
              order.invitations?.title ||
              (order.invitations?.partner1_name && order.invitations?.partner2_name
                ? `${order.invitations.partner1_name} & ${order.invitations.partner2_name}`
                : 'Untitled Invitation');

            return (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-border/60 bg-card/40 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center transition-all hover:border-border"
              >
                {/* Order Information */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-foreground">{coupleTitle}</span>
                    <Badge
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 ${
                        order.plan === 'royal'
                          ? 'bg-gold/20 text-gold border-gold/40'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {order.plan}
                    </Badge>

                    {/* Payment Method Badge */}
                    {isManualBank ? (
                      <Badge className="bg-gold/15 text-gold border-gold/30 text-[10px] gap-1 py-0.5">
                        <Building2 className="w-3 h-3" />
                        <span>IBFT / Raast</span>
                      </Badge>
                    ) : (
                      <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] gap-1 py-0.5">
                        <CreditCard className="w-3 h-3" />
                        <span>Safepay Card</span>
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>
                      Amount: <strong className="text-foreground">Rs. {Number(order.amount).toLocaleString('en-PK')}</strong>
                      {order.target_guest_links_quota > 0 && (
                        <span> • Quota: {order.target_guest_links_quota} links</span>
                      )}
                    </p>

                    {/* Manual Bank Specific Details */}
                    {isManualBank && (
                      <div className="flex items-center gap-2 flex-wrap pt-0.5">
                        {order.transaction_ref && (
                          <span className="font-mono text-[11px] bg-background/80 px-2 py-0.5 rounded-md border border-border/50 text-foreground font-semibold">
                            STAN/Ref: {order.transaction_ref}
                          </span>
                        )}
                        {order.sender_details && (
                          <span className="text-[11px] text-zinc-400">
                            Sender: {order.sender_details}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-[11px] text-muted-foreground/60" suppressHydrationWarning>
                      Ordered: {new Date(order.created_at).toLocaleString()} • Order #{order.id.slice(0, 10)}
                    </p>
                  </div>
                </div>

                {/* Right Column: Status & Action Buttons */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-border/40">
                  {/* View Slip Button for Manual Bank */}
                  {isManualBank && order.receipt_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setPreviewReceipt({
                          url: order.receipt_url,
                          orderId: order.id,
                          amount: Number(order.amount),
                          transactionRef: order.transaction_ref,
                          senderDetails: order.sender_details,
                        })
                      }
                      className="h-8 px-2.5 text-xs border-gold/40 text-gold hover:bg-gold/10 gap-1.5 rounded-xl cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Slip</span>
                    </Button>
                  )}

                  {isPaid ? (
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <CheckCircle2 className="w-4 h-4" /> Paid &amp; Active
                    </div>
                  ) : isFailed ? (
                    <div className="flex items-center gap-1 text-rose-400 text-xs font-semibold px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                      <XCircle className="w-4 h-4" /> Rejected
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        disabled={loadingId === order.id}
                        onClick={() => handleMarkPaid(order.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 px-3 rounded-xl gap-1 shadow-sm cursor-pointer"
                      >
                        {loadingId === order.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Approve &amp; Activate</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={loadingId === order.id}
                        onClick={() => handleReject(order.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-8 px-2 rounded-xl cursor-pointer"
                        title="Reject Order"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* RECEIPT PREVIEW DIALOG MODAL */}
      <Dialog
        open={!!previewReceipt}
        onOpenChange={(open) => !open && setPreviewReceipt(null)}
      >
        <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border border-gold/40 shadow-2xl p-5 text-foreground max-h-[92vh] overflow-y-auto">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="font-display text-lg font-bold text-foreground flex items-center justify-between">
              <span>Bank Payment Receipt</span>
              {previewReceipt && (
                <Badge className="bg-emerald/20 text-emerald font-bold text-xs">
                  Rs. {previewReceipt.amount.toLocaleString('en-PK')}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {previewReceipt?.transactionRef && (
                <span>Transaction Ref: <strong>{previewReceipt.transactionRef}</strong> • </span>
              )}
              {previewReceipt?.senderDetails && (
                <span>Sender: {previewReceipt.senderDetails}</span>
              )}
            </DialogDescription>
          </DialogHeader>

          {/* High-res Image Preview */}
          {previewReceipt?.url && (
            <div className="space-y-3">
              <div className="relative w-full rounded-2xl overflow-hidden border border-border/70 bg-black/80 flex items-center justify-center min-h-[300px] max-h-[500px]">
                <img
                  src={previewReceipt.url}
                  alt="Payment Receipt Slip"
                  className="w-full h-auto max-h-[480px] object-contain"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <a
                  href={previewReceipt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Resolution Image</span>
                </a>

                {/* Approve directly from inside modal */}
                <Button
                  size="sm"
                  disabled={loadingId === previewReceipt.orderId}
                  onClick={() => handleMarkPaid(previewReceipt.orderId)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-4 rounded-xl gap-1.5"
                >
                  {loadingId === previewReceipt.orderId ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Approve &amp; Activate Now</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
