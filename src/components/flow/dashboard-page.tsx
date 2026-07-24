"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import {
  Heart, Plus, ExternalLink, Trash2, Users, MessageSquare, Calendar,
  Copy, Check, LayoutDashboard, LogOut, Loader2, Crown, Sparkles, X, Lock,
  ArrowLeft, Share2, Home, Activity, QrCode, Eye, Download,
} from "lucide-react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { FlowData } from "@/lib/flow-types";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { TEMPLATE_THEMES } from "@/components/viewer/themes";
import { Star } from "lucide-react";

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
  view_count?: number;
  slug?: string;
  guest_links_quota?: number;
}

interface DashboardPageProps {
  flowData: FlowData;
  onCreateNew: () => void;
  onViewInvitation: (invitationId: string) => void;
  onEditInvitation: (invitationId: string) => void;
  onSignOut: () => void;
  onUpgradeInvitation?: (invitationId: string) => void;
  onBuyMoreLinks?: (invitationId: string) => void;
  onGoHome?: () => void;
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
  onBuyMoreLinks,
  onGoHome,
}: DashboardPageProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrInvUrl, setQrInvUrl] = useState<string | null>(null);

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

  // Review states
  const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false);
  const [reviewInvId, setReviewInvId] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmittedMap, setReviewSubmittedMap] = useState<Record<string, boolean>>({});

  // Guest Links Drawer State
  const [guestLinksDrawerOpen, setGuestLinksDrawerOpen] = useState(false);
  const [guestLinksInvId, setGuestLinksInvId] = useState<string | null>(null);
  const [newGuestName, setNewGuestName] = useState("");
  const [selectedEventSlugs, setSelectedEventSlugs] = useState<string[]>([]);
  const [guestSeats, setGuestSeats] = useState<number>(1);
  const [generatedLinks, setGeneratedLinks] = useState<{id: string, name: string, url: string, events?: string[], seats?: number | null}[]>([]);
  const [guestLinksLoading, setGuestLinksLoading] = useState(false);

  // Normalise a DB guest_link row → frontend shape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapLink = (row: any) => ({
    id: row.id,
    name: row.guest_name ?? row.name ?? '',
    url: row.url,
    events: row.allowed_events ?? row.events ?? [],
    seats: row.seats ?? null,
  });


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


  const handleOpenGuestLinks = async (invId: string) => {
    setGuestLinksInvId(invId);
    setGuestLinksDrawerOpen(true);
    setNewGuestName("");
    setGuestSeats(1);
    setGeneratedLinks([]);
    // Pre-select all events by default
    const inv = invitations.find(i => i.id === invId);
    if (inv?.events) {
      setSelectedEventSlugs(inv.events.map(e => e.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')));
    } else {
      setSelectedEventSlugs([]);
    }
    // Fetch from DB
    setGuestLinksLoading(true);
    try {
      const res = await fetch(`/api/invitations/${invId}/guest-links`);
      if (res.ok) {
        const data = await res.json();
        const dbLinks = data.links ?? [];
        // One-time migration: if DB is empty but localStorage has data, migrate silently
        if (dbLinks.length === 0) {
          const stored = localStorage.getItem(`guestLinks_${invId}`);
          if (stored) {
            const oldLinks: {name: string; url: string; events?: string[]; seats?: number}[] = JSON.parse(stored);
            for (const old of oldLinks) {
              const slug = old.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              await fetch(`/api/invitations/${invId}/guest-links`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  guestName: old.name,
                  guestSlug: slug,
                  url: old.url,
                  allowedEvents: old.events ?? null,
                  seats: old.seats ?? 1,
                }),
              });
            }
            localStorage.removeItem(`guestLinks_${invId}`);
            // Re-fetch after migration
            const res2 = await fetch(`/api/invitations/${invId}/guest-links`);
            if (res2.ok) {
              const data2 = await res2.json();
              setGeneratedLinks((data2.links ?? []).map(mapLink));
            }
          }
        } else {
          setGeneratedLinks(dbLinks.map(mapLink));
        }
      } else {
        toast.error('Failed to load guest links.');
      }
    } catch {
      toast.error('Error loading guest links.');
    } finally {
      setGuestLinksLoading(false);
    }
  };

  const toggleEventSlug = (slug: string) => {
    setSelectedEventSlugs(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const handleGenerateLink = async () => {
    if (!newGuestName.trim() || !guestLinksInvId) return;
    const inv = invitations.find(i => i.id === guestLinksInvId);
    if (!inv) return;
    const invSlug = inv.slug || guestLinksInvId;
    const guestSlug = newGuestName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://shaadilink.com.pk';

    // Build URL with optional event filter and seat count
    const allEventSlugs = (inv.events || []).map(e => e.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    const isAllEvents = allEventSlugs.length === 0 || selectedEventSlugs.length === allEventSlugs.length;
    let newUrl = `${baseUrl}/inv/${invSlug}?guest=${guestSlug}`;
    if (!isAllEvents && selectedEventSlugs.length > 0) {
      newUrl += `&events=${selectedEventSlugs.join(',')}`;
    }
    if (guestSeats >= 0) {
      newUrl += `&seats=${guestSeats}`;
    }

    // POST to API (quota enforced server-side)
    try {
      const res = await fetch(`/api/invitations/${guestLinksInvId}/guest-links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: newGuestName.trim(),
          guestSlug,
          url: newUrl,
          allowedEvents: isAllEvents ? null : selectedEventSlugs,
          seats: guestSeats,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to generate link.');
        return;
      }
      setGeneratedLinks(prev => [mapLink(data.link), ...prev]);
      setNewGuestName("");
      setGuestSeats(1);
      toast.success("Guest link generated!");
    } catch {
      toast.error('Error generating link.');
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!guestLinksInvId) return;
    try {
      const res = await fetch(`/api/invitations/${guestLinksInvId}/guest-links/${linkId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setGeneratedLinks(prev => prev.filter(l => l.id !== linkId));
        toast.success('Guest link removed.');
      } else {
        const data = await res.json();
        toast.error(data.error ?? 'Failed to remove link.');
      }
    } catch {
      toast.error('Error removing link.');
    }
  };

  const handleSendWhatsApp = (guestName: string, url: string) => {
    const text = encodeURIComponent(`Asalam o Alaikum ${guestName}! We would be honored to have your presence at our wedding. Here is your personalized invitation: ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
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
    const inv = invitations.find((i) => i.id === id);
    const link = `${window.location.origin}/inv/${inv?.slug || id}`;
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

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement | null;
    if (!canvas) {
      toast.error("Could not generate QR code image.");
      return;
    }
    try {
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "shaadilink-qr-code.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success("QR Code downloaded!");
    } catch {
      toast.error("Failed to download QR Code.");
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out successfully.");
    onSignOut();
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0 || !reviewMessage.trim()) {
      toast.error("Please provide a rating and a message.");
      return;
    }
    setReviewLoading(true);
    const supabase = createClient();
    try {
      const inv = invitations.find(i => i.id === reviewInvId);
      const templateName = inv?.template_id?.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Template";
      
      // Get user id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to leave a review.");
        return;
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitation_id: reviewInvId,
          rating: reviewRating,
          message: reviewMessage,
          template_name: templateName
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Thank you! Your review is pending approval.");
        setReviewSubmittedMap(prev => ({ ...prev, [reviewInvId]: true }));
        setReviewDrawerOpen(false);
      } else {
        toast.error(data.error || "Failed to submit review");
      }
    } catch (e) {
      toast.error("An error occurred");
    } finally {
      setReviewLoading(false);
    }
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
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Left: Home button + Logo */}
            <div className="flex items-center gap-3">
              {onGoHome && (
                <button
                  onClick={onGoHome}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors duration-200 shrink-0"
                  aria-label="Go to Home"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-medium">Home</span>
                </button>
              )}
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald text-primary-foreground">
                  <Heart className="h-4 w-4 fill-current" />
                </div>
                <span className="font-display text-lg font-bold">
                  Shaadi<span className="text-gold">Link</span>
                </span>
              </div>
            </div>

            {/* Right: user info + sign out */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end">
                {flowData.fullName && (
                  <span className="text-xs font-semibold text-foreground leading-none">{flowData.fullName}</span>
                )}
                <span className="text-[11px] text-muted-foreground leading-none mt-0.5 max-w-[160px] truncate">
                  {flowData.email || "My Dashboard"}
                </span>
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

      {/* Breadcrumb */}
      <PageBreadcrumb
        crumbs={[
          { label: "Home", onClick: onGoHome },
          { label: "My Dashboard" },
        ]}
      />

      <main id="main-content" className="flex-1 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          {/* Page title */}
          <m.div
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
          </m.div>

          {/* Stats row — 4 cards: 2×2 on mobile, 5-col on lg */}
          {!isLoading && invitations.length > 0 && (
            <m.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8"
            >
              {[
                {
                  label: "Total Invitations",
                  value: invitations.length,
                  icon: Heart,
                  color: "text-emerald",
                  bg: "bg-emerald/5 border-emerald/10",
                },
                {
                  label: "Live Now",
                  value: invitations.filter((i) => i.is_active).length,
                  icon: Activity,
                  color: "text-gold",
                  bg: "bg-gold/5 border-gold/10",
                },
                {
                  label: "Total RSVPs",
                  value: invitations.reduce((sum, inv) => sum + (inv.rsvps?.length || 0), 0),
                  icon: Users,
                  color: "text-blue-400",
                  bg: "bg-blue-400/5 border-blue-400/10",
                },
                {
                  label: "Total Wishes",
                  value: invitations.reduce((sum, inv) => sum + (inv.wishes?.length || 0), 0),
                  icon: MessageSquare,
                  color: "text-pink-400",
                  bg: "bg-pink-400/5 border-pink-400/10",
                },
                {
                  label: "Total Views",
                  value: invitations.reduce((sum, inv) => sum + (inv.view_count || 0), 0),
                  icon: Eye,
                  color: "text-indigo-400",
                  bg: "bg-indigo-400/5 border-indigo-400/10",
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className={`border ${stat.bg}`}>
                    <CardContent className="p-3 sm:p-4 flex items-center gap-3">
                      <div className={`${stat.color} shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">{stat.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </m.div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 py-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card border border-border/40 rounded-2xl p-5 h-96 flex flex-col justify-between animate-pulse">
                  <div className="space-y-3">
                    <div className="h-40 bg-muted/60 rounded-xl w-full" />
                    <div className="h-6 bg-muted/60 rounded w-3/4" />
                    <div className="h-4 bg-muted/60 rounded w-1/2" />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <div className="h-9 bg-muted/60 rounded w-full" />
                    <div className="h-9 bg-muted/60 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state — 3-step getting started guide */}
          {!isLoading && invitations.length === 0 && (
            <m.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-16 gap-6 text-center"
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

              {/* 3-step guide */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl mt-2">
                {[
                  { step: "1", icon: "🎨", title: "Pick a Template", desc: "Choose from Classic or Royal designs" },
                  { step: "2", icon: "✏️", title: "Add Your Details", desc: "Names, venue, events & photos" },
                  { step: "3", icon: "💌", title: "Share the Link", desc: "Send to unlimited guests instantly" },
                ].map((s) => (
                  <div key={s.step} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-card/50">
                    <span className="text-2xl">{s.icon}</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Step {s.step}</span>
                    <p className="text-sm font-semibold text-foreground">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                ))}
              </div>

              <Button
                onClick={onCreateNew}
                className="bg-emerald hover:bg-emerald-dark text-primary-foreground font-semibold gap-2 mt-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Invitation
              </Button>
            </m.div>
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
                const theme = TEMPLATE_THEMES[inv.template_id] || TEMPLATE_THEMES['emerald-noir'];

                return (
                  <m.div
                    key={inv.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.06 }}
                  >
                    <Card className="border-border/50 hover:border-gold/30 transition-all group overflow-hidden">
                      {/* Hero image / placeholder */}
                      <div 
                        className="relative aspect-[16/9] overflow-hidden group/thumb"
                        style={{
                          background: inv.hero_image_url ? undefined : `linear-gradient(135deg, ${theme.bgPrimary}, ${theme.bgSecondary})`
                        }}
                      >
                        {inv.hero_image_url ? (
                          <Image
                            src={inv.hero_image_url}
                            alt="Invitation hero"
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                            <div 
                              className="w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-sm relative"
                              style={{ 
                                backgroundColor: theme.bgDoor,
                                border: `2px solid ${theme.accent}` 
                              }}
                            >
                              <div 
                                className="absolute inset-0 rounded-full opacity-20"
                                style={{
                                  background: `repeating-linear-gradient(45deg, transparent, transparent 5px, ${theme.accent} 5px, ${theme.accent} 6px)`
                                }}
                              />
                              <Heart style={{ color: theme.accent, fill: theme.accent }} className="w-6 h-6 z-10 opacity-80" />
                            </div>
                            
                            {/* Decorative elements based on theme */}
                            <div 
                              className="absolute inset-0 opacity-10 pointer-events-none"
                              style={{
                                backgroundImage: `radial-gradient(circle at 20% 20%, ${theme.accent} 0%, transparent 40%), radial-gradient(circle at 80% 80%, ${theme.accent} 0%, transparent 40%)`
                              }}
                            />
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
                        {/* Names & template */}
                        <div>
                          <h3 className="font-display font-bold text-foreground leading-tight">
                            {inv.partner1_name || "Partner 1"} &amp; {inv.partner2_name || "Partner 2"}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{templateName}</p>
                          {/* Shareable URL for live invitations */}
                          {inv.is_active && (
                            <p className="text-[10px] text-emerald/70 font-mono mt-1 truncate">
                              shaadilink.com.pk/inv/{inv.slug || inv.id.slice(0, 8)}
                            </p>
                          )}
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

                        {/* Event pills */}
                        {inv.events && inv.events.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {inv.events.slice(0, 3).map((ev, ei) => (
                              <span
                                key={ei}
                                className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-muted border border-border/30 text-muted-foreground"
                              >
                                <Calendar className="w-2.5 h-2.5" />
                                {ev.name || "Event"}{ev.date ? ` · ${formatDate(ev.date)}` : ""}
                              </span>
                            ))}
                            {inv.events.length > 3 && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-muted border border-border/30 text-muted-foreground">
                                +{inv.events.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Next event */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Next: {getNextEventDate(inv.events || [])}</span>
                        </div>

                        {/* Created + updated dates */}
                        <p className="text-[10px] text-muted-foreground/60">
                          Created {formatDate(inv.created_at)}
                        </p>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2 pt-1">
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
                              inv.is_active ? "Edit" : "Complete Setup"
                            )}
                          </Button>
                          {/* Share button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const link = `${window.location.origin}/inv/${inv.slug || inv.id}`;
                              const text = encodeURIComponent(`You're invited! 🎉 View our wedding invitation: ${link}`);
                              window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
                            }}
                            className="h-8 px-2.5 border-emerald/30 text-emerald hover:bg-emerald/10"
                            aria-label="Share via WhatsApp"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </Button>
                          {inv.is_active && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenGuestLinks(inv.id)}
                              className="h-8 px-2.5 border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                              aria-label="Generate Personalized Guest Links"
                            >
                              <Users className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {inv.is_active && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setQrInvUrl(`${window.location.origin}/inv/${inv.slug || inv.id}`)}
                              className="h-8 px-2.5 border-indigo-400/30 text-indigo-400 hover:bg-indigo-400/10"
                              aria-label="Show QR Code"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </Button>
                          )}
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
                          {/* Review Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (reviewSubmittedMap[inv.id]) {
                                toast.info("You have already submitted a review for this invitation. Thank you!");
                                return;
                              }
                              setReviewInvId(inv.id);
                              setReviewRating(0);
                              setReviewMessage("");
                              setReviewDrawerOpen(true);
                            }}
                            className="flex-1 h-8 border-gold/30 text-gold hover:bg-gold/10 text-xs gap-1"
                          >
                            <Star className="w-3 h-3" />
                            Review
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </m.div>
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
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRsvpDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Panel */}
            <m.div
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

              <div className="flex justify-start mb-4">
                <a
                  href={`/api/invitations/${rsvpInvId}/export-rsvp`}
                  download
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-emerald/30 text-emerald hover:bg-emerald/10 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </a>
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
            </m.div>
          </div>
        )}
      </AnimatePresence>


      {/* Guest Links Modal/Drawer */}
      <AnimatePresence>
        {guestLinksDrawerOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            {/* Backdrop */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setGuestLinksDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Panel */}
            <m.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-background border-l border-border/40 shadow-2xl flex flex-col"
            >
              <div className="flex-1 flex flex-col h-full overflow-hidden p-6 gap-6">
                {/* Header */}
                <div className="flex items-start justify-between shrink-0">
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">Guest Links</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Generate personalized links for your guests
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setGuestLinksDrawerOpen(false)}
                    className="rounded-full w-8 h-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Generator Input */}
                <div className="shrink-0 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newGuestName}
                      onChange={(e) => setNewGuestName(e.target.value)}
                      placeholder="Enter guest name (e.g. Ali Family)"
                      className="flex-1 px-3 py-2 text-sm rounded-md border border-input bg-transparent shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald"
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerateLink()}
                    />
                  </div>

                  {/* Event Selection */}
                  {(() => {
                    const inv = invitations.find(i => i.id === guestLinksInvId);
                    const events = inv?.events || [];
                    if (events.length === 0) return null;
                    return (
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Invite to Events</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {events.sort((a, b) => a.order_index - b.order_index).map(event => {
                            const slug = event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                            const checked = selectedEventSlugs.includes(slug);
                            return (
                              <button
                                key={event.id}
                                onClick={() => toggleEventSlug(slug)}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                                  checked
                                    ? 'border-emerald bg-emerald/10 text-emerald'
                                    : 'border-border/50 bg-muted/20 text-muted-foreground hover:border-emerald/40'
                                }`}
                              >
                                <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 transition-all ${
                                  checked ? 'bg-emerald border-emerald' : 'border-border'
                                }`}>
                                  {checked && <Check className="w-2.5 h-2.5 text-white" />}
                                </span>
                                {event.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Seat Count + Generate */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 border border-border/50 rounded-md px-2.5 py-1.5 bg-muted/20">
                      <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground">Seats</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={guestSeats}
                        onChange={(e) => setGuestSeats(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-12 text-sm text-center bg-transparent focus:outline-none text-foreground font-medium"
                      />
                      {guestSeats === 0 && (
                        <span className="text-xs text-amber-400 font-medium whitespace-nowrap">= Whole Family</span>
                      )}
                    </div>
                    <Button onClick={handleGenerateLink} className="flex-1 bg-emerald hover:bg-emerald-dark text-white">
                      Generate Link
                    </Button>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="shrink-0 text-xs text-muted-foreground flex flex-col gap-2 bg-muted/50 px-3 py-2.5 rounded-md border border-border/50">
                  {(() => {
                    const inv = invitations.find(i => i.id === guestLinksInvId);
                    const quota = inv?.guest_links_quota || 0;
                    const used = generatedLinks.length;
                    const pct = quota > 0 ? Math.min((used / quota) * 100, 100) : 0;
                    return (
                      <>
                        <div className="flex justify-between items-center w-full">
                          {quota === 0 ? (
                            <span className="text-amber-400 font-medium">No guest links purchased yet</span>
                          ) : (
                            <span>
                              <span className={used >= quota ? 'text-red-400 font-semibold' : ''}>
                                {used} / {quota}
                              </span>
                              {' '}Links Generated
                              {used >= quota && <span className="ml-1 text-red-400">(Limit reached)</span>}
                            </span>
                          )}
                          <button
                            onClick={() => {
                              if (guestLinksInvId) {
                                onBuyMoreLinks?.(guestLinksInvId);
                              }
                            }}
                            className="text-xs text-gold hover:text-gold-light font-semibold underline cursor-pointer ml-2 shrink-0"
                          >
                            {quota === 0 ? 'Buy Links' : 'Buy More'}
                          </button>
                        </div>
                        {quota > 0 && (
                          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-400' : pct >= 80 ? 'bg-amber-400' : 'bg-emerald'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {guestLinksLoading ? (
                    <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Loading guest links…</span>
                    </div>
                  ) : generatedLinks.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                      <ExternalLink className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No links generated yet.</p>
                    </div>
                  ) : (
                    generatedLinks.map((link) => (
                      <div
                        key={link.id}
                        className="p-3.5 rounded-xl border border-border/40 bg-muted/10 flex flex-col gap-2"
                      >
                        {/* Header: name + seats badge + delete */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-emerald/10 border border-emerald/20 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-emerald">{link.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="font-semibold text-sm text-foreground truncate">{link.name}</div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {link.seats != null && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full whitespace-nowrap">
                                <Users className="w-3 h-3" />
                                {link.seats === 0 ? 'Whole Family' : link.seats === 1 ? '1 person' : `${link.seats} persons`}
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteLink(link.id)}
                              className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              title={`Remove ${link.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {link.events && link.events.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {link.events.map(ev => (
                              <span key={ev} className="text-xs px-2 py-0.5 rounded-full bg-emerald/10 text-emerald border border-emerald/20 capitalize">
                                {ev.replace(/-/g, ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground truncate bg-background p-2 rounded border border-border/50 select-all">
                          {link.url}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs h-8"
                            onClick={() => {
                              navigator.clipboard.writeText(link.url);
                              toast.success("Link copied!");
                            }}
                          >
                            <Copy className="w-3 h-3 mr-1.5" />
                            Copy
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1 text-xs h-8 bg-[#25D366] hover:bg-[#1DA851] text-white border-none"
                            onClick={() => handleSendWhatsApp(link.name, link.url)}
                          >
                            <MessageSquare className="w-3 h-3 mr-1.5" />
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wishes Modal/Drawer */}
      <AnimatePresence>
        {wishesDrawerOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            {/* Backdrop */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWishesDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Panel */}
            <m.div
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
            </m.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrInvUrl && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setQrInvUrl(null)}
          >
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-4 max-w-xs w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-display font-semibold text-lg text-foreground">QR Code</h3>
              <div className="p-3 bg-white rounded-xl shadow-inner">
                {/* SVG for sharp on-screen rendering */}
                <QRCodeSVG value={qrInvUrl} size={180} bgColor="#ffffff" fgColor="#1a1a2e" level="M" />
                {/* Hidden canvas for PNG downloads */}
                <div className="hidden">
                  <QRCodeCanvas id="qr-code-canvas" value={qrInvUrl} size={512} bgColor="#ffffff" fgColor="#1a1a2e" level="M" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">Scan to open the invitation. Share on printed cards!</p>
              <div className="flex flex-col gap-2 w-full mt-2">
                <Button
                  onClick={downloadQRCode}
                  className="w-full bg-emerald hover:bg-emerald-dark text-white font-semibold gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PNG
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setQrInvUrl(null)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Drawer Modal */}
      <AnimatePresence>
        {reviewDrawerOpen && (
          <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setReviewDrawerOpen(false)}
          >
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col gap-4 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-lg text-foreground">Leave a Review</h3>
                <Button variant="ghost" size="icon" onClick={() => setReviewDrawerOpen(false)} className="rounded-full w-8 h-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                How was your experience using ShaadiLink for this invitation? Your review will be featured on our homepage!
              </p>
              <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star className={`w-8 h-8 ${reviewRating >= star ? 'fill-gold text-gold' : 'text-muted-foreground/30'}`} />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewMessage}
                onChange={e => setReviewMessage(e.target.value)}
                placeholder="Write your review here..."
                className="w-full h-32 bg-background border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gold resize-none"
              />
              <Button
                onClick={handleSubmitReview}
                disabled={reviewLoading || reviewRating === 0 || !reviewMessage.trim()}
                className="w-full bg-gold hover:bg-gold-light text-emerald-dark font-semibold mt-2"
              >
                {reviewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Review'}
              </Button>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
