"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  Heart,
  Sparkles,
  Star,
  Search,
  X,
  Check,
  Crown,
  Gem,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ---------- Template Data ---------- */
const classicTemplates = [
  {
    id: "emerald-noir",
    name: "Emerald Noir",
    theme: "Mehndi",
    description: "Deep green and gold with ornate corner accents and luxury door opening animation",
    bgClass: "bg-gradient-to-br from-emerald-dark via-emerald to-emerald-dark",
    borderClass: "border-gold/30",
    badgeText: "Limited Edition",
    badgeClass: "bg-gold/15 text-gold border-gold/25",
    patternColor: "text-gold/10",
    doorType: "3D Door Opening",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP"],
  },
  {
    id: "crimson-royale",
    name: "Crimson Royale",
    theme: "Baraat",
    description: "Dark charcoal base with gold and deep red accents, luxury card reveal experience",
    bgClass: "bg-gradient-to-br from-gray-900 via-red-950 to-gray-900",
    borderClass: "border-red-400/30",
    badgeText: "Most Liked",
    badgeClass: "bg-red-500/15 text-red-400 border-red-400/25",
    patternColor: "text-red-400/10",
    doorType: "Scratch Card Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP"],
  },
  {
    id: "majestic-love",
    name: "Majestic Love",
    theme: "Baraat",
    description: "Classic ivory and gold with palace motifs and velvet curtain opening animation",
    bgClass: "bg-gradient-to-br from-amber-950 via-yellow-900 to-amber-950",
    borderClass: "border-amber-400/30",
    badgeText: "New",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-400/25",
    patternColor: "text-amber-400/10",
    doorType: "Curtain Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP"],
  },
  {
    id: "garden-romance",
    name: "Garden Romance",
    theme: "Walima",
    description: "Soft rose and blush with floral accents and vertical card opening animation",
    bgClass: "bg-gradient-to-br from-rose-900 via-pink-900 to-rose-950",
    borderClass: "border-pink-400/30",
    badgeText: "New",
    badgeClass: "bg-pink-500/15 text-pink-400 border-pink-400/25",
    patternColor: "text-pink-400/10",
    doorType: "Petal Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP"],
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    theme: "Reception",
    description: "Deep navy and gold with geometric patterns and book-style opening animation",
    bgClass: "bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900",
    borderClass: "border-blue-400/30",
    badgeText: "New",
    badgeClass: "bg-blue-500/15 text-blue-400 border-blue-400/25",
    patternColor: "text-blue-400/10",
    doorType: "Book-style Opening",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP"],
  },
  {
    id: "mughal-emerald",
    name: "Mughal Emerald",
    theme: "Nikkah",
    description: "Emerald green and gold with Mughal-inspired floral door opening and Islamic patterns",
    bgClass: "bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-950",
    borderClass: "border-teal-400/30",
    badgeText: "Popular",
    badgeClass: "bg-teal-500/15 text-teal-400 border-teal-400/25",
    patternColor: "text-teal-400/10",
    doorType: "Floral Door Opening",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP", "Music"],
  },
  {
    id: "rose-gold-blush",
    name: "Rose Gold Blush",
    theme: "Walima",
    description: "Blush pink and rose gold with ornate floral door animation and elegant design",
    bgClass: "bg-gradient-to-br from-rose-900 via-rose-800 to-rose-950",
    borderClass: "border-rose-400/30",
    badgeText: "Popular",
    badgeClass: "bg-rose-500/15 text-rose-400 border-rose-400/25",
    patternColor: "text-rose-400/10",
    doorType: "Curtain Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP", "Music"],
  },
  {
    id: "ivory-dream",
    name: "Ivory Dream",
    theme: "Mayun",
    description: "Soft ivory and sage green with delicate botanical elements and gentle reveal animation",
    bgClass: "bg-gradient-to-br from-stone-800 via-stone-700 to-stone-800",
    borderClass: "border-stone-400/30",
    badgeText: "Elegant",
    badgeClass: "bg-stone-500/15 text-stone-300 border-stone-400/25",
    patternColor: "text-stone-400/10",
    doorType: "Petal Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP"],
  },
];

