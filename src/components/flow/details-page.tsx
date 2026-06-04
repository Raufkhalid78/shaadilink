"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Heart,
  MapPin,
  Music,
  MessageSquare,
  Check,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FlowData } from "@/lib/flow-types";

interface DetailsPageProps {
  flowData: FlowData;
  onUpdateData: (updates: Partial<FlowData>) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function DetailsPage({
  flowData,
  onUpdateData,
  onBack,
  onContinue,
}: DetailsPageProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!flowData.partner1Name.trim()) newErrors.partner1Name = "Name is required";
    if (!flowData.partner2Name.trim()) newErrors.partner2Name = "Name is required";
    if (!flowData.venue.trim()) newErrors.venue = "Venue is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onContinue();
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
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Couple Names
                </h2>
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
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Venue
                </h2>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Venue Name & Address
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
            </section>

            {/* Welcome Message */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-gold" />
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Welcome Message
                </h2>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Message to Your Guests
                </label>
                <Textarea
                  value={flowData.welcomeMessage}
                  onChange={(e) => onUpdateData({ welcomeMessage: e.target.value })}
                  placeholder="With hearts full of love and joy, we warmly invite you to share in the celebration of our union..."
                  className="min-h-[100px] resize-none"
                />
              </div>
            </section>

            {/* Events */}
            <section className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gold" />
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Events
                  </h2>
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

            {/* Background Music */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Music className="w-4 h-4 text-gold" />
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Background Music
                </h2>
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

            {/* Submit */}
            <div className="pt-4">
              <Button
                onClick={handleSubmit}
                className="w-full h-12 bg-gold hover:bg-gold-light text-emerald-dark font-semibold text-base gap-2"
              >
                Continue to Payment
                <ArrowRight className="w-4 h-4" />
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
