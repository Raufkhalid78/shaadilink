"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  subtitle?: string;
  className?: string;
  href?: string | null;
  onClick?: () => void;
}

const sizeConfig = {
  sm: {
    iconSize: 32,
    iconClass: "w-8 h-8 rounded-lg",
    titleClass: "text-lg",
    subClass: "text-[7.5px] tracking-[0.2em]",
  },
  md: {
    iconSize: 40,
    iconClass: "w-10 h-10 rounded-xl",
    titleClass: "text-xl",
    subClass: "text-[8.5px] tracking-[0.22em]",
  },
  lg: {
    iconSize: 48,
    iconClass: "w-12 h-12 rounded-xl",
    titleClass: "text-2xl",
    subClass: "text-[9.5px] tracking-[0.25em]",
  },
  xl: {
    iconSize: 64,
    iconClass: "w-16 h-16 rounded-2xl",
    titleClass: "text-3xl",
    subClass: "text-[11px] tracking-[0.25em]",
  },
};

export function BrandLogo({
  size = "md",
  showText = true,
  subtitle = "Digital Event Invitations",
  className,
  href = "/",
  onClick,
}: BrandLogoProps) {
  const cfg = sizeConfig[size] || sizeConfig.md;

  const content = (
    <div
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2.5 group select-none transition-transform duration-200 hover:scale-[1.02]",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Luxury Smart Invites Emblem */}
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0 overflow-hidden shadow-lg shadow-gold/20 group-hover:shadow-gold/35 transition-all duration-300 border border-gold/40 bg-emerald-dark",
          cfg.iconClass
        )}
      >
        <Image
          src="/logo.svg"
          alt="Smart Invites"
          width={cfg.iconSize}
          height={cfg.iconSize}
          className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-300"
          priority
        />
        {/* Dynamic active status light */}
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 border border-black/60 shadow-[0_0_6px_#34d399]" />
      </div>

      {/* Brand Name & Subtitle */}
      {showText && (
        <div className="flex flex-col text-left">
          <span
            className={cn(
              "font-display font-extrabold tracking-tight text-white leading-none",
              cfg.titleClass
            )}
          >
            Smart<span className="gold-shimmer-strong">Invites</span>
          </span>
          {subtitle && (
            <span
              className={cn(
                "uppercase text-gold/80 font-semibold leading-none mt-1",
                cfg.subClass
              )}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block" aria-label="Smart Invites Home">
        {content}
      </Link>
    );
  }

  return content;
}
