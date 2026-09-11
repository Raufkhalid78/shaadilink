'use client';

import { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  ExternalLink,
  Zap,
  Building2,
  CreditCard,
  Plus,
  Loader2,
  X,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, ScrollableTabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  updateAgencyApplicationStatus,
  approveAgencyCreditOrder,
  rejectAgencyCreditOrder,
  adjustAgencyCredits,
  approveAgencyDeletionRequest,
  rejectAgencyDeletionRequest,
} from './actions';

interface Props {
  applications: any[];
  creditOrders: any[];
}

export function AdminAgencyClient({ applications: initialApps, creditOrders: initialOrders }: Props) {
  const [apps, setApps] = useState(initialApps);
  const [orders, setOrders] = useState(initialOrders);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Receipt Modal State
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);

  // Manual Adjust Modal State
  const [adjustingAgency, setAdjustingAgency] = useState<any | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(5);
  const [adjustReason, setAdjustReason] = useState<string>('VIP Partner Promotional Credit');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Handle Application Status
  const handleAppStatus = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      const res = await updateAgencyApplicationStatus(id, status);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setApps(apps.map((a) => (a.id === id ? { ...a, status } : a)));
      toast.success(`Agency application ${status}!`);
    } catch {
      toast.error('Network error');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Approve Credit Order
  const handleApproveOrder = async (orderId: string, creditsCount: number, agencyName: string) => {
    if (!confirm(`Approve payment and add +${creditsCount} credits to ${agencyName}?`)) {
      return;
    }

    setProcessingId(orderId);
    try {
      const res = await approveAgencyCreditOrder(orderId);
      if (res.error) {
        toast.error(res.error);
        return;
      }

      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: 'approved' } : o)));

      // Also update local app credit balance
      setApps(
        apps.map((a) => {
          const matchingOrder = orders.find((o) => o.id === orderId);
          if (matchingOrder && (a.id === matchingOrder.agency_id || a.company_name === agencyName)) {
            return {
              ...a,
              credits_balance: Number(a.credits_balance ?? 0) + creditsCount,
            };
          }
          return a;
        })
      );

      toast.success(`🎉 +${creditsCount} Wholesale Credits added to ${agencyName}!`);
    } catch {
      toast.error('Failed to approve order');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Reject Credit Order
  const handleRejectOrder = async (orderId: string) => {
    const reason = prompt('Reason for rejecting this payment order:');
    if (!reason) return;

    setProcessingId(orderId);
    try {
      const res = await rejectAgencyCreditOrder(orderId, reason);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setOrders(
        orders.map((o) =>
          o.id === orderId ? { ...o, status: 'rejected', admin_notes: reason } : o
        )
      );
      toast.success('Order rejected.');
    } catch {
      toast.error('Failed to reject order');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Manual Credit Adjustment
  const handleConfirmAdjustment = async () => {
    if (!adjustingAgency) return;
    setIsAdjusting(true);

    try {
      const res = await adjustAgencyCredits(adjustingAgency.id, adjustAmount, adjustReason);
      if (res.error) {
        toast.error(res.error);
        return;
      }

      setApps(
        apps.map((a) =>
          a.id === adjustingAgency.id ? { ...a, credits_balance: res.newBalance } : a
        )
      );

      toast.success(`Balance updated for ${adjustingAgency.company_name}!`);
      setAdjustingAgency(null);
    } catch {
      toast.error('Failed to adjust credits');
    } finally {
      setIsAdjusting(false);
    }
  };

  const pendingApps = apps.filter((a) => a.status === 'pending');
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const approvedAgencies = apps.filter((a) => a.status === 'approved');
  const deletionRequests = apps.filter((a) => a.deletion_requested);

  // Handle Approve Deletion Request
  const handleApproveDeletion = async (agencyId: string, companyName: string) => {
    if (
      !confirm(
        `Approve account deletion for ${companyName}? Active client wedding invitations will remain accessible to guests via their links for 3 months (90 days).`
      )
    ) {
      return;
    }

    setProcessingId(agencyId);
    try {
      const res = await approveAgencyDeletionRequest(agencyId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setApps(apps.filter((a) => a.id !== agencyId));
      toast.success(
        `Agency ${companyName} deleted. Active client wedding invitations preserved with 3-month access retention.`
      );
    } catch {
      toast.error('Failed to approve deletion');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Decline Deletion Request
  const handleRejectDeletion = async (agencyId: string) => {
    const reason = prompt('Reason for declining deletion request (optional):');
    setProcessingId(agencyId);
    try {
      const res = await rejectAgencyDeletionRequest(agencyId, reason || undefined);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setApps(
        apps.map((a) =>
          a.id === agencyId
            ? { ...a, deletion_requested: false, deletion_reason: reason || '' }
            : a
        )
      );
      toast.success('Deletion request declined.');
    } catch {
      toast.error('Failed to decline deletion request');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-foreground flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-gold" /> Agency Partner Management
          </h1>
          <p className="text-muted-foreground text-xs">
            Review event planner applications, approve wholesale credit orders, and manage partner balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingApps.length > 0 && (
            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs font-bold">
              {pendingApps.length} Pending Applications
            </Badge>
          )}
          {pendingOrders.length > 0 && (
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-xs font-bold">
              {pendingOrders.length} Pending Top-Up Orders
            </Badge>
          )}
          {deletionRequests.length > 0 && (
            <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/30 text-xs font-bold animate-pulse">
              {deletionRequests.length} Deletion Requests
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={deletionRequests.length > 0 ? 'deletions' : pendingOrders.length > 0 ? 'orders' : 'applications'} className="w-full">
        <ScrollableTabsList variant="gold" className="mb-4">
          <TabsTrigger value="applications" className="gap-2">
            Applications ({apps.length})
            {pendingApps.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            )}
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            Wholesale Credit Orders ({orders.length})
            {pendingOrders.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            )}
          </TabsTrigger>
          <TabsTrigger value="partners" className="gap-2">
            Active Partners &amp; Balances ({approvedAgencies.length})
          </TabsTrigger>
          <TabsTrigger value="deletions" className="gap-2">
            Deletion Requests ({deletionRequests.length})
            {deletionRequests.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            )}
          </TabsTrigger>
        </ScrollableTabsList>

        {/* TAB 1: APPLICATIONS */}
        <TabsContent value="applications">
          <Card className="border-border/60 bg-card/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Agency &amp; Planner Applications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-muted-foreground uppercase bg-muted/30">
                    <tr>
                      <th className="px-4 py-3">Agency / Company</th>
                      <th className="px-4 py-3">Contact Person</th>
                      <th className="px-4 py-3">WhatsApp &amp; Contact</th>
                      <th className="px-4 py-3">City &amp; Portfolio</th>
                      <th className="px-4 py-3">Monthly Events</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {apps.length > 0 ? (
                      apps.map((a) => (
                        <tr key={a.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3 font-semibold text-foreground">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-gold" />
                              <span>{a.company_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-foreground/80">{a.contact_name}</td>
                          <td className="px-4 py-3">
                            <div className="space-y-0.5">
                              <a href={`mailto:${a.email}`} className="text-emerald-400 hover:underline">
                                {a.email}
                              </a>
                              {a.phone && (
                                <div className="flex items-center gap-1">
                                  <a
                                    href={`https://wa.me/${a.phone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-emerald-400 flex items-center gap-1"
                                  >
                                    <Phone className="w-3 h-3 text-emerald-400" /> {a.phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>{a.city || '—'}</div>
                            {a.website_or_social && (
                              <a
                                href={
                                  a.website_or_social.startsWith('http')
                                    ? a.website_or_social
                                    : `https://${a.website_or_social}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-[10px] inline-flex items-center gap-0.5 mt-0.5"
                              >
                                Portfolio <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {a.monthly_events || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                a.status === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                                  : a.status === 'rejected'
                                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {a.status !== 'approved' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={processingId === a.id}
                                  onClick={() => handleAppStatus(a.id, 'approved')}
                                  className="h-7 px-2 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                                </Button>
                              )}
                              {a.status !== 'rejected' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={processingId === a.id}
                                  onClick={() => handleAppStatus(a.id, 'rejected')}
                                  className="h-7 px-2 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 text-xs"
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground text-xs">
                          No agency applications found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: WHOLESALE CREDIT ORDERS */}
        <TabsContent value="orders">
          <Card className="border-border/60 bg-card/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Wholesale Credit Payment Orders</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-muted-foreground uppercase bg-muted/30">
                    <tr>
                      <th className="px-4 py-3">Order Date</th>
                      <th className="px-4 py-3">Agency Name</th>
                      <th className="px-4 py-3">Package / Credits</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Ref &amp; Payment Slip</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {orders.length > 0 ? (
                      orders.map((order) => (
                        <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 font-semibold text-foreground">
                            {order.agency_name}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-gold">+{order.credits_count}</span>{' '}
                            <span className="text-muted-foreground">({order.pack_name})</span>
                          </td>
                          <td className="px-4 py-3 font-bold">
                            PKR {order.amount_pkr.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 capitalize text-muted-foreground">
                            {order.payment_method === 'manual_bank' ? 'Bank Transfer' : 'Safepay'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-semibold text-foreground">
                                {order.transaction_reference || 'N/A'}
                              </span>
                              {order.receipt_url && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setViewingReceiptUrl(order.receipt_url)}
                                  className="h-6 px-1.5 text-[10px] text-primary gap-1"
                                >
                                  View Slip <ExternalLink className="w-2.5 h-2.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                order.status === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                                  : order.status === 'rejected'
                                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {order.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    disabled={processingId === order.id}
                                    onClick={() =>
                                      handleApproveOrder(
                                        order.id,
                                        order.credits_count,
                                        order.agency_name
                                      )
                                    }
                                    className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve &amp; Credit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={processingId === order.id}
                                    onClick={() => handleRejectOrder(order.id)}
                                    className="h-7 px-2 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 text-xs"
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-muted-foreground text-xs">
                          No wholesale credit orders recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: PARTNERS & BALANCES */}
        <TabsContent value="partners">
          <Card className="border-border/60 bg-card/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Active Agency Partners &amp; Balances</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-muted-foreground uppercase bg-muted/30">
                    <tr>
                      <th className="px-4 py-3">Agency Name</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Email &amp; WhatsApp</th>
                      <th className="px-4 py-3">Current Credit Balance</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {approvedAgencies.length > 0 ? (
                      approvedAgencies.map((agency) => (
                        <tr key={agency.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3 font-semibold text-foreground">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-gold" />
                              <span>{agency.company_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-foreground/80">{agency.contact_name}</td>
                          <td className="px-4 py-3">
                            <div>{agency.email}</div>
                            <div className="text-muted-foreground">{agency.phone}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 font-bold text-gold text-sm">
                              <Zap className="w-4 h-4 fill-gold" />
                              <span>{agency.credits_balance ?? 0}</span>
                              <span className="text-[10px] text-muted-foreground font-normal">
                                credits
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setAdjustingAgency(agency)}
                              className="h-7 text-xs border-gold/40 hover:bg-gold/10 gap-1 font-semibold"
                            >
                              <Plus className="w-3 h-3 text-gold" /> Adjust Balance
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground text-xs">
                          No approved agency partners yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: DELETION REQUESTS */}
        <TabsContent value="deletions">
          <Card className="border-border/60 bg-card/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Agency Account Deletion Requests
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Review agency closure requests. Active client invitations remain accessible via links for 3 months (90 days).
                  </p>
                </div>
                <Badge variant="outline" className="text-xs text-amber-400 border-amber-500/30 bg-amber-500/10">
                  Smart Hybrid Safeguard
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-muted-foreground uppercase bg-muted/30">
                    <tr>
                      <th className="px-4 py-3">Agency Name</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">WhatsApp &amp; Email</th>
                      <th className="px-4 py-3">Reason for Deletion</th>
                      <th className="px-4 py-3">Requested On</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {deletionRequests.length > 0 ? (
                      deletionRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3 font-semibold text-foreground">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-gold" />
                              <span>{req.company_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-foreground/80">{req.contact_name}</td>
                          <td className="px-4 py-3">
                            <div>{req.email}</div>
                            {req.phone && (
                              <a
                                href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-emerald-400 flex items-center gap-1 text-[11px]"
                              >
                                <Phone className="w-3 h-3 text-emerald-400" /> {req.phone}
                              </a>
                            )}
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            <span className="text-muted-foreground italic">
                              "{req.deletion_reason || 'No specific reason provided'}"
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {req.deletion_requested_at
                              ? new Date(req.deletion_requested_at).toLocaleDateString()
                              : 'Pending'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                disabled={processingId === req.id}
                                onClick={() => handleApproveDeletion(req.id, req.company_name)}
                                className="h-7 px-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs gap-1"
                              >
                                Approve &amp; Keep Links 3 Mo.
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={processingId === req.id}
                                onClick={() => handleRejectDeletion(req.id)}
                                className="h-7 px-2 text-muted-foreground hover:text-foreground text-xs"
                              >
                                Decline
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                          No pending account deletion requests.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* RECEIPT PREVIEW MODAL */}
      {viewingReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-2xl w-full bg-card border border-border rounded-2xl overflow-hidden p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <h3 className="font-bold text-sm text-foreground">Payment Slip / Receipt Preview</h3>
              <button
                onClick={() => setViewingReceiptUrl(null)}
                className="p-1 hover:bg-muted rounded-full"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-black/40 rounded-xl p-2">
              <img
                src={viewingReceiptUrl}
                alt="Bank Transfer Receipt"
                className="max-h-[65vh] object-contain rounded-lg"
              />
            </div>
            <div className="flex justify-end pt-2">
              <a
                href={viewingReceiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                Open Original in New Tab <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL ADJUST CREDITS MODAL */}
      {adjustingAgency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-md w-full bg-card border border-border rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-foreground">
                Adjust Credits: {adjustingAgency.company_name}
              </h3>
              <button
                onClick={() => setAdjustingAgency(null)}
                className="p-1 hover:bg-muted rounded-full"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Current Balance:{' '}
              <strong className="text-foreground">{adjustingAgency.credits_balance ?? 0} Credits</strong>
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Credits Adjustment (e.g. +5 or -2)
              </label>
              <Input
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(Number(e.target.value))}
                className="font-bold text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Reason / Audit Note</label>
              <Input
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. Bank IBFT verified manually, promotional grant"
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAdjustingAgency(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isAdjusting}
                onClick={handleConfirmAdjustment}
                className="bg-primary hover:bg-primary-light text-slate-950 font-black text-xs px-5"
              >
                {isAdjusting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Adjustment'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
