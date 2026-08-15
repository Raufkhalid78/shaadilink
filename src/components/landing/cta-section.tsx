"use client";

import { m } from "framer-motion";
import { Sparkles, Heart, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";

interface CTASectionProps {
  onGetStarted?: () => void;
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  const { t, language } = useLanguage();

  const benefits = [
    t('cta.benefit.1'),
    t('cta.benefit.2'),
    t('cta.benefit.3'),
  ];

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
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-pattern)" className="text-gold" />
        </svg>
      </div>

      {/* Gradient orbs (static for high scroll performance) */}
      <div
        className="absolute w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-gold/10 blur-3xl pointer-events-none transform-gpu"
        style={{ top: "10%", left: "10%" }}
      />
      <div
        className="absolute w-48 h-48 sm:w-72 sm:h-72 rounded-full bg-emerald/10 blur-3xl pointer-events-none transform-gpu"
        style={{ bottom: "10%", right: "15%" }}
      />

      {/* Decorative gold corner accents */}
      <div className="absolute top-0 left-0 w-12 h-12 sm:w-20 sm:h-20 border-l-2 border-t-2 border-gold/20" />
      <div className="absolute top-0 right-0 w-12 h-12 sm:w-20 sm:h-20 border-r-2 border-t-2 border-gold/20" />
      <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-20 sm:h-20 border-l-2 border-b-2 border-gold/20" />
      <div className="absolute bottom-0 right-0 w-12 h-12 sm:w-20 sm:h-20 border-r-2 border-b-2 border-gold/20" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <m.div
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

          {/* Premium badge */}
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/20 bg-gold/5 mb-6"
          >
            <div className="flex items-center gap-0.5">
              <Sparkles className="w-4 h-4 text-gold" />
            </div>
            <span className="text-sm text-gold font-semibold">
              {language === 'en' ? 'Premium Quality' : 'اعلی معیار'}
            </span>
            <span className="text-xs text-white/60">
              {language === 'en' ? 'Handcrafted digital designs' : 'نفاست سے تیار کردہ ڈیزائنز'}
            </span>
          </m.div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            {language === 'en' ? 'Ready to Create Your ' : 'کیا آپ اپنا '}
            <span className="gold-shimmer-strong">
              {language === 'en' ? 'Perfect Invitation?' : 'شاندار کارڈ بنانے کے لیے تیار ہیں؟'}
            </span>
          </h2>

          <p className="mt-6 text-base sm:text-lg text-white/70 max-w-xl mx-auto leading-relaxed text-center">
            {t("cta.subtitle")}
          </p>

          {/* Benefits list */}
          <m.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6"
          >
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-gold shrink-0" />
                <span className="text-sm text-white/60">{benefit}</span>
              </div>
            ))}
          </m.div>

          <m.div
            className="mt-8 flex flex-col items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <m.div
              className="transform-gpu will-change-transform"
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
                {language === 'en' ? 'Start Creating Your Invitation' : 'دعوت نامہ بنانا شروع کریں'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </m.div>
          </m.div>

          <p className="mt-6 text-sm text-white/60">
            {language === 'en' ? 'Starting from Rs. 3,499 • One-time payment' : 'صرف 3,499 روپے سے شروع • یک وقتی ادائیگی'}
          </p>
        </m.div>
      </div>
    </section>
  );
}
