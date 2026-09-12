"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Ticket, Download, Check, Sparkles, ShieldCheck, MapPin, Calendar, Share2, Printer, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

interface DigitalGuestPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestName?: string;
  guestSlug?: string;
  seats?: number;
  allowedEvents?: string[];
  invitationTitle: string;
  invitationUrl: string;
  eventDate?: string;
  venue?: string;
  category?: string;
}

export function DigitalGuestPassModal({
  isOpen,
  onClose,
  guestName = "Honored Guest",
  guestSlug,
  seats = 1,
  allowedEvents,
  invitationTitle,
  invitationUrl,
  eventDate,
  venue,
  category = "wedding",
}: DigitalGuestPassModalProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const passRef = useRef<HTMLDivElement>(null);
  void Badge;

  // Pass verification payload
  const passQrUrl = guestSlug
    ? (invitationUrl.includes("?") ? `${invitationUrl}&guest=${guestSlug}` : `${invitationUrl}?guest=${guestSlug}`)
    : invitationUrl;

  const isCorporate = category === "meeting" || category === "corporate";
  const isSchool = category === "school";
  const isBirthday = category === "birthday";

  const passBadgeText = isCorporate
    ? "Executive Delegate Pass"
    : isSchool
    ? "Commencement Admit Pass"
    : isBirthday
    ? "VIP Party Access Pass"
    : "Official Wedding Entry Pass";

  const safeFileName = `${(guestName || "Guest").trim().replace(/[^a-zA-Z0-9]/g, "_")}_Entry_Pass`;

  /**
   * Ultra-Luxury High-Definition 2D Canvas VIP Pass Generator
   * Dimensions: 1100 x 1650 px (Crisp 300-DPI 2:3 vertical VIP badge ratio)
   * 100% self-contained: zero external stylesheet dependency, zero oklab parsing, zero horizontal stretch
   */
  const renderLuxuryPassToCanvas = async (): Promise<HTMLCanvasElement | null> => {
    const width = 1100;
    const height = 1650;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Helper: draw rounded rectangle
    const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    // 1. Canvas Deep Outer Canvas Background
    ctx.fillStyle = "#080B10";
    ctx.fillRect(0, 0, width, height);

    // 2. Main Card Body (Rounded with multi-stop obsidian gradient)
    const cardX = 35;
    const cardY = 35;
    const cardW = width - 70;
    const cardH = height - 70;
    const cardR = 40;

    const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
    cardGrad.addColorStop(0, "#141C28");
    cardGrad.addColorStop(0.35, "#0E1520");
    cardGrad.addColorStop(1, "#070A0F");

    drawRoundRect(cardX, cardY, cardW, cardH, cardR);
    ctx.fillStyle = cardGrad;
    ctx.fill();

    // 3. Ambient Gold Radial Lighting Glow
    const radialGlow = ctx.createRadialGradient(width / 2, 380, 20, width / 2, 380, 500);
    radialGlow.addColorStop(0, "rgba(212, 175, 55, 0.15)");
    radialGlow.addColorStop(0.55, "rgba(212, 175, 55, 0.03)");
    radialGlow.addColorStop(1, "rgba(212, 175, 55, 0)");
    ctx.fillStyle = radialGlow;
    ctx.fill();

    // 4. Outer Gold Metallic Foil Border
    const goldBorderGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    goldBorderGrad.addColorStop(0, "#E5C572");
    goldBorderGrad.addColorStop(0.25, "#AA7C11");
    goldBorderGrad.addColorStop(0.5, "#FCE59F");
    goldBorderGrad.addColorStop(0.75, "#AA7C11");
    goldBorderGrad.addColorStop(1, "#E5C572");

    ctx.strokeStyle = goldBorderGrad;
    ctx.lineWidth = 4;
    ctx.stroke();

    // 5. Inset Delicate Gold Hairline Border
    const insetMargin = 22;
    drawRoundRect(
      cardX + insetMargin,
      cardY + insetMargin,
      cardW - insetMargin * 2,
      cardH - insetMargin * 2,
      cardR - 10
    );
    ctx.strokeStyle = "rgba(212, 175, 55, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 6. 4 Corner Ornaments (Diamond Stars ✦)
    ctx.font = "18px sans-serif";
    ctx.fillStyle = "#E5C572";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const cornerInset = 75;
    ctx.fillText("✦", cardX + cornerInset, cardY + cornerInset);
    ctx.fillText("✦", cardX + cardW - cornerInset, cardY + cornerInset);
    ctx.fillText("✦", cardX + cornerInset, cardY + cardH - cornerInset);
    ctx.fillText("✦", cardX + cardW - cornerInset, cardY + cardH - cornerInset);

    // 7. Top Gold Accent Bar
    const topAccentW = 420;
    const topAccentGrad = ctx.createLinearGradient((width - topAccentW) / 2, 37, (width + topAccentW) / 2, 37);
    topAccentGrad.addColorStop(0, "rgba(212, 175, 55, 0)");
    topAccentGrad.addColorStop(0.5, "#FCE59F");
    topAccentGrad.addColorStop(1, "rgba(212, 175, 55, 0)");
    ctx.fillStyle = topAccentGrad;
    ctx.fillRect((width - topAccentW) / 2, 37, topAccentW, 6);

    // 8. Royal Crest & Brand Header
    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.fillStyle = "#E5C572";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦   ❖   ✦", width / 2, 85);

    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.fillStyle = "#D4AF37";
    ctx.fillText("SMART INVITES  •  OFFICIAL ENTRY PASS", width / 2, 120);

    ctx.font = "500 15px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillText("VERIFIED GUEST ACCESS  •  NON-TRANSFERABLE", width / 2, 150);

    // 9. Admit Badge (Metallic Gold Foil Pill)
    const badgeW = 380;
    const badgeH = 52;
    const badgeX = (width - badgeW) / 2;
    const badgeY = 185;
    const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
    badgeGrad.addColorStop(0, "#FCE59F");
    badgeGrad.addColorStop(0.5, "#D4AF37");
    badgeGrad.addColorStop(1, "#9B7423");

    drawRoundRect(badgeX, badgeY, badgeW, badgeH, 26);
    ctx.fillStyle = badgeGrad;
    ctx.fill();
    ctx.strokeStyle = "#FFF3C4";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.fillStyle = "#080B10";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`✦  ADMIT ${seats} ${seats > 1 ? "GUESTS" : "GUEST"}  ✦`, width / 2, badgeY + badgeH / 2);

    // 10. Divider 1 with Center Diamond
    ctx.strokeStyle = "rgba(212, 175, 55, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(140, 265);
    ctx.lineTo(width - 140, 265);
    ctx.stroke();

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#D4AF37";
    ctx.fillText("◆", width / 2, 265);

    // 11. Guest Hero Section
    ctx.font = "600 18px system-ui, sans-serif";
    ctx.fillStyle = "rgba(212, 175, 55, 0.9)";
    ctx.fillText("—  GUEST OF HONOR  —", width / 2, 295);

    // Dynamic typography scaling so long names never wrap or clip
    const displayName = guestName || "Honored Guest";
    const guestFontSize = Math.min(62, Math.max(34, Math.floor(750 / (displayName.length * 0.7))));
    ctx.font = `bold ${guestFontSize}px Georgia, "Times New Roman", serif`;
    ctx.fillStyle = "#FFFFFF";
    ctx.shadowColor = "rgba(212, 175, 55, 0.45)";
    ctx.shadowBlur = 14;
    ctx.fillText(displayName, width / 2, 350);
    ctx.shadowBlur = 0; // reset shadow

    ctx.font = "600 30px system-ui, sans-serif";
    ctx.fillStyle = "#E5C572";
    ctx.fillText(invitationTitle, width / 2, 410);

    const categoryText = isCorporate
      ? "EXECUTIVE DELEGATE ACCESS"
      : isSchool
      ? "COMMENCEMENT CEREMONY"
      : isBirthday
      ? "VIP BIRTHDAY CELEBRATION"
      : "WEDDING CEREMONY & RECEPTION";

    ctx.font = "600 16px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    ctx.fillText(categoryText, width / 2, 448);

    // 12. Scannable Ticket Plate with Real Perforated Ticket Notches
    const ticketW = 660;
    const ticketH = 620;
    const ticketX = (width - ticketW) / 2;
    const ticketY = 485;
    const ticketR = 32;

    // Draw main white ticket plate
    drawRoundRect(ticketX, ticketY, ticketW, ticketH, ticketR);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Perforated Ticket Notches (left & right circular cutouts)
    const notchY = ticketY + ticketH / 2;
    const notchR = 24;

    // Left notch
    ctx.beginPath();
    ctx.arc(ticketX, notchY, notchR, -Math.PI / 2, Math.PI / 2);
    ctx.closePath();
    ctx.fillStyle = "#0E1520";
    ctx.fill();
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Right notch
    ctx.beginPath();
    ctx.arc(ticketX + ticketW, notchY, notchR, Math.PI / 2, -Math.PI / 2);
    ctx.closePath();
    ctx.fillStyle = "#0E1520";
    ctx.fill();
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dashed fold line connecting notches
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ticketX + notchR + 4, notchY);
    ctx.lineTo(ticketX + ticketW - notchR - 4, notchY);
    ctx.stroke();
    ctx.setLineDash([]); // reset line dash

    // 13. Draw Crisp QR Code inside Ticket Plate
    const qrSize = 340;
    const qrX = (width - qrSize) / 2;
    const qrY = ticketY + 35;

    let qrDrawn = false;
    // Method A: Direct from off-screen high-res QRCodeCanvas
    const qrCanvasEl = document.getElementById("smartinvites-qr-canvas") as HTMLCanvasElement | null;
    if (qrCanvasEl && qrCanvasEl.width > 0) {
      try {
        ctx.drawImage(qrCanvasEl, qrX, qrY, qrSize, qrSize);
        qrDrawn = true;
      } catch {
        qrDrawn = false;
      }
    }

    // Method B: Vector SVG serialization fallback
    if (!qrDrawn) {
      const qrSvg = (document.getElementById("smartinvites-qr-svg") as SVGSVGElement | null) || passRef.current?.querySelector("svg");
      if (qrSvg) {
        try {
          const clonedSvg = qrSvg.cloneNode(true) as SVGSVGElement;
          clonedSvg.setAttribute("width", "680");
          clonedSvg.setAttribute("height", "680");
          const svgData = new XMLSerializer().serializeToString(clonedSvg);
          const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
          const URL = window.URL || window.webkitURL || window;
          const blobUrl = URL.createObjectURL(svgBlob);
          const img = new Image();
          await new Promise<void>((resolve) => {
            img.onload = () => {
              ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
              URL.revokeObjectURL(blobUrl);
              resolve();
            };
            img.onerror = () => {
              URL.revokeObjectURL(blobUrl);
              resolve();
            };
            img.src = blobUrl;
          });
          qrDrawn = true;
        } catch {
          // fallback
        }
      }
    }

    // 14. Ticket Plate Labels under QR Code
    ctx.font = "bold 17px system-ui, sans-serif";
    ctx.fillStyle = "#1F2937";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🛡️  OFFICIAL GATE VERIFICATION CODE", width / 2, ticketY + ticketH - 75);

    const guestCode = guestSlug ? guestSlug.toUpperCase() : "SI-7118";
    ctx.font = "600 15px system-ui, sans-serif";
    ctx.fillStyle = "#6B7280";
    ctx.fillText(`PASS CODE: #${guestCode}  •  SCAN AT ENTRANCE`, width / 2, ticketY + ticketH - 42);

    // 15. Event Coordinates Box (Date & Venue)
    const infoW = 760;
    const infoH = 165;
    const infoX = (width - infoW) / 2;
    const infoY = 1140;

    drawRoundRect(infoX, infoY, infoW, infoH, 24);
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    ctx.fill();
    ctx.strokeStyle = "rgba(212, 175, 55, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Vertical Divider in info box
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width / 2, infoY + 20);
    ctx.lineTo(width / 2, infoY + infoH - 20);
    ctx.stroke();

    // Left: Date
    ctx.font = "600 15px system-ui, sans-serif";
    ctx.fillStyle = "#D4AF37";
    ctx.textAlign = "center";
    ctx.fillText("📅  EVENT DATE", infoX + infoW / 4, infoY + 45);

    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(eventDate || "Date on Invitation", infoX + infoW / 4, infoY + 85);

    // Right: Venue
    ctx.font = "600 15px system-ui, sans-serif";
    ctx.fillStyle = "#D4AF37";
    ctx.fillText("📍  VENUE LOCATION", infoX + (infoW * 3) / 4, infoY + 45);

    const displayVenue = venue || "Venue on Invitation";
    ctx.font = "bold 19px system-ui, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    if (displayVenue.length > 22) {
      ctx.fillText(displayVenue.substring(0, 20) + "...", infoX + (infoW * 3) / 4, infoY + 85);
    } else {
      ctx.fillText(displayVenue, infoX + (infoW * 3) / 4, infoY + 85);
    }

    // Bottom note in info box (Allowed events or pass status)
    const allowedText = allowedEvents && allowedEvents.length > 0
      ? `✨ ADMITTED EVENTS: ${allowedEvents.join("  •  ")}`
      : "✨ OFFICIAL INVITATION VERIFIED BY SMART INVITES";
    ctx.font = "500 14px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.fillText(allowedText, width / 2, infoY + 132);

    // 16. Divider 2 with Center Diamond
    ctx.strokeStyle = "rgba(212, 175, 55, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(140, 1345);
    ctx.lineTo(width - 140, 1345);
    ctx.stroke();

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#D4AF37";
    ctx.fillText("◆", width / 2, 1345);

    // 17. Security Notice & Protocol Footer
    ctx.font = "600 15px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    ctx.fillText("PLEASE PRESENT THIS PASS AT THE ENTRANCE GATE  •  SCREENSHOT OR PRINT ACCEPTED", width / 2, 1385);

    ctx.font = "500 14px system-ui, sans-serif";
    ctx.fillStyle = "#D4AF37";
    ctx.fillText("Smart Invites™ Gatekeeper Protocol  •  smartinvites.com.pk", width / 2, 1420);

    return canvas;
  };

  // 1. Direct 1-Page PDF Download (guaranteed strictly 1 page, centered luxury layout)
  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      const canvas = await renderLuxuryPassToCanvas();
      if (!canvas) throw new Error("Could not generate digital pass");

      const imgData = canvas.toDataURL("image/png");

      // Standard A5 portrait PDF (148 x 210 mm)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Luxury dark slate background (#080B10) for seamless aesthetic
      pdf.setFillColor(8, 11, 16);
      pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

      const margin = 8;
      const maxW = pdfWidth - margin * 2;
      const maxH = pdfHeight - margin * 2;

      let imgW = maxW;
      let imgH = (canvas.height * imgW) / canvas.width;

      if (imgH > maxH) {
        imgH = maxH;
        imgW = (canvas.width * imgH) / canvas.height;
      }

      const x = (pdfWidth - imgW) / 2;
      const y = (pdfHeight - imgH) / 2;

      pdf.addImage(imgData, "PNG", x, y, imgW, imgH, undefined, "FAST");
      pdf.save(`${safeFileName}.pdf`);
      toast.success("1-Page Digital Pass PDF saved successfully!");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF pass");
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Direct PNG Image Download (exact 1100x1650 VIP card, zero desktop stretching)
  const handleDownloadImage = async () => {
    setIsExporting(true);
    try {
      const canvas = await renderLuxuryPassToCanvas();
      if (!canvas) throw new Error("Could not generate digital pass");

      const link = document.createElement("a");
      link.download = `${safeFileName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Digital Pass saved as image!");
    } catch (err) {
      console.error("Image generation error:", err);
      toast.error("Failed to save image");
    } finally {
      setIsExporting(false);
    }
  };

  // 3. Isolated Single-Page Paper / Browser Print
  const handlePrint = async () => {
    setIsExporting(true);
    try {
      const canvas = await renderLuxuryPassToCanvas();
      if (!canvas) throw new Error("Could not generate digital pass");

      const imgData = canvas.toDataURL("image/png");
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${guestName} - Digital Entry Pass</title>
              <style>
                @page { size: portrait; margin: 10mm; }
                html, body {
                  margin: 0;
                  padding: 0;
                  background: #ffffff;
                  height: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  overflow: hidden;
                }
                img {
                  max-width: 100%;
                  max-height: 94vh;
                  object-fit: contain;
                  border-radius: 12px;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                }
              </style>
            </head>
            <body>
              <img src="${imgData}" onload="window.focus(); window.print();" />
            </body>
          </html>
        `);
        doc.close();

        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 3000);
      }
    } catch (err) {
      console.error("Print error:", err);
      toast.error("Failed to prepare pass for printing");
    } finally {
      setIsExporting(false);
    }
  };

  // 4. Share Pass Link / WhatsApp
  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${invitationTitle} - Digital Pass`,
          text: `Digital Entry Pass for ${guestName}`,
          url: passQrUrl,
        });
      } catch {
        // Share cancelled
      }
    } else {
      navigator.clipboard.writeText(passQrUrl);
      setIsCopied(true);
      toast.success("Pass link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border border-gold/40 shadow-2xl p-5 sm:p-6 text-foreground max-h-[92vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-1 pass-no-print">
          <div className="mx-auto w-10 h-10 rounded-2xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold mb-1">
            <Ticket className="w-5 h-5" />
          </div>
          <DialogTitle className="font-display text-xl font-bold text-foreground">
            {passBadgeText}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Please present this verified pass upon arrival at the entrance gate.
          </DialogDescription>
        </DialogHeader>

        {/* Off-screen high-res QR canvas for lightning-fast 100% sharp exports */}
        <div style={{ position: "fixed", left: "-9999px", top: "-9999px", opacity: 0, pointerEvents: "none" }}>
          <QRCodeCanvas
            id="smartinvites-qr-canvas"
            value={passQrUrl}
            size={680}
            level="M"
            includeMargin={false}
          />
        </div>

        {/* The Golden Ticket Card (On-Screen Preview) */}
        <div
          ref={passRef}
          id="smartinvites-printable-pass"
          className="relative rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden text-center space-y-4 max-w-[360px] mx-auto w-full"
          style={{
            background: "linear-gradient(165deg, #141c28 0%, #0d121c 50%, #070a0f 100%)",
            color: "#ffffff",
            border: "2px solid #C9A84C",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.7), 0 0 24px rgba(201, 168, 76, 0.2)",
          }}
        >
          {/* Subtle Inset Hairline Border */}
          <div
            className="absolute inset-2 rounded-2xl pointer-events-none"
            style={{
              border: "1px solid rgba(201, 168, 76, 0.35)",
            }}
          />

          {/* Top Gold Accent Bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: "linear-gradient(to right, transparent, #FCE59F, #C9A84C, transparent)",
            }}
          />

          {/* Watermark Crest & Admit Badge */}
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "rgba(255, 255, 255, 0.15)" }}>
            <div className="flex items-center gap-1.5 text-left">
              <Sparkles className="w-3.5 h-3.5" style={{ color: "#C9A84C" }} />
              <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: "#C9A84C" }}>
                Smart Invites Verified
              </span>
            </div>
            <span
              style={{
                background: "linear-gradient(135deg, #FCE59F, #C9A84C, #9B7423)",
                color: "#080B10",
                fontSize: "10px",
                textTransform: "uppercase",
                fontWeight: 800,
                padding: "3px 10px",
                borderRadius: "9999px",
                boxShadow: "0 2px 8px rgba(201, 168, 76, 0.35)",
              }}
            >
              ✦ Admit {seats} {seats > 1 ? "Guests" : "Guest"}
            </span>
          </div>

          {/* Event & Guest Details */}
          <div className="space-y-1 pt-1">
            <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "rgba(201, 168, 76, 0.9)" }}>
              — Guest of Honor —
            </p>
            <h3
              className="font-serif text-2xl sm:text-3xl font-bold tracking-wide"
              style={{
                color: "#ffffff",
                textShadow: "0 2px 10px rgba(201, 168, 76, 0.35)",
              }}
            >
              {guestName}
            </h3>
            <p className="text-xs font-semibold pt-0.5" style={{ color: "#E5C572" }}>
              {invitationTitle}
            </p>
          </div>

          {/* Scannable Ticket Plate with QR Code */}
          <div className="flex flex-col items-center justify-center py-1">
            <div
              className="relative p-3.5 bg-white rounded-2xl shadow-2xl"
              style={{
                border: "2px solid #C9A84C",
                boxShadow: "0 12px 30px rgba(0, 0, 0, 0.6)",
              }}
            >
              <QRCodeSVG
                id="smartinvites-qr-svg"
                value={passQrUrl}
                size={160}
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="flex items-center gap-1.5 mt-2.5 text-[11px] font-medium" style={{ color: "rgba(255, 255, 255, 0.75)" }}>
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: "#34d399" }} />
              <span>Official Gate Verification Code</span>
            </div>
          </div>

          {/* Venue & Date Footer */}
          <div
            className="grid grid-cols-2 gap-2 pt-2.5 text-[11px] text-left"
            style={{
              borderTop: "1px solid rgba(255, 255, 255, 0.15)",
              color: "rgba(255, 255, 255, 0.8)",
            }}
          >
            {eventDate && (
              <div className="flex items-start gap-1.5 truncate">
                <Calendar className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#C9A84C" }} />
                <span className="truncate">{eventDate}</span>
              </div>
            )}
            {venue && (
              <div className="flex items-start gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#C9A84C" }} />
                <span className="truncate">{venue}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 pass-no-print">
          {/* Row 1: Primary Save Options */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="h-11 bg-gold hover:bg-gold/90 text-background font-bold text-xs gap-2 shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{isExporting ? "Generating..." : "Save PDF (1 Page)"}</span>
            </Button>
            <Button
              onClick={handleDownloadImage}
              disabled={isExporting}
              variant="outline"
              className="h-11 border-gold/40 text-gold hover:bg-gold/10 font-bold text-xs gap-2 shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Save Image</span>
            </Button>
          </div>

          {/* Row 2: Print & Share Options */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handlePrint}
              disabled={isExporting}
              variant="secondary"
              className="h-9 text-foreground/80 hover:text-foreground text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-gold" />
              <span>Print Card</span>
            </Button>
            <Button
              onClick={handleShare}
              variant="secondary"
              className="h-9 text-foreground/80 hover:text-foreground text-xs font-semibold gap-1.5 cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald" /> : <Share2 className="w-3.5 h-3.5 text-gold" />}
              <span>{isCopied ? "Link Copied" : "Share Pass"}</span>
            </Button>
          </div>

          <p className="text-[10px] text-center text-muted-foreground pt-0.5">
            Tip: You can also take a quick screenshot to show at the entrance gate.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