const royalTemplates = [
  {
    id: "royal-imperial",
    name: "Royal Imperial",
    theme: "Baraat",
    description: "Cinematic rose-gold opening with luxurious motifs and grand door animation",
    bgClass: "bg-gradient-to-br from-rose-950 via-amber-900 to-rose-950",
    borderClass: "border-amber-300/30",
    badgeText: "Cinematic Royal",
    badgeClass: "bg-amber-400/15 text-amber-300 border-amber-400/25",
    patternColor: "text-amber-300/10",
    doorType: "Cinematic Door Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP", "Music", "Photo Gallery", "Custom Domain"],
  },
  {
    id: "royal-elegance",
    name: "Royal Elegance",
    theme: "Walima",
    description: "Velvet cream and crimson cinematic experience with luxurious curtain animation",
    bgClass: "bg-gradient-to-br from-red-950 via-rose-900 to-red-950",
    borderClass: "border-rose-300/30",
    badgeText: "Premium Royal",
    badgeClass: "bg-rose-400/15 text-rose-300 border-rose-400/25",
    patternColor: "text-rose-300/10",
    doorType: "Curtain Door Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP", "Music", "Photo Gallery", "Custom Domain", "Priority Support"],
  },
];

/* ---------- Decorative Pattern ---------- */
function TemplatePattern({ colorClass, id }: { colorClass: string; id: string }) {
  return (
    <svg className={`absolute inset-0 w-full h-full ${colorClass}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={`tp-${id}`} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M30 15 L30 45 M15 30 L45 30" stroke="currentColor" strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#tp-${id})`} />
    </svg>
  );
}

