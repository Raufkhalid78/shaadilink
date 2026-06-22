"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles, Shield, Star, Heart, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── Animation Variants ─── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.4 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" as const },
  },
};

const wordContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0 },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

/* ─── Animated Gold Particle ─── */

interface ParticleData {
  id: number;
  size: number;
  left: number;
  delay: number;
  duration: number;
  opacity: number;
  driftX: number;
}

function GoldParticle({ size, left, delay, duration, opacity, driftX }: ParticleData) {
  return (
    <motion.div
      className="absolute rounded-full bg-gold pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${left}%`,
        bottom: "-5%",
      }}
      animate={{
        y: [0, -1200, 0],
        x: [0, driftX, -driftX, driftX, 0],
        opacity: [0, opacity, opacity, opacity * 0.6, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

/* ─── Islamic Geometric Pattern ─── */

function IslamicPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.04]">
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        <defs>
          <pattern
            id="islamic-pattern-hero"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M50 5 L61.8 21.8 L81.8 18.2 L70 35 L81.8 51.8 L61.8 48.2 L50 65 L38.2 48.2 L18.2 51.8 L30 35 L18.2 18.2 L38.2 21.8 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gold"
            />
            <path
              d="M50 20 L65 35 L50 50 L35 35 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.3"
              className="text-gold"
            />
            <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.2" className="text-gold" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.2" className="text-gold" />
            <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-gold" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-pattern-hero)" />
      </svg>
    </div>
  );
}

/* ─── Decorative Corner Frame ─── */

