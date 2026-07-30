"use client";

import { useRef, MouseEvent } from "react";
import { m } from "framer-motion";
import {
  Sparkles, Timer, MapPin, MessageCircleHeart, Share2,
  Music, Crown, Languages, Users
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";

// Custom gold-medallion icon holder for a luxury aesthetic
function Medallion({ icon: Icon, className = "" }: { icon: any; className?: string }) {
  return (
    <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border border-gold/30 bg-black/40 shadow-inner group-hover:border-gold/60 group-hover:shadow-gold/20 transition-all duration-500 ${className}`}>
      <div className="absolute inset-1 rounded-full border border-gold/10" />
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(212, 168, 83, 0.15)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <Icon className="h-5 w-5 text-gold group-hover:scale-110 transition-transform duration-300" />
    </div>
  );
}

// Custom interactive glassmorphic Bento Card with dynamic mouse-glow spotlight (GPU optimized)
function BentoCard({
  children,
  gridClass,
  glowColor = "rgba(212, 168, 83, 0.15)",
  delay = 0,
}: {
  children: React.ReactNode;
  gridClass: string;
  glowColor?: string;
  delay?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <m.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className={`group relative rounded-[2rem] border border-gold/10 bg-black/20 backdrop-blur-md overflow-hidden flex flex-col justify-between p-7 sm:p-8 transition-all duration-500 hover:border-gold/35 hover:-translate-y-1 shadow-md hover:shadow-2xl hover:shadow-gold/5 ${gridClass} transform-gpu will-change-transform`}
    >
      {/* Dynamic spotlight shadow trail using hardware-accelerated CSS variables */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x, -999px) var(--mouse-y, -999px), ${glowColor}, transparent 40%)`,
        }}
      />
      {children}
    </m.div>
  );
}

