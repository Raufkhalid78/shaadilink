import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Eye, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

interface Template {
  name: string;
  badge: "Classic" | "Royal";
  gradient: string;
  pattern: string;
  accentColor: string;
  accentGlow: string;
  image?: string;
  category?: string;
  headerLabel?: string;
  sampleTitle?: string;
  sealText?: string;
}

const templates: Template[] = [
  {
    name: "Emerald Noir",
    badge: "Classic",
    category: "Wedding",
    gradient: "from-[#0f1a16] via-[#152822] to-[#0a1210]",
    pattern: "radial-gradient(circle at 30% 40%, rgba(15,107,78,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(180,145,77,0.15) 0%, transparent 40%)",
    accentColor: "#d4a853",
    accentGlow: "rgba(212,168,83,0.15)",
    headerLabel: "دعوة زفاف",
    sampleTitle: "Ahmed & Fatima",
    sealText: "OPEN",
  },
  {
    name: "Crimson Royale",
    badge: "Classic",
    category: "Wedding",
    gradient: "from-[#1a0a0e] via-[#2a1018] to-[#120810]",
    pattern: "radial-gradient(circle at 50% 30%, rgba(180,40,40,0.25) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(180,145,77,0.2) 0%, transparent 40%)",
    accentColor: "#dc2626",
    accentGlow: "rgba(220,38,38,0.15)",
    headerLabel: "دعوة زفاف",
    sampleTitle: "Ahmed & Fatima",
    sealText: "OPEN",
  },
  {
    name: "Academic Excellence",
    badge: "Classic",
    category: "School",
    gradient: "from-[#0a121e] via-[#102035] to-[#060c14]",
    pattern: "radial-gradient(circle at 50% 30%, rgba(251,191,36,0.2) 0%, transparent 50%)",
    accentColor: "#fbbf24",
    accentGlow: "rgba(251,191,36,0.15)",
    headerLabel: "CONVOCATION",
    sampleTitle: "Class of 2026",
    sealText: "ENTER",
  },
  {
    name: "Pastel Paradise",
    badge: "Classic",
    category: "Birthday",
    gradient: "from-[#1a0f1d] via-[#2d1233] to-[#120a14]",
    pattern: "radial-gradient(circle at 40% 40%, rgba(244,114,182,0.25) 0%, transparent 50%)",
    accentColor: "#f472b6",
    accentGlow: "rgba(244,114,182,0.15)",
    headerLabel: "CELEBRATION",
    sampleTitle: "Sophia's Sweet 16",
    sealText: "PARTY",
  },
  {
    name: "Executive Summit",
    badge: "Classic",
    category: "Meeting",
    gradient: "from-[#0b1320] via-[#12233c] to-[#070d17]",
    pattern: "radial-gradient(circle at 50% 40%, rgba(56,189,248,0.2) 0%, transparent 50%)",
    accentColor: "#38bdf8",
    accentGlow: "rgba(56,189,248,0.15)",
    headerLabel: "EXECUTIVE SUMMIT",
    sampleTitle: "Global Tech Summit",
    sealText: "ACCESS",
  },
  {
    name: "Royal Imperial",
    badge: "Royal",
    category: "Wedding",
    image: "/templates/royal-imperial.jpg",
    gradient: "from-[#1a100a] via-[#2a1a10] to-[#120c08]",
    pattern: "radial-gradient(circle at 60% 40%, rgba(245,158,11,0.2) 0%, transparent 50%)",
    accentColor: "#f59e0b",
    accentGlow: "rgba(245,158,11,0.15)",
    headerLabel: "دعوة زفاف",
    sampleTitle: "Ahmed & Fatima",
    sealText: "OPEN",
  },
  {
    name: "Valedictorian Prestige",
    badge: "Royal",
    category: "School",
    image: "/templates/valedictorian-prestige.jpg",
    gradient: "from-[#061410] via-[#0a251e] to-[#040e0b]",
    pattern: "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.2) 0%, transparent 50%)",
    accentColor: "#10b981",
    accentGlow: "rgba(16,185,129,0.15)",
    headerLabel: "HONORS CONVOCATION",
    sampleTitle: "Summa Cum Laude",
    sealText: "ENTER",
  },
  {
    name: "Lumina Celebration",
    badge: "Royal",
    category: "Birthday",
    image: "/templates/lumina-celebration.jpg",
    gradient: "from-[#0f0518] via-[#190a2a] to-[#0a0312]",
    pattern: "radial-gradient(circle at 50% 40%, rgba(0,240,255,0.2) 0%, transparent 50%)",
    accentColor: "#00f0ff",
    accentGlow: "rgba(0,240,255,0.15)",
    headerLabel: "VIP BIRTHDAY",
    sampleTitle: "Zara's 21st Gala",
    sealText: "PARTY",
  },
  {
    name: "The Boardroom",
    badge: "Royal",
    category: "Meeting",
    image: "/templates/the-boardroom.jpg",
    gradient: "from-[#171108] via-[#261c0d] to-[#0e0a05]",
    pattern: "radial-gradient(circle at 50% 50%, rgba(245,158,11,0.2) 0%, transparent 50%)",
    accentColor: "#f59e0b",
    accentGlow: "rgba(245,158,11,0.15)",
    headerLabel: "ANNUAL ASSEMBLY",
    sampleTitle: "Global Boardroom 2026",
    sealText: "ACCESS",
  },
  {
    name: "Royal Elegance",
    badge: "Royal",
    category: "Wedding",
    image: "/templates/royal-elegance.jpg",
    gradient: "from-[#1a080e] via-[#2a1018] to-[#12060a]",
    pattern: "radial-gradient(circle at 50% 50%, rgba(244,63,94,0.25) 0%, transparent 50%)",
    accentColor: "#f43f5e",
    accentGlow: "rgba(244,63,94,0.15)",
    headerLabel: "دعوة زفاف",
    sampleTitle: "Zayd & Ayla",
    sealText: "OPEN",
  },
  {
    name: "Geometric Gold",
    badge: "Royal",
    category: "Wedding",
    image: "/templates/geometric-gold.jpg",
    gradient: "from-[#111827] via-[#1e293b] to-[#0f172a]",
    pattern: "radial-gradient(circle at 50% 50%, rgba(245,158,11,0.2) 0%, transparent 50%)",
    accentColor: "#f59e0b",
    accentGlow: "rgba(245,158,11,0.15)",
    headerLabel: "دعوة زفاف",
    sampleTitle: "Saad & Maryam",
    sealText: "OPEN",
  },
  {
    name: "Minimal White",
    badge: "Classic",
    category: "Wedding",
    gradient: "from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]",
    pattern: "radial-gradient(circle at 50% 50%, rgba(148,163,184,0.2) 0%, transparent 50%)",
    accentColor: "#94a3b8",
    accentGlow: "rgba(148,163,184,0.15)",
    headerLabel: "دعوة زفاف",
    sampleTitle: "Mustafa & Maham",
    sealText: "OPEN",
  },
];

