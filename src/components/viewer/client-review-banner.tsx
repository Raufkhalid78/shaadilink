"use client";

import React, { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { CheckCircle2, MessageSquare, Sparkles, X, ChevronDown, Check, Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { ConfettiDisplay } from "./effects/confetti";
import { toast } from "sonner";
import type { FlowData } from "@/lib/flow-types";

interface ClientReviewBannerProps {
  flowData?: FlowData;
  templateId?: string;
  viewsCount?: number;
  maxViews?: number;
}

function formatWhatsAppNumber(phone?: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    return "92" + cleaned.slice(1);
  }
  return cleaned;
}

export function ClientReviewBanner({ flowData, templateId, viewsCount, maxViews }: ClientReviewBannerProps) {
  const [isApproved, setIsApproved] = useState(flowData?.clientApprovalStatus === "approved");
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Extract views from query param if not directly passed via props
  const queryViews = typeof window !== "undefined" ? parseInt(new URLSearchParams(window.location.search).get("v") || "", 10) : undefined;
  const effectiveViews = viewsCount ?? (!isNaN(queryViews as any) ? queryViews : undefined);
  const effectiveMax = maxViews ?? 7;

  // Set 30-minute session cookie so refreshing on the same device does not burn extra views
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.classList.add("client-review-active");
      const urlToken = new URLSearchParams(window.location.search).get("token");
      const invId = flowData?.invitationId;
      if (urlToken && invId) {
        document.cookie = `smartinvites_review_sess_${invId}=${encodeURIComponent(urlToken.trim())}; path=/; max-age=1800; SameSite=Lax`;
      }
      return () => {
        document.body.classList.remove("client-review-active");
      };
    }
  }, [flowData?.invitationId]);

  const title = flowData?.partner1Name && flowData?.partner2Name
    ? `${flowData.partner1Name} & ${flowData.partner2Name}`
    : flowData?.partner1Name || "Event Invitation";

  const queryPhone = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("agencyPhone") || "" : "";
  const rawPhone = queryPhone || flowData?.agencyPhone || flowData?.contactPhone || "";
  const waPhone = formatWhatsAppNumber(rawPhone);
  const agencyOrHost = flowData?.agencyName || "your Event Planner / Host";

  const getUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  };

  const getInvKey = () => {
    if (flowData?.invitationId) return flowData.invitationId;
    if (flowData?.slug) return flowData.slug;
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.split("/").filter(Boolean);
      return parts[parts.length - 1] || "";
    }
    return "";
  };

  const handleConfirmApproval = async (viaWhatsApp: boolean) => {
    setIsApproved(true);
    setShowConfetti(true);
    setIsApprovalModalOpen(false);
    setTimeout(() => setShowConfetti(false), 4500);

    toast.success("🎉 Draft Approved! Your event planner has been notified via email & dashboard.");

    // Persist approval to database
    const invKey = getInvKey();
    if (invKey) {
      fetch(`/api/invitations/${invKey}/approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      }).catch(console.error);
    }

    if (viaWhatsApp && typeof window !== "undefined") {
      const msg = encodeURIComponent(
        `Salam! 🎉 I have reviewed our invitation draft for *${title}* on Smart Invites and it looks perfect! Everything is approved to proceed and publish.\n\nPreview Link: ${getUrl()}`
      );
      const waUrl = waPhone ? `https://wa.me/${waPhone}?text=${msg}` : `https://wa.me/?text=${msg}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleSendFeedback = (viaWhatsApp: boolean = false) => {
    if (!feedbackText.trim()) {
      toast.error("Please enter your changes or feedback before submitting.");
      return;
    }

    setIsFeedbackModalOpen(false);
    toast.success("✏️ Feedback sent! Your event planner has received your revision notes via email.");

    // Persist feedback to database
    const invKey = getInvKey();
    if (invKey) {
      fetch(`/api/invitations/${invKey}/approval`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "changes_requested", notes: feedbackText.trim() }),
      }).catch(console.error);
    }

    if (viaWhatsApp && typeof window !== "undefined") {
      const msg = encodeURIComponent(
        `Salam! ✏️ I have reviewed our invitation draft for *${title}* on Smart Invites. Here are the edits/changes we would like to make:\n\n${feedbackText.trim()}\n\nPreview Link: ${getUrl()}`
      );
      const waUrl = waPhone ? `https://wa.me/${waPhone}?text=${msg}` : `https://wa.me/?text=${msg}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }
    setFeedbackText("");
  };

  return (
    <>
      <ConfettiDisplay show={showConfetti} />

      {/* Top Sticky Review Banner */}
      <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-auto client-review-banner-root">
        <div className="bg-zinc-950/95 backdrop-blur-xl border-b border-amber-500/30 text-white shadow-2xl transition-all">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
            
            {/* Left info column */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-300">
                  Client Review Mode
                </span>
                {effectiveViews !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold flex items-center gap-1 border ${
                      effectiveViews >= effectiveMax
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                        : effectiveViews >= effectiveMax - 2
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    }`}
                    title={`Confidential Review: ${effectiveViews} of ${effectiveMax} allowed view sessions consumed`}
                  >
                    <span>👁️</span>
                    <span>{effectiveViews}/{effectiveMax} Views</span>
                  </span>
                )}
                <span className="text-xs text-zinc-300 font-medium hidden md:inline truncate max-w-xs">
                  {title} • Interactive Draft
                </span>
              </div>

              {/* Mobile collapse toggle */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="sm:hidden text-zinc-400 hover:text-white p-1"
                aria-label="Toggle banner"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Content & Actions */}
            {!isCollapsed && (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {isApproved ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approved by Client</span>
                  </div>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsFeedbackModalOpen(true)}
                      className="h-7 sm:h-8 px-2.5 text-[11px] sm:text-xs border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white gap-1.5"
                    >
                      <MessageSquare className="w-3 h-3 text-amber-400" />
                      <span>Request Changes</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => setIsApprovalModalOpen(true)}
                      className="h-7 sm:h-8 px-3 text-[11px] sm:text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/50 gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Draft</span>
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bottom Subtle Watermark */}
      <div className="fixed bottom-3 right-3 z-[9998] pointer-events-none hidden sm:block">
        <div className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[10px] text-zinc-400 font-mono tracking-wide shadow-lg">
          Draft Preview • Smart Invites
        </div>
      </div>

      {/* Approval Confirmation Modal */}
      <AnimatePresence>
        {isApprovalModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-900 border border-amber-500/30 rounded-3xl p-6 sm:p-7 text-white space-y-5 shadow-2xl relative"
            >
              <button
                onClick={() => setIsApprovalModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-lg sm:text-xl font-bold font-display">Approve Invitation Draft</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  You are approving the layout, doors, animations, background music, schedule, and maps for{" "}
                  <strong className="text-white">{title}</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>What happens next:</span>
                </div>
                <p className="text-[11px] text-zinc-400 pl-5">
                  Your event planner or host will receive confirmation to publish the final card and generate personalized guest links.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <Button
                  onClick={() => handleConfirmApproval(true)}
                  className="w-full h-10 bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  <WhatsAppIcon className="w-4 h-4 text-black" />
                  <span>Send Approval via WhatsApp</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleConfirmApproval(false)}
                  className="w-full h-9 border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs rounded-xl"
                >
                  Confirm Approval on this Screen
                </Button>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>

      {/* Revision Request Feedback Modal */}
      <AnimatePresence>
        {isFeedbackModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 text-white space-y-4 shadow-2xl relative"
            >
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="text-lg font-bold font-display flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Request Revisions</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Write down any changes or corrections you would like made to the text, timing, or photos.
                </p>
              </div>

              <div className="space-y-2">
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="e.g. Please change the Baraat time to 8:30 PM, update the venue address to Hall 2, and switch the background music track..."
                  className="w-full h-32 p-3 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/60 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="flex-1 h-9 border-zinc-700 hover:bg-zinc-800 text-zinc-300 text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSendFeedback(!!waPhone)}
                  className="flex-1 h-9 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-amber-950/40"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Planner</span>
                </Button>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
