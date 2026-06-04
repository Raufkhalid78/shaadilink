"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Template {
  name: string;
  badge: "Classic" | "Royal";
  gradient: string;
  pattern: string;
  accentColor: string;
}

const templates: Template[] = [
  {
    name: "Emerald Noir",
    badge: "Classic",
    gradient: "from-[#0a1f1a] via-[#0f2e24] to-[#071510]",
    pattern: "radial-gradient(circle at 30% 40%, rgba(15,107,78,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(180,145,77,0.1) 0%, transparent 40%)",
    accentColor: "#0f6b4e",
  },
  {
    name: "Crimson Royale",
    badge: "Royal",
    gradient: "from-[#1a0a0a] via-[#2a0f0f] to-[#150808]",
    pattern: "radial-gradient(circle at 50% 30%, rgba(180,40,40,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(180,145,77,0.15) 0%, transparent 40%)",
    accentColor: "#b42828",
  },
  {
    name: "Rose Gold Blush",
    badge: "Classic",
    gradient: "from-[#1a1215] via-[#2a1a1e] to-[#150e11]",
    pattern: "radial-gradient(circle at 40% 50%, rgba(212,168,83,0.15) 0%, transparent 50%), radial-gradient(circle at 60% 30%, rgba(200,130,130,0.12) 0%, transparent 40%)",
    accentColor: "#d4a853",
  },
  {
    name: "Mughal Emerald",
    badge: "Royal",
    gradient: "from-[#071a14] via-[#0d2e22] to-[#0a1f18]",
    pattern: "radial-gradient(circle at 25% 25%, rgba(180,145,77,0.2) 0%, transparent 40%), radial-gradient(circle at 75% 75%, rgba(15,107,78,0.25) 0%, transparent 45%), repeating-conic-gradient(from 0deg at 50% 50%, rgba(180,145,77,0.03) 0deg 30deg, transparent 30deg 60deg)",
    accentColor: "#0f6b4e",
  },
  {
    name: "Midnight Royal",
    badge: "Royal",
    gradient: "from-[#080a1a] via-[#0f1228] to-[#0a0c18]",
    pattern: "radial-gradient(circle at 60% 40%, rgba(80,80,180,0.15) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(180,145,77,0.12) 0%, transparent 40%)",
    accentColor: "#5050b4",
  },
  {
    name: "Golden Nawab",
    badge: "Royal",
    gradient: "from-[#1a0f08] via-[#281a0e] to-[#150c06]",
    pattern: "radial-gradient(circle at 50% 50%, rgba(180,145,77,0.2) 0%, transparent 50%), radial-gradient(circle at 20% 30%, rgba(140,30,30,0.15) 0%, transparent 40%)",
    accentColor: "#b4914d",
  },
];

