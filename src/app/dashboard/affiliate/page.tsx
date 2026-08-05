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

  if (data.application && data.application.status === 'pending') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">Affiliate Dashboard</h1>
        </div>
        <div className="p-12 text-center border border-border/50 rounded-2xl bg-card shadow-sm max-w-2xl mx-auto mt-10">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h2 className="text-2xl font-bold font-display text-foreground">Application Pending</h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">
            Your affiliate application is currently under review by our team. We'll notify you via email once it's approved. Thank you for your patience!
          </p>
        </div>
      </div>
    );
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
        commissions={data.commissions || []}
        stats={data.stats!}
      />
    </div>
  );
}
