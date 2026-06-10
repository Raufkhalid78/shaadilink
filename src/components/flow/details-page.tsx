"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Calendar, Heart, MapPin, Music, MessageSquare,
  Check, Plus, Trash2, User, Shirt, Car, Hotel, Gift, ImagePlus, X, Globe, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { FlowData } from "@/lib/flow-types";

interface DetailsPageProps {
  flowData: FlowData;
  onUpdateData: (updates: Partial<FlowData>) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function DetailsPage({ flowData, onUpdateData, onBack, onContinue }: DetailsPageProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const slideshowInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!flowData.partner1Name.trim()) newErrors.partner1Name = "Name is required";
    if (!flowData.partner2Name.trim()) newErrors.partner2Name = "Name is required";
    if (!flowData.venue.trim()) newErrors.venue = "Venue is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSaving(true);

    try {
      // Save invitation to Supabase
      const res = await fetch("/api/invitations", {
        method: "POST",
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
      onUpdateData({ invitationId: data.invitationId });
      onContinue();
    } catch (err) {
      console.error("Details save error:", err);
      // Network error — still let them proceed
      onContinue();
    } finally {
      setIsSaving(false);
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
                    Full Address (for Google Maps)
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={flowData.venueAddress}
                      onChange={(e) => onUpdateData({ venueAddress: e.target.value })}
                      placeholder="e.g. The Grand Palace, MM Alam Road, Gulberg III, Lahore"
                      className="pl-10 h-11"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Full address enables embedded Google Maps in your invitation
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addEvent}
                  className="text-gold hover:text-gold-light gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Event
                </Button>
              </div>
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
                      {flowData.events.length > 1 && (
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
                        className="h-10"
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

            {/* Gifts */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-4 h-4 text-gold" />
                <h2 className="font-display text-lg font-semibold text-foreground">Gifts</h2>
              </div>
              <Textarea
                value={flowData.gifts}
                onChange={(e) => onUpdateData({ gifts: e.target.value })}
                placeholder="e.g. Your love and blessings are the greatest gifts."
                className="min-h-[70px] resize-none"
              />
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
                    onClick={() => onUpdateData({ backgroundMusic: option.id })}
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
