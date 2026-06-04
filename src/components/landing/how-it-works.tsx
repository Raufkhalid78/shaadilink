"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Heart,
  Music,
  Calendar,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

/* ---------- Step 1: Form Mockup ---------- */
function FormMockup() {
  const fields = [
    {
      label: "VENUE",
      value: "The Grand Palace, Lahore",
      icon: MapPin,
    },
    {
      label: "WELCOME MESSAGE",
      value: "With the blessings of our families...",
      icon: Heart,
    },
    {
      label: "MEHNDI EVENT",
      value: "12 Feb · 6:00 PM",
      icon: Calendar,
    },
    {
      label: "SANGEET EVENT",
      value: "13 Feb · 7:30 PM",
      icon: Calendar,
    },
    {
      label: "RECEPTION",
      value: "15 Feb · 8:00 PM",
      icon: Calendar,
    },
    {
      label: "BACKGROUND MUSIC",
      value: "Soft Sitar Melody",
      icon: Music,
    },
  ];

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Form card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Form header with progress dots */}
        <div className="flex items-center justify-center gap-2 pt-5 pb-3 bg-gradient-to-r from-emerald/5 via-gold/5 to-emerald/5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald" />
          <span className="w-2.5 h-2.5 rounded-full bg-gold" />
          <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
        </div>

        {/* Form fields */}
        <div className="px-5 pb-5 space-y-3">
          {fields.map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.label} className="space-y-1">
                <label className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                  {field.label}
                </label>
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                  <Icon className="w-3.5 h-3.5 text-emerald/60 shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{field.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subtle shadow/glow effect */}
      <div className="absolute -bottom-3 left-6 right-6 h-8 bg-emerald/10 rounded-full blur-xl" />
    </div>
  );
}

/* ---------- Step 2: Transform Arrow ---------- */
function TransformArrow() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Pulsing circle with arrow */}
      <motion.div
        className="relative w-24 h-24 rounded-full bg-gradient-to-br from-gold/20 to-emerald/20 border-2 border-gold/30 flex items-center justify-center"
        animate={{
          boxShadow: [
            "0 0 20px rgba(180,145,77,0.2)",
            "0 0 40px rgba(180,145,77,0.4)",
            "0 0 20px rgba(180,145,77,0.2)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowRight className="w-8 h-8 text-gold" />

        {/* Orbiting sparkle */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 text-gold/60" />
        </motion.div>
      </motion.div>

      {/* "We handle the magic" text */}
      <p className="mt-4 text-sm text-muted-foreground italic">
        We handle the magic ✨
      </p>
    </div>
  );
}

/* ---------- Step 3: Invitation Card Preview ---------- */
function InvitationPreview() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Card */}
      <div className="relative bg-gradient-to-br from-[#1a1a1a] via-[#2a1f1f] to-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-gold/20">
        {/* Decorative gold corner accents */}
        <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-gold/30" />
        <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-gold/30" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-gold/30" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-gold/30" />

        {/* Sparkle decorations */}
        <Sparkles className="absolute top-6 right-6 w-3 h-3 text-gold/40" />
        <Sparkles className="absolute bottom-8 left-6 w-3 h-3 text-gold/30" />
        <Sparkles className="absolute top-1/3 left-4 w-2 h-2 text-gold/20" />

        {/* Card content */}
        <div className="px-8 py-10 text-center space-y-4 relative z-10">
          {/* Header */}
          <p className="text-gold text-xs font-display tracking-[0.3em] uppercase font-semibold">
            We Invite You
          </p>

          {/* Names */}
          <div className="space-y-1">
            <p className="font-calligraphy text-white text-3xl font-bold">
              Aisha
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-px bg-gold/40" />
              <Heart className="w-4 h-4 text-gold/60 fill-gold/60" />
              <div className="w-8 h-px bg-gold/40" />
            </div>
            <p className="font-calligraphy text-white text-3xl font-bold">
              Rohan
            </p>
          </div>

          {/* Date */}
          <p className="text-white/70 font-display text-sm tracking-wider">
            14 · FEBRUARY · 2026
          </p>

          {/* Venue */}
          <p className="text-gold/60 font-display text-xs tracking-wider">
            The Grand Palace · Lahore
          </p>
        </div>
      </div>

      {/* Glow effect underneath */}
      <div className="absolute -bottom-4 left-8 right-8 h-10 bg-gold/10 rounded-full blur-xl" />
    </div>
  );
}

/* ---------- Step Number Badge ---------- */
function StepBadge({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="font-display text-gold text-sm tracking-[0.2em] uppercase font-bold">
        {number}
      </span>
      <span className="text-xs text-muted-foreground/60">·</span>
      <span className="font-display text-foreground text-sm tracking-[0.15em] uppercase font-bold">
        {label}
      </span>
    </div>
  );
}

/* ---------- Main Component ---------- */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-28 bg-gradient-to-b from-muted/30 via-background to-muted/30 relative overflow-hidden"
    >
      {/* Subtle decorative background */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="hiw-pattern"
              x="0"
              y="0"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
              <path d="M50 25 L50 75 M25 50 L75 50" stroke="currentColor" strokeWidth="0.3" className="text-gold" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hiw-pattern)" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-20 reveal-on-scroll">
          <span className="inline-block font-calligraphy text-gold text-lg mb-3">
            ✦ Simple Steps ✦
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            How It Works
          </h2>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold/50" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold/50" />
          </div>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base sm:text-lg">
            Fill in your details — we transform them into a stunning invitation webpage.
          </p>
        </div>

        {/* 3-Step Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 items-start"
        >
          {/* Step 1: Fill Details */}
          <motion.div variants={itemVariants} className="space-y-4">
            <StepBadge number="1" label="Fill Details" />
            <FormMockup />
            <p className="text-center text-sm text-muted-foreground mt-4 max-w-xs mx-auto">
              Enter your venue, events, welcome message, and music — everything that makes your celebration unique.
            </p>
          </motion.div>

          {/* Step 2: Transform (desktop: centered arrow, mobile: horizontal arrow) */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center lg:pt-20"
          >
            <StepBadge number="2" label="Transform" />

            {/* Desktop: vertical arrow */}
            <div className="hidden lg:flex flex-col items-center">
              <motion.div
                className="w-px h-20 bg-gradient-to-b from-gold/30 to-gold/10 relative"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <ChevronRight className="absolute -bottom-2 left-1/2 -translate-x-1/2 rotate-90 w-4 h-4 text-gold/40" />
              </motion.div>
              <TransformArrow />
            </div>

            {/* Mobile: horizontal arrow */}
            <div className="lg:hidden">
              <TransformArrow />
            </div>
          </motion.div>

          {/* Step 3: Get Invitation */}
          <motion.div variants={itemVariants} className="space-y-4">
            <StepBadge number="3" label="Get Invitation" />
            <InvitationPreview />
            <p className="text-center text-sm text-muted-foreground mt-4 max-w-xs mx-auto">
              Your beautiful, animated invitation is ready to share via WhatsApp, link, or social media.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
