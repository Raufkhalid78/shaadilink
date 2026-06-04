"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Sparkles, Shield, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── Animation Variants ─── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.5 },
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
    transition: { staggerChildren: 0.12, delayChildren: 0 },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

/* ─── Animated Gold Particle ─── */

interface ParticleData {
  id: number;
  size: number;
  left: number; // percentage
  delay: number; // seconds
  duration: number; // seconds
  opacity: number;
  driftX: number; // px for horizontal sway
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
            {/* 8-pointed star base */}
            <path
              d="M50 5 L61.8 21.8 L81.8 18.2 L70 35 L81.8 51.8 L61.8 48.2 L50 65 L38.2 48.2 L18.2 51.8 L30 35 L18.2 18.2 L38.2 21.8 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gold"
            />
            {/* Inner diamond */}
            <path
              d="M50 20 L65 35 L50 50 L35 35 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.3"
              className="text-gold"
            />
            {/* Connecting lines */}
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

/* ─── Main Hero Component ─── */

interface HeroProps {
  onViewTemplates?: () => void;
  onGetStarted?: () => void;
}

export function Hero({ onViewTemplates, onGetStarted }: HeroProps) {
  // Generate particle data with deterministic seeded values to avoid hydration mismatch
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

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-emerald-dark">
      {/* ── Multi-layered gradient background ── */}
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

      {/* ── Animated radial glow in center ── */}
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

      {/* ── Islamic geometric pattern overlay ── */}
      <IslamicPattern />

      {/* ── Animated gold particles ── */}
      {particles.map((p) => (
        <GoldParticle key={p.id} {...p} />
      ))}

      {/* ── Decorative gold corner frames ── */}
      <CornerFrame position="tl" />
      <CornerFrame position="tr" />
      <CornerFrame position="bl" />
      <CornerFrame position="br" />

      {/* ── Main content ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center"
      >
        {/* Bismillah */}
        <motion.div variants={itemVariants} className="mb-6">
          <span className="font-calligraphy text-gold/50 text-2xl sm:text-3xl tracking-wider">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </span>
        </motion.div>

        {/* Decorative divider with subtle pulse */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-4 mb-8"
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

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
        >
          Celebrate your special moments with stunning digital invitations — from{" "}
          <span className="text-gold font-semibold">Mehndi</span> to{" "}
          <span className="text-gold font-semibold">Baraat</span> to{" "}
          <span className="text-gold font-semibold">Walima</span>. Premium animations,
          Islamic art, and interactive experiences that honor Pakistani wedding traditions.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            onClick={onGetStarted}
            className="bg-gold hover:bg-gold-light text-emerald-dark font-bold text-base px-8 h-12 pulse-glow border-none shadow-lg shadow-gold/20 hover:shadow-gold/40 transition-all duration-300"
          >
            Get Started
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
          className="mt-6 flex flex-col items-center gap-3"
        >
          <p className="text-sm text-white/40">
            Trusted by 5,000+ Pakistani families worldwide
          </p>
          <div className="flex items-center gap-4">
            <Shield className="h-4 w-4 text-white/30" />
            <Star className="h-4 w-4 text-white/30" />
            <Heart className="h-4 w-4 text-white/30" />
          </div>
        </motion.div>
      </motion.div>

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
