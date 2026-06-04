"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";

/* ─── Stat Data ─── */

interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

const stats: StatItem[] = [
  { value: 5000, suffix: "+", label: "Happy Families" },
  { value: 50000, suffix: "+", label: "Guests Reached" },
  { value: 99, suffix: "%", label: "Satisfaction Rate" },
  { value: 15, suffix: "+", label: "Premium Templates" },
];

/* ─── Animated Counter ─── */

function AnimatedCounter({
  value,
  suffix,
  inView,
}: {
  value: number;
  suffix: string;
  inView: boolean;
}) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => {
    if (value >= 1000) {
      return Math.round(v).toLocaleString();
    }
    return Math.round(v).toString();
  });
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!inView) return;

    const controls = animate(motionVal, value, {
      duration: 2,
      ease: "easeOut",
    });

    const unsubscribe = rounded.on("change", (v) => {
      if (nodeRef.current) {
        nodeRef.current.textContent = v + suffix;
      }
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [inView, value, suffix, motionVal, rounded]);

  return (
    <span
      ref={nodeRef}
      className="font-display text-3xl sm:text-4xl font-bold gold-shimmer-strong"
    >
      0{suffix}
    </span>
  );
}

/* ─── Individual Stat ─── */

function StatCard({
  stat,
  index,
  inView,
}: {
  stat: StatItem;
  index: number;
  inView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      className="flex flex-col items-center px-4 py-5 sm:py-6"
    >
      <AnimatedCounter
        value={stat.value}
        suffix={stat.suffix}
        inView={inView}
      />
      <span className="mt-2 text-white/60 text-xs sm:text-sm uppercase tracking-wider text-center">
        {stat.label}
      </span>
    </motion.div>
  );
}

/* ─── Stats Bar Component ─── */

export function StatsBar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });

  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full bg-emerald-dark"
    >
      {/* Gold geometric border - top */}
      <div
        className="w-full h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(180,145,77,0.2) 15%, rgba(212,168,83,0.4) 30%, rgba(180,145,77,0.2) 50%, rgba(212,168,83,0.4) 70%, rgba(180,145,77,0.2) 85%, transparent)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={stat.label} className="relative">
              <StatCard stat={stat} index={i} inView={isInView} />
              {/* Vertical divider between items (hidden on mobile, hidden after last) */}
              {i < stats.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-10 w-px bg-gold/20" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Gold geometric border - bottom */}
      <div
        className="w-full h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(180,145,77,0.2) 15%, rgba(212,168,83,0.4) 30%, rgba(180,145,77,0.2) 50%, rgba(212,168,83,0.4) 70%, rgba(180,145,77,0.2) 85%, transparent)",
        }}
      />
    </motion.section>
  );
}
