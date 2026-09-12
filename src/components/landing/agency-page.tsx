"use client";

import { useState, useEffect } from "react";
import { m } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Sparkles,
  Shield,
  Palette,
  CreditCard,
  Users,
  FileText,
  Eye,
  CheckCircle2,
  Phone,
  Building2,
  Check,
  Send,
  Loader2,
  ChevronDown,
  HelpCircle,
  Clock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

interface AgencyPageProps {
  onBack?: () => void;
}

export function AgencyPage({ onBack }: AgencyPageProps) {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    city: "",
    websiteOrSocial: "",
    monthlyEvents: "6-15",
    notes: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isReapplying, setIsReapplying] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("reapply") === "true") {
        setIsReapplying(true);
      }

      // Pre-fill user details if logged in
      import("@/lib/supabase/client").then(({ createClient }) => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            setFormData((prev) => ({
              ...prev,
              email: prev.email || user.email || "",
              contactName: prev.contactName || user.user_metadata?.full_name || "",
            }));
          }
        });
      });
    }
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.companyName.trim()) errs.companyName = "Company or Agency name is required";
    if (!formData.contactName.trim()) errs.contactName = "Contact person name is required";
    if (!formData.email.trim()) errs.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = "Please enter a valid email address";
    if (!formData.phone.trim()) errs.phone = "WhatsApp / Phone number is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/agency/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to submit application. Please try again.");
        return;
      }

      setSubmitted(true);
      toast.success(data.message || (isReapplying ? "Updated application submitted successfully!" : "Application submitted successfully!"));
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            ) : (
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            )}
            <BrandLogo size="sm" href="/" subtitle="Agency & Planner Portal" />
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild className="border-gold/30 text-gold hover:bg-gold/10">
              <Link href="/dashboard">Host Dashboard</Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold"
            >
              <a href="#apply-section">Apply Now</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Breadcrumb path */}
      <PageBreadcrumb
        crumbs={[
          { label: "Home", href: "/", onClick: onBack },
          { label: "Agency & Event Planners" },
        ]}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-border/50">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-semibold tracking-wide">
            <Briefcase className="w-4 h-4" />
            <span>FOR EVENT PLANNERS & WEDDING AGENCIES</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Power Your Event Agency with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
              Wholesale Credits &amp; 100% White-Label Branding
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
            Deliver luxury, cinematic digital event invitations to your clients. Buy wholesale credits in bulk at up to
            50% off, place your own agency branding in the footer, manage all clients in one command center, and issue
            branded invoices in PKR.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-110 text-zinc-950 font-bold shadow-xl shadow-amber-500/20 px-8 h-12 text-base"
            >
              <a href="#apply-section">Apply for Agency Partner Access</a>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-border/80 hover:bg-muted/30 h-12 text-base">
              <a href="#features-section">Explore Features &amp; Wholesale Pricing</a>
            </Button>
          </div>

          {/* Key Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-8">
            <div className="p-4 rounded-2xl bg-card/60 border border-border/50 text-center">
              <p className="font-display text-2xl sm:text-3xl font-bold text-amber-400">Up to 50%</p>
              <p className="text-xs text-muted-foreground mt-1">Wholesale Discount</p>
            </div>
            <div className="p-4 rounded-2xl bg-card/60 border border-border/50 text-center">
              <p className="font-display text-2xl sm:text-3xl font-bold text-amber-400">100%</p>
              <p className="text-xs text-muted-foreground mt-1">White-Label Branding</p>
            </div>
            <div className="p-4 rounded-2xl bg-card/60 border border-border/50 text-center">
              <p className="font-display text-2xl sm:text-3xl font-bold text-amber-400">1-Click</p>
              <p className="text-xs text-muted-foreground mt-1">Credit Activation</p>
            </div>
            <div className="p-4 rounded-2xl bg-card/60 border border-border/50 text-center">
              <p className="font-display text-2xl sm:text-3xl font-bold text-amber-400">24-48h</p>
              <p className="text-xs text-muted-foreground mt-1">Fast Track Approval</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features-section" className="py-20 bg-muted/10 border-b border-border/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-foreground">
              Everything Your Agency Needs to Scale
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Built specifically for wedding planners, event coordinators, and corporate event management agencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="border-border/60 bg-card/70 hover:border-amber-500/40 transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">Wholesale Bulk Credits</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Purchase wholesale credits in discounted packs of 5, 15, or 30. Publish any client invitation with
                  a single click without entering credit card details every time.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-border/60 bg-card/70 hover:border-amber-500/40 transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Palette className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">100% White-Label Footer</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Replace &ldquo;Smart Invites&rdquo; completely with your own agency name, agency logo, direct WhatsApp number,
                  and website link on every invitation footer.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-border/60 bg-card/70 hover:border-amber-500/40 transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">Multi-Client Command Center</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Manage dozens of weddings and corporate functions seamlessly. Sort by client name, event date,
                  real-time RSVP count, and draft vs. published status.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-border/60 bg-card/70 hover:border-amber-500/40 transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">Branded Client Invoicing</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Generate professional PDF invoices and quotes in PKR. Add your agency service markup, tax
                  breakdown, and export directly for client billing.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="border-border/60 bg-card/70 hover:border-amber-500/40 transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">Private Client Review Links</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Generate private preview links with review watermarks. Let your clients test animations, music,
                  and schedule before official public dispatch.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="border-border/60 bg-card/70 hover:border-amber-500/40 transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">Priority Concierge Support</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  Dedicated VIP partner hotline on WhatsApp. Our design team assists with custom music uploads,
                  bespoke door animations, and urgent client adjustments.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Wholesale Pricing Table */}
      <section className="py-20 border-b border-border/50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">Wholesale Credit Pricing</span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-foreground">
              Tiered Wholesale Credit Packs
            </h2>
            <p className="text-muted-foreground text-sm">
              Each credit activates any Classic or Royal invitation with full features. No expiration date.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 5 Credits */}
            <Card className="border-border/60 bg-card/60 p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-block px-2.5 py-1 rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                  Starter Pack
                </div>
                <div>
                  <p className="font-display text-3xl font-extrabold text-foreground">5 Credits</p>
                  <p className="text-amber-400 font-bold text-sm mt-1">PKR 2,799 / invite</p>
                  <p className="text-xs text-muted-foreground line-through">PKR 3,499 retail</p>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald" /> 20% Wholesale Discount</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald" /> White-Label Footer Included</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald" /> Never Expiring Credits</li>
                </ul>
              </div>
              <div className="pt-6">
                <Button variant="outline" asChild className="w-full border-border hover:border-amber-500">
                  <a href="#apply-section">Apply to Unlock</a>
                </Button>
              </div>
            </Card>

            {/* 15 Credits - Most Popular */}
            <Card className="border-amber-500/50 bg-gradient-to-b from-amber-500/10 via-card to-card p-6 flex flex-col justify-between relative shadow-xl shadow-amber-500/5">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                Most Popular
              </div>
              <div className="space-y-4">
                <div className="inline-block px-2.5 py-1 rounded-md bg-amber-500/20 text-xs font-semibold text-amber-300">
                  Growth Pack
                </div>
                <div>
                  <p className="font-display text-3xl font-extrabold text-foreground">15 Credits</p>
                  <p className="text-amber-400 font-bold text-sm mt-1">PKR 2,275 / invite</p>
                  <p className="text-xs text-muted-foreground line-through">PKR 3,499 retail</p>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> 35% Wholesale Discount</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> White-Label Footer Included</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Client Invoicing &amp; Review Links</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Priority WhatsApp Support</li>
                </ul>
              </div>
              <div className="pt-6">
                <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold">
                  <a href="#apply-section">Apply for Growth Pack</a>
                </Button>
              </div>
            </Card>

            {/* 30 Credits */}
            <Card className="border-border/60 bg-card/60 p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-block px-2.5 py-1 rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                  Enterprise Agency
                </div>
                <div>
                  <p className="font-display text-3xl font-extrabold text-foreground">30 Credits</p>
                  <p className="text-amber-400 font-bold text-sm mt-1">PKR 1,750 / invite</p>
                  <p className="text-xs text-muted-foreground line-through">PKR 3,499 retail</p>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald" /> 50% Maximum Discount</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald" /> White-Label Footer Included</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald" /> Dedicated Account Manager</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald" /> Custom Domain Support</li>
                </ul>
              </div>
              <div className="pt-6">
                <Button variant="outline" asChild className="w-full border-border hover:border-amber-500">
                  <a href="#apply-section">Apply to Unlock</a>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="apply-section" className="py-20 bg-muted/15 border-b border-border/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Card className="border-amber-500/30 bg-card/90 backdrop-blur-xl shadow-2xl">
            <CardContent className="p-6 sm:p-10 space-y-8">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald/20 border border-emerald/40 flex items-center justify-center text-emerald mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    {isReapplying ? "Updated Application Received!" : "Application Received!"}
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                    {isReapplying
                      ? "Thank you for providing your updated agency details! Your re-application is under priority review. We will contact you via WhatsApp and email within 24 hours."
                      : "Thank you for applying to the Smart Invites Agency & Event Planner Partner Program! Our partnership team is reviewing your application. We will contact you via WhatsApp and email within 24 to 48 hours to activate your wholesale access."}
                  </p>
                  <div className="pt-4 flex justify-center gap-3">
                    <Button asChild className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold">
                      <Link href="/dashboard">Return to Dashboard</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold">
                      <Shield className="w-3.5 h-3.5" /> {isReapplying ? "Expedited Re-Verification" : "Fast 24-Hour Approval"}
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                      {isReapplying ? "Update & Re-Apply for Agency Access" : "Apply for Agency & Planner Access"}
                    </h2>
                    <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto">
                      {isReapplying
                        ? "Please update your agency or event planning details below. Your application will be prioritized for expedited review."
                        : "Please tell us about your agency or event planning business to unlock wholesale access."}
                    </p>

                    {isReapplying && (
                      <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5 text-left max-w-lg mx-auto mt-3">
                        <Sparkles className="w-5 h-5 shrink-0 text-amber-400" />
                        <span>
                          <strong>Application Update Mode:</strong> Submitting this form will automatically update your profile and notify the verification team for swift approval.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Agency Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Agency / Company Name <span className="text-red-400">*</span>
                      </label>
                      <Input
                        placeholder="e.g. Luxe Weddings Karachi"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="bg-muted/40 border-border/70"
                      />
                      {errors.companyName && <p className="text-[11px] text-red-400">{errors.companyName}</p>}
                    </div>

                    {/* Contact Person */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Contact Person Name <span className="text-red-400">*</span>
                      </label>
                      <Input
                        placeholder="e.g. Ali Khan"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        className="bg-muted/40 border-border/70"
                      />
                      {errors.contactName && <p className="text-[11px] text-red-400">{errors.contactName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Business Email <span className="text-red-400">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="planner@agency.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-muted/40 border-border/70"
                      />
                      {errors.email && <p className="text-[11px] text-red-400">{errors.email}</p>}
                    </div>

                    {/* Phone / WhatsApp */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        WhatsApp / Phone Number <span className="text-red-400">*</span>
                      </label>
                      <Input
                        placeholder="e.g. +92 300 1234567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-muted/40 border-border/70"
                      />
                      {errors.phone && <p className="text-[11px] text-red-400">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* City */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Operational City / Region</label>
                      <Input
                        placeholder="e.g. Lahore, Karachi, Islamabad, Dubai"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="bg-muted/40 border-border/70"
                      />
                    </div>

                    {/* Instagram or Website */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Instagram / Website / Portfolio</label>
                      <Input
                        placeholder="instagram.com/youragency or website"
                        value={formData.websiteOrSocial}
                        onChange={(e) => setFormData({ ...formData, websiteOrSocial: e.target.value })}
                        className="bg-muted/40 border-border/70"
                      />
                    </div>
                  </div>

                  {/* Monthly Event Volume */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Estimated Events per Month</label>
                    <select
                      value={formData.monthlyEvents}
                      onChange={(e) => setFormData({ ...formData, monthlyEvents: e.target.value })}
                      className="w-full h-10 px-3 rounded-md bg-muted/40 border border-border/70 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="1-5" className="bg-background">1 - 5 Events per Month</option>
                      <option value="6-15" className="bg-background">6 - 15 Events per Month (Recommended for Growth)</option>
                      <option value="16-30" className="bg-background">16 - 30 Events per Month</option>
                      <option value="30+" className="bg-background">30+ Events per Month (Enterprise)</option>
                    </select>
                  </div>

                  {/* Notes / Bio */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Tell us about your agency (Optional)</label>
                    <Textarea
                      rows={3}
                      placeholder="Share a few details about the types of events you manage (weddings, corporate summits, birthdays, etc.)..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="bg-muted/40 border-border/70 text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold text-base shadow-lg shadow-amber-500/20"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting Application...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" /> {isReapplying ? "Submit Updated Agency Application" : "Submit Agency Partner Application"}
                      </span>
                    )}
                  </Button>

                  <p className="text-center text-[11px] text-muted-foreground">
                    By applying, you agree to the Smart Invites Partner Terms. Your information is kept strictly confidential.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Common questions from wedding planners and event agencies.
            </p>
          </div>

          <div className="space-y-4">
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-5 space-y-2">
                <h3 className="font-semibold text-sm sm:text-base text-foreground flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  Who is eligible for the Agency &amp; Planner Program?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground pl-6 leading-relaxed">
                  The program is open to event management companies, independent wedding planners, photographers,
                  corporate coordinators, and venue banquet managers who organize events on behalf of clients.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-5 space-y-2">
                <h3 className="font-semibold text-sm sm:text-base text-foreground flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  How does White-Label Branding work?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground pl-6 leading-relaxed">
                  Inside your Agency Workspace, you can configure your agency title (e.g. &ldquo;Designed by Royal Planners&rdquo;),
                  upload your agency logo, and input your direct phone/WhatsApp and website. This replaces the default
                  Smart Invites badge on the footer of all client invitations you publish.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-5 space-y-2">
                <h3 className="font-semibold text-sm sm:text-base text-foreground flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  Do wholesale credits expire?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground pl-6 leading-relaxed">
                  No! Wholesale credits in your agency wallet never expire. You can purchase a Growth Pack of 15 credits
                  and use them over several months or wedding seasons.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-5 space-y-2">
                <h3 className="font-semibold text-sm sm:text-base text-foreground flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  Can I share a live preview with my client before purchasing?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground pl-6 leading-relaxed">
                  Yes. You can generate a dedicated Client Review Link with an approval banner so your client can
                  interact with animations, music, and schedules directly on their phone before you publish the final card.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
