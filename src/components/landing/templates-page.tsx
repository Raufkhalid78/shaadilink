"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, Heart, Sparkles, Star, Search, X, Check, Crown, Gem, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

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
  {
    id: "watercolor-peach",
    name: "Watercolor Peach",
    theme: "Mehndi",
    description: "Soft peach and orange watercolor with petal reveal animation",
    bgClass: "bg-gradient-to-br from-orange-950 via-orange-900 to-orange-950",
    borderClass: "border-orange-400/30",
    badgeText: "New",
    badgeClass: "bg-orange-500/15 text-orange-300 border-orange-400/25",
    patternColor: "text-orange-400/10",
    doorType: "Petal Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP"],
  },
  {
    id: "pastel-floral",
    name: "Pastel Floral",
    theme: "Walima",
    description: "Soft pink and blush with elegant floral curtains and premium typography",
    bgClass: "bg-gradient-to-br from-fuchsia-950 via-pink-900 to-fuchsia-950",
    borderClass: "border-pink-300/30",
    badgeText: "Elegant",
    badgeClass: "bg-pink-400/15 text-pink-200 border-pink-400/25",
    patternColor: "text-pink-300/10",
    doorType: "Curtain Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP"],
  },
  {
    id: "minimal-white",
    name: "Minimal White",
    theme: "Reception",
    description: "Clean, elegant white and slate with a modern split-screen glass door reveal",
    bgClass: "bg-slate-50",
    borderClass: "border-slate-300/50",
    badgeText: "Modern",
    badgeClass: "bg-slate-200 text-slate-700 border-slate-300",
    patternColor: "text-slate-200",
    doorType: "Split-Screen Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP"],
    isLight: true,
  },
];

