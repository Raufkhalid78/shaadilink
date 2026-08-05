import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';
import { CouponManager } from '@/components/admin/coupon-manager';

export const dynamic = 'force-dynamic';

export default async function AdminCoupons() {
  const supabase = await createClient();
  const { data: coupons } = await supabase.from('referral_codes').select('*').order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">Coupon Management</h1>
        <p className="text-muted-foreground text-sm">View and manage promo codes and coupons.</p>
      </div>

      <Card className="border-border/50 bg-card/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShoppingBag className="w-5 h-5"/> Referral / Promo Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <CouponManager coupons={coupons || []} />
        </CardContent>
      </Card>
    </div>
  );
}
