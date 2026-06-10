"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Timer, MapPin, MessageCircleHeart, Share2, Pencil,
  Music, Crown, ImagePlus, Settings2, BarChart3, ShieldCheck, Languages,
} from "lucide-react";

type FeatureCategory = "all" | "experience" | "customization" | "sharing";

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  category: FeatureCategory;
  color: string;
  glow: string;
}

const features: Feature[] = [
  {
    icon: Share2, title: "Share to Unlimited Guests",
    description: "One link, infinite reach — no per-guest charges, ever.",
    category: "sharing", color: "from-blue-500 to-indigo-600", glow: "rgba(99, 102, 241, 0.3)",
  },
  {
    icon: Pencil, title: "Unlimited Edits",
    description: "Refine every detail right up to your big day.",
    category: "customization", color: "from-violet-500 to-purple-600", glow: "rgba(139, 92, 246, 0.3)",
  },
  {
    icon: Sparkles, title: "Scratch to Reveal Date",
    description: "Interactive scratch card reveals the wedding date with a delightful surprise.",
    category: "experience", color: "from-gold to-amber-400", glow: "rgba(212, 168, 83, 0.4)",
  },
  {
    icon: Timer, title: "Live Countdown",
    description: "Animated countdown timer ticking down to your special day.",
    category: "experience", color: "from-rose-500 to-pink-600", glow: "rgba(244, 63, 94, 0.3)",
  },
  {
    icon: MessageCircleHeart, title: "Guest Messaging & Inbox",
    description: "Receive heartfelt messages, RSVPs & guest attendance confirmations.",
    category: "sharing", color: "from-emerald to-teal-500", glow: "rgba(82, 170, 120, 0.35)",
  },
  {
    icon: Music, title: "Background Music",
    description: "Romantic instrumentals with elegant one-touch mute toggle.",
    category: "experience", color: "from-sky-500 to-cyan-600", glow: "rgba(14, 165, 233, 0.3)",
  },
  {
    icon: MapPin, title: "Venue with Maps",
    description: "Embedded Google Maps for seamless directions to your venue.",
    category: "customization", color: "from-red-500 to-orange-600", glow: "rgba(239, 68, 68, 0.3)",
  },
  {
    icon: Crown, title: "Premium Animations",
    description: "3D door reveals, curtains, sparkles & cinematic entrances.",
    category: "experience", color: "from-gold to-yellow-400", glow: "rgba(212, 168, 83, 0.45)",
  },
  {
    icon: ImagePlus, title: "Custom Image Upload",
    description: "Upload your own hero background and slideshow photos.",
    category: "customization", color: "from-fuchsia-500 to-pink-600", glow: "rgba(217, 70, 239, 0.3)",
  },
  {
    icon: Settings2, title: "Full Customization",
    description: "Toggle sections, events, dress codes & more with ease.",
    category: "customization", color: "from-slate-400 to-gray-500", glow: "rgba(100, 116, 139, 0.3)",
  },
  {
    icon: BarChart3, title: "Analytics & Page Views",
    description: "Track guest views, messages, and RSVP responses in real-time.",
    category: "sharing", color: "from-lime-500 to-green-600", glow: "rgba(132, 204, 22, 0.3)",
  },
  {
    icon: ShieldCheck, title: "Auto Privacy Protection",
    description: "Invitation auto-privatizes 30 days after your wedding — zero effort.",
    category: "sharing", color: "from-emerald to-green-500", glow: "rgba(34, 197, 94, 0.3)",
  },
  {
    icon: Languages, title: "Multi-Language Support",
    description: "Support for English, Urdu, and AI-powered translations.",
    category: "customization", color: "from-amber-500 to-orange-500", glow: "rgba(245, 158, 11, 0.3)",
  },
];

const tabs: { key: FeatureCategory; label: string; emoji: string }[] = [
  { key: "all", label: "All Features", emoji: "✨" },
  { key: "experience", label: "Experience", emoji: "🎭" },
  { key: "customization", label: "Customization", emoji: "🎨" },
  { key: "sharing", label: "Sharing", emoji: "📤" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" as const } },
};

export function Features() {
  const [activeTab, setActiveTab] = useState<FeatureCategory>("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filteredFeatures =
    activeTab === "all" ? features : features.filter((f) => f.category === activeTab);

  return (
    <section
      id="features"
      className="py-24 sm:py-32 relative overflow-hidden"
    >
      {/* Rich background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-emerald-dark/20 to-background" />
      <div className="absolute inset-0 opacity-[0.025]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="feat-bg" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="20" fill="none" stroke="#d4a853" strokeWidth="0.4" />
              <path d="M30 10 L30 50 M10 30 L50 30" stroke="#d4a853" strokeWidth="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#feat-bg)" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 reveal-on-scroll">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/10 text-gold text-sm font-medium mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Premium Features
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground"
          >
            Everything You Need for the
            <br />
            <span className="gold-shimmer">Perfect Digital Invitation</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg"
          >
            From grand door-opening reveals to heartfelt guest wishes — every detail crafted for Pakistani weddings.
          </motion.p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-gold/50" />
            <div className="w-2 h-2 rounded-full bg-gold/60" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-gold/50" />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {tabs.map((tab) => (
            <motion.button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5 border ${
                activeTab === tab.key
                  ? "bg-emerald text-primary-foreground shadow-lg shadow-emerald/30 border-emerald"
                  : "bg-card/60 text-muted-foreground hover:text-foreground border-border/30 hover:border-gold/30"
              }`}
            >
              <span>{tab.emoji}</span>
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Feature Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
          >
            {filteredFeatures.map((feature) => {
              const Icon = feature.icon;
              const isHovered = hoveredId === feature.title;
              return (
                <motion.div
                  key={feature.title}
                  variants={cardVariants}
                  onMouseEnter={() => setHoveredId(feature.title)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group relative rounded-2xl border border-border/20 bg-card/50 backdrop-blur-sm overflow-hidden cursor-default transition-all duration-300 hover:border-gold/30 hover:-translate-y-2 hover:shadow-xl"
                  style={
                    isHovered
                      ? { boxShadow: `0 20px 60px ${feature.glow}, 0 4px 20px rgba(0,0,0,0.4)` }
                      : { boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }
                  }
                >
                  {/* Gradient overlay top-left on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 20% 20%, ${feature.glow} 0%, transparent 60%)`,
                    }}
                  />

                  <div className="relative z-10 p-5 flex flex-col items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>

                    {/* Text */}
                    <div>
                      <h3 className="font-display text-sm font-semibold text-foreground leading-snug group-hover:text-gold transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="mt-1.5 text-muted-foreground text-xs leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div
                    className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-gradient-to-r ${feature.color} transition-all duration-500`}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
