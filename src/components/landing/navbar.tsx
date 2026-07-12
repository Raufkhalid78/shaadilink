"use client";

import { useState, useEffect, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ChevronDown, LayoutDashboard, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { LanguageToggle } from "./language-toggle";
import { MobileNav, NavLink } from "./mobile-nav";

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

  const navLinks: NavLink[] = [
    { label: t('nav.features'), href: "#features", action: undefined, sectionId: "features" },
    { label: t('nav.howItWorks'), href: "#how-it-works", action: undefined, sectionId: "how-it-works" },
    { label: t('nav.templates'), href: undefined, action: onTemplatesClick, sectionId: undefined },
    { label: t('nav.blog'), href: "/blog", action: undefined, sectionId: undefined },
    { label: t('nav.about'), href: undefined, action: onAboutClick, sectionId: undefined },
    { label: t('nav.contact'), href: undefined, action: onContactClick, sectionId: undefined },
    { label: t('nav.pricing'), href: "#pricing", action: undefined, sectionId: "pricing" },
  ];

  const handleNavClick = useCallback((link: NavLink) => {
    if (link.action) {
      link.action();
    }
    setMobileOpen(false);
  }, []);

  return (
    <m.header
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
                  aria-current={isActive ? "page" : undefined}
                >
                  {linkContent}
                </button>
              );
            }
            if (link.href) {
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className="relative"
                  aria-current={isActive ? "page" : undefined}
                >
                  {linkContent}
                </a>
              );
            }
            return null;
          })}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <LanguageToggle />
          
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

        <MobileNav 
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          navLinks={navLinks}
          activeSection={activeSection}
          handleNavClick={handleNavClick}
          isLoggedIn={isLoggedIn}
          userFullName={userFullName}
          userEmail={userEmail}
          onDashboardClick={onDashboardClick}
          onSignOut={onSignOut}
          onLoginClick={onLoginClick}
          onGetStarted={onGetStarted}
        />
      </nav>

      {/* Animated gold gradient line at bottom when scrolled */}
      <AnimatePresence>
        {scrolled && (
          <m.div
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
    </m.header>
  );
}
