'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Save,
  Building2,
  CreditCard,
  Crown,
  Sparkles,
  Check,
  Copy,
  Smartphone,
  MessageCircle,
  ShieldCheck,
  Info,
  Globe,
  Mail,
  Phone,
  MapPin,
  Eye,
  Lock,
} from 'lucide-react';
import { updateSettings } from '@/app/admin/settings/actions';
import { toast } from 'sonner';

interface SettingsManagerProps {
  initialSettings: any;
}

export function SettingsManager({ initialSettings }: SettingsManagerProps) {
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form State for reactive Live Preview
  const [bankName, setBankName] = useState(
    initialSettings?.bank_name || initialSettings?.bankName || 'Meezan Bank Ltd'
  );
  const [accountTitle, setAccountTitle] = useState(
    initialSettings?.account_title || initialSettings?.accountTitle || 'Smart Invites Pvt Ltd'
  );
  const [accountNumber, setAccountNumber] = useState(
    initialSettings?.account_number || initialSettings?.accountNumber || '02010108923412'
  );
  const [iban, setIban] = useState(
    initialSettings?.iban || initialSettings?.iban || 'PK45MEZN0002010108923412'
  );
  const [branchCode, setBranchCode] = useState(
    initialSettings?.branch_code ?? initialSettings?.branchCode ?? ''
  );
  const [raastId, setRaastId] = useState(
    initialSettings?.raast_id ?? initialSettings?.raastId ?? ''
  );
  const [easyPaisa, setEasyPaisa] = useState(
    initialSettings?.easypaisa_account ?? initialSettings?.easyPaisaAccount ?? ''
  );
  const [jazzCash, setJazzCash] = useState(
    initialSettings?.jazzcash_account ?? initialSettings?.jazzCashAccount ?? ''
  );
  const [whatsappSupport, setWhatsappSupport] = useState(
    initialSettings?.whatsapp_support || initialSettings?.whatsappSupport || '923001234567'
  );
  const [instructionsEnglish, setInstructionsEnglish] = useState(
    initialSettings?.instructions_english ||
      initialSettings?.instructionsEnglish ||
      'Transfer the exact order amount via your mobile banking app (IBFT) or Raast ID. Upload the payment receipt/screenshot and enter your transaction reference below.'
  );
  const [instructionsUrdu, setInstructionsUrdu] = useState(
    initialSettings?.instructions_urdu ||
      initialSettings?.instructionsUrdu ||
      'براہ کرم اوپر دیے گئے بینک اکاؤنٹ یا راست آئی ڈی پر رقم منتقل کریں اور نیچے رسید/اسکرین شاٹ اپ لوڈ کریں۔'
  );

  // Brand & Site state
  const [siteName, setSiteName] = useState(
    initialSettings?.site_name || initialSettings?.siteName || 'Smart Invites'
  );
  const [contactEmail, setContactEmail] = useState(
    initialSettings?.contact_email || initialSettings?.contactEmail || 'support@smartinvites.com.pk'
  );
  const [contactPhone, setContactPhone] = useState(
    initialSettings?.contact_phone || initialSettings?.contactPhone || '+92 300 1234567'
  );
  const [officeAddress, setOfficeAddress] = useState(
    initialSettings?.office_address || initialSettings?.officeAddress || 'Lahore & Karachi, Pakistan'
  );

  // Pricing State (Platform strictly has two plans: Classic and Royal)
  const [classicPrice, setClassicPrice] = useState(
    Number(initialSettings?.classic_price || initialSettings?.classicPrice) || 3499
  );
  const [royalPrice, setRoyalPrice] = useState(
    Number(initialSettings?.royal_price || initialSettings?.royalPrice) || 5799
  );

  // System State
  const [adminEmail, setAdminEmail] = useState(
    initialSettings?.admin_email ||
      initialSettings?.adminEmail ||
      process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
      'admin@smartinvites.com.pk'
  );
  const [maintenanceMode, setMaintenanceMode] = useState(
    !!(initialSettings?.maintenance_mode || initialSettings?.maintenanceMode)
  );

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.set('admin_email', adminEmail);
    formData.set('maintenance_mode', maintenanceMode.toString());

    // Bank Details
    formData.set('bank_name', bankName);
    formData.set('account_title', accountTitle);
    formData.set('account_number', accountNumber);
    formData.set('iban', iban);
    formData.set('branch_code', branchCode);
    formData.set('raast_id', raastId);
    formData.set('easypaisa_account', easyPaisa);
    formData.set('jazzcash_account', jazzCash);
    formData.set('whatsapp_support', whatsappSupport);
    formData.set('instructions_english', instructionsEnglish);
    formData.set('instructions_urdu', instructionsUrdu);

    // Brand Details
    formData.set('site_name', siteName);
    formData.set('contact_email', contactEmail);
    formData.set('contact_phone', contactPhone);
    formData.set('office_address', officeAddress);

    // Pricing Details
    formData.set('classic_price', classicPrice.toString());
    formData.set('royal_price', royalPrice.toString());

    try {
      const res = await updateSettings(formData);
      setLoading(false);

      if (res?.error) {
        toast.error('Failed to save settings: ' + res.error);
      } else {
        toast.success('All settings and bank details saved successfully!');
      }
    } catch (err: any) {
      setLoading(false);
      toast.error('Error saving settings: ' + (err.message || 'Unknown error'));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Tabs defaultValue="bank" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full bg-card/60 border border-border/50 p-1 rounded-2xl h-auto gap-1">
          <TabsTrigger
            value="bank"
            className="data-[state=active]:bg-gold data-[state=active]:text-emerald-dark font-semibold py-2.5 rounded-xl gap-2 text-xs sm:text-sm"
          >
            <Building2 className="w-4 h-4" />
            <span>Bank &amp; Payments</span>
          </TabsTrigger>
          <TabsTrigger
            value="pricing"
            className="data-[state=active]:bg-gold data-[state=active]:text-emerald-dark font-semibold py-2.5 rounded-xl gap-2 text-xs sm:text-sm"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pricing (2 Plans)</span>
          </TabsTrigger>
          <TabsTrigger
            value="brand"
            className="data-[state=active]:bg-gold data-[state=active]:text-emerald-dark font-semibold py-2.5 rounded-xl gap-2 text-xs sm:text-sm"
          >
            <Globe className="w-4 h-4" />
            <span>Brand &amp; Contact</span>
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="data-[state=active]:bg-gold data-[state=active]:text-emerald-dark font-semibold py-2.5 rounded-xl gap-2 text-xs sm:text-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>System &amp; Access</span>
          </TabsTrigger>
        </TabsList>

        {/* ================= TAB 1: BANK & PAYMENTS ================= */}
        <TabsContent value="bank" className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-gold/10 border border-gold/30">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gold" />
                Manual Bank Transfer &amp; Pakistani Instant Payment Config
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                These details appear directly to guests on the checkout page when choosing &ldquo;Manual Bank Transfer / Raast / EasyPaisa&rdquo;.
              </p>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs shrink-0 self-start sm:self-center">
              Active in Checkout
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Form Input Fields */}
            <div className="lg:col-span-7 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bank_name" className="text-xs font-semibold">
                    Bank Name *
                  </Label>
                  <Input
                    id="bank_name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Meezan Bank Ltd, HBL, Bank Alfalah"
                    className="bg-card/50 border-border/50 text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="account_title" className="text-xs font-semibold">
                    Account Title / Beneficiary Name *
                  </Label>
                  <Input
                    id="account_title"
                    value={accountTitle}
                    onChange={(e) => setAccountTitle(e.target.value)}
                    placeholder="e.g. Smart Invites Pvt Ltd or Your Name"
                    className="bg-card/50 border-border/50 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="account_number" className="text-xs font-semibold">
                    Account Number *
                  </Label>
                  <Input
                    id="account_number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 02010108923412"
                    className="bg-card/50 border-border/50 font-mono text-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="branch_code" className="text-xs font-semibold">
                    Branch Code (Optional)
                  </Label>
                  <Input
                    id="branch_code"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    placeholder="e.g. 0201"
                    className="bg-card/50 border-border/50 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="iban" className="text-xs font-semibold">
                  IBAN (International Bank Account Number) *
                </Label>
                <Input
                  id="iban"
                  value={iban}
                  onChange={(e) => setIban(e.target.value.toUpperCase())}
                  placeholder="e.g. PK45MEZN0002010108923412"
                  className="bg-card/50 border-border/50 font-mono text-sm uppercase tracking-wider"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Format: PK + 2 check digits + 4 bank letters + 16 account digits (24 characters total).
                </p>
              </div>

              {/* Instant Wallets: Raast, EasyPaisa, JazzCash */}
              <div className="p-4 rounded-2xl bg-card/40 border border-border/50 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Instant Pakistani Wallets &amp; Raast P2P
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="raast_id" className="text-[11px] font-semibold text-muted-foreground">
                      Raast ID (Mobile / IBAN)
                    </Label>
                    <Input
                      id="raast_id"
                      value={raastId}
                      onChange={(e) => setRaastId(e.target.value)}
                      placeholder="03001234567"
                      className="bg-background/80 border-border/50 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="easypaisa" className="text-[11px] font-semibold text-muted-foreground">
                      EasyPaisa Account
                    </Label>
                    <Input
                      id="easypaisa"
                      value={easyPaisa}
                      onChange={(e) => setEasyPaisa(e.target.value)}
                      placeholder="03001234567"
                      className="bg-background/80 border-border/50 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="jazzcash" className="text-[11px] font-semibold text-muted-foreground">
                      JazzCash Account
                    </Label>
                    <Input
                      id="jazzcash"
                      value={jazzCash}
                      onChange={(e) => setJazzCash(e.target.value)}
                      placeholder="03001234567"
                      className="bg-background/80 border-border/50 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp Support Number */}
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp_support" className="text-xs font-semibold flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  WhatsApp Verification Support Number *
                </Label>
                <Input
                  id="whatsapp_support"
                  value={whatsappSupport}
                  onChange={(e) => setWhatsappSupport(e.target.value)}
                  placeholder="e.g. 923001234567 (with country code, no + or dashes)"
                  className="bg-card/50 border-border/50 font-mono text-sm"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Customers click the &ldquo;Notify on WhatsApp&rdquo; button after transferring to send their slip directly to this WhatsApp number.
                </p>
              </div>

              {/* Instructions in English & Urdu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="instructions_english" className="text-xs font-semibold">
                    Payment Instructions (English)
                  </Label>
                  <Textarea
                    id="instructions_english"
                    value={instructionsEnglish}
                    onChange={(e) => setInstructionsEnglish(e.target.value)}
                    rows={3}
                    className="bg-card/50 border-border/50 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="instructions_urdu" className="text-xs font-semibold text-right block">
                    Payment Instructions (اردو ہدایات)
                  </Label>
                  <Textarea
                    id="instructions_urdu"
                    value={instructionsUrdu}
                    onChange={(e) => setInstructionsUrdu(e.target.value)}
                    rows={3}
                    dir="rtl"
                    className="bg-card/50 border-border/50 text-xs font-arabic"
                  />
                </div>
              </div>
            </div>

            {/* Right: Live Customer Checkout Preview Card */}
            <div className="lg:col-span-5 sticky top-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold">
                  <Eye className="w-4 h-4 text-gold" />
                  Live Customer Checkout Preview
                </div>
                <Badge variant="outline" className="text-[10px] border-gold/40 text-gold bg-gold/5">
                  Updates in Real-Time
                </Badge>
              </div>

              {/* Simulated Customer Payment Box */}
              <div className="rounded-3xl border border-gold/40 bg-gradient-to-br from-card via-card/90 to-background/90 p-5 shadow-2xl backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">{bankName || 'Official Bank Transfer'}</div>
                      <div className="text-[11px] text-muted-foreground">{accountTitle || 'Account Title'}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Instant IBFT
                  </span>
                </div>

                {/* Bank Fields for Guest */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-background/60 border border-border/40">
                    <div>
                      <div className="text-[10px] text-muted-foreground font-medium">Bank Name</div>
                      <div className="font-bold text-foreground">{bankName || '—'}</div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankName, 'bank')}
                      className="h-7 px-2 text-[10px] text-gold hover:bg-gold/10"
                    >
                      {copiedKey === 'bank' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-background/60 border border-border/40">
                    <div>
                      <div className="text-[10px] text-muted-foreground font-medium">Account Title</div>
                      <div className="font-bold text-foreground">{accountTitle || '—'}</div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(accountTitle, 'title')}
                      className="h-7 px-2 text-[10px] text-gold hover:bg-gold/10"
                    >
                      {copiedKey === 'title' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-background/60 border border-border/40">
                    <div>
                      <div className="text-[10px] text-muted-foreground font-medium">Account Number</div>
                      <div className="font-mono font-bold text-foreground">{accountNumber || '—'}</div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(accountNumber, 'acc')}
                      className="h-7 px-2 text-[10px] text-gold hover:bg-gold/10"
                    >
                      {copiedKey === 'acc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-background/60 border border-border/40">
                    <div className="truncate mr-2">
                      <div className="text-[10px] text-muted-foreground font-medium">IBAN</div>
                      <div className="font-mono font-bold text-gold tracking-wide truncate">{iban || '—'}</div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(iban, 'iban')}
                      className="h-7 px-2 text-[10px] text-gold hover:bg-gold/10 shrink-0"
                    >
                      {copiedKey === 'iban' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>

                  {/* Raast / Wallets chips */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {raastId && (
                      <div className="p-2 rounded-xl bg-background/40 border border-border/40 text-[10px]">
                        <div className="text-muted-foreground">Raast ID:</div>
                        <div className="font-mono font-bold text-foreground truncate">{raastId}</div>
                      </div>
                    )}
                    {easyPaisa && (
                      <div className="p-2 rounded-xl bg-background/40 border border-border/40 text-[10px]">
                        <div className="text-muted-foreground">EasyPaisa:</div>
                        <div className="font-mono font-bold text-emerald-400 truncate">{easyPaisa}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Instructions snippet */}
                <div className="p-3 rounded-xl bg-gold/5 border border-gold/20 text-[11px] text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1 text-gold font-semibold text-[10px] uppercase">
                    <Info className="w-3 h-3" />
                    Customer Instructions
                  </div>
                  <p className="line-clamp-2">{instructionsEnglish}</p>
                </div>

                {/* WhatsApp button preview */}
                <div className="pt-1">
                  <div className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] text-xs font-bold">
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Support: +{whatsappSupport}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ================= TAB 2: PRICING & PLANS (STRICTLY 2 PLANS) ================= */}
        <TabsContent value="pricing" className="space-y-6 pt-4">
          <div className="p-4 rounded-2xl bg-gold/10 border border-gold/30 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gold" />
                Two-Tier Plan Architecture
              </h3>
              <Badge className="bg-gold text-emerald-dark font-extrabold text-xs">
                Strictly 2 Plans
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This platform serves <strong>all event types</strong> (Weddings, Birthdays, School/Convocations, Corporate Summits, and Private Parties) with strictly <strong>two plans</strong>: <strong>Classic</strong> and <strong>Royal</strong>. There is no third plan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PLAN 1: CLASSIC */}
            <div className="rounded-3xl border border-border/60 bg-card/40 p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-border text-xs px-2.5 py-0.5 font-semibold">
                    STARTER TIER
                  </Badge>
                  <span className="text-xs text-muted-foreground">All Events</span>
                </div>

                <div>
                  <h4 className="text-2xl font-bold font-display text-foreground">Classic Plan</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Clean, elegant digital card with door animation, RSVP collection, and essential event features.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="classic_price" className="text-xs font-semibold text-foreground">
                    Base Price (PKR) *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                      Rs.
                    </span>
                    <Input
                      id="classic_price"
                      type="number"
                      value={classicPrice}
                      onChange={(e) => setClassicPrice(Number(e.target.value))}
                      className="pl-11 bg-background font-mono text-base font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-border/40">
                  <div className="text-xs font-bold text-foreground">Included Features:</div>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      All 20 Classic Templates (Weddings, Birthdays, School, Corporate)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      3D Door / Card Opening Animation
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Guest RSVP &amp; Wishes Guestbook Collection
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Live Countdown Timer &amp; Google Maps Navigation
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Unlimited Edits Until Event Concludes
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Background Music &amp; Photo Uploads
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-background/60 border border-border/40 text-[11px] text-muted-foreground text-center">
                Recommended for standard celebrations &amp; intimate gatherings.
              </div>
            </div>

            {/* PLAN 2: ROYAL */}
            <div className="rounded-3xl border border-gold/50 bg-gradient-to-b from-card/80 via-card/40 to-background/90 p-6 space-y-5 flex flex-col justify-between shadow-xl shadow-gold/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <Badge className="bg-gold text-emerald-dark text-xs px-2.5 py-0.5 font-extrabold flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    POPULAR &amp; LUXURY
                  </Badge>
                  <span className="text-xs text-gold font-semibold">Flagship Experience</span>
                </div>

                <div>
                  <h4 className="text-2xl font-bold font-display text-gold">Royal Plan</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Full cinematic experience with luxury door opening, scratch cards, Pakistani Digital Shagun, and VIP Gate Pass Scanner.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="royal_price" className="text-xs font-semibold text-foreground">
                    Base Price (PKR) *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gold">
                      Rs.
                    </span>
                    <Input
                      id="royal_price"
                      type="number"
                      value={royalPrice}
                      onChange={(e) => setRoyalPrice(Number(e.target.value))}
                      className="pl-11 bg-background font-mono text-base font-bold border-gold/40 focus:border-gold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-gold/20">
                  <div className="text-xs font-bold text-gold">Everything in Classic, Plus:</div>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                      <span className="text-foreground font-medium">All 30 Templates</span> (20 Classic + 10 Royal Cinematic)
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                      Cinematic 3D Grand Gates &amp; Velvet Curtain Reveals
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                      Interactive Gold Scratch Card Date Reveal
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                      Pakistani Digital Shagun (EasyPaisa/JazzCash/Bank)
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                      VIP Passes &amp; QR Gatekeeper Scanner Access
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                      Personalized Guest Links &amp; WhatsApp Direct Dispatch
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                      Host Voice Greeting / Audio Note &amp; Live Photo Wall
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gold/10 border border-gold/30 text-[11px] text-gold text-center relative z-10 font-medium">
                The preferred choice for luxury weddings, 50th jubilees, and prestigious convocations.
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ================= TAB 3: BRAND & SITE INFO ================= */}
        <TabsContent value="brand" className="space-y-6 pt-4">
          <div className="p-4 rounded-2xl bg-card/40 border border-border/50 space-y-2">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Globe className="w-4 h-4 text-gold" />
              Website Branding &amp; Public Contact Details
            </h3>
            <p className="text-xs text-muted-foreground">
              Configure your platform brand name, customer support phone, email, and address.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="site_name" className="text-xs font-semibold">
                Platform / Brand Name *
              </Label>
              <Input
                id="site_name"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Smart Invites"
                className="bg-card/50 border-border/50 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact_email" className="text-xs font-semibold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gold" />
                Customer Support Email *
              </Label>
              <Input
                id="contact_email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="support@smartinvites.com.pk"
                className="bg-card/50 border-border/50 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact_phone" className="text-xs font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gold" />
                Helpline Phone Number *
              </Label>
              <Input
                id="contact_phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="bg-card/50 border-border/50 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="office_address" className="text-xs font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gold" />
                Office / Regional Presence
              </Label>
              <Input
                id="office_address"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                placeholder="Lahore & Karachi, Pakistan"
                className="bg-card/50 border-border/50 text-sm"
              />
            </div>
          </div>
        </TabsContent>

        {/* ================= TAB 4: SYSTEM & ACCESS ================= */}
        <TabsContent value="system" className="space-y-6 pt-4">
          <div className="p-4 rounded-2xl bg-card/40 border border-border/50 space-y-2">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gold" />
              Administrative Notifications &amp; Maintenance Mode
            </h3>
            <p className="text-xs text-muted-foreground">
              Manage where order alerts and reviews are delivered, and toggle site-wide maintenance.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5 max-w-lg">
              <Label htmlFor="admin_email" className="text-xs font-semibold">
                Admin Notification Email *
              </Label>
              <Input
                id="admin_email"
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@smartinvites.com.pk"
                className="bg-card/50 border-border/50 text-sm"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Email notifications for new orders, customer reviews, and contact inquiries are sent here.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-card/40 border border-border/50 max-w-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-foreground">Maintenance Mode</div>
                  <div className="text-[11px] text-muted-foreground">
                    When enabled, only administrators can access the site. Public visitors see a maintenance screen.
                  </div>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>

              <div className="text-xs">
                {maintenanceMode ? (
                  <span className="text-destructive font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Maintenance Mode is Currently ON (Public access blocked)
                  </span>
                ) : (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Site is Live &amp; Accepting Orders
                  </span>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Persistent Save Bar */}
      <div className="pt-6 border-t border-border/50 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Changes take effect immediately across customer checkout and public pages.
        </p>
        <Button
          type="submit"
          disabled={loading}
          className="gap-2 bg-gold hover:bg-gold/90 text-emerald-dark font-bold px-6 h-11 rounded-xl shadow-lg shadow-gold/20"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving Settings...' : 'Save All Settings'}
        </Button>
      </div>
    </form>
  );
}
