"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Calendar, Heart, MapPin, Music, MessageSquare,
  Check, Plus, Trash2, User, Shirt, Car, Hotel, Gift, ImagePlus, X, Globe, Loader2, Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { FlowData } from "@/lib/flow-types";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

interface DetailsPageProps {
  flowData: FlowData;
  onUpdateData: (updates: Partial<FlowData>) => void;
  onBack: () => void;
  onContinue: () => void;
  crumbs: { label: string; onClick?: () => void }[];
}

export function DetailsPage({ flowData, onUpdateData, onBack, onContinue, crumbs }: DetailsPageProps) {
  const isEdit = !!flowData.invitationId;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const slideshowInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!flowData.slug);

  // Auto-generate slug from partner names if it's not manually edited
  useEffect(() => {
    if (!isEdit && !slugManuallyEdited && (flowData.partner1Name || flowData.partner2Name)) {
      const p1 = flowData.partner1Name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const p2 = flowData.partner2Name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const autoSlug = [p1, p2].filter(Boolean).join('-');
      onUpdateData({ slug: autoSlug });
    }
  }, [flowData.partner1Name, flowData.partner2Name, isEdit, slugManuallyEdited, onUpdateData]);

  // Play audio preview on selection
  const handleMusicSelection = (trackId: string) => {
    onUpdateData({ backgroundMusic: trackId });

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (trackId === "no-music") return;

    try {
      const audio = new Audio(`/music/${trackId}.mp3`);
      audio.volume = 0.4;
      audio.play().catch((err) => {
        console.warn("Audio autoplay blocked or failed:", err);
      });
      audioRef.current = audio;
    } catch (err) {
      console.error("Audio preview failed:", err);
    }
  };

  // Stop audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Parse address and map URL from venueAddress
  const [addressPart, mapsUrlPart] = (flowData.venueAddress || "").split("|||");
  const [addressText, setAddressText] = useState(addressPart || "");
  const [mapsUrl, setMapsUrl] = useState(mapsUrlPart || "");

  const updateAddressAndMap = (newAddress: string, newMapsUrl: string) => {
    const combined = newMapsUrl.trim() ? `${newAddress.trim()}|||${newMapsUrl.trim()}` : newAddress.trim();
    onUpdateData({ venueAddress: combined });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!flowData.partner1Name.trim()) newErrors.partner1Name = "Name is required";
    if (!flowData.partner2Name.trim()) newErrors.partner2Name = "Name is required";
    if (!flowData.venue.trim()) newErrors.venue = "Venue is required";

    const eventWithNameButNoDate = flowData.events.find(e => e.name.trim() && !e.date.trim());
    if (eventWithNameButNoDate) {
      newErrors.events = `Please add a date for "${eventWithNameButNoDate.name}"`;
    }

    if (flowData.venueAddress && flowData.venueAddress.includes('|||')) {
      const mapsUrl = flowData.venueAddress.split('|||')[1]?.trim();
      if (mapsUrl && !mapsUrl.startsWith('https://maps.') && !mapsUrl.startsWith('https://goo.gl/') && !mapsUrl.startsWith('https://maps.app.goo.gl/')) {
        newErrors.mapsUrl = 'Please enter a valid Google Maps URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSaving(true);

    try {
      // Save invitation to Supabase (PUT for editing existing, POST for new)
      const url = isEdit ? `/api/invitations/${flowData.invitationId}` : "/api/invitations";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: flowData.selectedTemplateId,
          plan: flowData.selectedPlan,
          partner1Name: flowData.partner1Name,
          partner2Name: flowData.partner2Name,
          venue: flowData.venue,
          venueAddress: flowData.venueAddress,
          welcomeMessage: flowData.welcomeMessage,
          backgroundMusic: flowData.backgroundMusic,
          dressCodeWomen: flowData.dressCodeWomen,
          dressCodeMen: flowData.dressCodeMen,
          transportation: flowData.transportation,
          accommodation: flowData.accommodation,
          gifts: flowData.gifts,
          heroImageUrl: flowData.heroImage,
          slideshowImageUrls: flowData.slideshowImages,
          events: flowData.events,
          isActive: flowData.paymentDone,
          showBismillah: flowData.showBismillah,
          showQuranVerse: flowData.showQuranVerse,
          youtubeVideoId: flowData.youtubeVideoId,
          slug: flowData.slug || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        // If user is not authenticated (e.g. demo mode), continue anyway
        if (res.status === 401) {
          onContinue();
          return;
        }
        toast.error(data.error || "Failed to save invitation details.");
        return;
      }

      const data = await res.json();
      if (!isEdit && data.invitationId) {
        onUpdateData({ invitationId: data.invitationId });
      }
      onContinue();
    } catch (err) {
      console.error("Details save error:", err);
      setIsSaving(false);
      toast.error("Network error — please check your connection and try again.");
      return;
    }
  };

  const updateEvent = (index: number, field: string, value: string) => {
    const updated = [...flowData.events];
    updated[index] = { ...updated[index], [field]: value };
    onUpdateData({ events: updated });
  };

  const addEvent = () => {
    onUpdateData({ events: [...flowData.events, { name: "", date: "", time: "" }] });
  };

  const removeEvent = (index: number) => {
    onUpdateData({ events: flowData.events.filter((_, i) => i !== index) });
  };

  /** Build/update the gifts string from structured fields */
  const updateGiftsField = (field: 'bankName' | 'accountTitle' | 'accountNumber' | 'iban' | 'raastId' | 'easyPaisa' | 'jazzCash', value: string) => {
    const raw = flowData.gifts || '';
    // Extract current blessing (first sentence/clause)
    const blessingMatch = raw.match(/^(.*?)(?:\.\s*For\s+Shagun|,\s*For\s+Shagun|$)/i);
    const blessing = blessingMatch?.[1]?.trim() || '';

    // Extract current structured values
    const get = (pattern: RegExp) => { const m = raw.match(pattern); return m?.[1]?.trim() || ''; };
    const fields = {
      bankName:      field === 'bankName'      ? value : get(/(?:Bank\s*(?:Name)?|Bank)\s*[:\-\s]+\s*([a-zA-Z\s.]+?)(?:,|\n|Account|Title|IBAN|$)/i),
      accountTitle:  field === 'accountTitle'  ? value : get(/(?:Account\s*Title|Acc\s*Title|Title)\s*[:\-\s]+\s*([a-zA-Z\s.()]+?)(?:,|Account|IBAN|Raast|$)/i),
      accountNumber: field === 'accountNumber' ? value : get(/(?:Account\s*(?:Number|No\.?)|Acc\s*(?:Number|No\.?))\s*[:\-\s]+\s*([0-9\-]+)/i),
      iban:          field === 'iban'          ? value : (() => { const m = raw.match(/IBAN\s*[:\-\s]+\s*([A-Z]{2}[0-9]{2}[A-Z0-9\s]{16,30})/i); return m?.[1]?.replace(/\s+/g,'').trim() || ''; })(),
      raastId:       field === 'raastId'       ? value : get(/(?:Raast\s*(?:ID)?|Raast)\s*[:\-\s]+\s*([0-9+]+)/i),
      easyPaisa:     field === 'easyPaisa'     ? value : get(/(?:EasyPaisa|Easy\s*Paisa)\s*[:\-\s]+\s*([0-9+]+)/i),
      jazzCash:      field === 'jazzCash'      ? value : get(/(?:JazzCash|Jazz\s*Cash)\s*[:\-\s]+\s*([0-9+]+)/i),
    };

    // Build banking details string in parseGiftDetails-compatible format
    const parts: string[] = [];
    if (fields.bankName)      parts.push(`Bank: ${fields.bankName}`);
    if (fields.accountTitle)  parts.push(`Title: ${fields.accountTitle}`);
    if (fields.accountNumber) parts.push(`Account Number: ${fields.accountNumber}`);
    if (fields.iban)          parts.push(`IBAN: ${fields.iban}`);
    if (fields.raastId)       parts.push(`Raast ID: ${fields.raastId}`);
    if (fields.easyPaisa)     parts.push(`EasyPaisa: ${fields.easyPaisa}`);
    if (fields.jazzCash)      parts.push(`JazzCash: ${fields.jazzCash}`);

    const bankDetails = parts.length > 0 ? `. For Shagun, you may transfer to ${parts.join(', ')}` : '';
    onUpdateData({ gifts: blessing + bankDetails });
  };

  /** Upload files to Supabase Storage via /api/upload */
  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Upload failed");
    }
    const data = await res.json();
    return data.urls as string[];
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "hero" | "slideshow"
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    e.target.value = "";

    setIsUploading(true);
    try {
      if (type === "hero" && files[0]) {
        // Show local preview immediately for UX
        const localUrl = URL.createObjectURL(files[0]);
        onUpdateData({ heroImage: localUrl });

        // Upload to Supabase Storage
        const urls = await uploadFiles([files[0]]);
        URL.revokeObjectURL(localUrl); // Fix memory leak — revoke after upload
        onUpdateData({ heroImage: urls[0] });
        toast.success("Hero image uploaded!");
      } else if (type === "slideshow") {
        const available = 4 - flowData.slideshowImages.length;
        const toUpload = Array.from(files).slice(0, available);

        // Show local previews immediately
        const localUrls = toUpload.map((f) => URL.createObjectURL(f));
        onUpdateData({ slideshowImages: [...flowData.slideshowImages, ...localUrls] });

        // Upload to Supabase Storage
        const remoteUrls = await uploadFiles(toUpload);

        // Replace local preview URLs with remote ones and revoke local
        localUrls.forEach((u) => URL.revokeObjectURL(u));
        const updatedSlideshow = [
          ...flowData.slideshowImages.slice(0, flowData.slideshowImages.length),
          ...remoteUrls,
        ];
        // Rebuild: keep existing remote + new remote
        const existing = flowData.slideshowImages.filter((u) => !localUrls.includes(u));
        onUpdateData({ slideshowImages: [...existing, ...remoteUrls] });
        toast.success(`${remoteUrls.length} photo(s) uploaded!`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
      // Fallback: keep local preview if upload fails (user can still proceed)
    } finally {
      setIsUploading(false);
    }
  };

  const removeSlideshowImage = (index: number) => {
    const updated = flowData.slideshowImages.filter((_, i) => i !== index);
    onUpdateData({ slideshowImages: updated });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with progress */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={onBack}
              className="gap-2 text-foreground/70 hover:text-foreground"
              disabled={isSaving}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <div className="flex items-center gap-1.5">
              <StepDot done label="Template" />
              <StepLine active />
              <StepDot done label="Account" />
              <StepLine active />
              <StepDot current label="Details" />
              <StepLine />
              <StepDot label="Payment" />
            </div>

            <div className="w-16" />
          </div>
        </div>
      </header>

      {/* Breadcrumb path — adapts for new vs edit mode */}
      <PageBreadcrumb crumbs={crumbs} />

      <main className="flex-1 px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl"
        >
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Fill Your Details
            </h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Enter your wedding details — we&apos;ll transform them into a stunning invitation.
            </p>
          </div>

          <div className="space-y-8">
            {/* Couple Names */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-4 h-4 text-gold" />
                <h2 className="font-display text-lg font-semibold text-foreground">Couple Names</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Partner 1 Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={flowData.partner1Name}
                      onChange={(e) => onUpdateData({ partner1Name: e.target.value })}
                      placeholder="e.g. Ahmed"
                      className={`pl-10 h-11 ${errors.partner1Name ? "border-red-400" : ""}`}
                    />
                  </div>
                  {errors.partner1Name && <p className="text-xs text-red-500">{errors.partner1Name}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Partner 2 Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={flowData.partner2Name}
                      onChange={(e) => onUpdateData({ partner2Name: e.target.value })}
                      placeholder="e.g. Fatima"
                      className={`pl-10 h-11 ${errors.partner2Name ? "border-red-400" : ""}`}
                    />
                  </div>
                  {errors.partner2Name && <p className="text-xs text-red-500">{errors.partner2Name}</p>}
                </div>
              </div>
            </section>

            {/* Custom Invitation Link (Slug) */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-gold" />
                <h2 className="font-display text-lg font-semibold text-foreground">Custom Invitation Link</h2>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Personalized Web Link Slug
                </label>
                <div className="relative flex items-center">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-muted-foreground text-xs h-11">
                    shaadilink.com/inv/
                  </span>
                  <Input
                    value={flowData.slug || ""}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      const cleanVal = e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9\-_]/g, "");
                      onUpdateData({ slug: cleanVal });
                    }}
                    placeholder="e.g. ahmed-fatima-2026"
                    className={`rounded-l-none h-11 ${errors.slug ? "border-red-400" : ""}`}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Create a memorable link to share (e.g. <b>ahmed-fatima-dec2026</b>). Only lowercase letters, numbers, hyphens, and underscores are allowed.
                </p>
                {errors.slug && <p className="text-xs text-red-500">{errors.slug}</p>}
              </div>
            </section>

            {/* Bismillah Banner Toggle */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">☪️</span>
                <h2 className="font-display text-lg font-semibold text-foreground">Bismillah Banner</h2>
              </div>
              <div
                className="flex items-center justify-between rounded-xl border border-border p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => onUpdateData({ showBismillah: !flowData.showBismillah })}
              >
                <div className="flex-1 pr-4">
                  <p className="text-sm font-medium text-foreground">Show Bismillah at the top</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Displays <span className="font-arabic text-gold" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</span> as a beautiful header on your invitation.
                  </p>
                </div>
                {/* Toggle switch */}
                <div
                  className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-300 ${flowData.showBismillah ? "bg-gold" : "bg-muted"}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${flowData.showBismillah ? "translate-x-7" : "translate-x-1"}`}
                  />
                </div>
              </div>
              {flowData.showBismillah && (
                <div className="text-center py-3 rounded-lg border border-gold/20 bg-gold/5">
                  <p className="font-arabic text-2xl leading-loose tracking-wide" style={{ color: 'hsl(40 60% 55%)' }} dir="rtl">
                    بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">In the name of Allah, the Most Gracious, the Most Merciful</p>
                </div>
              )}
            </section>

            {/* Quranic Verse Toggle */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">📖</span>
                <h2 className="font-display text-lg font-semibold text-foreground">Quranic Verse</h2>
              </div>
              <div
                className="flex items-center justify-between rounded-xl border border-border p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => onUpdateData({ showQuranVerse: !flowData.showQuranVerse })}
              >
                <div className="flex-1 pr-4">
                  <p className="text-sm font-medium text-foreground">Show Quranic Verse (30:21)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Displays the beautiful verse about marriage in Arabic, English, and Urdu after the Scratch Card.
                  </p>
                </div>
                {/* Toggle switch */}
                <div
                  className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-300 ${flowData.showQuranVerse ? "bg-gold" : "bg-muted"}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${flowData.showQuranVerse ? "translate-x-7" : "translate-x-1"}`}
                  />
                </div>
              </div>
              {flowData.showQuranVerse && (
                <div className="text-center py-4 px-3 rounded-lg border border-gold/20 bg-gold/5 space-y-3">
                  <p className="font-arabic text-xl md:text-2xl leading-loose" style={{ color: 'hsl(40 60% 55%)' }} dir="rtl">
                    وَمِنْ ءَايَـٰتِهِۦٓ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَٰجًا لِّتَسْكُنُوٓا۟ إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِى ذَٰلِكَ لَـَٔايَـٰتٍ لِّقَوْمٍ يَتَفَكَّرُونَ
                  </p>
                  <p className="text-xs text-muted-foreground italic max-w-md mx-auto">
                    &ldquo;And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy. Indeed in that are signs for a people who give thought.&rdquo; (30:21)
                  </p>
                  <p className="font-arabic text-sm leading-relaxed" style={{ color: 'hsl(40 60% 55%)' }} dir="rtl">
                    &ldquo;اور اس کی نشانیوں میں سے ہے کہ اس نے تمہارے لیے تمہاری ہی جنس سے جوڑے پیدا کیے تاکہ تم ان سے آرام پاؤ اور اس نے تمہارے درمیان محبت اور رحمت پیدا کر دی، یقیناً اس میں غور و فکر کرنے والوں کے لیے نشانیاں ہیں۔&rdquo; (30:21)
                  </p>
                </div>
              )}
            </section>

            {/* Venue */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-gold" />
                <h2 className="font-display text-lg font-semibold text-foreground">Venue</h2>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Venue Name
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={flowData.venue}
                      onChange={(e) => onUpdateData({ venue: e.target.value })}
                      placeholder="e.g. The Grand Palace, Lahore"
                      className={`pl-10 h-11 ${errors.venue ? "border-red-400" : ""}`}
                    />
                  </div>
                  {errors.venue && <p className="text-xs text-red-500">{errors.venue}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Full Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={addressText}
                      onChange={(e) => {
                        setAddressText(e.target.value);
                        updateAddressAndMap(e.target.value, mapsUrl);
                      }}
                      placeholder="e.g. The Grand Palace, MM Alam Road, Gulberg III, Lahore"
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Google Maps Link (Optional)
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={mapsUrl}
                      onChange={(e) => {
                        setMapsUrl(e.target.value);
                        updateAddressAndMap(addressText, e.target.value);
                      }}
                      placeholder="e.g. https://maps.app.goo.gl/..."
                      className="pl-10 h-11"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Globe className="w-3 h-3 text-gold" />
                    Paste the direct Google Maps share link to your venue so guests can navigate easily.
                  </p>
                </div>
              </div>
            </section>

            {/* Welcome Message */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-gold" />
                <h2 className="font-display text-lg font-semibold text-foreground">Welcome Message</h2>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Message to Your Guests
                </label>
                <Textarea
                  value={flowData.welcomeMessage}
                  onChange={(e) => onUpdateData({ welcomeMessage: e.target.value })}
                  placeholder="With hearts full of love and joy, we warmly invite you..."
                  className="min-h-[100px] resize-none"
                />
              </div>
            </section>

            {/* Events */}
            <section className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gold" />
                  <h2 className="font-display text-lg font-semibold text-foreground">Events</h2>
                </div>
                {!isEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addEvent}
                    className="text-gold hover:text-gold-light gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Event
                  </Button>
                )}
              </div>

              {isEdit && (
                <div className="p-3.5 rounded-xl border border-gold/20 bg-gold/5 flex gap-2.5 text-xs text-gold">
                  <Calendar className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-0.5">Marriage Dates Locked</p>
                    <p className="opacity-90 leading-relaxed">
                      Marriage event dates cannot be changed after the invitation has been created. All other details (venue, times, dress codes, music, etc.) can be modified freely.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {flowData.events.map((event, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Event {index + 1}
                      </span>
                      {!isEdit && flowData.events.length > 1 && (
                        <button
                          onClick={() => removeEvent(index)}
                          className="text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        value={event.name}
                        onChange={(e) => updateEvent(index, "name", e.target.value)}
                        placeholder="Event name (e.g. Mehndi)"
                        className="h-10"
                      />
                      <Input
                        type="date"
                        value={event.date}
                        onChange={(e) => updateEvent(index, "date", e.target.value)}
                        disabled={isEdit}
                        className="h-10 disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-muted/50 disabled:border-muted-foreground/35"
                      />
                      <Input
                        type="time"
                        value={event.time}
                        onChange={(e) => updateEvent(index, "time", e.target.value)}
                        className="h-10"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Dress Code */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Shirt className="w-4 h-4 text-gold" />
                <h2 className="font-display text-lg font-semibold text-foreground">Dress Code</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Women&apos;s Dress Code
                  </label>
                  <Input
                    value={flowData.dressCodeWomen}
                    onChange={(e) => onUpdateData({ dressCodeWomen: e.target.value })}
                    placeholder="e.g. Elegant formal attire in pastel tones"
                    className="h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Men&apos;s Dress Code
                  </label>
                  <Input
                    value={flowData.dressCodeMen}
                    onChange={(e) => onUpdateData({ dressCodeMen: e.target.value })}
                    placeholder="e.g. Suit or traditional shalwar kameez"
                    className="h-11"
                  />
                </div>
              </div>
            </section>

            {/* Transportation */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Car className="w-4 h-4 text-gold" />
                <h2 className="font-display text-lg font-semibold text-foreground">Transportation</h2>
              </div>
              <Textarea
                value={flowData.transportation}
                onChange={(e) => onUpdateData({ transportation: e.target.value })}
                placeholder="e.g. Shuttle service will be available from the city center."
                className="min-h-[70px] resize-none"
              />
            </section>

            {/* Accommodation */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Hotel className="w-4 h-4 text-gold" />
                <h2 className="font-display text-lg font-semibold text-foreground">Accommodation</h2>
              </div>
              <Textarea
                value={flowData.accommodation}
                onChange={(e) => onUpdateData({ accommodation: e.target.value })}
                placeholder="e.g. Special rates at The Grand Palace. Use code SHAADI2025."
                className="min-h-[70px] resize-none"
              />
            </section>

            {/* Digital Shagun & Registry */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-4 h-4 text-gold" />
                <h2 className="font-display text-lg font-semibold text-foreground">Digital Shagun &amp; Registry</h2>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed -mt-1">
                Add your bank and mobile wallet details so guests can send shagun digitally. All fields are optional.
              </p>

              {/* Blessing / Personal Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Blessing Message (shown to guests)
                </label>
                <Textarea
                  value={(() => {
                    // Extract just the blessing line (before bank details)
                    const raw = flowData.gifts || '';
                    const blessingMatch = raw.match(/^([^,\n]+?)(?:\.|,\s*(?:Bank|For\s+Shagun|Transfer)|$)/i);
                    return blessingMatch ? blessingMatch[1].trim() : raw.split(/[,\n]/)[0].trim();
                  })()}
                  onChange={(e) => {
                    // Rebuild gifts string preserving banking details
                    const blessing = e.target.value;
                    const raw = flowData.gifts || '';
                    const bankPart = raw.replace(/^[^,\n]*[,.]?\s*/, '');
                    onUpdateData({ gifts: blessing + (bankPart ? '. For Shagun, you may transfer to ' + bankPart : '') });
                  }}
                  placeholder="e.g. Your prayers are our greatest gift."
                  className="min-h-[60px] resize-none"
                />
              </div>

              {/* Bank Details Card */}
              <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border/30 bg-muted/30">
                  <span className="text-xs font-semibold text-foreground tracking-wide">🏦 Bank Account</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Bank Name</label>
                      <Input
                        value={(() => { const m = (flowData.gifts||'').match(/(?:Bank\s*(?:Name)?|Bank)\s*[:\-\s]+\s*([a-zA-Z\s.]+?)(?:,|\n|Account|Title|IBAN|$)/i); return m?.[1]?.trim()||''; })()}
                        onChange={(e) => updateGiftsField('bankName', e.target.value)}
                        placeholder="e.g. Meezan Bank"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Account Title</label>
                      <Input
                        value={(() => { const m = (flowData.gifts||'').match(/(?:Account\s*Title|Acc\s*Title|Title)\s*[:\-\s]+\s*([a-zA-Z\s.()]+?)(?:,|Account|IBAN|Raast|$)/i); return m?.[1]?.trim()||''; })()}
                        onChange={(e) => updateGiftsField('accountTitle', e.target.value)}
                        placeholder="e.g. Ahmed Khan"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Account Number</label>
                      <Input
                        value={(() => { const m = (flowData.gifts||'').match(/(?:Account\s*(?:Number|No\.?)|Acc\s*(?:Number|No\.?))\s*[:\-\s]+\s*([0-9\-]+)/i); return m?.[1]?.trim()||''; })()}
                        onChange={(e) => updateGiftsField('accountNumber', e.target.value)}
                        placeholder="e.g. 028102384"
                        className="h-9 text-sm font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">IBAN</label>
                      <Input
                        value={(() => { const m = (flowData.gifts||'').match(/IBAN\s*[:\-\s]+\s*([A-Z]{2}[0-9]{2}[A-Z0-9\s]{16,30})/i); return m?.[1]?.replace(/\s+/g,'').trim()||''; })()}
                        onChange={(e) => updateGiftsField('iban', e.target.value.toUpperCase().replace(/\s/g,''))}
                        placeholder="e.g. PK45MEZN00028102384"
                        className="h-9 text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Wallets Card */}
              <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border/30 bg-muted/30">
                  <span className="text-xs font-semibold text-foreground tracking-wide">📱 Mobile Wallets</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Raast ID</label>
                      <Input
                        value={(() => { const m = (flowData.gifts||'').match(/(?:Raast\s*(?:ID)?|Raast)\s*[:\-\s]+\s*([0-9+]+)/i); return m?.[1]?.trim()||''; })()}
                        onChange={(e) => updateGiftsField('raastId', e.target.value)}
                        placeholder="03xxxxxxxxx"
                        className="h-9 text-sm font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">EasyPaisa</label>
                      <Input
                        value={(() => { const m = (flowData.gifts||'').match(/(?:EasyPaisa|Easy\s*Paisa)\s*[:\-\s]+\s*([0-9+]+)/i); return m?.[1]?.trim()||''; })()}
                        onChange={(e) => updateGiftsField('easyPaisa', e.target.value)}
                        placeholder="03xxxxxxxxx"
                        className="h-9 text-sm font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">JazzCash</label>
                      <Input
                        value={(() => { const m = (flowData.gifts||'').match(/(?:JazzCash|Jazz\s*Cash)\s*[:\-\s]+\s*([0-9+]+)/i); return m?.[1]?.trim()||''; })()}
                        onChange={(e) => updateGiftsField('jazzCash', e.target.value)}
                        placeholder="03xxxxxxxxx"
                        className="h-9 text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Background Music */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Music className="w-4 h-4 text-gold" />
                <h2 className="font-display text-lg font-semibold text-foreground">Background Music</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "soft-sitar", label: "Soft Sitar Melody" },
                  { id: "tabla-beats", label: "Tabla Beats" },
                  { id: "flute-raga", label: "Flute Raga" },
                  { id: "shehnai", label: "Shehnai Classic" },
                  { id: "sufi-qawwali", label: "Sufi Qawwali" },
                  { id: "no-music", label: "No Music" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleMusicSelection(option.id)}
                    className={`px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all ${
                      flowData.backgroundMusic === option.id
                        ? "bg-emerald text-primary-foreground border border-emerald shadow-sm"
                        : "bg-muted/50 text-muted-foreground border border-border/50 hover:border-gold/30 hover:text-foreground"
                    }`}
                  >
                    <Music className="w-3 h-3 inline mr-1.5" />
                    {option.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Photo Upload */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <ImagePlus className="w-4 h-4 text-gold" />
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Photos
                  {isUploading && (
                    <span className="ml-2 text-xs text-muted-foreground font-normal inline-flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                    </span>
                  )}
                </h2>
              </div>

              {/* Hero Image */}
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Hero Background Image
                </label>
                {flowData.heroImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-border/50 aspect-[16/9]">
                    <img
                      src={flowData.heroImage}
                      alt="Hero preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => onUpdateData({ heroImage: "" })}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                      aria-label="Remove hero image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => heroInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full p-6 rounded-xl border-2 border-dashed border-border/50 hover:border-gold/30 transition-colors flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    <ImagePlus className="w-8 h-8" />
                    <span className="text-sm font-medium">Upload Hero Image</span>
                    <span className="text-xs">Recommended: 1920×1080px</span>
                  </button>
                )}
                <input
                  ref={heroInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "hero")}
                  className="hidden"
                />
              </div>

              {/* Slideshow Images */}
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Slideshow Photos (up to 4)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {flowData.slideshowImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-lg overflow-hidden border border-border/50 aspect-square"
                    >
                      <img
                        src={img}
                        alt={`Slideshow ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeSlideshowImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                        aria-label={`Remove photo ${idx + 1}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {flowData.slideshowImages.length < 4 && (
                    <button
                      onClick={() => slideshowInputRef.current?.click()}
                      disabled={isUploading}
                      className="rounded-lg border-2 border-dashed border-border/50 hover:border-gold/30 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground aspect-square disabled:opacity-50"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-[10px]">Add Photo</span>
                    </button>
                  )}
                </div>
                <input
                  ref={slideshowInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e, "slideshow")}
                  className="hidden"
                />
              </div>

              {/* YouTube Video (Royal Only) */}
              {flowData.selectedPlan === "royal" && (
                <div className="space-y-2 mt-6">
                  <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                    <Video className="w-3.5 h-3.5 text-gold" />
                    YouTube Video ID
                  </label>
                  <div className="relative">
                    <Input
                      value={flowData.youtubeVideoId || ""}
                      onChange={(e) => onUpdateData({ youtubeVideoId: e.target.value })}
                      placeholder="e.g. dQw4w9WgXcQ"
                      className="bg-muted/50 border-border/50 focus:border-gold/40"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      Only paste the video ID (the part after v= in the URL).
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Submit */}
            <div className="pt-4">
              <Button
                onClick={handleSubmit}
                disabled={isSaving || isUploading}
                className="w-full h-12 bg-gold hover:bg-gold-light text-emerald-dark font-semibold text-base gap-2"
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving Details...</>
                ) : flowData.paymentDone ? (
                  <>Save Changes<Check className="w-4 h-4" /></>
                ) : (
                  <>Continue to Payment<ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

/* ---------- Helper Components ---------- */
function StepDot({ done, current, label }: { done?: boolean; current?: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div
        className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
          done ? "bg-gold text-emerald-dark" : current ? "bg-emerald text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? <Check className="w-3 h-3" /> : current ? "3" : ""}
      </div>
      <span className={`text-xs hidden sm:inline ${current ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}

function StepLine({ active }: { active?: boolean }) {
  return <div className={`w-4 sm:w-6 h-px ${active ? "bg-gold/30" : "bg-border"}`} />;
}
