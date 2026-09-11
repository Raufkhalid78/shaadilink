"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { Ticket, Download, Check, Sparkles, ShieldCheck, MapPin, Calendar, Users, Share2 } from "lucide-react";
import { toast } from "sonner";

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
  const passRef = useRef<HTMLDivElement>(null);

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
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border border-gold/40 shadow-2xl p-6 text-foreground">
        <DialogHeader className="text-center space-y-1">
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

        {/* The Golden Ticket Card */}
        <div
          ref={passRef}
          className="relative rounded-3xl p-6 border border-gold/40 shadow-xl overflow-hidden text-center space-y-5"
          style={{
            background: "linear-gradient(145deg, #141b24 0%, #0c1017 100%)",
          }}
        >
          {/* Subtle Top Gold Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

          {/* Watermark Crest */}
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-1.5 text-left">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold">
                Smart Invites Verified
              </span>
            </div>
            <Badge className="bg-gold/20 text-gold border-gold/30 text-[10px] uppercase font-bold">
              Admit {seats}
            </Badge>
          </div>

          {/* Event & Guest Details */}
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              Admit Bearer
            </p>
            <h3 className="font-display text-2xl font-bold text-foreground">
              {guestName}
            </h3>
            <p className="text-xs text-gold/90 font-medium pt-0.5">
              {invitationTitle}
            </p>
          </div>

          {/* QR Code Frame */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="p-3 bg-white rounded-2xl shadow-lg border border-gold/30">
              <QRCodeSVG
                value={passQrUrl}
                size={160}
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald" />
              <span>Official Gate Verification Code</span>
            </div>
          </div>

          {/* Venue & Date Footer */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground text-left">
            {eventDate && (
              <div className="flex items-start gap-1.5 truncate">
                <Calendar className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                <span className="truncate">{eventDate}</span>
              </div>
            )}
            {venue && (
              <div className="flex items-start gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                <span className="truncate">{venue}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleShare}
            variant="outline"
            className="flex-1 h-10 border-gold/40 text-gold hover:bg-gold/10 text-xs font-bold gap-2"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald" /> : <Share2 className="w-3.5 h-3.5" />}
            {isCopied ? "Link Copied" : "Share Pass"}
          </Button>
          <Button
            onClick={() => {
              window.print();
            }}
            className="flex-1 h-10 bg-gold hover:bg-gold/90 text-background font-bold text-xs gap-2 shadow-md"
          >
            <Download className="w-3.5 h-3.5" /> Print / Save Pass
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
