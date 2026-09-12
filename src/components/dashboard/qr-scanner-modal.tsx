"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  Camera,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Search,
  RefreshCw,
  Users,
  UserCheck,
  Share2,
  KeyRound,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Lock,
  Power,
  Sparkles,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { toast } from "sonner";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitationId: string;
  invitationTitle: string;
  category?: string;
}

interface GuestInfo {
  id?: string;
  name: string;
  slug?: string;
  seats: number;
  allowedEvents?: string[];
  status?: string;
  checkedInAt?: string;
}

export function QRScannerModal({
  isOpen,
  onClose,
  invitationId,
  invitationTitle,
  category,
}: QRScannerModalProps) {
  // Modal navigation tab
  const [modalTab, setModalTab] = useState<"scanner" | "delegation">("scanner");

  // Scanner state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanResult, setScanResult] = useState<{
    type: "success" | "warning" | "error";
    title: string;
    details: string;
    guest?: GuestInfo;
  } | null>(null);

  // Delegation PIN state
  const [gatekeeperPin, setGatekeeperPin] = useState("1234");
  const [isDelegationActive, setIsDelegationActive] = useState(true);
  const [isPinLoading, setIsPinLoading] = useState(false);
  const [customPin, setCustomPin] = useState("");
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [copiedType, setCopiedType] = useState<"link" | "linkWithPin" | null>(null);

  // Stats & History
  const [stats, setStats] = useState<{
    totalGuests: number;
    checkedInCount: number;
    totalSeats: number;
    checkedInSeats: number;
  }>({
    totalGuests: 0,
    checkedInCount: 0,
    totalSeats: 0,
    checkedInSeats: 0,
  });

  const [recentGuests, setRecentGuests] = useState<GuestInfo[]>([]);
  const scannerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Synthesize sound chime
  const playSound = (success: boolean) => {
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

      if (success) {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {}
  };

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
  }, []);

  // Fetch initial stats & PIN info
  const fetchStatsAndPin = useCallback(async () => {
    if (!invitationId) return;
    try {
      // 1. Fetch check-in stats
      const statsRes = await fetch(`/api/invitations/${invitationId}/check-in`);
      if (statsRes.ok) {
        const data = await statsRes.json();
        if (data.stats) setStats(data.stats);
        if (data.recentCheckIns) setRecentGuests(data.recentCheckIns);
      }

      // 2. Fetch PIN & delegation status
      setIsPinLoading(true);
      const pinRes = await fetch(`/api/invitations/${invitationId}/scanner-auth`);
      if (pinRes.ok) {
        const pinData = await pinRes.json();
        if (pinData.pin) {
          setGatekeeperPin(pinData.pin);
          setCustomPin(pinData.pin);
        }
        if (pinData.scannerActive !== undefined) {
          setIsDelegationActive(pinData.scannerActive);
        }
      }
    } catch (err) {
      console.warn("Could not load check-in or PIN data:", err);
    } finally {
      setIsPinLoading(false);
    }
  }, [invitationId]);

  useEffect(() => {
    if (isOpen) {
      fetchStatsAndPin();
    } else {
      stopCamera();
      setScanResult(null);
      setIsEditingPin(false);
    }
  }, [isOpen, invitationId, fetchStatsAndPin, stopCamera]);

  // Handle QR verification
  const handleVerify = async (rawCode: string) => {
    if (isVerifying || !rawCode.trim()) return;
    setIsVerifying(true);

    try {
      const res = await fetch(`/api/invitations/${invitationId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrData: rawCode.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const guest: GuestInfo = data.guest;
        if (data.alreadyCheckedIn) {
          playSound(false);
          const timeStr = guest.checkedInAt
            ? new Date(guest.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Earlier";
          setScanResult({
            type: "warning",
            title: "Already Checked In",
            details: `${guest.name} was already verified at ${timeStr}. Allocated: ${guest.seats} seat(s).`,
            guest,
          });
        } else {
          playSound(true);
          setScanResult({
            type: "success",
            title: "Check-in Verified",
            details: `Welcome, ${guest.name}! Allocated: ${guest.seats} seat(s).`,
            guest,
          });
          // Update local list & stats
          setRecentGuests((prev) => [guest, ...prev.filter((g) => g.name !== guest.name)].slice(0, 15));
          setStats((prev) => ({
            ...prev,
            checkedInCount: prev.checkedInCount + 1,
            checkedInSeats: prev.checkedInSeats + (guest.seats || 1),
          }));
        }
      } else {
        playSound(false);
        setScanResult({
          type: "error",
          title: "Pass Not Recognized",
          details: data.error || "The scanned QR code or pass is not registered for this event.",
        });
      }
    } catch (err) {
      console.error(err);
      playSound(false);
      setScanResult({
        type: "error",
        title: "Connection Error",
        details: "Unable to verify pass. Please check your internet connection.",
      });
    } finally {
      setIsVerifying(false);
      setManualCode("");
    }
  };

  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);

  // Start Camera
  const startCamera = async () => {
    try {
      setCameraPermissionError(null);
      setIsCameraActive(true);

      // Check for Secure Context (HTTPS or localhost)
      if (typeof window !== "undefined") {
        const isSecure = window.isSecureContext || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        if (!isSecure && window.location.protocol !== "https:") {
          setIsCameraActive(false);
          setCameraPermissionError("Camera access requires a secure connection (HTTPS or localhost). Browsers strictly block cameras on local network IP addresses (like http://192.168.x.x). Please open on http://localhost:3000 on your PC, or enter the guest pass code manually below.");
          toast.error("Camera requires HTTPS or localhost.");
          return;
        }

        if (!navigator?.mediaDevices?.getUserMedia) {
          setIsCameraActive(false);
          setCameraPermissionError("Camera is not supported in this browser context. Please enter the guest pass code manually below.");
          toast.error("Camera API not supported in this browser context.");
          return;
        }

        // Test explicit permission request to trigger browser dialog if not yet decided
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
          // Stop stream immediately so Html5Qrcode can bind
          stream.getTracks().forEach((track) => track.stop());
        } catch (permErr: any) {
          setIsCameraActive(false);
          const pStr = String(permErr?.message || permErr?.name || permErr);
          if (pStr.includes("NotAllowedError") || pStr.includes("Permission denied")) {
            setCameraPermissionError("Camera access is currently blocked in your browser. Because it was previously blocked, the browser will not show a popup. To enable: Click the Lock/Tune icon (🔒) on the left of your address bar (next to localhost:3000), set Camera to 'Allow', then click Retry Permission.");
            toast.error("Camera is blocked. Click the lock icon in your address bar to allow it.");
            return;
          }
        }
      }

      const { Html5Qrcode } = await import("html5-qrcode");

      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch {}
      }

      const scanner = new Html5Qrcode("qr-camera-view");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          handleVerify(decodedText);
        },
        () => {}
      );
    } catch (err: any) {
      setIsCameraActive(false);
      const errStr = String(err?.message || err?.name || err);
      if (errStr.includes("NotAllowedError") || errStr.includes("Permission denied")) {
        setCameraPermissionError("Camera access is currently blocked in your browser. To enable: Click the Lock/Tune icon (🔒) on the left of your address bar (next to localhost:3000), set Camera to 'Allow', then click Retry Permission.");
        toast.error("Camera is blocked. Click the lock icon in your address bar to allow it.");
      } else {
        setCameraPermissionError("Could not access camera. Please check device permissions or enter the code manually below.");
        toast.error("Camera unavailable. Please enter code manually.");
      }
    }
  };

  // Update or Regenerate PIN
  const handleUpdatePin = async (newPinValue: string) => {
    const clean = newPinValue.replace(/\D/g, "").slice(0, 6);
    if (clean.length < 4) {
      toast.error("PIN must be at least 4 digits.");
      return;
    }

    try {
      const res = await fetch(`/api/invitations/${invitationId}/scanner-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPin: clean }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGatekeeperPin(clean);
        setCustomPin(clean);
        setIsEditingPin(false);
        toast.success(`Gatekeeper PIN updated to ${clean}`);
      } else {
        toast.error(data.error || "Failed to update PIN");
      }
    } catch {
      toast.error("Error updating PIN");
    }
  };

  // Toggle Gatekeeper Access On/Off
  const handleToggleAccess = async () => {
    const nextState = !isDelegationActive;
    setIsDelegationActive(nextState);

    try {
      const res = await fetch(`/api/invitations/${invitationId}/scanner-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scannerActive: nextState }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(nextState ? "Gatekeeper access enabled" : "Gatekeeper access disabled");
      } else {
        setIsDelegationActive(!nextState);
        toast.error("Failed to update access state");
      }
    } catch {
      setIsDelegationActive(!nextState);
      toast.error("Network error");
    }
  };

  // Generate random 4-digit PIN
  const handleRandomPin = () => {
    const random = String(Math.floor(1000 + Math.random() * 9000));
    handleUpdatePin(random);
  };

  // Construct Gatekeeper URLs
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const gatekeeperBaseUrl = `${origin}/scan/${invitationId}`;
  const gatekeeperUrlWithPin = `${gatekeeperBaseUrl}?pin=${gatekeeperPin}`;

  const handleCopy = (text: string, type: "link" | "linkWithPin") => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedType(type);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const message = `Entrance Pass Scanner for *${invitationTitle}*:\n\n🔗 Scanner Link: ${gatekeeperUrlWithPin}\n🔑 Gatekeeper PIN: *${gatekeeperPin}*\n\nPlease open this link on your smartphone at the entrance gate to scan and verify guest QR passes.`;
    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  const categoryBadgeLabel = category === "birthday"
    ? "Birthday"
    : category === "school"
    ? "Academic"
    : category === "corporate" || category === "meeting"
    ? "Corporate"
    : category === "party"
    ? "Celebration"
    : "Wedding";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg w-full max-w-[95vw] bg-neutral-950/95 backdrop-blur-2xl border border-amber-500/25 shadow-2xl p-4 sm:p-6 text-foreground rounded-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader className="text-center space-y-1.5 pb-2">
          <div className="mx-auto w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-1 shadow-inner">
            <Camera className="w-5 h-5" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-white">
            Entrance Pass Scanner
          </DialogTitle>
          <div className="flex items-center justify-center gap-2 pt-0.5">
            <span className="text-xs text-neutral-400 truncate max-w-[220px]">
              {invitationTitle}
            </span>
            <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0">
              {categoryBadgeLabel}
            </Badge>
          </div>
        </DialogHeader>

        {/* Segmented Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-neutral-900 border border-white/10 text-xs font-semibold gap-1">
          <button
            type="button"
            onClick={() => {
              setModalTab("scanner");
            }}
            className={`py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer min-w-0 ${
              modalTab === "scanner"
                ? "bg-neutral-800 text-white shadow-md border border-white/15 font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Camera className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Host Scanner</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopCamera();
              setModalTab("delegation");
            }}
            className={`py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer min-w-0 ${
              modalTab === "delegation"
                ? "bg-amber-500/20 text-amber-300 shadow-md border border-amber-500/40 font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Gatekeeper Link &amp; PIN</span>
            <span className="bg-amber-500/30 text-amber-300 text-[9px] px-1.5 py-0.5 rounded-full font-mono shrink-0 hidden xs:inline">
              Staff
            </span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: DIRECT HOST CAMERA SCANNER */}
        {/* ========================================================= */}
        {modalTab === "scanner" && (
          <div className="space-y-4">
            {/* Live Attendance Counter */}
            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-background/80 border border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald/15 flex items-center justify-center text-emerald">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Checked In</p>
                  <p className="text-sm font-bold text-foreground">
                    {stats.checkedInCount} <span className="text-xs text-muted-foreground font-normal">/ {stats.totalGuests} Guests</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 border-l border-border/40 pl-3">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-muted-foreground">Seats Arrived</p>
                  <p className="text-sm font-bold text-foreground">
                    {stats.checkedInSeats} <span className="text-xs text-muted-foreground font-normal">/ {stats.totalSeats} Seats</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Camera Viewfinder Area */}
            <div className="relative rounded-2xl overflow-hidden bg-black/80 border border-border/60 min-h-[220px] flex flex-col items-center justify-center">
              <div id="qr-camera-view" className="w-full h-full min-h-[220px]" />

              {!isCameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-background/95">
                  {cameraPermissionError ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-amber-300">Camera Permission Blocked</p>
                        <p className="text-[11px] text-zinc-300 max-w-xs leading-relaxed">
                          {cameraPermissionError}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          onClick={startCamera}
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                        >
                          Retry Permission
                        </Button>
                        <Button
                          onClick={() => {
                            const input = document.getElementById("manual-code-input");
                            input?.focus();
                          }}
                          size="sm"
                          className="h-8 px-3 bg-primary text-background font-bold text-xs shadow-md"
                        >
                          Use Code Below
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Scan Tickets at the Gate</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs">
                          Verify guest passes directly using your device camera.
                        </p>
                      </div>
                      <Button
                        onClick={startCamera}
                        size="sm"
                        className="h-9 px-4 bg-primary hover:bg-primary-light text-background font-bold text-xs gap-1.5 shadow-md"
                      >
                        <Camera className="w-3.5 h-3.5" /> Start Camera Scanner
                      </Button>
                    </>
                  )}
                </div>
              )}

              {isCameraActive && (
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={stopCamera}
                    className="h-7 px-2 text-[11px] bg-background/80 backdrop-blur-xs hover:bg-background"
                  >
                    Stop Camera
                  </Button>
                </div>
              )}
            </div>

            {/* Scan Result Feedback Banner */}
            {scanResult && (
              <div
                className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                  scanResult.type === "success"
                    ? "bg-emerald/10 border-emerald/40 text-emerald-100"
                    : scanResult.type === "warning"
                    ? "bg-amber-500/10 border-amber-500/40 text-amber-100"
                    : "bg-destructive/10 border-destructive/40 text-destructive"
                }`}
              >
                {scanResult.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald shrink-0 mt-0.5" />}
                {scanResult.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
                {scanResult.type === "error" && <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />}
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold leading-tight">{scanResult.title}</p>
                    {scanResult.guest?.seats && (
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                        {scanResult.guest.seats} Seat(s)
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] mt-1 text-foreground/80 leading-relaxed">{scanResult.details}</p>
                </div>
              </div>
            )}

            {/* Manual Lookup Fallback */}
            <div className="space-y-2 pt-1 border-t border-border/40">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block text-left">
                Manual Lookup by Guest Name or Code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="manual-code-input"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleVerify(manualCode)}
                    placeholder="e.g. Tariq Khan or ahmed-1234"
                    className="h-9 pl-9 text-xs bg-background/80"
                  />
                </div>
                <Button
                  onClick={() => handleVerify(manualCode)}
                  disabled={isVerifying || !manualCode.trim()}
                  size="sm"
                  className="h-9 px-3 bg-card border border-primary/40 text-primary hover:bg-primary hover:text-background text-xs font-semibold"
                >
                  {isVerifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Verify"}
                </Button>
              </div>
            </div>

            {/* Recent Check-Ins List */}
            {recentGuests.length > 0 && (
              <div className="space-y-2 pt-1 text-left">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  Recent Verified Arrivals:
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {recentGuests.map((g, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-background/50 border border-border/30 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald shrink-0" />
                        <span className="font-semibold text-foreground truncate max-w-[170px]">{g.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                        <span className="font-medium text-primary">{g.seats} seat(s)</span>
                        {g.checkedInAt && (
                          <span className="text-[10px]">
                            {new Date(g.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: GATEKEEPER DELEGATION MODE */}
        {/* ========================================================= */}
        {modalTab === "delegation" && (
          <div className="space-y-4 text-left">
            {/* Explanatory Info Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 text-xs space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Zero-Password Staff Delegation</span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                Event coordinators, ushers, and gate staff can open this link on their smartphones to scan guest tickets. They <strong>cannot</strong> access your account, invoices, or edit invitation settings.
              </p>
            </div>

            {/* Access Toggle Switch */}
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-neutral-900/80 border border-white/10 min-w-0">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Power className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-xs font-semibold text-white truncate">Gatekeeper Link Access</span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-snug">
                  {isDelegationActive ? "Entrance link is active and verifying guest passes" : "Access disabled — staff link is locked"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleAccess}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isDelegationActive
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "bg-white/5 text-neutral-400 border border-white/10 hover:bg-white/10"
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${isDelegationActive ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"}`} />
                <span>{isDelegationActive ? "Active" : "Disabled"}</span>
              </button>
            </div>

            {/* 4-Digit Gatekeeper PIN Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-3 min-w-0">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 truncate">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  Gatekeeper 4-Digit PIN
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingPin((e) => !e)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium hover:underline transition-colors cursor-pointer shrink-0"
                >
                  {isEditingPin ? "Cancel" : "Change PIN"}
                </button>
              </div>

              {!isEditingPin ? (
                <div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                  <div className="flex gap-1.5 sm:gap-2 shrink-0">
                    {gatekeeperPin.split("").map((digit, i) => (
                      <div
                        key={i}
                        className="w-10 h-11 sm:w-11 sm:h-12 rounded-xl bg-neutral-950 border border-amber-500/40 flex items-center justify-center font-mono text-lg sm:text-xl font-bold text-amber-300 shadow-inner shrink-0"
                      >
                        {digit}
                      </div>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRandomPin}
                    className="h-10 px-2.5 sm:px-3 text-xs border-white/15 hover:border-amber-500/40 hover:bg-white/5 text-neutral-200 rounded-xl cursor-pointer shrink-0"
                    title="Generate new random PIN"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-amber-400 shrink-0" />
                    Regenerate
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 min-w-0">
                  <Input
                    value={customPin}
                    onChange={(e) => setCustomPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 4 digits"
                    className="h-10 text-sm font-mono tracking-widest text-center bg-white/5 border-white/10 text-white rounded-xl min-w-0 flex-1"
                    maxLength={6}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={() => handleUpdatePin(customPin)}
                    disabled={customPin.length < 4}
                    className="h-10 px-4 bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold rounded-xl shrink-0"
                  >
                    Save
                  </Button>
                </div>
              )}
            </div>

            {/* Link Sharing Actions */}
            <div className="space-y-2.5 min-w-0">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 block">
                Share Scanner with Staff
              </label>

              {/* URL Preview */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-950 border border-white/10 text-xs text-neutral-300 min-w-0">
                <span className="truncate min-w-0 flex-1 font-mono text-[11px] sm:text-xs text-neutral-400 select-all">
                  {gatekeeperBaseUrl}
                </span>
                <a
                  href={gatekeeperUrlWithPin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded-lg text-neutral-400 hover:text-amber-300 transition-colors shrink-0"
                  title="Open Scanner in New Window"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(gatekeeperBaseUrl, "link")}
                  className="h-9 text-xs rounded-xl border-white/15 hover:bg-white/5 text-neutral-200 gap-1.5 cursor-pointer min-w-0 px-2"
                >
                  {copiedType === "link" ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">{copiedType === "link" ? "Copied!" : "Copy Link Only"}</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(gatekeeperUrlWithPin, "linkWithPin")}
                  className="h-9 text-xs rounded-xl border-amber-500/40 text-amber-300 hover:bg-amber-500/10 gap-1.5 cursor-pointer min-w-0 px-2"
                >
                  {copiedType === "linkWithPin" ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <KeyRound className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">{copiedType === "linkWithPin" ? "Copied!" : "Copy with PIN"}</span>
                </Button>
              </div>

              <Button
                onClick={handleShareWhatsApp}
                className="w-full h-11 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-neutral-950 font-bold text-xs gap-2 shadow-lg mt-1 cursor-pointer"
              >
                <WhatsAppIcon className="w-4 h-4 shrink-0" />
                <span className="truncate sm:whitespace-normal">Share with Event Staff / Ushers on WhatsApp</span>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
