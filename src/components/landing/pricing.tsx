"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Sparkles, ArrowRight, Lock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/language-provider";

interface PricingProps {
  onSelectPlan?: (planId: "classic" | "royal") => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function Pricing({ onSelectPlan }: PricingProps) {
  const { t, language } = useLanguage();
  const [hovered, setHovered] = useState<"classic" | "royal" | null>(null);

  const plans = [
    {
      id: "classic" as const,
      name: t("pricing.classic.name"),
      price: t("pricing.classic.price").replace("Rs. ", ""),
      originalPrice: "5,500",
      period: language === 'en' ? "/ invitation" : "/ دعوت نامہ",
      description: t("pricing.classic.desc"),
      features: [
        t("pricing.feat.templates.classic"),
        t("pricing.feat.rsvp"),
        t("pricing.feat.wishes"),
        t("pricing.feat.music"),
        t("pricing.feat.countdown"),
        t("pricing.feat.maps"),
        t("pricing.feat.edits"),
        t("pricing.feat.valid"),
      ],
      cta: language === 'en' ? "Start with Classic" : "کلاسک سے شروع کریں",
      highlighted: false,
      badgeText: t("pricing.classic.badge"),
      savings: null,
    },
    {
      id: "royal" as const,
      name: t("pricing.royal.name"),
      price: t("pricing.royal.price").replace("Rs. ", ""),
      originalPrice: "7,299",
      period: language === 'en' ? "/ invitation" : "/ دعوت نامہ",
      description: t("pricing.royal.desc"),
      features: [
        language === 'en' ? "Everything in Classic, Plus:" : "کلاسک کی تمام خصوصیات، اور ساتھ:",
        t("pricing.feat.templates.royal"),
        t("pricing.feat.doors"),
        t("pricing.feat.scratch"),
        t("pricing.feat.guestlinks"),
        t("pricing.feat.shagun"),
        language === 'en' ? "Dress Code Swatches" : "ڈریس کوڈ معلومات",
        language === 'en' ? "Travel & Accommodation Info" : "سفر اور رہائش کی تفصیلات",
      ],
      cta: language === 'en' ? "Unlock Royal Experience" : "شاہی تجربہ حاصل کریں",
      highlighted: true,
      badgeText: t("pricing.royal.badge"),
      savings: language === 'en' ? "Save Rs. 1,500" : "1,500 روپے بچت",
    },
  ];

  return (
    <section id="pricing" className="py-24 sm:py-32 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-emerald-dark/10 to-background" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 reveal-on-scroll">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/10 text-gold text-sm font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            {t("pricing.badge")}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            {t("pricing.title")}
          </h2>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
            <div className="h-1.5 w-1.5 rounded-full bg-gold/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
          </div>
          <p className="mt-5 text-muted-foreground max-w-xl mx-auto text-base sm:text-lg text-center">
            {t("pricing.subtitle")}
          </p>
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
                key={plan.id}
                variants={cardVariants}
                onMouseEnter={() => setHovered(plan.id)}
                onMouseLeave={() => hovered === plan.id && setHovered(null)}
                className={`relative rounded-2xl overflow-hidden transition-all duration-500 shadow-md flex flex-col h-full ${
                  plan.highlighted
                    ? "border border-gold/40 shadow-xl shadow-gold/5 hover:shadow-gold/15 hover:shadow-2xl"
                    : "border border-border/20 hover:border-gold/20 hover:shadow-xl hover:shadow-gold/5"
                } ${isHovered ? "-translate-y-2" : ""}`}
                style={{
                  background: plan.highlighted
                    ? "linear-gradient(145deg, oklch(0.22 0.04 80 / 0.75), oklch(0.18 0.03 155 / 0.95))"
                    : "var(--card)",
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

                <div className="p-7 sm:p-9 flex flex-col flex-grow text-left">
                  {/* Plan name */}
                  <h3 className="font-display text-2xl font-bold text-foreground mb-1 text-left">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground text-left">{plan.description}</p>

                  {/* Price */}
                  <div className="mt-6 flex items-end gap-2 text-left justify-start">
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
                    <div className="flex flex-col mb-1 text-left">
                      <del className="text-xs text-muted-foreground line-through" aria-label={`Original price was Rs. ${plan.originalPrice}`}>Rs. {plan.originalPrice}</del>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </div>
                  </div>

                  {plan.savings && (
                    <div className="mt-2 self-start inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald/10 border border-emerald/20 text-emerald text-xs font-semibold">
                      <Star className="w-3 h-3 fill-emerald" />
                      {plan.savings}
                    </div>
                  )}

                  {/* Divider */}
                  <div className="my-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                  {/* Features */}
                  <ul className="space-y-3 mb-8 text-left">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 justify-start">
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            plan.highlighted ? "bg-gold/20 text-gold" : "bg-emerald/10 text-emerald"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        <span
                          className={`text-sm text-left ${
                            i === 0 && plan.highlighted ? "text-gold font-semibold" : "text-foreground/75"
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-auto pt-6 text-center">
                    <Button
                      onClick={() => onSelectPlan?.(plan.id)}
                      size="lg"
                      className={`w-full font-bold text-base h-13 rounded-xl transition-all duration-300 ${
                        plan.highlighted
                          ? "bg-gold hover:bg-gold-light text-emerald-dark pulse-glow border-none shadow-lg shadow-gold/25"
                          : "bg-card border border-emerald/60 text-emerald hover:bg-emerald hover:text-primary-foreground hover:border-emerald shadow-sm"
                      }`}
                    >
                      {plan.highlighted && <Crown className="w-4 h-4 mr-2" />}
                      {plan.cta}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">{t("pricing.guarantee")}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Add-ons Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-12 bg-card border border-border/30 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 mb-2 justify-start">
              <Badge className="bg-emerald/10 text-emerald border-emerald/20 px-2 py-0.5 text-[10px]">
                {language === 'en' ? 'NEW ADD-ON' : 'نیا فیچر'}
              </Badge>
              <h3 className="font-display text-xl font-bold text-foreground">
                {language === 'en' ? 'Personalized Guest Links' : 'مہمانوں کے نام کے ساتھ لنکس'}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed text-left">
              {language === 'en'
                ? 'Send unique, personalized links to your guests. Greet them by name ("Dear Ahmed Family") and track individual RSVPs with precision. Includes up to 50 unique guest links.'
                : 'اپنے مہمانوں کو منفرد اور ان کے نام کے ساتھ دعوت نامہ لنکس بھیجیں۔ انہیں نام سے مخاطب کریں (مثلاً احمد فیملی) اور لائیو جوابات حاصل کریں۔ اس میں 50 لنکس شامل ہیں۔'}
            </p>
          </div>
          <div className="flex items-center gap-6 md:border-l md:border-border/30 md:pl-8 justify-start">
            <div className="flex flex-col text-left">
              <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {language === 'en' ? 'Add-on Price' : 'اضافی قیمت'}
              </span>
              <div className="flex items-baseline gap-1 justify-start">
                <span className="text-sm text-foreground">Rs.</span>
                <span className="font-display text-3xl font-bold text-foreground">1,000</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {language === 'en' ? 'per 50 guests' : 'فی 50 مہمان'}
              </span>
            </div>
            <Button
              onClick={() => {
                onSelectPlan?.("royal");
              }}
              variant="outline"
              className="border-emerald/30 text-emerald hover:bg-emerald hover:text-white"
            >
              {language === 'en' ? 'Add to Plan' : 'شامل کریں'}
            </Button>
          </div>
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
            <p className="text-sm text-muted-foreground text-left">
              {language === 'en' ? 'Already on Classic? ' : 'پہلے سے کلاسک موجود ہے؟ '}
              <span className="text-gold font-semibold hover:text-gold-light underline underline-offset-4 decoration-gold/30">
                {language === 'en' ? 'Upgrade to Royal' : 'رائل پر اپ گریڈ کریں'}
              </span>{' '}
              {language === 'en' ? 'anytime' : 'کسی بھی وقت'}
            </p>
            <ArrowRight className="w-4 h-4 text-gold shrink-0 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-end">
            <Lock className="w-3.5 h-3.5 text-emerald shrink-0" />
            {language === 'en' ? 'Secure payments · SSL encrypted' : 'محفوظ ادائیگی · SSL انکرپٹڈ'}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
