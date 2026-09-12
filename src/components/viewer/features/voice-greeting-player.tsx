"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { m } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Mic, RotateCcw, Sparkles } from "lucide-react";

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
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Default natural waveform bar heights
  const [waveformBars, setWaveformBars] = useState<number[]>([
    0.35, 0.55, 0.85, 0.45, 0.95, 0.65, 0.8, 1.0, 0.7, 0.5, 0.9, 0.6,
    0.75, 0.95, 0.65, 0.4, 0.85, 0.6, 0.9, 0.75, 0.45, 0.8, 0.6, 0.4
  ]);

  // AudioContext decode: accurately resolves WebM/MediaRecorder files where HTMLMediaElement duration is Infinity
  useEffect(() => {
    if (!voiceNoteUrl) return;
    let isMounted = true;

    if (typeof window !== "undefined") {
      fetch(voiceNoteUrl)
        .then((res) => {
          if (!res.ok) throw new Error("Audio fetch failed");
          return res.arrayBuffer();
        })
        .then((buf) => {
          const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (!AudioCtxClass) return;
          const ctx = new AudioCtxClass();
          return ctx.decodeAudioData(buf).then((decoded) => {
            if (!isMounted) return;
            if (decoded && isFinite(decoded.duration) && decoded.duration > 0) {
              setDuration(decoded.duration);

              // Calculate authentic PCM audio peaks across 24 frequency bands
              try {
                const raw = decoded.getChannelData(0);
                const barCount = 24;
                const blockSize = Math.floor(raw.length / barCount);
                if (blockSize > 0) {
                  const peaks: number[] = [];
                  for (let i = 0; i < barCount; i++) {
                    let sum = 0;
                    for (let j = 0; j < blockSize; j++) {
                      sum += Math.abs(raw[i * blockSize + j] || 0);
                    }
                    peaks.push(sum / blockSize);
                  }
                  const maxPeak = Math.max(...peaks, 0.001);
                  const normalized = peaks.map((p) => Math.max(0.2, Math.min(1.0, p / maxPeak)));
                  setWaveformBars(normalized);
                }
              } catch {
                // keep fallback bars
              }
            }
            ctx.close().catch(() => {});
          });
        })
        .catch(() => {
          // Handled gracefully by HTML5 probe below
        });
    }

    return () => {
      isMounted = false;
    };
  }, [voiceNoteUrl]);

  // HTML5 audio lifecycle with Chromium WebM seek-to-end duration probe
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      } else {
        // Probe Chromium WebM duration by seeking to end
        const onSeeked = () => {
          audio.removeEventListener("seeked", onSeeked);
          if (isFinite(audio.currentTime) && audio.currentTime > 0) {
            setDuration(audio.currentTime);
          }
          audio.currentTime = 0;
        };
        audio.addEventListener("seeked", onSeeked, { once: true });
        audio.currentTime = 1e6;
      }
    };

    const handleDurationChange = () => {
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.currentTime > 0) {
        setDuration((prev) => {
          if (!isFinite(prev) || prev <= 0) return audio.currentTime;
          return Math.max(prev, audio.currentTime);
        });
      }
    };

    const handlePlay = () => setIsPlaying(true);

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (audio.currentTime > 0) {
        setDuration((prev) => (isFinite(prev) && prev > 0 ? prev : audio.currentTime));
      }
      onPlayEnd?.();
      window.dispatchEvent(new CustomEvent("shaadi_voice_ended"));
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPlayEnd?.();
      window.dispatchEvent(new CustomEvent("shaadi_voice_ended"));
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);

    return () => {
      if (audio && !audio.paused) {
        audio.pause();
        window.dispatchEvent(new CustomEvent("shaadi_voice_ended"));
      }
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
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
    } else {
      window.dispatchEvent(new CustomEvent("shaadi_voice_started"));
      onPlayStart?.();
      audio.play().catch((err) => {
        if (err?.name !== "AbortError") {
          console.warn("Voice play error:", err);
          setIsPlaying(false);
          window.dispatchEvent(new CustomEvent("shaadi_voice_ended"));
        }
      });
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const cycleSpeed = () => {
    const audio = audioRef.current;
    const nextSpeed: 1 | 1.5 | 2 = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
    setPlaybackSpeed(nextSpeed);
    if (audio) {
      audio.playbackRate = nextSpeed;
    }
  };

  const seekToTime = (time: number) => {
    const safeTime = Math.max(0, Math.min(time, effectiveDuration));
    if (audioRef.current) {
      audioRef.current.currentTime = safeTime;
      setCurrentTime(safeTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekToTime(parseFloat(e.target.value));
  };

  const handleRestart = () => {
    seekToTime(0);
    if (!isPlaying) {
      togglePlay();
    }
  };

  const formatTime = (secs: number) => {
    if (!isFinite(secs) || isNaN(secs) || secs < 0) return "0:00";
    const totalSeconds = Math.round(secs);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Safe duration guaranteed never to be 0 or Infinity
  const effectiveDuration = isFinite(duration) && duration > 0
    ? duration
    : (currentTime > 0 ? Math.max(currentTime, 7) : 7);

  const progressRatio = Math.min(1, Math.max(0, currentTime / effectiveDuration));

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seekToTime(ratio * effectiveDuration);
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto my-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-card/95 via-card/85 to-background/95 border border-amber-500/30 hover:border-amber-500/50 shadow-[0_8px_32px_rgba(212,175,55,0.15)] backdrop-blur-2xl transition-all duration-300 relative overflow-hidden group"
    >
      {/* Ambient breathing glow */}
      <div
        className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-amber-500/10 blur-3xl pointer-events-none transition-opacity duration-500"
        style={{ opacity: isPlaying ? 0.8 : 0.25 }}
      />
      <div
        className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-amber-500/10 blur-3xl pointer-events-none transition-opacity duration-500"
        style={{ opacity: isPlaying ? 0.8 : 0.25 }}
      />

      <audio ref={audioRef} src={voiceNoteUrl} preload="auto" />

      {/* Header Info */}
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isPlaying
                  ? "bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105"
                  : "bg-amber-500/15 border border-amber-500/40 text-amber-400"
              }`}
            >
              <Mic className="w-5 h-5" />
            </div>
            {isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
              </span>
            )}
          </div>

          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-foreground tracking-tight truncate block">
                {voiceNoteTitle || "Personal Audio Greeting"}
              </span>
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            </div>
            <span className="text-[11px] font-medium text-amber-400/90 block truncate">
              {voiceNoteSender || "From the Hosts"}
            </span>
          </div>
        </div>

        {/* Speed button & Volume */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={cycleSpeed}
            type="button"
            title="Adjust playback speed"
            className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
          >
            {playbackSpeed}x
          </button>
          <button
            onClick={toggleMute}
            type="button"
            title={isMuted ? "Unmute" : "Mute"}
            className="p-1.5 rounded-full text-slate-400 hover:text-amber-400 hover:bg-white/5 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Dynamic Sound Waveform Equalizer Spectrum */}
      <div
        onClick={handleWaveformClick}
        className="py-2.5 px-1 relative z-10 cursor-pointer group/wave select-none"
        title="Tap anywhere on waveform to jump to that moment"
      >
        <div className="flex items-center justify-between gap-1 sm:gap-1.5 h-10 px-3 rounded-2xl bg-background/50 border border-white/10 group-hover/wave:border-amber-500/40 transition-colors">
          {waveformBars.map((h, i) => {
            const barRatio = i / (waveformBars.length - 1);
            const isPlayed = barRatio <= progressRatio;
            return (
              <m.div
                key={i}
                animate={
                  isPlaying && isPlayed
                    ? {
                        scaleY: [0.75, 1.25, 0.75],
                      }
                    : { scaleY: 1 }
                }
                transition={
                  isPlaying && isPlayed
                    ? {
                        repeat: Infinity,
                        duration: 0.4 + (i % 4) * 0.1,
                        ease: "easeInOut",
                      }
                    : { duration: 0.2 }
                }
                className={`w-1 sm:w-1.5 rounded-full origin-center transition-colors duration-150 ${
                  isPlayed
                    ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                    : "bg-muted-foreground/25 group-hover/wave:bg-muted-foreground/35"
                }`}
                style={{ height: `${Math.round(Math.max(6, h * 26))}px` }}
              />
            );
          })}
        </div>
      </div>

      {/* Player Controls & Scrubber */}
      <div className="flex items-center gap-3 pt-0.5 relative z-10">
        <button
          onClick={togglePlay}
          className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95 shrink-0 ${
            isPlaying
              ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/30"
              : "bg-gradient-to-tr from-amber-500 to-amber-400 hover:brightness-110 text-slate-950 shadow-amber-500/20"
          }`}
          aria-label={isPlaying ? "Pause voice note" : "Play voice note"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        <div className="flex-1 space-y-1.5">
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={effectiveDuration}
              step={0.05}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-amber-300 font-semibold">{formatTime(currentTime)}</span>
            <span className="text-slate-400">{formatTime(effectiveDuration)}</span>
          </div>
        </div>

        {currentTime > 0 && (
          <button
            onClick={handleRestart}
            type="button"
            title="Restart greeting"
            className="p-2 rounded-full text-slate-400 hover:text-amber-400 hover:bg-white/5 transition-colors shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </m.div>
  );
}
