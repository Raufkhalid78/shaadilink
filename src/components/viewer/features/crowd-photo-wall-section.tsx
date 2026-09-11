"use client";

import React, { useState, useEffect, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Camera, Sparkles, ExternalLink, Users, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuestSnapsModal } from "./guest-snaps-modal";

interface SnapItem {
  id: string;
  guest_name: string;
  photo_url: string;
  caption?: string | null;
  table_number?: string | null;
  created_at: string;
}

interface CrowdPhotoWallSectionProps {
  invitationId: string;
  slug?: string;
  guestName?: string | null;
  guestSeats?: string | number | null;
  accentColor?: string;
}

export function CrowdPhotoWallSection({
  invitationId,
  slug,
  guestName,
  guestSeats,
  accentColor = "#EAB308",
}: CrowdPhotoWallSectionProps) {
  const [snaps, setSnaps] = useState<SnapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<SnapItem | null>(null);

  const fetchSnaps = useCallback(async () => {
    try {
      const targetId = slug || invitationId;
      const res = await fetch(`/api/invitations/${encodeURIComponent(targetId)}/snaps`);
      if (res.ok) {
        const data = await res.json();
        setSnaps(data.snaps || []);
      }
    } catch (err) {
      console.warn("Failed to load snaps:", err);
    } finally {
      setLoading(false);
    }
  }, [invitationId, slug]);

  useEffect(() => {
    fetchSnaps();
  }, [fetchSnaps]);

  // Auto-open modal if URL query param ?snap=true is present (e.g. from table QR code)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("snap") === "true") {
        setIsModalOpen(true);
      }
    }
  }, []);

  const handleSnapSuccess = (newSnap: SnapItem) => {
    setSnaps((prev) => [newSnap, ...prev.filter((s) => s.id !== newSnap.id)]);
  };

  const wallUrl = `/inv/${encodeURIComponent(slug || invitationId)}/wall`;

  return (
    <section className="relative my-12 px-4 max-w-3xl mx-auto">
      {/* Decorative backdrop glow */}
      <div
        className="absolute inset-0 -z-10 rounded-3xl blur-2xl opacity-20 transition-all pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      <div className="rounded-3xl border border-white/10 bg-neutral-900/70 backdrop-blur-md p-6 sm:p-8 text-neutral-100 shadow-2xl">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400">
                <Camera className="w-5 h-5" />
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Live Crowd Photo Wall
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                  Live
                </span>
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400">
              Photos snapped by guests appear in real-time on the banquet hall projector!
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-semibold text-xs sm:text-sm rounded-xl shadow-lg px-4 py-2 cursor-pointer flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>Snap & Share</span>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-white/15 hover:bg-white/10 text-white text-xs sm:text-sm rounded-xl px-3 py-2"
            >
              <a href={wallUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                <span>Banquet Wall</span>
              </a>
            </Button>
          </div>
        </div>

        {/* Snaps Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-36 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : snaps.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-white/10 bg-black/20">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-white">No crowd snaps yet!</h4>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1 mb-4">
                Be the first guest to snap a selfie or table picture and watch it display on the banquet screens.
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-medium rounded-xl text-xs"
              >
                <Camera className="w-3.5 h-3.5 mr-1.5" />
                Take First Snap
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {snaps.slice(0, 8).map((snap, idx) => (
                <m.div
                  key={snap.id || idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPhoto(snap)}
                  className="group relative h-40 rounded-2xl overflow-hidden cursor-pointer border border-white/10 bg-black shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={snap.photo_url}
                    alt={snap.guest_name || "Guest snap"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end">
                    <p className="text-xs font-semibold text-white truncate drop-shadow">
                      {snap.guest_name}
                    </p>
                    {snap.table_number && (
                      <span className="text-[10px] text-amber-300 font-medium truncate">
                        {snap.table_number}
                      </span>
                    )}
                    {snap.caption && (
                      <p className="text-[10px] text-neutral-300 truncate mt-0.5">
                        &ldquo;{snap.caption}&rdquo;
                      </p>
                    )}
                  </div>
                </m.div>
              ))}
            </div>
          )}

          {snaps.length > 8 && (
            <div className="text-center mt-4">
              <a
                href={wallUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium"
              >
                <span>View all {snaps.length} photos on the banquet live wall</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <GuestSnapsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        invitationId={invitationId}
        slug={slug}
        defaultGuestName={guestName}
        defaultTable={guestSeats}
        onSuccess={handleSnapSuccess}
      />

      {/* Lightbox Preview */}
      <AnimatePresence>
        {selectedPhoto && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-6 right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-neutral-900 border border-white/15 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="relative aspect-square sm:aspect-4/3 w-full bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedPhoto.photo_url}
                  alt={selectedPhoto.guest_name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-base text-white">
                    {selectedPhoto.guest_name}
                  </div>
                  {selectedPhoto.table_number && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
                      {selectedPhoto.table_number}
                    </span>
                  )}
                </div>

                {selectedPhoto.caption && (
                  <p className="text-xs sm:text-sm text-neutral-300 italic">
                    &ldquo;{selectedPhoto.caption}&rdquo;
                  </p>
                )}

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-500">
                  <span>Projected on Live Wall</span>
                  <a
                    href={selectedPhoto.photo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline"
                  >
                    View Original
                  </a>
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </section>
  );
}
