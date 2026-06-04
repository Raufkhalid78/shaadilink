"use client";

import { motion } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

function IslamicPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.06]">
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        <defs>
          <pattern
            id="islamic-pattern"
            x="0"
            y="0"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M40 0 L80 40 L40 80 L0 40 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <circle cx="40" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path
              d="M20 20 L60 20 L60 60 L20 60 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-pattern)" className="text-gold" />
      </svg>
    </div>
  );
}

function FloatingElement({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -12, 0],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

interface HeroProps {
  onViewTemplates?: () => void;
  onGetStarted?: () => void;
}

export function Hero({ onViewTemplates, onGetStarted }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-emerald-dark">
      {/* Background gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-dark via-emerald to-emerald-dark" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      {/* Islamic geometric pattern overlay */}
      <IslamicPattern />

      {/* Decorative gold corner accents */}
      <div className="absolute top-0 left-0 w-48 h-48 border-l-2 border-t-2 border-gold/20 rounded-tl-none" />
      <div className="absolute top-0 right-0 w-48 h-48 border-r-2 border-t-2 border-gold/20" />
      <div className="absolute bottom-0 left-0 w-48 h-48 border-l-2 border-b-2 border-gold/20" />
      <div className="absolute bottom-0 right-0 w-48 h-48 border-r-2 border-b-2 border-gold/20" />

      {/* Floating decorative elements */}
      <FloatingElement className="absolute top-[15%] left-[8%] w-3 h-3 rounded-full bg-gold/40" delay={0} />
      <FloatingElement className="absolute top-[25%] right-[12%] w-2 h-2 rounded-full bg-gold/30" delay={1} />
      <FloatingElement className="absolute bottom-[30%] left-[15%] w-4 h-4 rounded-full bg-gold/20" delay={2} />
      <FloatingElement className="absolute top-[40%] right-[8%] w-2 h-2 rounded-full bg-gold-light/30" delay={0.5} />
      <FloatingElement className="absolute bottom-[20%] right-[20%] w-3 h-3 rounded-full bg-gold/25" delay={1.5} />
      <FloatingElement className="absolute top-[60%] left-[5%] w-2 h-2 rounded-full bg-gold-light/20" delay={3} />

      {/* Decorative gold lines */}
      <motion.div
        className="absolute top-[20%] left-[3%] w-px h-24 bg-gradient-to-b from-transparent via-gold/30 to-transparent"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-[25%] right-[5%] w-px h-32 bg-gradient-to-b from-transparent via-gold/20 to-transparent"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
      />

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center"
      >
        {/* Arabic calligraphy decorative text */}
        <motion.div variants={itemVariants} className="mb-6">
          <span className="font-calligraphy text-gold/60 text-2xl sm:text-3xl tracking-wider">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </span>
        </motion.div>

        {/* Decorative line */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-gold/50" />
          <Sparkles className="h-5 w-5 text-gold" />
          <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-gold/50" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight"
        >
          Create Your Dream
          <br />
          <span className="gold-shimmer">Wedding Invitation</span>
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
            className="bg-gold hover:bg-gold-light text-emerald-dark font-bold text-base px-8 h-12 pulse-glow border-none"
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

        {/* Trust line */}
        <motion.p
          variants={itemVariants}
          className="mt-6 text-sm text-white/40"
        >
          Trusted by 5,000+ Pakistani families worldwide
        </motion.p>
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
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown className="h-5 w-5" />
        </a>
      </motion.div>
    </section>
  );
}
