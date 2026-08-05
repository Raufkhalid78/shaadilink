import { getAffiliateData } from './actions';
import { redirect } from 'next/navigation';
import { AffiliateDashboardClient } from './affiliate-client';

export const metadata = {
  title: 'Affiliate Dashboard | ShaadiLink',
  description: 'Manage your ShaadiLink affiliate account, view earnings, and generate your referral code.',
};

export default async function AffiliateDashboardPage() {
  const data = await getAffiliateData();

  if (data.error === 'Unauthorized') {
    redirect('/login');
  }

  if (data.error === 'Not an approved affiliate' || !data.application) {
    redirect('/affiliate');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">Affiliate Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {data.application.name}. Manage your referral code and view your earnings.
        </p>
      </div>

      <AffiliateDashboardClient 
        application={data.application}
        referralCode={data.referralCode}
        commissions={data.commissions}
        stats={data.stats!}
      />
    </div>
  );
}
