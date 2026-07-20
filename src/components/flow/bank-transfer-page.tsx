"use client";

import { m } from "framer-motion";
import { ArrowLeft, ArrowRight, Building, Copy, CheckCircle2, MessageCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import type { FlowData } from "@/lib/flow-types";
import { planDetails } from "@/lib/flow-types";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

interface BankTransferPageProps {
  flowData: FlowData;
  onBack: () => void;
  onGoDashboard: () => void;
  crumbs: { label: string; onClick?: () => void }[];
}

export function BankTransferPage({ flowData, onBack, onGoDashboard, crumbs }: BankTransferPageProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const plan = planDetails[flowData.selectedPlan || "classic"];
  const basePrice = flowData.paymentDone ? 0 : parseInt(plan.price.replace(/,/g, ""));
  const addedQuota = Math.max(0, (flowData.guestLinksQuota || 0) - (flowData.originalGuestLinksQuota || 0));
  const total = basePrice + (addedQuota / 50 * 1000);
  const formattedTotal = total.toLocaleString("en-PK");

  const bankDetails = [
    { label: "Bank Name", value: "Askari Bank Limited" },
    { label: "Account Title", value: "Rauf Khalid" },
    { label: "Account Number", value: "00700320241011" },
    { label: "IBAN", value: "PK35ASCM0000700320241011" },
  ];

  const handleCopy = (value: string, fieldLabel: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(fieldLabel);
    toast.success(`${fieldLabel} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const whatsappNumber = "447517879333";
  const prefilledMessage = `Hi! I just placed an order on ShaadiLink.
Invitation ID: *${flowData.invitationId || "N/A"}*
Plan: *${plan.name}*
Total Paid: *Rs. ${formattedTotal}*

Here is my payment screenshot:`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(prefilledMessage)}`;

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
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="w-16" />
          </div>
        </div>
      </header>

      {/* Breadcrumb path */}
      <PageBreadcrumb crumbs={crumbs} />

      <main className="flex-1 px-4 py-8 sm:py-12">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl"
        >
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Manual Bank Transfer
            </h1>
            <p className="mt-2 text-muted-foreground text-sm">
              {flowData.paymentDone && addedQuota > 0
                ? `Transfer the exact amount below to top up ${addedQuota} guest links on your invitation.`
                : 'Please transfer the exact amount to the account below to activate your invitation.'
              }
            </p>
          </div>

          <div className="space-y-6">
            {/* Amount Box */}
            <div className="p-6 rounded-2xl border border-gold bg-gold/5 text-center">
              <div className="text-sm text-gold-light mb-1 uppercase tracking-wider font-semibold">Total Amount to Pay</div>
              <div className="text-4xl font-display font-bold text-white">Rs. {formattedTotal}</div>
            </div>

            {/* Bank Details Box */}
            <div className="p-6 rounded-2xl border border-border bg-card">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Building className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg">Bank Account Details</h3>
                  <p className="text-xs text-muted-foreground">Transfer via your banking app</p>
                </div>
              </div>

              <div className="space-y-4">
                {bankDetails.map((detail) => (
                  <div key={detail.label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <span className="text-sm text-muted-foreground">{detail.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-medium text-sm text-foreground">{detail.value}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleCopy(detail.value, detail.label)}
                        title={`Copy ${detail.label}`}
                      >
                        {copiedField === detail.label ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions & Actions */}
            <div className="p-6 rounded-2xl border border-border bg-muted/30">
              <div className="flex items-start gap-3 mb-6">
                <Info className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Next Steps:</strong> Once you have completed the transfer, please take a screenshot of the transaction receipt. Send the screenshot to our WhatsApp number so we can verify your payment and activate your invitation immediately.
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className="flex-1 h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold gap-2"
                  onClick={() => window.open(whatsappUrl, "_blank")}
                >
                  <MessageCircle className="w-5 h-5" />
                  Share Screenshot on WhatsApp
                </Button>
                
                <Button
                  variant="outline"
                  className="flex-1 h-12 font-medium"
                  onClick={onGoDashboard}
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

          </div>
        </m.div>
      </main>
    </div>
  );
}
