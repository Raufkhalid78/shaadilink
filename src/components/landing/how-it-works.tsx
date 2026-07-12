"use client";

import { useEffect, useState } from "react";
import { m, useInView } from "framer-motion";
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
import { useLanguage } from "@/components/language-provider";

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
      <m.div
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
        <m.div
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
      </m.div>
    </div>
  );
}

/* ---------- Step 1: Form Mockup with glass-morphism ---------- */
function FormMockup() {
  const [activeField, setActiveField] = useState(0);

  const fields = [
    { label: "VENUE", value: "The Grand Palace, Lahore", icon: MapPin },
    { label: "WELCOME MESSAGE", value: "With the blessings of our families...", icon: Heart },
    { label: "MEHNDI EVENT", value: "12 Mar 2027 · 6:00 PM", icon: Calendar },
    { label: "BARAAT EVENT", value: "14 Mar 2027 · 8:00 PM", icon: Calendar },
    { label: "WALIMA EVENT", value: "15 Mar 2027 · 7:00 PM", icon: Calendar },
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
      <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-gold/20 overflow-hidden min-h-[462px] flex flex-col justify-between">
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
              <m.div
                key={field.label}
                className="space-y-1"
                animate={isActive ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                <label className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                  {field.label}
                </label>
                <div
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 border ${
                    isActive
                      ? "bg-emerald/5 border-gold/30 shadow-sm shadow-gold/10"
                      : "bg-gray-50/50 border-gray-100"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? "text-gold" : "text-emerald/60"
                    }`}
                  />
                  <span
                    className={`text-sm truncate ${
                      isActive ? "text-foreground" : "text-gray-700"
                    }`}
                  >
                    {field.value}
                  </span>
                </div>
              </m.div>
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
      <div
        className="relative w-28 h-28 rounded-full bg-gradient-to-br from-gold/20 to-emerald/20 border-2 border-gold/30 flex items-center justify-center gold-border-pulse"
      >
        {/* Inner sparkle */}
        <m.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ rotate: { duration: 8, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
        >
          <Sparkles className="w-8 h-8 text-gold" />
        </m.div>

        {/* Orbiting sparkle 1 */}
        <m.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 text-gold/70" />
        </m.div>

        {/* Orbiting sparkle 2 */}
        <m.div
          className="absolute inset-0"
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="absolute top-1/2 -right-2 -translate-y-1/2 w-3 h-3 text-emerald/60" />
        </m.div>

        {/* Orbiting sparkle 3 */}
        <m.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="absolute -bottom-1 left-1/4 w-2.5 h-2.5 text-gold/50" />
        </m.div>

        {/* Glow pulse ring */}
        <m.div
          className="absolute inset-[-8px] rounded-full border border-gold/20"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* "We handle the magic" text */}
      <m.p
        className="mt-5 text-sm text-muted-foreground italic"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        We handle the magic ✨
      </m.p>
    </div>
  );
}

/* ---------- Step 3: Invitation Card Preview ---------- */
function InvitationPreview() {
  return (
    <m.div
      className="relative w-full max-w-sm mx-auto"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Card */}
      <div className="relative bg-gradient-to-br from-[#1a1a1a] via-[#2a1f1f] to-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-gold/20 min-h-[462px] flex flex-col justify-center">
        {/* Animated shimmer border */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 opacity-20 -translate-x-full animate-[blockShimmerComposited_3.5s_infinite]"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(180,145,77,0.4), transparent)",
            }}
          />
        </div>

        {/* Decorative gold corner accents */}
        <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-gold/30" />
        <div className="absolute top-3 right-3 w-8 h-8 border-r-2 border-t-2 border-gold/30" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-l-2 border-b-2 border-gold/30" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-gold/30" />

        {/* Floating sparkle decorations */}
        <m.div
          className="absolute top-6 right-6"
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.3, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-3 h-3 text-gold/40" />
        </m.div>
        <m.div
          className="absolute bottom-8 left-6"
          animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <Sparkles className="w-3 h-3 text-gold/30" />
        </m.div>
        <m.div
          className="absolute top-1/3 left-4"
          animate={{ opacity: [0.15, 0.5, 0.15], scale: [1, 1.4, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <Sparkles className="w-2 h-2 text-gold/20" />
        </m.div>

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
            14 · MARCH · 2027
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
        <m.div
          className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald/10 text-emerald"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(15,107,78,0.2)" }}
        >
          <MessageCircle className="w-4 h-4" />
        </m.div>
        <m.div
          className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald/10 text-emerald"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(15,107,78,0.2)" }}
        >
          <Link2 className="w-4 h-4" />
        </m.div>
        <m.div
          className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald/10 text-emerald"
          whileHover={{ scale: 1.1, backgroundColor: "rgba(15,107,78,0.2)" }}
        >
          <Share2 className="w-4 h-4" />
        </m.div>
      </div>
    </m.div>
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

export function HowItWorks() {
  const { t } = useLanguage();
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
            {t('hiw.badge')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            {t('hiw.title')}
          </h2>
          {/* Decorative gold divider */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60" />
            <div className="w-2 h-2 rounded-full bg-gold/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/60" />
          </div>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base sm:text-lg text-center">
            {t('hiw.subtitle')}
          </p>
        </div>

        {/* 3-Step Layout */}
        <m.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="relative"
        >
          {/* Desktop: 3 columns with connecting lines */}
          <div className="hidden lg:grid grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-0">
            {/* Step 1 */}
            <m.div variants={itemVariants} className="flex flex-col h-full space-y-4 text-center">
              <StepBadge number="01" label={t('hiw.step1.label')} />
              <FormMockup />
              <p className="text-center text-sm text-muted-foreground mt-4 max-w-xs mx-auto">
                {t('hiw.step1.desc')}
              </p>
            </m.div>

            {/* Connecting Line 1 */}
            <div className="flex items-center justify-center h-full pb-12">
              <ConnectingLine direction="horizontal" />
            </div>

            {/* Step 2 */}
            <m.div variants={itemVariants} className="flex flex-col h-full justify-center space-y-4 text-center">
              <StepBadge number="02" label={t('hiw.step2.label')} />
              <TransformVisual />
              <p className="text-center text-sm text-muted-foreground mt-4 max-w-xs mx-auto">
                {t('hiw.step2.desc')}
              </p>
            </m.div>

            {/* Connecting Line 2 */}
            <div className="flex items-center justify-center h-full pb-12">
              <ConnectingLine direction="horizontal" />
            </div>

            {/* Step 3 */}
            <m.div variants={itemVariants} className="flex flex-col h-full space-y-4 text-center">
              <StepBadge number="03" label={t('hiw.step3.label')} />
              <InvitationPreview />
              <p className="text-center text-sm text-muted-foreground mt-4 max-w-xs mx-auto">
                {t('hiw.step3.desc')}
              </p>
            </m.div>
          </div>

          {/* Mobile: vertical stack with connecting lines */}
          <div className="lg:hidden space-y-0">
            <m.div variants={itemVariants} className="space-y-4 text-center">
              <StepBadge number="01" label={t('hiw.step1.label')} />
              <FormMockup />
              <p className="text-center text-sm text-muted-foreground mt-4 max-w-xs mx-auto">
                {t('hiw.step1.desc')}
              </p>
            </m.div>

            <ConnectingLine direction="vertical" />

            <m.div variants={itemVariants} className="space-y-4 text-center">
              <StepBadge number="02" label={t('hiw.step2.label')} />
              <TransformVisual />
              <p className="text-center text-sm text-muted-foreground mt-4 max-w-xs mx-auto">
                {t('hiw.step2.desc')}
              </p>
            </m.div>

            <ConnectingLine direction="vertical" />

            <m.div variants={itemVariants} className="space-y-4 text-center">
              <StepBadge number="03" label={t('hiw.step3.label')} />
              <InvitationPreview />
              <p className="text-center text-sm text-muted-foreground mt-4 max-w-xs mx-auto">
                {t('hiw.step3.desc')}
              </p>
            </m.div>
          </div>
        </m.div>
      </div>
    </section>
  );
}
