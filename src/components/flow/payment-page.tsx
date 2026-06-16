"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, CreditCard, Shield, Lock, Crown, Sparkles, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { FlowData } from "@/lib/flow-types";
import { planDetails } from "@/lib/flow-types";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

interface PaymentPageProps {
  flowData: FlowData;
  onUpdateData: (updates: Partial<FlowData>) => void;
  onBack: () => void;
  onContinue: () => void;
}

function formatCardNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

export function PaymentPage({ flowData, onUpdateData, onBack, onContinue }: PaymentPageProps) {
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const plan = planDetails[flowData.selectedPlan || "classic"];
  const templateName =
    flowData.selectedTemplateId
      ?.split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "Template";

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const rawCard = cardNumber.replace(/\s/g, "");
    if (!rawCard) newErrors.cardNumber = "Card number is required";
    else if (rawCard.length < 16) newErrors.cardNumber = "Enter a valid 16-digit card number";

    if (!expiry) newErrors.expiry = "Expiry date is required";
    else if (!/^\d{2}\/\d{2}$/.test(expiry)) newErrors.expiry = "Enter expiry as MM/YY";
    else {
      const [mm, yy] = expiry.split("/").map(Number);
      if (mm < 1 || mm > 12) newErrors.expiry = "Invalid month";
      else {
        const now = new Date();
        const exp = new Date(2000 + yy, mm - 1);
        if (exp < now) newErrors.expiry = "Card has expired";
      }
    }

    if (!cvc) newErrors.cvc = "CVC is required";
    else if (cvc.length < 3) newErrors.cvc = "CVC must be 3–4 digits";

    if (!cardName.trim()) newErrors.cardName = "Cardholder name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validate()) return;
    setProcessing(true);

    try {
      // Simulated payment processing (2s) — replace with Stripe later
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Record order in Supabase
      if (flowData.invitationId) {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invitationId: flowData.invitationId,
            plan: flowData.selectedPlan || "classic",
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || "Could not record order. Please contact support.");
          return;
        }
      }

      onUpdateData({ paymentDone: true });
      onContinue();
    } catch {
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

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
      <PageBreadcrumb
        crumbs={[
          { label: "Home", onClick: onBack },
          { label: "Templates", onClick: onBack },
          { label: "Details", onClick: onBack },
          { label: "Complete Payment" },
        ]}
      />

      <main className="flex-1 px-4 py-8 sm:py-12">
        <motion.div
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
              One-time secure payment. No subscriptions, no hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Payment Form */}
            <div className="md:col-span-3 space-y-6">
              <div className="p-6 rounded-2xl border border-border/50 bg-card space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-gold" />
                  <h2 className="font-display text-lg font-semibold">Card Details</h2>
                </div>

                {/* Card Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Card Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="4242 4242 4242 4242"
                      className={`pl-10 h-11 font-mono tracking-wider ${errors.cardNumber ? "border-red-400" : ""}`}
                      maxLength={19}
                      inputMode="numeric"
                    />
                  </div>
                  {errors.cardNumber && <p className="text-xs text-red-500">{errors.cardNumber}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Expiry */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      Expiry <span className="text-red-400">*</span>
                    </label>
                    <Input
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      className={`h-11 font-mono ${errors.expiry ? "border-red-400" : ""}`}
                      maxLength={5}
                      inputMode="numeric"
                    />
                    {errors.expiry && <p className="text-xs text-red-500">{errors.expiry}</p>}
                  </div>
                  {/* CVC */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      CVC <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="123"
                        className={`h-11 font-mono ${errors.cvc ? "border-red-400" : ""}`}
                        maxLength={4}
                        inputMode="numeric"
                        type="password"
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    {errors.cvc && <p className="text-xs text-red-500">{errors.cvc}</p>}
                  </div>
                </div>

                {/* Cardholder Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Cardholder Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Name on card"
                    className={`h-11 ${errors.cardName ? "border-red-400" : ""}`}
                    autoComplete="cc-name"
                  />
                  {errors.cardName && <p className="text-xs text-red-500">{errors.cardName}</p>}
                </div>
              </div>

              {/* Security badges */}
              <div className="flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground text-center">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald" />
                    SSL Encrypted
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-emerald" />
                    Secure Payment
                  </div>
                </div>
                <p className="text-muted-foreground/85">
                  Payments are securely processed by our parent company, TechyDez.
                </p>
                <p className="text-muted-foreground/60 text-[10px]">
                  ShaadiLink is owned and operated by TechyDez.
                </p>
              </div>

              {/* Pay button */}
              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full h-12 bg-gold hover:bg-gold-light text-emerald-dark font-semibold text-base gap-2"
              >
                {processing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing Payment...</>
                ) : (
                  <>Pay Rs. {plan.price}<ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-2">
              <div className="p-5 rounded-2xl border border-gold/20 bg-card sticky top-24">
                <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold" />
                  Order Summary
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Template</span>
                    <span className="font-medium">{templateName}</span>
                  </div>
                  <div className="flex justify-between items-center">
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

                  <div className="border-t border-border/50 pt-3 mt-3">
                    <div className="space-y-1.5">
                      {plan.features.slice(0, 5).map((f) => (
                        <div key={f} className="flex items-center gap-2 text-xs">
                          <Check className="w-3 h-3 text-emerald shrink-0" />
                          <span className="text-muted-foreground">{f}</span>
                        </div>
                      ))}
                      {plan.features.length > 5 && (
                        <p className="text-xs text-muted-foreground pl-5">
                          +{plan.features.length - 5} more features
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-3 mt-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-muted-foreground">Total</span>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">Rs.</span>
                        <span className="font-display text-2xl font-bold ml-1">{plan.price}</span>
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
        </motion.div>
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
