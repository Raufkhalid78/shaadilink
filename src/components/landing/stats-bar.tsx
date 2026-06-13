"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Heart, Users, MessageCircle } from "lucide-react";

interface StatsData {
  invitations: number;
  rsvps: number;
  wishes: number;
}

const statConfig = [
  {
    key: "invitations" as const,
    icon: Users,
    suffix: "",
    label: "Invitations Live",
    color: "text-emerald",
    glow: "0 0 20px rgba(82, 170, 120, 0.4)",
  },
  {
    key: "rsvps" as const,
    icon: Heart,
    suffix: "",
    label: "RSVPs Collected",
    color: "text-rose-400",
    glow: "0 0 20px rgba(251, 113, 133, 0.4)",
  },
  {
    key: "wishes" as const,
    icon: MessageCircle,
    suffix: "",
    label: "Wishes Sent",
    color: "text-gold",
    glow: "0 0 20px rgba(212, 168, 83, 0.5)",
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
  const [statsData, setStatsData] = useState<StatsData>({
    invitations: 0,
    rsvps: 0,
    wishes: 0,
  });

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data: StatsData) => setStatsData(data))
      .catch(() => {
        // silently fail — keep zeros
      });
  }, []);

  const allZero =
    statsData.invitations === 0 &&
    statsData.rsvps === 0 &&
    statsData.wishes === 0;

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
        {/* Heading + subtitle */}
        <div className="text-center mb-8">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Every number is live — updated automatically
          </p>
        </div>

        {/* Zero-state banner */}
        {allZero && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 mx-auto max-w-xl rounded-xl border border-gold/20 bg-gold/5 px-5 py-3 text-center text-sm text-gold/80"
          >
            We&apos;re just getting started — every number here is real and growing!
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gold/10 rounded-2xl overflow-hidden border border-gold/10 shadow-lg shadow-black/30">
          {statConfig.map((stat, i) => {
            const Icon = stat.icon;
            const value = statsData[stat.key];
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
                    target={value}
                    suffix={stat.suffix}
                    isDecimal={value !== Math.floor(value)}
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
