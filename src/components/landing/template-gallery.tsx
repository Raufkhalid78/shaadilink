"use client";

import { motion } from "framer-motion";
import { Eye, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const templates = [
  {
    name: "Emerald Noir",
    theme: "Mehndi",
    description: "Deep green and gold with ornate corner accents and luxury door opening",
    bgClass: "bg-gradient-to-br from-emerald-dark via-emerald to-emerald-dark",
    borderClass: "border-gold/30",
    badgeText: "Most Popular",
    badgeClass: "bg-gold/15 text-gold border-gold/25",
    patternColor: "text-gold/10",
    doorType: "3D Door Opening",
  },
  {
    name: "Crimson Royale",
    theme: "Baraat",
    description: "Dark charcoal base with gold and deep red accents, luxury card reveal",
    bgClass: "bg-gradient-to-br from-gray-900 via-red-950 to-gray-900",
    borderClass: "border-red-400/30",
    badgeText: "Most Liked",
    badgeClass: "bg-red-500/15 text-red-400 border-red-400/25",
    patternColor: "text-red-400/10",
    doorType: "Scratch Card Reveal",
  },
  {
    name: "Mughal Emerald",
    theme: "Nikkah",
    description: "Emerald green and gold with Mughal-inspired floral door opening",
    bgClass: "bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-950",
    borderClass: "border-teal-400/30",
    badgeText: "New",
    badgeClass: "bg-teal-500/15 text-teal-400 border-teal-400/25",
    patternColor: "text-teal-400/10",
    doorType: "Floral Door Opening",
  },
  {
    name: "Rose Gold Blush",
    theme: "Walima",
    description: "Blush pink and rose gold with ornate floral door animation",
    bgClass: "bg-gradient-to-br from-rose-900 via-rose-800 to-rose-950",
    borderClass: "border-rose-400/30",
    badgeText: "New",
    badgeClass: "bg-rose-500/15 text-rose-400 border-rose-400/25",
    patternColor: "text-rose-400/10",
    doorType: "Curtain Reveal",
  },
  {
    name: "Midnight Royal",
    theme: "Engagement",
    description: "Deep purple and silver with celestial star-themed door opening",
    bgClass: "bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-950",
    borderClass: "border-purple-400/30",
    badgeText: "Premium",
    badgeClass: "bg-purple-500/15 text-purple-400 border-purple-400/25",
    patternColor: "text-purple-400/10",
    doorType: "Star Door Opening",
  },
  {
    name: "Modern Minimal",
    theme: "Reception",
    description: "Deep navy and gold with geometric patterns and book-style opening",
    bgClass: "bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900",
    borderClass: "border-blue-400/30",
    badgeText: "Premium",
    badgeClass: "bg-blue-500/15 text-blue-400 border-blue-400/25",
    patternColor: "text-blue-400/10",
    doorType: "Book-style Opening",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

function TemplatePattern({ colorClass }: { colorClass: string }) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full ${colorClass}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id={`tp-${colorClass}`}
          x="0"
          y="0"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="30" cy="30" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M30 15 L30 45 M15 30 L45 30" stroke="currentColor" strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#tp-${colorClass})`} />
    </svg>
  );
}

export function TemplateGallery() {
  return (
    <section
      id="templates"
      className="py-20 sm:py-28 bg-gradient-to-b from-muted/50 to-background"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-20 reveal-on-scroll">
          <span className="inline-block font-calligraphy text-gold text-lg mb-3">
            ✦ Templates ✦
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Premium Templates
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            Each template is a masterpiece — designed to honor the beauty and tradition of Pakistani weddings.
          </p>
        </div>

        {/* Template Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {templates.map((template) => (
            <motion.div key={template.name} variants={cardVariants}>
              <div className="group relative rounded-2xl overflow-hidden border border-border/50 hover:border-gold/40 transition-all duration-500 hover:shadow-xl hover:shadow-gold/10 hover:-translate-y-2">
                {/* Template Preview */}
                <div
                  className={`relative ${template.bgClass} h-72 sm:h-80 p-6 flex flex-col items-center justify-center`}
                >
                  <TemplatePattern colorClass={template.patternColor} />

                  {/* Decorative frame inside the card */}
                  <div
                    className={`relative z-10 w-full h-full border-2 ${template.borderClass} rounded-lg flex flex-col items-center justify-center p-4`}
                  >
                    {/* Arabic calligraphy */}
                    <span className="font-calligraphy text-white/30 text-xl sm:text-2xl mb-3">
                      دعوة زفاف
                    </span>

                    {/* Simulated names */}
                    <div className="text-center">
                      <p className="font-display text-white/80 text-lg sm:text-xl font-semibold">
                        Ahmed & Fatima
                      </p>
                      <div className="w-12 h-px bg-gold/40 mx-auto my-3" />
                      <p className="font-calligraphy text-gold/60 text-sm tracking-wider">
                        {template.theme}
                      </p>
                    </div>

                    {/* Door type indicator */}
                    <div className="mt-3 flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-white/30" />
                      <p className="text-[10px] text-white/40 tracking-wider uppercase">{template.doorType}</p>
                    </div>

                    {/* Decorative elements */}
                    <div className="mt-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-gold/40" />
                      <div className="w-8 h-px bg-gold/30" />
                      <Sparkles className="h-4 w-4 text-gold/40" />
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                    <a href="#live-demo">
                      <Button
                        variant="outline"
                        className="border-gold text-gold hover:bg-gold hover:text-emerald-dark font-medium"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Template
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Card Info */}
                <div className="bg-card p-5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {template.name}
                      </h3>
                      <Badge className={`${template.badgeClass} text-[10px] px-1.5 py-0`}>
                        {template.badgeText}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
