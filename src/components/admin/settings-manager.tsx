'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';
import { updateSettings } from '@/app/admin/settings/actions';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function SettingsManager({ initialSettings }: { initialSettings: any }) {
  const [loading, setLoading] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(!!initialSettings?.maintenance_mode);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.set('maintenance_mode', maintenanceMode.toString());
    
    const res = await updateSettings(formData);
    setLoading(false);

    if (res.error) {
      toast.error('Failed to save settings: ' + res.error);
    } else {
      toast.success('Settings saved successfully');
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Admin Notification Email</Label>
        <Input 
          name="admin_email" 
          defaultValue={initialSettings?.admin_email || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@shaadilink.com"} 
          required 
          className="bg-background" 
        />
        <p className="text-xs text-muted-foreground">Emails for new orders and reviews will be sent here.</p>
      </div>

      <div className="space-y-2">
        <Label>Maintenance Mode</Label>
        <div className="flex items-center gap-3 pt-2">
          <Switch 
            checked={maintenanceMode}
            onCheckedChange={setMaintenanceMode}
          />
          <span className="text-sm text-muted-foreground">
            {maintenanceMode ? 'Enabled (Site is hidden from public)' : 'Currently Disabled (Site is live)'}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-border/50 flex justify-end">
        <Button type="submit" disabled={loading} className="gap-2 bg-emerald hover:bg-emerald/90">
          <Save className="w-4 h-4"/> {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
}
