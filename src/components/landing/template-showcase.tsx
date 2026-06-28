import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

interface Template {
  name: string;
  badge: "Classic" | "Royal";
  gradient: string;
  pattern: string;
  accentColor: string;
  accentGlow: string;
}

const templates: Template[] = [
  {
    name: "Emerald Noir",
    badge: "Classic",
    gradient: "from-[#0f1a16] via-[#152822] to-[#0a1210]",
    pattern: "radial-gradient(circle at 30% 40%, rgba(15,107,78,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(180,145,77,0.15) 0%, transparent 40%)",
    accentColor: "#d4a853",
    accentGlow: "rgba(212,168,83,0.15)",
  },
  {
    name: "Crimson Royale",
    badge: "Classic",
    gradient: "from-[#1a0a0e] via-[#2a1018] to-[#120810]",
    pattern: "radial-gradient(circle at 50% 30%, rgba(180,40,40,0.25) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(180,145,77,0.2) 0%, transparent 40%)",
    accentColor: "#dc2626",
    accentGlow: "rgba(220,38,38,0.15)",
  },
  {
    name: "Majestic Love",
    badge: "Classic",
    gradient: "from-[#1a1408] via-[#2a2010] to-[#12100a]",
    pattern: "radial-gradient(circle at 40% 50%, rgba(245,158,11,0.2) 0%, transparent 50%)",
    accentColor: "#f59e0b",
    accentGlow: "rgba(245,158,11,0.12)",
  },
  {
    name: "Mughal Emerald",
    badge: "Classic",
    gradient: "from-[#0f1a16] via-[#152822] to-[#0a1210]",
    pattern: "radial-gradient(circle at 25% 25%, rgba(180,145,77,0.25) 0%, transparent 40%), radial-gradient(circle at 75% 75%, rgba(15,107,78,0.3) 0%, transparent 45%)",
    accentColor: "#d4a853",
    accentGlow: "rgba(212,168,83,0.15)",
  },
  {
    name: "Royal Imperial",
    badge: "Royal",
    gradient: "from-[#1a100a] via-[#2a1a10] to-[#120c08]",
    pattern: "radial-gradient(circle at 60% 40%, rgba(245,158,11,0.2) 0%, transparent 50%)",
    accentColor: "#f59e0b",
    accentGlow: "rgba(245,158,11,0.15)",
  },
  {
    name: "Royal Elegance",
    badge: "Royal",
    gradient: "from-[#1a080e] via-[#2a1018] to-[#12060a]",
    pattern: "radial-gradient(circle at 50% 50%, rgba(244,63,94,0.25) 0%, transparent 50%)",
    accentColor: "#f43f5e",
    accentGlow: "rgba(244,63,94,0.15)",
  },
  {
    name: "Watercolor Peach",
    badge: "Classic",
    gradient: "from-[#1a100c] via-[#2a1a15] to-[#120b08]",
    pattern: "radial-gradient(circle at 30% 40%, rgba(249,115,22,0.2) 0%, transparent 50%)",
    accentColor: "#f97316",
    accentGlow: "rgba(249,115,22,0.15)",
  },
  {
    name: "Geometric Gold",
    badge: "Royal",
    gradient: "from-[#111827] via-[#1e293b] to-[#0f172a]",
    pattern: "radial-gradient(circle at 50% 50%, rgba(245,158,11,0.2) 0%, transparent 50%)",
    accentColor: "#f59e0b",
    accentGlow: "rgba(245,158,11,0.15)",
  },
  {
    name: "Dark Velvet",
    badge: "Royal",
    gradient: "from-[#020617] via-[#1e293b] to-[#0f172a]",
    pattern: "radial-gradient(circle at 40% 60%, rgba(139,92,246,0.2) 0%, transparent 50%)",
    accentColor: "#8b5cf6",
    accentGlow: "rgba(139,92,246,0.15)",
  },
  {
    name: "Pastel Floral",
    badge: "Classic",
    gradient: "from-[#1a1018] via-[#2a1a2a] to-[#120b12]",
    pattern: "radial-gradient(circle at 60% 30%, rgba(244,114,182,0.2) 0%, transparent 50%)",
    accentColor: "#f472b6",
    accentGlow: "rgba(244,114,182,0.15)",
  },
  {
    name: "Minimal White",
    badge: "Classic",
    gradient: "from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]",
    pattern: "radial-gradient(circle at 50% 50%, rgba(148,163,184,0.2) 0%, transparent 50%)",
    accentColor: "#94a3b8",
    accentGlow: "rgba(148,163,184,0.15)",
  },
];

