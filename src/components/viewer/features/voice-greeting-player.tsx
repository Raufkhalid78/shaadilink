"use client";

import React, { useState, useRef, useEffect } from "react";
import { m } from "framer-motion";
import { Play, Pause, Volume2, Mic } from "lucide-react";

interface VoiceGreetingPlayerProps {
  voiceNoteUrl?: string;
  voiceNoteTitle?: string;
  voiceNoteSender?: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
}

export function VoiceGreetingPlayer({
  voiceNoteUrl,
  voiceNoteTitle = "Personal Audio Greeting",
  voiceNoteSender = "From the Hosts",
  onPlayStart,
  onPlayEnd,
}: VoiceGreetingPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onPlayEnd?.();
      window.dispatchEvent(new CustomEvent("shaadi_voice_ended"));
    };
    const handlePause = () => {
      setIsPlaying(false);
      onPlayEnd?.();
      window.dispatchEvent(new CustomEvent("shaadi_voice_ended"));
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
    };
  }, [onPlayEnd]);

  if (!voiceNoteUrl) return null;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      onPlayEnd?.();
      window.dispatchEvent(new CustomEvent("shaadi_voice_ended"));
    } else {
      // Duck background music
      window.dispatchEvent(new CustomEvent("shaadi_voice_started"));
      onPlayStart?.();
      audio.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto my-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-card/90 via-card/80 to-background/90 border border-gold/40 shadow-2xl backdrop-blur-xl space-y-3"
    >
      <audio ref={audioRef} src={voiceNoteUrl} preload="metadata" />

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-gold/50 flex items-center justify-center text-primary">
            <Mic className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="text-xs font-bold text-foreground block tracking-tight">
              {voiceNoteTitle || "Personal Audio Greeting"}
            </span>
            <span className="text-[11px] text-primary/90 font-medium">
              {voiceNoteSender || "From the Hosts"}
            </span>
          </div>
        </div>

        {/* Animated Sound Waveform Indicator */}
        <div className="flex items-center gap-1 h-5 px-2">
          {[0.4, 0.9, 0.6, 1.0, 0.5, 0.8, 0.3].map((h, i) => (
            <m.span
              key={i}
              animate={isPlaying ? { scaleY: [1, h * 2.2, 1] } : { scaleY: 1 }}
              transition={
                isPlaying
                  ? { repeat: Infinity, duration: 0.6 + i * 0.1, ease: "easeInOut" }
                  : {}
              }
              className={`w-1 rounded-full origin-bottom ${
                isPlaying ? "bg-primary" : "bg-muted-foreground/40"
              }`}
              style={{ height: `${h * 16}px` }}
            />
          ))}
        </div>
      </div>

      {/* Player Controls & Scrubber */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={togglePlay}
          className="w-11 h-11 rounded-full bg-primary hover:bg-primary-light text-slate-950 flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
          aria-label={isPlaying ? "Pause voice note" : "Play voice note"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        <div className="flex-1 space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{duration ? formatTime(duration) : "0:00"}</span>
          </div>
        </div>
      </div>
    </m.div>
  );
}
