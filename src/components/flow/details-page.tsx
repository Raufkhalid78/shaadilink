"use client";

import { useState, useRef, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ArrowLeft, ArrowRight, Calendar, Heart, MapPin, Music, MessageSquare,
  Check, Plus, Trash2, User, Shirt, Car, Hotel, Gift, ImagePlus, X, Globe, Loader2, Video, Sparkles, Crown, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  const [currentStep, setCurrentStep] = useState<number>(1);

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

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!flowData.partner1Name.trim()) newErrors.partner1Name = "Partner 1 name is required";
      if (!flowData.partner2Name.trim()) newErrors.partner2Name = "Partner 2 name is required";
    } else if (step === 2) {
      if (!flowData.venue.trim()) newErrors.venue = "Venue name is required";
      const eventWithNameButNoDate = flowData.events.find(e => e.name.trim() && !e.date.trim());
      if (eventWithNameButNoDate) {
        newErrors.events = `Please add a date for "${eventWithNameButNoDate.name}"`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      if (mapsUrl && !mapsUrl.startsWith('https://maps.') && !mapsUrl.startsWith('https://goo.gl/') && !mapsUrl.startsWith('https://maps.app.goo.gl/') && !mapsUrl.includes('google.com/maps/')) {
        newErrors.mapsUrl = 'Please enter a valid Google Maps URL (e.g. https://maps.app.goo.gl/...)';
      }
    }

    setErrors(newErrors);
    
    const keys = Object.keys(newErrors);
    if (keys.length > 0) {
      setTimeout(() => {
        const firstErrorId = `field-${keys[0]}`;
        const el = document.getElementById(firstErrorId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error("Please fix the errors in the form before saving.");
      return;
    }
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
          hostBrideFamily: flowData.hostBrideFamily,
          hostGroomFamily: flowData.hostGroomFamily,
          hostBrideCity: flowData.hostBrideCity,
          hostGroomCity: flowData.hostGroomCity,
          contactPhone: flowData.contactPhone,
          isSegregated: flowData.isSegregated,
          venueDetailsSegregated: flowData.venueDetailsSegregated,
          showNikahRegistration: flowData.showNikahRegistration,
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

      <main id="main-content" className="flex-1 px-4 py-6 sm:py-10">
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-7xl"
        >
          {/* Header Title & Subtitle */}
          <div className="text-center mb-8 max-w-2xl mx-auto space-y-2">
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-foreground">
              Fill Your Details
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Enter your wedding details — we&apos;ll transform them into a breathtaking digital invitation.
            </p>
            {errors.events && <p className="text-sm text-red-500 font-semibold">{errors.events}</p>}
          </div>

          {/* 4-Step Wizard Nav Pills */}
          <div className="flex items-center justify-between gap-2 p-1.5 bg-card/80 border border-border/60 rounded-2xl mb-8 backdrop-blur-md shadow-lg overflow-x-auto max-w-4xl mx-auto">
            {[
              { step: 1, label: "1. Couple & Host", icon: Heart },
              { step: 2, label: "2. Events & Venue", icon: MapPin },
              { step: 3, label: "3. Media & Music", icon: Music },
              { step: 4, label: "4. Details & Shagun", icon: Gift },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = currentStep === tab.step;
              return (
                <button
                  key={tab.step}
                  onClick={() => {
                    if (tab.step > currentStep && !validateStep(currentStep)) return;
                    setCurrentStep(tab.step);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-gold text-emerald-dark font-bold shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: 4-Step Form Wizard */}
            <div className="lg:col-span-7 space-y-6">

              {/* STEP 1: Couple & Host Information */}
              {currentStep === 1 && (
                <m.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Couple Names */}
                  <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                        <Heart className="w-4 h-4" />
                      </div>
                      <h2 className="font-display text-lg font-bold text-foreground">Couple Names</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5" id="field-partner1Name">
                        <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                          Partner 1 Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            value={flowData.partner1Name}
                            onChange={(e) => onUpdateData({ partner1Name: e.target.value })}
                            placeholder="e.g. Ahmed"
                            className={`pl-10 h-11 bg-background/80 ${errors.partner1Name ? "border-red-400" : ""}`}
                          />
                        </div>
                        {errors.partner1Name && <p className="text-xs text-red-500">{errors.partner1Name}</p>}
                      </div>
                      <div className="space-y-1.5" id="field-partner2Name">
                        <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                          Partner 2 Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            value={flowData.partner2Name}
                            onChange={(e) => onUpdateData({ partner2Name: e.target.value })}
                            placeholder="e.g. Fatima"
                            className={`pl-10 h-11 bg-background/80 ${errors.partner2Name ? "border-red-400" : ""}`}
                          />
                        </div>
                        {errors.partner2Name && <p className="text-xs text-red-500">{errors.partner2Name}</p>}
                      </div>
                    </div>
                  </section>

                  {/* Host Families */}
                  <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                        <User className="w-4 h-4" />
                      </div>
                      <h2 className="font-display text-lg font-bold text-foreground">Host Families (Optional)</h2>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      In Pakistani invitations, it is customary to include the names of parents or families hosting the wedding.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                          Partner 1 Family / Parents
                        </label>
                        <Input
                          value={flowData.hostBrideFamily || ""}
                          onChange={(e) => onUpdateData({ hostBrideFamily: e.target.value })}
                          placeholder="e.g. Mr. & Mrs. Tariq Hussain"
                          className="h-11 bg-background/80"
                        />
                        <Input
                          value={flowData.hostBrideCity || ""}
                          onChange={(e) => onUpdateData({ hostBrideCity: e.target.value })}
                          placeholder="City (e.g. from Lahore)"
                          className="h-11 mt-2 text-xs bg-background/80"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                          Partner 2 Family / Parents
                        </label>
                        <Input
                          value={flowData.hostGroomFamily || ""}
                          onChange={(e) => onUpdateData({ hostGroomFamily: e.target.value })}
                          placeholder="e.g. Mr. & Mrs. Imran Sheikh"
                          className="h-11 bg-background/80"
                        />
                        <Input
                          value={flowData.hostGroomCity || ""}
                          onChange={(e) => onUpdateData({ hostGroomCity: e.target.value })}
                          placeholder="City (e.g. from Karachi)"
                          className="h-11 mt-2 text-xs bg-background/80"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Custom Invitation Link */}
                  <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                        <Globe className="w-4 h-4" />
                      </div>
                      <h2 className="font-display text-lg font-bold text-foreground">Custom Invitation Link</h2>
                    </div>
                    <div className="space-y-1.5" id="field-slug">
                      <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        Personalized Web Link Slug
                      </label>
                      <div className="relative flex items-center">
                        <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-border bg-muted text-muted-foreground text-xs h-11">
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
                          className={`rounded-l-none h-11 bg-background/80 ${errors.slug ? "border-red-400" : ""}`}
                        />
                      </div>
                    </div>
                  </section>

                  {/* Cultural & Religious Features Toggles */}
                  <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center justify-between rounded-2xl border border-border/60 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => onUpdateData({ showBismillah: !flowData.showBismillah })}
                    >
                      <div className="flex-1 pr-4">
                        <p className="text-sm font-semibold text-foreground">Show Bismillah Header</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Displays Bismillah in Arabic calligraphy at the top.</p>
                      </div>
                      <div className={`relative w-12 h-6 rounded-full transition-colors ${flowData.showBismillah ? "bg-gold" : "bg-muted"}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${flowData.showBismillah ? "translate-x-7" : "translate-x-1"}`} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border/60 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => onUpdateData({ showQuranVerse: !flowData.showQuranVerse })}
                    >
                      <div className="flex-1 pr-4">
                        <p className="text-sm font-semibold text-foreground">Show Quranic Verse (Surah Ar-Rum 30:21)</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Displays marriage verse in Arabic, English &amp; Urdu.</p>
                      </div>
                      <div className={`relative w-12 h-6 rounded-full transition-colors ${flowData.showQuranVerse ? "bg-gold" : "bg-muted"}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${flowData.showQuranVerse ? "translate-x-7" : "translate-x-1"}`} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-border/60 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => onUpdateData({ showNikahRegistration: !flowData.showNikahRegistration })}
                    >
                      <div className="flex-1 pr-4">
                        <p className="text-sm font-semibold text-foreground">Show Nikah Registration Note</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Displays a formal note about Nikah registration.</p>
                      </div>
                      <div className={`relative w-12 h-6 rounded-full transition-colors ${flowData.showNikahRegistration ? "bg-gold" : "bg-muted"}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${flowData.showNikahRegistration ? "translate-x-7" : "translate-x-1"}`} />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/60 overflow-hidden transition-colors">
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30"
                        onClick={() => onUpdateData({ isSegregated: !flowData.isSegregated })}
                      >
                        <div className="flex-1 pr-4">
                          <p className="text-sm font-semibold text-foreground">Separate Ladies/Gents Setup</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Indicate segregated seating at the venue.</p>
                        </div>
                        <div className={`relative w-12 h-6 rounded-full transition-colors ${flowData.isSegregated ? "bg-gold" : "bg-muted"}`}>
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${flowData.isSegregated ? "translate-x-7" : "translate-x-1"}`} />
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {flowData.isSegregated && (
                          <m.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-4 pb-4 bg-muted/20"
                          >
                            <Input
                              value={flowData.venueDetailsSegregated || ""}
                              onChange={(e) => onUpdateData({ venueDetailsSegregated: e.target.value })}
                              placeholder="e.g. Hall A for Ladies, Hall B for Gents"
                              className="h-10 text-xs bg-background/80 mt-2"
                            />
                          </m.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </section>

                  <div className="flex justify-end pt-2">
                    <Button
                      onClick={() => {
                        if (validateStep(1)) setCurrentStep(2);
                      }}
                      className="bg-gold hover:bg-gold-light text-emerald-dark font-bold gap-2 shadow-lg"
                    >
                      Next: Events &amp; Venue <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </m.div>
              )}

              {/* STEP 2: Events & Venue Location */}
              {currentStep === 2 && (
                <m.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Venue Details */}
                  <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <h2 className="font-display text-lg font-bold text-foreground">Venue Location</h2>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5" id="field-venue">
                        <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                          Venue Name
                        </label>
                        <Input
                          value={flowData.venue}
                          onChange={(e) => onUpdateData({ venue: e.target.value })}
                          placeholder="e.g. The Grand Palace, Lahore"
                          className={`h-11 bg-background/80 ${errors.venue ? "border-red-400" : ""}`}
                        />
                        {errors.venue && <p className="text-xs text-red-500">{errors.venue}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                          Full Address
                        </label>
                        <Input
                          value={addressText}
                          onChange={(e) => {
                            setAddressText(e.target.value);
                            updateAddressAndMap(e.target.value, mapsUrl);
                          }}
                          placeholder="e.g. MM Alam Road, Gulberg III, Lahore"
                          className="h-11 bg-background/80"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                          Google Maps Link (Optional)
                        </label>
                        <Input
                          value={mapsUrl}
                          onChange={(e) => {
                            setMapsUrl(e.target.value);
                            updateAddressAndMap(addressText, e.target.value);
                          }}
                          placeholder="e.g. https://maps.app.goo.gl/..."
                          className="h-11 bg-background/80"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Dynamic Multi-Events */}
                  <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <h2 className="font-display text-lg font-bold text-foreground">Events Schedule</h2>
                      </div>
                      {!isEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={addEvent}
                          className="text-gold hover:text-gold-light gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Event
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {flowData.events.map((event, index) => (
                        <div key={index} className="p-4 rounded-2xl border border-border/50 bg-muted/20 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gold uppercase tracking-wider">Event {index + 1}</span>
                            {!isEdit && flowData.events.length > 1 && (
                              <button onClick={() => removeEvent(index)} className="text-muted-foreground hover:text-red-400">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Input
                              value={event.name}
                              onChange={(e) => updateEvent(index, "name", e.target.value)}
                              placeholder="Event name (e.g. Baraat)"
                              className="h-10 bg-background/80"
                            />
                            <Input
                              type="date"
                              value={event.date}
                              onChange={(e) => updateEvent(index, "date", e.target.value)}
                              disabled={isEdit}
                              className="h-10 bg-background/80"
                            />
                            <Input
                              type="time"
                              value={event.time}
                              onChange={(e) => updateEvent(index, "time", e.target.value)}
                              className="h-10 bg-background/80"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <Button
                      onClick={() => {
                        if (validateStep(2)) setCurrentStep(3);
                      }}
                      className="bg-gold hover:bg-gold-light text-emerald-dark font-bold gap-2 shadow-lg"
                    >
                      Next: Media &amp; Music <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </m.div>
              )}

              {/* STEP 3: Photos & Background Music */}
              {currentStep === 3 && (
                <m.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Photo Uploads */}
                  <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                        <ImagePlus className="w-4 h-4" />
                      </div>
                      <h2 className="font-display text-lg font-bold text-foreground">
                        Photos &amp; Media
                        {isUploading && (
                          <span className="ml-2 text-xs text-muted-foreground font-normal inline-flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                          </span>
                        )}
                      </h2>
                    </div>

                    {/* Hero Cover Image */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Hero Cover Photo</label>
                      {flowData.heroImage ? (
                        <div className="relative rounded-2xl overflow-hidden border border-border/50 aspect-[16/9]">
                          <Image src={flowData.heroImage} alt="Hero" fill className="object-cover" />
                          <button
                            onClick={() => onUpdateData({ heroImage: "" })}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => heroInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-full p-6 rounded-2xl border-2 border-dashed border-border/50 hover:border-gold/40 transition-colors flex flex-col items-center gap-2 text-muted-foreground"
                        >
                          <ImagePlus className="w-8 h-8 text-gold" />
                          <span className="text-sm font-medium text-foreground">Upload Hero Cover Photo</span>
                        </button>
                      )}
                      <input ref={heroInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, "hero")} className="hidden" />
                    </div>

                    {/* Slideshow Photos */}
                    <div className="space-y-2 pt-2">
                      <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Slideshow Photos (up to 4)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {flowData.slideshowImages.map((img, idx) => (
                          <div key={idx} className="relative rounded-xl overflow-hidden border border-border/50 aspect-square">
                            <Image src={img} alt={`Slideshow ${idx + 1}`} fill className="object-cover" />
                            <button
                              onClick={() => removeSlideshowImage(idx)}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {flowData.slideshowImages.length < 4 && (
                          <button
                            onClick={() => slideshowInputRef.current?.click()}
                            disabled={isUploading}
                            className="rounded-xl border-2 border-dashed border-border/50 hover:border-gold/40 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground aspect-square"
                          >
                            <Plus className="w-5 h-5 text-gold" />
                            <span className="text-[10px]">Add Photo</span>
                          </button>
                        )}
                      </div>
                      <input ref={slideshowInputRef} type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e, "slideshow")} className="hidden" />
                    </div>

                    {/* YouTube Video (Royal Plan) */}
                    {flowData.selectedPlan === "royal" && (
                      <div className="space-y-2 pt-2">
                        <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase flex items-center gap-2">
                          <Video className="w-3.5 h-3.5 text-gold" /> YouTube Video ID
                        </label>
                        <Input
                          value={flowData.youtubeVideoId || ""}
                          onChange={(e) => onUpdateData({ youtubeVideoId: e.target.value })}
                          placeholder="e.g. dQw4w9WgXcQ"
                          className="bg-background/80"
                        />
                      </div>
                    )}
                  </section>

                  {/* Background Music Track Selector */}
                  <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                        <Music className="w-4 h-4" />
                      </div>
                      <h2 className="font-display text-lg font-bold text-foreground">Background Music</h2>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { id: "soft-sitar", label: "Soft Sitar Melody" },
                        { id: "tabla-beats", label: "Tabla Beats" },
                        { id: "flute-raga", label: "Flute Raga" },
                        { id: "shehnai", label: "Shehnai Classic" },
                        { id: "sufi-qawwali", label: "Sufi Qawwali" },
                        { id: "no-music", label: "No Music" },
                      ].map((track) => (
                        <button
                          key={track.id}
                          onClick={() => handleMusicSelection(track.id)}
                          className={`p-3 rounded-2xl border text-xs font-semibold transition-all flex items-center gap-2 ${
                            flowData.backgroundMusic === track.id
                              ? "bg-gold text-emerald-dark border-gold shadow-md font-bold"
                              : "bg-background/80 text-muted-foreground border-border/60 hover:border-gold/40"
                          }`}
                        >
                          <Music className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{track.label}</span>
                        </button>
                      ))}
                    </div>
                  </section>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      <ArrowLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <Button onClick={() => setCurrentStep(4)} className="bg-gold hover:bg-gold-light text-emerald-dark font-bold gap-2 shadow-lg">
                      Next: Details &amp; Shagun <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </m.div>
              )}

              {/* STEP 4: Custom Details & Digital Shagun */}
              {currentStep === 4 && (
                <m.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Welcome Message & Contact Phone */}
                  <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center gap-2.5 mb-1">
                      <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <h2 className="font-display text-lg font-bold text-foreground">Welcome Message &amp; Contact</h2>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Welcome Message to Guests</label>
                        <Textarea
                          value={flowData.welcomeMessage}
                          onChange={(e) => onUpdateData({ welcomeMessage: e.target.value })}
                          placeholder="With hearts full of love and joy, we warmly invite you..."
                          className="min-h-[90px] bg-background/80 resize-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Host Contact Phone Number (Optional)</label>
                        <Input
                          value={flowData.contactPhone || ""}
                          onChange={(e) => onUpdateData({ contactPhone: e.target.value })}
                          placeholder="e.g. +92 300 1234567"
                          className="h-11 bg-background/80"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Royal Plan Extras (Dress Code, Transportation, Accommodation) */}
                  {flowData.selectedPlan === "royal" ? (
                    <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                      <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                          <Shirt className="w-4 h-4" />
                        </div>
                        <h2 className="font-display text-lg font-bold text-foreground">Royal Plan Extras</h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          value={flowData.dressCodeWomen || ""}
                          onChange={(e) => onUpdateData({ dressCodeWomen: e.target.value })}
                          placeholder="Women's Dress Code (e.g. Formal)"
                          className="h-10 bg-background/80"
                        />
                        <Input
                          value={flowData.dressCodeMen || ""}
                          onChange={(e) => onUpdateData({ dressCodeMen: e.target.value })}
                          placeholder="Men's Dress Code (e.g. Black Tie)"
                          className="h-10 bg-background/80"
                        />
                      </div>
                      <Textarea
                        value={flowData.transportation || ""}
                        onChange={(e) => onUpdateData({ transportation: e.target.value })}
                        placeholder="Transportation notes (e.g. Valet available)"
                        className="min-h-[60px] bg-background/80 resize-none"
                      />
                      <Textarea
                        value={flowData.accommodation || ""}
                        onChange={(e) => onUpdateData({ accommodation: e.target.value })}
                        placeholder="Accommodation notes (e.g. Hotel rates)"
                        className="min-h-[60px] bg-background/80 resize-none"
                      />
                    </section>
                  ) : (
                    /* Locked Royal Extras Banner */
                    <div className="p-6 rounded-3xl bg-card/40 border border-gold/30 backdrop-blur-md relative overflow-hidden space-y-4">
                      <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                            <Crown className="w-4 h-4" />
                          </div>
                          <h2 className="font-display text-base font-bold text-foreground">Dress Code, Transport &amp; Hotel Info</h2>
                        </div>
                        <Badge className="bg-gold/20 text-gold border-gold/30 text-[10px] font-bold">👑 Royal Plan</Badge>
                      </div>

                      <div className="space-y-3 opacity-50 pointer-events-none filter blur-[1px]">
                        <div className="grid grid-cols-2 gap-3">
                          <Input placeholder="Women's Dress Code" disabled className="h-10 bg-muted/40" />
                          <Input placeholder="Men's Dress Code" disabled className="h-10 bg-muted/40" />
                        </div>
                        <Textarea placeholder="Valet Parking & Transportation Details" disabled className="h-12 bg-muted/40" />
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-gold/10 via-amber-500/10 to-transparent p-4 rounded-2xl border border-gold/30">
                        <p className="text-xs text-muted-foreground">
                          Upgrade to the <strong className="text-gold">Royal Plan</strong> to include dress code guidelines, valet transport, and accommodation details.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => {
                            onUpdateData({ selectedPlan: 'royal' });
                            toast.success("Switched to Royal Plan! Feature unlocked.");
                          }}
                          className="bg-gold hover:bg-gold-light text-emerald-dark font-bold text-xs gap-1.5 shrink-0 shadow-md"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Upgrade to Royal
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Digital Shagun Registry */}
                  {flowData.selectedPlan === "royal" ? (
                    <section className="p-6 rounded-3xl bg-card/70 border border-border/60 shadow-xl backdrop-blur-xl space-y-4">
                      <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                          <Gift className="w-4 h-4" />
                        </div>
                        <h2 className="font-display text-lg font-bold text-foreground">Digital Shagun Registry</h2>
                      </div>
                      <p className="text-xs text-muted-foreground">Add your bank and mobile wallet details so guests can send shagun digitally.</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          value={(() => { const m = (flowData.gifts||'').match(/(?:Bank\s*(?:Name)?|Bank)\s*[:\-\s]+\s*([a-zA-Z\s.]+?)(?:,|\n|Account|Title|IBAN|$)/i); return m?.[1]?.trim()||''; })()}
                          onChange={(e) => updateGiftsField('bankName', e.target.value)}
                          placeholder="Bank Name (e.g. Meezan)"
                          className="h-10 bg-background/80"
                        />
                        <Input
                          value={(() => { const m = (flowData.gifts||'').match(/(?:Account\s*Title|Acc\s*Title|Title)\s*[:\-\s]+\s*([a-zA-Z\s.()]+?)(?:,|Account|IBAN|Raast|$)/i); return m?.[1]?.trim()||''; })()}
                          onChange={(e) => updateGiftsField('accountTitle', e.target.value)}
                          placeholder="Account Title"
                          className="h-10 bg-background/80"
                        />
                        <Input
                          value={(() => { const m = (flowData.gifts||'').match(/(?:Account\s*(?:Number|No\.?)|Acc\s*(?:Number|No\.?))\s*[:\-\s]+\s*([0-9\-]+)/i); return m?.[1]?.trim()||''; })()}
                          onChange={(e) => updateGiftsField('accountNumber', e.target.value)}
                          placeholder="Account Number"
                          className="h-10 bg-background/80 font-mono"
                        />
                        <Input
                          value={(() => { const m = (flowData.gifts||'').match(/IBAN\s*[:\-\s]+\s*([A-Z]{2}[0-9]{2}[A-Z0-9\s]{16,30})/i); return m?.[1]?.replace(/\s+/g,'').trim()||''; })()}
                          onChange={(e) => updateGiftsField('iban', e.target.value.toUpperCase().replace(/\s/g,''))}
                          placeholder="IBAN (e.g. PK45...)"
                          className="h-10 bg-background/80 font-mono"
                        />
                        <Input
                          value={(() => { const m = (flowData.gifts||'').match(/(?:EasyPaisa|Easy\s*Paisa)\s*[:\-\s]+\s*([0-9+]+)/i); return m?.[1]?.trim()||''; })()}
                          onChange={(e) => updateGiftsField('easyPaisa', e.target.value)}
                          placeholder="EasyPaisa 03xxxxxxxxx"
                          className="h-10 bg-background/80 font-mono"
                        />
                        <Input
                          value={(() => { const m = (flowData.gifts||'').match(/(?:JazzCash|Jazz\s*Cash)\s*[:\-\s]+\s*([0-9+]+)/i); return m?.[1]?.trim()||''; })()}
                          onChange={(e) => updateGiftsField('jazzCash', e.target.value)}
                          placeholder="JazzCash 03xxxxxxxxx"
                          className="h-10 bg-background/80 font-mono"
                        />
                      </div>
                    </section>
                  ) : (
                    /* Locked Digital Shagun Registry Banner */
                    <div className="p-6 rounded-3xl bg-card/40 border border-gold/30 backdrop-blur-md relative overflow-hidden space-y-4">
                      <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                            <Gift className="w-4 h-4" />
                          </div>
                          <h2 className="font-display text-base font-bold text-foreground">Digital Shagun Registry</h2>
                        </div>
                        <Badge className="bg-gold/20 text-gold border-gold/30 text-[10px] font-bold">👑 Royal Plan</Badge>
                      </div>

                      <div className="space-y-3 opacity-50 pointer-events-none filter blur-[1px]">
                        <div className="grid grid-cols-2 gap-3">
                          <Input placeholder="Meezan Bank" disabled className="h-10 bg-muted/40" />
                          <Input placeholder="Account Title" disabled className="h-10 bg-muted/40" />
                          <Input placeholder="EasyPaisa 03xxxxxxxxx" disabled className="h-10 bg-muted/40" />
                          <Input placeholder="JazzCash 03xxxxxxxxx" disabled className="h-10 bg-muted/40" />
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-gold/10 via-amber-500/10 to-transparent p-4 rounded-2xl border border-gold/30">
                        <p className="text-xs text-muted-foreground">
                          Upgrade to the <strong className="text-gold">Royal Plan</strong> to allow guests to transfer Digital Shagun via Bank, EasyPaisa, JazzCash &amp; Raast.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => {
                            onUpdateData({ selectedPlan: 'royal' });
                            toast.success("Switched to Royal Plan! Feature unlocked.");
                          }}
                          className="bg-gold hover:bg-gold-light text-emerald-dark font-bold text-xs gap-1.5 shrink-0 shadow-md"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Upgrade to Royal
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(3)}>
                      <ArrowLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>

                    <Button
                      onClick={handleSubmit}
                      disabled={isSaving || isUploading}
                      size="lg"
                      className="bg-gold hover:bg-gold-light text-emerald-dark font-bold text-base gap-2 shadow-xl px-8"
                    >
                      {isSaving ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Saving Details...</>
                      ) : flowData.paymentDone ? (
                        <>Save Changes <Check className="w-5 h-5" /></>
                      ) : (
                        <>Continue to Payment <ArrowRight className="w-5 h-5" /></>
                      )}
                    </Button>
                  </div>
                </m.div>
              )}

            </div>

            {/* Right Column: Live Mobile Mockup Preview */}
            <div className="hidden lg:block lg:col-span-5 sticky top-24">
              <div className="p-6 rounded-3xl bg-card/70 border border-border/60 backdrop-blur-xl shadow-2xl flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Live Preview
                  </span>
                  <Badge className="bg-emerald/20 text-emerald border-0 text-[10px]">Real-Time Sync</Badge>
                </div>

                {/* Smartphone Container */}
                <div className="relative w-[320px] h-[640px] rounded-[38px] border-[5px] border-gold/40 shadow-2xl bg-background overflow-hidden flex flex-col items-center justify-between p-4 text-center">
                  {/* Camera Notch */}
                  <div className="absolute top-2 w-24 h-4 bg-foreground/15 rounded-full z-20" />
                  
                  {/* Mini Invitation Preview Content */}
                  <div className="w-full mt-6 space-y-3.5 overflow-y-auto max-h-[550px] pr-1.5 scrollbar-thin scrollbar-thumb-gold/30">
                    
                    {/* Bismillah Calligraphy Header */}
                    {flowData.showBismillah && (
                      <div className="py-1">
                        <p className="font-arabic text-sm text-gold leading-loose" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
                      </div>
                    )}

                    {/* Host Families / Parents */}
                    {(flowData.hostBrideFamily || flowData.hostGroomFamily) && (
                      <p className="text-[9px] text-muted-foreground italic leading-tight">
                        Together with their families: <br />
                        <strong className="text-foreground font-semibold">
                          {flowData.hostBrideFamily} {flowData.hostGroomFamily && `& ${flowData.hostGroomFamily}`}
                        </strong>
                      </p>
                    )}
                    
                    <p className="text-[8px] tracking-[0.25em] uppercase text-gold font-bold">We invite you to celebrate</p>
                    
                    {/* Couple Names */}
                    <h3 className="font-display text-2xl font-extrabold text-foreground leading-tight">
                      {flowData.partner1Name || "Partner 1"} <span className="text-gold font-serif italic">&amp;</span> {flowData.partner2Name || "Partner 2"}
                    </h3>

                    {/* Custom Slug Badge */}
                    {flowData.slug && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald/10 border border-emerald/30 text-emerald text-[8px] font-mono">
                        shaadilink.com/inv/{flowData.slug}
                      </span>
                    )}

                    {/* Hero Image */}
                    {flowData.heroImage && (
                      <div className="relative w-full h-36 rounded-2xl overflow-hidden my-1.5 border border-gold/30 shadow-md">
                        <Image src={flowData.heroImage} alt="Hero" fill className="object-cover" />
                      </div>
                    )}

                    {/* Quranic Verse */}
                    {flowData.showQuranVerse && (
                      <div className="p-2.5 rounded-2xl bg-gold/10 border border-gold/20 text-[9px] space-y-1 text-center">
                        <p className="font-arabic text-xs text-gold leading-relaxed" dir="rtl">وَمِنْ ءَايَـٰتِهِۦٓ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَٰجًا...</p>
                        <p className="text-[8px] text-muted-foreground italic">&ldquo;And He created for you mates that you may find tranquility in them...&rdquo;</p>
                      </div>
                    )}

                    {/* Welcome Message */}
                    {flowData.welcomeMessage && (
                      <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 text-[10px] text-muted-foreground italic leading-relaxed text-left">
                        &ldquo;{flowData.welcomeMessage}&rdquo;
                      </div>
                    )}

                    {/* All Events List */}
                    <div className="space-y-2 text-left">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gold">Events Schedule ({flowData.events?.length || 1})</p>
                      {flowData.events?.map((ev, i) => (
                        <div key={i} className="p-2.5 rounded-2xl bg-card border border-border/60 text-[10px] flex items-center justify-between shadow-sm">
                          <div>
                            <p className="font-bold text-foreground">{ev.name || `Event ${i + 1}`}</p>
                            <p className="text-[9px] text-muted-foreground">{ev.date || "Date TBA"} {ev.time && `at ${ev.time}`}</p>
                          </div>
                          <Badge className="bg-gold/15 text-gold border-gold/30 text-[8px]">Event {i + 1}</Badge>
                        </div>
                      ))}
                    </div>

                    {/* Main Venue & Address */}
                    <div className="p-3 rounded-2xl bg-card border border-border/60 text-[10px] text-left space-y-1 shadow-sm">
                      <div className="flex items-center gap-1.5 text-gold font-bold">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{flowData.venue || "Venue Location Name"}</span>
                      </div>
                      {addressText && <p className="text-[9px] text-muted-foreground leading-tight">{addressText}</p>}
                      {mapsUrl && (
                        <div className="pt-0.5 flex items-center gap-1 text-emerald text-[8px] font-semibold">
                          <Globe className="w-2.5 h-2.5" /> Google Maps Link Attached
                        </div>
                      )}
                    </div>

                    {/* Segregation & Nikah Notes */}
                    {flowData.isSegregated && (
                      <div className="p-2 rounded-xl bg-emerald/10 border border-emerald/30 text-[9px] text-emerald font-medium">
                        ✨ Separate Ladies &amp; Gents Setup {flowData.venueDetailsSegregated && `(${flowData.venueDetailsSegregated})`}
                      </div>
                    )}

                    {flowData.showNikahRegistration && (
                      <div className="p-2 rounded-xl bg-gold/10 border border-gold/20 text-[9px] text-gold font-medium">
                        📜 Formal Nikah Registration Note
                      </div>
                    )}

                    {/* Royal Plan Dress Code & Accommodations */}
                    {flowData.selectedPlan === "royal" && (
                      <div className="p-3 rounded-2xl bg-card border border-border/60 text-[9px] text-left space-y-1 shadow-sm">
                        <p className="font-bold text-gold uppercase tracking-wider">Dress Code &amp; Info</p>
                        {flowData.dressCodeWomen && <p className="text-muted-foreground">👗 Women: {flowData.dressCodeWomen}</p>}
                        {flowData.dressCodeMen && <p className="text-muted-foreground">👔 Men: {flowData.dressCodeMen}</p>}
                        {flowData.transportation && <p className="text-muted-foreground">🚗 Transport: {flowData.transportation}</p>}
                        {flowData.accommodation && <p className="text-muted-foreground">🏨 Hotel: {flowData.accommodation}</p>}
                      </div>
                    )}

                    {/* Digital Shagun Details */}
                    {(flowData.gifts || "").trim() && (
                      <div className="p-3 rounded-2xl bg-card border border-gold/30 text-[9px] text-left space-y-1 shadow-sm">
                        <div className="flex items-center gap-1.5 text-gold font-bold">
                          <Gift className="w-3.5 h-3.5 shrink-0" />
                          <span>Digital Shagun Registry</span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed font-sans">{flowData.gifts}</p>
                      </div>
                    )}

                    {/* Host Contact Phone */}
                    {flowData.contactPhone && (
                      <p className="text-[9px] text-muted-foreground">📞 Contact Host: <strong className="text-foreground">{flowData.contactPhone}</strong></p>
                    )}

                    {/* Music Player Bar */}
                    {flowData.backgroundMusic && flowData.backgroundMusic !== "no-music" && (
                      <div className="flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-gradient-to-r from-gold/20 via-amber-500/10 to-gold/20 border border-gold/40 text-gold text-[10px] font-bold shadow-md">
                        <Music className="w-3.5 h-3.5 animate-pulse" />
                        <span className="truncate">Music: {flowData.backgroundMusic}</span>
                      </div>
                    )}
                  </div>

                  <div className="w-full pt-2 border-t border-border/40 text-[9px] text-muted-foreground">
                    <span>ShaadiLink Digital Invitation</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </m.div>
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
