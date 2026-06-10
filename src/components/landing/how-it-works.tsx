"use client";

import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  MapPin,
  Heart,
  Music,
  Calendar,
  Sparkles,
  Share2,
  Link2,
  MessageCircle,
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
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

/* ---------- Animated Connecting Line ---------- */
function ConnectingLine({ direction = "horizontal" }: { direction?: "horizontal" | "vertical" }) {
  const isHorizontal = direction === "horizontal";

  return (
    <div className={`flex items-center justify-center ${isHorizontal ? "py-4 lg:py-0" : "py-2"}`}>
      <motion.div
        className={`${isHorizontal ? "w-16 h-px lg:w-24" : "w-px h-16"} relative`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Dashed line */}
        <div
          className={`absolute inset-0 bg-gold/20`}
          style={{
            backgroundImage: `repeating-linear-gradient(${
              isHorizontal ? "90deg" : "180deg"
            }, rgba(180,145,77,0.4) 0px, rgba(180,145,77,0.4) 6px, transparent 6px, transparent 12px)`,
          }}
        />
        {/* Animated glow pulse */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: isHorizontal
              ? "linear-gradient(90deg, transparent, rgba(180,145,77,0.6), transparent)"
              : "linear-gradient(180deg, transparent, rgba(180,145,77,0.6), transparent)",
          }}
          animate={{
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
}

/* ---------- Step 1: Form Mockup with glass-morphism ---------- */
function FormMockup() {
  const [activeField, setActiveField] = useState(0);

  const fields = [
    { label: "VENUE", value: "The Grand Palace, Lahore", icon: MapPin },
    { label: "WELCOME MESSAGE", value: "With the blessings of our families...", icon: Heart },
    { label: "MEHNDI EVENT", value: "12 Feb · 6:00 PM", icon: Calendar },
    { label: "BARAAT EVENT", value: "14 Feb · 8:00 PM", icon: Calendar },
    { label: "WALIMA EVENT", value: "15 Feb · 7:00 PM", icon: Calendar },
    { label: "BACKGROUND MUSIC", value: "Soft Sitar Melody", icon: Music },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveField((prev) => (prev + 1) % fields.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [fields.length]);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Glass-morphism form card */}
      <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-gold/20 overflow-hidden">
        {/* Form header with progress dots */}
        <div className="flex items-center justify-center gap-2 pt-5 pb-3 bg-gradient-to-r from-emerald/5 via-gold/5 to-emerald/5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald" />
          <span className="w-2.5 h-2.5 rounded-full bg-gold" />
          <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
        </div>

        {/* Animated gold border shimmer at top */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        {/* Form fields */}
        <div className="px-5 pb-5 space-y-2.5">
          {fields.map((field, index) => {
            const Icon = field.icon;
            const isActive = index === activeField;
            return (
              <motion.div
                key={field.label}
                className="space-y-1"
                animate={isActive ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                <label className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                  {field.label}
                </label>
                <div
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 border transition-all duration-300 ${
                    isActive
                      ? "bg-emerald/5 border-gold/30 shadow-sm shadow-gold/10"
                      : "bg-gray-50/50 border-gray-100"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 transition-colors duration-300 ${
                      isActive ? "text-gold" : "text-emerald/60"
                    }`}
                  />
                  <span
                    className={`text-sm truncate transition-colors duration-300 ${
                      isActive ? "text-foreground" : "text-gray-700"
                    }`}
                  >
                    {field.value}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Subtle shadow/glow effect */}
      <div className="absolute -bottom-3 left-6 right-6 h-8 bg-emerald/10 rounded-full blur-xl" />
    </div>
  );
}

/* ---------- Step 2: Transform Visual ---------- */
function TransformVisual() {
  return (
    <div className="flex flex-col items-center justify-center py-6">
      {/* Pulsing circle with orbiting sparkle */}
      <motion.div
        className="relative w-28 h-28 rounded-full bg-gradient-to-br from-gold/20 to-emerald/20 border-2 border-gold/30 flex items-center justify-center"
        animate={{
          boxShadow: [
            "0 0 20px rgba(180,145,77,0.2)",
            "0 0 50px rgba(180,145,77,0.4), 0 0 80px rgba(180,145,77,0.15)",
            "0 0 20px rgba(180,145,77,0.2)",
          ],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Inner sparkle */}
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ rotate: { duration: 8, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
        >
          <Sparkles className="w-8 h-8 text-gold" />
        </motion.div>

        {/* Orbiting sparkle 1 */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 text-gold/70" />
        </motion.div>

        {/* Orbiting sparkle 2 */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="absolute top-1/2 -right-2 -translate-y-1/2 w-3 h-3 text-emerald/60" />
        </motion.div>

        {/* Orbiting sparkle 3 */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="absolute -bottom-1 left-1/4 w-2.5 h-2.5 text-gold/50" />
        </motion.div>

        {/* Glow pulse ring */}
        <motion.div
          className="absolute inset-[-8px] rounded-full border border-gold/20"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* "We handle the magic" text */}
      <motion.p
        className="mt-5 text-sm text-muted-foreground italic"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        We handle the magic ✨
      </motion.p>
    </div>
  );
}

/* ---------- Step 3: Invitation Card Preview ---------- */
function InvitationPreview() {
  return (
    <motion.div
      className="relative w-full max-w-sm mx-auto"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Card */}
      <div className="relative bg-gradient-to-br from-[#1a1a1a] via-[#2a1f1f] to-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-gold/20">
        {/* Animated shimmer border */}
        <div className="absolute inset-0 rounded-2xl">
          <div
            className="absolute inset-0 rounded-2xl opacity-30"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(180,145,77,0.3) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s ease-in-out infinite",
            }}
          />
        </div>

        {/* Decorative gold corner accents */}
        <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-gold/30" />
        <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-gold/30" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-gold/30" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-gold/30" />

        {/* Floating sparkle decorations */}
        <motion.div
          className="absolute top-6 right-6"
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.3, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-3 h-3 text-gold/40" />
        </motion.div>
        <motion.div
          className="absolute bottom-8 left-6"
          animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <Sparkles className="w-3 h-3 text-gold/30" />
        </motion.div>
        <motion.div
          className="absolute top-1/3 left-4"
          animate={{ opacity: [0.15, 0.5, 0.15], scale: [1, 1.4, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <Sparkles className="w-2 h-2 text-gold/20" />
        </motion.div>

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
              Ahmad
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

      {/* Sharing icons below */}
      <div className="flex items-center justify-center gap-4 mt-5">
        <motion.div
          className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald/10 text-emerald"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(15,107,78,0.2)" }}
        >
          <MessageCircle className="w-4 h-4" />
        </motion.div>
        <motion.div
          className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald/10 text-emerald"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(15,107,78,0.2)" }}
        >
          <Link2 className="w-4 h-4" />
        </motion.div>
        <motion.div
          className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald/10 text-emerald"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(15,107,78,0.2)" }}
        >
          <Share2 className="w-4 h-4" />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ---------- Step Number Badge ---------- */
function StepBadge({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center mb-4">
      <span className="font-display gold-shimmer-strong text-5xl sm:text-6xl font-bold block leading-none">
        {number}
      </span>
      <span className="font-display text-foreground text-sm sm:text-base tracking-[0.15em] uppercase font-bold mt-2 block">
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
          {/* Decorative gold divider */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60" />
            <div className="w-2 h-2 rounded-full bg-gold/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/60" />
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
          className="relative"
        >
          {/* Desktop: 3 columns with connecting lines */}
          <div className="hidden lg:grid grid-cols-[1fr_auto_1fr_auto_1fr] items-start gap-0">
            {/* Step 1 */}
            <motion.div variants={itemVariants} className="space-y-4 text-center">
              <StepBadge number="01" label="Fill Details" />
              <FormMockup />
              <p className="text-center text-sm text-muted-foreground mt-4 max-w-xs mx-auto">
                Enter your venue, events, welcome message, and music — everything that makes your celebration unique.
              </p>
            </motion.div>

            {/* Connecting Line 1 */}
            <div className="flex items-center pt-36">
              <ConnectingLine direction="horizontal" />
            </div>

            {/* Step 2 */}
            <motion.div variants={itemVariants} className="space-y-4 text-center">
              <StepBadge number="02" label="We Transform" />
              <TransformVisual />
              <p className="text-center text-sm text-muted-foreground mt-4 max-w-xs mx-auto">
                Our system crafts a stunning, animated invitation with premium effects.
              </p>
            </motion.div>

            {/* Connecting Line 2 */}
            <div className="flex items-center pt-36">
              <ConnectingLine direction="horizontal" />
            </div>

            {/* Step 3 */}
            <motion.div variants={itemVariants} className="space-y-4 text-center">
              <StepBadge number="03" label="Share & Celebrate" />
              <InvitationPreview />
              <p className="text-center text-sm text-muted-foreground mt-4 max-w-xs mx-auto">
                Your beautiful, animated invitation is ready to share via WhatsApp, link, or social media.
              </p>
            </motion.div>
          </div>

          {/* Mobile: vertical stack with connecting lines */}
          <div className="lg:hidden space-y-0">
            <motion.div variants={itemVariants} className="space-y-4 text-center">
              <StepBadge number="01" label="Fill Details" />
              <FormMockup />
              <p className="text-center text-sm text-muted-foreground mt-4 max-w-xs mx-auto">
                Enter your venue, events, welcome message, and music — everything that makes your celebration unique.
              </p>
            </motion.div>

            <ConnectingLine direction="vertical" />

            <motion.div variants={itemVariants} className="space-y-4 text-center">
              <StepBadge number="02" label="We Transform" />
              <TransformVisual />
              <p className="text-center text-sm text-muted-foreground mt-4 max-w-xs mx-auto">
                Our system crafts a stunning, animated invitation with premium effects.
              </p>
            </motion.div>

            <ConnectingLine direction="vertical" />

            <motion.div variants={itemVariants} className="space-y-4 text-center">
              <StepBadge number="03" label="Share & Celebrate" />
              <InvitationPreview />
              <p className="text-center text-sm text-muted-foreground mt-4 max-w-xs mx-auto">
                Your beautiful, animated invitation is ready to share via WhatsApp, link, or social media.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