const royalTemplates = [
  {
    id: "royal-imperial",
    name: "Royal Imperial",
    theme: "Baraat",
    image: "/templates/royal-imperial.jpg",
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
    image: "/templates/royal-elegance.jpg",
    description: "Velvet cream and crimson cinematic experience with luxurious curtain animation",
    bgClass: "bg-gradient-to-br from-red-950 via-rose-900 to-red-950",
    borderClass: "border-rose-300/30",
    badgeText: "Premium Royal",
    badgeClass: "bg-rose-400/15 text-rose-300 border-rose-400/25",
    patternColor: "text-rose-300/10",
    doorType: "Curtain Door Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP", "Music", "Photo Gallery", "Custom Domain", "Priority Support"],
  },
  {
    id: "geometric-gold",
    name: "Geometric Gold",
    theme: "Reception",
    image: "/templates/geometric-gold.jpg",
    description: "Luxurious deep navy and gold geometric doors with sleek glass-grid panel reveal",
    bgClass: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950",
    borderClass: "border-amber-400/30",
    badgeText: "Modern Royal",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-400/25",
    patternColor: "text-amber-400/10",
    doorType: "Geometric Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP", "Music", "Photo Gallery", "Custom Domain"],
  },
  {
    id: "dark-velvet",
    name: "Dark Velvet",
    theme: "Baraat",
    image: "/templates/dark-velvet.jpg",
    description: "Deep violet and velvet black with classic door opening and premium gold accents",
    bgClass: "bg-gradient-to-br from-violet-950 via-purple-900 to-violet-950",
    borderClass: "border-purple-300/30",
    badgeText: "Premium Royal",
    badgeClass: "bg-purple-500/15 text-purple-200 border-purple-400/25",
    patternColor: "text-purple-300/10",
    doorType: "Classic Doors",
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

/* ---------- Classic Miniature 3D Door Thumbnail ---------- */
function ClassicDoorThumbnail({ template }: { template: any }) {
  const isLight = template.isLight;

  const meta: Record<string, { icon: string; accent: string; subtext: string; leftText?: string; rightText?: string }> = {
    'emerald-noir': { icon: '✦', accent: '#d4a853', subtext: 'Mehndi', leftText: 'بِسْمِ اللَّهِ', rightText: 'الرَّحْمَنِ الرَّحِيمِ' },
    'crimson-royale': { icon: '👑', accent: '#f87171', subtext: 'Baraat', leftText: 'نّ', rightText: 'و' },
    'majestic-love': { icon: '💫', accent: '#f59e0b', subtext: 'Baraat', leftText: 'ع', rightText: 'ش' },
    'garden-romance': { icon: '🌸', accent: '#ec4899', subtext: 'Walima' },
    'modern-minimal': { icon: '▷', accent: '#60a5fa', subtext: 'Reception' },
    'mughal-emerald': { icon: '✦', accent: '#2dd4bf', subtext: 'Nikkah', leftText: 'مغل', rightText: 'شاہی' },
    'rose-gold-blush': { icon: '🌹', accent: '#fb7185', subtext: 'Walima' },
    'ivory-dream': { icon: '◈', accent: '#d97706', subtext: 'Mayun' },
    'watercolor-peach': { icon: '🍑', accent: '#f97316', subtext: 'Mehndi' },
    'pastel-floral': { icon: '🌸', accent: '#f472b6', subtext: 'Walima' },
    'minimal-white': { icon: '💍', accent: '#64748b', subtext: 'Reception' },
  };

  const m = meta[template.id] || { icon: '✦', accent: '#d4a853', subtext: template.theme };

  return (
    <div className="relative w-full h-full p-3.5 flex flex-col justify-between overflow-hidden select-none">
      {/* Radial lighting spotlight */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: isLight 
            ? `radial-gradient(ellipse at 50% 10%, rgba(255,255,255,0.95) 0%, rgba(240,240,245,0.4) 60%, rgba(0,0,0,0.06) 100%)`
            : `radial-gradient(ellipse at 50% 15%, rgba(255,255,255,0.18) 0%, transparent 60%), radial-gradient(circle at 50% 50%, ${m.accent}20 0%, transparent 70%)`
        }} 
      />

      {/* Decorative SVG Pattern Background */}
      <TemplatePattern colorClass={template.patternColor} id={template.id} />

      {/* 2-Panel Door Inset Framing */}
      <div className="absolute inset-2.5 rounded-xl border border-white/10 pointer-events-none flex overflow-hidden shadow-inner">
        {/* Left Panel */}
        <div 
          className="flex-1 border-r border-white/15 h-full relative"
          style={{
            background: isLight ? 'rgba(255,255,255,0.35)' : 'linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.04) 100%)'
          }}
        >
          {m.leftText && (
            <span className="absolute left-1 top-1/2 -translate-y-1/2 font-arabic text-xs text-white/35 rotate-[-90deg] origin-center block whitespace-nowrap">
              {m.leftText}
            </span>
          )}
        </div>
        {/* Right Panel */}
        <div 
          className="flex-1 border-l border-black/30 h-full relative"
          style={{
            background: isLight ? 'rgba(255,255,255,0.2)' : 'linear-gradient(270deg, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.04) 100%)'
          }}
        >
          {m.rightText && (
            <span className="absolute right-1 top-1/2 -translate-y-1/2 font-arabic text-xs text-white/35 rotate-[90deg] origin-center block whitespace-nowrap">
              {m.rightText}
            </span>
          )}
        </div>
      </div>

      {/* Top Header: Bismillah / Calligraphy Arch */}
      <div className="relative z-10 text-center pt-1">
        <div className="flex items-center justify-center gap-2 mb-1 opacity-80">
          <div className="w-7 h-px" style={{ background: `linear-gradient(90deg, transparent, ${m.accent})` }} />
          <svg width="10" height="10" viewBox="0 0 20 20" fill="none">
            <polygon points="10,1 12.5,7.5 19,7.5 14,11.5 16,18 10,14 4,18 6,11.5 1,7.5 7.5,7.5" stroke={m.accent} strokeWidth="1.5" fill="none" />
          </svg>
          <div className="w-7 h-px" style={{ background: `linear-gradient(270deg, transparent, ${m.accent})` }} />
        </div>
        <span 
          className="font-calligraphy text-base sm:text-lg block tracking-wide"
          style={{ 
            color: isLight ? '#475569' : '#ffffff',
            textShadow: isLight ? 'none' : `0 0 15px ${m.accent}66`
          }}
        >
          دعوة زفاف
        </span>
      </div>

      {/* Center 3D Wax Seal / Door Knocker */}
      <div className="relative z-20 flex flex-col items-center justify-center my-auto">
        <div className="text-center mb-1">
          <p 
            className="font-display text-sm sm:text-base font-bold tracking-wider"
            style={{ 
              color: isLight ? '#0f172a' : '#ffffff',
              textShadow: isLight ? 'none' : '0 2px 8px rgba(0,0,0,0.8)'
            }}
          >
            Ahmed &amp; Fatima
          </p>
        </div>

        {/* Central 3D Embossed Emblem / Seal */}
        <div className="relative my-1">
          <div 
            className="w-11 h-11 rounded-full flex flex-col items-center justify-center shadow-2xl border"
            style={{
              background: isLight 
                ? `radial-gradient(circle at 35% 30%, #ffffff 0%, #e2e8f0 100%)`
                : `radial-gradient(circle at 35% 30%, ${m.accent}55 0%, #000000 90%)`,
              borderColor: `${m.accent}99`,
              boxShadow: `0 4px 15px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.3)`
            }}
          >
            <span 
              className="text-base font-bold leading-none select-none"
              style={{ color: m.accent }}
            >
              {m.icon}
            </span>
            <span 
              className="text-[7px] uppercase tracking-[0.2em] font-semibold mt-0.5"
              style={{ color: isLight ? '#64748b' : `${m.accent}ee` }}
            >
              OPEN
            </span>
          </div>

          {/* Golden Seam line passing through */}
          <div 
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3"
            style={{ background: `linear-gradient(to top, ${m.accent}, transparent)` }}
          />
          <div 
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0.5 h-3"
            style={{ background: `linear-gradient(to bottom, ${m.accent}, transparent)` }}
          />
        </div>
      </div>

      {/* Bottom Door Details & Badge */}
      <div className="relative z-10 flex items-center justify-between px-2 pb-0.5">
        <span 
          className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border backdrop-blur-sm"
          style={{
            color: isLight ? '#334155' : m.accent,
            borderColor: `${m.accent}44`,
            backgroundColor: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'
          }}
        >
          {m.subtext}
        </span>
        <div className="flex items-center gap-1">
          <Star className="w-2.5 h-2.5" style={{ color: m.accent }} />
          <span 
            className="text-[9px] uppercase tracking-wider font-medium opacity-80"
            style={{ color: isLight ? '#64748b' : '#ffffff' }}
          >
            {template.doorType}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Template Card ---------- */
function TemplateCard({
  template,
  onSelect,
  onPreview,
  isRoyal = false,
}: {
  template: any; // Using any to avoid type errors with isLight since classic/royal arrays have different types now
  onSelect: (id: string, plan: "classic" | "royal") => void;
  onPreview: (id: string) => void;
  isRoyal?: boolean;
}) {
  const [liked, setLiked] = useState(false);

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="group flex flex-col relative rounded-2xl overflow-hidden border border-border/50 hover:border-gold/40 transition-all duration-500 hover:shadow-xl hover:shadow-gold/10 hover:-translate-y-1 bg-card"
    >
      <div className={`relative shrink-0 ${template.bgClass} h-56 sm:h-64 overflow-hidden flex flex-col items-center justify-center`}>
        {template.image ? (
          <>
            <img
              src={template.image}
              alt={template.name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25" />
            
            {/* Elegant glass overlay card over the picture */}
            <div className="relative z-10 w-full px-5 flex flex-col items-center justify-center text-center">
              <div className="bg-black/55 backdrop-blur-md rounded-xl p-3.5 border border-gold/30 shadow-xl max-w-[210px] w-full">
                <span className="font-calligraphy text-amber-300 text-base sm:text-lg block">دعوة زفاف</span>
                <p className="font-display text-white text-sm sm:text-base font-semibold tracking-wide mt-0.5">Ahmed & Fatima</p>
                <div className="w-10 h-px bg-gold/50 mx-auto my-1.5" />
                <div className="flex items-center justify-center gap-1.5">
                  <Star className="w-3 h-3 text-amber-300" />
                  <span className="text-[10px] uppercase tracking-wider text-white/90 font-medium">{template.doorType}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <ClassicDoorThumbnail template={template} />
        )}

        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-1 right-1 z-30 w-12 h-12 flex items-center justify-center focus:outline-none"
          aria-label="Add template to favorites"
        >
          <div className={`w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors`}>
            <Heart className={`w-4 h-4 transition-colors ${liked ? "text-red-400 fill-red-400" : "text-white/60"}`} />
          </div>
        </button>

        {isRoyal && (
          <div className="absolute top-3 left-3 z-30">
            <Badge className="bg-gold/20 text-gold border-gold/30 backdrop-blur-sm text-[10px]">
              <Crown className="w-2.5 h-2.5 mr-1" /> Royal
            </Badge>
          </div>
        )}
      </div>

      <div className="bg-card p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between mb-2 gap-2">
            <h3 className="font-display text-base font-semibold text-foreground">{template.name}</h3>
            <Badge className={`${template.badgeClass} text-[10px] px-1.5 py-0 whitespace-nowrap shrink-0`}>{template.badgeText}</Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{template.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {template.features.slice(0, 4).map((feature: string) => (
              <span key={feature} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{feature}</span>
            ))}
            {template.features.length > 4 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{template.features.length - 4}</span>
            )}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => onPreview(template.id)} className="w-full border-gold text-gold hover:bg-gold/10 font-medium">
            <Eye className="h-4 w-4 mr-1.5 shrink-0" /> Demo
          </Button>
          <Button size="sm" onClick={() => onSelect(template.id, isRoyal ? "royal" : "classic")} className="w-full bg-gold hover:bg-gold-light text-emerald-dark font-medium border-none">
            <Check className="h-4 w-4 mr-1.5 shrink-0" /> Select
          </Button>
        </div>
      </div>
    </m.div>
  );
}

/* ---------- Main Templates Page ---------- */
interface TemplatesPageProps {
  selectedPlan: "classic" | "royal" | null;
  onBack: () => void;
  onPreview: (templateId: string) => void;
  onSelectTemplate: (templateId: string, plan: "classic" | "royal") => void;
  crumbs?: { label: string; onClick?: () => void }[];
}

export function TemplatesPage({
  selectedPlan,
  onBack,
  onPreview,
  onSelectTemplate,
  crumbs,
}: TemplatesPageProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>(selectedPlan === "royal" ? "royal" : "classic");

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

      {/* Breadcrumb path */}
      <PageBreadcrumb crumbs={crumbs || [{ label: "Home", onClick: onBack }, { label: "Choose Your Template" }]} />

      <main id="main-content" className="flex-1">
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
              <Input aria-label="Search templates" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..." className="pl-10 bg-muted/50 border-border/50 focus:border-gold/40" />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Tabs: Classics / Royal */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              <m.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {filterTemplates(classicTemplates).map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={onSelectTemplate}
                      onPreview={(id) => onPreview(id)}
                    />
                  ))}
                </AnimatePresence>
              </m.div>
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
              <m.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {filterTemplates(royalTemplates).map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={onSelectTemplate}
                      onPreview={(id) => onPreview(id)}
                      isRoyal
                    />
                  ))}
                </AnimatePresence>
              </m.div>
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
    <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
      <Sparkles className="w-12 h-12 text-gold/30 mx-auto mb-4" />
      <h3 className="font-display text-xl font-semibold text-foreground mb-2">No templates found</h3>
      <p className="text-muted-foreground text-sm">Try adjusting your search terms.</p>
      <Button variant="outline" className="mt-4 border-gold/30 text-gold hover:bg-gold/10" onClick={onClear}>Clear Search</Button>
    </m.div>
  );
}