export function TemplateShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const CARD_WIDTH = 280;
  const CARD_GAP = 20;
  const VISIBLE_CARDS = typeof window !== "undefined" && window.innerWidth >= 768 ? 3 : 1;

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

    const handleScroll = () => {
      setCanScrollLeft(el.scrollLeft > 10);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);

      const newIndex = Math.round(el.scrollLeft / (CARD_WIDTH + CARD_GAP));
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex <= maxIndex) {
        setCurrentIndex(newIndex);
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => el.removeEventListener("scroll", handleScroll);
  }, [currentIndex, maxIndex]);

  return (
    <section className="py-20 sm:py-28 bg-background relative overflow-hidden">
      {/* Subtle gold geometric pattern background */}
      <div className="absolute inset-0 opacity-[0.02]">
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
              <rect x="10" y="10" width="100" height="100" rx="4" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
              <line x1="60" y1="10" x2="60" y2="110" stroke="currentColor" strokeWidth="0.3" className="text-gold" />
              <line x1="10" y1="60" x2="110" y2="60" stroke="currentColor" strokeWidth="0.3" className="text-gold" />
              <circle cx="60" cy="60" r="25" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-gold" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#template-pattern)" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14 reveal-on-scroll">
          <span className="inline-block font-calligraphy text-gold text-lg mb-3">
            ✦ Our Templates ✦
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Beautiful Templates for Every Style
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base sm:text-lg">
            From classic elegance to royal luxury — find the perfect design for your celebration.
          </p>
          {/* Gold divider */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60" />
            <div className="w-2 h-2 rounded-full bg-gold/60" />
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
                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 items-center justify-center rounded-full bg-background border border-gold/30 shadow-lg shadow-gold/10 text-gold hover:bg-gold/10 hover:border-gold/50 transition-all duration-300"
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
                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 items-center justify-center rounded-full bg-background border border-gold/30 shadow-lg shadow-gold/10 text-gold hover:bg-gold/10 hover:border-gold/50 transition-all duration-300"
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
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-[280px] sm:w-[300px] aspect-[3/4] rounded-2xl overflow-hidden border border-gold/20 hover:border-gold/40 hover:shadow-xl hover:shadow-gold/10 transition-all duration-300 cursor-pointer group"
                >
                  {/* Template Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${template.gradient}`}
                    style={{ backgroundImage: template.pattern }}
                  />

                  {/* Decorative border pattern */}
                  <div className="absolute inset-3 rounded-xl border border-white/[0.06] pointer-events-none" />

                  {/* Gold corner accents */}
                  <div className="absolute top-4 left-4 w-4 h-4">
                    <div className="absolute top-0 left-0 w-full h-px bg-gold/40" />
                    <div className="absolute top-0 left-0 h-full w-px bg-gold/40" />
                  </div>
                  <div className="absolute top-4 right-4 w-4 h-4">
                    <div className="absolute top-0 right-0 w-full h-px bg-gold/40" />
                    <div className="absolute top-0 right-0 h-full w-px bg-gold/40" />
                  </div>
                  <div className="absolute bottom-4 left-4 w-4 h-4">
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gold/40" />
                    <div className="absolute bottom-0 left-0 h-full w-px bg-gold/40" />
                  </div>
                  <div className="absolute bottom-4 right-4 w-4 h-4">
                    <div className="absolute bottom-0 right-0 w-full h-px bg-gold/40" />
                    <div className="absolute bottom-0 right-0 h-full w-px bg-gold/40" />
                  </div>

                  {/* Template content simulation */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                    {/* Small decorative element */}
                    <div className="w-8 h-px mb-4" style={{ backgroundColor: template.accentColor, opacity: 0.5 }} />

                    {/* Simulated names */}
                    <p className="font-calligraphy text-white/90 text-2xl font-bold mb-1">
                      Aisha
                    </p>
                    <div className="flex items-center gap-2 my-2">
                      <div className="w-6 h-px bg-gold/30" />
                      <div className="w-1.5 h-1.5 rotate-45 border border-gold/40" />
                      <div className="w-6 h-px bg-gold/30" />
                    </div>
                    <p className="font-calligraphy text-white/90 text-2xl font-bold mt-1">
                      Ahmad
                    </p>

                    {/* Simulated date */}
                    <p className="font-display text-white/40 text-[10px] tracking-[0.25em] uppercase mt-4">
                      14 · February · 2026
                    </p>

                    {/* Simulated venue */}
                    <p className="font-display text-gold/40 text-[9px] tracking-[0.2em] uppercase mt-2">
                      The Grand Palace · Lahore
                    </p>

                    <div className="w-8 h-px mt-4" style={{ backgroundColor: template.accentColor, opacity: 0.5 }} />
                  </div>

                  {/* Template name overlay at bottom */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent pt-12 pb-5 px-5">
                    <p className="font-display text-white text-sm font-semibold text-center">
                      {template.name}
                    </p>
                  </div>

                  {/* Badge */}
                  <div className="absolute top-5 right-5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        template.badge === "Royal"
                          ? "bg-gold/20 text-gold border border-gold/30"
                          : "bg-white/10 text-white/70 border border-white/20"
                      }`}
                    >
                      {template.badge}
                    </span>
                  </div>

                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/[0.04] to-transparent animate-[shimmer_3s_ease-in-out_infinite]" />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === currentIndex
                    ? "w-6 h-2 bg-gold"
                    : "w-2 h-2 bg-gold/30 hover:bg-gold/50"
                }`}
                aria-label={`Go to template group ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
