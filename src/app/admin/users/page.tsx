import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/auth-helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { UserManager } from '@/components/admin/user-manager';

export const dynamic = 'force-dynamic';

export default async function AdminUsers() {
  await requireAdmin();

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  const users = data?.users || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">Registered Users</h1>
        <p className="text-muted-foreground text-sm">View all registered user accounts on ShaadiLink.</p>
      </div>

      <Card className="border-border/50 bg-card/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5"/> Users List</CardTitle>
        </CardHeader>
        <CardContent>
          <UserManager users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