export function TemplateShowcase({ onViewAllClick }: { onViewAllClick?: () => void }) {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<"all" | "royal" | "classic">("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const displayedTemplates = templates.filter(tmpl => {
    if (selectedCategory === "royal") return tmpl.badge === "Royal";
    if (selectedCategory === "classic") return tmpl.badge === "Classic";
    return true;
  });

  const CARD_WIDTH = 280;
  const CARD_GAP = 20;

  const maxIndex = Math.max(0, displayedTemplates.length - 3);

  const scrollToIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(clamped);
    if (scrollRef.current) {
      const scrollLeft = clamped * (CARD_WIDTH + CARD_GAP);
      scrollRef.current.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  };

  const handlePrev = () => scrollToIndex(currentIndex - 1);
  const handleNext = () => scrollToIndex(currentIndex + 1);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setCanScrollLeft(el.scrollLeft > 10);
          setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);

          const newIndex = Math.round(el.scrollLeft / (CARD_WIDTH + CARD_GAP));
          if (newIndex !== currentIndex && newIndex >= 0 && newIndex <= maxIndex) {
            setCurrentIndex(newIndex);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => el.removeEventListener("scroll", handleScroll);
  }, [currentIndex, maxIndex]);

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      {/* Dark premium background with layered gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-emerald-dark/15 to-background" />
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 30%, rgba(15,107,78,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(180,145,77,0.08) 0%, transparent 50%)",
        }}
      />
      {/* Top and bottom gold border lines */}
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(180,145,77,0.3) 20%, rgba(212,168,83,0.5) 50%, rgba(180,145,77,0.3) 80%, transparent)",
        }}
      />
      <div
        className="absolute bottom-0 inset-x-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(180,145,77,0.3) 20%, rgba(212,168,83,0.5) 50%, rgba(180,145,77,0.3) 80%, transparent)",
        }}
      />

      {/* Subtle gold geometric pattern background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="template-pattern"
              x="0"
              y="0"
              width="120"
              height="120"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M60 5 L115 60 L60 115 L5 60 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-primary"
              />
              <circle cx="60" cy="60" r="25" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-primary" />
              <circle cx="60" cy="60" r="10" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-primary" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#template-pattern)" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="inline-block font-medium tracking-widest uppercase text-xs text-primary text-lg mb-3">
            {t('showcase.badge')}
          </span>
          <h2 className="font-sans tracking-tight text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            {t('showcase.title')}
          </h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto text-base sm:text-lg text-center">
            {t('showcase.subtitle')}
          </p>
          {/* Gold divider */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60" />
            <div className="w-2 h-2 rounded-full bg-primary/70" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/60" />
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {[
              { id: "all" as const, label: language === 'ur' ? 'تمام ڈیزائنز' : 'All Templates' },
              { id: "royal" as const, label: language === 'ur' ? 'شاہی 3D گیٹ (Royal)' : 'Royal 3D Door Open' },
              { id: "classic" as const, label: language === 'ur' ? 'کلاسک (Classic)' : 'Classic Elegance' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentIndex(0);
                  if (scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
                }}
                className={`px-4 py-1.5 rounded-full text-xs transition-all duration-200 border cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-primary text-slate-950 font-black border-gold shadow-md shadow-primary/25 ring-1 ring-gold/40"
                    : "bg-card/40 text-slate-200 border-border/60 hover:text-white hover:border-gold/30 font-medium"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </m.div>

        {/* Gallery Container */}
        <div className="relative">
          {/* Left Arrow */}
          <AnimatePresence>
            {canScrollLeft && (
              <m.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onClick={handlePrev}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 items-center justify-center rounded-full bg-card/95 backdrop-blur-sm border border-gold/30 shadow-lg shadow-black/30 text-primary hover:bg-primary/10 hover:border-gold/50 transition-all duration-300"
                aria-label="Previous templates"
              >
                <ChevronLeft className="w-5 h-5" />
              </m.button>
            )}
          </AnimatePresence>

          {/* Right Arrow */}
          <AnimatePresence>
            {canScrollRight && (
              <m.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={handleNext}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 items-center justify-center rounded-full bg-card/95 backdrop-blur-sm border border-gold/30 shadow-lg shadow-black/30 text-primary hover:bg-primary/10 hover:border-gold/50 transition-all duration-300"
                aria-label="Next templates"
              >
                <ChevronRight className="w-5 h-5" />
              </m.button>
            )}
          </AnimatePresence>

          {/* Scrolling Container */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {displayedTemplates.map((template, index) => (
              <m.div
                key={template.name}
                className="flex-shrink-0 snap-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <m.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-[280px] sm:w-[300px] aspect-[3/4] rounded-2xl overflow-hidden border border-primary/20 hover:border-gold/50 hover:shadow-2xl hover:shadow-gold/10 transition-all duration-300 cursor-pointer group bg-black"
                >
                  {template.image ? (
                    <>
                      {/* Real Template Picture */}
                      <Image
                        src={template.image}
                        alt={template.name}
                        fill
                        sizes="(max-width: 640px) 280px, 300px"
                        loading="lazy"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20" />

                      {/* Glass overlay with host names */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <div className="bg-black/55 backdrop-blur-md rounded-xl p-4 border border-gold/30 shadow-2xl max-w-[220px] w-full">
                          {template.category === 'School' ? (
                            <>
                              <p className="font-medium tracking-widest uppercase text-xs text-[#f0e6d3] text-xl font-bold mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                Class of
                              </p>
                              <div className="flex items-center justify-center gap-2 my-1.5">
                                <div className="w-6 h-px bg-gradient-to-r from-transparent to-gold/60" />
                                <div className="w-1.5 h-1.5 rotate-45 border border-gold/70" />
                                <div className="w-6 h-px bg-gradient-to-l from-transparent to-gold/60" />
                              </div>
                              <p className="font-medium tracking-widest uppercase text-xs text-[#f0e6d3] text-xl font-bold mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                2026
                              </p>
                              <p className="font-sans tracking-tight text-primary/80 text-[10px] tracking-[0.25em] uppercase mt-2">
                                Honors Convocation
                              </p>
                            </>
                          ) : template.category === 'Meeting' ? (
                            <>
                              <p className="font-medium tracking-widest uppercase text-xs text-[#f0e6d3] text-xl font-bold mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                Executive
                              </p>
                              <div className="flex items-center justify-center gap-2 my-1.5">
                                <div className="w-6 h-px bg-gradient-to-r from-transparent to-gold/60" />
                                <div className="w-1.5 h-1.5 rotate-45 border border-gold/70" />
                                <div className="w-6 h-px bg-gradient-to-l from-transparent to-gold/60" />
                              </div>
                              <p className="font-medium tracking-widest uppercase text-xs text-[#f0e6d3] text-xl font-bold mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                Summit
                              </p>
                              <p className="font-sans tracking-tight text-primary/80 text-[10px] tracking-[0.25em] uppercase mt-2">
                                Leadership Keynote
                              </p>
                            </>
                          ) : template.category === 'Birthday' ? (
                            <>
                              <p className="font-medium tracking-widest uppercase text-xs text-[#f0e6d3] text-xl font-bold mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                Zara&apos;s
                              </p>
                              <div className="flex items-center justify-center gap-2 my-1.5">
                                <div className="w-6 h-px bg-gradient-to-r from-transparent to-gold/60" />
                                <div className="w-1.5 h-1.5 rotate-45 border border-gold/70" />
                                <div className="w-6 h-px bg-gradient-to-l from-transparent to-gold/60" />
                              </div>
                              <p className="font-medium tracking-widest uppercase text-xs text-[#f0e6d3] text-xl font-bold mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                21st Gala
                              </p>
                              <p className="font-sans tracking-tight text-primary/80 text-[10px] tracking-[0.25em] uppercase mt-2">
                                VIP Celebration
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-medium tracking-widest uppercase text-xs text-[#f0e6d3] text-2xl font-bold mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                Ahmed
                              </p>
                              <div className="flex items-center justify-center gap-2 my-1.5">
                                <div className="w-6 h-px bg-gradient-to-r from-transparent to-gold/60" />
                                <div className="w-1.5 h-1.5 rotate-45 border border-gold/70" />
                                <div className="w-6 h-px bg-gradient-to-l from-transparent to-gold/60" />
                              </div>
                              <p className="font-medium tracking-widest uppercase text-xs text-[#f0e6d3] text-2xl font-bold mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                Fatima
                              </p>
                              <p className="font-sans tracking-tight text-primary/80 text-[10px] tracking-[0.25em] uppercase mt-2">
                                Cinematic Royal
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Template Background - base gradient */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${template.gradient}`}
                      />
                      {/* Template Background - pattern overlay */}
                      <div
                        className="absolute inset-0"
                        style={{ backgroundImage: template.pattern }}
                      />

                      {/* Subtle accent glow behind content */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `radial-gradient(ellipse at 50% 45%, ${template.accentGlow} 0%, transparent 70%)`,
                        }}
                      />

                      {/* 2-Panel Door Inset Framing */}
                      <div className="absolute inset-2.5 rounded-xl border border-white/10 pointer-events-none flex overflow-hidden shadow-inner">
                        <div className="flex-1 border-r border-white/10 h-full bg-gradient-to-r from-black/40 to-transparent" />
                        <div className="flex-1 border-l border-black/30 h-full bg-gradient-to-l from-black/40 to-transparent" />
                      </div>

                      {/* Gold corner accents */}
                      <div className="absolute top-4 left-4 w-4 h-4 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-px bg-primary/60" />
                        <div className="absolute top-0 left-0 h-full w-px bg-primary/60" />
                      </div>
                      <div className="absolute top-4 right-4 w-4 h-4 pointer-events-none">
                        <div className="absolute top-0 right-0 w-full h-px bg-primary/60" />
                        <div className="absolute top-0 right-0 h-full w-px bg-primary/60" />
                      </div>
                      <div className="absolute bottom-4 left-4 w-4 h-4 pointer-events-none">
                        <div className="absolute bottom-0 left-0 w-full h-px bg-primary/60" />
                        <div className="absolute bottom-0 left-0 h-full w-px bg-primary/60" />
                      </div>
                      <div className="absolute bottom-4 right-4 w-4 h-4 pointer-events-none">
                        <div className="absolute bottom-0 right-0 w-full h-px bg-primary/60" />
                        <div className="absolute bottom-0 right-0 h-full w-px bg-primary/60" />
                      </div>

                      {/* Template content simulation */}
                      <div className="absolute inset-0 flex flex-col items-center justify-between p-6 text-center select-none">
                        {/* Top Calligraphy / Category Header */}
                        <div className="pt-2">
                          <span className={`tracking-widest uppercase text-xs text-primary/90 block drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${template.category && template.category !== 'Wedding' ? 'font-sans font-bold text-xs tracking-[0.2em]' : 'font-medium text-lg'}`}>
                            {template.headerLabel || (template.category === 'Birthday' ? 'CELEBRATION' : template.category === 'School' ? 'CONVOCATION' : template.category === 'Meeting' ? 'EXECUTIVE SUMMIT' : 'دعوة زفاف')}
                          </span>
                        </div>

                        {/* Center Monogram / Event Title & Wax Seal */}
                        <div className="flex flex-col items-center justify-center my-auto">
                          <p className="font-sans tracking-tight text-white text-base sm:text-lg font-bold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate max-w-[200px]">
                            {template.sampleTitle || (template.category === 'Birthday' ? "Zara's 21st" : template.category === 'School' ? 'Class of 2026' : template.category === 'Meeting' ? 'Global Tech Summit' : 'Ahmed & Fatima')}
                          </p>

                          {/* 3D Wax Seal */}
                          <div className="relative my-2">
                            <div 
                              className="w-11 h-11 rounded-full flex flex-col items-center justify-center shadow-2xl border"
                              style={{
                                background: `radial-gradient(circle at 35% 30%, ${template.accentColor}55 0%, #000000 90%)`,
                                borderColor: `${template.accentColor}99`,
                                boxShadow: `0 4px 12px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.3)`
                              }}
                            >
                              <span className="text-base font-bold leading-none select-none" style={{ color: template.accentColor }}>
                                ✦
                              </span>
                              <span className="text-[7px] uppercase tracking-[0.2em] font-semibold mt-0.5" style={{ color: `${template.accentColor}ee` }}>
                                {template.sealText || (template.category === 'School' ? 'ENTER' : template.category === 'Birthday' ? 'PARTY' : template.category === 'Meeting' ? 'ACCESS' : 'OPEN')}
                              </span>
                            </div>
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-0.5 h-2.5" style={{ background: `linear-gradient(to top, ${template.accentColor}, transparent)` }} />
                            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0.5 h-2.5" style={{ background: `linear-gradient(to bottom, ${template.accentColor}, transparent)` }} />
                          </div>
                        </div>

                        {/* Bottom Subtext */}
                        <div className="pb-1">
                          <p className="font-sans tracking-tight text-white/70 text-[10px] tracking-[0.2em] uppercase">
                            {template.category === 'School' ? 'Class of 2026' : template.category === 'Meeting' ? 'Annual Summit 2026' : template.category === 'Birthday' ? 'Celebrate Life' : '14 · March · 2027'}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Template name overlay at bottom */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-14 pb-5 px-5">
                    <p className="font-sans tracking-tight text-white text-sm font-semibold text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                      {template.name}
                    </p>
                  </div>

                  {/* Badge */}
                  <div className="absolute top-5 right-5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm ${
                        template.badge === "Royal"
                          ? "bg-[#d4a853]/25 text-[#f0d78c] border border-[#d4a853]/40"
                          : "bg-white/15 text-white/80 border border-white/25"
                      }`}
                    >
                      {template.badge === "Royal" ? t('showcase.royal') : t('showcase.classic')}
                    </span>
                  </div>

                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/[0.12] to-transparent -translate-x-full animate-[blockShimmerComposited_3s_infinite]" />
                  </div>

                  {/* Interactive Hover / Tap Actions */}
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2.5 p-5 z-20 pointer-events-auto">
                    <span className="text-white font-bold text-base text-center mb-1 drop-shadow-md">
                      {template.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/create?template=${template.name.toLowerCase().replace(/\s+/g, '-')}`);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-light text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-primary/25 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
                      {language === 'ur' ? 'یہ کارڈ منتخب کریں' : 'Use This Template'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewAllClick) onViewAllClick();
                        else router.push("/templates");
                      }}
                      className="w-full py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {language === 'ur' ? 'ڈیمو دیکھیں' : 'Preview Demo'}
                    </button>
                  </div>
                </m.div>
              </m.div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-1 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                className="w-8 h-8 flex items-center justify-center rounded-full focus:outline-none"
                aria-label={`Go to template group ${i + 1}`}
              >
                <div className={`transition-all duration-300 rounded-full ${
                  i === currentIndex
                    ? "w-5 h-2 bg-primary"
                    : "w-2 h-2 bg-primary/30 hover:bg-primary/50"
                }`} />
              </button>
            ))}
          </div>

          {/* View All CTA */}
          <div className="flex justify-center mt-8">
            <button
              onClick={onViewAllClick}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary/10 border border-gold/25 text-primary font-semibold text-sm hover:bg-primary/20 hover:border-gold/40 transition-all duration-200 group"
            >
              {t('showcase.viewAll')}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