export function Features() {
  const { t, language } = useLanguage();

  return (
    <section id="features" className="py-24 sm:py-32 relative overflow-hidden bg-background">
      {/* Animated visualizer keyframe injected locally */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulseHeight {
          0% { transform: scaleY(0.15); }
          100% { transform: scaleY(0.85); }
        }
      `}} />

      {/* Decorative luxury backdrops */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-emerald-dark/10 to-background pointer-events-none" />
      
      {/* Delicate mandalas/grid motif */}
      <div className="absolute inset-0 opacity-[0.012] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="bento-pattern-v2" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="30" fill="none" stroke="#d4a853" strokeWidth="0.4" />
              <path d="M40 0 L40 80 M0 40 L80 40" stroke="#d4a853" strokeWidth="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bento-pattern-v2)" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <m.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/10 text-gold text-xs font-semibold tracking-wider uppercase mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t("features.badge")}
          </m.span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            {language === 'en' ? 'Everything You Need for the' : 'شادی کی بہترین تیاری کے لیے'}
            <br />
            <span className="gold-shimmer">{language === 'en' ? 'Perfect Digital Invitation' : 'ہر ضروری اور بہترین فیچر'}</span>
          </h2>
          <div className="mt-5 flex items-center justify-center gap-3">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-gold/50" />
            <div className="w-2 h-2 rounded-full bg-gold/60" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-gold/50" />
          </div>
          <p className="mt-5 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-center leading-relaxed">
            {language === 'en' ? 'From grand door-opening reveals to heartfelt guest wishes — every detail crafted for Pakistani weddings.' : 'شاہی گیٹ اوپننگ اینیمیشن سے لے کر مہمانوں کی دعاؤں اور مبارکباد تک، ہر چیز پاکستانی شادیوں کے مطابق تیار کردہ۔'}
          </p>
        </div>

        {/* Bespoke Custom Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)] items-stretch">
          
          {/* Card 1: Premium Animations (2x2 Hero) */}
          <BentoCard gridClass="md:col-span-2 md:row-span-2 bg-gradient-to-br from-emerald-dark/40 via-emerald-dark/10 to-background border-gold/20" glowColor="rgba(212, 168, 83, 0.22)" delay={0}>
            <div className="flex flex-col h-full justify-between gap-6">
              <div>
                <Medallion icon={Crown} />
                <h3 className="font-display font-bold text-2xl text-foreground mt-4 group-hover:text-gold transition-colors duration-300">
                  {t("features.item.8.title")}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mt-2.5">
                  {t("features.item.8.desc")}
                </p>
              </div>

              {/* Realistic 3D Arch Gates Reveal Simulation */}
              <div className="w-full h-44 rounded-2xl bg-black/40 border border-gold/10 relative overflow-hidden flex items-center justify-center [perspective:1000px] group/door">
                {/* Background image preview visible when gates open */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(212,168,83,0.1)_0%,transparent_80%)] opacity-0 group-hover/door:opacity-100 transition-opacity duration-1000">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIj48Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSIxIiBmaWxsPSIjZDRhODUzIiBvcGFjaXR5PSIwLjMiLz48L3N2Zz4=')] opacity-40" />
                  <span className="font-calligraphy text-2xl text-gold tracking-wide animate-pulse">
                    Amaan & Sofia
                  </span>
                  <span className="text-[9px] text-white/50 tracking-[0.25em] uppercase mt-2">
                    Save The Date
                  </span>
                </div>

                {/* Left Gate Panel */}
                <div className="absolute left-0 top-0 w-1/2 h-full origin-left transition-transform duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/door:[transform:rotateY(-110deg)] z-10 [transform-style:preserve-3d] border-r border-gold/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-dark to-[#043326] border-2 border-gold/25 rounded-l-2xl p-3 flex flex-col justify-between items-end [backface-visibility:hidden]">
                    <div className="absolute inset-1 rounded-l-xl border border-gold/5 pointer-events-none" />
                    <div className="w-1.5 h-12 bg-gold/40 rounded-full mt-14 mr-1 shadow-lg shadow-black/20" />
                  </div>
                </div>

                {/* Right Gate Panel */}
                <div className="absolute right-0 top-0 w-1/2 h-full origin-right transition-transform duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/door:[transform:rotateY(110deg)] z-10 [transform-style:preserve-3d] border-l border-gold/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-dark to-[#043326] border-2 border-gold/25 rounded-r-2xl p-3 flex flex-col justify-between items-start [backface-visibility:hidden]">
                    <div className="absolute inset-1 rounded-r-xl border border-gold/5 pointer-events-none" />
                    <div className="w-1.5 h-12 bg-gold/40 rounded-full mt-14 ml-1 shadow-lg shadow-black/20" />
                  </div>
                </div>

                {/* Golden Wax Seal Handle */}
                <div className="absolute w-12 h-12 rounded-full bg-gold border-2 border-gold/60 shadow-xl shadow-black/50 z-20 flex items-center justify-center group-hover/door:scale-0 group-hover/door:opacity-0 transition-all duration-700 pointer-events-none">
                  <Crown className="w-5 h-5 text-emerald-dark" />
                </div>

                <div className="absolute bottom-3 text-[9px] uppercase tracking-widest text-gold z-30 bg-black/60 px-3 py-1 rounded-full border border-gold/20 group-hover/door:opacity-0 transition-opacity duration-300 pointer-events-none">
                  Hover to Open
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Card 2: Live Countdown (2x1 Wide) */}
          <BentoCard gridClass="md:col-span-2 md:row-span-1" delay={0.08}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 h-full w-full">
              <div className="max-w-xs">
                <Medallion icon={Timer} />
                <h3 className="font-display font-bold text-lg text-foreground mt-4 group-hover:text-gold transition-colors duration-300">
                  {t("features.item.4.title")}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed mt-1">
                  {t("features.item.4.desc")}
                </p>
              </div>

              {/* Animated Countdown watch face */}
              <div className="flex items-center gap-3 bg-black/20 p-2.5 rounded-2xl border border-gold/5 self-stretch sm:self-auto justify-center">
                {["Days", "Hrs", "Mins"].map((label, i) => {
                  const val = [128, 14, 45][i];
                  return (
                    <div key={label} className="flex flex-col items-center w-14 h-14 rounded-xl border border-gold/15 bg-black/40 justify-center">
                      <span className="font-display text-sm font-bold text-gold leading-none">{val}</span>
                      <span className="text-[8px] text-white/40 uppercase mt-1 tracking-wider">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </BentoCard>

          {/* Card 3: Scratch to Reveal Date (1x2 Tall) */}
          <BentoCard gridClass="md:col-span-1 md:row-span-2" delay={0.16}>
            <div className="flex flex-col h-full justify-between gap-6">
              <div>
                <Medallion icon={Sparkles} />
                <h3 className="font-display font-bold text-lg text-foreground mt-4 group-hover:text-gold transition-colors duration-300">
                  {t("features.item.3.title")}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed mt-2">
                  {t("features.item.3.desc")}
                </p>
              </div>

              {/* Simulated Wedding envelope scratch card */}
              <div className="flex flex-col justify-between h-40 border border-gold/10 bg-black/30 rounded-2xl p-4 relative overflow-hidden group/scratch">
                <div className="text-center font-display text-[9px] uppercase tracking-widest text-white/30">Interactive Reveal</div>
                <div className="flex items-center justify-center flex-grow">
                  <div className="relative w-32 h-16 bg-gradient-to-br from-emerald-dark/60 to-emerald-dark/20 rounded-xl border border-gold/20 flex items-center justify-center overflow-hidden">
                    {/* revealed info */}
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] text-white/40 uppercase tracking-widest">Wedding Date</span>
                      <span className="font-display text-[10px] font-bold text-gold uppercase tracking-wider mt-1">
                        15 · MAR · 2027
                      </span>
                    </div>

                    {/* Shimmering foil layer that dissolves on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-300 via-neutral-100 to-neutral-400 opacity-95 transition-all duration-1000 ease-out group-hover/scratch:opacity-0 group-hover/scratch:scale-110 flex flex-col items-center justify-center text-emerald-dark p-1">
                      <div className="absolute inset-0.5 border border-emerald-dark/15 rounded-lg pointer-events-none" />
                      <Sparkles className="w-4.5 h-4.5 text-emerald-dark/80 mb-1" />
                      <span className="text-[8px] font-extrabold tracking-widest uppercase">Scratch Foil</span>
                    </div>
                  </div>
                </div>
                <div className="text-center text-[8px] text-gold/60 group-hover/scratch:text-gold transition-colors duration-300">
                  Hover to scratch foil
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Card 4: Guest Messaging & Inbox (1x1 Small) */}
          <BentoCard gridClass="md:col-span-1 md:row-span-1" delay={0.24}>
            <div className="flex flex-col h-full justify-between">
              <div>
                <Medallion icon={MessageCircleHeart} />
                <h3 className="font-display font-bold text-base text-foreground mt-4 group-hover:text-gold transition-colors duration-300">
                  {t("features.item.5.title")}
                </h3>
              </div>

              {/* Slide-up comment bubbles */}
              <div className="flex flex-col gap-1.5 w-full mt-4">
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/40 border border-white/5 transform transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="w-5 h-5 rounded-full bg-emerald text-[8px] font-bold flex items-center justify-center text-white">S</div>
                  <span className="text-[9px] text-white/70 truncate">"Shadi Mubarak!"</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/40 border border-white/5 transform transition-transform duration-300 group-hover:-translate-y-2 delay-75">
                  <div className="w-5 h-5 rounded-full bg-gold text-[8px] font-bold flex items-center justify-center text-emerald-dark">A</div>
                  <span className="text-[9px] text-white/70 truncate">"We are attending!"</span>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* Card 5: Background Music (1x1 Small) */}
          <BentoCard gridClass="md:col-span-1 md:row-span-1" delay={0.32}>
            <div className="flex flex-col h-full justify-between">
              <div>
                <Medallion icon={Music} />
                <h3 className="font-display font-bold text-base text-foreground mt-4 group-hover:text-gold transition-colors duration-300">
                  {t("features.item.6.title")}
                </h3>
              </div>

              {/* Bouncing audio wave visualizer */}
              <div className="flex items-end justify-center gap-1 h-9 w-full bg-black/30 rounded-xl p-2 mt-4">
                {[1, 2, 3, 4, 5, 6, 7].map((bar) => {
                  const delays = [0.1, 0.3, 0.5, 0.2, 0.4, 0.6, 0.3];
                  return (
                    <span
                      key={bar}
                      className="w-1 bg-gold/70 rounded-full origin-bottom"
                      style={{
                        height: "100%",
                        animation: `pulseHeight 1s ease-in-out infinite alternate`,
                        animationDelay: `${delays[bar - 1]}s`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </BentoCard>

          {/* Card 6: Venue with Maps (1x1 Small) */}
          <BentoCard gridClass="md:col-span-1 md:row-span-1" delay={0.4}>
            <div className="flex flex-col h-full justify-between">
              <div>
                <Medallion icon={MapPin} />
                <h3 className="font-display font-bold text-base text-foreground mt-4 group-hover:text-gold transition-colors duration-300">
                  {t("features.item.7.title")}
                </h3>
              </div>

              {/* Map pin reveal ribbon */}
              <div className="h-10 w-full border border-gold/10 bg-black/30 rounded-xl relative overflow-hidden flex items-center justify-center mt-4 group/map">
                <MapPin className="w-4 h-4 text-gold animate-bounce" />
                <span className="text-[9px] text-white/50 group-hover/map:text-gold transition-colors duration-300 ml-1.5 tracking-wide font-display">
                  Grand Regency Hall
                </span>
              </div>
            </div>
          </BentoCard>

          {/* Card 8: Multi-Language Support (1x1 Small) */}
          <BentoCard gridClass="md:col-span-1 md:row-span-1" delay={0.48}>
            <div className="flex flex-col h-full justify-between">
              <div>
                <Medallion icon={Languages} />
                <h3 className="font-display font-bold text-base text-foreground mt-4 group-hover:text-gold transition-colors duration-300">
                  {t("features.item.13.title")}
                </h3>
              </div>

              {/* Rotating Translation elements */}
              <div className="flex items-center justify-center gap-2.5 w-full border border-gold/5 bg-black/40 rounded-xl p-2 mt-4">
                <span className="text-[9px] text-white/50">English</span>
                <span className="text-gold/40 text-[8px]">✦</span>
                <span className="text-[10px] font-amiri text-gold">اردو</span>
                <span className="text-gold/40 text-[8px]">✦</span>
                <span className="text-[9px] text-white/50">العربية</span>
              </div>
            </div>
          </BentoCard>

          {/* Card 7: Unlimited Sharing (2x1 Wide) */}
          <BentoCard gridClass="md:col-span-2 md:row-span-1" delay={0.56}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 h-full w-full">
              <div className="max-w-xs">
                <Medallion icon={Share2} />
                <h3 className="font-display font-bold text-lg text-foreground mt-4 group-hover:text-gold transition-colors duration-300">
                  {t("features.item.1.title")}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed mt-1">
                  {t("features.item.1.desc")}
                </p>
              </div>

              {/* Share link wrapper */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/50 border border-gold/10 w-full sm:w-64">
                <span className="text-[9px] text-white/50 truncate font-mono pr-2">
                  shaadilink.com/inv/amaan-sofia
                </span>
                <span className="text-[8px] uppercase tracking-wider text-gold font-bold px-2.5 py-1 rounded bg-gold/10 group-hover:bg-gold/20 transition-all cursor-pointer">
                  Copy
                </span>
              </div>
            </div>
          </BentoCard>

          {/* Card 9: Bulk CSV Guest Import (2x1 Wide) */}
          <BentoCard gridClass="md:col-span-2 md:row-span-1" delay={0.64}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 h-full w-full">
              <div className="max-w-xs">
                <Medallion icon={Users} />
                <h3 className="font-display font-bold text-lg text-foreground mt-4 group-hover:text-gold transition-colors duration-300">
                  {language === 'en' ? 'Bulk CSV Guest Import' : 'بلک مہمانوں کی فہرست'}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed mt-1">
                  {language === 'en' ? 'Upload a CSV file to instantly generate personalized guest links for your entire list. Supports Names, Seats, and Events.' : 'پوری مہمانوں کی فہرست کے لیے ذاتی نوعیت کے لنکس بنانے کے لیے CSV اپ لوڈ کریں۔'}
                </p>
              </div>

              {/* CSV Upload simulation */}
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-black/50 border border-gold/10 w-full sm:w-48 group-hover:border-gold/30 transition-colors">
                <div className="flex items-center gap-2 text-[10px] text-white/70 mb-2">
                  <div className="w-4 h-4 bg-emerald text-white rounded flex items-center justify-center font-bold text-[8px]">CSV</div>
                  <span>guests_list.csv</span>
                </div>
                <div className="w-full bg-gold/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gold h-full w-2/3 group-hover:w-full transition-all duration-1000 ease-out" />
                </div>
                <span className="text-[8px] text-gold/60 mt-1.5 uppercase tracking-wider">Generating Links...</span>
              </div>
            </div>
          </BentoCard>

        </div>

        {/* Bottom CTA */}
        <m.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <p className="text-muted-foreground text-sm sm:text-base">
            {language === 'en' ? 'Impressed by the features?' : 'کیا آپ خصوصیات سے متاثر ہوئے ہیں؟'}
          </p>
          <a
            href="#pricing"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-gold-light underline underline-offset-4 decoration-gold/30 transition-colors duration-200"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {language === 'en' ? 'See pricing →' : 'قیمتیں دیکھیں ←'}
          </a>
        </m.div>
      </div>
    </section>
  );
}
