"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Heart, Users, Star, Globe } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: 5000,
    suffix: "+",
    label: "Families Served",
    color: "text-emerald",
    glow: "0 0 20px rgba(82, 170, 120, 0.4)",
  },
  {
    icon: Heart,
    value: 98,
    suffix: "%",
    label: "Satisfaction Rate",
    color: "text-rose-400",
    glow: "0 0 20px rgba(251, 113, 133, 0.4)",
  },
  {
    icon: Star,
    value: 4.9,
    suffix: "/5",
    label: "Average Rating",
    color: "text-gold",
    glow: "0 0 20px rgba(212, 168, 83, 0.5)",
  },
  {
    icon: Globe,
    value: 30,
    suffix: "+",
    label: "Countries Reached",
    color: "text-blue-400",
    glow: "0 0 20px rgba(96, 165, 250, 0.4)",
  },
];

function CountUp({
  target,
  suffix,
  isDecimal,
}: {
  target: number;
  suffix: string;
  isDecimal: boolean;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, target);
      setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.round(current));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [inView, target, isDecimal]);

  return (
    <span ref={ref}>
      {isDecimal ? count.toFixed(1) : count.toLocaleString()}
      {suffix}
    </span>
  );
}

export function StatsBar() {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Top & bottom gradient fade */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, oklch(0.16 0.04 155 / 0.6) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gold/10 rounded-2xl overflow-hidden border border-gold/10 shadow-lg shadow-black/30">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="relative flex flex-col items-center justify-center py-8 px-6 bg-card/80 backdrop-blur-sm gap-2 group hover:bg-card transition-colors duration-300"
              >
                {/* Glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-none"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${stat.glow.replace("0 0 20px ", "")} 0%, transparent 70%)`,
                  }}
                />

                {/* Icon */}
                <div
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 mb-1`}
                >
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>

                {/* Number */}
                <p
                  className={`font-display text-3xl sm:text-4xl font-bold ${stat.color} relative`}
                  style={{ textShadow: stat.glow }}
                >
                  <CountUp
                    target={stat.value}
                    suffix={stat.suffix}
                    isDecimal={stat.value !== Math.floor(stat.value)}
                  />
                </p>

                {/* Label */}
                <p className="text-xs sm:text-sm text-muted-foreground font-medium text-center leading-tight">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
