"use client";

import { m } from "framer-motion";
import Link from "next/link";
import { CONTACT_CONFIG } from "@/lib/config";
import { Send, Heart, Instagram, Facebook, Linkedin, Mail, Globe, Sparkles, Briefcase } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { NewsletterForm } from "./newsletter-form";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { BrandLogo } from "@/components/brand-logo";
import { useSiteSettings } from "@/hooks/use-site-settings";

interface FooterProps {
  onTemplatesClick?: () => void;
  onAboutClick?: () => void;
  onContactClick?: () => void;
  onLegalClick?: (type: "terms" | "privacy" | "refund" | "shipping") => void;
  onAffiliateClick?: () => void;
}

export function Footer({
  onTemplatesClick,
  onAboutClick,
  onContactClick,
  onLegalClick,
  onAffiliateClick,
}: FooterProps) {
  const { t, language } = useLanguage();
  const { whatsappUrl } = useSiteSettings();

  const quickLinks = [
    { label: t('nav.features'), href: "#features", action: undefined },
    { label: t('nav.howItWorks'), href: "#how-it-works", action: undefined },
    { label: t('nav.templates'), href: "/templates", action: "templates" },
    { label: t('nav.blog'), href: "/blog", action: undefined },
    { label: t('nav.pricing'), href: "#pricing", action: undefined },
    { label: t('nav.about'), href: "/about", action: "about" },
    { label: t('nav.contact'), href: "/contact", action: "contact" },
  ];

  const legalLinks = [
    { label: language === 'en' ? "Terms & Conditions" : "شرائط و ضوابط", href: "/terms" },
    { label: language === 'en' ? "Privacy Policy" : "پرائیویسی پالیسی", href: "/privacy" },
    { label: language === 'en' ? "Refund Policy" : "رقم کی واپسی کی پالیسی", href: "/refund" },
    { label: language === 'en' ? "Shipping Policy" : "شپنگ پالیسی", href: "/shipping" },
  ];

  const socialLinks = [
    { icon: Instagram, href: CONTACT_CONFIG.socials.instagram, label: "Instagram", color: "hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600" },
    { icon: Facebook, href: CONTACT_CONFIG.socials.facebook, label: "Facebook", color: "hover:bg-blue-600" },
    { icon: Linkedin, href: CONTACT_CONFIG.socials.linkedin, label: "LinkedIn", color: "hover:bg-sky-700" },
  ];

  const handleQuickLink = (link: (typeof quickLinks)[0]) => {
    if (link.action === "about" && onAboutClick) onAboutClick();
    else if (link.action === "templates" && onTemplatesClick) onTemplatesClick();
    else if (link.action === "contact" && onContactClick) onContactClick();
  };



  return (
    <footer className="relative mt-auto overflow-hidden bg-background">
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
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="sm:col-span-2 lg:col-span-2 text-left"
            >
              {/* Logo */}
              <BrandLogo size="md" href="/" subtitle="Digital Event Invitations" className="mb-5" />

              <p className="text-white/50 text-sm leading-relaxed max-w-xs mb-6 text-left">
                {language === 'en'
                  ? "Premium digital invitations crafted for all your events. Celebrate every moment — from birthdays to galas — in cinematic style."
                  : "شاندار اور پریمیم ڈیجیٹل شادی دعوت نامے جو خاص طور پر پاکستانی شادیوں کے لیے تیار کیے گئے ہیں۔ مہندی سے ولیمہ تک، ہر لمحے کو شاہی انداز میں منائیں۔"}
              </p>

              {/* WhatsApp CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] text-xs sm:text-sm font-semibold hover:bg-[#25D366]/20 transition-all duration-300 mb-6 group"
              >
                <WhatsAppIcon className="w-4 h-4 text-[#25D366] shrink-0 transition-transform group-hover:scale-110" />
                <span>{language === 'en' ? "Chat on WhatsApp" : "واٹس ایپ پر رابطہ کریں"}</span>
              </a>

              {/* Social icons */}
              <div className="flex items-center gap-3 justify-start">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className={`flex h-12 w-12 items-center justify-center rounded-full bg-white/8 border border-white/10 text-white/50 hover:text-white hover:border-transparent transition-all duration-300 ${social.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </m.div>

            {/* Quick Links */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-left"
            >
              <p className="font-display font-semibold text-xs uppercase tracking-[0.15em] text-gold mb-5">
                {language === 'en' ? "Quick Links" : "فوری روابط"}
              </p>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    {link.href?.startsWith("/") ? (
                      <Link
                        href={link.href}
                        onClick={() => link.action && handleQuickLink(link)}
                        className="text-sm text-white/50 hover:text-gold transition-colors duration-200 text-left block"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-white/50 hover:text-gold transition-colors duration-200 text-left block"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </m.div>

            {/* Legal */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="text-left"
            >
              <p className="font-display font-semibold text-xs uppercase tracking-[0.15em] text-gold mb-5">
                {language === 'en' ? "Legal" : "قانونی معلومات"}
              </p>
              <ul className="space-y-3 text-left">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => onLegalClick?.(link.href.replace("/", "") as any)}
                      className="text-sm text-white/50 hover:text-gold transition-colors duration-200 text-left block"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => onAffiliateClick?.()}
                    className="text-sm text-gold/60 hover:text-gold transition-colors duration-200 flex items-center gap-1.5 font-medium text-left"
                  >
                    <Sparkles className="w-3 h-3" />
                    {language === 'en' ? "Affiliate Program" : "ایفلیٹ پروگرام"}
                  </button>
                </li>
                <li>
                  <Link
                    href="/agency"
                    className="text-sm text-amber-400/80 hover:text-amber-300 transition-colors duration-200 flex items-center gap-1.5 font-medium text-left"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                    {language === 'en' ? "Agency & Planners" : "ایجنسی اور ایونٹ پلانرز"}
                  </Link>
                </li>
              </ul>
            </m.div>

            {/* Newsletter + Contact */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-left"
            >
              <p className="font-display font-semibold text-xs uppercase tracking-[0.15em] text-gold mb-5">
                {language === 'en' ? "Stay Updated" : "باخبر رہیں"}
              </p>
              <p className="text-white/60 text-xs mb-3 leading-relaxed text-left">
                {language === 'en'
                  ? "Get notified about new templates and exclusive offers."
                  : "نئے ڈیزائنز اور خصوصی پیشکشوں کے بارے میں باخبر رہیں۔"}
              </p>
              <NewsletterForm />

              <div className="mt-6 space-y-2.5 text-left">
                <button
                  onClick={() => onContactClick?.()}
                  className="text-sm text-white/50 hover:text-gold transition-colors flex items-center gap-2 text-left"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  {language === 'en' ? "Contact Us" : "ہم سے رابطہ کریں"}
                </button>
                <a
                  href={`mailto:${CONTACT_CONFIG.email}`}
                  className="text-sm text-white/50 hover:text-gold transition-colors flex items-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  {CONTACT_CONFIG.email}
                </a>
                <span className="text-sm text-white/60 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  {CONTACT_CONFIG.address}
                </span>
              </div>
            </m.div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/60">
              &copy; {new Date().getFullYear()} {language === 'en' ? "Smart Invites. All rights reserved." : "اسمارٹ انوائٹس۔ جملہ حقوق محفوظ ہیں۔"}
            </p>
            <p className="text-xs text-white/60 flex items-center gap-1.5">
              {language === 'en' ? "Made with" : "محبت کے ساتھ بنایا گیا ہے"}{" "}
              <Heart className="h-3 w-3 text-rose-400 fill-rose-400 animate-pulse" />
              {" "}{language === 'en' ? "for Pakistani Events" : "پاکستانی تقریبات کے لیے"}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
