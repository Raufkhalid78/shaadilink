"use client";

import { Heart, Instagram, Facebook, Twitter, Mail, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const quickLinks = [
  { label: "About", href: "#" },
  { label: "Features", href: "#features" },
  { label: "Templates", href: "#templates", action: "templates" },
  { label: "Pricing", href: "#pricing" },
  { label: "How It Works", href: "#how-it-works" },
];

const legalLinks = [
  { label: "Terms & Conditions", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Refund Policy", href: "#" },
  { label: "Shipping & Delivery", href: "#" },
];

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
];

interface FooterProps {
  onTemplatesClick?: () => void;
}

export function Footer({ onTemplatesClick }: FooterProps) {
  return (
    <footer className="bg-emerald-dark text-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-emerald-dark">
                <Heart className="h-5 w-5 fill-current" />
              </div>
              <span className="font-display text-xl font-bold">
                Shaadi<span className="text-gold">Link</span>
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Premium digital wedding invitations crafted for Pakistani weddings.
              Celebrate every moment — from Mehndi to Walima.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-gold hover:text-emerald-dark transition-all duration-300"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-gold mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  {link.action === "templates" ? (
                    <button
                      onClick={onTemplatesClick}
                      className="text-sm text-white/60 hover:text-gold transition-colors"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm text-white/60 hover:text-gold transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-gold mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-gold mb-4">
              Get In Touch
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:hello@shaadilink.pk" className="text-sm text-white/60 hover:text-gold transition-colors flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  hello@shaadilink.pk
                </a>
              </li>
              <li>
                <span className="text-sm text-white/60 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  Lahore, Pakistan
                </span>
              </li>
            </ul>

            {/* Affiliate link */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <a href="#" className="text-sm text-gold/70 hover:text-gold transition-colors font-medium">
                Become an Affiliate →
              </a>
            </div>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Bottom Bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-white/40">
            &copy; 2025 ShaadiLink. All rights reserved.
          </p>
          <p className="text-xs sm:text-sm text-white/40 flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-400 fill-red-400" /> for Pakistani Weddings
          </p>
        </div>
      </div>
    </footer>
  );
}
