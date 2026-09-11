"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ScrollableMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Distance in pixels to scroll per arrow click (default: 220) */
  scrollDistance?: number;
  /** Color theme for arrow buttons and active states */
  variant?: "amber" | "gold" | "emerald" | "default";
  /** Optional custom class for the inner scroll container */
  contentClassName?: string;
  /** Whether arrows sit inline at corners or overlay on top (default: 'inline') */
  arrowPlacement?: "inline" | "overlay";
  /** Custom class for the arrow buttons */
  arrowClassName?: string;
}

export function ScrollableMenu({
  children,
  className,
  contentClassName,
  scrollDistance = 220,
  variant = "amber",
  arrowPlacement = "inline",
  arrowClassName,
  ...props
}: ScrollableMenuProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    // Account for minor sub-pixel rendering differences
    const overflow = scrollWidth > clientWidth + 2;
    setHasOverflow(overflow);

    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();

    // Re-check after animation/layout settle
    const t1 = setTimeout(checkScroll, 100);
    const t2 = setTimeout(checkScroll, 350);

    const ro = new ResizeObserver(() => {
      checkScroll();
    });
    ro.observe(el);
    if (el.firstElementChild) {
      ro.observe(el.firstElementChild);
    }

    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro.disconnect();
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const amount = direction === "left" ? -scrollDistance : scrollDistance;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  // Theme variant styles for corner arrow buttons
  const variantStyles = {
    amber: {
      active: "text-amber-400 bg-zinc-800/90 border-zinc-700 hover:bg-amber-500/20 hover:border-amber-400/50 hover:text-amber-300 shadow-amber-950/40",
      disabled: "text-zinc-600 bg-zinc-900/40 border-zinc-800/60 opacity-30 cursor-not-allowed pointer-events-none",
      fadeLeft: "from-zinc-950 via-zinc-950/80 to-transparent",
      fadeRight: "from-transparent via-zinc-950/80 to-zinc-950",
    },
    gold: {
      active: "text-gold bg-card/90 border-gold/30 hover:bg-gold/20 hover:border-gold hover:text-primary shadow-black/40",
      disabled: "text-muted-foreground/30 bg-muted/20 border-border/30 opacity-30 cursor-not-allowed pointer-events-none",
      fadeLeft: "from-background via-background/80 to-transparent",
      fadeRight: "from-transparent via-background/80 to-background",
    },
    emerald: {
      active: "text-emerald bg-emerald-950/60 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-400 hover:text-emerald-300 shadow-emerald-950/40",
      disabled: "text-zinc-600 bg-zinc-900/40 border-zinc-800/60 opacity-30 cursor-not-allowed pointer-events-none",
      fadeLeft: "from-zinc-950 via-zinc-950/80 to-transparent",
      fadeRight: "from-transparent via-zinc-950/80 to-zinc-950",
    },
    default: {
      active: "text-foreground bg-secondary/80 border-border hover:bg-accent hover:text-accent-foreground shadow-sm",
      disabled: "text-muted-foreground/30 bg-muted/20 border-border/30 opacity-30 cursor-not-allowed pointer-events-none",
      fadeLeft: "from-background via-background/80 to-transparent",
      fadeRight: "from-transparent via-background/80 to-background",
    },
  }[variant];

  return (
    <div
      className={cn(
        "relative flex items-center w-full group/scrollable select-none",
        className
      )}
      {...props}
    >
      {/* Left Corner Arrow */}
      {hasOverflow && (
        <button
          type="button"
          onClick={() => handleScroll("left")}
          disabled={!canScrollLeft}
          aria-label="Scroll menu left"
          title="Previous options"
          className={cn(
            "shrink-0 z-20 flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-primary/40",
            arrowPlacement === "inline" ? "mr-1.5" : "absolute left-1 top-1/2 -translate-y-1/2 shadow-lg",
            canScrollLeft ? variantStyles.active : variantStyles.disabled,
            arrowClassName
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Main Scroll Container */}
      <div
        ref={scrollRef}
        className={cn(
          "flex-1 flex items-center overflow-x-auto scrollbar-none scroll-smooth",
          contentClassName
        )}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>

      {/* Right Corner Arrow */}
      {hasOverflow && (
        <button
          type="button"
          onClick={() => handleScroll("right")}
          disabled={!canScrollRight}
          aria-label="Scroll menu right"
          title="More options"
          className={cn(
            "shrink-0 z-20 flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-primary/40",
            arrowPlacement === "inline" ? "ml-1.5" : "absolute right-1 top-1/2 -translate-y-1/2 shadow-lg",
            canScrollRight ? variantStyles.active : variantStyles.disabled,
            arrowClassName
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
