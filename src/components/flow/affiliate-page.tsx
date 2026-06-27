"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  DollarSign,
  Send,
  CheckCircle,
  Users,
  TrendingUp,
  Gift,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

interface AffiliatePageProps {
  onBack: () => void;
}

export function AffiliatePage({ onBack }: AffiliatePageProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    socialId: "",
    promotion: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email";
    if (!formData.promotion.trim()) newErrors.promotion = "Please describe how you plan to promote";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          socialId: formData.socialId,
          promotionPlan: formData.promotion,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to submit application.");
        return;
      }
      setSubmitted(true);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Breadcrumb path */}
      <PageBreadcrumb
        crumbs={[
          { label: "Home", onClick: onBack },
          { label: "Affiliate Programme" },
        ]}
      />

      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="relative py-16 sm:py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-emerald/5" />
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 mb-6">
                <DollarSign className="w-4 h-4 text-gold" />
                <span className="text-sm font-semibold text-gold">Affiliate Program</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Earn up to{" "}
                <span className="gold-shimmer">25%</span>{" "}
                from the sales you bring in
              </h1>
              <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
                Share ShaadiLink with your audience and earn commissions on every
                successful referral. It&apos;s free to join!
              </p>
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: TrendingUp,
                  title: "25% Commission",
                  description: "Earn a generous commission on every sale you generate.",
                },
                {
                  icon: Users,
                  title: "Growing Market",
                  description: "Pakistani weddings are a huge market with massive demand.",
                },
                {
                  icon: Gift,
                  title: "Easy to Promote",
                  description: "Share via WhatsApp, social media, blogs, or word of mouth.",
                },
              ].map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <Card
                    key={benefit.title}
                    className="border-border/50 hover:border-gold/30 transition-all"
                  >
                    <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-display font-semibold text-foreground">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-12 sm:py-16 px-4">
          <div className="mx-auto max-w-xl">
            <Card className="border-border/50">
              <CardContent className="p-6 sm:p-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Apply to Become an Affiliate
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Fill out the form below and we&apos;ll review your application.
                </p>

                {submitted ? (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.6 }}
                    >
                      <CheckCircle className="w-16 h-16 text-emerald mx-auto mb-4" />
                    </motion.div>
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                      Application Submitted!
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      We&apos;ll review your application and get back to you via email within
                      3–5 business days.
                    </p>
                    <p className="text-xs text-muted-foreground mt-3 italic">
                      Please check your emails actively for further communication.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Name <span className="text-red-400">*</span>
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Your full name"
                        className={`h-11 ${errors.name ? "border-red-400" : ""}`}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Email <span className="text-red-400">*</span>
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="you@example.com"
                        className={`h-11 ${errors.email ? "border-red-400" : ""}`}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Social ID / Profile Link
                      </label>
                      <Input
                        value={formData.socialId}
                        onChange={(e) =>
                          setFormData({ ...formData, socialId: e.target.value })
                        }
                        placeholder="Instagram, YouTube, blog URL, etc."
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        How will you promote ShaadiLink? <span className="text-red-400">*</span>
                      </label>
                      <Textarea
                        value={formData.promotion}
                        onChange={(e) =>
                          setFormData({ ...formData, promotion: e.target.value })
                        }
                        placeholder="Describe your audience and how you plan to promote..."
                        className={`min-h-[100px] resize-none ${
                          errors.promotion ? "border-red-400" : ""
                        }`}
                      />
                      {errors.promotion && (
                        <p className="text-xs text-red-500">{errors.promotion}</p>
                      )}
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="w-full h-12 bg-gold hover:bg-gold-light text-emerald-dark font-semibold text-base gap-2"
                    >
                      {isLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Submit Application</>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center italic">
                      Further communication will be done via emails, so please check your
                      emails actively.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
