import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingBag, MessageSquare, CreditCard } from 'lucide-react';
import { RevenueChart, OrdersChart } from '@/components/admin/revenue-chart-wrapper';

export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const supabase = await createClient();

  // Fetch basic stats
  const [
    { count: invCount },
    { count: reviewsCount },
    { count: pendingReviewsCount },
    { count: ordersCount }
  ] = await Promise.all([
    supabase.from('invitations').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_approved', false),
    supabase.from('orders').select('*', { count: 'exact', head: true })
  ]);

  const stats = [
    { title: "Total Invitations", value: invCount || 0, icon: Users, color: "text-blue-500" },
    { title: "Total Reviews", value: reviewsCount || 0, icon: MessageSquare, color: "text-emerald-500" },
    { title: "Pending Reviews", value: pendingReviewsCount || 0, icon: MessageSquare, color: "text-amber-500" },
    { title: "Total Orders", value: ordersCount || 0, icon: ShoppingBag, color: "text-purple-500" },
  ];

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('created_at, amount, status')
    .order('created_at', { ascending: false })
    .limit(100);

  // Group by day for the last 7 days
  const revenueData: { name: string; total: number }[] = [];
  const ordersData: { name: string; total: number }[] = [];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayName = days[date.getDay()];
    
    // Sum revenue for this day (only paid)
    const dayRevenue = (recentOrders || [])
      .filter(o => {
        const d = new Date(o.created_at);
        return o.status === 'paid' && d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      })
      .reduce((sum, order) => sum + (Number(order.amount) || 0), 0);
      
    // Count orders for this day (all statuses)
    const dayOrders = (recentOrders || [])
      .filter(o => {
        const d = new Date(o.created_at);
        return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      }).length;

    revenueData.push({ name: dayName, total: dayRevenue });
    ordersData.push({ name: dayName, total: dayOrders });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm">Welcome to the ShaadiLink Admin Portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/50 bg-card/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {pendingReviewsCount && pendingReviewsCount > 0 ? (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500 flex items-center gap-3">
          <MessageSquare className="w-5 h-5" />
          <span>You have <strong>{pendingReviewsCount}</strong> pending review(s) waiting for approval.</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/30">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersChart data={ordersData} />
          </CardContent>
        </Card>
        
        <Card className="border-border/50 bg-card/30">
          <CardHeader>
            <CardTitle>Recent Revenue (Paid)</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
