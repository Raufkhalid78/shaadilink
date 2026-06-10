"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CONTACT_CONFIG } from "@/lib/config";
import {
  ArrowLeft,
  Heart,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  Phone,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface ContactPageProps {
  onBack: () => void;
}

export function ContactPage({ onBack }: ContactPageProps) {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to send message. Please try again.");
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

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-16 sm:py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-dark/5 to-transparent" />
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground">
                Contact <span className="gold-shimmer">Us</span>
              </h1>
              <p className="mt-4 text-muted-foreground text-lg">
                We&apos;d love to hear from you
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Content */}
        <section className="pb-20 px-4">
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {/* Contact Info */}
              <div className="md:col-span-2 space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                    Get In Touch
                  </h2>

                  <div className="space-y-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald/10 text-emerald">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">Email</p>
                        <a
                          href={`mailto:${CONTACT_CONFIG.email}`}
                          className="text-gold hover:text-gold-light text-sm transition-colors"
                        >
                          {CONTACT_CONFIG.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald/10 text-emerald">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">Phone</p>
                        <p className="text-muted-foreground text-sm">{CONTACT_CONFIG.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald/10 text-emerald">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">Location</p>
                        <p className="text-muted-foreground text-sm">{CONTACT_CONFIG.address}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald/10 text-emerald">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">Response Time</p>
                        <p className="text-muted-foreground text-sm">
                          {CONTACT_CONFIG.responseTime}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Contact Form */}
              <div className="md:col-span-3">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="border-border/50">
                    <CardContent className="p-6 sm:p-8">
                      {submitted ? (
                        <div className="text-center py-8">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.6 }}
                          >
                            <CheckCircle className="w-16 h-16 text-emerald mx-auto mb-4" />
                          </motion.div>
                          <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                            Message Sent!
                          </h3>
                          <p className="text-muted-foreground">
                            Thank you for reaching out. We&apos;ll get back to you within 24–48 hours.
                          </p>
                          <Button
                            onClick={() => {
                              setSubmitted(false);
                              setFormData({ name: "", email: "", message: "" });
                            }}
                            className="mt-6 bg-emerald hover:bg-emerald-dark text-primary-foreground border border-gold/30"
                          >
                            Send Another Message
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-5">
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
                              Message <span className="text-red-400">*</span>
                            </label>
                            <Textarea
                              value={formData.message}
                              onChange={(e) =>
                                setFormData({ ...formData, message: e.target.value })
                              }
                              placeholder="How can we help you?"
                              className={`min-h-[140px] resize-none ${
                                errors.message ? "border-red-400" : ""
                              }`}
                            />
                            {errors.message && (
                              <p className="text-xs text-red-500">{errors.message}</p>
                            )}
                          </div>

                          <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full h-12 bg-emerald hover:bg-emerald-dark text-primary-foreground border border-gold/30 font-semibold text-base gap-2"
                          >
                            {isLoading ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                            ) : (
                              <><Send className="w-4 h-4" /> Send Message</>
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
