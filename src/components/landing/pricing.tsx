"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Sparkles, ArrowRight, Lock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    id: "classic" as const,
    name: "Classic",
    price: "2,499",
    originalPrice: "3,499",
    period: "/ invitation",
    description: "Elegant classic invitations — everything you need for a beautiful digital celebration.",
    features: [
      "8 Premium Animated Templates",
      "1 Invitation Webpage",
      "Unlimited Edits Until Wedding Date",
      "Guest Messaging & Inbox",
      "Music, Photos & Custom Uploads",
      "Google Maps & Multi-Language",
      "Analytics & Page View Tracking",
      "Automatic Privacy Protection",
    ],
    cta: "Start with Classic",
    highlighted: false,
    badgeText: "POPULAR",
    savings: null,
  },
  {
    id: "royal" as const,
    name: "Royal",
    price: "3,999",
    originalPrice: "5,499",
    period: "/ invitation",
    description: "Premium cinematic experience — unlock every feature for the grandest celebration.",
    features: [
      "Everything in Classic, Plus:",
      "All 18 Classic + Royal Templates",
      "Cinematic 3D Door & Curtain Reveals",
      "Scratch Card Date Reveal + Fireworks",
      "Add to Calendar Integration",
      "Pakistani Digital Shagun & Registry",
      "Dress Code Swatches (Ladies/Gentlemen)",
      "Travel & Accommodation Info Blocks",
      "Premium Motion Storytelling",
      "Exclusive Royal Template Collection",
      "Priority Support 24/7",
    ],
    cta: "Unlock Royal Experience",
    highlighted: true,
    badgeText: "PREMIUM",
    savings: "Save Rs. 1,500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

interface PricingProps {
  onSelectPlan?: (plan: "classic" | "royal") => void;
}

export function Pricing({ onSelectPlan }: PricingProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section id="pricing" className="py-24 sm:py-32 relative overflow-hidden">
      {/* Rich background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-emerald-dark/15 to-background" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 30% 60%, rgba(212,168,83,0.06) 0%, transparent 55%), radial-gradient(ellipse at 70% 40%, rgba(82,170,120,0.06) 0%, transparent 55%)",
        }}
      />

      {/* Subtle Islamic pattern */}
      <div className="absolute inset-0 opacity-[0.018]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="pricing-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M50 5 L61.8 21.8 L81.8 18.2 L70 35 L81.8 51.8 L61.8 48.2 L50 65 L38.2 48.2 L18.2 51.8 L30 35 L18.2 18.2 L38.2 21.8 Z"
                fill="none" stroke="#d4a853" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pricing-pattern)" />
        </svg>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 sm:mb-20 reveal-on-scroll">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/10 text-gold text-sm font-medium mb-4"
          >
            <Crown className="w-3.5 h-3.5" />
            Choose Your Experience
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground"
          >
            Choose Your <span className="gold-shimmer">Invitation Plan</span>
          </motion.h2>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
            <div className="h-1.5 w-1.5 rounded-full bg-gold/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-5 text-muted-foreground max-w-xl mx-auto text-base sm:text-lg"
          >
            Elegant classic invitations or immersive cinematic luxury — both crafted for Pakistani weddings.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
        >
          {plans.map((plan) => {
            const isHovered = hovered === plan.id;
            return (
              <motion.div
                key={plan.name}
                variants={cardVariants}
                onMouseEnter={() => setHovered(plan.id)}
                onMouseLeave={() => setHovered(null)}
                className={`relative rounded-2xl overflow-hidden transition-all duration-500 shadow-md ${
                  plan.highlighted
                    ? "border border-gold/40 shadow-xl shadow-gold/5 hover:shadow-gold/15 hover:shadow-2xl"
                    : "border border-border/20 hover:border-gold/20 hover:shadow-xl hover:shadow-gold/5"
                } ${isHovered ? "-translate-y-2" : ""}`}
                style={{
                  background: plan.highlighted
                    ? "linear-gradient(145deg, oklch(0.16 0.035 80 / 0.7), oklch(0.12 0.025 155 / 0.9))"
                    : "oklch(0.14 0.022 155 / 0.8)",
                  backdropFilter: "blur(20px)",
                }}
              >
                {/* Animated top gradient bar */}
                <div className="h-1 w-full overflow-hidden relative">
                  <div
                    className={`absolute inset-0 ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-gold/60 via-gold-light to-gold/60"
                        : "bg-gradient-to-r from-emerald/40 via-emerald to-emerald/40"
                    }`}
                  />
                  {plan.highlighted && (
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[blockShimmerComposited_2.5s_infinite]"
                    />
                  )}
                </div>

                {/* Glow orb behind the royal card */}
                {plan.highlighted && (
                  <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(212,168,83,0.12) 0%, transparent 70%)" }}
                  />
                )}

                {/* Badge */}
                <div className="absolute top-5 right-5">
                  <Badge
                    className={`rounded-lg font-bold px-3 py-1 text-xs flex items-center gap-1.5 ${
                      plan.highlighted
                        ? "bg-gold text-emerald-dark shadow-lg shadow-gold/30"
                        : "bg-emerald/80 text-primary-foreground border border-emerald/40"
                    }`}
                  >
                    {plan.highlighted && <Crown className="h-3 w-3" />}
                    {plan.badgeText}
                  </Badge>
                </div>

                <div className="p-7 sm:p-9">
                  {/* Plan name */}
                  <h3 className="font-display text-2xl font-bold text-foreground mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>

                  {/* Price */}
                  <div className="mt-6 flex items-end gap-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm text-muted-foreground">Rs.</span>
                      <span
                        className={`font-display text-5xl font-bold ${
                          plan.highlighted ? "text-gold text-glow-gold" : "text-foreground"
                        }`}
                      >
                        {plan.price}
                      </span>
                    </div>
                    <div className="flex flex-col mb-1">
                      <span className="text-xs text-muted-foreground line-through">Rs. {plan.originalPrice}</span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </div>
                  </div>

                  {plan.savings && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald/10 border border-emerald/20 text-emerald text-xs font-semibold">
                      <Star className="w-3 h-3 fill-emerald" />
                      {plan.savings}
                    </div>
                  )}

                  {/* Divider */}
                  <div className="my-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            plan.highlighted ? "bg-gold/20 text-gold" : "bg-emerald/10 text-emerald"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        <span
                          className={`text-sm ${
                            i === 0 && plan.highlighted ? "text-gold font-semibold" : "text-foreground/75"
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    onClick={() => onSelectPlan?.(plan.id)}
                    size="lg"
                    className={`w-full font-bold text-base h-13 rounded-xl transition-all duration-300 ${
                      plan.highlighted
                        ? "bg-gold hover:bg-gold-light text-emerald-dark pulse-glow border-none shadow-lg shadow-gold/25"
                        : "bg-emerald/10 hover:bg-emerald text-emerald hover:text-primary-foreground border border-emerald/30"
                    }`}
                  >
                    {plan.highlighted && <Crown className="w-4 h-4 mr-2" />}
                    {plan.cta}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom notices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div 
            onClick={() => onSelectPlan?.("royal")}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-gold/15 bg-gold/5 cursor-pointer hover:bg-gold/10 hover:border-gold/30 transition-all duration-300 group"
          >
            <Sparkles className="w-4 h-4 text-gold shrink-0 group-hover:scale-110 transition-transform" />
            <p className="text-sm text-muted-foreground">
              Already on Classic?{" "}
              <span className="text-gold font-semibold hover:text-gold-light underline underline-offset-4 decoration-gold/30">Upgrade to Royal</span> anytime
            </p>
            <ArrowRight className="w-4 h-4 text-gold shrink-0 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5 text-emerald shrink-0" />
            Secure payments · SSL encrypted
          </div>
        </motion.div>
      </div>
    </section>
  );
}
