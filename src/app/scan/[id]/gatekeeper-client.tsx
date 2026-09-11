"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  RefreshCw,
  Users,
  Shield,
  Flashlight,
  FlashlightOff,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Building2,
  Calendar,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface GatekeeperClientProps {
  invitationId: string;
  eventTitle: string;
  venue: string;
  category: string;
  initialPin?: string;
  initialGate?: string;
}

interface GuestInfo {
  id?: string;
  name: string;
  slug?: string;
  seats: number;
  allowedEvents?: string[];
  status?: string;
  checkedInAt?: string;
  gate?: string;
}

const GATE_OPTIONS = [
  "Main Entrance",
  "Ladies Entrance",
  "Gents Entrance",
  "VIP Gate",
  "Family Gate",
];

export function GatekeeperClient({
  invitationId,
  eventTitle,
  venue,
  category,
  initialPin = "",
  initialGate = "Main Entrance",
}: GatekeeperClientProps) {
  // Authentication State
  const [pin, setPin] = useState(initialPin);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Scanner UI State
  const [activeTab, setActiveTab] = useState<"camera" | "search" | "history">("camera");
  const [selectedGate, setSelectedGate] = useState(initialGate);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);

  // Scan Results
  const [scanResult, setScanResult] = useState<{
    type: "success" | "warning" | "error";
    title: string;
    details: string;
    guest?: GuestInfo;
  } | null>(null);

  // Stats & History
  const [stats, setStats] = useState({
    totalGuests: 0,
    checkedInCount: 0,
    totalSeats: 0,
    checkedInSeats: 0,
  });
  const [recentGuests, setRecentGuests] = useState<GuestInfo[]>([]);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GuestInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Refs
  const scannerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const resultTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sound chimes synthesis
  const playSound = useCallback((type: "success" | "warning" | "error") => {
    if (isMuted) return;
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        // High double chime (D5 -> A5)
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === "warning") {
        // Low double tone (A3 -> E3)
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else {
        // Harsh buzz (low sawtooth)
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // Audio not supported or blocked
    }
  }, [isMuted]);

  // Authenticate PIN
  const handleAuth = useCallback(async (pinToTest?: string) => {
    const candidatePin = pinToTest !== undefined ? pinToTest : pin;
    if (!candidatePin || candidatePin.trim().length < 4) {
      setAuthError("Please enter a 4-digit PIN.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      const res = await fetch(`/api/invitations/${invitationId}/scanner-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: candidatePin.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.authenticated) {
        setIsAuthenticated(true);
        sessionStorage.setItem(`gatekeeper_pin_${invitationId}`, candidatePin.trim());
        toast.success("Gatekeeper Scanner Activated!");
      } else {
        setAuthError(data.error || "Incorrect PIN. Please ask the event host.");
      }
    } catch (err) {
      console.error(err);
      setAuthError("Network connection error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  }, [invitationId, pin]);

  // Check saved session or initial PIN on mount
  useEffect(() => {
    const savedPin = sessionStorage.getItem(`gatekeeper_pin_${invitationId}`);
    if (savedPin) {
      setPin(savedPin);
      handleAuth(savedPin);
    } else if (initialPin && initialPin.trim().length >= 4) {
      handleAuth(initialPin.trim());
    }
  }, [invitationId, initialPin, handleAuth]);

  // Fetch Stats & History
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const activePin = pin.trim() || sessionStorage.getItem(`gatekeeper_pin_${invitationId}`) || "";
      const res = await fetch(`/api/invitations/${invitationId}/check-in`, {
        headers: { "x-scanner-pin": activePin },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.recentCheckIns) setRecentGuests(data.recentCheckIns);
      }
    } catch (err) {
      console.warn("Could not load stats:", err);
    }
  }, [invitationId, isAuthenticated, pin]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      const interval = setInterval(fetchStats, 15000); // Polling every 15s for live gatekeeper sync
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchStats]);

  // Stop Camera
  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
    setIsCameraActive(false);
    setIsTorchOn(false);
  }, []);

  // Handle Verify Ticket
  const handleVerify = async (rawCode: string) => {
    if (isVerifying || !rawCode.trim()) return;
    setIsVerifying(true);

    if (resultTimerRef.current) clearTimeout(resultTimerRef.current);

    try {
      const activePin = pin.trim() || sessionStorage.getItem(`gatekeeper_pin_${invitationId}`) || "";
      const res = await fetch(`/api/invitations/${invitationId}/check-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-scanner-pin": activePin,
        },
        body: JSON.stringify({
          qrData: rawCode.trim(),
          gate: selectedGate,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const guest: GuestInfo = data.guest;
        if (data.alreadyCheckedIn) {
          playSound("warning");
          const timeStr = guest.checkedInAt
            ? new Date(guest.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Earlier";
          setScanResult({
            type: "warning",
            title: "Already Checked In",
            details: `${guest.name} was already verified at ${timeStr}. (Pass for ${guest.seats} person${guest.seats > 1 ? "s" : ""}).`,
            guest,
          });
        } else {
          playSound("success");
          setScanResult({
            type: "success",
            title: "Pass Verified - Welcome!",
            details: `${guest.name} • ${guest.seats} Seat${guest.seats > 1 ? "s" : ""} Allocated`,
            guest,
          });

          // Optimistically update counts
          setStats((prev) => ({
            ...prev,
            checkedInCount: prev.checkedInCount + 1,
            checkedInSeats: prev.checkedInSeats + (guest.seats || 1),
          }));
          setRecentGuests((prev) => [
            { ...guest, checkedInAt: new Date().toISOString() },
            ...prev.filter((g) => g.name !== guest.name),
          ].slice(0, 25));
        }
      } else {
        playSound("error");
        setScanResult({
          type: "error",
          title: "Pass Not Recognized",
          details: data.error || "This ticket or QR code is not valid for this event.",
        });
      }
    } catch (err) {
      console.error(err);
      playSound("error");
      setScanResult({
        type: "error",
        title: "Connection Error",
        details: "Could not reach verification server. Please check mobile data.",
      });
    } finally {
      setIsVerifying(false);
      // Auto-dismiss result banner after 6 seconds
      resultTimerRef.current = setTimeout(() => {
        setScanResult(null);
      }, 6000);
    }
  };

  // Start Camera
  const startCamera = useCallback(async () => {
    try {
      setCameraPermissionError(null);
      setIsCameraActive(true);

      // Check for Secure Context (HTTPS or localhost)
      if (typeof window !== "undefined") {
        const isSecure = window.isSecureContext || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        if (!isSecure && window.location.protocol !== "https:") {
          setIsCameraActive(false);
          setCameraPermissionError("Camera access requires a secure connection (HTTPS or localhost). Browsers strictly block cameras on local network IP addresses (e.g. http://192.168.x.x). Please switch to Manual Search below or open this page on localhost:3000.");
          return;
        }
      }

      // Check mediaDevices support
      if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsCameraActive(false);
        setCameraPermissionError("Your browser or device does not support direct camera access. Please use Manual Guest Search.");
        return;
      }

      const { Html5Qrcode } = await import("html5-qrcode");

      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch {}
      }

      const scanner = new Html5Qrcode("gatekeeper-qr-view");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode },
        {
          fps: 12,
          qrbox: { width: 240, height: 240 },
        },
        (decodedText) => {
          handleVerify(decodedText);
        },
        () => {}
      );

      // Check for torch/flashlight capability
      try {
        const videoElem = document.querySelector("#gatekeeper-qr-view video") as HTMLVideoElement | null;
        if (videoElem && videoElem.srcObject) {
          const stream = videoElem.srcObject as MediaStream;
          const track = stream.getVideoTracks()[0];
          const capabilities = (track.getCapabilities?.() || {}) as any;
          if (capabilities.torch) {
            setHasTorch(true);
          }
        }
      } catch {}
    } catch (err: any) {
      setIsCameraActive(false);
      const errStr = String(err?.message || err?.name || err);
      if (errStr.includes("NotAllowedError") || errStr.includes("Permission denied")) {
        setCameraPermissionError("Camera permission blocked. Click the lock/tune icon 🔒 on the left of your address bar, set Camera to 'Allow', and click Retry.");
        toast.error("Camera permission blocked. Set to Allow in browser address bar.");
      } else {
        setCameraPermissionError(err?.message || "Camera access failed. Check device permissions or use Manual Search.");
        toast.error("Camera access failed. Please use Guest Search or allow camera permissions.");
      }
    }
  }, [facingMode]);

  // Toggle Torch
  const toggleTorch = async () => {
    try {
      const videoElem = document.querySelector("#gatekeeper-qr-view video") as HTMLVideoElement | null;
      if (videoElem && videoElem.srcObject) {
        const stream = videoElem.srcObject as MediaStream;
        const track = stream.getVideoTracks()[0];
        const nextTorch = !isTorchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextTorch } as any],
        });
        setIsTorchOn(nextTorch);
      }
    } catch (err) {
      toast.error("Torch not supported on this camera/browser");
    }
  };

  // Flip Camera
  const flipCamera = async () => {
    await stopCamera();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Trigger camera start when entering Camera tab
  useEffect(() => {
    if (isAuthenticated && activeTab === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isAuthenticated, activeTab, facingMode, startCamera, stopCamera]);

  // Search Guest by Name
  const handleSearch = async (term: string) => {
    setSearchQuery(term);
    if (!term.trim() || term.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const activePin = pin.trim() || sessionStorage.getItem(`gatekeeper_pin_${invitationId}`) || "";
      const res = await fetch(
        `/api/invitations/${invitationId}/check-in?search=${encodeURIComponent(term.trim())}`,
        { headers: { "x-scanner-pin": activePin } }
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.searchResults || []);
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Manual Check-in from Search list
  const handleManualCheckIn = async (guestSlug: string) => {
    await handleVerify(guestSlug);
    // Refresh search results
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  // Lock Out / Sign Out
  const handleLock = () => {
    sessionStorage.removeItem(`gatekeeper_pin_${invitationId}`);
    setIsAuthenticated(false);
    setPin("");
    stopCamera();
    toast.info("Gatekeeper session locked.");
  };

  // ==========================================
  // VIEW 1: PIN LOCK SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#090d14] text-white flex flex-col justify-between p-4 sm:p-6 select-none font-sans">
        {/* Top Branding */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs tracking-wider uppercase text-gold font-semibold">Smart Invites</span>
              <p className="text-[11px] text-zinc-400">Gatekeeper Entrance Portal</p>
            </div>
          </div>
          <Badge variant="outline" className="border-zinc-800 text-zinc-400 text-[10px] px-2 py-0.5">
            Staff Only
          </Badge>
        </div>

        {/* Central PIN Box */}
        <div className="max-w-sm w-full mx-auto my-auto space-y-6 text-center">
          <div className="space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-zinc-900/90 border border-zinc-700/60 shadow-2xl flex items-center justify-center mx-auto text-gold mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-display">
              {eventTitle}
            </h1>
            <p className="text-xs text-zinc-400 flex items-center justify-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-gold" />
              <span>{venue}</span>
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4 backdrop-blur-md shadow-2xl">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-300">Enter 4-Digit Gatekeeper PIN</label>
              <p className="text-[11px] text-zinc-500">Provided by the event host or planner</p>
            </div>

            {/* PIN Inputs / Display */}
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3].map((index) => {
                const char = pin[index] || "";
                return (
                  <div
                    key={index}
                    className={`w-12 h-14 rounded-xl border flex items-center justify-center text-xl font-bold transition-all ${
                      char
                        ? "border-gold bg-gold/10 text-gold shadow-lg shadow-gold/10"
                        : "border-zinc-700 bg-zinc-800/50 text-zinc-500"
                    }`}
                  >
                    {char ? "•" : ""}
                  </div>
                );
              })}
            </div>

            {authError && (
              <p className="text-xs text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 rounded-lg py-1.5 px-3">
                {authError}
              </p>
            )}

            {/* Numeric Keypad for fast mobile entry */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    if (pin.length < 4) {
                      const next = pin + String(num);
                      setPin(next);
                      if (next.length === 4) handleAuth(next);
                    }
                  }}
                  className="h-12 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 active:bg-zinc-600 text-lg font-semibold text-white transition-colors"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPin("")}
                className="h-12 rounded-xl bg-zinc-800/40 hover:bg-zinc-800 text-xs font-medium text-zinc-400"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  if (pin.length < 4) {
                    const next = pin + "0";
                    setPin(next);
                    if (next.length === 4) handleAuth(next);
                  }
                }}
                className="h-12 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 active:bg-zinc-600 text-lg font-semibold text-white transition-colors"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => setPin((prev) => prev.slice(0, -1))}
                className="h-12 rounded-xl bg-zinc-800/40 hover:bg-zinc-800 text-xs font-medium text-zinc-400"
              >
                ⌫
              </button>
            </div>

            <Button
              onClick={() => handleAuth()}
              disabled={authLoading || pin.length < 4}
              className="w-full bg-gold hover:bg-gold/90 text-black font-semibold rounded-xl h-11 transition-all mt-2"
            >
              {authLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Unlock className="w-4 h-4 mr-2" />
              )}
              Unlock Entrance Scanner
            </Button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-zinc-500 pb-2">
          Secure Entrance Check-in System • Smart Invites Pakistan
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ACTIVE GATEKEEPER SCANNER
  // ==========================================
  const checkInPercent =
    stats.totalGuests > 0
      ? Math.round((stats.checkedInCount / stats.totalGuests) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#090d14] text-white flex flex-col justify-between font-sans select-none">
      {/* Top Gatekeeper Header */}
      <header className="bg-zinc-900/90 border-b border-zinc-800/80 px-4 py-3 sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold truncate text-white leading-tight">
                {eventTitle}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Gate
                </span>
                <span>•</span>
                <span className="truncate">{venue}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted((m) => !m)}
              className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-gold" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLock}
              className="h-8 w-8 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg"
              title="Lock Scanner"
            >
              <Lock className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Gate Selector & Live Tally Bar */}
        <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs gap-2">
          {/* Gate selector dropdown */}
          <select
            value={selectedGate}
            onChange={(e) => setSelectedGate(e.target.value)}
            className="bg-zinc-800/80 border border-zinc-700 text-gold font-medium rounded-lg px-2.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-gold"
          >
            {GATE_OPTIONS.map((g) => (
              <option key={g} value={g} className="bg-zinc-900 text-white">
                {g}
              </option>
            ))}
          </select>

          {/* Quick Counter */}
          <div className="flex items-center gap-1.5 text-zinc-300 font-medium text-[11px]">
            <Users className="w-3.5 h-3.5 text-gold" />
            <span>
              Checked In:{" "}
              <strong className="text-white font-bold">{stats.checkedInCount}</strong>
              <span className="text-zinc-500">/{stats.totalGuests}</span>
            </span>
            <span className="text-gold font-semibold">({checkInPercent}%)</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* TAB 1: CAMERA SCANNER */}
        {activeTab === "camera" && (
          <div className="flex-1 flex flex-col items-center justify-center p-3 relative">
            {/* Camera Viewport Container */}
            <div className="relative w-full max-w-sm aspect-square bg-black rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center">
              <div id="gatekeeper-qr-view" className="w-full h-full object-cover" />

              {/* Scanning Target Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="relative w-60 h-60 border-2 border-gold/60 rounded-3xl overflow-hidden">
                  {/* Corner Accent Brackets */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-gold" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-gold" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-gold" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-gold" />

                  {/* Animated Radar Scanning Line */}
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent shadow-[0_0_12px_#D4AF37] animate-scan-beam" />
                </div>
                <p className="text-[11px] text-zinc-300/80 mt-3 font-medium bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                  Point at Guest Pass QR Code
                </p>
              </div>

              {/* Loading Spinner during check */}
              {isVerifying && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                  <RefreshCw className="w-8 h-8 text-gold animate-spin mb-2" />
                  <span className="text-xs font-semibold text-white">Verifying Entry Ticket...</span>
                </div>
              )}

              {/* Camera Permission / Access Error Overlay */}
              {cameraPermissionError && (
                <div className="absolute inset-0 bg-zinc-950/95 p-5 flex flex-col items-center justify-center text-center z-20 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <CameraOff className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Camera Access Required</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed max-w-xs">{cameraPermissionError}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => startCamera()}
                      className="bg-gold hover:bg-gold/90 text-black font-semibold text-xs h-9 rounded-xl px-4"
                    >
                      <RotateCw className="w-3.5 h-3.5 mr-1.5" />
                      Retry Camera
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveTab("search")}
                      className="border-zinc-700 bg-zinc-900 text-zinc-200 text-xs h-9 rounded-xl px-4"
                    >
                      Guest Search
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Camera Action Buttons (Torch & Flip) */}
            <div className="flex items-center justify-center gap-3 mt-3">
              {hasTorch && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleTorch}
                  className={`rounded-xl border-zinc-700 text-xs gap-1.5 h-9 ${
                    isTorchOn ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {isTorchOn ? <Flashlight className="w-4 h-4 text-amber-400" /> : <FlashlightOff className="w-4 h-4" />}
                  <span>{isTorchOn ? "Torch ON" : "Torch"}</span>
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={flipCamera}
                className="rounded-xl border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs gap-1.5 h-9"
              >
                <RotateCw className="w-4 h-4" />
                <span>Switch Camera</span>
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL SEARCH / NAME LIST */}
        {activeTab === "search" && (
          <div className="flex-1 p-4 max-w-lg w-full mx-auto space-y-4 overflow-y-auto">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Manual Guest Check-in</h3>
              <p className="text-xs text-zinc-400">Search by guest name or pass slug if screen is broken or battery dead.</p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Type guest name (e.g. Tariq Mehmood)..."
                className="pl-9 h-11 bg-zinc-900 border-zinc-700 rounded-xl text-white text-sm focus:ring-1 focus:ring-gold"
                autoFocus
              />
              {isSearching && (
                <RefreshCw className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gold" />
              )}
            </div>

            {/* Search Results */}
            <div className="space-y-2">
              {searchResults.length > 0 ? (
                searchResults.map((guest) => {
                  const isChecked = guest.status === "checked_in";
                  return (
                    <div
                      key={guest.id || guest.slug}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isChecked
                          ? "bg-zinc-900/60 border-zinc-800 text-zinc-400"
                          : "bg-zinc-900 border-zinc-700/80 text-white"
                      }`}
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                          {guest.name}
                          {isChecked && (
                            <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px] px-1.5 py-0">
                              Checked In
                            </Badge>
                          )}
                        </h4>
                        <p className="text-xs text-zinc-400">
                          Allocated: <strong className="text-zinc-200">{guest.seats || 1} Seat(s)</strong>
                          {guest.allowedEvents && guest.allowedEvents.length > 0 && (
                            <span> • {guest.allowedEvents.join(", ")}</span>
                          )}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        disabled={isChecked || isVerifying}
                        onClick={() => handleManualCheckIn(guest.slug || guest.name)}
                        className={`rounded-xl text-xs font-semibold h-8 px-3 ${
                          isChecked
                            ? "bg-zinc-800 text-zinc-500"
                            : "bg-emerald-600 hover:bg-emerald-500 text-white"
                        }`}
                      >
                        {isChecked ? "Admitted" : "Admit Pass"}
                      </Button>
                    </div>
                  );
                })
              ) : searchQuery.length >= 2 && !isSearching ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No guest found matching &quot;{searchQuery}&quot;.
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* TAB 3: CHECK-IN HISTORY */}
        {activeTab === "history" && (
          <div className="flex-1 p-4 max-w-lg w-full mx-auto space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Admitted Guests Log</h3>
                <p className="text-xs text-zinc-400">Recent check-ins verified at entrance gates.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStats}
                className="h-7 text-xs border-zinc-700 text-zinc-300 rounded-lg gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </Button>
            </div>

            {recentGuests.length > 0 ? (
              <div className="space-y-2">
                {recentGuests.map((g, idx) => (
                  <div
                    key={g.id || idx}
                    className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        ✓
                      </div>
                      <div>
                        <p className="font-semibold text-white">{g.name}</p>
                        <p className="text-[11px] text-zinc-400">
                          {g.seats || 1} Seat(s) • Gate: {g.gate || selectedGate}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {g.checkedInAt
                        ? new Date(g.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "Just now"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500 text-xs">
                No guests admitted yet. Start scanning entry passes!
              </div>
            )}
          </div>
        )}

        {/* POPUP RESULT BANNER (Overlay on bottom of screen) */}
        <AnimatePresence>
          {scanResult && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={() => setScanResult(null)}
              className="absolute bottom-20 inset-x-3 max-w-sm mx-auto z-40 cursor-pointer"
            >
              <div
                className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-start gap-3.5 ${
                  scanResult.type === "success"
                    ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-100 shadow-emerald-900/30"
                    : scanResult.type === "warning"
                    ? "bg-amber-950/90 border-amber-500/50 text-amber-100 shadow-amber-900/30"
                    : "bg-rose-950/90 border-rose-500/50 text-rose-100 shadow-rose-900/30"
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {scanResult.type === "success" ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : scanResult.type === "warning" ? (
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold leading-tight">{scanResult.title}</h4>
                  <p className="text-xs mt-1 text-zinc-200">{scanResult.details}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setScanResult(null)}
                  className="text-xs opacity-60 hover:opacity-100 p-1"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="bg-zinc-900 border-t border-zinc-800 px-6 py-2 flex items-center justify-around z-30">
        <button
          type="button"
          onClick={() => setActiveTab("camera")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === "camera"
              ? "text-gold font-bold scale-105"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Camera className="w-5 h-5" />
          <span className="text-[10px]">Camera</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("search")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === "search"
              ? "text-gold font-bold scale-105"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px]">Search</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === "history"
              ? "text-gold font-bold scale-105"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Log ({stats.checkedInCount})</span>
        </button>
      </nav>
    </div>
  );
}
