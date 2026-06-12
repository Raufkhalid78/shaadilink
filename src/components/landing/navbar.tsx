"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onTemplatesClick?: () => void;
  onGetStarted?: () => void;
  onLoginClick?: () => void;
  onAboutClick?: () => void;
  onContactClick?: () => void;
  isLoggedIn?: boolean;
  onDashboardClick?: () => void;
}

const sectionIds = ["features", "how-it-works", "pricing"];

export function Navbar({
  onTemplatesClick,
  onGetStarted,
  onLoginClick,
  onAboutClick,
  onContactClick,
  isLoggedIn,
  onDashboardClick,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Active section detection
      const scrollPos = window.scrollY + 120;
      let current: string | null = null;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) {
          current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features", action: undefined, sectionId: "features" },
    { label: "How It Works", href: "#how-it-works", action: undefined, sectionId: "how-it-works" },
    { label: "Templates", href: undefined, action: onTemplatesClick, sectionId: undefined },
    { label: "About", href: "/about", action: undefined, sectionId: undefined },
    { label: "Contact", href: "/contact", action: undefined, sectionId: undefined },
    { label: "Pricing", href: "#pricing", action: undefined, sectionId: "pricing" },
  ];

  const handleNavClick = useCallback((link: typeof navLinks[number]) => {
    if (link.action) {
      link.action();
    }
    setMobileOpen(false);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-emerald-dark/70 backdrop-blur-2xl border-b border-gold/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald text-primary-foreground shadow-lg shadow-emerald/20 group-hover:shadow-emerald/40 transition-shadow duration-300">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-white">
            Shaadi<span className="gold-shimmer-strong">Link</span>
          </span>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = link.sectionId && activeSection === link.sectionId;
            const linkContent = (
              <span className="relative px-3 py-2 text-sm font-medium transition-colors duration-300 group">
                <span
                  className={cn(
                    "transition-colors duration-300",
                    isActive
                      ? "text-gold"
                      : "text-white/70 group-hover:text-white"
                  )}
                >
                  {link.label}
                </span>
                {/* Animated underline */}
                <span
                  className={cn(
                    "absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-gradient-to-r from-gold/0 via-gold to-gold/0 transition-all duration-300",
                    isActive
                      ? "w-full opacity-100"
                      : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                  )}
                />
              </span>
            );

            if (link.action) {
              return (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className="relative"
                >
                  {linkContent}
                </button>
              );
            }
            return (
              <a key={link.label} href={link.href} className="relative">
                {linkContent}
              </a>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          {isLoggedIn ? (
            <Button
              variant="ghost"
              onClick={onDashboardClick}
              className="text-white/70 hover:text-white hover:bg-white/10 font-medium transition-colors duration-300"
            >
              Dashboard
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={onLoginClick}
              className="text-white/70 hover:text-white hover:bg-white/10 font-medium transition-colors duration-300"
            >
              Login
            </Button>
          )}
          <Button
            onClick={onGetStarted}
            className="bg-gold hover:bg-gold-light text-emerald-dark font-bold border-none pulse-glow shadow-lg shadow-gold/20 hover:shadow-gold/40 transition-all duration-300"
            size="lg"
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden text-white/80 hover:text-white hover:bg-white/10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[300px] bg-emerald-dark/95 backdrop-blur-2xl border-l border-gold/10"
          >
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald text-primary-foreground">
                  <Heart className="h-4 w-4 fill-current" />
                </div>
                <span className="font-display text-lg font-bold text-white">
                  Shaadi<span className="gold-shimmer-strong">Link</span>
                </span>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-4 mt-6">
              {navLinks.map((link, i) => {
                const isActive = link.sectionId && activeSection === link.sectionId;
                const linkEl = (
                  <span
                    className={cn(
                      "flex items-center px-4 py-3.5 text-base font-medium rounded-lg transition-all duration-300",
                      isActive
                        ? "text-gold bg-gold/10"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {link.label}
                  </span>
                );

                return (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    {link.action ? (
                      <SheetClose asChild>
                        <button
                          onClick={() => handleNavClick(link)}
                          className="w-full text-left"
                        >
                          {linkEl}
                        </button>
                      </SheetClose>
                    ) : (
                      <SheetClose asChild>
                        <a href={link.href}>{linkEl}</a>
                      </SheetClose>
                    )}
                  </motion.div>
                );
              })}
              <div className="mt-6 pt-6 border-t border-gold/10 space-y-3">
                <SheetClose asChild>
                  {isLoggedIn ? (
                    <Button
                      variant="outline"
                      onClick={onDashboardClick}
                      className="w-full border-gold/30 text-gold hover:bg-gold/10 font-medium bg-transparent"
                      size="lg"
                    >
                      Dashboard
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={onLoginClick}
                      className="w-full border-gold/30 text-gold hover:bg-gold/10 font-medium bg-transparent"
                      size="lg"
                    >
                      Login
                    </Button>
                  )}
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    onClick={onGetStarted}
                    className="w-full bg-gold hover:bg-gold-light text-emerald-dark font-bold border-none pulse-glow"
                    size="lg"
                  >
                    Get Started
                  </Button>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>

      {/* Animated gold gradient line at bottom when scrolled */}
      <AnimatePresence>
        {scrolled && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-[1px] w-full origin-center"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(180,145,77,0.3) 20%, rgba(212,168,83,0.6) 50%, rgba(180,145,77,0.3) 80%, transparent 100%)",
            }}
          />
        )}
      </AnimatePresence>
    </motion.header>
  );
}
