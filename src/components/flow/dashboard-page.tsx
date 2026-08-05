"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import { AnalyticsDrawer } from "@/components/flow/analytics-drawer";
import { PrintCardsDrawer } from "@/components/flow/print-cards-drawer";
import Papa from "papaparse";

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

  // Referral Code State
  const [myReferralCode, setMyReferralCode] = useState<{code: string; discount_percent: number; current_uses: number; max_uses: number | null} | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">("all");

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

  // Analytics Drawer State
  const [analyticsDrawerOpen, setAnalyticsDrawerOpen] = useState(false);
  const [analyticsInvId, setAnalyticsInvId] = useState<string | null>(null);

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
  const [generatedLinks, setGeneratedLinks] = useState<{id: string, name: string, url: string, events?: string[], seats?: number | null, view_count?: number, last_viewed_at?: string | null}[]>([]);
  const [guestLinksLoading, setGuestLinksLoading] = useState(false);

  // Print Cards Drawer State
  const [printCardsDrawerOpen, setPrintCardsDrawerOpen] = useState(false);
  const [printCardsInvId, setPrintCardsInvId] = useState<string | null>(null);

  // CSV Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalise a DB guest_link row → frontend shape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapLink = (row: any) => ({
    id: row.id,
    name: row.guest_name ?? row.name ?? '',
    url: row.url,
    events: row.allowed_events ?? row.events ?? [],
    seats: row.seats ?? null,
    view_count: row.view_count || 0,
    last_viewed_at: row.last_viewed_at || null,
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

  useEffect(() => {
    // Fetch personal referral code
    const fetchReferralCode = async () => {
      try {
        const res = await fetch('/api/user/referral');
        if (res.ok) {
          const data = await res.json();
          if (data.referralCode) setMyReferralCode(data.referralCode);
        }
      } catch (err) {
        console.error("Failed to load referral code", err);
      }
    };
    fetchReferralCode();
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !guestLinksInvId) return;

    const currentInv = invitations.find((i) => i.id === guestLinksInvId);
    if (!currentInv) return;
    const quota = currentInv.guest_links_quota ?? 0;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        if (rows.length === 0) {
          toast.error("CSV is empty");
          return;
        }

        if (generatedLinks.length + rows.length > quota) {
          toast.error(`Importing ${rows.length} rows exceeds your quota. You can only create ${Math.max(0, quota - generatedLinks.length)} more links.`);
          return;
        }

        const guestsPayload = rows
          .map((row) => {
            const guestName = (row.GuestName || row.Name || row.guest_name || "").trim();
            if (!guestName) return null;

            const slug = guestName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
            const uniqueSlug = `${slug}-${Math.floor(Math.random() * 10000)}`;
            const url = `${window.location.origin}/inv/${currentInv.slug || guestLinksInvId}?guest=${uniqueSlug}`;

            let seats = parseInt(row.Seats || row.seats || "1");
            if (isNaN(seats)) seats = 1;

            let allowedEvents: string[] = [];
            if (row.Events || row.events) {
              allowedEvents = (row.Events || row.events)
                .split(",")
                .map((ev: string) => ev.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'))
                .filter(Boolean);
            } else {
              allowedEvents = currentInv.events?.map((ev) => ev.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) || [];
            }

            return { guestName, guestSlug: uniqueSlug, url, allowedEvents, seats };
          })
          .filter(Boolean);

        if (guestsPayload.length === 0) {
          toast.error("No valid guests found in CSV");
          return;
        }

        const toastId = toast.loading(`Importing ${guestsPayload.length} guests...`);
        try {
          const res = await fetch(`/api/invitations/${guestLinksInvId}/guest-links/bulk`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guests: guestsPayload }),
          });

          if (!res.ok) {
            const d = await res.json();
            throw new Error(d.error || "Failed to bulk import links");
          }

          const data = await res.json();
          setGeneratedLinks((prev) => [...data.links.map(mapLink), ...prev]);
          toast.success(`Successfully imported ${guestsPayload.length} guests!`, { id: toastId });
        } catch (err: any) {
          toast.error(err.message, { id: toastId });
        }
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`);
      },
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
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

      <main id="main-content" className="flex-1 px-4 py-6 sm:py-10">
        <div className="mx-auto max-w-7xl space-y-8">
          
          {/* Hero Command Banner */}
          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-background to-gold/10 border border-gold/25 shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> Luxury Digital Suite
                </div>
                <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-300 to-gold-light">{flowData.fullName || "Valued Host"}</span> ✨
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Manage your digital wedding invitations, monitor real-time guest RSVPs, create personalized links, and export 300 DPI print-ready cards.
                </p>
              </div>

              <Button
                onClick={onCreateNew}
                size="lg"
                className="bg-gradient-to-r from-gold via-amber-400 to-gold-light hover:brightness-110 text-emerald-dark font-bold gap-2.5 shrink-0 shadow-lg shadow-gold/20 hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                Create New Invitation
              </Button>
            </div>
          </m.div>

          {/* Referral & Affiliate Hub */}
          {myReferralCode && (
            <m.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="p-5 rounded-2xl bg-card/70 border border-gold/30 backdrop-blur-md relative overflow-hidden group shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-emerald/5 opacity-60 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shrink-0 shadow-inner">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-base text-foreground">Affiliate &amp; Discount Code</span>
                      <Badge className="bg-gold/20 text-gold border-gold/40 text-[10px]">{myReferralCode.discount_percent}% OFF</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Share your referral code with friends. They receive <strong className="text-gold">{myReferralCode.discount_percent}% OFF</strong> any package and you help them create an exquisite invitation!
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
                  <div className="flex items-center justify-between gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Your Discount Code</span>
                      <span className="font-mono text-lg font-bold text-foreground">{myReferralCode.code}</span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => {
                        const copyText = `Use coupon code "${myReferralCode.code}" on ShaadiLink for ${myReferralCode.discount_percent}% off! It can only be used for ${myReferralCode.max_uses ? myReferralCode.max_uses : 'unlimited'} persons.`;
                        navigator.clipboard.writeText(copyText);
                        toast.success("Discount code message copied to clipboard!");
                      }}
                      className="bg-gold hover:bg-gold-light text-emerald-dark font-semibold gap-1.5 shadow-md"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Code
                    </Button>
                  </div>

                  <span className="text-xs text-muted-foreground font-medium px-2.5 py-1.5 bg-muted/60 rounded-xl border border-border/40">
                    {myReferralCode.current_uses} / {myReferralCode.max_uses ? myReferralCode.max_uses : '∞'} Uses
                  </span>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-gold text-gold hover:bg-gold/10 ml-2"
                    onClick={() => window.location.href = '/dashboard/affiliate'}
                  >
                    View Earnings & Portal
                  </Button>
                </div>
              </div>
            </m.div>
          )}

          {/* Key Metrics Command Center */}
          {!isLoading && invitations.length > 0 && (
            <m.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="grid grid-cols-2 lg:grid-cols-5 gap-3.5"
            >
              {[
                {
                  label: "Total Invitations",
                  value: invitations.length,
                  icon: Heart,
                  color: "text-emerald",
                  bg: "bg-emerald/5 border-emerald/20 hover:border-emerald/40",
                },
                {
                  label: "Live Now",
                  value: invitations.filter((i) => i.is_active).length,
                  icon: Activity,
                  color: "text-gold",
                  bg: "bg-gold/5 border-gold/20 hover:border-gold/40",
                },
                {
                  label: "Total RSVPs",
                  value: invitations.reduce((sum, inv) => sum + (inv.rsvps?.length || 0), 0),
                  icon: Users,
                  color: "text-blue-400",
                  bg: "bg-blue-400/5 border-blue-400/20 hover:border-blue-400/40",
                },
                {
                  label: "Total Wishes",
                  value: invitations.reduce((sum, inv) => sum + (inv.wishes?.length || 0), 0),
                  icon: MessageSquare,
                  color: "text-pink-400",
                  bg: "bg-pink-400/5 border-pink-400/20 hover:border-pink-400/40",
                },
                {
                  label: "Total Views",
                  value: invitations.reduce((sum, inv) => sum + (inv.view_count || 0), 0),
                  icon: Eye,
                  color: "text-indigo-400",
                  bg: "bg-indigo-400/5 border-indigo-400/20 hover:border-indigo-400/40",
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className={`border ${stat.bg} transition-all duration-300 hover:-translate-y-0.5 shadow-md`}>
                    <CardContent className="p-4 flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-background border border-border/40 ${stat.color} shrink-0 shadow-inner`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-2xl font-bold text-foreground leading-none">{stat.value}</p>
                        <p className="text-[11px] font-medium text-muted-foreground mt-1 leading-tight">{stat.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </m.div>
          )}

          {/* Search & Filter Toolbar */}
          {!isLoading && invitations.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search by couple name or venue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-card/80 border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 transition-all shadow-inner"
                />
                <Eye className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-card/80 border border-border/60 rounded-xl shrink-0">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === "all" ? "bg-emerald text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All ({invitations.length})
                </button>
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === "active" ? "bg-emerald text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Live ({invitations.filter((i) => i.is_active).length})
                </button>
                <button
                  onClick={() => setStatusFilter("draft")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === "draft" ? "bg-emerald text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Drafts ({invitations.filter((i) => !i.is_active).length})
                </button>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card border border-border/40 rounded-3xl p-5 h-96 flex flex-col justify-between animate-pulse">
                  <div className="space-y-3">
                    <div className="h-44 bg-muted/60 rounded-2xl w-full" />
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

          {/* Empty State Guide */}
          {!isLoading && invitations.length === 0 && (
            <m.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-16 gap-6 text-center bg-card/40 border border-border/40 rounded-3xl p-8 backdrop-blur-md"
            >
              <div className="w-16 h-16 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">No invitations created yet</h2>
                <p className="text-muted-foreground text-sm mt-1 max-w-sm">
                  Create your first luxury digital wedding invitation and start sharing personalized links with your guests.
                </p>
              </div>

              {/* 3-Step Guide */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mt-2">
                {[
                  { step: "1", icon: "🎨", title: "Pick a Template", desc: "Choose Classic, Emerald or Royal designs" },
                  { step: "2", icon: "✏️", title: "Personalize Details", desc: "Names, venue, events, photos & schedule" },
                  { step: "3", icon: "💌", title: "Share & Print", desc: "Send custom links or download 300 DPI cards" },
                ].map((s) => (
                  <div key={s.step} className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-border/50 bg-card/60">
                    <span className="text-3xl">{s.icon}</span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-gold">Step {s.step}</span>
                    <p className="text-sm font-semibold text-foreground">{s.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>

              <Button
                onClick={onCreateNew}
                size="lg"
                className="bg-emerald hover:bg-emerald-dark text-primary-foreground font-semibold gap-2 mt-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Create Your First Invitation
              </Button>
            </m.div>
          )}

          {/* Invitation Cards Grid */}
          {!isLoading && invitations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {invitations
                .filter((inv) => {
                  const nameMatch = `${inv.partner1_name} ${inv.partner2_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (inv.venue && inv.venue.toLowerCase().includes(searchQuery.toLowerCase()));
                  if (!nameMatch) return false;
                  if (statusFilter === "active") return inv.is_active;
                  if (statusFilter === "draft") return !inv.is_active;
                  return true;
                })
                .map((inv, idx) => {
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
                      transition={{ duration: 0.4, delay: idx * 0.05 }}
                    >
                      <Card className="border-border/60 hover:border-gold/50 transition-all duration-300 group overflow-hidden rounded-3xl bg-card/70 backdrop-blur-md shadow-lg hover:shadow-2xl hover:-translate-y-1">
                        
                        {/* Cover Image / Gradient Header */}
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
                                className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-xl backdrop-blur-sm relative"
                                style={{ 
                                  backgroundColor: theme.bgDoor,
                                  border: `2px solid ${theme.accent}` 
                                }}
                              >
                                <Heart style={{ color: theme.accent, fill: theme.accent }} className="w-6 h-6 z-10 opacity-85" />
                              </div>
                            </div>
                          )}

                          {/* Status Badge */}
                          <div className="absolute top-3 left-3 z-10">
                            {inv.is_active ? (
                              <Badge className="bg-emerald/90 text-white text-[10px] border-0 shadow-md backdrop-blur-md">
                                ● Live
                              </Badge>
                            ) : (
                              <Badge className="bg-black/70 text-white/80 text-[10px] border-0 shadow-md backdrop-blur-md">
                                Draft
                              </Badge>
                            )}
                          </div>

                          {/* Plan Badge & Upgrade */}
                          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
                            <Badge
                              className={
                                inv.plan === "royal"
                                  ? "bg-gold/90 text-emerald-dark text-[10px] border-0 font-bold shadow-md"
                                  : "bg-white/20 text-white text-[10px] border-0 backdrop-blur-md"
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
                                className="text-[9px] bg-gold/20 hover:bg-gold/30 text-gold border border-gold/40 px-2 py-0.5 rounded-full transition-all flex items-center gap-1 font-semibold shadow-md backdrop-blur-md"
                              >
                                <Sparkles className="w-2.5 h-2.5 text-gold shrink-0 animate-pulse" />
                                Upgrade
                              </button>
                            )}
                          </div>
                        </div>

                        <CardContent className="p-5 space-y-4">
                          {/* Names & Details */}
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-display font-bold text-lg text-foreground leading-tight truncate">
                                {inv.partner1_name || "Partner 1"} &amp; {inv.partner2_name || "Partner 2"}
                              </h3>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                              <span className="font-medium text-gold/90">{templateName}</span>
                              <span>Created {formatDate(inv.created_at)}</span>
                            </div>

                            {/* Share Short Link */}
                            {inv.is_active && (
                              <div className="mt-2 flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-muted/40 border border-border/40 text-[11px] text-emerald font-mono">
                                <span className="truncate">shaadilink.com.pk/inv/{inv.slug || inv.id.slice(0, 8)}</span>
                                <button
                                  onClick={() => handleCopyLink(inv.id)}
                                  className="text-muted-foreground hover:text-gold transition-colors shrink-0"
                                  title="Copy Link"
                                >
                                  {copiedId === inv.id ? <Check className="w-3.5 h-3.5 text-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Quick Interactive Counters Bar */}
                          <div className="grid grid-cols-4 gap-1 p-2 rounded-2xl bg-muted/30 border border-border/30 text-center text-[10px]">
                            <button
                              onClick={() => {
                                setAnalyticsInvId(inv.id);
                                setAnalyticsDrawerOpen(true);
                              }}
                              className="flex flex-col items-center hover:text-gold transition-colors p-1"
                            >
                              <Eye className="w-3.5 h-3.5 text-indigo-400 mb-0.5" />
                              <span className="font-bold text-foreground">{inv.view_count || 0}</span>
                              <span className="text-[9px] text-muted-foreground">Views</span>
                            </button>

                            <button
                              onClick={() => handleOpenRsvps(inv.id)}
                              className="flex flex-col items-center hover:text-gold transition-colors p-1"
                            >
                              <Users className="w-3.5 h-3.5 text-emerald mb-0.5" />
                              <span className="font-bold text-foreground">{acceptedRsvps}</span>
                              <span className="text-[9px] text-muted-foreground">RSVPs</span>
                            </button>

                            <button
                              onClick={() => handleOpenWishes(inv.id)}
                              className="flex flex-col items-center hover:text-gold transition-colors p-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-gold mb-0.5" />
                              <span className="font-bold text-foreground">{inv.wishes?.length || 0}</span>
                              <span className="text-[9px] text-muted-foreground">Wishes</span>
                            </button>

                            <button
                              onClick={() => handleOpenGuestLinks(inv.id)}
                              className="flex flex-col items-center hover:text-gold transition-colors p-1"
                            >
                              <Users className="w-3.5 h-3.5 text-amber-500 mb-0.5" />
                              <span className="font-bold text-foreground">{inv.guest_links_quota || 0}</span>
                              <span className="text-[9px] text-muted-foreground">Links</span>
                            </button>
                          </div>

                          {/* Primary Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => window.open(`${window.location.origin}/inv/${inv.slug || inv.id}`, "_blank", "noopener,noreferrer")}
                              className="flex-1 h-9 bg-emerald hover:bg-emerald-dark text-white font-semibold text-xs gap-1.5 shadow-md"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              View Live
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={passed}
                              onClick={() => onEditInvitation(inv.id)}
                              className="flex-1 h-9 border-gold/40 text-gold hover:bg-gold/10 font-semibold text-xs gap-1.5"
                            >
                              {passed ? (
                                <>
                                  <Lock className="w-3.5 h-3.5" />
                                  Locked
                                </>
                              ) : (
                                inv.is_active ? "Edit Invitation" : "Setup"
                              )}
                            </Button>
                          </div>

                          {/* Secondary Toolbar (Guest Hub & Tools) */}
                          <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-border/40">
                            {/* WhatsApp Share */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const link = `${window.location.origin}/inv/${inv.slug || inv.id}`;
                                const text = encodeURIComponent(`You're invited! 🎉 View our wedding invitation: ${link}`);
                                window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
                              }}
                              className="h-8 px-2 text-emerald hover:bg-emerald/10 text-xs gap-1"
                              title="Share via WhatsApp"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span className="text-[10px]">WhatsApp</span>
                            </Button>

                            {/* Guest Links */}
                            {inv.is_active && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenGuestLinks(inv.id)}
                                className="h-8 px-2 text-amber-500 hover:bg-amber-500/10 text-xs gap-1"
                                title="Guest Links"
                              >
                                <Users className="w-3.5 h-3.5" />
                                <span className="text-[10px]">Guest Links</span>
                              </Button>
                            )}

                            {/* Print Cards */}
                            {inv.is_active && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setPrintCardsInvId(inv.id);
                                  setPrintCardsDrawerOpen(true);
                                }}
                                className="h-8 px-2 text-indigo-400 hover:bg-indigo-400/10 text-xs gap-1"
                                title="Print Cards"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span className="text-[10px]">Print</span>
                              </Button>
                            )}

                            {/* QR Code */}
                            {inv.is_active && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setQrInvUrl(`${window.location.origin}/inv/${inv.slug || inv.id}`)}
                                className="h-8 px-2 text-indigo-400 hover:bg-indigo-400/10 text-xs"
                                title="QR Code"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </Button>
                            )}

                            {/* Review Button */}
                            <Button
                              size="sm"
                              variant="ghost"
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
                              className="h-8 px-2 text-gold hover:bg-gold/10 text-xs"
                              title="Review"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </Button>

                            {/* Delete Button */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(inv.id, `${inv.partner1_name} & ${inv.partner2_name}`)}
                              disabled={deletingId === inv.id}
                              className="h-8 px-2 text-red-400 hover:bg-red-400/10 text-xs"
                              title="Delete Invitation"
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

      {/* Analytics Drawer */}
      <AnalyticsDrawer
        isOpen={analyticsDrawerOpen}
        onClose={() => setAnalyticsDrawerOpen(false)}
        invitationId={analyticsInvId}
        totalViews={invitations.find(i => i.id === analyticsInvId)?.view_count || 0}
        acceptedRsvps={
          invitations.find(i => i.id === analyticsInvId)?.rsvps?.filter(r => r.status === "accept").length || 0
        }
        declinedRsvps={
          invitations.find(i => i.id === analyticsInvId)?.rsvps?.filter(r => r.status === "decline").length || 0
        }
      />


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
                    <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                      Generate personalized links for your guests
                    </p>
                    <input 
                      type="file" 
                      accept=".csv" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-7 py-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Download className="w-3 h-3 mr-1" /> Import CSV
                    </Button>
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
                        {/* Analytics Badge */}
                        <div className="flex items-center gap-2 mb-1">
                          {link.view_count ? (
                            <Badge variant="outline" className="text-[10px] bg-emerald/10 text-emerald border-emerald/20 px-2 py-0">
                              <Eye className="w-3 h-3 mr-1" />
                              Opened {link.view_count} time{link.view_count !== 1 && 's'}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] bg-muted/50 text-muted-foreground border-border/50 px-2 py-0">
                              Not opened yet
                            </Badge>
                          )}
                          {link.last_viewed_at && (
                            <span className="text-[10px] text-muted-foreground">
                              Last: {new Date(link.last_viewed_at).toLocaleDateString()}
                            </span>
                          )}
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
      {/* Print Cards Drawer */}
      {printCardsInvId && (
        <PrintCardsDrawer
          isOpen={printCardsDrawerOpen}
          onOpenChange={setPrintCardsDrawerOpen}
          plan={invitations.find((i) => i.id === printCardsInvId)?.plan || "classic"}
          flowData={
            (invitations.find((i) => i.id === printCardsInvId)
              ? {
                  invitationId: printCardsInvId,
                  partner1Name: invitations.find((i) => i.id === printCardsInvId)?.partner1_name || "",
                  partner2Name: invitations.find((i) => i.id === printCardsInvId)?.partner2_name || "",
                  venue: invitations.find((i) => i.id === printCardsInvId)?.venue || "",
                  venueAddress: invitations.find((i) => i.id === printCardsInvId)?.venue || "", // Fallback
                  events: invitations.find((i) => i.id === printCardsInvId)?.events || [],
                }
              : flowData) as FlowData
          }
        />
      )}
    </div>
  );
}
