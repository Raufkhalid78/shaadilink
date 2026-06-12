"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Plus, ExternalLink, Trash2, Users, MessageSquare, Calendar,
  Copy, Check, LayoutDashboard, LogOut, Loader2, Crown, Sparkles, X, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { FlowData } from "@/lib/flow-types";

interface Invitation {
  id: string;
  template_id: string;
  plan: string;
  partner1_name: string;
  partner2_name: string;
  venue: string;
  hero_image_url: string;
  is_active: boolean;
  created_at: string;
  events: { id: string; name: string; date: string; time: string; order_index: number }[];
  rsvps: { id: string; status: string }[];
  wishes: { id: string }[];
}

interface DashboardPageProps {
  flowData: FlowData;
  onCreateNew: () => void;
  onViewInvitation: (invitationId: string) => void;
  onEditInvitation: (invitationId: string) => void;
  onSignOut: () => void;
  onUpgradeInvitation?: (invitationId: string) => void;
}

interface RSVP {
  id: string;
  guest_name: string;
  guest_email: string | null;
  status: 'accept' | 'decline';
  created_at: string;
}

interface Wish {
  id: string;
  sender_name: string;
  message: string;
  created_at: string;
}

export function DashboardPage({
  flowData,
  onCreateNew,
  onViewInvitation,
  onEditInvitation,
  onSignOut,
  onUpgradeInvitation,
}: DashboardPageProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // RSVP Drawer State
  const [rsvpDrawerOpen, setRsvpDrawerOpen] = useState(false);
  const [rsvpInvId, setRsvpInvId] = useState<string | null>(null);
  const [rsvpList, setRsvpList] = useState<RSVP[]>([]);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  // Wishes Drawer State
  const [wishesDrawerOpen, setWishesDrawerOpen] = useState(false);
  const [wishesInvId, setWishesInvId] = useState<string | null>(null);
  const [wishesList, setWishesList] = useState<Wish[]>([]);
  const [wishesLoading, setWishesLoading] = useState(false);

  const loadInvitations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/invitations");
      if (res.ok) {
        const data = await res.json();
        setInvitations(data.invitations || []);
      } else if (res.status === 401) {
        toast.error("Please log in to view your dashboard.");
      }
    } catch {
      toast.error("Could not load invitations.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOpenRsvps = async (invId: string) => {
    setRsvpInvId(invId);
    setRsvpDrawerOpen(true);
    setRsvpLoading(true);
    try {
      const res = await fetch(`/api/invitations/${invId}/rsvp`);
      if (res.ok) {
        const data = await res.json();
        setRsvpList(data.rsvps || []);
      } else {
        toast.error("Failed to load RSVP details.");
      }
    } catch {
      toast.error("Error loading RSVPs.");
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleOpenWishes = async (invId: string) => {
    setWishesInvId(invId);
    setWishesDrawerOpen(true);
    setWishesLoading(true);
    try {
      const res = await fetch(`/api/invitations/${invId}/wishes`);
      if (res.ok) {
        const data = await res.json();
        setWishesList(data.wishes || []);
      } else {
        toast.error("Failed to load blessings.");
      }
    } catch {
      toast.error("Error loading wishes.");
    } finally {
      setWishesLoading(false);
    }
  };

  const handleDeleteWish = async (wishId: string) => {
    if (!wishesInvId) return;
    if (!confirm("Are you sure you want to delete this wish?")) return;
    try {
      const res = await fetch(`/api/invitations/${wishesInvId}/wishes?wishId=${wishId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setWishesList((prev) => prev.filter((w) => w.id !== wishId));
        // Also update local invitations wishes count
        setInvitations((prev) =>
          prev.map((inv) => {
            if (inv.id === wishesInvId) {
              return {
                ...inv,
                wishes: inv.wishes.filter((w) => w.id !== wishId),
              };
            }
            return inv;
          })
        );
        toast.success("Blessing deleted successfully.");
      } else {
        toast.error("Failed to delete blessing.");
      }
    } catch {
      toast.error("Error deleting wish.");
    }
  };

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  const handleDelete = async (id: string, partnerNames: string) => {
    if (!confirm(`Delete invitation for ${partnerNames}? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/invitations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInvitations((prev) => prev.filter((inv) => inv.id !== id));
        toast.success("Invitation deleted.");
      } else {
        toast.error("Failed to delete invitation.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyLink = async (id: string) => {
    const link = `${window.location.origin}/inv/${id}`;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const el = document.createElement("textarea");
      el.value = link;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedId(id);
    toast.success("Link copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out successfully.");
    onSignOut();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-PK", {
      day: "numeric", month: "short", year: "numeric"
    });
  };

  const getNextEventDate = (events: Invitation["events"]) => {
    const sorted = events
      .filter((e) => e.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted[0]?.date ? formatDate(sorted[0].date) : "No date set";
  };

  const isWeddingPassed = (events: Invitation["events"]) => {
    if (!events || events.length === 0) return false;
    const dates = events
      .filter((e) => e.date && e.date.includes("-"))
      .map((e) => {
        const parts = e.date.split("-");
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        return new Date(y, m, d).getTime();
      })
      .filter((t) => !isNaN(t));

    if (dates.length === 0) return false;
    const latestDate = Math.max(...dates);

    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    return todayMidnight > latestDate;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald text-primary-foreground">
                <Heart className="h-4 w-4 fill-current" />
              </div>
              <span className="font-display text-lg font-bold">
                Shaadi<span className="text-gold">Link</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <LayoutDashboard className="w-4 h-4" />
                <span>{flowData.email || "My Dashboard"}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          {/* Page title */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                My Invitations
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage and share your digital wedding invitations
              </p>
            </div>
            <Button
              onClick={onCreateNew}
              className="bg-gold hover:bg-gold-light text-emerald-dark font-semibold gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Create New Invitation
            </Button>
          </motion.div>

          {/* Stats row */}
          {!isLoading && invitations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="grid grid-cols-3 gap-4 mb-8"
            >
              {[
                {
                  label: "Total Invitations",
                  value: invitations.length,
                  icon: Heart,
                  color: "text-emerald",
                },
                {
                  label: "Total RSVPs",
                  value: invitations.reduce((sum, inv) => sum + (inv.rsvps?.length || 0), 0),
                  icon: Users,
                  color: "text-gold",
                },
                {
                  label: "Total Wishes",
                  value: invitations.reduce((sum, inv) => sum + (inv.wishes?.length || 0), 0),
                  icon: MessageSquare,
                  color: "text-blue-400",
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="border-border/50">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`${stat.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </motion.div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              <p className="text-muted-foreground text-sm">Loading your invitations...</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && invitations.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-20 gap-4 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-gold" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">No invitations yet</h2>
                <p className="text-muted-foreground text-sm mt-1 max-w-xs">
                  Create your first beautiful digital wedding invitation and share it with your guests.
                </p>
              </div>
              <Button
                onClick={onCreateNew}
                className="bg-emerald hover:bg-emerald-dark text-primary-foreground font-semibold gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Invitation
              </Button>
            </motion.div>
          )}

          {/* Invitation cards */}
          {!isLoading && invitations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {invitations.map((inv, idx) => {
                const templateName = inv.template_id
                  ?.split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ") || "Template";
                const acceptedRsvps = inv.rsvps?.filter((r) => r.status === "accept").length || 0;
                const declinedRsvps = inv.rsvps?.filter((r) => r.status === "decline").length || 0;
                const passed = isWeddingPassed(inv.events || []);

                return (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.06 }}
                  >
                    <Card className="border-border/50 hover:border-gold/30 transition-all group overflow-hidden">
                      {/* Hero image / placeholder */}
                      <div className="relative aspect-[16/9] bg-gradient-to-br from-emerald/20 to-gold/10 overflow-hidden">
                        {inv.hero_image_url ? (
                          <img
                            src={inv.hero_image_url}
                            alt="Invitation hero"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Heart className="w-10 h-10 text-gold/40" />
                          </div>
                        )}
                        {/* Active badge */}
                        <div className="absolute top-2 left-2">
                          {inv.is_active ? (
                            <Badge className="bg-emerald/90 text-white text-[10px] border-0">
                              ● Live
                            </Badge>
                          ) : (
                            <Badge className="bg-black/60 text-white/70 text-[10px] border-0">
                              Draft
                            </Badge>
                          )}
                        </div>
                        {/* Plan badge & Upgrade option */}
                        <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5 z-10">
                          <Badge
                            className={
                              inv.plan === "royal"
                                ? "bg-gold/90 text-emerald-dark text-[10px] border-0"
                                : "bg-white/20 text-white text-[10px] border-0"
                            }
                          >
                            {inv.plan === "royal" && <Crown className="w-2.5 h-2.5 mr-0.5" />}
                            {inv.plan}
                          </Badge>
                          {inv.plan !== "royal" && !passed && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpgradeInvitation?.(inv.id);
                              }}
                              className="text-[9px] bg-gold/20 hover:bg-gold/30 text-gold border border-gold/30 hover:border-gold/50 px-1.5 py-0.5 rounded transition-all flex items-center gap-0.5 font-semibold shadow-sm backdrop-blur-md cursor-pointer"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-gold shrink-0 animate-pulse" />
                              Upgrade to Royal
                            </button>
                          )}
                        </div>
                      </div>

                      <CardContent className="p-4 space-y-3">
                        {/* Names */}
                        <div>
                          <h3 className="font-display font-bold text-foreground leading-tight">
                            {inv.partner1_name || "Partner 1"} &amp; {inv.partner2_name || "Partner 2"}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{templateName}</p>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <button
                            onClick={() => handleOpenRsvps(inv.id)}
                            className="flex items-center gap-1 hover:text-gold transition-colors duration-200"
                            aria-label="View RSVP details"
                          >
                            <Users className="w-3 h-3 text-emerald" />
                            {acceptedRsvps} accepted · {declinedRsvps} declined
                          </button>
                          <button
                            onClick={() => handleOpenWishes(inv.id)}
                            className="flex items-center gap-1 hover:text-gold transition-colors duration-200"
                            aria-label="Manage wishes"
                          >
                            <MessageSquare className="w-3 h-3 text-gold" />
                            {inv.wishes?.length || 0} wishes
                          </button>
                        </div>

                        {/* Next event */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Next: {getNextEventDate(inv.events || [])}</span>
                        </div>

                        {/* Created date */}
                        <p className="text-[10px] text-muted-foreground/60">
                          Created {formatDate(inv.created_at)}
                        </p>

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            onClick={() => onViewInvitation(inv.id)}
                            className="flex-1 h-8 bg-emerald hover:bg-emerald-dark text-primary-foreground text-xs gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={passed}
                            onClick={() => onEditInvitation(inv.id)}
                            className="flex-1 h-8 border-gold/30 text-gold hover:bg-gold/10 text-xs gap-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:text-muted-foreground disabled:border-border"
                          >
                            {passed ? (
                              <>
                                <Lock className="w-3 h-3" />
                                Locked
                              </>
                            ) : (
                              inv.is_active ? "Edit" : "Publish"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyLink(inv.id)}
                            className="h-8 px-2.5 border-gold/30 text-gold hover:bg-gold/10"
                            aria-label="Copy invitation link"
                          >
                            {copiedId === inv.id ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(inv.id, `${inv.partner1_name} & ${inv.partner2_name}`)}
                            disabled={deletingId === inv.id}
                            className="h-8 px-2.5 border-red-400/30 text-red-400 hover:bg-red-400/10"
                            aria-label="Delete invitation"
                          >
                            {deletingId === inv.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* RSVP Modal/Drawer */}
      <AnimatePresence>
        {rsvpDrawerOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRsvpDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-background border-l border-border shadow-2xl p-6 flex flex-col z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">RSVP Guest List</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Detailed attendance list for this wedding
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRsvpDrawerOpen(false)}
                  className="rounded-full w-8 h-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-lg border border-emerald/15 bg-emerald/5 text-center">
                  <span className="block text-2xl font-bold text-emerald">
                    {rsvpList.filter((r) => r.status === "accept").length}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Attending</span>
                </div>
                <div className="p-3 rounded-lg border border-red-500/15 bg-red-500/5 text-center">
                  <span className="block text-2xl font-bold text-red-400">
                    {rsvpList.filter((r) => r.status === "decline").length}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Declined</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {rsvpLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald" />
                    <span className="text-xs text-muted-foreground">Loading guests...</span>
                  </div>
                ) : rsvpList.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No RSVP responses received yet.</p>
                  </div>
                ) : (
                  rsvpList.map((rsvp) => (
                    <div
                      key={rsvp.id}
                      className="p-3.5 rounded-xl border border-border/40 bg-muted/10 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-semibold text-sm text-foreground">{rsvp.guest_name}</p>
                        {rsvp.guest_email && (
                          <p className="text-xs text-muted-foreground">{rsvp.guest_email}</p>
                        )}
                        <p className="text-[9px] text-muted-foreground/60 mt-1">
                          {new Date(rsvp.created_at).toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <Badge
                        className={
                          rsvp.status === "accept"
                            ? "bg-emerald/10 text-emerald hover:bg-emerald/20 border-emerald/20"
                            : "bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20"
                        }
                      >
                        {rsvp.status === "accept" ? "Attending" : "Declined"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wishes Modal/Drawer */}
      <AnimatePresence>
        {wishesDrawerOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWishesDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-background border-l border-border shadow-2xl p-6 flex flex-col z-10"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Guest Blessings</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Read and moderate wishes sent by wedding guests
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setWishesDrawerOpen(false)}
                  className="rounded-full w-8 h-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {wishesLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald" />
                    <span className="text-xs text-muted-foreground">Loading blessings...</span>
                  </div>
                ) : wishesList.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No blessings or wishes received yet.</p>
                  </div>
                ) : (
                  wishesList.map((wish) => (
                    <div
                      key={wish.id}
                      className="p-3.5 rounded-xl border border-border/40 bg-muted/10 flex flex-col gap-2 relative group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-sm text-foreground">{wish.sender_name}</p>
                          <p className="text-[9px] text-muted-foreground/60">
                            {new Date(wish.created_at).toLocaleDateString("en-PK", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteWish(wish.id)}
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 sm:transition-opacity duration-200"
                          aria-label="Delete wish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed italic bg-background/50 p-2.5 rounded-lg border border-border/20">
                        "{wish.message}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
