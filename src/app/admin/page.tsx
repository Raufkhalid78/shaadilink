import { createServiceClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Users,
  ShoppingBag,
  MessageSquare,
  CreditCard,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  Sparkles,
  Camera,
  Heart,
  Cake,
  GraduationCap,
  Briefcase,
  PartyPopper,
  Mailbox,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { RevenueChart, OrdersChart } from '@/components/admin/revenue-chart-wrapper';
import { getDynamicBankDetails } from '@/lib/bank-details-server';

export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const supabase = createServiceClient();

  // Fetch all dashboard data concurrently
  const [
    invResult,
    reviewsCountResult,
    pendingReviewsResult,
    ordersResult,
    rsvpsResult,
    photosResult,
    messagesResult,
    bankDetails,
  ] = await Promise.all([
    supabase
      .from('invitations')
      .select('id, category, is_active, plan, created_at, title, partner1_name, partner2_name, agency_name'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_approved', false),
    supabase
      .from('orders')
      .select(`
        id,
        amount,
        status,
        payment_method,
        created_at,
        plan,
        transaction_ref,
        receipt_url,
        invitations (id, title, partner1_name, partner2_name, category)
      `)
      .order('created_at', { ascending: false })
      .limit(200),
    supabase.from('rsvps').select('*', { count: 'exact', head: true }),
    supabase.from('photos').select('*', { count: 'exact', head: true }),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
    getDynamicBankDetails(),
  ]);

  const invitations = invResult.data || [];
  const orders = ordersResult.data || [];
  const reviewsCount = reviewsCountResult.count || 0;
  const pendingReviewsCount = pendingReviewsResult.count || 0;
  const rsvpsCount = rsvpsResult.count || 0;
  const photosCount = photosResult.count || 0;
  const messagesCount = messagesResult.count || 0;

  // Compute invitation metrics
  const totalInvitations = invitations.length;
  const activeInvitations = invitations.filter((inv) => inv.is_active).length;
  const draftInvitations = totalInvitations - activeInvitations;
  const classicInvitations = invitations.filter((inv) => (inv.plan || '').toLowerCase() === 'classic').length;
  const royalInvitations = invitations.filter((inv) => (inv.plan || '').toLowerCase() === 'royal').length;
  const agencyInvitations = invitations.filter((inv) => !!inv.agency_name).length;

  // Category Breakdown (All-Event Platform)
  const categoryCounts = {
    wedding: invitations.filter((inv) => !inv.category || inv.category.toLowerCase() === 'wedding').length,
    birthday: invitations.filter((inv) => (inv.category || '').toLowerCase() === 'birthday').length,
    school: invitations.filter((inv) => ['school', 'academic', 'convocation'].includes((inv.category || '').toLowerCase())).length,
    meeting: invitations.filter((inv) => ['meeting', 'corporate', 'conference'].includes((inv.category || '').toLowerCase())).length,
    party: invitations.filter((inv) => ['party', 'celebration'].includes((inv.category || '').toLowerCase())).length,
  };

  // Compute order metrics
  const paidOrders = orders.filter((o) => o.status === 'paid');
  const grossRevenue = paidOrders.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  // Manual Bank Transfer orders awaiting review
  const pendingBankOrders = orders.filter(
    (o) =>
      o.status === 'pending' ||
      (o.payment_method === 'manual_bank' && o.status !== 'paid' && o.status !== 'rejected')
  );
  const pendingBankCount = pendingBankOrders.length;

  // 7-Day trend charts
  const revenueData: { name: string; total: number }[] = [];
  const ordersData: { name: string; total: number }[] = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayName = days[date.getDay()];

    const dayRevenue = orders
      .filter((o) => {
        const d = new Date(o.created_at);
        return (
          o.status === 'paid' &&
          d.getDate() === date.getDate() &&
          d.getMonth() === date.getMonth() &&
          d.getFullYear() === date.getFullYear()
        );
      })
      .reduce((sum, order) => sum + (Number(order.amount) || 0), 0);

    const dayOrders = orders.filter((o) => {
      const d = new Date(o.created_at);
      return (
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
      );
    }).length;

    revenueData.push({ name: dayName, total: dayRevenue });
    ordersData.push({ name: dayName, total: dayOrders });
  }

  // Recent 6 orders
  const recentOrdersList = orders.slice(0, 6);

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">
              Platform Overview
            </h1>
            <Badge className="bg-gold text-emerald-dark font-extrabold text-xs">
              Live Production
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Real-time analytics for all events (Weddings, Birthdays, School, Corporate &amp; Parties).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button asChild variant="outline" size="sm" className="border-border/60 hover:border-gold/40 text-xs">
            <Link href="/" target="_blank">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View Live Site
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm" className="border-gold/40 hover:bg-gold/10 text-xs text-gold">
            <Link href="/admin/settings">
              <Building2 className="w-3.5 h-3.5 mr-1.5" /> Bank Config
            </Link>
          </Button>

          <Button asChild size="sm" className="bg-gold hover:bg-gold/90 text-emerald-dark font-bold text-xs">
            <Link href="/admin/orders">
              <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
              Verify Orders {pendingBankCount > 0 && `(${pendingBankCount})`}
            </Link>
          </Button>
        </div>
      </div>

      {/* ALERT BANNER: PENDING BANK TRANSFER ORDERS */}
      {pendingBankCount > 0 && (
        <div className="p-5 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 sm:mt-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Action Required
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              </div>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {pendingBankCount} manual bank transfer {pendingBankCount === 1 ? 'order has' : 'orders have'} submitted payment receipts awaiting your verification.
              </p>
              <p className="text-xs text-muted-foreground">
                Active Bank: <span className="font-semibold text-foreground">{bankDetails.bankName}</span> ({bankDetails.accountTitle})
              </p>
            </div>
          </div>

          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-10 px-4 rounded-xl shrink-0 gap-1.5 shadow-md">
            <Link href="/admin/orders">
              Review Slips &amp; Approve
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      )}

      {/* ALERT BANNER: PENDING REVIEWS */}
      {pendingReviewsCount > 0 && (
        <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-blue-400">
            <MessageSquare className="w-4 h-4" />
            <span>You have <strong>{pendingReviewsCount}</strong> customer review(s) awaiting moderation before appearing publicly.</span>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 text-xs h-8">
            <Link href="/admin/reviews">Moderate Reviews</Link>
          </Button>
        </div>
      )}

      {/* 10 PLATFORM VITALS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 1. Gross Revenue */}
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Revenue
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold font-display text-emerald-400">
              Rs. {grossRevenue.toLocaleString()}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {paidOrders.length} confirmed paid orders
            </p>
          </CardContent>
        </Card>

        {/* 2. Pending Bank Verification */}
        <Card className={`border-border/50 bg-card/40 ${pendingBankCount > 0 ? 'border-amber-500/40 bg-amber-500/5' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Slips
            </CardTitle>
            <Building2 className={`w-4 h-4 ${pendingBankCount > 0 ? 'text-amber-400 animate-pulse' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className={`text-2xl font-bold font-display ${pendingBankCount > 0 ? 'text-amber-400' : 'text-foreground'}`}>
              {pendingBankCount}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {pendingBankCount > 0 ? 'Awaiting verification' : 'All slips verified'}
            </p>
          </CardContent>
        </Card>

        {/* 3. Total Invitations */}
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Invitations
            </CardTitle>
            <Sparkles className="w-4 h-4 text-gold" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold font-display text-foreground">
              {totalInvitations}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              <span className="text-emerald-400 font-semibold">{activeInvitations} active</span> • {draftInvitations} draft
            </p>
          </CardContent>
        </Card>

        {/* 4. Plan Architecture (2 Plans Only) */}
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Plan Tiers (2)
            </CardTitle>
            <CreditCard className="w-4 h-4 text-gold" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-sm font-bold text-foreground flex items-center gap-1.5 mt-1">
              <span className="text-muted-foreground">Classic:</span> {classicInvitations}
              <span className="text-muted-foreground">|</span>
              <span className="text-gold">Royal:</span> {royalInvitations}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              Classic (3,499) vs Royal (5,799)
            </p>
          </CardContent>
        </Card>

        {/* 5. Total RSVPs */}
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Guest RSVPs
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold font-display text-foreground">
              {rsvpsCount}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Attending &amp; declined responses
            </p>
          </CardContent>
        </Card>

        {/* 6. Crowd Photo Snaps */}
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Photo Wall
            </CardTitle>
            <Camera className="w-4 h-4 text-purple-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold font-display text-purple-400">
              {photosCount}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Guest snaps &amp; slideshow photos
            </p>
          </CardContent>
        </Card>

        {/* 7. Agencies */}
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Agency Accounts
            </CardTitle>
            <Briefcase className="w-4 h-4 text-cyan-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold font-display text-cyan-400">
              {agencyInvitations}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              White-label client invitations
            </p>
          </CardContent>
        </Card>

        {/* 8. Customer Reviews */}
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Reviews
            </CardTitle>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold font-display text-foreground">
              {reviewsCount}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {pendingReviewsCount > 0 ? (
                <span className="text-amber-400 font-semibold">{pendingReviewsCount} pending</span>
              ) : (
                'All approved'
              )}
            </p>
          </CardContent>
        </Card>

        {/* 9. Contact Inquiries */}
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Contact Inquiries
            </CardTitle>
            <Mailbox className="w-4 h-4 text-blue-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold font-display text-blue-400">
              {messagesCount}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Contact form submissions
            </p>
          </CardContent>
        </Card>

        {/* 10. Total Orders */}
        <Card className="border-border/50 bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Orders
            </CardTitle>
            <ShoppingBag className="w-4 h-4 text-gold" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold font-display text-gold">
              {orders.length}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Online card &amp; bank transfers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ALL-EVENT CATEGORY BREAKDOWN */}
      <Card className="border-border/50 bg-card/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" />
                All-Event Category Distribution
              </CardTitle>
              <CardDescription className="text-xs">
                Smart Invites supports invitations for every milestone — not just weddings.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-gold/40 text-gold text-xs">
              All Invitations
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-2">
                <Heart className="w-4 h-4" />
              </div>
              <div className="text-xl font-bold font-display text-rose-400">{categoryCounts.wedding}</div>
              <div className="text-[11px] font-semibold text-foreground mt-0.5">Weddings &amp; Nikkah</div>
              <div className="text-[10px] text-muted-foreground">Mehndi, Barat, Walima</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-center">
              <div className="w-8 h-8 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center mx-auto mb-2">
                <Cake className="w-4 h-4" />
              </div>
              <div className="text-xl font-bold font-display text-fuchsia-400">{categoryCounts.birthday}</div>
              <div className="text-[11px] font-semibold text-foreground mt-0.5">Birthdays &amp; Milestones</div>
              <div className="text-[10px] text-muted-foreground">1st, Sweet 16, 50th Gala</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="text-xl font-bold font-display text-amber-400">{categoryCounts.school}</div>
              <div className="text-[11px] font-semibold text-foreground mt-0.5">School &amp; Academic</div>
              <div className="text-[10px] text-muted-foreground">Convocations, Proms, Alumni</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-center">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-2">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="text-xl font-bold font-display text-sky-400">{categoryCounts.meeting}</div>
              <div className="text-[11px] font-semibold text-foreground mt-0.5">Corporate &amp; Summits</div>
              <div className="text-[10px] text-muted-foreground">Conferences, Keynotes, AGMs</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <PartyPopper className="w-4 h-4" />
              </div>
              <div className="text-xl font-bold font-display text-emerald-400">{categoryCounts.party}</div>
              <div className="text-[11px] font-semibold text-foreground mt-0.5">Private Celebrations</div>
              <div className="text-[10px] text-muted-foreground">Dinners, Anniversaries</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/30">
          <CardHeader>
            <CardTitle className="text-base font-bold">7-Day Order Activity</CardTitle>
            <CardDescription className="text-xs">Number of orders created across all channels</CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersChart data={ordersData} />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/30">
          <CardHeader>
            <CardTitle className="text-base font-bold">7-Day Gross Revenue (Paid PKR)</CardTitle>
            <CardDescription className="text-xs">Daily confirmed revenues received via online &amp; verified bank transfers</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>
      </div>

      {/* RECENT ORDERS FEED */}
      <Card className="border-border/50 bg-card/30">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">Recent Orders &amp; Slips</CardTitle>
            <CardDescription className="text-xs">Latest customer checkouts and bank transfer slips</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="text-xs border-border/60">
            <Link href="/admin/orders">
              View All Orders <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent>
          {recentOrdersList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">
              No orders recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {recentOrdersList.map((order: any) => {
                const inv = Array.isArray(order.invitations) ? order.invitations[0] : order.invitations;
                const title = inv?.title || (inv?.partner1_name ? `${inv.partner1_name} & ${inv.partner2_name}` : `Order #${order.id.slice(0, 8)}`);
                const isPaid = order.status === 'paid';
                const isPending = order.status === 'pending';
                const isBank = order.payment_method === 'manual_bank';

                return (
                  <div key={order.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{title}</span>
                        <Badge variant="outline" className="text-[10px] capitalize border-border">
                          {order.plan || 'classic'} plan
                        </Badge>
                        {isBank && (
                          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]">
                            Bank Transfer
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground text-[11px] flex items-center gap-2">
                        <span>#{order.id.slice(0, 12)}</span>
                        <span>•</span>
                        <span>{new Date(order.created_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        {order.transaction_ref && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-foreground">Ref: {order.transaction_ref}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold font-mono text-sm text-foreground">
                          Rs. {(Number(order.amount) || 0).toLocaleString()}
                        </div>
                        <div>
                          {isPaid ? (
                            <span className="text-emerald-400 font-semibold text-[10px] flex items-center gap-1 justify-end">
                              <CheckCircle2 className="w-3 h-3" /> Paid
                            </span>
                          ) : isPending ? (
                            <span className="text-amber-400 font-semibold text-[10px] flex items-center gap-1 justify-end">
                              <Clock className="w-3 h-3 animate-pulse" /> Pending Review
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-[10px] capitalize">
                              {order.status}
                            </span>
                          )}
                        </div>
                      </div>

                      {isPending && (
                        <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] h-8 px-3 rounded-lg">
                          <Link href="/admin/orders">Verify</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
