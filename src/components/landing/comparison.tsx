"use client";

import { motion } from "framer-motion";
import { X, Check, ScrollText, Sparkles } from "lucide-react";

interface Comparison {
  feature: string;
  icon: React.ComponentType<{ className?: string }>;
  paper: string;
  digital: string;
}

const comparisons: Comparison[] = [
  {
    feature: "Cost",
    icon: ScrollText,
    paper: "Rs. 50,000+",
    digital: "Rs. 2,499",
  },
  {
    feature: "Design",
    icon: Sparkles,
    paper: "Static & Limited",
    digital: "Animated & Interactive",
  },
  {
    feature: "RSVP",
    icon: ScrollText,
    paper: "Manual Tracking",
    digital: "Real-time Responses",
  },
  {
    feature: "Updates",
    icon: ScrollText,
    paper: "Impossible",
    digital: "Instant",
  },
  {
    feature: "Eco-friendly",
    icon: ScrollText,
    paper: "No",
    digital: "Yes",
  },
  {
    feature: "Music & Video",
    icon: ScrollText,
    paper: "No",
    digital: "Yes",
  },
  {
    feature: "Map Integration",
    icon: ScrollText,
    paper: "No",
    digital: "Yes",
  },
  {
    feature: "Guest Wishes",
    icon: ScrollText,
    paper: "No",
    digital: "Yes",
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
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export function Comparison() {
  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-20 reveal-on-scroll">
          <span className="inline-block font-calligraphy text-gold text-lg mb-3">
            ✦ Why Digital ✦
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Why Go Digital?
          </h2>
          {/* Gold divider */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60" />
            <div className="w-2 h-2 rounded-full bg-gold/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/60" />
          </div>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base sm:text-lg">
            See how ShaadiLink compares to traditional paper invitations.
          </p>
        </div>

        {/* Comparison Table */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="overflow-hidden rounded-2xl border border-border/50 shadow-lg shadow-gold/[0.03]"
        >
          {/* Header Row */}
          <div className="grid grid-cols-3 bg-emerald-dark text-white">
            <div className="p-4 sm:p-6 flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-gold" />
              <span className="font-semibold text-sm sm:text-base">Feature</span>
            </div>
            <div className="p-4 sm:p-6 text-center border-l border-white/10">
              <span className="font-semibold text-sm sm:text-base text-white/70">
                Paper Cards ❌
              </span>
            </div>
            <div className="p-4 sm:p-6 text-center border-l border-gold/30 bg-gold/10">
              <span className="font-semibold text-sm sm:text-base text-gold">
                ShaadiLink ✨
              </span>
            </div>
          </div>

          {/* Rows */}
          {comparisons.map((row, index) => {
            const Icon = row.icon;
            return (
              <motion.div
                key={row.feature}
                variants={rowVariants}
                className={`grid grid-cols-3 group ${
                  index % 2 === 0 ? "bg-muted/20" : "bg-card"
                } hover:bg-emerald/5 transition-all duration-300`}
                style={{
                  borderLeft: "2px solid transparent",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderLeftColor = "rgba(180,145,77,0.5)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderLeftColor = "transparent";
                }}
              >
                <div className="p-4 sm:p-5 flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-muted-foreground/50 shrink-0 hidden sm:block" />
                  <span className="font-medium text-sm sm:text-base text-foreground">
                    {row.feature}
                  </span>
                </div>
                <div className="p-4 sm:p-5 flex items-center justify-center border-l border-border/30 bg-red-500/[0.03]">
                  <span className="flex items-center gap-2 text-sm sm:text-base text-red-400">
                    <X className="h-4 w-4 text-red-400 shrink-0" />
                    <span className="hidden sm:inline">{row.paper}</span>
                    <span className="sm:hidden">{row.paper.split(" ")[0]}</span>
                  </span>
                </div>
                <div className="p-4 sm:p-5 flex items-center justify-center border-l border-border/30 bg-emerald/[0.05]">
                  <span className="flex items-center gap-2 text-sm sm:text-base font-bold text-emerald">
                    <Check className="h-4 w-4 text-emerald shrink-0" />
                    {row.digital}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
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
