"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { m } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, CreditCard, Shield, Lock, Crown, Sparkles, Loader2,
  Tag, Percent, CheckCircle2, Globe, Heart, MapPin, Gift, Building2, Copy,
  Upload, Clock, FileText, ExternalLink, Image as ImageIcon, MessageCircle, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { FlowData } from "@/lib/flow-types";
import { planDetails } from "@/lib/flow-types";
import { PageBreadcrumb, BreadcrumbCrumb } from "@/components/ui/page-breadcrumb";
import { OFFICIAL_BANK_DETAILS } from "@/lib/bank-details";

interface PaymentPageProps {
  flowData: FlowData;
  onUpdateData: (updates: Partial<FlowData>) => void;
  onBack: () => void;
  onContinue: () => void;
  crumbs: BreadcrumbCrumb[];
}

export function PaymentPage({ flowData, onUpdateData, onBack, onContinue, crumbs }: PaymentPageProps) {
  // Payment method: 'safepay' | 'manual_bank' | 'agency_credit'
  const [paymentMethod, setPaymentMethod] = useState<"safepay" | "manual_bank" | "agency_credit">("safepay");
  const [processing, setProcessing] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Agency Wholesale status
  const [agencyData, setAgencyData] = useState<{
    isAgency: boolean;
    creditsBalance: number;
    companyName?: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/agency/status")
      .then((res) => res.json())
      .then((data) => {
        if (data?.isAgency && data?.status === "approved") {
          const balance = Number(data.creditsBalance || 0);
          setAgencyData({
            isAgency: true,
            creditsBalance: balance,
            companyName: data.companyName,
          });
          if (balance > 0) {
            setPaymentMethod("agency_credit");
          }
        }
      })
      .catch(() => {});
  }, []);

  // Dynamic Bank Details from Admin Settings
  const [bankDetails, setBankDetails] = useState(OFFICIAL_BANK_DETAILS);

  useEffect(() => {
    fetch("/api/settings/bank-details")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error && (data.bankName || data.bankDetails?.bankName)) {
          const details = data.bankDetails || data;
          setBankDetails((prev) => ({
            ...prev,
            bankName: details.bankName || details.bank_name || prev.bankName,
            accountTitle: details.accountTitle || details.account_title || prev.accountTitle,
            accountNumber: details.accountNumber || details.account_number || prev.accountNumber,
            iban: details.iban || prev.iban,
            branchCode: (details.branchCode ?? details.branch_code ?? '')?.trim(),
            raastId: (details.raastId ?? details.raast_id ?? '')?.trim(),
            easyPaisaAccount: (details.easyPaisaAccount ?? details.easypaisa_account ?? '')?.trim(),
            jazzCashAccount: (details.jazzCashAccount ?? details.jazzcash_account ?? '')?.trim(),
            whatsappSupport: details.whatsappSupport || details.whatsapp_support || prev.whatsappSupport,
            instructionsEnglish: details.instructionsEnglish || details.instructions_english || prev.instructionsEnglish,
            instructionsUrdu: details.instructionsUrdu || details.instructions_urdu || prev.instructionsUrdu,
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Manual Bank Transfer state
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");
  const [senderDetails, setSenderDetails] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [submittedOrderData, setSubmittedOrderData] = useState<{
    orderId: string;
    amount: number;
    transactionRef: string;
    receiptUrl?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const paymentError = searchParams.get("paymentError");

  const plan = planDetails[flowData.selectedPlan || "classic"];
  const templateName =
    flowData.selectedTemplateId
      ?.split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "Template";

  let basePrice = flowData.paymentDone ? 0 : parseInt(plan.price.replace(/,/g, ""));
  if (!flowData.paymentDone && flowData.originalPlan && flowData.originalPlan !== flowData.selectedPlan) {
    const originalPlanPrice = parseInt(planDetails[flowData.originalPlan as keyof typeof planDetails]?.price.replace(/,/g, "") || "0");
    basePrice = Math.max(0, parseInt(plan.price.replace(/,/g, "")) - originalPlanPrice);
  }
  const addedQuota = Math.max(0, (flowData.guestLinksQuota || 0) - (flowData.originalGuestLinksQuota || 0));
  const addOnPrice = (addedQuota / 50) * 1000;
  const rawTotal = basePrice + addOnPrice;

  // Calculate discount if promo applied
  const discountAmount = appliedPromo && discountPercent > 0 ? Math.floor(rawTotal * (discountPercent / 100)) : 0;
  const finalTotal = Math.max(0, rawTotal - discountAmount);

  const handleApplyPromo = async () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;

    if (code.length >= 3) {
      const loadingToast = toast.loading("Verifying promo code...");
      try {
        const res = await fetch(`/api/payment/promo?code=${encodeURIComponent(code)}`);
        const data = await res.json();
        
        if (res.ok && data.valid) {
          setAppliedPromo(code);
          setDiscountPercent(data.discountPercent);
          toast.success(`Promo code '${code}' applied! ${data.discountPercent}% discount added.`, { id: loadingToast });
        } else {
          toast.error(data.error || "Invalid promo code.", { id: loadingToast });
        }
      } catch (err) {
        toast.error("Failed to verify promo code.", { id: loadingToast });
      }
    } else {
      toast.error("Invalid promo code. Please enter a valid code.");
    }
  };

  // 1. Safepay Online Checkout
  const handleInitiatePayment = async () => {
    setProcessing(true);
    try {
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: flowData.invitationId,
          plan: flowData.selectedPlan || "classic",
          guestLinksQuota: flowData.guestLinksQuota || 0,
          promoCode: appliedPromo,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to initiate checkout");
      }

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = typeof data.checkoutUrl === 'string' ? data.checkoutUrl : data.checkoutUrl.redirect_url || data.checkoutUrl.redirectUrl || data.checkoutUrl;
      } else {
        throw new Error("Invalid checkout URL returned from server");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred during checkout");
      setProcessing(false);
    }
  };

  // 1b. Agency Wholesale Credit 1-Click Activation
  const handlePayWithAgencyCredit = async () => {
    if (!flowData.invitationId) {
      toast.error("Invitation record not found. Please save invitation details first.");
      return;
    }
    if (!agencyData || agencyData.creditsBalance < 1) {
      toast.error("Insufficient wholesale credits! Please top up your wallet in the Agency Portal.");
      return;
    }
    setProcessing(true);
    try {
      const { activateInvitationWithAgencyCredit } = await import("@/app/dashboard/agency/actions");
      const res = await activateInvitationWithAgencyCredit(flowData.invitationId);
      if (res.error) {
        toast.error(res.error);
        setProcessing(false);
        return;
      }
      toast.success("✨ Client event activated and published! 1 Wholesale Credit deducted.");
      onUpdateData({ paymentDone: true });
      window.location.href = `/dashboard/agency?creditsDeducted=1`;
    } catch (err: any) {
      toast.error(err?.message || "Failed to activate with agency credit");
      setProcessing(false);
    }
  };

  // 2. Receipt Screenshot Upload
  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Receipt screenshot must be smaller than 10MB");
      return;
    }

    setUploadingReceipt(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({ error: "Failed to parse upload response" }));
      const uploadedUrl = data.url || (Array.isArray(data.urls) && data.urls.length > 0 ? data.urls[0] : null);

      if (res.ok && uploadedUrl) {
        setReceiptUrl(uploadedUrl);
        toast.success("Receipt screenshot uploaded!");
      } else {
        toast.error(data.error || "Failed to upload receipt screenshot.");
      }
    } catch (err) {
      console.error("Receipt upload error:", err);
      toast.error("Network error uploading receipt");
    } finally {
      setUploadingReceipt(false);
    }
  };

  // 3. Manual Bank Order Submit
  const handleSubmitManualBank = async () => {
    if (!receiptUrl) {
      toast.error("Please upload your payment receipt screenshot.");
      return;
    }
    if (!transactionRef.trim() || transactionRef.trim().length < 3) {
      toast.error("Please enter your bank transaction reference (STAN / Transaction ID).");
      return;
    }
    if (!acceptedTerms) {
      toast.error("Please agree to the Terms of Service.");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch("/api/payment/manual-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitationId: flowData.invitationId,
          plan: flowData.selectedPlan || "classic",
          guestLinksQuota: flowData.guestLinksQuota || 0,
          promoCode: appliedPromo,
          receiptUrl,
          transactionRef: transactionRef.trim(),
          senderDetails: senderDetails.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmittedOrderData(data);
        setIsSubmittedSuccess(true);
        toast.success("Payment submitted for verification!");
      } else {
        toast.error(data.error || "Failed to submit bank transfer order.");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error submitting order");
    } finally {
      setProcessing(false);
    }
  };

  const handleCopy = (text: string, fieldKey: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with progress stepper */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={onBack}
              className="gap-2 text-foreground/70 hover:text-foreground"
              disabled={processing}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <div className="flex items-center gap-1.5">
              <StepDot done label="Template" stepNumber={1} />
              <StepLine active />
              <StepDot done label="Account" stepNumber={2} />
              <StepLine active />
              <StepDot done label="Details" stepNumber={3} />
              <StepLine active />
              <StepDot current label="Payment" stepNumber={4} />
            </div>

            <div className="w-16" />
          </div>
        </div>
      </header>

      {/* Breadcrumb path */}
      <PageBreadcrumb crumbs={crumbs} />

      <main id="main-content" className="flex-1 px-4 py-8 sm:py-12">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl space-y-8"
        >
          {/* Section Header */}
          <div className="text-center space-y-2">
            <Badge className="bg-primary/15 text-primary border-gold/30 px-3 py-1 text-xs font-semibold">
              <Lock className="w-3 h-3 mr-1.5" /> Secure Checkout • Cards, IBFT &amp; Raast
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">
              Complete Your Order &amp; Publish Link
            </h1>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Choose your preferred payment method below to activate your personalized digital invitation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Payment Hub & Form */}
            <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
              
              {paymentError && (
                <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                  ⚠️ {paymentError}
                </div>
              )}

              {/* POST-SUBMISSION SUCCESS VIEW (Manual Bank) */}
              {isSubmittedSuccess && submittedOrderData ? (
                <div className="p-6 sm:p-8 rounded-3xl border border-gold/40 bg-card/90 shadow-2xl backdrop-blur-xl space-y-6 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                    <Clock className="w-8 h-8 animate-pulse" />
                  </div>

                  <div className="space-y-1">
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs px-3 py-1 font-semibold">
                      ⏳ Verification Under Review
                    </Badge>
                    <h2 className="font-display text-2xl font-bold text-foreground pt-2">
                      Payment Slip Submitted!
                    </h2>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Thank you! Your payment receipt has been received and our team is verifying your transaction.
                    </p>
                  </div>

                  {/* Order Details summary box */}
                  <div className="p-4 rounded-2xl bg-background/80 border border-border/50 text-left space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Order Reference:</span>
                      <span className="font-mono font-bold text-foreground">#{submittedOrderData.orderId.slice(0, 13)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-bold text-emerald">Rs. {submittedOrderData.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Transaction Ref / STAN:</span>
                      <span className="font-mono font-semibold text-foreground">{submittedOrderData.transactionRef}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        Pending Review (15-30 mins)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-2">
                    <Button
                      onClick={() => {
                        const platformName = bankDetails.siteName || "Support";
                        const msg = `Hi ${platformName}! I have submitted a bank transfer of Rs. ${submittedOrderData.amount.toLocaleString()} for Order #${submittedOrderData.orderId.slice(0, 13)} (Ref: ${submittedOrderData.transactionRef}). Please verify and activate my invitation.`;
                        window.open(`https://api.whatsapp.com/send?phone=${bankDetails.whatsappSupport}&text=${encodeURIComponent(msg)}`, "_blank");
                      }}
                      className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm h-12 rounded-xl gap-2 shadow-lg"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Notify Support on WhatsApp for Express Approval</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        window.location.href = "/dashboard";
                      }}
                      className="w-full border-gold/40 text-foreground hover:bg-gold/10 text-xs h-11 rounded-xl"
                    >
                      <span>Go to Dashboard</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                /* MAIN PAYMENT CONTAINER */
                <div className="p-6 sm:p-8 rounded-3xl border border-gold/30 bg-card/70 shadow-2xl backdrop-blur-xl space-y-6">
                  
                  {/* Payment Method Selector Tabs */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                      Select Payment Option
                    </label>

                    <div className={`grid grid-cols-1 ${agencyData?.isAgency ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3`}>
                      {/* Option 0: Agency Wholesale Credit (if agency) */}
                      {agencyData?.isAgency && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("agency_credit")}
                          className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                            paymentMethod === "agency_credit"
                              ? "border-gold bg-gold/15 shadow-md ring-1 ring-gold"
                              : "border-border/60 bg-background/50 hover:bg-background/80"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-xl bg-gold/20 flex items-center justify-center text-gold">
                              <Crown className="w-4 h-4" />
                            </div>
                            <Badge className="bg-gold/20 text-gold border-gold/40 text-[9px] px-1.5 py-0 font-bold">
                              1 Credit
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">Wholesale Wallet</p>
                            <p className="text-[10px] text-muted-foreground">
                              {agencyData.creditsBalance} Credits Available
                            </p>
                          </div>
                        </button>
                      )}

                      {/* Option 1: Safepay Cards */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("safepay")}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                          paymentMethod === "safepay"
                            ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary"
                            : "border-border/60 bg-background/50 hover:bg-background/80"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          {paymentMethod === "safepay" && (
                            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">Cards &amp; Google Pay</p>
                          <p className="text-[10px] text-muted-foreground">Instant activation via Safepay</p>
                        </div>
                      </button>

                      {/* Option 2: Direct Bank Transfer */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("manual_bank")}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                          paymentMethod === "manual_bank"
                            ? "border-gold bg-gold/10 shadow-md ring-1 ring-gold"
                            : "border-border/60 bg-background/50 hover:bg-background/80"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-xl bg-gold/20 flex items-center justify-center text-gold">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <Badge className="bg-emerald/20 text-emerald border-emerald/30 text-[9px] px-1.5 py-0">
                            0% Fee
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            {bankDetails.raastId ? "Bank Transfer & Raast" : "Direct Bank Transfer"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {bankDetails.raastId
                              ? `${bankDetails.bankName || "Pakistani Banks"}, Raast ID (IBFT)`
                              : `${bankDetails.bankName || "All Pakistani Banks"} (IBFT / IBAN)`}
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* ======================================================= */}
                  {/* VIEW 0: AGENCY WHOLESALE CREDIT */}
                  {/* ======================================================= */}
                  {paymentMethod === "agency_credit" && agencyData && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-gold/15 via-gold/5 to-background border border-gold/40 space-y-3 shadow-inner">
                        <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-gold/20 text-gold flex items-center justify-center font-bold">
                              <Crown className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                {agencyData.companyName || "Agency Partner Account"}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                Wholesale Event Activation Privileges
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-gold/20 text-gold border-gold/40 text-[10px] font-bold">
                            Wholesale Active
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-background/80 border border-border/40">
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                              Available Balance
                            </span>
                            <span className="font-bold text-foreground text-sm flex items-center gap-1 mt-0.5">
                              <Zap className="w-3.5 h-3.5 text-gold fill-gold" />
                              {agencyData.creditsBalance} Credits
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-background/80 border border-border/40">
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                              Cost for This Event
                            </span>
                            <span className="font-bold text-emerald text-sm flex items-center gap-1 mt-0.5">
                              1 Credit
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Publishing will deduct 1 credit from your agency wholesale balance. Your client&apos;s invitation will include your custom white-label branding, unlimited RSVP guest passes, and 7-view review tokens.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* VIEW A: SAFEPAY ONLINE CHECKOUT */}
                  {/* ======================================================= */}
                  {paymentMethod === "safepay" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-border/50 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <h2 className="font-display text-sm font-bold text-foreground">Safepay Payment Gateway</h2>
                            <p className="text-[11px] text-muted-foreground">Encrypted checkout for Pakistani &amp; International cards</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald/20 text-foreground border-primary/30 text-[10px] font-bold">Safepay Verified</Badge>
                      </div>

                      {/* Supported Cards Badge Grid */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="p-3 rounded-xl bg-background/80 border border-gold/30 flex items-center gap-2.5 shadow-sm">
                          <CreditCard className="w-4 h-4 text-primary shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-foreground">Credit &amp; Debit Cards</p>
                            <p className="text-[10px] text-muted-foreground">Visa, Mastercard, PayPak</p>
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-background/80 border border-gold/30 flex items-center gap-2.5 shadow-sm">
                          <Globe className="w-4 h-4 text-foreground shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-foreground">Google Pay &amp; Wallets</p>
                            <p className="text-[10px] text-muted-foreground">1-Tap Checkout</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ======================================================= */}
                  {/* VIEW B: DIRECT BANK TRANSFER (IBFT & RAAST) */}
                  {/* ======================================================= */}
                  {paymentMethod === "manual_bank" && (
                    <div className="space-y-4">
                      {/* Official Bank Account Card */}
                      <div className="p-4 rounded-2xl bg-background/90 border border-gold/40 space-y-3 shadow-inner">
                        <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gold/20 text-gold flex items-center justify-center font-bold text-xs">
                              🏦
                            </div>
                            <div>
                              <p className="text-xs font-bold text-foreground">{bankDetails.bankName}</p>
                              <p className="text-[10px] text-muted-foreground">Title: {bankDetails.accountTitle}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] border-gold/40 text-gold">Official Account</Badge>
                        </div>

                        {/* Copyable Credentials */}
                        <div className="space-y-2">
                          {/* Account Number */}
                          <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/40 text-xs">
                            <div>
                              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Account Number</span>
                              <span className="font-mono font-bold text-foreground text-xs">{bankDetails.accountNumber}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopy(bankDetails.accountNumber, "accountNumber")}
                              className="h-7 px-2 text-[11px] gap-1 hover:text-gold"
                            >
                              {copiedField === "accountNumber" ? <Check className="w-3.5 h-3.5 text-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedField === "accountNumber" ? "Copied" : "Copy"}</span>
                            </Button>
                          </div>

                          {/* IBAN */}
                          <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/40 text-xs">
                            <div>
                              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">IBAN (All Pakistani Banks)</span>
                              <span className="font-mono font-bold text-foreground text-xs break-all">{bankDetails.iban}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopy(bankDetails.iban, "iban")}
                              className="h-7 px-2 text-[11px] gap-1 hover:text-gold shrink-0 ml-2"
                            >
                              {copiedField === "iban" ? <Check className="w-3.5 h-3.5 text-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedField === "iban" ? "Copied" : "Copy"}</span>
                            </Button>
                          </div>

                          {/* Raast ID */}
                          {Boolean(bankDetails.raastId?.trim()) && (
                            <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/40 text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Raast ID (0 Fee Instant)</span>
                                <span className="font-mono font-bold text-foreground text-xs">{bankDetails.raastId}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCopy(bankDetails.raastId, "raastId")}
                                className="h-7 px-2 text-[11px] gap-1 hover:text-gold"
                              >
                                {copiedField === "raastId" ? <Check className="w-3.5 h-3.5 text-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedField === "raastId" ? "Copied" : "Copy"}</span>
                              </Button>
                            </div>
                          )}

                          {/* EasyPaisa / JazzCash if configured */}
                          {Boolean(bankDetails.easyPaisaAccount?.trim()) && (
                            <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/40 text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-semibold text-emerald-400 block">EasyPaisa Account</span>
                                <span className="font-mono font-bold text-foreground text-xs">{bankDetails.easyPaisaAccount}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCopy(bankDetails.easyPaisaAccount!, "easyPaisa")}
                                className="h-7 px-2 text-[11px] gap-1 hover:text-emerald-400"
                              >
                                {copiedField === "easyPaisa" ? <Check className="w-3.5 h-3.5 text-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedField === "easyPaisa" ? "Copied" : "Copy"}</span>
                              </Button>
                            </div>
                          )}

                          {Boolean(bankDetails.jazzCashAccount?.trim()) && (
                            <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border/40 text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-semibold text-amber-400 block">JazzCash Account</span>
                                <span className="font-mono font-bold text-foreground text-xs">{bankDetails.jazzCashAccount}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCopy(bankDetails.jazzCashAccount!, "jazzCash")}
                                className="h-7 px-2 text-[11px] gap-1 hover:text-amber-400"
                              >
                                {copiedField === "jazzCash" ? <Check className="w-3.5 h-3.5 text-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedField === "jazzCash" ? "Copied" : "Copy"}</span>
                              </Button>
                            </div>
                          )}
                        </div>

                        {bankDetails.instructionsUrdu && (
                          <p className="text-[11px] text-muted-foreground/90 leading-relaxed italic border-t border-border/30 pt-2 font-urdu text-right" dir="rtl">
                            {bankDetails.instructionsUrdu}
                          </p>
                        )}
                      </div>

                      {/* Receipt Upload & Transfer Details Section */}
                      <div className="space-y-3 pt-1">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                          Upload Payment Receipt &amp; Reference
                        </label>

                        {/* Hidden file input */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/heic"
                          onChange={handleReceiptFileChange}
                          className="hidden"
                        />

                        {/* Receipt upload box */}
                        {!receiptUrl ? (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                              uploadingReceipt
                                ? "border-gold/60 bg-gold/5"
                                : "border-border/70 hover:border-gold/60 bg-background/50 hover:bg-background/80"
                            }`}
                          >
                            {uploadingReceipt ? (
                              <div className="space-y-2">
                                <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto" />
                                <p className="text-xs font-semibold text-foreground">Uploading screenshot...</p>
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                <div className="w-10 h-10 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold mx-auto">
                                  <Upload className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-semibold text-foreground">
                                  Tap to Upload Bank Screenshot / Receipt
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  PNG, JPG, WebP up to 10MB
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 rounded-2xl bg-background/90 border border-emerald/40 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={receiptUrl}
                                alt="Uploaded receipt"
                                className="w-12 h-12 rounded-xl object-cover border border-border shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="text-xs font-semibold text-foreground flex items-center gap-1 text-emerald">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Receipt Attached
                                </span>
                                <a
                                  href={receiptUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-muted-foreground hover:text-gold truncate block"
                                >
                                  View Full Slip
                                </a>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-xs text-muted-foreground hover:text-foreground h-8"
                            >
                              Change
                            </Button>
                          </div>
                        )}

                        {/* Transaction Ref / STAN Input */}
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">
                            Transaction Reference / STAN Number *
                          </label>
                          <Input
                            type="text"
                            placeholder="e.g. 48291048 or Bank UTR Ref"
                            value={transactionRef}
                            onChange={(e) => setTransactionRef(e.target.value)}
                            className="bg-background/80 font-mono text-xs h-10"
                          />
                        </div>

                        {/* Sender Account Details */}
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">
                            Sender Bank &amp; Account Title (Optional)
                          </label>
                          <Input
                            type="text"
                            placeholder="e.g. Sent from HBL - Tariq Mehmood"
                            value={senderDetails}
                            onChange={(e) => setSenderDetails(e.target.value)}
                            className="bg-background/80 text-xs h-10"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Promo Code Input (Shared across methods) */}
                  {!flowData.paymentDone && (
                    <div className="space-y-2 pt-2 border-t border-border/40">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-primary" /> Promo Code
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter Promo Code (e.g. SMART10)"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                          disabled={!!appliedPromo}
                          className="bg-background/80 font-mono text-sm"
                        />
                        {appliedPromo ? (
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setAppliedPromo(null);
                              setPromoCodeInput("");
                              setDiscountPercent(0);
                              toast.info("Promo code removed.");
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
                          >
                            Remove
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleApplyPromo}
                            className="border-gold/50 text-primary hover:bg-primary/10 font-bold shrink-0"
                          >
                            Apply
                          </Button>
                        )}
                      </div>
                      {appliedPromo && (
                        <p className="text-xs text-foreground font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Promo code '{appliedPromo}' applied! {discountPercent}% discount active.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-3 pt-2 border-t border-border/40">
                    <Checkbox
                      id="terms-checkbox"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                      className="mt-0.5 border-gold data-[state=checked]:bg-primary data-[state=checked]:text-slate-950 shrink-0"
                    />
                    <label htmlFor="terms-checkbox" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                      I agree to the <a href="/terms" target="_blank" className="text-primary underline hover:text-primary-light">Terms of Service</a> and acknowledge that all purchases are subject to the <a href="/refund" target="_blank" className="text-primary underline hover:text-primary-light">Refund Policy</a>.
                    </label>
                  </div>

                  {/* Main Action Buttons */}
                  {paymentMethod === "agency_credit" ? (
                    <Button
                      onClick={handlePayWithAgencyCredit}
                      disabled={processing || (agencyData?.creditsBalance || 0) < 1 || !acceptedTerms}
                      size="lg"
                      className="w-full bg-primary hover:bg-primary-light text-slate-950 font-black text-base gap-2 shadow-2xl h-14 cursor-pointer"
                    >
                      {processing ? (
                        <><Loader2 className="w-5 h-5 animate-spin text-slate-950" /> Activating Client Event with 1 Credit...</>
                      ) : (agencyData?.creditsBalance || 0) < 1 ? (
                        "Insufficient Agency Credits (Top-up in Portal)"
                      ) : (
                        <>
                          <Crown className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                          <span>Publish Client Event with 1 Wholesale Credit</span>
                          <ArrowRight className="w-5 h-5 ml-1 text-slate-950 stroke-[2.5]" />
                        </>
                      )}
                    </Button>
                  ) : paymentMethod === "safepay" ? (
                    <Button
                      onClick={handleInitiatePayment}
                      disabled={processing || finalTotal <= 0 || !acceptedTerms}
                      size="lg"
                      className="w-full bg-primary hover:bg-primary-light text-slate-950 font-black text-base gap-2 shadow-2xl h-14 cursor-pointer"
                    >
                      {processing ? (
                        <><Loader2 className="w-5 h-5 animate-spin text-slate-950" /> Redirecting to Safepay Checkout...</>
                      ) : finalTotal <= 0 ? (
                        "No Changes to Pay"
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                          <span>{flowData.paymentDone && addedQuota > 0 ? "Top Up Links Securely" : `Proceed to Safepay (Rs. ${finalTotal.toLocaleString("en-PK")})`}</span>
                          <ArrowRight className="w-5 h-5 ml-1 text-slate-950 stroke-[2.5]" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitManualBank}
                      disabled={processing || finalTotal <= 0 || !acceptedTerms || !receiptUrl || !transactionRef.trim()}
                      size="lg"
                      className="w-full bg-gold hover:bg-gold/90 text-black font-extrabold text-base gap-2 shadow-2xl h-14 cursor-pointer"
                    >
                      {processing ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Bank Slip...</>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          <span>Submit Bank Transfer for Verification (Rs. {finalTotal.toLocaleString("en-PK")})</span>
                        </>
                      )}
                    </Button>
                  )}

                  {/* Return button */}
                  <Button
                    variant="ghost"
                    onClick={onBack}
                    disabled={processing}
                    className="w-full text-muted-foreground hover:text-foreground text-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Review &amp; Edit Details
                  </Button>
                </div>
              )}

              {/* 3 Key Trust Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-card/50 border border-border/50 text-center space-y-1">
                  <Lock className="w-5 h-5 text-primary mx-auto" />
                  <p className="text-xs font-bold text-foreground">256-Bit SSL</p>
                  <p className="text-[10px] text-muted-foreground">Bank-level encrypted checkout</p>
                </div>
                <div className="p-4 rounded-2xl bg-card/50 border border-border/50 text-center space-y-1">
                  <Sparkles className="w-5 h-5 text-foreground mx-auto" />
                  <p className="text-xs font-bold text-foreground">Instant Activation</p>
                  <p className="text-[10px] text-muted-foreground">Immediate verification</p>
                </div>
                <div className="p-4 rounded-2xl bg-card/50 border border-border/50 text-center space-y-1">
                  <Shield className="w-5 h-5 text-primary mx-auto" />
                  <p className="text-xs font-bold text-foreground">100% Guarantee</p>
                  <p className="text-[10px] text-muted-foreground">Secure transaction</p>
                </div>
              </div>

            </div>

            {/* Right Column: Live Invitation Card Preview & Order Summary */}
            <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
              
              {/* Mini Invitation Summary Card */}
              <div className="p-6 rounded-3xl bg-card/70 border border-gold/30 shadow-2xl backdrop-blur-xl space-y-4">
                
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" /> Invitation Preview
                  </h3>
                  <Badge className={flowData.selectedPlan === "royal" ? "bg-primary/20 text-primary border-gold/30" : "bg-emerald/20 text-foreground border-primary/30"}>
                    {flowData.selectedPlan === "royal" && <Crown className="w-3 h-3 mr-1" />}
                    {plan.name}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Template</span>
                    <p className="text-sm font-semibold text-foreground">{templateName}</p>
                  </div>
                  {flowData.partner1Name && flowData.partner2Name && (
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Couple</span>
                      <p className="text-sm font-semibold text-foreground">{flowData.partner1Name} &amp; {flowData.partner2Name}</p>
                    </div>
                  )}
                  {flowData.events && flowData.events.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Events ({flowData.events.length})</span>
                      <p className="text-xs text-muted-foreground truncate">{flowData.events.map(e => e.name).join(", ")}</p>
                    </div>
                  )}
                </div>

                {/* Plan Highlights */}
                <div className="border-t border-border/40 pt-3 space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Includes</span>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {plan.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Order Pricing Breakdown Card */}
              <div className="p-6 rounded-3xl bg-card/70 border border-gold/30 shadow-2xl backdrop-blur-xl space-y-4">
                <h3 className="font-display text-base font-bold text-foreground">Order Breakdown</h3>
                
                <div className="space-y-2 text-xs">
                  {paymentMethod === "agency_credit" ? (
                    <>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Wholesale Activation ({plan.name})</span>
                        <span className="font-bold text-gold">1 Credit</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Prepaid Wholesale Balance</span>
                        <span className="font-semibold text-foreground">{agencyData?.creditsBalance || 0} Credits</span>
                      </div>
                      <div className="border-t border-border/50 pt-3 flex justify-between text-sm font-bold text-foreground">
                        <span>Total Payable Today</span>
                        <span className="text-emerald font-display text-base">Rs. 0 (1 Credit)</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-muted-foreground">
                        <span>{plan.name} Base Package</span>
                        <span>Rs. {basePrice.toLocaleString("en-PK")}</span>
                      </div>

                      {addedQuota > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>{addedQuota} Additional Guest Links</span>
                          <span>Rs. {addOnPrice.toLocaleString("en-PK")}</span>
                        </div>
                      )}

                      {discountAmount > 0 && (
                        <div className="flex justify-between text-emerald font-semibold">
                          <span>Promo Discount ({discountPercent}%)</span>
                          <span>- Rs. {discountAmount.toLocaleString("en-PK")}</span>
                        </div>
                      )}

                      <div className="border-t border-border/50 pt-3 flex justify-between text-sm font-bold text-foreground">
                        <span>Total Payable</span>
                        <span className="text-primary font-display text-base">Rs. {finalTotal.toLocaleString("en-PK")}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

          </div>
        </m.div>
      </main>
    </div>
  );
}

function StepDot({ done, current, label, stepNumber }: { done?: boolean; current?: boolean; label: string; stepNumber: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
          done
            ? "bg-primary text-slate-950 font-black"
            : current
            ? "bg-primary/20 text-primary border border-gold/50 shadow-sm"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? <Check className="w-4 h-4 text-slate-950 stroke-[2.5]" /> : stepNumber}
      </div>
      <span className={`text-xs font-medium hidden md:inline ${current ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}

function StepLine({ active }: { active?: boolean }) {
  return <div className={`w-6 sm:w-10 h-0.5 ${active ? "bg-primary/50" : "bg-border"}`} />;
}