/* ---------- Template Card ---------- */
function TemplateCard({
  template,
  onSelect,
  onPreview,
  isRoyal = false,
}: {
  template: (typeof classicTemplates)[0];
  onSelect: (id: string) => void;
  onPreview: (id: string) => void;
  isRoyal?: boolean;
}) {
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="group relative rounded-2xl overflow-hidden border border-border/50 hover:border-gold/40 transition-all duration-500 hover:shadow-xl hover:shadow-gold/10 hover:-translate-y-1 bg-card"
    >
      <div className={`relative ${template.bgClass} h-56 sm:h-64 p-5 flex flex-col items-center justify-center`}>
        <TemplatePattern colorClass={template.patternColor} id={template.id} />
        <div className={`relative z-10 w-full h-full border-2 ${template.borderClass} rounded-lg flex flex-col items-center justify-center p-4`}>
          <span className="font-calligraphy text-white/30 text-xl sm:text-2xl mb-2">دعوة زفاف</span>
          <div className="text-center">
            <p className="font-display text-white/80 text-lg sm:text-xl font-semibold">Ahmed & Fatima</p>
            <div className="w-12 h-px bg-gold/40 mx-auto my-2" />
            <p className="font-calligraphy text-gold/60 text-sm tracking-wider">{template.theme}</p>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <Star className="w-3 h-3 text-white/30" />
            <p className="text-[10px] text-white/40 tracking-wider uppercase">{template.doorType}</p>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-gold/40" />
            <div className="w-8 h-px bg-gold/30" />
            <Sparkles className="h-3 w-3 text-gold/40" />
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-20">
          <Button variant="outline" size="sm" onClick={() => onPreview(template.id)} className="border-gold text-gold hover:bg-gold hover:text-emerald-dark font-medium">
            <Eye className="h-4 w-4 mr-1.5" /> Live Demo
          </Button>
          <Button size="sm" onClick={() => onSelect(template.id)} className="bg-gold hover:bg-gold-light text-emerald-dark font-medium border-none">
            <Check className="h-4 w-4 mr-1.5" /> {isRoyal ? "Use This Royal Design" : "Use This Design"}
          </Button>
        </div>

        <button onClick={(e) => { e.stopPropagation(); setLiked(!liked); }} className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors">
          <Heart className={`w-4 h-4 transition-colors ${liked ? "text-red-400 fill-red-400" : "text-white/60"}`} />
        </button>

        {isRoyal && (
          <div className="absolute top-3 left-3 z-30">
            <Badge className="bg-gold/20 text-gold border-gold/30 backdrop-blur-sm text-[10px]">
              <Crown className="w-2.5 h-2.5 mr-1" /> Royal
            </Badge>
          </div>
        )}
      </div>

      <div className="bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-base font-semibold text-foreground">{template.name}</h3>
          <Badge className={`${template.badgeClass} text-[10px] px-1.5 py-0`}>{template.badgeText}</Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{template.description}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {template.features.slice(0, 4).map((feature) => (
            <span key={feature} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{feature}</span>
          ))}
          {template.features.length > 4 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{template.features.length - 4}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ---------- Main Templates Page ---------- */
interface TemplatesPageProps {
  selectedPlan: "classic" | "royal" | null;
  onBack: () => void;
  onPreview: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export function TemplatesPage({
  selectedPlan,
  onBack,
  onPreview,
  onSelectTemplate,
}: TemplatesPageProps) {
  const [search, setSearch] = useState("");
  const defaultTab = selectedPlan === "royal" ? "royal" : "classic";

  const filterTemplates = (templates: typeof classicTemplates) => {
    if (search === "") return templates;
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.theme.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={onBack} className="gap-2 text-foreground/70 hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Button>
            <h1 className="font-display text-lg sm:text-xl font-bold text-foreground">
              Wedding <span className="gold-shimmer">Templates</span>
            </h1>
            <div className="hidden sm:block w-24" />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Collection notice */}
          <div className="mb-6 text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-emerald" />
              One Payment • Access All Templates In Your Collection
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..." className="pl-10 bg-muted/50 border-border/50 focus:border-gold/40" />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Tabs: Classics / Royal */}
          <Tabs defaultValue={defaultTab} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-muted/50 border border-border/50 p-1 h-auto">
                <TabsTrigger
                  value="classic"
                  className="data-[state=active]:bg-emerald data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm px-6 py-2.5 text-sm font-semibold gap-1.5"
                >
                  <Gem className="w-4 h-4" />
                  ShaadiLink Classics
                </TabsTrigger>
                <TabsTrigger
                  value="royal"
                  className="data-[state=active]:bg-gold data-[state=active]:text-emerald-dark data-[state=active]:shadow-sm px-6 py-2.5 text-sm font-semibold gap-1.5"
                >
                  <Crown className="w-4 h-4" />
                  ShaadiLink Royal
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Classic Templates */}
            <TabsContent value="classic">
              <div className="text-center mb-6">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  ShaadiLink Classic Invitations
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {filterTemplates(classicTemplates).length} premium designs included with Classic plan
                </p>
              </div>
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {filterTemplates(classicTemplates).map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={onSelectTemplate}
                      onPreview={() => onPreview()}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
              {filterTemplates(classicTemplates).length === 0 && (
                <EmptyState onClear={() => setSearch("")} />
              )}
            </TabsContent>

            {/* Royal Templates */}
            <TabsContent value="royal">
              <div className="text-center mb-6">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  ShaadiLink Royal Invitations
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {filterTemplates(royalTemplates).length} cinematic designs with premium animations
                </p>
              </div>
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {filterTemplates(royalTemplates).map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={onSelectTemplate}
                      onPreview={() => onPreview()}
                      isRoyal
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
              {filterTemplates(royalTemplates).length === 0 && (
                <EmptyState onClear={() => setSearch("")} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

/* ---------- Empty State ---------- */
function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
      <Sparkles className="w-12 h-12 text-gold/30 mx-auto mb-4" />
      <h3 className="font-display text-xl font-semibold text-foreground mb-2">No templates found</h3>
      <p className="text-muted-foreground text-sm">Try adjusting your search terms.</p>
      <Button variant="outline" className="mt-4 border-gold/30 text-gold hover:bg-gold/10" onClick={onClear}>Clear Search</Button>
    </motion.div>
  );
}
