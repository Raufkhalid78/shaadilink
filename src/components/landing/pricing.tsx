"use client";

import { motion } from "framer-motion";
import { Check, Crown, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    id: "classic" as const,
    name: "Classic",
    price: "2,499",
    period: "/invitation",
    description: "Elegant classic invitations — everything you need for a beautiful digital invitation.",
    features: [
      "Access to ShaadiLink Classic Invitations",
      "8 Premium Animated Templates",
      "1 Invitation Webpage",
      "Unlimited Edits Until Wedding Date",
      "Buy More Invitations Anytime (Add-On)",
      "Guest Messaging & Inbox",
      "Music, Photos & Custom Uploads",
      "Google Maps & Multi-Language Support",
      "Analytics & Page View Tracking",
      "Automatic Privacy Protection After Wedding",
    ],
    cta: "Start with Classic",
    highlighted: false,
    badgeText: "MOST POPULAR",
  },
  {
    id: "royal" as const,
    name: "Royal",
    price: "3,999",
    period: "/invitation",
    description: "Premium cinematic experience with all premium features unlocked.",
    features: [
      "Everything in Classic, Plus:",
      "Access to ALL Classic + Royal Invitations",
      "10 Premium Animated Templates",
      "Cinematic Royal Invitation Experience",
      "Scratch Card Reveal & Fireworks",
      "3D Door & Curtain Reveal Animations",
      "Cinematic Hero Backgrounds",
      "Premium Motion Storytelling",
      "Exclusive Royal Template Collection",
      "Priority Support",
    ],
    cta: "Unlock Royal Experience",
    highlighted: true,
    badgeText: "PREMIUM CINEMATIC",
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

interface PricingProps {
  onSelectPlan?: (plan: "classic" | "royal") => void;
}

export function Pricing({ onSelectPlan }: PricingProps) {
  return (
    <section
      id="pricing"
      className="py-20 sm:py-28 bg-gradient-to-b from-muted/50 to-background"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-20 reveal-on-scroll">
          <span className="inline-block font-calligraphy text-gold text-lg mb-3">
            ✦ Choose Your Experience ✦
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Choose Your Invitation Experience
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base sm:text-lg">
            Elegant classic invitations or immersive cinematic luxury experiences.
          </p>
        </div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {plans.map((plan) => (
            <motion.div key={plan.name} variants={cardVariants}>
              <Card
                className={`relative overflow-hidden h-full transition-all duration-300 hover:shadow-xl ${
                  plan.highlighted
                    ? "border-2 border-gold shadow-lg shadow-gold/10 hover:shadow-gold/20"
                    : "border-border/50 hover:border-gold/30"
                }`}
              >
                {/* Badge */}
                {plan.highlighted && (
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-none rounded-bl-lg bg-gold text-emerald-dark font-semibold px-4 py-1.5 text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      {plan.badgeText}
                    </Badge>
                  </div>
                )}
                {!plan.highlighted && (
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-none rounded-bl-lg bg-emerald/80 text-primary-foreground font-semibold px-4 py-1.5 text-xs">
                      {plan.badgeText}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-2 pt-6 px-6 sm:px-8">
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.description}
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-sm text-muted-foreground">Rs.</span>
                    <span className="font-display text-4xl sm:text-5xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {plan.period}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="px-6 sm:px-8 pb-8 pt-4">
                  {/* Features list */}
                  <ul className="space-y-2.5 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            plan.highlighted
                              ? "bg-gold/20 text-gold"
                              : "bg-emerald/10 text-emerald"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-sm text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    onClick={() => onSelectPlan?.(plan.id)}
                    size="lg"
                    className={`w-full font-semibold text-base h-12 ${
                      plan.highlighted
                        ? "bg-gold hover:bg-gold-light text-emerald-dark pulse-glow border-none"
                        : "bg-emerald hover:bg-emerald-dark text-primary-foreground border border-gold/20"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Upgrade notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-gold/20 bg-gold/5">
            <Sparkles className="w-4 h-4 text-gold" />
            <p className="text-sm text-muted-foreground">
              Already purchased Classic?{" "}
              <span className="text-gold font-semibold">Upgrade to Royal</span> anytime
              without repurchasing the full plan.
            </p>
            <ArrowRight className="w-4 h-4 text-gold" />
          </div>
        </motion.div>

        {/* Security badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-emerald" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Secure payments via SSL encryption
          </div>
        </div>
      </div>
    </section>
  );
}
