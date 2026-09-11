import { getAgencyPortalData } from './actions';
import { redirect } from 'next/navigation';
import { AgencyDashboardClient } from './agency-dashboard-client';
import { BrandLogo } from '@/components/brand-logo';
import { Clock, Phone, ArrowLeft, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getDynamicBankDetails } from '@/lib/bank-details-server';
import { CONTACT_CONFIG } from '@/lib/config';

export const metadata = {
  title: 'Agency & Event Planner Portal | Smart Invites',
  description: 'Wholesale event activation credits, white-label branding, and client invoice generation for approved event agencies.',
};

export default async function AgencyDashboardPage() {
  const [result, bankDetails] = await Promise.all([
    getAgencyPortalData(),
    getDynamicBankDetails(),
  ]);

  // Extract clean Admin WhatsApp / Support Phone number
  const rawAdminPhone = (
    bankDetails.whatsappSupport ||
    bankDetails.contactPhone ||
    CONTACT_CONFIG.rawPhoneNumber ||
    '447517879333'
  ).replace(/[^0-9]/g, '');

  const displayAdminPhone = bankDetails.contactPhone || `+${rawAdminPhone}`;

  if ('error' in result) {
    if (result.error === 'Unauthorized') {
      redirect('/login?redirect=/dashboard/agency');
    }

    if (result.error === 'No application found') {
      redirect('/agency');
    }

    if (result.error === 'Not approved' && result.application) {
      const app = result.application;

      if (app.status === 'pending') {
        const expediteMessage = `Hi Smart Invites Team, I submitted an Agency Partner application for "${app.company_name}" (Contact: ${app.contact_name}, Email: ${app.email}). Could you please review and expedite our account verification?`;
        const adminWaUrl = `https://wa.me/${rawAdminPhone}?text=${encodeURIComponent(expediteMessage)}`;

        return (
          <div className="min-h-screen bg-background flex flex-col">
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                  </Link>
                  <div className="w-px h-4 bg-border hidden sm:block" />
                  <BrandLogo size="sm" href="/" />
                </div>
              </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-4">
              <div className="p-8 sm:p-12 text-center border border-border/60 rounded-3xl bg-card shadow-xl max-w-xl mx-auto space-y-6">
                <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
                  <Clock className="w-8 h-8 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20">
                    Application Pending Review
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground pt-2">
                    {app.company_name}
                  </h1>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Thank you for applying, <span className="font-semibold text-foreground">{app.contact_name}</span>! Your Agency &amp; Event Planner application is currently being reviewed by our partner team.
                  </p>
                </div>

                {/* Submitted Agency Contact Details */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs text-left space-y-2 text-foreground/80">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1.5 flex items-center justify-between">
                    <span>Your Submitted Application</span>
                    <span className="text-amber-500 font-semibold lowercase tracking-normal">under review</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company:</span>
                    <span className="font-semibold text-foreground">{app.company_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact Person:</span>
                    <span className="font-semibold text-foreground">{app.contact_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your Email:</span>
                    <span className="font-semibold text-foreground">{app.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your Phone / WhatsApp:</span>
                    <span className="font-semibold text-foreground">{app.phone}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-border/40">
                    <span className="text-muted-foreground">Target Review Time:</span>
                    <span className="font-bold text-gold">Within 24 Hours</span>
                  </div>
                </div>

                {/* Connect with Admin WhatsApp */}
                <div className="space-y-2 pt-1">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={adminWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto"
                    >
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-2 shadow-md">
                        <Phone className="w-3.5 h-3.5" /> Expedite with Admin on WhatsApp
                      </Button>
                    </a>
                    <Link href="/dashboard" className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full text-xs">
                        Return to Dashboard
                      </Button>
                    </Link>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Direct chat with Smart Invites Admin &amp; Partner Verification Team ({displayAdminPhone})
                  </p>
                </div>
              </div>
            </main>
          </div>
        );
      }

      // If rejected
      const rejectContactMessage = `Hi Smart Invites Support, I am contacting you regarding my Agency Partner application for "${app.company_name}" (Email: ${app.email}).`;
      const rejectAdminWaUrl = `https://wa.me/${rawAdminPhone}?text=${encodeURIComponent(rejectContactMessage)}`;

      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
          <div className="p-8 text-center border border-border/60 rounded-3xl bg-card shadow-xl max-w-md mx-auto space-y-4">
            <h1 className="text-xl font-bold text-foreground">Application Status</h1>
            <p className="text-xs text-muted-foreground">
              Your application could not be approved at this time. Please contact our admin support team if you have questions.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={rejectAdminWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-2 shadow-md">
                  <Phone className="w-3.5 h-3.5" /> Contact Admin on WhatsApp
                </Button>
              </a>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full text-xs">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    redirect('/agency');
  }

  const { data } = result;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-medium">Dashboard</span>
              </Link>
              <div className="w-px h-4 bg-border hidden sm:block" />
              <BrandLogo size="sm" href="/" />
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-foreground leading-none">
                  {data.application.company_name}
                </span>
                <span className="text-[11px] text-gold leading-none mt-1">
                  Wholesale Partner
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Agency Cockpit */}
      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl">
          <AgencyDashboardClient initialData={data} />
        </div>
      </main>
    </div>
  );
}
