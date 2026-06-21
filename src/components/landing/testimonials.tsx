"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-dark/20 via-background to-background" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse at 20% 50%, rgba(212,168,83,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(82,170,120,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 reveal-on-scroll">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/10 text-gold text-sm font-medium mb-4"
          >
            <Star className="w-3.5 h-3.5 fill-gold" />
            Be Our First Reviewer
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground"
          >
            What Our <span className="gold-shimmer">Couples</span> Say
          </motion.h2>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
            <div className="h-1.5 w-1.5 rounded-full bg-gold/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-5 text-muted-foreground max-w-xl mx-auto text-base sm:text-lg"
          >
            We&apos;re new — and we&apos;d love to hear from you.
          </motion.p>
        </div>

        {/* Honest empty state */}
        <div className="text-center py-12 px-6">
          {/* 5 stars */}
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
              >
                <svg className="w-8 h-8 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </motion.div>
            ))}
          </div>
          <h3 className="text-2xl font-display font-bold mb-3">Be Our First Reviewer!</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            We&apos;re a brand new platform crafted with love for Pakistani couples. Create your invitation and be the first to share your experience.
          </p>
          <a
            href="https://wa.me/447517879333?text=I%20want%20to%20share%20my%20ShaadiLink%20review"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald text-white font-semibold hover:bg-emerald-dark transition-colors"
          >
            💬 Share Your Review on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
