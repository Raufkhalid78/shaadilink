"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Camera,
  ExternalLink,
  Copy,
  Trash2,
  RefreshCw,
  Sparkles,
  Download,
  Check,
  Loader2,
  Eye,
  Tv,
  QrCode,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SnapItem {
  id: string;
  guest_name: string;
  photo_url: string;
  caption?: string | null;
  table_number?: string | null;
  created_at: string;
}

interface PhotoWallDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  invitation: {
    id: string;
    slug?: string;
    title?: string;
    partner1_name?: string;
    partner2_name?: string;
    is_active?: boolean;
  } | null;
}

export function PhotoWallDrawer({
  isOpen,
  onOpenChange,
  invitation,
}: PhotoWallDrawerProps) {
  const [snaps, setSnaps] = useState<SnapItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<"wall" | "snap" | null>(null);

  const targetId = invitation?.slug || invitation?.id || "";
  const eventTitle =
    invitation?.title ||
    (invitation?.partner1_name && invitation?.partner2_name
      ? `${invitation.partner1_name} & ${invitation.partner2_name}`
      : "Event Celebration");

  const wallUrl = typeof window !== "undefined" && targetId
    ? `${window.location.origin}/inv/${encodeURIComponent(targetId)}/wall`
    : "";

  const snapUrl = typeof window !== "undefined" && targetId
    ? `${window.location.origin}/inv/${encodeURIComponent(targetId)}?snap=true`
    : "";

  const loadSnaps = useCallback(async () => {
    if (!invitation?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/invitations/${encodeURIComponent(invitation.id)}/snaps`);
      if (res.ok) {
        const data = await res.json();
        setSnaps(data.snaps || []);
      }
    } catch (err) {
      console.error("Failed to load snaps in drawer:", err);
      toast.error("Failed to load guest photos.");
    } finally {
      setLoading(false);
    }
  }, [invitation?.id]);

  useEffect(() => {
    if (isOpen && invitation?.id) {
      loadSnaps();
    }
  }, [isOpen, invitation?.id, loadSnaps]);

  const handleDeleteSnap = async (snapId: string) => {
    if (!invitation?.id) return;
    if (!confirm("Are you sure you want to delete this photo from the live wall?")) return;

    setDeletingId(snapId);
    try {
      const res = await fetch(
        `/api/invitations/${encodeURIComponent(invitation.id)}/snaps?snapId=${encodeURIComponent(snapId)}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        throw new Error("Failed to delete photo");
      }

      setSnaps((prev) => prev.filter((s) => s.id !== snapId));
      toast.success("Photo removed from live wall.");
    } catch (err: any) {
      toast.error(err.message || "Could not delete photo.");
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = async (text: string, type: "wall" | "snap") => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(type);
      toast.success(
        type === "wall"
          ? "Banquet Wall projector link copied!"
          : "Table Snap upload link copied!"
      );
      setTimeout(() => setCopiedLink(null), 2500);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] bg-neutral-900 border-neutral-800 text-neutral-100 flex flex-col">
        <div className="mx-auto w-full max-w-5xl overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
          <DrawerHeader className="px-0 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400">
                  <Camera className="w-5 h-5" />
                </span>
                <DrawerTitle className="text-xl sm:text-2xl font-bold text-white">
                  Live Banquet Photo Wall
                </DrawerTitle>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                  Active
                </Badge>
              </div>
              <DrawerDescription className="text-neutral-400 text-xs sm:text-sm">
                Project live guest selfies & memories onto banquet hall screens for {eventTitle}.
              </DrawerDescription>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {wallUrl && (
                <Button
                  asChild
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-semibold text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  <a href={wallUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                    <Tv className="w-4 h-4" />
                    <span>Launch Projector Wall</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={loadSnaps}
                disabled={loading}
                className="border-neutral-700 hover:bg-white/5 text-neutral-300 text-xs rounded-xl cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </DrawerHeader>

          {/* ─── Share & Links Banner ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
            {/* Projector Link */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-medium text-amber-300 flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5" /> Projector Wall Screen (Open on Venue Laptop)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={wallUrl}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-neutral-300 select-all font-mono truncate"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => copyToClipboard(wallUrl, "wall")}
                  className="rounded-xl text-xs flex-shrink-0 cursor-pointer"
                >
                  {copiedLink === "wall" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="ml-1 hidden sm:inline">Copy</span>
                </Button>
              </div>
            </div>

            {/* Table QR Upload Link */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-medium text-neutral-300 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-amber-400" /> Guest Table Snap Link
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={snapUrl}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-neutral-300 select-all font-mono truncate"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => copyToClipboard(snapUrl, "snap")}
                  className="rounded-xl text-xs flex-shrink-0 cursor-pointer"
                >
                  {copiedLink === "snap" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="ml-1 hidden sm:inline">Copy</span>
                </Button>
              </div>
            </div>
          </div>

          {/* ─── Snaps Moderation Grid ─── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                <span>Guest Memories</span>
                <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 text-xs">
                  {snaps.length} photos
                </span>
              </h4>
              <span className="text-xs text-neutral-400">
                Moderation: Delete any photo to instantly remove it from projector screens.
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-neutral-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                <span className="text-xs">Loading live memories...</span>
              </div>
            ) : snaps.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-neutral-800 bg-neutral-950/40 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h5 className="font-semibold text-white text-base">No Photos Projected Yet</h5>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto">
                    Once the event begins, guests can scan their table QR code or click &apos;Snap a Moment&apos; on their invitation to project photos here in real-time.
                  </p>
                </div>
                {wallUrl && (
                  <div className="pt-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-white/10 hover:bg-white/5 text-neutral-300 text-xs rounded-xl"
                    >
                      <a href={wallUrl} target="_blank" rel="noopener noreferrer">
                        <Tv className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                        Preview Projector Wall Screen
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {snaps.map((snap) => (
                  <div
                    key={snap.id}
                    className="group relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-md flex flex-col"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-square w-full bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={snap.photo_url}
                        alt={snap.guest_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <a
                          href={snap.photo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-colors"
                          title="Download photo"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleDeleteSnap(snap.id)}
                          disabled={deletingId === snap.id}
                          className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-sm transition-colors cursor-pointer disabled:opacity-50"
                          title="Remove from live wall"
                        >
                          {deletingId === snap.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-3 space-y-1 text-left flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-white truncate">
                            {snap.guest_name}
                          </p>
                          {snap.table_number && (
                            <span className="text-[10px] text-amber-300 font-medium truncate flex-shrink-0">
                              {snap.table_number}
                            </span>
                          )}
                        </div>
                        {snap.caption && (
                          <p className="text-[11px] text-neutral-400 italic line-clamp-2 mt-0.5">
                            &ldquo;{snap.caption}&rdquo;
                          </p>
                        )}
                      </div>

                      <p className="text-[10px] text-neutral-500 pt-1">
                        {new Date(snap.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
