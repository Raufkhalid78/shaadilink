"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  Camera,
  Sparkles,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Heart,
  Volume2,
  VolumeX,
} from "lucide-react";

interface SnapItem {
  id: string;
  guest_name: string;
  photo_url: string;
  caption?: string | null;
  table_number?: string | null;
  created_at: string;
}

interface BanquetWallClientProps {
  invitationId: string;
  slug?: string;
  title: string;
  partner1Name?: string;
  partner2Name?: string;
  venue?: string;
  heroImageUrl?: string;
}

export function BanquetWallClient({
  invitationId,
  slug,
  title,
  partner1Name,
  partner2Name,
  venue,
  heroImageUrl,
}: BanquetWallClientProps) {
  const [snaps, setSnaps] = useState<SnapItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [justArrivedSnap, setJustArrivedSnap] = useState<SnapItem | null>(null);
  const [appUrl, setAppUrl] = useState("");
  const knownSnapIdsRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const coupleNames =
    partner1Name && partner2Name
      ? `${partner1Name} & ${partner2Name}`
      : title || "Wedding Celebration";

  // Resolve target invitation slug or ID
  const targetId = slug || invitationId;

  // Initialize upload QR URL on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      setAppUrl(`${origin}/inv/${encodeURIComponent(targetId)}?snap=true`);
    }
  }, [targetId]);

  // Fetch snaps with silent polling every 6 seconds
  const fetchSnaps = useCallback(async () => {
    try {
      const res = await fetch(`/api/invitations/${encodeURIComponent(targetId)}/snaps`);
      if (!res.ok) return;
      const data = await res.json();
      const freshSnaps: SnapItem[] = data.snaps || [];

      if (freshSnaps.length > 0) {
        // Check for newly uploaded snaps
        const newArrivals = freshSnaps.filter(
          (s) => !knownSnapIdsRef.current.has(s.id)
        );

        if (newArrivals.length > 0 && knownSnapIdsRef.current.size > 0) {
          // A guest just uploaded a new photo during the live event!
          const newest = newArrivals[0];
          setJustArrivedSnap(newest);
          // Jump immediately to the new photo
          setCurrentIndex(0);
          setTimeout(() => setJustArrivedSnap(null), 6000);
        }

        freshSnaps.forEach((s) => knownSnapIdsRef.current.add(s.id));
        setSnaps(freshSnaps);
      }
    } catch (err) {
      console.warn("Polling snaps failed:", err);
    }
  }, [targetId]);

  useEffect(() => {
    fetchSnaps();
    const interval = setInterval(fetchSnaps, 6000);
    return () => clearInterval(interval);
  }, [fetchSnaps]);

  // Slideshow timer: auto-advance every 7.5 seconds
  useEffect(() => {
    if (isPaused || snaps.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % snaps.length);
    }, 7500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, snaps.length]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsPaused((p) => !p);
      } else if (e.code === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % (snaps.length || 1));
      } else if (e.code === "ArrowLeft") {
        setCurrentIndex((prev) => (prev - 1 + (snaps.length || 1)) % (snaps.length || 1));
      } else if (e.code === "KeyF") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [snaps.length]);

  const currentSnap = snaps[currentIndex];

  return (
    <main className="relative w-screen h-screen bg-neutral-950 text-white overflow-hidden flex flex-col justify-between select-none">
      {/* Ambient background glow of current photo */}
      {currentSnap?.photo_url && (
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center filter blur-3xl opacity-25 scale-110 transition-all duration-1000"
          style={{ backgroundImage: `url(${currentSnap.photo_url})` }}
        />
      )}

      {/* ─── Top Projector Header ─── */}
      <header className="relative z-20 flex items-center justify-between px-8 py-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 font-mono text-xs uppercase tracking-widest">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span>LIVE WALL</span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-amber-200 tracking-wide">
              {coupleNames}
            </h1>
            {venue && (
              <p className="text-xs text-neutral-400 font-sans tracking-wide">
                {venue}
              </p>
            )}
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-3">
          {snaps.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs font-mono text-neutral-300">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {currentIndex + 1} of {snaps.length} snaps
              </span>
            </div>
          )}

          <button
            onClick={() => setIsPaused((p) => !p)}
            title={isPaused ? "Resume Slideshow (Space)" : "Pause Slideshow (Space)"}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-neutral-200 transition-colors"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen (F)"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-neutral-200 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ─── Center Display (Slideshow or Empty QR Standby) ─── */}
      <section className="relative flex-1 flex items-center justify-center p-6 sm:p-12 overflow-hidden">
        {snaps.length === 0 ? (
          /* Empty Standby Mode: Welcomes guests to project photos */
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full text-center space-y-8 p-8 rounded-3xl border border-amber-500/25 bg-neutral-900/60 backdrop-blur-2xl shadow-2xl"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Live Guest Crowd Wall
              </div>
              <h2 className="text-4xl sm:text-5xl font-serif font-bold text-amber-100 tracking-tight">
                Be the First to Project Your Photo!
              </h2>
              <p className="text-base text-neutral-300 max-w-lg mx-auto">
                Scan the QR code below from your phone. Take a selfie or capture your table, and it will appear on this screen instantly.
              </p>
            </div>

            {/* Standby QR Code */}
            {appUrl && (
              <div className="inline-block p-5 rounded-3xl bg-white shadow-2xl border-4 border-amber-400">
                <QRCodeSVG value={appUrl} size={220} level="H" />
              </div>
            )}

            <div className="flex items-center justify-center gap-6 text-sm text-amber-200/80 font-mono">
              <span>📱 Scan with any phone camera</span>
              <span>•</span>
              <span>⚡ Zero app download</span>
            </div>
          </m.div>
        ) : (
          /* Live Slideshow Mode */
          <div className="relative w-full h-full max-w-6xl max-h-[75vh] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {currentSnap && (
                <m.div
                  key={currentSnap.id || currentIndex}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  {/* Ken Burns image container */}
                  <div className="relative max-h-full max-w-full rounded-3xl overflow-hidden border-2 border-amber-400/30 shadow-2xl bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentSnap.photo_url}
                      alt={currentSnap.guest_name || "Guest snap"}
                      className="max-h-[72vh] w-auto object-contain transition-transform duration-7000 ease-out scale-100 hover:scale-105"
                    />

                    {/* Guest Attribution Banner */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 sm:p-8 flex flex-col justify-end text-left space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xl sm:text-2xl font-bold font-serif text-amber-200 drop-shadow-md">
                          {currentSnap.guest_name}
                        </span>
                        {currentSnap.table_number && (
                          <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold text-xs sm:text-sm">
                            {currentSnap.table_number}
                          </span>
                        )}
                      </div>

                      {currentSnap.caption && (
                        <p className="text-sm sm:text-base text-neutral-200 font-light italic max-w-3xl drop-shadow">
                          &ldquo;{currentSnap.caption}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                </m.div>
              )}
            </AnimatePresence>

            {/* Left / Right Slideshow Arrows */}
            {snaps.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentIndex((prev) => (prev - 1 + snaps.length) % snaps.length)
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/10 text-white transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % snaps.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/10 text-white transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        )}

        {/* "✨ New Snap Just Arrived!" Flash Banner */}
        <AnimatePresence>
          {justArrivedSnap && (
            <m.div
              initial={{ opacity: 0, y: -40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              className="absolute top-8 z-30 flex items-center gap-3 px-6 py-3 rounded-2xl bg-amber-500 text-neutral-950 font-bold shadow-2xl border-2 border-amber-300"
            >
              <Sparkles className="w-5 h-5 animate-spin" />
              <span className="text-base sm:text-lg">
                ✨ {justArrivedSnap.guest_name} just projected a photo!
              </span>
            </m.div>
          )}
        </AnimatePresence>
      </section>

      {/* ─── Bottom Bar: Table QR Badge & Instructions ─── */}
      <footer className="relative z-20 flex items-center justify-between px-8 py-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        <div className="flex items-center gap-3 text-xs sm:text-sm text-neutral-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time crowd photo feed active</span>
        </div>

        {/* Corner QR Code Badge */}
        {appUrl && (
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-neutral-900/90 border border-amber-500/30 backdrop-blur-md shadow-2xl">
            <div className="p-1 rounded-xl bg-white">
              <QRCodeSVG value={appUrl} size={64} level="M" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                Scan to Project Photo
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Take a selfie from your table!
              </p>
            </div>
          </div>
        )}
      </footer>
    </main>
  );
}
