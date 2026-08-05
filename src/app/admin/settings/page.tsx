import { createClient, createServiceClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { SettingsManager } from '@/components/admin/settings-manager';

export const dynamic = 'force-dynamic';

export default async function AdminSettings() {
  const supabase = createServiceClient();
  const { data: settings } = await supabase.from('site_settings').select('*').limit(1).single();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">System Settings</h1>
        <p className="text-muted-foreground text-sm">Manage global application settings and configuration.</p>
      </div>

      <Card className="border-border/50 bg-card/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5"/> General Settings</CardTitle>
          <CardDescription>Configure basic site preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsManager initialSettings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
