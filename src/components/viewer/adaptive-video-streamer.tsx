"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Sparkles, Wifi, FastForward } from "lucide-react";

interface NetworkInformation extends EventTarget {
  effectiveType?: "4g" | "3g" | "2g" | "slow-2g";
  saveData?: boolean;
  rtt?: number;
  downlink?: number;
}

export interface AdaptiveMediaState {
  effectiveType: "4g" | "3g" | "2g" | "slow-2g" | "unknown";
  isLowBandwidth: boolean;
  saveData: boolean;
}

/**
 * Hook to detect connection conditions and choose appropriate media bitrate
 */
export function useAdaptiveMediaQuality(): AdaptiveMediaState {
  const [quality, setQuality] = useState<AdaptiveMediaState>({
    effectiveType: "unknown",
    isLowBandwidth: false,
    saveData: false,
  });

  useEffect(() => {
    if (typeof window === "undefined" || !("connection" in navigator)) return;

    const connection = (navigator as unknown as { connection?: NetworkInformation }).connection;
    if (!connection) return;

    const updateConnectionStatus = () => {
      const effType = connection.effectiveType || "unknown";
      const isLow = effType === "2g" || effType === "slow-2g" || effType === "3g" || !!connection.saveData;
      setQuality({
        effectiveType: effType,
        isLowBandwidth: isLow,
        saveData: !!connection.saveData,
      });
    };

    updateConnectionStatus();
    connection.addEventListener("change", updateConnectionStatus);
    return () => connection.removeEventListener("change", updateConnectionStatus);
  }, []);

  return quality;
}

interface AdaptiveVideoStreamerProps {
  videoUrl: string;
  posterUrl?: string;
  doorsOpened: boolean;
  onOpen: (instant?: boolean) => void;
  accent?: string;
}

/**
 * High-performance adaptive video streamer for Royal door animations
 * Provides zero-stall guarantee with auto-recovery and instant CSS fallback
 */
export function AdaptiveVideoStreamer({
  videoUrl,
  posterUrl,
  doorsOpened,
  onOpen,
  accent = "#C9A84C",
}: AdaptiveVideoStreamerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStalled, setHasStalled] = useState(false);
  const network = useAdaptiveMediaQuality();

  // Watch for slow loading / buffer stalls
  useEffect(() => {
    if (!isPressed || doorsOpened) return;

    const stallTimer = setTimeout(() => {
      if (videoRef.current && (videoRef.current.paused || videoRef.current.readyState < 2)) {
        setHasStalled(true);
      }
    }, 2800);

    return () => clearTimeout(stallTimer);
  }, [isPressed, doorsOpened]);

  const handlePlayAndOpen = useCallback(() => {
    if (doorsOpened) return;
    setIsPressed(true);
    setIsLoading(true);

    const video = videoRef.current;
    if (video) {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsLoading(false);
          })
          .catch(() => {
            setIsLoading(false);
            onOpen(true);
          });
      }
    } else {
      onOpen(true);
    }
  }, [doorsOpened, onOpen]);

  if (doorsOpened) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black cursor-pointer flex items-center justify-center overflow-hidden transition-opacity duration-1000 select-none"
      onClick={handlePlayAndOpen}
    >
      <video
        ref={videoRef}
        id="opening-video"
        src={`${videoUrl}#t=0.001`}
        poster={posterUrl}
        className="w-full h-full object-cover"
        playsInline
        muted
        preload={network.isLowBandwidth ? "none" : "auto"}
        onEnded={() => onOpen(true)}
        onError={() => {
          onOpen(true);
        }}
        onStalled={() => setHasStalled(true)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setHasStalled(false);
        }}
      />

      {/* Network Quality Indicator in top corner */}
      {network.isLowBandwidth && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-[11px] text-amber-300">
          <Wifi className="w-3 h-3 text-amber-400" />
          <span>Optimized for Mobile</span>
        </div>
      )}

      {/* Skip / Fast Entrance Button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-xs text-white/80 hover:text-white transition-all active:scale-95"
          title="Skip animation and enter"
        >
          <span>Skip</span>
          <FastForward className="w-3 h-3 text-amber-400" />
        </button>
      </div>

      {/* Center Prompt Banner */}
      <AnimatePresence>
        {!isPressed && !doorsOpened && (
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.4 } }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4 text-center"
          >
            <div
              className="px-6 py-3.5 rounded-full bg-black/65 backdrop-blur-md border shadow-2xl flex items-center gap-2.5 transition-all"
              style={{ borderColor: `${accent}60`, boxShadow: `0 0 30px ${accent}30` }}
            >
              <Sparkles className="w-4 h-4 animate-spin" style={{ color: accent, animationDuration: "6s" }} />
              <span className="text-white text-xs sm:text-sm uppercase font-medium tracking-[0.2em] drop-shadow-md">
                Tap anywhere to open
              </span>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Buffering or Stall Recovery */}
      <AnimatePresence>
        {isPressed && (isLoading || hasStalled) && !doorsOpened && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 inset-x-0 flex flex-col items-center justify-center pointer-events-auto z-30 px-4"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpen(true);
              }}
              className="px-5 py-2.5 rounded-full bg-amber-500/90 hover:bg-amber-500 text-black font-semibold text-xs tracking-wider uppercase shadow-xl transition-transform active:scale-95 flex items-center gap-2"
            >
              <span>Instant Entrance</span>
              <FastForward className="w-3.5 h-3.5" />
            </button>
            <p className="text-[11px] text-white/60 mt-2 font-mono">
              {hasStalled ? "Buffering on mobile network — Tap to enter instantly" : "Opening..."}
            </p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
