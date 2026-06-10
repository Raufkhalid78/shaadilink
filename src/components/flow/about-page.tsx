"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Sparkles,
  Palette,
  Zap,
  Globe,
  Shield,
  Users,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AboutPageProps {
  onBack: () => void;
}

const values = [
  {
    icon: Palette,
    title: "Premium Design",
    description:
      "Every template is handcrafted with attention to typography, color, and animation — inspired by Pakistani wedding traditions.",
  },
  {
    icon: Zap,
    title: "Interactive Features",
    description:
      "Scratch cards, countdowns, messaging, music — not just a static page, but a full interactive experience.",
  },
  {
    icon: Globe,
    title: "Instantly Shareable",
    description:
      "One link works on every device. Share via WhatsApp, email, or social media — no app download required.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export function AboutPage({ onBack }: AboutPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={onBack}
              className="gap-2 text-foreground/70 hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald text-primary-foreground">
                <Heart className="h-4 w-4 fill-current" />
              </div>
              <span className="font-display text-lg font-bold">
                Shaadi<span className="text-gold">Link</span>
              </span>
            </div>

            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-16 sm:py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-dark/5 to-transparent" />
          <div className="absolute inset-0 opacity-[0.03]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="about-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
                  <circle cx="40" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#about-pattern)" />
            </svg>
          </div>

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold/50" />
                <Sparkles className="w-5 h-5 text-gold" />
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold/50" />
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
                About <span className="gold-shimmer">ShaadiLink</span>
              </h1>
              <p className="mt-4 font-calligraphy text-gold text-lg sm:text-xl">
                Where Tradition Meets Technology
              </p>
            </motion.div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-12 sm:py-16 px-4">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-gold fill-gold/20" />
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                  Our Story
                </h2>
              </div>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                ShaadiLink was born from a simple belief: your wedding invitation should be
                as beautiful and memorable as the celebration itself. We noticed Pakistani
                families spending weeks coordinating paper invitations — printing, addressing,
                mailing — only to lose the personal touch in the process. So we set out to
                build something better.
              </p>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                We create personalized digital wedding invitation webpages that combine the
                warmth of traditional Pakistani invitations with the convenience and
                interactivity of the modern web. From <span className="text-gold font-semibold">Mehndi</span> to{" "}
                <span className="text-gold font-semibold">Baraat</span> to{" "}
                <span className="text-gold font-semibold">Walima</span>, every event deserves
                an invitation that honors the tradition.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-12 sm:py-16 px-4 bg-muted/30">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="p-6 sm:p-8 rounded-2xl border border-border/50 bg-card"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald/10 text-emerald">
                    <Star className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Our Mission
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  To simplify wedding invitations by making them digital, beautiful, and
                  effortless. No design skills needed, no app downloads required — just fill
                  in your details and share a link. That&apos;s it.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="p-6 sm:p-8 rounded-2xl border border-gold/20 bg-card"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                    <Shield className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Our Vision
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  We envision a world where every Pakistani family — regardless of budget or
                  location — can share an elegant, interactive, and environmentally friendly
                  wedding invitation with their loved ones, instantly.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="py-16 sm:py-20 px-4">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                What Makes Us <span className="gold-shimmer">Different</span>
              </h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Not just another digital card — a complete interactive experience.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <motion.div key={value.title} variants={itemVariants}>
                    <Card className="group relative overflow-hidden border-border/50 hover:border-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-gold/5 h-full">
                      <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald/10 text-emerald group-hover:bg-emerald group-hover:text-primary-foreground transition-colors duration-300">
                          <Icon className="h-7 w-7" />
                        </div>
                        <div>
                          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                            {value.title}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {value.description}
                          </p>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/0 to-transparent group-hover:via-gold/50 transition-all duration-500" />
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 sm:py-16 px-4 bg-emerald-dark text-white">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "5,000+", label: "Happy Families" },
                { value: "10+", label: "Premium Templates" },
                { value: "99%", label: "Satisfaction Rate" },
                { value: "24/7", label: "Support Available" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-3xl sm:text-4xl font-bold text-gold">
                    {stat.value}
                  </p>
                  <p className="text-white/60 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="py-12 sm:py-16 px-4">
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed italic">
                &ldquo;We&apos;re a small team with a big love for Pakistani weddings and great design.
                Every invitation we create is a reminder that the most meaningful things in
                life deserve to be shared beautifully.&rdquo;
              </p>
              <p className="mt-4 text-gold font-display font-semibold">
                — The ShaadiLink Team
              </p>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