function CornerFrame({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const classes: Record<string, string> = {
    tl: "top-0 left-0 border-l-2 border-t-2 rounded-tl-sm",
    tr: "top-0 right-0 border-r-2 border-t-2 rounded-tr-sm",
    bl: "bottom-0 left-0 border-l-2 border-b-2 rounded-bl-sm",
    br: "bottom-0 right-0 border-r-2 border-b-2 rounded-br-sm",
  };

  return (
    <div
      className={`absolute border-gold/25 w-16 h-16 sm:w-24 sm:h-24 ${classes[position]}`}
    />
  );
}

/* ─── Staggered Headline Word ─── */

function AnimatedWord({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.span variants={wordVariants} className={className}>
      {children}
    </motion.span>
  );
}

/* ─── Floating Invitation Card Mockup ─── */

function InvitationCardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 60, rotateY: -15 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ duration: 1.2, delay: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
      className="relative mt-10 lg:mt-0 w-full flex justify-center lg:w-auto lg:block"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative scale-90 sm:scale-100 transform-origin-top"
      >
        {/* Main Card */}
        <div className="relative w-[320px] h-[440px] rounded-2xl overflow-hidden shadow-2xl shadow-gold/20 border border-gold/20"
          style={{
            background: "linear-gradient(145deg, #0f1a16 0%, #152822 30%, #0a1210 60%, #1a332a 100%)",
          }}
        >
          {/* Shimmer border animation */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(212,168,83,0.15), transparent)",
                backgroundSize: "200% 100%",
                animation: "shimmer 4s ease-in-out infinite",
              }}
            />
          </div>

          {/* Inner decorative border */}
          <div className="absolute inset-4 rounded-xl border border-gold/20 pointer-events-none" />

          {/* Corner accents */}
          <div className="absolute top-5 left-5 w-6 h-6">
            <div className="absolute top-0 left-0 w-full h-px bg-gold/50" />
            <div className="absolute top-0 left-0 h-full w-px bg-gold/50" />
          </div>
          <div className="absolute top-5 right-5 w-6 h-6">
            <div className="absolute top-0 right-0 w-full h-px bg-gold/50" />
            <div className="absolute top-0 right-0 h-full w-px bg-gold/50" />
          </div>
          <div className="absolute bottom-5 left-5 w-6 h-6">
            <div className="absolute bottom-0 left-0 w-full h-px bg-gold/50" />
            <div className="absolute bottom-0 left-0 h-full w-px bg-gold/50" />
          </div>
          <div className="absolute bottom-5 right-5 w-6 h-6">
            <div className="absolute bottom-0 right-0 w-full h-px bg-gold/50" />
            <div className="absolute bottom-0 right-0 h-full w-px bg-gold/50" />
          </div>

          {/* Card Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
            {/* Bismillah */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="font-calligraphy text-gold/40 text-sm mb-4"
            >
              بِسْمِ اللَّهِ
            </motion.p>

            {/* Decorative line */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-px bg-gradient-to-r from-transparent to-gold/50" />
              <Sparkles className="w-3 h-3 text-gold/60" />
              <div className="w-8 h-px bg-gradient-to-l from-transparent to-gold/50" />
            </div>

            {/* Header */}
            <p className="text-gold/60 text-[10px] tracking-[0.3em] uppercase font-semibold mb-2">
              Wedding Invitation
            </p>

            {/* Names */}
            <p className="font-calligraphy text-[#e0ccaa] text-3xl font-bold">
              Aisha
            </p>
            <div className="flex items-center gap-3 my-2">
              <div className="w-10 h-px bg-gradient-to-r from-transparent to-gold/40" />
              <Heart className="w-3.5 h-3.5 text-gold/50 fill-gold/30" />
              <div className="w-10 h-px bg-gradient-to-l from-transparent to-gold/40" />
            </div>
            <p className="font-calligraphy text-[#e0ccaa] text-3xl font-bold">
              Ahmad
            </p>

            {/* Decorative divider */}
            <div className="w-16 h-px mt-4 mb-3" style={{ background: "linear-gradient(90deg, transparent, rgba(180,145,77,0.4), transparent)" }} />

            {/* Date */}
            <p className="text-[#c9a96e] font-display text-xs tracking-[0.15em] uppercase">
              March 15, 2027
            </p>

            {/* Venue */}
            <p className="text-[#8f7c56] font-display text-[10px] tracking-wider uppercase mt-1">
              The Grand Pearl Hall · Lahore
            </p>

            {/* Events preview */}
            <div className="mt-4 space-y-1">
              {["Mehndi", "Baraat", "Walima"].map((event, i) => (
                <motion.div
                  key={event}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2 + i * 0.2 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-1 h-1 rounded-full bg-gold/40" />
                  <span className="text-[9px] text-[#8f7c56] tracking-wider uppercase">{event}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Floating sparkle decorations */}
          <motion.div
            className="absolute top-8 right-8 z-20"
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-3 h-3 text-gold/40" />
          </motion.div>
          <motion.div
            className="absolute bottom-12 left-8 z-20"
            animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.3, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <Sparkles className="w-2.5 h-2.5 text-gold/30" />
          </motion.div>
        </div>

        {/* Glow effect underneath */}
        <div className="absolute -bottom-6 left-8 right-8 h-12 bg-gold/15 rounded-full blur-2xl" />

        {/* Secondary small card (behind, offset) */}
        <div
          className="absolute -bottom-4 -right-4 w-[300px] h-[420px] rounded-2xl border border-gold/10 -z-10"
          style={{
            background: "linear-gradient(145deg, #1a0a0e 0%, #2a1018 30%, #120810 100%)",
          }}
        />
        <div className="absolute -bottom-6 -right-6 left-4 right-4 h-12 bg-red-900/10 rounded-full blur-2xl" />
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Hero Component ─── */

interface HeroProps {
  onViewTemplates?: () => void;
  onGetStarted?: () => void;
}

export function Hero({ onViewTemplates, onGetStarted }: HeroProps) {
  const particles = useMemo<ParticleData[]>(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        size: 2 + ((i * 7 + 3) % 5) * 0.8,
        left: 5 + ((i * 13 + 7) % 90),
        delay: (i * 0.6) % 10,
        duration: 8 + ((i * 11 + 2) % 12),
        opacity: 0.15 + ((i * 3 + 1) % 4) * 0.1,
        driftX: 10 + ((i * 9 + 5) % 30),
      })),
    []
  );

  const line1Words = ["Create", "Your", "Dream"];
  const line2Words = ["Wedding", "Invitation"];
  const appTagline = "Pakistan's Premier Digital Wedding Invitation Platform";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-emerald-dark">
      {/* Multi-layered gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-dark via-emerald-dark to-emerald" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(15,107,78,0.4) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(180,145,77,0.08) 0%, transparent 50%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(170deg, rgba(15,26,22,1) 0%, rgba(15,107,78,0.3) 40%, rgba(15,26,22,0.8) 70%, rgba(15,26,22,1) 100%)",
        }}
      />

      {/* Animated radial glow in center */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(180,145,77,0.08) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Islamic geometric pattern overlay */}
      <IslamicPattern />

      {/* Animated gold particles */}
      {particles.map((p) => (
        <GoldParticle key={p.id} {...p} />
      ))}

      {/* Decorative gold corner frames */}
      <CornerFrame position="tl" />
      <CornerFrame position="tr" />
      <CornerFrame position="bl" />
      <CornerFrame position="br" />

      {/* Main content - two column layout on desktop */}
      <div className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left: Text content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 text-center lg:text-left"
          >
            {/* Bismillah */}
            <motion.div variants={itemVariants} className="mb-4">
              <span className="font-calligraphy text-gold/50 text-2xl sm:text-3xl tracking-wider">
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
              </span>
            </motion.div>

            {/* App Purpose Badge — ShaadiLink named explicitly for search engines & OAuth review */}
            <motion.div variants={itemVariants} className="mb-4">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-emerald/10 border border-emerald/30 text-emerald"
                aria-label="ShaadiLink — Pakistan's number one digital wedding invitation platform"
              >
                <Sparkles className="w-3 h-3" />
                <span>ShaadiLink</span>
                <span className="text-white/30">·</span>
                <span>{appTagline}</span>
              </span>
            </motion.div>

            {/* Decorative divider with subtle pulse */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center lg:justify-start gap-4 mb-8"
            >
              <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-gold/50" />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-5 w-5 text-gold" />
              </motion.div>
              <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-gold/50" />
            </motion.div>

            {/* Headline with staggered word reveal */}
            <motion.h1
              variants={itemVariants}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
            >
              {/* Line 1: "Create Your Dream" */}
              <motion.span
                variants={wordContainerVariants}
                className="block text-white"
              >
                {line1Words.map((word) => (
                  <AnimatedWord key={word} className="inline-block mr-[0.3em]">
                    {word}
                  </AnimatedWord>
                ))}
              </motion.span>

              {/* Line 2: "Wedding Invitation" with gold shimmer */}
              <motion.span
                variants={wordContainerVariants}
                className="block gold-shimmer-strong mt-2"
              >
                {line2Words.map((word) => (
                  <AnimatedWord key={word} className="inline-block mr-[0.3em]">
                    {word}
                  </AnimatedWord>
                ))}
              </motion.span>
            </motion.h1>

            {/* Subtitle — explicitly describes ShaadiLink's purpose for OAuth reviewers */}
            <motion.div variants={itemVariants} className="mt-6 sm:mt-8 max-w-2xl mx-auto lg:mx-0 text-left">
              <h3 className="inline-block px-3 py-1 rounded bg-gold/20 text-gold text-[10px] font-bold tracking-widest uppercase mb-3 border border-gold/30">
                App Purpose
              </h3>
              <p className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed">
                <strong className="text-white font-semibold">ShaadiLink</strong> is an online platform that allows couples to create, customize, publish, and manage digital wedding invitations. Guests can view event details, interact with cinematic 3D reveals, and submit their RSVPs directly through the web application.
              </p>
            </motion.div>

            {/* Google OAuth Purpose Notice (required for Google Verification) */}
            <motion.p
              variants={itemVariants}
              className="mt-4 text-xs text-white/60 max-w-2xl mx-auto lg:mx-0 leading-relaxed border-l border-gold/40 pl-3 italic"
            >
              🔐 <strong>Sign-In Purpose:</strong> We use Google Sign-In exclusively to authenticate your identity, giving you secure access to your private dashboard to create, edit, and manage your digital wedding invitations and track RSVP lists.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Button
                size="lg"
                onClick={onGetStarted}
                className="bg-gold hover:bg-gold-light text-emerald-dark font-bold text-base px-8 h-12 pulse-glow border-none shadow-lg shadow-gold/20 hover:shadow-gold/40 transition-all duration-300"
              >
                Create My Invitation
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onViewTemplates}
                className="border-gold/40 text-gold hover:bg-gold/10 hover:text-gold-light font-medium text-base px-8 h-12 bg-transparent"
              >
                View Templates
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={itemVariants}
              className="mt-6 flex flex-col items-center lg:items-start gap-3"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white/50">🎉 New &amp; Growing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white/50">❤️ Crafted with Love</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white/50">🇵🇰 Made in Pakistan</span>
                </div>
              </div>
            </motion.div>

          </motion.div>

          {/* Right: Floating invitation card mockup */}
          <InvitationCardMockup />
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <a
          href="#features"
          className="flex flex-col items-center gap-2 text-white/40 hover:text-white/60 transition-colors"
          aria-label="Scroll down"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
          <ChevronDown className="h-5 w-5" />
        </a>
      </motion.div>
    </section>
  );
}
