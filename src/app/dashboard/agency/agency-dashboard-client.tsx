'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Crown,
  Sparkles,
  CreditCard,
  Building2,
  Users,
  FileText,
  CheckCircle2,
  Copy,
  ExternalLink,
  Plus,
  Download,
  Shield,
  Palette,
  Eye,
  Check,
  Phone,
  Globe,
  Instagram,
  X,
  Clock,
  Send,
  Zap,
  RotateCcw,
  Loader2,
  Upload,
  AlertCircle,
  HelpCircle,
  Trash2,
  ShieldAlert,
  Search,
  QrCode,
  FileSpreadsheet,
  Edit,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, ScrollableTabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import {
  AgencyPortalData,
  WholesaleCreditPack,
  WHOLESALE_CREDIT_PACKS,
  AgencyCreditOrder,
  AgencyInvitationSummary,
} from '@/lib/agency';
import {
  submitAgencyCreditOrder,
  updateAgencyBranding,
  updateAgencyProfile,
  activateInvitationWithAgencyCredit,
  instantDeleteAgencyAccount,
  requestAgencyAccountDeletion,
} from './actions';
import { OFFICIAL_BANK_DETAILS } from '@/lib/bank-details';

function formatDisplayDate(dateStr?: string | null): string {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

interface Props {
  initialData: AgencyPortalData;
}

export function AgencyDashboardClient({ initialData }: Props) {
  const [data, setData] = useState<AgencyPortalData>(initialData);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<WholesaleCreditPack>(WHOLESALE_CREDIT_PACKS[1]); // Default to Growth 10
  const [paymentMethod, setPaymentMethod] = useState<'manual_bank' | 'safepay'>('manual_bank');
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Client Events Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'draft'>('all');

  // Agency Profile State
  const [profileForm, setProfileForm] = useState({
    companyName: data.application.company_name,
    contactName: data.application.contact_name,
    phone: data.application.phone,
    city: data.application.city || '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Branding Form State
  const [brandingForm, setBrandingForm] = useState({
    whiteLabelEnabled: data.application.white_label_enabled,
    agencyLogoUrl: data.application.agency_logo_url || '',
    tagline: data.application.tagline || '',
    instagramHandle: data.application.instagram_handle || '',
    websiteUrl: data.application.website_url || '',
    accentColor: data.application.accent_color || '#C9A84C',
  });
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  // Invoicing Form State
  const [invoiceClientName, setInvoiceClientName] = useState(
    data.invitations[0]
      ? `${data.invitations[0].partner1_name} & ${data.invitations[0].partner2_name}`
      : 'Valued Wedding Client'
  );
  const [invoiceClientPhone, setInvoiceClientPhone] = useState('+92 300 1234567');
  const [invoiceAmount, setInvoiceAmount] = useState<number>(25000);
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [invoiceNotes, setInvoiceNotes] = useState(
    'Payment via Bank Transfer (Meezan Bank / Raast). Thank you for entrusting us with your celebration!'
  );

  // Credit Activation State
  const [activatingId, setActivatingId] = useState<string | null>(null);

  // Deletion State
  const [isInstantDeleteOpen, setIsInstantDeleteOpen] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isRequestDeleteOpen, setIsRequestDeleteOpen] = useState(false);
  const [deletionReasonInput, setDeletionReasonInput] = useState('');
  const [isSubmittingDeleteRequest, setIsSubmittingDeleteRequest] = useState(false);

  const activeInvitationsCount = data.invitations.filter((i) => i.is_active).length;

  // Handle Safepay URL query callbacks on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const creditsAdded = params.get('creditsAdded');
    const pack = params.get('pack');
    const paymentError = params.get('paymentError');
    const payment = params.get('payment');

    if (creditsAdded) {
      toast.success(
        `🎉 Payment Successful! +${creditsAdded} Wholesale Credits added to your agency wallet.`
      );
      // Clean up URL parameters without refreshing
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentError) {
      toast.error(`Payment failed: ${paymentError}`);
      window.history.replaceState({}, '', window.location.pathname);
    } else if (payment === 'cancelled') {
      toast.info('Card payment was cancelled.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Handle Instant Deletion (0 active weddings)
  const handleInstantDelete = async () => {
    if (deleteConfirmInput.trim().toUpperCase() !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion');
      return;
    }

    setIsDeletingAccount(true);
    try {
      const res = await instantDeleteAgencyAccount();
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('Your agency account has been permanently deleted.');
      window.location.href = '/';
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Handle Deletion Request (active weddings exist)
  const handleRequestDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDeleteRequest(true);
    try {
      const res = await requestAgencyAccountDeletion(deletionReasonInput);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(
        'Account deletion request submitted. Active client links remain protected for 3 months.'
      );
      setIsRequestDeleteOpen(false);
      setData((prev) => ({
        ...prev,
        application: {
          ...prev.application,
          deletion_requested: true,
          deletion_requested_at: new Date().toISOString(),
          deletion_reason: deletionReasonInput,
        },
      }));
    } catch {
      toast.error('Failed to submit deletion request');
    } finally {
      setIsSubmittingDeleteRequest(false);
    }
  };

  // 1-Click Activate Draft with 1 Wholesale Credit
  const handleActivateWithCredit = async (invitationId: string) => {
    if (data.application.credits_balance < 1) {
      toast.error('Insufficient credits! Please top up your wholesale wallet first.');
      setIsTopUpOpen(true);
      return;
    }

    setActivatingId(invitationId);
    try {
      const res = await activateInvitationWithAgencyCredit(invitationId);
      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success('🎉 Client event activated and published successfully! 1 Credit deducted.');
      setData((prev) => ({
        ...prev,
        application: {
          ...prev.application,
          credits_balance: res.remainingCredits ?? prev.application.credits_balance - 1,
        },
        invitations: prev.invitations.map((inv) =>
          inv.id === invitationId
            ? { ...inv, is_active: true, client_approval_status: 'approved' }
            : inv
        ),
      }));
    } catch {
      toast.error('Failed to activate invitation with credit');
    } finally {
      setActivatingId(null);
    }
  };

  // Upload Payment Receipt Slip
  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingReceipt(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadRes = await res.json();
      if (!res.ok) throw new Error(uploadRes.error || 'Failed to upload receipt');
      setReceiptUrl(uploadRes.url);
      toast.success('Payment receipt uploaded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Error uploading receipt');
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  // Submit Credit Order (Safepay Card or Manual Bank Transfer)
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'manual_bank' && !transactionRef.trim()) {
      toast.error('Please enter the Bank Transaction Reference / TID');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      // 1. If Safepay Online Card Checkout
      if (paymentMethod === 'safepay') {
        const res = await fetch('/api/agency/credits/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packId: selectedPack.id }),
        });

        const initiateData = await res.json();
        if (!res.ok || initiateData.error) {
          toast.error(initiateData.error || 'Failed to initiate card checkout');
          return;
        }

        if (initiateData.checkoutUrl) {
          toast.info('Redirecting to secure Safepay checkout...');
          window.location.href = initiateData.checkoutUrl;
          return;
        }
      }

      // 2. If Manual Bank Transfer / Raast
      const res = await submitAgencyCreditOrder({
        packId: selectedPack.id,
        paymentMethod,
        transactionReference: transactionRef,
        receiptUrl,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      if (res.order) {
        setData((prev) => ({
          ...prev,
          creditOrders: [res.order, ...prev.creditOrders],
        }));
      }

      toast.success(
        `🎉 Order for ${selectedPack.credits} Wholesale Credits submitted! Admin will verify and activate your credits promptly.`
      );
      setIsTopUpOpen(false);
      setTransactionRef('');
      setReceiptUrl('');
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Save Agency Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await updateAgencyProfile(profileForm);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('✨ Agency profile updated successfully!');
      setData((prev) => ({
        ...prev,
        application: {
          ...prev.application,
          company_name: profileForm.companyName,
          contact_name: profileForm.contactName,
          phone: profileForm.phone,
          city: profileForm.city,
        },
      }));
    } catch {
      toast.error('Failed to update agency profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Save White-Label Branding
  const handleSaveBranding = async () => {
    setIsSavingBranding(true);
    try {
      const res = await updateAgencyBranding(brandingForm);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success('✨ Agency white-label branding updated successfully!');
      setData((prev) => ({
        ...prev,
        application: {
          ...prev.application,
          ...brandingForm,
        },
      }));
    } catch {
      toast.error('Failed to save branding');
    } finally {
      setIsSavingBranding(false);
    }
  };

  // Export Client Roster to CSV
  const handleExportCSV = () => {
    if (!data.invitations || data.invitations.length === 0) {
      toast.error('No client invitations to export');
      return;
    }
    const headers = [
      'Client / Couple',
      'Event Slug',
      'Status',
      'Review Token',
      'Review Views',
      'Created Date',
    ];
    const rows = data.invitations.map((inv) => [
      `"${inv.partner1_name} & ${inv.partner2_name}"`,
      `"${inv.slug || inv.id}"`,
      inv.is_active ? 'Live' : 'Draft',
      `"${inv.review_token || 'N/A'}"`,
      `${inv.review_views_count || 0}/7`,
      `"${formatDisplayDate(inv.created_at)}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${data.application.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-clients.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Client roster exported to CSV successfully!');
  };

  // Copy Review Link with 8-char Token
  const handleCopyReviewLink = (inv: AgencyInvitationSummary) => {
    if (!inv.review_token) {
      toast.info('No review token active for this event yet.');
      return;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const reviewUrl = `${origin}/inv/${inv.slug || inv.id}?token=${inv.review_token}`;
    navigator.clipboard.writeText(reviewUrl);
    toast.success(`Copied 7-View Review Link! (${inv.review_views_count ?? 0}/7 views used)`);
  };

  // Generate Branded PDF Invoice
  const handleGeneratePDFInvoice = () => {
    try {
      const doc = new jsPDF();
      const primaryColor = brandingForm.accentColor || '#C9A84C';

      // Header Background Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 45, 'F');

      // Agency Name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(data.application.company_name.toUpperCase(), 14, 22);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 200, 200);
      doc.text(brandingForm.tagline || 'Bespoke Luxury Events & Digital Invitations', 14, 30);
      doc.text(
        `Contact: ${data.application.phone} | ${data.application.email}`,
        14,
        37
      );

      // Invoice Title & Meta
      doc.setTextColor(primaryColor);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', 196, 22, { align: 'right' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(255, 255, 255);
      doc.text(`#${invoiceNumber}`, 196, 30, { align: 'right' });
      doc.text(
        `Date: ${formatDisplayDate(new Date().toISOString())}`,
        196,
        37,
        { align: 'right' }
      );

      // Billed To Section
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('BILLED TO:', 14, 60);

      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.text(invoiceClientName, 14, 68);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Phone: ${invoiceClientPhone}`, 14, 75);

      // Table Header
      doc.setFillColor(245, 247, 250);
      doc.rect(14, 90, 182, 10, 'F');
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('ITEM DESCRIPTION', 18, 96.5);
      doc.text('QTY', 140, 96.5);
      doc.text('AMOUNT (PKR)', 192, 96.5, { align: 'right' });

      // Table Row
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 30, 30);
      doc.text(
        `Digital Wedding Invitation Suite (${data.application.company_name} White-Label)`,
        18,
        110
      );
      doc.text('1', 142, 110);
      doc.text(invoiceAmount.toLocaleString(), 192, 110, { align: 'right' });

      // Separator line
      doc.setDrawColor(220, 225, 230);
      doc.line(14, 120, 196, 120);

      // Total Box
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('TOTAL DUE:', 140, 132);
      doc.setTextColor(15, 23, 42);
      doc.text(`PKR ${invoiceAmount.toLocaleString()}`, 192, 132, { align: 'right' });

      // Notes & Payment Instructions
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('PAYMENT INSTRUCTIONS & NOTES:', 14, 155);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const splitNotes = doc.splitTextToSize(invoiceNotes, 182);
      doc.text(splitNotes, 14, 163);

      // Footer
      doc.setDrawColor(220, 225, 230);
      doc.line(14, 265, 196, 265);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(140, 140, 140);
      doc.text(
        `Thank you for celebrating with ${data.application.company_name}!`,
        105,
        273,
        { align: 'center' }
      );
      doc.text(
        `Powered by Smart Invites Platform Infrastructure`,
        105,
        279,
        { align: 'center' }
      );

      doc.save(`${invoiceNumber}-${invoiceClientName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`);
      toast.success(`Invoice #${invoiceNumber} downloaded successfully!`);
    } catch (err) {
      console.error('Failed to generate PDF invoice:', err);
      toast.error('Error generating invoice PDF');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  // Filter invitations by search query & status
  const filteredInvitations = data.invitations.filter((inv) => {
    const coupleName = `${inv.partner1_name} ${inv.partner2_name}`.toLowerCase();
    const title = (inv.title || '').toLowerCase();
    const slug = (inv.slug || '').toLowerCase();
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch = !q || coupleName.includes(q) || title.includes(q) || slug.includes(q);
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'live' && inv.is_active) ||
      (filterStatus === 'draft' && !inv.is_active);

    return matchesSearch && matchesStatus;
  });

  const liveCount = data.invitations.filter((i) => i.is_active).length;
  const draftCount = data.invitations.filter((i) => !i.is_active).length;

  return (
    <div className="space-y-8">
      {/* Top Banner / Agency Cockpit Header */}
      <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-card via-card/90 to-gold/5 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gold/15 text-gold border border-gold/30">
                <Crown className="w-3.5 h-3.5" /> Verified Agency Partner
              </span>
              <span className="text-xs text-muted-foreground">ID: {data.application.id.slice(0, 8)}</span>
            </div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
              {data.application.company_name}
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              {brandingForm.tagline ||
                'Manage your wholesale credits, white-label client invitations, and billing in one unified portal.'}
            </p>
          </div>

          {/* Credits Summary Card & CTAs */}
          <div className="flex flex-wrap items-center gap-3 bg-background/80 backdrop-blur-md p-4 rounded-2xl border border-border/80 shadow-md">
            <div className="space-y-0.5 pr-4 border-r border-border/80">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Wholesale Balance
              </p>
              <div className="flex items-center gap-1.5">
                <Zap className="w-5 h-5 text-gold fill-gold" />
                <span className="text-2xl font-black text-foreground">
                  {data.application.credits_balance}
                </span>
                <span className="text-xs text-muted-foreground">Credits</span>
              </div>
            </div>

            <Button
              onClick={() => setIsTopUpOpen(true)}
              className="bg-primary hover:bg-primary-light text-slate-950 font-black gap-2 shadow-lg shadow-primary/20 px-5"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Top-Up Credits
            </Button>

            <Link href="/templates?agency=true">
              <Button
                variant="outline"
                className="border-gold/40 hover:bg-gold/10 text-foreground font-bold gap-1.5 text-xs shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-gold" /> Create Client Invite
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs defaultValue="projects" className="w-full space-y-6">
        <ScrollableTabsList variant="gold" className="p-1">
          <TabsTrigger value="projects" className="gap-2">
            <Users className="w-4 h-4" /> Client Projects ({data.invitations.length})
          </TabsTrigger>
          <TabsTrigger value="wallet" className="gap-2">
            <CreditCard className="w-4 h-4" /> Wholesale Wallet
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2">
            <Palette className="w-4 h-4" /> Studio &amp; Profile
          </TabsTrigger>
          <TabsTrigger value="invoicing" className="gap-2">
            <FileText className="w-4 h-4" /> Client PDF Invoicing
          </TabsTrigger>
        </ScrollableTabsList>

        {/* ----------------- TAB 1: CLIENT PROJECTS & INVITATIONS ----------------- */}
        <TabsContent value="projects" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                Client Event Roster{' '}
                <Badge variant="secondary" className="text-xs">
                  {filteredInvitations.length} {filteredInvitations.length === 1 ? 'Event' : 'Events'}
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                Manage invitations, test review links, activate drafts with credits, and open QR scanners.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="text-xs gap-1.5 border-border/80 hover:border-gold/50"
                title="Export all client events to CSV spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Export CSV
              </Button>

              <Link href="/templates?agency=true">
                <Button className="bg-primary hover:bg-primary-light text-slate-950 font-black gap-2 shadow-md text-xs">
                  <Plus className="w-4 h-4 stroke-[3]" /> Create New Client Invitation
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar & Filter Chips */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client or couple name, event slug..."
                className="pl-9 bg-card/60 border-border/70 text-xs h-10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
              <Button
                size="sm"
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className={`text-xs h-9 ${
                  filterStatus === 'all'
                    ? 'bg-primary text-slate-950 font-bold'
                    : 'text-muted-foreground'
                }`}
              >
                All ({data.invitations.length})
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'live' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('live')}
                className={`text-xs h-9 ${
                  filterStatus === 'live'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-muted-foreground'
                }`}
              >
                Live ({liveCount})
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'draft' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('draft')}
                className={`text-xs h-9 ${
                  filterStatus === 'draft'
                    ? 'bg-amber-600 text-slate-950 font-bold'
                    : 'text-muted-foreground'
                }`}
              >
                Drafts ({draftCount})
              </Button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredInvitations.length > 0 ? (
              filteredInvitations.map((inv) => (
                <Card
                  key={inv.id}
                  className="flex flex-col justify-between border border-border/70 bg-card/60 hover:border-gold/50 transition-all shadow-sm rounded-2xl"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge
                        variant="outline"
                        className={
                          inv.is_active
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] font-bold'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px] font-bold'
                        }
                      >
                        {inv.is_active ? 'Live & Published' : 'Draft / Unpaid'}
                      </Badge>

                      <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                        {inv.template_id?.split('-')[0] || 'Royal'}
                      </Badge>
                    </div>

                    <CardTitle className="text-base font-bold text-foreground pt-2 line-clamp-1">
                      {inv.partner1_name} &amp; {inv.partner2_name}
                    </CardTitle>
                    <CardDescription className="text-xs truncate">
                      Slug: /{inv.slug || inv.id.slice(0, 8)}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium text-foreground" suppressHydrationWarning>
                          {formatDisplayDate(inv.created_at)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Client Review Link:</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold font-bold">
                          {inv.review_views_count ?? 0}/7 Views Used
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      {/* If Draft, show 1-click credit activation */}
                      {!inv.is_active && (
                        <Button
                          onClick={() => handleActivateWithCredit(inv.id)}
                          disabled={activatingId === inv.id}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-md"
                        >
                          {activatingId === inv.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Activating...
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 fill-white" /> Activate with 1 Credit
                            </>
                          )}
                        </Button>
                      )}

                      {/* If Live, show quick live preview and QR gate scanner link */}
                      {inv.is_active && (
                        <div className="grid grid-cols-2 gap-2">
                          <Link href={`/inv/${inv.slug || inv.id}`} target="_blank">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full text-xs gap-1 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> View Live
                            </Button>
                          </Link>
                          <Link href={`/scan?invitationId=${inv.id}`} target="_blank">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full text-xs gap-1 border-border hover:border-gold/40"
                              title="Open QR scanner for this event"
                            >
                              <QrCode className="w-3.5 h-3.5 text-gold" /> QR Scanner
                            </Button>
                          </Link>
                        </div>
                      )}

                      {/* Review Link & Edit Buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyReviewLink(inv)}
                          className="flex-1 text-xs gap-1 border-gold/40 hover:bg-gold/10 text-foreground"
                          title="Copy secure review token link (7-view limit)"
                        >
                          <Eye className="w-3.5 h-3.5 text-gold" /> Review Link
                        </Button>

                        <Link href={`/create?edit=${inv.id}&agency=true`} className="flex-1">
                          <Button size="sm" variant="secondary" className="w-full text-xs gap-1">
                            <Edit className="w-3 h-3" /> Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 border border-dashed border-border/60 rounded-2xl p-8 bg-card/20">
                <Building2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="text-base font-bold text-foreground">
                  {searchQuery ? 'No matching client events found' : 'No client invitations yet'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  {searchQuery
                    ? `No events matching "${searchQuery}". Try clearing your search.`
                    : 'Create your first client wedding or event invitation using wholesale agency credits.'}
                </p>
                {searchQuery ? (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery('')}
                    className="mt-4 text-xs"
                  >
                    Clear Search
                  </Button>
                ) : (
                  <Link href="/templates?agency=true" className="inline-block mt-4">
                    <Button className="bg-primary hover:bg-primary-light text-slate-950 font-black text-xs">
                      Choose Template &amp; Create
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ----------------- TAB 2: WHOLESALE WALLET ----------------- */}
        <TabsContent value="wallet" className="space-y-8">
          {/* Wholesale Pricing Packs */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-display font-bold text-foreground">Wholesale Credit Packs</h2>
              <p className="text-xs text-muted-foreground">
                Purchase wholesale credits to publish client events at discounted agency rates. Instant activation via Safepay Card or Direct IBFT/Raast.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {WHOLESALE_CREDIT_PACKS.map((pack) => (
                <Card
                  key={pack.id}
                  className={`relative flex flex-col justify-between border transition-all ${
                    pack.popular
                      ? 'border-gold bg-card shadow-lg shadow-gold/10 ring-1 ring-gold/40'
                      : 'border-border/60 bg-card/50 hover:border-border'
                  }`}
                >
                  {pack.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                      Most Popular for Agencies
                    </span>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-bold text-foreground">{pack.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {pack.credits} Event Activations
                        </CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-xs font-bold"
                      >
                        Save {pack.savingsPercent}%
                      </Badge>
                    </div>
                    <div className="pt-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-muted-foreground">PKR</span>
                        <span className="text-3xl font-black text-foreground">
                          {pack.pricePKR.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Only PKR {pack.pricePerInvite.toLocaleString()} / invitation
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-2 pt-3 border-t border-border/50 text-xs">
                      {pack.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-foreground/80">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => {
                        setSelectedPack(pack);
                        setIsTopUpOpen(true);
                      }}
                      className={`w-full font-bold text-xs ${
                        pack.popular
                          ? 'bg-primary hover:bg-primary-light text-slate-950 font-black shadow-md'
                          : 'bg-muted hover:bg-muted/80 text-foreground'
                      }`}
                    >
                      Buy {pack.credits} Credits (PKR {pack.pricePKR.toLocaleString()})
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Credit Purchase History Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Credit Top-Up Order History</h3>

            <div className="border border-border/70 rounded-2xl overflow-hidden bg-card/40 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider border-b border-border/60">
                    <tr>
                      <th className="px-4 py-3">Order Date</th>
                      <th className="px-4 py-3">Package</th>
                      <th className="px-4 py-3">Credits</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Payment Method</th>
                      <th className="px-4 py-3">Reference / Receipt</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {data.creditOrders.length > 0 ? (
                      data.creditOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground" suppressHydrationWarning>
                            {formatDisplayDate(order.created_at)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-foreground">
                            {order.pack_name}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-gold">+{order.credits_count}</span>
                          </td>
                          <td className="px-4 py-3 font-medium">
                            PKR {order.amount_pkr.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 capitalize text-muted-foreground">
                            {order.payment_method === 'manual_bank' ? 'Bank Transfer / Raast' : 'Safepay Card'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] text-foreground/80">
                                {order.transaction_reference || order.safepay_tracker?.slice(0, 10) || 'N/A'}
                              </span>
                              {order.receipt_url && (
                                <a
                                  href={order.receipt_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline text-[11px] inline-flex items-center gap-0.5"
                                >
                                  Slip <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                order.status === 'approved' || order.status === 'completed'
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                                  : order.status === 'rejected'
                                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                              }`}
                            >
                              {order.status === 'approved' || order.status === 'completed'
                                ? 'Completed & Credited'
                                : order.status === 'rejected'
                                ? 'Rejected'
                                : 'Pending Verification'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground text-xs">
                          No wholesale credit orders placed yet. Choose a pack above to top up your balance.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ----------------- TAB 3: STUDIO & PROFILE ----------------- */}
        <TabsContent value="branding" className="space-y-6">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">Studio &amp; Agency Profile</h2>
            <p className="text-xs text-muted-foreground">
              Configure your business contact details and how your agency is branded on your clients' wedding invitations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Column */}
            <div className="space-y-6">
              {/* Agency Business Profile */}
              <Card className="border-border/60 bg-card/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Agency Business Details</CardTitle>
                  <CardDescription className="text-xs">
                    Your official company name and contact info registered with Smart Invites.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Company / Agency Name</label>
                      <Input
                        value={profileForm.companyName}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, companyName: e.target.value })
                        }
                        placeholder="e.g. Royal Wedding Planners"
                        className="text-xs"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-semibold text-foreground">Primary Contact Person</label>
                        <Input
                          value={profileForm.contactName}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, contactName: e.target.value })
                          }
                          placeholder="e.g. Ali Khan"
                          className="text-xs"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-semibold text-foreground">WhatsApp / Phone</label>
                        <Input
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, phone: e.target.value })
                          }
                          placeholder="00923001234567"
                          className="text-xs font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Operating City / Region</label>
                      <Input
                        value={profileForm.city}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, city: e.target.value })
                        }
                        placeholder="e.g. Lahore, Karachi, Islamabad"
                        className="text-xs"
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={isSavingProfile}
                        className="w-full bg-primary hover:bg-primary-light text-slate-950 font-black text-xs gap-2"
                      >
                        {isSavingProfile ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <SaveIcon className="w-3.5 h-3.5" />
                        )}
                        Save Business Details
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* White-Label Visual Profile */}
              <Card className="border-border/60 bg-card/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-bold">White-Label Footer Customization</CardTitle>
                  <CardDescription className="text-xs">
                    Your clients and their guests will see this branding on invitation footers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Agency Tagline / Slogan</label>
                    <Input
                      value={brandingForm.tagline}
                      onChange={(e) => setBrandingForm({ ...brandingForm, tagline: e.target.value })}
                      placeholder="e.g. Bespoke Luxury Weddings & Celebrations"
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Instagram Handle</label>
                      <Input
                        value={brandingForm.instagramHandle}
                        onChange={(e) =>
                          setBrandingForm({ ...brandingForm, instagramHandle: e.target.value })
                        }
                        placeholder="@youragency.pk"
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Website / Portfolio</label>
                      <Input
                        value={brandingForm.websiteUrl}
                        onChange={(e) =>
                          setBrandingForm({ ...brandingForm, websiteUrl: e.target.value })
                        }
                        placeholder="https://youragency.com"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Accent Brand Color (Hex)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={brandingForm.accentColor}
                        onChange={(e) =>
                          setBrandingForm({ ...brandingForm, accentColor: e.target.value })
                        }
                        className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                      />
                      <Input
                        value={brandingForm.accentColor}
                        onChange={(e) =>
                          setBrandingForm({ ...brandingForm, accentColor: e.target.value })
                        }
                        placeholder="#C9A84C"
                        className="font-mono text-xs max-w-[150px]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={handleSaveBranding}
                      disabled={isSavingBranding}
                      className="w-full bg-primary hover:bg-primary-light text-slate-950 font-black text-xs gap-2"
                    >
                      {isSavingBranding ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <SaveIcon className="w-3.5 h-3.5" />
                      )}
                      Save Branding Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Preview Card */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground">Live Client Invitation Footer Preview</h3>
              <div className="p-6 rounded-2xl border border-border/80 bg-background/90 text-center space-y-3 shadow-inner sticky top-24">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
                  Curated with Excellence by
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border shadow-sm">
                  <Building2
                    className="w-4 h-4"
                    style={{ color: brandingForm.accentColor || '#C9A84C' }}
                  />
                  <span className="font-display font-bold text-sm text-foreground">
                    {profileForm.companyName || data.application.company_name}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  "{brandingForm.tagline || 'Bespoke Celebrations'}"
                </p>
                <div className="flex items-center justify-center gap-4 text-xs pt-1 text-muted-foreground">
                  <span>📞 {profileForm.phone || data.application.phone}</span>
                  {brandingForm.instagramHandle && <span>📷 {brandingForm.instagramHandle}</span>}
                </div>
                <div className="pt-3 border-t border-border/40 text-[10px] text-muted-foreground/60">
                  Powered by Smart Invites Platform Infrastructure
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ----------------- TAB 4: CLIENT INVOICING ----------------- */}
        <TabsContent value="invoicing" className="space-y-6">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">Client PDF Invoice Generator</h2>
            <p className="text-xs text-muted-foreground">
              Generate branded, luxury PDF invoices to bill your clients directly for digital invitations and event services.
            </p>
          </div>

          <Card className="border-border/60 bg-card/60 max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold">Generate Client Invoice</CardTitle>
              <CardDescription className="text-xs">
                Fill in the details below to download a ready-to-send PDF invoice with your agency letterhead.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Client Name / Event Title</label>
                  <Input
                    value={invoiceClientName}
                    onChange={(e) => setInvoiceClientName(e.target.value)}
                    placeholder="e.g. Ahmed & Fatima Wedding"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Client Phone Number</label>
                  <Input
                    value={invoiceClientPhone}
                    onChange={(e) => setInvoiceClientPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Invoice Number</label>
                  <Input
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Package Fee (PKR)</label>
                  <Input
                    type="number"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                    className="font-bold text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Payment Notes &amp; Bank Instructions</label>
                <Textarea
                  rows={3}
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  className="text-xs"
                />
              </div>

              <Button
                onClick={handleGeneratePDFInvoice}
                className="w-full bg-primary hover:bg-primary-light text-slate-950 font-black text-xs gap-2 shadow-md mt-2"
              >
                <Download className="w-4 h-4 stroke-[2.5]" /> Download Branded PDF Invoice
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ================= DANGER ZONE: ACCOUNT DELETION ================= */}
      <Card className="border border-rose-500/30 bg-rose-500/5 shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="pb-3 border-b border-rose-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <CardTitle className="text-base font-bold text-foreground">
                Danger Zone: Agency Account Deletion
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] uppercase font-bold text-rose-400 border-rose-500/30 bg-rose-500/10"
            >
              Irreversible Action
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Manage agency account closure and client wedding invitation retention settings.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {data.application.deletion_requested ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Clock className="w-4 h-4 animate-spin" /> Deletion Request Pending Review
              </div>
              <p className="text-xs text-foreground/80">
                You have requested complete account deletion for <strong>{data.application.company_name}</strong>.
              </p>
              <div className="p-3 rounded-xl bg-background/60 border border-border/60 text-[11px] text-muted-foreground space-y-1">
                <p>
                  🛡️ <strong>Client Protection Active:</strong> Your {activeInvitationsCount} active client wedding invitation(s) remain live and accessible to wedding guests via their links for <strong>3 months (90 days)</strong>.
                </p>
                <p>
                  After 90 days, all client records and wedding media will be automatically and permanently removed from our storage systems.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">Active Client Events:</span>
                  <Badge className="bg-muted text-foreground text-[10px] font-bold">
                    {activeInvitationsCount} Live Wedding{activeInvitationsCount === 1 ? '' : 's'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {activeInvitationsCount === 0
                    ? 'You currently have 0 active client wedding invitations published. You may immediately and permanently delete your agency account with 1-click confirmation.'
                    : `You have ${activeInvitationsCount} active client wedding(s) published. Under our Smart Hybrid policy, invitations will remain accessible to wedding guests via their links for 3 months (90 days) before automatic permanent purge.`}
                </p>
              </div>

              {activeInvitationsCount === 0 ? (
                <Button
                  onClick={() => setIsInstantDeleteOpen(true)}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs gap-1.5 shadow-md shrink-0"
                >
                  <Trash2 className="w-4 h-4" /> Delete Agency Account
                </Button>
              ) : (
                <Button
                  onClick={() => setIsRequestDeleteOpen(true)}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs gap-1.5 shadow-md shrink-0"
                >
                  <Clock className="w-4 h-4" /> Request Account Deletion
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ================= MODAL: INSTANT ACCOUNT DELETION (0 Live Weddings) ================= */}
      {isInstantDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-card border border-rose-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-rose-500">
                <Trash2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-foreground">Permanently Delete Account</h3>
              </div>
              <button
                onClick={() => setIsInstantDeleteOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              This action is permanent and cannot be undone. All your draft invitations, credit history, agency profile, and login credentials will be permanently erased immediately.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Type <span className="font-mono text-rose-500 font-bold">DELETE</span> to confirm:
              </label>
              <Input
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder="DELETE"
                className="font-mono text-center uppercase tracking-widest text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsInstantDeleteOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInstantDelete}
                disabled={isDeletingAccount || deleteConfirmInput.trim().toUpperCase() !== 'DELETE'}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs gap-1.5 shadow-md"
              >
                {isDeletingAccount ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Confirm Deletion
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: REQUEST DELETION (Active Weddings Exist) ================= */}
      {isRequestDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-card border border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-amber-500">
                <Clock className="w-5 h-5" />
                <h3 className="text-base font-bold text-foreground">Request Account Deletion</h3>
              </div>
              <button
                onClick={() => setIsRequestDeleteOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 space-y-1.5">
              <p className="font-bold text-amber-400">🛡️ 3-Month Guest Link Protection</p>
              <p>
                Because you have {activeInvitationsCount} active client wedding(s), your account cannot be purged immediately. Your active wedding links will remain live for guests for <strong>90 days</strong>, after which they will be permanently cleaned up.
              </p>
            </div>

            <form onSubmit={handleRequestDeletion} className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Reason for account closure (Optional):
                </label>
                <Textarea
                  rows={3}
                  value={deletionReasonInput}
                  onChange={(e) => setDeletionReasonInput(e.target.value)}
                  placeholder="e.g. Business closing, transitioning to other software, etc."
                  className="text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRequestDeleteOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingDeleteRequest}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs gap-1.5 shadow-md"
                >
                  {isSubmittingDeleteRequest ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Submit Deletion Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TOP-UP WHOLESALE CREDITS ================= */}
      {isTopUpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold font-display text-foreground">
                  Top-Up Wholesale Credits
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select a pack and choose your preferred payment method.
                </p>
              </div>
              <button
                onClick={() => setIsTopUpOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pack Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">1. Select Credit Pack</label>
              <div className="grid grid-cols-3 gap-2">
                {WHOLESALE_CREDIT_PACKS.map((pack) => (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => setSelectedPack(pack)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedPack.id === pack.id
                        ? 'border-gold bg-gold/10 ring-1 ring-gold shadow-sm'
                        : 'border-border/60 hover:border-border bg-muted/20'
                    }`}
                  >
                    <p className="text-xs font-bold text-foreground">{pack.name}</p>
                    <p className="text-sm font-black text-gold mt-1">
                      {pack.credits} Credits
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      PKR {pack.pricePKR.toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">2. Select Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('manual_bank')}
                  className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                    paymentMethod === 'manual_bank'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500'
                      : 'border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Building2 className="w-4 h-4" /> Direct Bank / Raast
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('safepay')}
                  className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                    paymentMethod === 'safepay'
                      ? 'border-gold bg-gold/10 text-gold ring-1 ring-gold'
                      : 'border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Card / Safepay
                </button>
              </div>
            </div>

            {/* Bank Transfer Instructions */}
            {paymentMethod === 'manual_bank' ? (
              <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-border/60">
                  <span className="font-bold text-foreground">Official Bank Details (IBFT)</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                    Zero Extra Fees
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Bank Name:</span>
                    <span className="font-bold text-foreground">{OFFICIAL_BANK_DETAILS.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Account Title:</span>
                    <span className="font-bold text-foreground">{OFFICIAL_BANK_DETAILS.accountTitle}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Account Number:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-foreground">{OFFICIAL_BANK_DETAILS.accountNumber}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(OFFICIAL_BANK_DETAILS.accountNumber, 'Account Number')}
                        className="p-1 hover:bg-muted rounded text-gold"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">IBAN:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-foreground">{OFFICIAL_BANK_DETAILS.iban}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(OFFICIAL_BANK_DETAILS.iban, 'IBAN')}
                        className="p-1 hover:bg-muted rounded text-gold"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {OFFICIAL_BANK_DETAILS.raastId && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Raast ID:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-foreground">{OFFICIAL_BANK_DETAILS.raastId}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(OFFICIAL_BANK_DETAILS.raastId, 'Raast ID')}
                          className="p-1 hover:bg-muted rounded text-gold"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Fields for Reference & Slip */}
                <div className="space-y-3 pt-3 border-t border-border/60">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">
                      Transaction Reference / TID <span className="text-rose-400">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. 202609121289"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">
                      Payment Slip / Screenshot (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleReceiptUpload}
                        disabled={isUploadingReceipt}
                        className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-primary file:text-slate-950 file:font-bold"
                      />
                      {isUploadingReceipt && <Loader2 className="w-4 h-4 animate-spin text-gold" />}
                    </div>
                    {receiptUrl && (
                      <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                        <Check className="w-3 h-3" /> Slip attached successfully
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-muted/40 border border-border/80 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CreditCard className="w-4 h-4" /> Instant Online Card Checkout
                </div>
                <p className="text-muted-foreground">
                  You will be redirected to Safepay&apos;s secure checkout to pay{' '}
                  <strong className="text-foreground">PKR {selectedPack.pricePKR.toLocaleString()}</strong> using
                  your Visa, Mastercard, or PayPak card. Upon successful payment, your wholesale credits will be added to your wallet automatically.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTopUpOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleOrderSubmit}
                disabled={isSubmittingOrder || isUploadingReceipt}
                className="bg-primary hover:bg-primary-light text-slate-950 font-black text-xs gap-1.5 shadow-md px-6"
              >
                {isSubmittingOrder ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />{' '}
                    {paymentMethod === 'safepay' ? 'Redirecting to Safepay...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    {paymentMethod === 'safepay'
                      ? `Pay with Card & Add ${selectedPack.credits} Credits (PKR ${selectedPack.pricePKR.toLocaleString()})`
                      : `Confirm & Place Order (PKR ${selectedPack.pricePKR.toLocaleString()})`}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}
