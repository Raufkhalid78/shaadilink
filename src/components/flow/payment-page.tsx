"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { m } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, CreditCard, Shield, Lock, Crown, Sparkles, Loader2,
  Tag, Percent, CheckCircle2, Globe, Heart, MapPin, Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { FlowData } from "@/lib/flow-types";
import { planDetails } from "@/lib/flow-types";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

interface PaymentPageProps {
  flowData: FlowData;
  onUpdateData: (updates: Partial<FlowData>) => void;
  onBack: () => void;
  onContinue: () => void;
  crumbs: { label: string; onClick?: () => void }[];
}

export function PaymentPage({ flowData, onUpdateData, onBack, onContinue, crumbs }: PaymentPageProps) {
  const [processing, setProcessing] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  const searchParams = useSearchParams();
  const paymentError = searchParams.get("paymentError");

  const plan = planDetails[flowData.selectedPlan || "classic"];
  const templateName =
    flowData.selectedTemplateId
      ?.split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "Template";

  const basePrice = flowData.paymentDone ? 0 : parseInt(plan.price.replace(/,/g, ""));
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
            <Badge className="bg-gold/15 text-gold border-gold/30 px-3 py-1 text-xs font-semibold">
              <Lock className="w-3 h-3 mr-1.5" /> 256-Bit SSL Encrypted Safepay Checkout
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">
              Complete Your Order &amp; Publish Link
            </h1>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Your personalized digital invitation will be activated immediately upon checkout.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Safepay Payment Hub & Form */}
            <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
              
              {paymentError && (
                <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                  ⚠️ {paymentError}
                </div>
              )}

              {/* Safepay Payment Container */}
              <div className="p-6 sm:p-8 rounded-3xl border border-gold/30 bg-card/70 shadow-2xl backdrop-blur-xl space-y-6">
                
                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-bold text-foreground">Safepay Payment Gateway</h2>
                      <p className="text-xs text-muted-foreground">Official encrypted checkout for Pakistan &amp; International cards</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald/20 text-emerald border-emerald/30 text-[10px] font-bold">Safepay Verified</Badge>
                </div>

                {/* Supported Payment Methods Showcase */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Supported Payment Methods</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Method 1: Cards */}
                    <div className="p-4 rounded-2xl bg-background/80 border border-gold/30 flex items-center gap-3 shadow-sm">
                      <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center text-gold shrink-0">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Credit &amp; Debit Cards</p>
                        <p className="text-[10px] text-muted-foreground">Visa, Mastercard, PayPak, UnionPay</p>
                      </div>
                    </div>

                    {/* Method 2: Google Pay */}
                    <div className="p-4 rounded-2xl bg-background/80 border border-gold/30 flex items-center gap-3 shadow-sm">
                      <div className="w-9 h-9 rounded-xl bg-emerald/10 flex items-center justify-center text-emerald shrink-0">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Google Pay &amp; Digital Wallets</p>
                        <p className="text-[10px] text-muted-foreground">1-Tap Express Checkout</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Promo Code Input */}
                {!flowData.paymentDone && (
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-gold" /> Promo Code
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter Promo Code (e.g. SHAADI10)"
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
                          className="border-gold/50 text-gold hover:bg-gold/10 font-bold shrink-0"
                        >
                          Apply
                        </Button>
                      )}
                    </div>
                    {appliedPromo && (
                      <p className="text-xs text-emerald font-semibold flex items-center gap-1">
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
                    className="mt-0.5 border-gold data-[state=checked]:bg-gold data-[state=checked]:text-emerald-dark shrink-0"
                  />
                  <label htmlFor="terms-checkbox" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    I agree to the <a href="/terms" target="_blank" className="text-gold underline hover:text-gold-light">Terms of Service</a> and acknowledge that all purchases are subject to the <a href="/refund" target="_blank" className="text-gold underline hover:text-gold-light">Refund Policy</a>.
                  </label>
                </div>

                {/* Main Action Button */}
                <Button
                  onClick={handleInitiatePayment}
                  disabled={processing || finalTotal <= 0 || !acceptedTerms}
                  size="lg"
                  className="w-full bg-gold hover:bg-gold-light text-emerald-dark font-extrabold text-base gap-2 shadow-2xl h-14"
                >
                  {processing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Redirecting to Safepay Checkout...</>
                  ) : finalTotal <= 0 ? (
                    "No Changes to Pay"
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>{flowData.paymentDone && addedQuota > 0 ? "Top Up Links Securely" : `Proceed to Safepay (Rs. ${finalTotal.toLocaleString("en-PK")})`}</span>
                      <ArrowRight className="w-5 h-5 ml-1" />
                    </>
                  )}
                </Button>

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

              {/* 3 Key Trust Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-card/50 border border-border/50 text-center space-y-1">
                  <Lock className="w-5 h-5 text-gold mx-auto" />
                  <p className="text-xs font-bold text-foreground">256-Bit SSL</p>
                  <p className="text-[10px] text-muted-foreground">Bank-level encrypted checkout</p>
                </div>
                <div className="p-4 rounded-2xl bg-card/50 border border-border/50 text-center space-y-1">
                  <Sparkles className="w-5 h-5 text-emerald mx-auto" />
                  <p className="text-xs font-bold text-foreground">Instant Activation</p>
                  <p className="text-[10px] text-muted-foreground">Link active immediately</p>
                </div>
                <div className="p-4 rounded-2xl bg-card/50 border border-border/50 text-center space-y-1">
                  <Shield className="w-5 h-5 text-gold mx-auto" />
                  <p className="text-xs font-bold text-foreground">100% Guarantee</p>
                  <p className="text-[10px] text-muted-foreground">Satisfied or refunded</p>
                </div>
              </div>

            </div>

            {/* Right Column: Live Invitation Card Preview & Order Summary */}
            <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
              
              {/* Mini Invitation Summary Card */}
              <div className="p-6 rounded-3xl bg-card/70 border border-gold/30 shadow-2xl backdrop-blur-xl space-y-4">
                
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold" /> Invitation Preview
                  </h3>
                  <Badge className={flowData.selectedPlan === "royal" ? "bg-gold/20 text-gold border-gold/30" : "bg-emerald/20 text-emerald border-emerald/30"}>
                    {flowData.selectedPlan === "royal" && <Crown className="w-3 h-3 mr-1" />}
                    {plan.name}
                  </Badge>
                </div>

                {/* Compact Preview Thumbnail Card */}
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-2 text-center">
                  <p className="text-[9px] uppercase tracking-widest text-gold font-bold">The Wedding of</p>
                  <h4 className="font-display text-xl font-bold text-foreground">
                    {flowData.partner1Name || "Partner 1"} <span className="text-gold italic">&amp;</span> {flowData.partner2Name || "Partner 2"}
                  </h4>
                  <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-gold" /> {templateName}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gold" /> {flowData.venue || "Venue"}</span>
                  </div>
                </div>

                {/* Plan Included Features */}
                <div className="space-y-2 text-xs pt-1">
                  <p className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">Plan Highlights Included:</p>
                  {plan.features.slice(0, 6).map((f) => (
                    <div key={f} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-emerald shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                {/* Extra Guest Links Addon Selector */}
                <div className="pt-3 border-t border-border/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">Extra Guest Links Addon</p>
                      <p className="text-[10px] text-muted-foreground">+Rs. 1,000 per 50 extra links</p>
                    </div>
                    <div className="flex items-center gap-2 bg-background p-1.5 rounded-xl border border-border">
                      <button
                        type="button"
                        disabled={addedQuota <= 0}
                        onClick={() => {
                          const current = flowData.guestLinksQuota || (flowData.originalGuestLinksQuota || 0);
                          const baseQuota = flowData.originalGuestLinksQuota || 0;
                          onUpdateData({ guestLinksQuota: Math.max(baseQuota, current - 50) });
                        }}
                        className="w-6 h-6 rounded-lg flex items-center justify-center bg-muted text-foreground disabled:opacity-40 hover:bg-muted/80 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold px-1 text-center min-w-[28px]">
                        {addedQuota > 0 ? `+${addedQuota}` : "0"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const current = flowData.guestLinksQuota || (flowData.originalGuestLinksQuota || 0);
                          onUpdateData({ guestLinksQuota: current + 50 });
                        }}
                        className="w-6 h-6 rounded-lg flex items-center justify-center bg-gold text-emerald-dark hover:bg-gold-light text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Itemized Price Receipt */}
                <div className="pt-3 border-t border-border/50 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Base Plan ({plan.name})</span>
                    <span>Rs. {basePrice.toLocaleString("en-PK")}</span>
                  </div>

                  {addedQuota > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Extra Links ({addedQuota} links)</span>
                      <span>+ Rs. {addOnPrice.toLocaleString("en-PK")}</span>
                    </div>
                  )}

                  {appliedPromo && discountAmount > 0 && (
                    <div className="flex justify-between text-emerald font-semibold">
                      <span>Promo Discount ({discountPercent}%)</span>
                      <span>- Rs. {discountAmount.toLocaleString("en-PK")}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-border/60 flex items-baseline justify-between">
                    <span className="font-bold text-sm text-foreground">Total Payable</span>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">PKR </span>
                      <span className="font-display text-2xl font-extrabold text-gold">
                        Rs. {finalTotal.toLocaleString("en-PK")}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </m.div>
      </main>
    </div>
  );
}

/* ---------- Helper Components ---------- */
function StepDot({ done, current, label, stepNumber }: { done?: boolean; current?: boolean; label: string; stepNumber: number }) {
  return (
    <div className="flex items-center gap-1">
      <div
        className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
          done ? "bg-gold text-emerald-dark" : current ? "bg-emerald text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? <Check className="w-3 h-3" /> : current ? String(stepNumber) : ""}
      </div>
      <span className={`text-xs hidden sm:inline ${current ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}

function StepLine({ active }: { active?: boolean }) {
  return <div className={`w-4 sm:w-6 h-px ${active ? "bg-gold/30" : "bg-border"}`} />;
}
