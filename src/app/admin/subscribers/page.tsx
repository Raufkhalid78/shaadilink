import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mailbox } from 'lucide-react';
import { SubscriberManager } from '@/components/admin/subscriber-manager';

export const dynamic = 'force-dynamic';

export default async function AdminSubscribers() {
  const supabase = await createClient();
  const { data: subscribers } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">Subscribers Management</h1>
        <p className="text-muted-foreground text-sm">View and manage newsletter subscribers.</p>
      </div>

      <Card className="border-border/50 bg-card/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mailbox className="w-5 h-5"/> Newsletter Subscribers</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriberManager subscribers={subscribers || []} />
        </CardContent>
      </Card>
    </div>
  );
}
