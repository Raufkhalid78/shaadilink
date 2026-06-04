"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Timer,
  MapPin,
  MessageCircleHeart,
  Share2,
  Pencil,
  Music,
  Crown,
  ImagePlus,
  Settings2,
  BarChart3,
  ShieldCheck,
  Languages,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type FeatureCategory = "all" | "experience" | "customization" | "sharing";

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  category: FeatureCategory;
}

const features: Feature[] = [
  {
    icon: Share2,
    title: "Share to Unlimited Guests",
    description: "One link, infinite reach — no per-guest charges, ever.",
    category: "sharing",
  },
  {
    icon: Pencil,
    title: "Unlimited Edits",
    description: "Refine every detail right up to your big day.",
    category: "customization",
  },
  {
    icon: Sparkles,
    title: "Scratch to Reveal Date",
    description: "Interactive scratch card reveals the wedding date with a delightful surprise.",
    category: "experience",
  },
  {
    icon: Timer,
    title: "Live Countdown",
    description: "Animated countdown timer to your special day.",
    category: "experience",
  },
  {
    icon: MessageCircleHeart,
    title: "Guest Messaging & Inbox",
    description: "Receive messages, attendance confirmations & guest counts.",
    category: "sharing",
  },
  {
    icon: Music,
    title: "Background Music",
    description: "Romantic instrumentals with elegant mute toggle.",
    category: "experience",
  },
  {
    icon: MapPin,
    title: "Venue with Maps",
    description: "Embedded Google Maps for seamless directions.",
    category: "customization",
  },
  {
    icon: Crown,
    title: "Premium Animations",
    description: "3D door reveals, curtains, sparkles & more.",
    category: "experience",
  },
  {
    icon: ImagePlus,
    title: "Custom Image Upload",
    description: "Upload slideshow photos & hero background images.",
    category: "customization",
  },
  {
    icon: Settings2,
    title: "Full Customization",
    description: "Toggle sections, dress codes, events & more.",
    category: "customization",
  },
  {
    icon: BarChart3,
    title: "Analytics & Page Views",
    description: "Track guest views, messages, and RSVP responses in real-time.",
    category: "sharing",
  },
  {
    icon: ShieldCheck,
    title: "Auto Privacy Protection",
    description: "Invitation auto-privatizes 30 days after your wedding.",
    category: "sharing",
  },
  {
    icon: Languages,
    title: "Multi-Language Support",
    description: "Support for English, Urdu, and other languages.",
    category: "customization",
  },
];

const tabs: { key: FeatureCategory; label: string }[] = [
  { key: "all", label: "All Features" },
  { key: "experience", label: "Experience" },
  { key: "customization", label: "Customization" },
  { key: "sharing", label: "Sharing" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function Features() {
  const [activeTab, setActiveTab] = useState<FeatureCategory>("all");

  const filteredFeatures =
    activeTab === "all"
      ? features
      : features.filter((f) => f.category === activeTab);

  return (
    <section
      id="features"
      className="py-20 sm:py-28 bg-gradient-to-b from-muted/20 via-background to-muted/20 relative overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="feat-bg" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="20" fill="none" stroke="currentColor" strokeWidth="0.4" className="text-gold" />
              <path d="M30 10 L30 50 M10 30 L50 30" stroke="currentColor" strokeWidth="0.2" className="text-gold" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#feat-bg)" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14 reveal-on-scroll">
          <span className="inline-block font-calligraphy text-gold text-lg mb-3">
            ✦ Premium Features ✦
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Everything You Need for the
            <br />
            <span className="gold-shimmer">Perfect Digital Invitation</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            From grand door-opening reveals to heartfelt guest wishes — every detail crafted for Pakistani weddings.
          </p>
          {/* Decorative gold divider */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60" />
            <div className="w-2 h-2 rounded-full bg-gold/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/60" />
          </div>
        </div>

        {/* Feature Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10 sm:mb-14">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === tab.key
                  ? "bg-emerald text-primary-foreground shadow-md shadow-emerald/20"
                  : "bg-emerald/10 text-foreground hover:bg-emerald/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Feature Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
          >
            {filteredFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={cardVariants}>
                  <Card className="group relative overflow-hidden rounded-xl border-border/30 hover:border-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-gold/5 hover:-translate-y-2 h-full">
                    {/* Gold gradient overlay on hover - top */}
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-gold/0 to-transparent group-hover:from-gold/[0.06] transition-all duration-500 pointer-events-none" />

                    <CardContent className="p-5 flex flex-col items-start gap-3 relative z-10">
                      {/* Icon Container */}
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald/10 to-gold/5 text-emerald group-hover:from-emerald group-hover:to-gold/30 group-hover:text-gold transition-all duration-300">
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Text */}
                      <div>
                        <h3 className="font-display text-sm font-semibold text-foreground leading-snug">
                          {feature.title}
                        </h3>
                        <p className="mt-1.5 text-muted-foreground text-xs leading-relaxed">
                          {feature.description}
                        </p>
                      </div>

                      {/* Subtle gold accent line at bottom (expands from center on hover) */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-transparent via-gold/50 to-transparent group-hover:left-0 group-hover:translate-x-0 transition-all duration-500" />
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
