'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Copy, TrendingUp, DollarSign, Wallet, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { updatePayoutDetails, generateReferralCode } from './actions';

interface AffiliateDashboardClientProps {
  application: any;
  referralCode: any;
  commissions: any[];
  stats: {
    totalEarnings: number;
    pendingPayout: number;
    totalSales: number;
  };
}

export function AffiliateDashboardClient({
  application,
  referralCode,
  commissions,
  stats
}: AffiliateDashboardClientProps) {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleUpdatePayout = async (formData: FormData) => {
    setLoading(true);
    const res = await updatePayoutDetails(formData);
    setLoading(false);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Payout details updated!');
    }
  };

  const handleGenerateCode = async () => {
    setGenerating(true);
    const res = await generateReferralCode();
    setGenerating(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Referral code generated successfully!');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-emerald/5 border-emerald/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                <h3 className="text-2xl font-bold font-display mt-1 text-emerald-dark">
                  Rs {stats.totalEarnings.toLocaleString()}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-dark" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gold/5 border-gold/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payout</p>
                <h3 className="text-2xl font-bold font-display mt-1 text-gold">
                  Rs {stats.pendingPayout.toLocaleString()}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-gold" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sales Generated</p>
                <h3 className="text-2xl font-bold font-display mt-1 text-foreground">
                  {stats.totalSales}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Code & Payout Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Referral Code Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Code</CardTitle>
              <CardDescription>
                Share this code with your audience to give them 10% off and earn your 10% commission.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {referralCode ? (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CheckCircle2 className="h-4 w-4 text-emerald" />
                    </div>
                    <Input 
                      readOnly 
                      value={referralCode.code} 
                      className="pl-9 font-mono text-lg font-bold tracking-widest bg-muted/50 text-emerald-dark border-emerald/20 h-14" 
                    />
                  </div>
                  <Button 
                    className="w-full gap-2" 
                    onClick={() => copyToClipboard(referralCode.code)}
                  >
                    <Copy className="w-4 h-4" /> Copy Code
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <TicketIcon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">You don't have a referral code yet.</p>
                  <Button 
                    onClick={handleGenerateCode} 
                    disabled={generating}
                    className="bg-gold hover:bg-gold-light text-emerald-dark"
                  >
                    {generating ? 'Generating...' : 'Generate My Code'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payout Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Payout Settings</CardTitle>
              <CardDescription>
                How would you like to receive your commissions? (e.g., Bank Account, JazzCash, EasyPaisa)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleUpdatePayout} className="space-y-4">
                <Textarea 
                  name="payout_details"
                  placeholder="Example:
Bank: Meezan Bank
Title: Ali Khan
IBAN: PK12MEZN000123456789"
                  defaultValue={application.payout_details || ''}
                  className="min-h-[120px] font-mono text-sm"
                  required
                />
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Saving...' : 'Save Payout Details'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Earnings History */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Commission History</CardTitle>
              <CardDescription>
                A record of all the sales you have generated.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Date</th>
                      <th className="px-4 py-3">Code Used</th>
                      <th className="px-4 py-3 text-right">Commission</th>
                      <th className="px-4 py-3 rounded-tr-lg text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {commissions.length ? (
                      commissions.map((c) => (
                        <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3 font-medium text-foreground" suppressHydrationWarning>
                            {new Date(c.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 font-mono">{c.referral_code}</td>
                          <td className="px-4 py-3 text-right font-semibold text-emerald-dark">
                            Rs {Number(c.commission_amount).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                              ${c.status === 'paid' ? 'bg-emerald/10 text-emerald' : 
                                c.status === 'cleared' ? 'bg-blue-500/10 text-blue-500' : 
                                'bg-gold/10 text-gold-dark'}`}
                            >
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                          No sales generated yet. Share your code to get started!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

function TicketIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}
