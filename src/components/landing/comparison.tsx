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

interface ComparisonRow {
  feature: string;
  printed: string | boolean;
  photo: string | boolean;
  video: string | boolean;
  shaadilink: string | boolean;
}

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Cost per invite",
    printed: "Rs. 50–200 / card",
    photo: "Rs. 1,000",
    video: "Rs. 4,000",
    shaadilink: "Rs. 3,499 (∞ guests)",
  },
  {
    feature: "RSVP tracking",
    printed: false,
    photo: false,
    video: false,
    shaadilink: true,
  },
  {
    feature: "Photo gallery",
    printed: false,
    photo: false,
    video: false,
    shaadilink: true,
  },
  {
    feature: "Live countdown",
    printed: false,
    photo: false,
    video: false,
    shaadilink: true,
  },
  {
    feature: "Venue map & directions",
    printed: false,
    photo: false,
    video: false,
    shaadilink: true,
  },
  {
    feature: "Background music",
    printed: false,
    photo: false,
    video: true,
    shaadilink: true,
  },
  {
    feature: "Easy to share",
    printed: false,
    photo: true,
    video: true,
    shaadilink: true,
  },
  {
    feature: "Eco-friendly",
    printed: false,
    photo: true,
    video: true,
    shaadilink: true,
  },
  {
    feature: "Premium look & feel",
    printed: true,
    photo: true,
    video: true,
    shaadilink: true,
  },
  {
    feature: "Personalized guest names",
    printed: true,
    photo: false,
    video: false,
    shaadilink: true,
  },
];

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
  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-20 reveal-on-scroll">
          <span className="inline-block font-calligraphy text-gold text-lg mb-3">
            ✦ vs. Paper Invites ✦
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            How We Compare
          </h2>
          {/* Gold divider */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60" />
            <div className="w-2 h-2 rounded-full bg-gold/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/60" />
          </div>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base sm:text-lg">
            See why digital invitations from ShaadiLink are the smarter, more beautiful choice for your wedding.
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
                FEATURES
              </div>
              <div className="p-4 flex flex-col items-center gap-2">
                <Printer className="h-5 w-5 text-white/60" />
                <span className="text-[10px] tracking-[0.12em] uppercase font-bold text-white/60">
                  Printed Cards
                </span>
              </div>
              <div className="p-4 flex flex-col items-center gap-2">
                <Image className="h-5 w-5 text-white/60" />
                <span className="text-[10px] tracking-[0.12em] uppercase font-bold text-white/60">
                  Photo Invite
                </span>
              </div>
              <div className="p-4 flex flex-col items-center gap-2">
                <Video className="h-5 w-5 text-white/60" />
                <span className="text-[10px] tracking-[0.12em] uppercase font-bold text-white/60">
                  Video Invite
                </span>
              </div>
              <div className="p-4 flex flex-col items-center gap-2 bg-gold/[0.03] dark:bg-gold/[0.05] h-full justify-end border-l border-gold/10">
                <Star className="h-5 w-5 text-gold fill-gold" />
                <span className="text-[10px] tracking-[0.12em] uppercase font-bold text-gold">
                  ShaadiLink
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
                <div className="p-5 flex items-center font-medium text-sm text-white/90">
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

                {/* ShaadiLink Column (Highlighted) */}
                <div className="p-5 flex items-center justify-center text-sm font-bold text-gold bg-gold/[0.03] dark:bg-gold/[0.05] border-l border-gold/10">
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

        {/* Bottom CTA */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-gold/10 via-gold/5 to-gold/10 border border-gold/20 rounded-full px-6 py-3">
            <Sparkles className="w-4 h-4 text-gold" />
            <p className="text-sm sm:text-base text-muted-foreground">
              Save over{" "}
              <span className="font-bold text-gold text-base sm:text-lg">
                Rs. 47,000
              </span>{" "}
              while getting a far superior experience.
            </p>
            <Sparkles className="w-4 h-4 text-gold" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
