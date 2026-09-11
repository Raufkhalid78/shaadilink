import { requireAdmin } from '@/lib/auth-helpers';
import { createServiceClient } from '@/lib/supabase/server';
import { AdminAgencyClient } from './admin-agency-client';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Agency & Partner Management | Admin',
};

export default async function AdminAgencyPage() {
  await requireAdmin();

  const supabase = createServiceClient();

  const [appsRes, ordersRes] = await Promise.all([
    supabase
      .from('agency_applications')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('agency_credit_orders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(
        (res) => res,
        () => ({ data: [] })
      ),
  ]);

  return (
    <div className="space-y-6">
      <AdminAgencyClient
        applications={appsRes.data || []}
        creditOrders={ordersRes.data || []}
      />
    </div>
  );
}
