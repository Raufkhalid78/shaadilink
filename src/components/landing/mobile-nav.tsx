"use client";

import { motion } from "framer-motion";
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
import { useLanguage } from "@/components/language-provider";
import { LanguageToggle } from "./language-toggle";

export interface NavLink {
  label: string;
  href?: string;
  action?: () => void;
  sectionId?: string;
}

interface MobileNavProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  navLinks: NavLink[];
  activeSection: string | null;
  handleNavClick: (link: NavLink) => void;
  isLoggedIn?: boolean;
  userFullName?: string;
  userEmail?: string;
  onDashboardClick?: () => void;
  onSignOut?: () => void;
  onLoginClick?: () => void;
  onGetStarted?: () => void;
}

export function MobileNav({
  mobileOpen,
  setMobileOpen,
  navLinks,
  activeSection,
  handleNavClick,
  isLoggedIn,
  userFullName,
  userEmail,
  onDashboardClick,
  onSignOut,
  onLoginClick,
  onGetStarted,
}: MobileNavProps) {
  const { t } = useLanguage();

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-white/80 hover:text-white hover:bg-white/10"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        id="mobile-menu"
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
            <LanguageToggle isMobile />
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
  );
}