export function TemplateShowcase({ onViewAllClick }: { onViewAllClick?: () => void }) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const CARD_WIDTH = 280;
  const CARD_GAP = 20;

  const maxIndex = Math.max(0, templates.length - 3);

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
                className="text-gold"
              />
              <circle cx="60" cy="60" r="25" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-gold" />
              <circle cx="60" cy="60" r="10" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-gold" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#template-pattern)" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14 reveal-on-scroll">
          <span className="inline-block font-calligraphy text-gold text-lg mb-3">
            {t('showcase.badge')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            {t('showcase.title')}
          </h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto text-base sm:text-lg text-center">
            {t('showcase.subtitle')}
          </p>
          {/* Gold divider */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60" />
            <div className="w-2 h-2 rounded-full bg-gold/70" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/60" />
          </div>
        </div>

        {/* Gallery Container */}
        <div className="relative">
          {/* Left Arrow */}
          <AnimatePresence>
            {canScrollLeft && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onClick={handlePrev}
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 items-center justify-center rounded-full bg-card/95 backdrop-blur-sm border border-gold/30 shadow-lg shadow-black/30 text-gold hover:bg-gold/10 hover:border-gold/50 transition-all duration-300"
                aria-label="Previous templates"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Right Arrow */}
          <AnimatePresence>
            {canScrollRight && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={handleNext}
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 items-center justify-center rounded-full bg-card/95 backdrop-blur-sm border border-gold/30 shadow-lg shadow-black/30 text-gold hover:bg-gold/10 hover:border-gold/50 transition-all duration-300"
                aria-label="Next templates"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Scrolling Container */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {templates.map((template, index) => (
              <motion.div
                key={template.name}
                className="flex-shrink-0 snap-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-[280px] sm:w-[300px] aspect-[3/4] rounded-2xl overflow-hidden border border-gold/20 hover:border-gold/50 hover:shadow-2xl hover:shadow-gold/10 transition-all duration-300 cursor-pointer group"
                >
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

                  {/* Decorative border pattern */}
                  <div className="absolute inset-3 rounded-xl border border-white/[0.08] pointer-events-none" />

                  {/* Gold corner accents */}
                  <div className="absolute top-4 left-4 w-5 h-5">
                    <div className="absolute top-0 left-0 w-full h-px bg-gold/50" />
                    <div className="absolute top-0 left-0 h-full w-px bg-gold/50" />
                  </div>
                  <div className="absolute top-4 right-4 w-5 h-5">
                    <div className="absolute top-0 right-0 w-full h-px bg-gold/50" />
                    <div className="absolute top-0 right-0 h-full w-px bg-gold/50" />
                  </div>
                  <div className="absolute bottom-4 left-4 w-5 h-5">
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gold/50" />
                    <div className="absolute bottom-0 left-0 h-full w-px bg-gold/50" />
                  </div>
                  <div className="absolute bottom-4 right-4 w-5 h-5">
                    <div className="absolute bottom-0 right-0 w-full h-px bg-gold/50" />
                    <div className="absolute bottom-0 right-0 h-full w-px bg-gold/50" />
                  </div>

                  {/* Template content simulation */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    {/* Decorative top line */}
                    <div className="w-10 h-px mb-5" style={{ backgroundColor: template.accentColor, opacity: 0.6 }} />

                    {/* Simulated names - high contrast */}
                    <p className="font-calligraphy text-[#f0e6d3] text-2xl font-bold mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                      Aisha
                    </p>
                    <div className="flex items-center gap-2 my-2">
                      <div className="w-8 h-px bg-gradient-to-r from-transparent to-gold/50" />
                      <div className="w-2 h-2 rotate-45 border border-gold/60" />
                      <div className="w-8 h-px bg-gradient-to-l from-transparent to-gold/50" />
                    </div>
                    <p className="font-calligraphy text-[#f0e6d3] text-2xl font-bold mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                      Ahmad
                    </p>

                    {/* Simulated date - improved contrast */}
                    <p className="font-display text-white/60 text-[10px] tracking-[0.25em] uppercase mt-5">
                      14 · March · 2027
                    </p>

                    {/* Simulated venue - improved contrast */}
                    <p className="font-display text-[#d4a853]/70 text-[9px] tracking-[0.2em] uppercase mt-2">
                      The Grand Palace · Lahore
                    </p>

                    {/* Decorative bottom line */}
                    <div className="w-10 h-px mt-5" style={{ backgroundColor: template.accentColor, opacity: 0.6 }} />
                  </div>

                  {/* Template name overlay at bottom */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-14 pb-5 px-5">
                    <p className="font-display text-white text-sm font-semibold text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
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
                </motion.div>
              </motion.div>
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
                    ? "w-5 h-2 bg-gold"
                    : "w-2 h-2 bg-gold/30 hover:bg-gold/50"
                }`} />
              </button>
            ))}
          </div>

          {/* View All CTA */}
          <div className="flex justify-center mt-8">
            <button
              onClick={onViewAllClick}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gold/10 border border-gold/25 text-gold font-semibold text-sm hover:bg-gold/20 hover:border-gold/40 transition-all duration-200 group"
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
