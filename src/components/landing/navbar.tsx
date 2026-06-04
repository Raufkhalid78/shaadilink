"use client";

import { useState, useEffect } from "react";
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

interface NavbarProps {
  onTemplatesClick?: () => void;
  onGetStarted?: () => void;
  onLoginClick?: () => void;
}

export function Navbar({ onTemplatesClick, onGetStarted, onLoginClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features", action: undefined },
    { label: "How It Works", href: "#how-it-works", action: undefined },
    { label: "Templates", href: undefined, action: onTemplatesClick },
    { label: "Pricing", href: "#pricing", action: undefined },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald text-primary-foreground">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Shaadi<span className="text-gold">Link</span>
          </span>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) =>
            link.action ? (
              <button
                key={link.label}
                onClick={link.action}
                className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-md hover:bg-accent/50"
              >
                {link.label}
              </button>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors rounded-md hover:bg-accent/50"
              >
                {link.label}
              </a>
            )
          )}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={onLoginClick}
            className="text-foreground/70 hover:text-foreground font-medium"
          >
            Login
          </Button>
          <Button
            onClick={onGetStarted}
            className="bg-gold hover:bg-gold-light text-emerald-dark font-bold border-none"
            size="lg"
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] bg-background">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald text-primary-foreground">
                  <Heart className="h-4 w-4 fill-current" />
                </div>
                <span className="font-display text-lg font-bold">
                  Shaadi<span className="text-gold">Link</span>
                </span>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-2 px-4 mt-4">
              {navLinks.map((link) =>
                link.action ? (
                  <SheetClose asChild key={link.label}>
                    <button
                      onClick={link.action}
                      className="flex items-center px-4 py-3 text-base font-medium text-foreground/80 hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </SheetClose>
                ) : (
                  <SheetClose asChild key={link.label}>
                    <a
                      href={link.href}
                      className="flex items-center px-4 py-3 text-base font-medium text-foreground/80 hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors"
                    >
                      {link.label}
                    </a>
                  </SheetClose>
                )
              )}
              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    onClick={onLoginClick}
                    className="w-full border-gold/30 text-gold hover:bg-gold/10 font-medium"
                    size="lg"
                  >
                    Login
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    onClick={onGetStarted}
                    className="w-full bg-gold hover:bg-gold-light text-emerald-dark font-bold border-none"
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
    </motion.header>
  );
}
