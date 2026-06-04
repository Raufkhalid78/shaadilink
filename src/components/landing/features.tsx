"use client";

import { motion } from "framer-motion";
import {
  DoorOpen,
  Sparkles,
  PartyPopper,
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

const features = [
  {
    icon: Share2,
    title: "Share to Unlimited Guests",
    description: "One link, infinite reach — no per-guest charges, ever.",
  },
  {
    icon: Pencil,
    title: "Unlimited Edits Until the Wedding Date",
    description: "Refine every detail right up to your big day.",
  },
  {
    icon: Sparkles,
    title: "Scratch to Reveal Date",
    description: "Interactive scratch card reveals the wedding date with a delightful surprise.",
  },
  {
    icon: Timer,
    title: "Live Countdown",
    description: "Animated countdown timer to your special day.",
  },
  {
    icon: MessageCircleHeart,
    title: "Guest Messaging & Inbox",
    description: "Receive messages, attendance confirmations & guest counts.",
  },
  {
    icon: Music,
    title: "Background Music",
    description: "Romantic instrumentals with elegant mute toggle.",
  },
  {
    icon: MapPin,
    title: "Venue with Maps",
    description: "Embedded Google Maps for seamless directions.",
  },
  {
    icon: Crown,
    title: "Premium Animations",
    description: "3D door reveals, curtains, sparkles & more.",
  },
  {
    icon: ImagePlus,
    title: "Custom Image Upload",
    description: "Upload slideshow photos & hero background images.",
  },
  {
    icon: Settings2,
    title: "Full Customization",
    description: "Toggle sections, dress codes, events & more.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Page Views",
    description: "Track guest views, messages, and RSVP responses in real-time.",
  },
  {
    icon: ShieldCheck,
    title: "Auto Privacy Protection",
    description: "Invitation auto-privatizes 30 days after your wedding.",
  },
  {
    icon: Languages,
    title: "Multi-Language Support",
    description: "Support for English, Urdu, and other languages in your invitation.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-20 reveal-on-scroll">
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
        </div>

        {/* Feature Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={cardVariants}>
                <Card className="group relative overflow-hidden border-border/50 hover:border-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-gold/5 hover:-translate-y-1 h-full">
                  <CardContent className="p-5 flex flex-col items-start gap-3">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-emerald/10 text-emerald group-hover:bg-emerald group-hover:text-primary-foreground transition-colors duration-300">
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

                    {/* Subtle gold accent line at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/0 to-transparent group-hover:via-gold/50 transition-all duration-500" />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
