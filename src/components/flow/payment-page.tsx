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
    return true; // No validation needed for beta launch
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
              Special Launch Offer: Create your invitation for free during our beta period.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Payment Form */}
            <div className="md:col-span-3 space-y-6">
              <div className="p-6 rounded-2xl border border-emerald/30 bg-emerald/5 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-emerald" />
                </div>
                <h2 className="font-display text-xl font-semibold text-emerald-light">Beta Launch Special</h2>
                <p className="text-muted-foreground">
                  As an early adopter of ShaadiLink, your invitation is completely <strong className="text-white">FREE</strong>.
                  Skip the payment step and publish your invitation instantly!
                </p>
              </div>

              {/* Pay button */}
              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full h-12 bg-gold hover:bg-gold-light text-emerald-dark font-semibold text-base gap-2"
              >
                {processing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : (
                  <>Claim Free Access & Publish <ArrowRight className="w-4 h-4" /></>
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

                  <div className="border-t border-border/50 pt-3 mt-3 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1 pr-4">
                        <span className="font-medium text-sm">Personalized Guest Links</span>
                        <span className="text-xs text-muted-foreground">Up to 50 unique links to track individual RSVPs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">+ Rs. 1,000</span>
                        <button
                          type="button"
                          onClick={() => onUpdateData({ personalizedGuestLinks: !flowData.personalizedGuestLinks })}
                          className={`w-10 h-5 rounded-full transition-colors relative flex items-center shrink-0 ${
                            flowData.personalizedGuestLinks ? "bg-emerald" : "bg-muted"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow-sm absolute transition-transform ${
                              flowData.personalizedGuestLinks ? "translate-x-5" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-3 mt-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-muted-foreground">Total</span>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">Rs.</span>
                        <span className="font-display text-2xl font-bold ml-1">
                          {(() => {
                            const basePrice = parseInt(plan.price.replace(/,/g, ""));
                            const total = basePrice + (flowData.personalizedGuestLinks ? 1000 : 0);
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
