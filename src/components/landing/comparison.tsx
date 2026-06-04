"use client";

import { motion } from "framer-motion";
import { X, Check, ScrollText } from "lucide-react";

const comparisons = [
  {
    feature: "Cost",
    paper: "Rs. 50,000+",
    digital: "Rs. 2,499",
  },
  {
    feature: "Design",
    paper: "Static & Limited",
    digital: "Animated & Interactive",
  },
  {
    feature: "RSVP",
    paper: "Manual Tracking",
    digital: "Real-time Responses",
  },
  {
    feature: "Updates",
    paper: "Impossible",
    digital: "Instant",
  },
  {
    feature: "Eco-friendly",
    paper: "No",
    digital: "Yes",
  },
  {
    feature: "Music & Video",
    paper: "No",
    digital: "Yes",
  },
  {
    feature: "Map Integration",
    paper: "No",
    digital: "Yes",
  },
  {
    feature: "Guest Wishes",
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
          className="overflow-hidden rounded-2xl border border-border/50 shadow-lg"
        >
          {/* Header */}
          <div className="grid grid-cols-3 bg-emerald-dark text-white">
            <div className="p-4 sm:p-6 flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-gold" />
              <span className="font-semibold text-sm sm:text-base">Feature</span>
            </div>
            <div className="p-4 sm:p-6 text-center border-l border-white/10">
              <span className="font-semibold text-sm sm:text-base text-white/70">
                Paper Invitations
              </span>
            </div>
            <div className="p-4 sm:p-6 text-center border-l border-gold/30 bg-gold/10">
              <span className="font-semibold text-sm sm:text-base text-gold">
                ShaadiLink Digital
              </span>
            </div>
          </div>

          {/* Rows */}
          {comparisons.map((row, index) => (
            <motion.div
              key={row.feature}
              variants={rowVariants}
              className={`grid grid-cols-3 ${
                index % 2 === 0 ? "bg-muted/30" : "bg-card"
              } hover:bg-emerald/5 transition-colors`}
            >
              <div className="p-4 sm:p-5 flex items-center">
                <span className="font-medium text-sm sm:text-base text-foreground">
                  {row.feature}
                </span>
              </div>
              <div className="p-4 sm:p-5 flex items-center justify-center border-l border-border/30">
                <span className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground">
                  <X className="h-4 w-4 text-red-400 shrink-0" />
                  <span className="hidden sm:inline">{row.paper}</span>
                  <span className="sm:hidden">{row.paper.split(" ")[0]}</span>
                </span>
              </div>
              <div className="p-4 sm:p-5 flex items-center justify-center border-l border-border/30 bg-emerald/5">
                <span className="flex items-center gap-2 text-sm sm:text-base font-medium text-emerald">
                  <Check className="h-4 w-4 text-emerald shrink-0" />
                  {row.digital}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">
            Save over <span className="font-bold text-gold">Rs. 47,000</span> while getting
            a far superior experience.
          </p>
        </div>
      </div>
    </section>
  );
}
