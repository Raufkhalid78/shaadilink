"use client";

import { motion } from "framer-motion";
import {
  X,
  Check,
  Sparkles,
  Printer,
  Image,
  Video,
  Star,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";

interface ComparisonRow {
  feature: string;
  printed: string | boolean;
  photo: string | boolean;
  video: string | boolean;
  shaadilink: string | boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const CheckIcon = ({ highlighted }: { highlighted?: boolean }) => (
  <div className={`inline-flex items-center justify-center w-5.5 h-5.5 rounded-full transition-all duration-300 ${
    highlighted
      ? "bg-gold/20 text-gold dark:bg-gold/25 dark:text-gold-light shadow-sm shadow-gold/5"
      : "bg-white/10 text-white/70"
  }`}>
    <Check className="w-3.5 h-3.5" strokeWidth={3} />
  </div>
);

const CrossIcon = () => (
  <X className="w-4 h-4 text-white/15" strokeWidth={2} />
);

export function Comparison() {
  const { t, language } = useLanguage();

  const comparisonRows: ComparisonRow[] = [
    {
      feature: t('compare.row.1.feat'),
      printed: language === 'en' ? "Rs. 50–200 / card" : "50-200 روپے فی کارڈ",
      photo: language === 'en' ? "Rs. 1,000" : "1,000 روپے",
      video: language === 'en' ? "Rs. 4,000" : "4,000 روپے",
      shaadilink: language === 'en' ? "Rs. 3,499 (∞ guests)" : "3,499 روپے (لامحدود مہمان)",
    },
    {
      feature: t('compare.row.2.feat'),
      printed: false,
      photo: false,
      video: false,
      shaadilink: true,
    },
    {
      feature: t('compare.row.3.feat'),
      printed: false,
      photo: false,
      video: false,
      shaadilink: true,
    },
    {
      feature: t('compare.row.4.feat'),
      printed: false,
      photo: false,
      video: false,
      shaadilink: true,
    },
    {
      feature: t('compare.row.5.feat'),
      printed: false,
      photo: false,
      video: false,
      shaadilink: true,
    },
    {
      feature: t('compare.row.6.feat'),
      printed: false,
      photo: false,
      video: true,
      shaadilink: true,
    },
    {
      feature: t('compare.row.7.feat'),
      printed: false,
      photo: true,
      video: true,
      shaadilink: true,
    },
    {
      feature: t('compare.row.8.feat'),
      printed: false,
      photo: true,
      video: true,
      shaadilink: true,
    },
    {
      feature: t('compare.row.9.feat'),
      printed: true,
      photo: true,
      video: true,
      shaadilink: true,
    },
    {
      feature: t('compare.row.10.feat'),
      printed: true,
      photo: false,
      video: false,
      shaadilink: true,
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-20 reveal-on-scroll">
          <span className="inline-block font-calligraphy text-gold text-lg mb-3">
            {t('compare.badge')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            {t('compare.title')}
          </h2>
          {/* Gold divider */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60" />
            <div className="w-2 h-2 rounded-full bg-gold/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/60" />
          </div>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base sm:text-lg text-center">
            {t('compare.desc')}
          </p>
        </div>

        {/* Comparison Table Scroll Container */}
        <div className="overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scrollbar-thin">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="min-w-[800px] rounded-2xl border border-border/40 bg-card overflow-hidden shadow-2xl mb-4"
          >
            {/* Header Row */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.2fr] text-center border-b border-border/40 items-end py-8 bg-card">
              <div className="p-4 text-left font-display text-xs font-bold text-white/50 tracking-wider">
                {t('compare.col.feat')}
              </div>
              <div className="p-4 flex flex-col items-center gap-2">
                <Printer className="h-5 w-5 text-white/60" />
                <span className="text-[10px] tracking-[0.12em] uppercase font-bold text-white/60">
                  {t('compare.col.paper')}
                </span>
              </div>
              <div className="p-4 flex flex-col items-center gap-2">
                <Image className="h-5 w-5 text-white/60" />
                <span className="text-[10px] tracking-[0.12em] uppercase font-bold text-white/60">
                  {t('compare.col.photo')}
                </span>
              </div>
              <div className="p-4 flex flex-col items-center gap-2">
                <Video className="h-5 w-5 text-white/60" />
                <span className="text-[10px] tracking-[0.12em] uppercase font-bold text-white/60">
                  {t('compare.col.video')}
                </span>
              </div>
              <div className="p-4 flex flex-col items-center gap-2 bg-gold/[0.03] dark:bg-gold/[0.05] h-full justify-end border-l border-gold/10">
                <Star className="h-5 w-5 text-gold fill-gold" />
                <span className="text-[10px] tracking-[0.12em] uppercase font-bold text-gold">
                  {t('compare.col.shaadilink')}
                </span>
              </div>
            </div>

            {/* Rows */}
            {comparisonRows.map((row, index) => (
              <motion.div
                key={row.feature}
                variants={rowVariants}
                className={`grid grid-cols-[2fr_1fr_1fr_1fr_1.2fr] border-b border-border/30 last:border-b-0 hover:bg-emerald/[0.02] transition-colors duration-200 ${
                  index % 2 === 0 ? "bg-muted/10" : "bg-card"
                }`}
              >
                {/* Feature Label */}
                <div className="p-5 flex items-center font-medium text-sm text-white/90 text-left">
                  {row.feature}
                </div>

                {/* Printed Column */}
                <div className="p-5 flex items-center justify-center text-sm font-semibold text-white/70">
                  {typeof row.printed === "string" ? (
                    <span className="text-white/70 font-normal">{row.printed}</span>
                  ) : row.printed ? (
                    <CheckIcon />
                  ) : (
                    <CrossIcon />
                  )}
                </div>

                {/* Photo Column */}
                <div className="p-5 flex items-center justify-center text-sm font-semibold text-white/70">
                  {typeof row.photo === "string" ? (
                    <span className="text-white/70 font-normal">{row.photo}</span>
                  ) : row.photo ? (
                    <CheckIcon />
                  ) : (
                    <CrossIcon />
                  )}
                </div>

                {/* Video Column */}
                <div className="p-5 flex items-center justify-center text-sm font-semibold text-white/70">
                  {typeof row.video === "string" ? (
                    <span className="text-white/70 font-normal">{row.video}</span>
                  ) : row.video ? (
                    <CheckIcon />
                  ) : (
                    <CrossIcon />
                  )}
                </div>

                {/* ShaadiLink Column */}
                <div className="p-5 flex items-center justify-center text-sm font-semibold text-gold bg-gold/[0.01] dark:bg-gold/[0.02] border-l border-gold/5">
                  {typeof row.shaadilink === "string" ? (
                    <span className="text-gold font-bold">{row.shaadilink}</span>
                  ) : row.shaadilink ? (
                    <CheckIcon highlighted />
                  ) : (
                    <CrossIcon />
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
