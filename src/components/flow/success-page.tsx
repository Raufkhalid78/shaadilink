"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check, Copy, ExternalLink, Share2, Sparkles, PartyPopper, LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { FlowData } from "@/lib/flow-types";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

interface SuccessPageProps {
  flowData: FlowData;
  onViewInvitation: () => void;
  onGoToDashboard: () => void;
}

export function SuccessPage({ flowData, onViewInvitation, onGoToDashboard }: SuccessPageProps) {
  const [copied, setCopied] = useState(false);

  // Use real invitationId for unique link; fall back to template for demo mode
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const invitationLink = flowData.invitationId
    ? `${baseUrl}/inv/${flowData.invitationId}`
    : `${baseUrl}/demo/${flowData.selectedTemplateId || "emerald-noir"}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      try {
        const textarea = document.createElement("textarea");
        textarea.value = invitationLink;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        toast.success("Link copied!");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Could not copy automatically. Please copy the link manually.");
      }
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `You're invited! 🎉 View our wedding invitation: ${invitationLink}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const templateName =
    flowData.selectedTemplateId
      ?.split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "Template";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Compact header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onGoToDashboard}
              className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald text-primary-foreground">
                <PartyPopper className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-bold">
                Shaadi<span className="text-gold">Link</span>
              </span>
            </div>
            <div className="w-24" />
          </div>
        </div>
      </header>

      {/* Breadcrumb path */}
      <PageBreadcrumb
        crumbs={[
          { label: "Home", onClick: onGoToDashboard },
          { label: "Dashboard", onClick: onGoToDashboard },
          { label: "Invitation Ready! 🎉" },
        ]}
      />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-lg text-center"
        >
          {/* Animated success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
            className="mx-auto mb-6"
          >
            <div className="relative inline-flex">
              <div className="w-20 h-20 rounded-full bg-emerald/10 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="w-14 h-14 rounded-full bg-emerald flex items-center justify-center"
                >
                  <Check className="w-7 h-7 text-primary-foreground" />
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: -10 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -top-2 -right-2"
              >
                <PartyPopper className="w-6 h-6 text-gold" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: -10 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -bottom-1 -left-2"
              >
                <Sparkles className="w-5 h-5 text-gold/60" />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Your Invitation is <span className="gold-shimmer">Ready!</span>
            </h1>
            <p className="mt-3 text-muted-foreground text-base max-w-md mx-auto">
              Your beautiful <span className="text-gold font-semibold">{templateName}</span>{" "}
              invitation has been created. Share it with your guests!
            </p>
          </motion.div>

          {/* Invitation Link */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-2 block">
              Your Invitation Link
            </label>
            <div className="flex items-center gap-2 max-w-md mx-auto">
              <div className="flex-1 px-4 py-3 bg-muted/50 rounded-lg border border-border/50 text-sm text-foreground truncate text-left font-mono">
                {invitationLink}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0 h-11 w-11 border-gold/30 text-gold hover:bg-gold/10"
                aria-label="Copy link"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 space-y-3"
          >
            <Button
              onClick={onViewInvitation}
              className="w-full max-w-md h-12 bg-emerald hover:bg-emerald-dark text-primary-foreground border border-gold/30 font-semibold text-base gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Your Invitation
            </Button>

            <div className="flex gap-3 max-w-md mx-auto">
              <Button
                variant="outline"
                onClick={handleWhatsApp}
                className="flex-1 h-11 border-emerald/30 text-emerald hover:bg-emerald/10 gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share via WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={onGoToDashboard}
                className="flex-1 h-11 border-gold/30 text-gold hover:bg-gold/10 gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
            </div>
          </motion.div>

          {/* Summary card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-10 p-5 rounded-2xl border border-border/50 bg-card text-left max-w-md mx-auto"
          >
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">
              Invitation Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Couple</span>
                <span className="font-medium">
                  {flowData.partner1Name || "Partner 1"} &amp; {flowData.partner2Name || "Partner 2"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Template</span>
                <span className="font-medium text-gold">{templateName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium capitalize">{flowData.selectedPlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Events</span>
                <span className="font-medium">
                  {flowData.events.filter((e) => e.name).length || flowData.events.length} events
                </span>
              </div>
              {flowData.invitationId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono text-xs text-muted-foreground truncate max-w-[160px]">
                    {flowData.invitationId}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
