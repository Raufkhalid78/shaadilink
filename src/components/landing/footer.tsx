"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CONTACT_CONFIG } from "@/lib/config";
import { Heart, Instagram, Facebook, Twitter, Mail, Globe, Send, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const quickLinks = [
  { label: "Features", href: "#features", action: undefined },
  { label: "How It Works", href: "#how-it-works", action: undefined },
  { label: "Templates", href: undefined, action: "templates" },
  { label: "Pricing", href: "#pricing", action: undefined },
  { label: "About", href: undefined, action: "about" },
];

const legalLinks = [
  { label: "Terms & Conditions", action: "terms" as const },
  { label: "Privacy Policy", action: "privacy" as const },
  { label: "Refund Policy", action: "refund" as const },
];

const socialLinks = [
  { icon: Instagram, href: CONTACT_CONFIG.socials.instagram, label: "Instagram", color: "hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600" },
  { icon: Facebook, href: CONTACT_CONFIG.socials.facebook, label: "Facebook", color: "hover:bg-blue-600" },
  { icon: Twitter, href: CONTACT_CONFIG.socials.twitter, label: "Twitter/X", color: "hover:bg-sky-500" },
];

interface FooterProps {
  onTemplatesClick?: () => void;
  onAboutClick?: () => void;
  onContactClick?: () => void;
  onLegalClick?: (type: "terms" | "privacy" | "refund") => void;
  onAffiliateClick?: () => void;
}

export function Footer({
  onTemplatesClick,
  onAboutClick,
  onContactClick,
  onLegalClick,
  onAffiliateClick,
}: FooterProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleQuickLink = (link: (typeof quickLinks)[0]) => {
    if (link.action === "about" && onAboutClick) onAboutClick();
    else if (link.action === "templates" && onTemplatesClick) onTemplatesClick();
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
    toast.success("You're on the list! 🎉", { description: "We'll keep you updated on new templates & features." });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <footer className="relative mt-auto overflow-hidden">
      {/* Top gold gradient wave */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div
        className="absolute inset-x-0 top-0 h-32"
        style={{
          background: "linear-gradient(to bottom, oklch(0.18 0.04 155 / 0.4), transparent)",
        }}
      />

      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.015]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footer-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="#d4a853" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-pattern)" />
        </svg>
      </div>

      <div
        className="relative"
        style={{ background: "oklch(0.10 0.018 155)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Main Footer Grid */}
          <div className="py-14 sm:py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
            {/* Brand Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="sm:col-span-2 lg:col-span-2"
            >
              {/* Logo */}
              <div className="flex items-center gap-2.5 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-emerald-dark shadow-lg shadow-gold/30">
                  <Heart className="h-5 w-5 fill-current" />
                </div>
                <span className="font-display text-2xl font-bold text-white">
                  Shaadi<span className="gold-shimmer-strong">Link</span>
                </span>
              </div>

              <p className="text-white/50 text-sm leading-relaxed max-w-xs mb-6">
                Premium digital wedding invitations crafted for Pakistani weddings.
                Celebrate every moment — from Mehndi to Walima — in cinematic style.
              </p>

              {/* WhatsApp CTA */}
              <a
                href={CONTACT_CONFIG.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-sm font-medium hover:bg-[#25D366]/20 transition-colors duration-300 mb-6"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 16.954c-.275.773-.888 1.414-1.65 1.731-.762.317-3.168.466-5.668-.862-1.512-.808-2.766-2.027-3.62-3.518-.855-1.49-1.272-3.178-.992-4.764.28-1.586 1.156-2.998 2.39-3.978C9.27 4.6 10.61 4.157 11.963 4.157c.397 0 .793.038 1.183.114 1.386.28 2.642 1.004 3.57 2.065.928 1.062 1.48 2.43 1.48 3.87 0 .318-.033.634-.097.942-.29 1.397-1.052 2.683-2.537 3.806z" fillRule="evenodd"/>
                </svg>
                Chat on WhatsApp
              </a>

              {/* Social icons */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/8 border border-white/10 text-white/50 hover:text-white hover:border-transparent transition-all duration-300 ${social.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="font-display font-semibold text-xs uppercase tracking-[0.15em] text-gold mb-5">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    {link.action ? (
                      <button
                        onClick={() => handleQuickLink(link)}
                        className="text-sm text-white/50 hover:text-gold transition-colors duration-200 text-left"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-white/50 hover:text-gold transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              <h4 className="font-display font-semibold text-xs uppercase tracking-[0.15em] text-gold mb-5">
                Legal
              </h4>
              <ul className="space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => onLegalClick?.(link.action)}
                      className="text-sm text-white/50 hover:text-gold transition-colors duration-200 text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={onAffiliateClick}
                    className="text-sm text-gold/60 hover:text-gold transition-colors duration-200 flex items-center gap-1.5 font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    Affiliate Program
                  </button>
                </li>
              </ul>
            </motion.div>

            {/* Newsletter + Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="font-display font-semibold text-xs uppercase tracking-[0.15em] text-gold mb-5">
                Stay Updated
              </h4>
              <p className="text-white/40 text-xs mb-3 leading-relaxed">
                Get notified about new templates and exclusive offers.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 bg-white/8 border-white/10 text-white placeholder:text-white/25 text-sm focus:border-gold/50 focus:ring-0 rounded-xl"
                />
                <Button
                  type="submit"
                  disabled={submitted}
                  className="h-10 bg-gold hover:bg-gold-light text-emerald-dark font-semibold border-none rounded-xl gap-2 transition-all duration-300"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitted ? "Subscribed! 🎉" : "Subscribe"}
                </Button>
              </form>

              <div className="mt-6 space-y-2.5">
                <button
                  onClick={onContactClick}
                  className="text-sm text-white/50 hover:text-gold transition-colors flex items-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  Contact Us
                </button>
                <a
                  href={`mailto:${CONTACT_CONFIG.email}`}
                  className="text-sm text-white/50 hover:text-gold transition-colors flex items-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  {CONTACT_CONFIG.email}
                </a>
                <span className="text-sm text-white/40 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  {CONTACT_CONFIG.address}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/30">
              &copy; {new Date().getFullYear()} ShaadiLink. All rights reserved.
            </p>
            <p className="text-xs text-white/30 flex items-center gap-1.5">
              Made with{" "}
              <Heart className="h-3 w-3 text-rose-400 fill-rose-400 animate-pulse" />
              {" "}for Pakistani Weddings
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
