import { createServiceClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Briefcase } from 'lucide-react';
import { AffiliateManager } from '@/components/admin/affiliate-manager';
import { PayoutManager } from '@/components/admin/payout-manager';
import { AgencyManager } from '@/components/admin/agency-manager';
import { Tabs, TabsContent, ScrollableTabsList, TabsTrigger } from '@/components/ui/tabs';

export const dynamic = 'force-dynamic';

export default async function AdminAffiliates() {
  const supabase = createServiceClient();
  const [
    { data: affiliates },
    { data: commissions },
    { data: agencyApps }
  ] = await Promise.all([
    supabase.from('affiliate_applications').select('*').order('created_at', { ascending: false }),
    supabase.from('affiliate_commissions').select('*').order('created_at', { ascending: false }),
    supabase.from('agency_applications').select('*').order('created_at', { ascending: false }).then(res => res, () => ({ data: [] }))
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">Affiliates & Payouts</h1>
        <p className="text-muted-foreground text-sm">View affiliate program applications and manage payouts.</p>
      </div>

      <Tabs defaultValue="applications" className="w-full">
        <ScrollableTabsList variant="gold" className="mb-4">
          <TabsTrigger value="applications">Affiliate Applications</TabsTrigger>
          <TabsTrigger value="agency">Agency &amp; Planners ({(agencyApps || []).length})</TabsTrigger>
          <TabsTrigger value="payouts">Commissions &amp; Payouts</TabsTrigger>
        </ScrollableTabsList>
        
        <TabsContent value="applications">
          <Card className="border-border/50 bg-card/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5"/> Affiliate Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <AffiliateManager affiliates={affiliates || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agency">
          <Card className="border-border/50 bg-card/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-400" /> Agency &amp; Event Planner Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AgencyManager applications={agencyApps || []} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payouts">
          <Card className="border-border/50 bg-card/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-gold"/> Commission Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <PayoutManager commissions={commissions || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
