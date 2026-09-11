import { createServiceClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { SettingsManager } from '@/components/admin/settings-manager';
import { getDynamicBankDetails } from '@/lib/bank-details-server';

export const dynamic = 'force-dynamic';

export default async function AdminSettings() {
  const supabase = createServiceClient();
  const [{ data: dbSettings }, bankDetails] = await Promise.all([
    supabase.from('site_settings').select('*').limit(1).single(),
    getDynamicBankDetails(),
  ]);

  // Merge DB row with dynamic bank & pricing details
  const mergedSettings = {
    ...dbSettings,
    ...bankDetails,
    classic_price: dbSettings?.classic_price || bankDetails.classicPrice,
    royal_price: dbSettings?.royal_price || bankDetails.royalPrice,
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground text-sm">
          Configure Bank Transfer details, 2-tier pricing, site branding, and maintenance mode.
        </p>
      </div>

      <Card className="border-border/50 bg-card/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gold" />
            Global Platform Configuration
          </CardTitle>
          <CardDescription>
            Manage Pakistani banking gateways, official pricing plans, contact information, and security.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsManager initialSettings={mergedSettings} />
        </CardContent>
      </Card>
    </div>
  );
}
