"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { m } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, CreditCard, Shield, Lock, Crown, Sparkles, Loader2,
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

function formatCardNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

export function PaymentPage({ flowData, onUpdateData, onBack, onContinue, crumbs }: PaymentPageProps) {
  const [processing, setProcessing] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
  const total = basePrice + (addedQuota / 50 * 1000);
  const formattedTotal = total.toLocaleString("en-PK");

  // Webhook verification is no longer done here to avoid redirect loops during upgrades.
  // State variables for future payment flow handling (if required)



  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with progress */}
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
              <StepDot done label="Template" />
              <StepLine active />
              <StepDot done label="Account" />
              <StepLine active />
              <StepDot done label="Details" />
              <StepLine active />
              <StepDot current label="Payment" />
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
          className="mx-auto max-w-3xl"
        >
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Complete Payment
            </h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Publish your premium invitation instantly and share with your guests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Payment Form */}
            <div className="md:col-span-3 flex flex-col h-full order-2 md:order-1">
              {paymentError && (
                <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm text-center">
                  ⚠️ {paymentError}
                </div>
              )}

              <div className="p-6 rounded-2xl border border-gold/30 bg-gold/5 flex flex-col h-full text-center">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4 shrink-0">
                  <Shield className="w-6 h-6 text-gold" />
                </div>
                <h2 className="font-display text-lg font-semibold text-gold-light shrink-0">Secure Online Checkout</h2>
                <p className="text-muted-foreground text-xs leading-relaxed shrink-0">
                  {flowData.paymentDone && addedQuota > 0
                    ? <>You are purchasing <strong className="text-white">{addedQuota} additional guest links</strong> for your invitation.</>
                    : <>You are purchasing the <strong className="text-white capitalize">{flowData.selectedPlan || "classic"} Plan</strong>. Click below to securely process your payment.</>
                  }
                </p>
                
                {/* Payment Method Badges */}
                <div className="flex flex-wrap justify-center items-center gap-3 pt-2 shrink-0">
                  <CreditCard className="w-5 h-5 text-muted-foreground/80" />
                  <span className="text-[11px] font-medium text-muted-foreground/80 uppercase tracking-wider">Visa / Mastercard / UnionPay / PayPak</span>
                </div>

                <div className="flex justify-center items-center gap-6 pt-3 text-xs text-muted-foreground border-t border-gold/10 mt-4 shrink-0">
                  <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-gold" /> Secure</span>
                  <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald" /> Money-Back Guarantee</span>
                </div>

                {/* What happens next? */}
                <div className="mt-5 mb-auto text-left border-t border-gold/10 pt-5">
                  <h3 className="text-sm font-semibold text-foreground mb-3 font-display">What happens next?</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CreditCard className="w-3.5 h-3.5 text-emerald" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground leading-tight">Payment Processed Securely</p>
                        <p className="text-xs text-muted-foreground mt-1">Your transaction is encrypted and instantly verified by Safepay.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground leading-tight">Instant Activation</p>
                        <p className="text-xs text-muted-foreground mt-1">Your invitation link goes live the moment payment succeeds.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald/10 flex items-center justify-center shrink-0 mt-0.5">
                        <ArrowRight className="w-3.5 h-3.5 text-emerald" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground leading-tight">Ready to Share</p>
                        <p className="text-xs text-muted-foreground mt-1">Send your personalized link to all your guests right away.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pushes the following content to the bottom */}
                <div className="mt-5 pt-4 flex flex-col gap-4 text-left border-t border-gold/10">
                  {/* Legal Checkbox */}
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="terms-checkbox" 
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                      className="mt-1 border-gold data-[state=checked]:bg-gold data-[state=checked]:text-emerald-dark shrink-0"
                    />
                    <label htmlFor="terms-checkbox" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                      I agree to the <a href="/terms" target="_blank" className="text-gold hover:underline">Terms & Conditions</a> and acknowledge that all purchases are subject to the <a href="/refund" target="_blank" className="text-gold hover:underline">Refund Policy</a>.
                    </label>
                  </div>

                  {/* Pay button */}
                  <Button
                    onClick={async () => {
                      setProcessing(true);
                      try {
                        const res = await fetch("/api/payment/initiate", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            invitationId: flowData.invitationId,
                            plan: flowData.selectedPlan || "classic",
                            guestLinksQuota: flowData.guestLinksQuota || 0,
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
                    }}
                    disabled={processing || total <= 0 || !acceptedTerms}
                    className="w-full h-12 bg-gold hover:bg-gold-light text-emerald-dark font-semibold text-base gap-2 shrink-0 mt-2"
                  >
                    {processing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to Secure Checkout...</>
                    ) : total <= 0 ? (
                      'No Changes to Pay'
                    ) : (
                      <><Lock className="w-4 h-4 mr-1" /> <span>{flowData.paymentDone && addedQuota > 0 ? 'Top Up Links securely' : 'Proceed to Payment'}</span> <ArrowRight className="w-4 h-4 ml-1" /></>
                    )}
                  </Button>

                  {/* Review Details button */}
                  <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={processing}
                    className="w-full h-12 border-gold/20 text-muted-foreground hover:text-foreground hover:bg-gold/5 font-medium text-sm gap-2 shrink-0 mt-1"
                  >
                    <ArrowLeft className="w-4 h-4" /> Review & Edit Details
                  </Button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-2 flex flex-col h-full order-1 md:order-2">
              <div className="p-5 rounded-2xl border border-gold/20 bg-card h-full flex flex-col">
                <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold" />
                  Order Summary
                </h3>

                <div className="flex flex-col flex-1 text-sm">
                  <div className="flex justify-between mb-3">
                    <span className="text-muted-foreground">Template</span>
                    <span className="font-medium">{templateName}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-muted-foreground">Plan</span>
                    <Badge
                      className={
                        flowData.selectedPlan === "royal"
                          ? "bg-gold/15 text-gold border-gold/25"
                          : "bg-emerald/15 text-emerald border-emerald/25"
                      }
                    >
                      {flowData.selectedPlan === "royal" && <Crown className="w-3 h-3 mr-1" />}
                      {plan.name}
                    </Badge>
                  </div>

                  <div className="border-t border-border/50 pt-4 mb-4 flex-1">
                    <div className="space-y-2">
                      {plan.features.slice(0, 8).map((f) => (
                        <div key={f} className="flex items-center gap-2 text-xs">
                          <Check className="w-3 h-3 text-emerald shrink-0" />
                          <span className="text-muted-foreground">{f}</span>
                        </div>
                      ))}
                      {plan.features.length > 8 && (
                        <p className="text-xs text-muted-foreground pl-5 pt-1">
                          +{plan.features.length - 8} more features
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4 mb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1 pr-4">
                        <span className="font-medium text-sm">Personalized Guest Links</span>
                        <span className="text-xs text-muted-foreground">Unique links to track individual RSVPs</span>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            disabled={(flowData.guestLinksQuota || 0) <= (flowData.originalGuestLinksQuota || 0)}
                            onClick={() => onUpdateData({ guestLinksQuota: Math.max(flowData.originalGuestLinksQuota || 0, (flowData.guestLinksQuota || 0) - 50) })}
                            className="w-6 h-6 rounded-full flex items-center justify-center bg-muted text-foreground disabled:opacity-50 hover:bg-muted/80 transition-colors"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{flowData.guestLinksQuota || 0}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateData({ guestLinksQuota: (flowData.guestLinksQuota || 0) + 50 })}
                            className="w-6 h-6 rounded-full flex items-center justify-center bg-emerald text-white hover:bg-emerald/90 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        {((flowData.guestLinksQuota || 0) > (flowData.originalGuestLinksQuota || 0)) && (
                          <span className="text-sm font-semibold text-foreground">+ Rs. {(((flowData.guestLinksQuota || 0) - (flowData.originalGuestLinksQuota || 0)) / 50 * 1000).toLocaleString('en-PK')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto border-t border-border/50 pt-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-muted-foreground">Total</span>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">Rs.</span>
                        <span className="font-display text-2xl font-bold ml-1">
                          {(() => {
                            const basePrice = flowData.paymentDone ? 0 : parseInt(plan.price.replace(/,/g, ""));
                            const addedQuota = Math.max(0, (flowData.guestLinksQuota || 0) - (flowData.originalGuestLinksQuota || 0));
                            const total = basePrice + (addedQuota / 50 * 1000);
                            return total.toLocaleString("en-PK");
                          })()}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-right mt-0.5">
                      {plan.priceNote}
                    </p>
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
function StepDot({ done, current, label }: { done?: boolean; current?: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div
        className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
          done ? "bg-gold text-emerald-dark" : current ? "bg-emerald text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? <Check className="w-3 h-3" /> : current ? "4" : ""}
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
