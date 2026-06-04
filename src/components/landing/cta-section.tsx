"use client";

import { motion } from "framer-motion";
import { Sparkles, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  onGetStarted?: () => void;
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-dark via-emerald to-emerald-dark" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />

      {/* Islamic geometric pattern overlay */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.04]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="cta-pattern"
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
              <circle
                cx="40"
                cy="40"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
              <path
                d="M20 0 L40 20 L20 40 L0 20 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.3"
              />
              <path
                d="M60 0 L80 20 L60 40 L40 20 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-pattern)" className="text-gold" />
        </svg>
      </div>

      {/* Animated gradient orbs */}
      <motion.div
        className="absolute w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-gold/10 blur-3xl"
        style={{ top: "10%", left: "10%" }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-48 h-48 sm:w-72 sm:h-72 rounded-full bg-emerald-light/10 blur-3xl"
        style={{ bottom: "10%", right: "15%" }}
        animate={{
          scale: [1.1, 1, 1.1],
          x: [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-gold/5 blur-3xl"
        style={{ top: "50%", right: "30%" }}
        animate={{
          scale: [1, 1.15, 1],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Decorative gold corner accents */}
      <div className="absolute top-0 left-0 w-12 h-12 sm:w-20 sm:h-20 border-l-2 border-t-2 border-gold/20" />
      <div className="absolute top-0 right-0 w-12 h-12 sm:w-20 sm:h-20 border-r-2 border-t-2 border-gold/20" />
      <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-20 sm:h-20 border-l-2 border-b-2 border-gold/20" />
      <div className="absolute bottom-0 right-0 w-12 h-12 sm:w-20 sm:h-20 border-r-2 border-b-2 border-gold/20" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-12 sm:w-16 bg-gradient-to-r from-transparent to-gold/50" />
            <Sparkles className="h-5 w-5 text-gold" />
            <div className="h-px w-12 sm:w-16 bg-gradient-to-l from-transparent to-gold/50" />
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            Ready to Create Your{" "}
            <span className="gold-shimmer-strong">Perfect Invitation?</span>
          </h2>

          <p className="mt-6 text-base sm:text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
            Join thousands of Pakistani families who have already made their
            wedding celebrations unforgettable with ShaadiLink.
          </p>

          <motion.div
            className="mt-8 flex flex-col items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Button
                size="lg"
                onClick={onGetStarted}
                className="bg-gold hover:bg-gold-light text-emerald-dark font-bold text-base px-8 h-12 pulse-glow border-none gap-2"
              >
                <Heart className="w-4 h-4 fill-current" />
                Start Creating Your Invitation
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>

            {/* Secondary link */}
            <a
              href="#templates"
              className="text-gold/70 hover:text-gold text-sm transition-colors underline underline-offset-4 decoration-gold/30"
            >
              Or view our templates →
            </a>
          </motion.div>

          <p className="mt-6 text-sm text-white/30">
            No subscription · One-time payment · Unlimited guests
          </p>
        </motion.div>
      </div>
    </section>
  );
}
