"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Check, Wand2, RefreshCw, Feather, Crown, Zap, Heart } from "lucide-react";
import { toast } from "sonner";

interface AICopywriterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (text: string) => void;
  category?: string;
  context?: {
    partner1Name?: string;
    partner2Name?: string;
    venue?: string;
  };
}

const TONES = [
  { id: "poetic", label: "Poetic & Heartfelt", icon: Feather, desc: "Emotional & lyrical couplets" },
  { id: "formal", label: "Royal & Prestigious", icon: Crown, desc: "Classic formal etiquette" },
  { id: "modern", label: "Modern & Energetic", icon: Zap, desc: "Casual & vibrant tone" },
  { id: "traditional", label: "Traditional & Blessings", icon: Heart, desc: "Islamic prayers & cultural warmth" },
];

export function AICopywriterModal({
  isOpen,
  onClose,
  onApply,
  category = "wedding",
  context = {},
}: AICopywriterModalProps) {
  const [selectedTone, setSelectedTone] = useState<string>("poetic");
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ur" | "bilingual">("en");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setSuggestions([]);
    try {
      const res = await fetch("/api/ai/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          tone: selectedTone,
          language: selectedLanguage,
          context,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();
      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      } else {
        toast.error("No suggestions generated. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not generate suggestions. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSelectSuggestion = (text: string) => {
    onApply(text);
    toast.success("Applied to welcome message!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-card border border-border/60 shadow-2xl p-6">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/15 border border-gold/30 flex items-center justify-center text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl font-bold text-foreground">
                AI Magic Writer
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Generate tailored Urdu &amp; English welcome messages, poetic verses, and event notes.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Configuration Controls */}
        <div className="space-y-4 pt-2">
          {/* Tone Selector */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
              Choose Tone &amp; Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map((tone) => {
                const Icon = tone.icon;
                const isSelected = selectedTone === tone.id;
                return (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => setSelectedTone(tone.id)}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-primary/10 border-primary shadow-sm text-foreground"
                        : "bg-background/60 border-border/40 hover:border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <div>
                      <p className="text-xs font-semibold leading-none">{tone.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{tone.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center justify-between border-y border-border/40 py-3">
            <span className="text-xs font-semibold text-foreground">Language Style</span>
            <div className="flex items-center gap-1.5 bg-background/80 p-1 rounded-lg border border-border/40">
              {(["en", "ur", "bilingual"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1 rounded-md text-xs transition-all ${
                    selectedLanguage === lang
                      ? "bg-primary text-slate-950 shadow-xs font-black ring-1 ring-gold/40"
                      : "text-slate-200 hover:text-white font-medium"
                  }`}
                >
                  {lang === "en" ? "English" : lang === "ur" ? "اردو (Urdu)" : "Bilingual"}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full h-11 bg-primary hover:bg-primary-light text-slate-950 font-black text-xs uppercase tracking-wider gap-2 shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                Crafting With AI...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                Generate 3 Creative Options
              </>
            )}
          </Button>

          {/* Results Display */}
          {suggestions.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Select Your Favorite Option:
              </span>
              <div className="space-y-2.5">
                {suggestions.map((text, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border/60 bg-background/70 hover:border-primary/50 transition-all group relative space-y-3"
                  >
                    <p className={`text-xs text-foreground/90 leading-relaxed ${selectedLanguage === "ur" ? "font-serif text-right text-sm" : ""}`}>
                      &ldquo;{text}&rdquo;
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-border/20">
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Option {idx + 1}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopy(text, idx)}
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span className="ml-1 text-[11px]">{copiedIndex === idx ? "Copied" : "Copy"}</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSelectSuggestion(text)}
                          className="h-7 px-3 bg-primary hover:bg-primary-light text-slate-950 hover:text-slate-950 text-[11px] font-black border border-gold/40 shadow-sm"
                        >
                          Use this
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
