"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Heart, ChevronDown, LayoutDashboard, LogOut, Plus } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/components/language-provider";
import { Globe } from "lucide-react";

interface NavbarProps {
  onTemplatesClick?: () => void;
  onGetStarted?: () => void;
  onLoginClick?: () => void;
  onAboutClick?: () => void;
  onContactClick?: () => void;
  isLoggedIn?: boolean;
  onDashboardClick?: () => void;
  userEmail?: string;
  userFullName?: string;
  onSignOut?: () => void;
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
  userEmail,
  userFullName,
  onSignOut,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
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
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: t('nav.features'), href: "#features", action: undefined as (() => void) | undefined, sectionId: "features" },
    { label: t('nav.howItWorks'), href: "#how-it-works", action: undefined as (() => void) | undefined, sectionId: "how-it-works" },
    { label: t('nav.templates'), href: undefined as string | undefined, action: onTemplatesClick, sectionId: undefined },
    { label: t('nav.blog'), href: "/blog", action: undefined as (() => void) | undefined, sectionId: undefined },
    { label: t('nav.about'), href: undefined as string | undefined, action: onAboutClick, sectionId: undefined },
    { label: t('nav.contact'), href: undefined as string | undefined, action: onContactClick, sectionId: undefined },
    { label: t('nav.pricing'), href: "#pricing", action: undefined as (() => void) | undefined, sectionId: "pricing" },
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
            if (link.href) {
              return (
                <a key={link.label} href={link.href} className="relative">
                  {linkContent}
                </a>
              );
            }
            return null;
          })}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
            className="text-white hover:text-gold hover:bg-gold/10"
            title={language === 'en' ? 'Switch to Urdu' : 'Switch to English'}
          >
            <Globe className="w-5 h-5" />
            <span className="sr-only">Toggle Language</span>
          </Button>
          
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/20 bg-emerald-dark/40 hover:bg-emerald-dark/80 text-white transition-all cursor-pointer select-none">
                  <Avatar className="h-7 w-7 border border-gold/10">
                    <AvatarFallback className="bg-gold/10 text-gold font-bold text-[10px]">
                      {userFullName ? userFullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : (userEmail ? userEmail.slice(0, 2).toUpperCase() : "U")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium max-w-[120px] truncate">
                    {userFullName || userEmail?.split('@')[0] || "Profile"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-emerald-dark/95 border border-gold/20 text-white">
                <DropdownMenuLabel className="font-normal border-b border-white/10 pb-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold truncate text-white">{userFullName || "User Profile"}</p>
                    <p className="text-xs leading-none text-white/60 truncate">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={onDashboardClick} className="hover:bg-white/10 cursor-pointer gap-2 mt-1">
                  <LayoutDashboard className="w-4 h-4 text-gold" />
                  <span>My Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onGetStarted} className="hover:bg-white/10 cursor-pointer gap-2">
                  <Plus className="w-4 h-4 text-gold" />
                  <span>Create Invitation</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={onSignOut} className="hover:bg-red-500/20 text-red-400 focus:text-red-400 cursor-pointer gap-2">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              onClick={onLoginClick}
              className="text-white/70 hover:text-white hover:bg-white/10 font-medium transition-colors duration-300"
            >
              {t('nav.login')}
            </Button>
          )}
          
          {!isLoggedIn && (
            <Button
              onClick={onGetStarted}
              className="bg-gold hover:bg-gold-light text-emerald-dark font-bold rounded-full px-6 transition-all duration-300 hover:scale-105 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] border-none"
            >
              {t('nav.getStarted')}
            </Button>
          )}
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
                    ) : link.href ? (
                      <SheetClose asChild>
                        <a href={link.href}>{linkEl}</a>
                      </SheetClose>
                    ) : null}
                  </motion.div>
                );
              })}
              <div className="mt-6 pt-6 border-t border-gold/10 space-y-3">
                {/* Mobile Language Switcher */}
                <div className="flex items-center justify-between px-3 py-2.5 bg-white/5 rounded-xl mb-4 border border-white/5">
                  <span className="text-xs font-semibold text-white/70 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gold" />
                    Language / زبان
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
                    className="text-gold hover:bg-gold/10 font-bold px-3 py-1 h-auto text-xs"
                  >
                    {language === 'en' ? 'اردو' : 'English'}
                  </Button>
                </div>
                {isLoggedIn && (
                  <div className="px-4 py-2 bg-emerald/10 border border-gold/20 rounded-xl mb-4">
                    <p className="text-xs font-semibold text-gold uppercase tracking-wider">Logged In As</p>
                    <p className="text-sm font-bold text-white mt-1 truncate">{userFullName || "User"}</p>
                    <p className="text-xs text-white/60 truncate">{userEmail}</p>
                  </div>
                )}
                <SheetClose asChild>
                  {isLoggedIn ? (
                    <div className="space-y-3 w-full">
                      <Button
                        variant="outline"
                        onClick={onDashboardClick}
                        className="w-full border-gold/30 text-gold hover:bg-gold/10 font-medium bg-transparent"
                        size="lg"
                      >
                        Dashboard
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={onSignOut}
                        className="w-full bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30 font-medium"
                        size="lg"
                      >
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={onLoginClick}
                      className="w-full border-gold/30 text-gold hover:bg-gold/10 font-medium bg-transparent"
                      size="lg"
                    >{t('nav.login')}</Button>
                  )}
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    onClick={onGetStarted}
                    className="w-full bg-gold hover:bg-gold-light text-emerald-dark font-bold border-none pulse-glow"
                    size="lg"
                  >{t('nav.getStarted')}</Button>
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
