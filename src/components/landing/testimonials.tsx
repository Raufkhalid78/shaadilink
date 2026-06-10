"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Aisha & Omar",
    event: "Baraat — Lahore",
    quote:
      "Our guests were absolutely blown away! The scratch card reveal had everyone excited, and the door animation set the perfect tone for our celebration.",
    rating: 5,
    template: "Crimson Royale",
    color: "from-rose-600 to-red-700",
    initials: "AO",
  },
  {
    name: "Fatima & Hassan",
    event: "Walima — Karachi",
    quote:
      "We saved so much money compared to paper cards, and the digital invitation was 100x more impressive. The countdown timer built so much excitement!",
    rating: 5,
    template: "Emerald Noir",
    color: "from-emerald-600 to-teal-700",
    initials: "FH",
  },
  {
    name: "Zara & Bilal",
    event: "Mehndi — Islamabad",
    quote:
      "The RSVP feature was a lifesaver — we could track exactly who was coming. And WhatsApp sharing made distribution completely effortless.",
    rating: 5,
    template: "Garden Romance",
    color: "from-pink-500 to-rose-600",
    initials: "ZB",
  },
  {
    name: "Maryam & Ahmed",
    event: "Nikkah — Faisalabad",
    quote:
      "Our families in Saudi Arabia and the UK could see the invitation instantly. The map integration helped international guests find the venue so easily.",
    rating: 5,
    template: "Mughal Emerald",
    color: "from-teal-500 to-cyan-600",
    initials: "MA",
  },
  {
    name: "Sana & Rizwan",
    event: "Reception — Multan",
    quote:
      "The background music and animations made it feel so luxurious. Our guests kept asking how we made such an amazing invitation — worth every rupee!",
    rating: 5,
    template: "Royal Imperial",
    color: "from-amber-500 to-yellow-600",
    initials: "SR",
  },
  {
    name: "Hina & Kamran",
    event: "Dholki — Peshawar",
    quote:
      "Absolutely worth every rupee. The Royal plan's fireworks and effects added that extra magic to our invitation. Highly recommended for every couple!",
    rating: 5,
    template: "Royal Elegance",
    color: "from-violet-500 to-purple-600",
    initials: "HK",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 text-gold fill-gold" />
      ))}
    </div>
  );
}

export function Testimonials() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = () => setActiveIdx((i) => (i + 1) % testimonials.length);
  const prev = () => setActiveIdx((i) => (i - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    if (!autoPlay) return;
    intervalRef.current = setInterval(next, 4500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoPlay, activeIdx]);

  const pauseAutoPlay = () => {
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  // Show 3 cards: prev, active, next
  const visible = [-1, 0, 1].map((offset) => {
    const idx = (activeIdx + offset + testimonials.length) % testimonials.length;
    return { ...testimonials[idx], offset };
  });

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
            5,000+ Happy Families
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
            Join thousands of happy Pakistani families who chose ShaadiLink for their special day.
          </motion.p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Cards */}
          <div className="flex items-center justify-center gap-4 lg:gap-6 min-h-[320px]">
            {visible.map(({ offset, ...testimonial }) => {
              const isCenter = offset === 0;
              return (
                <motion.div
                  key={`${testimonial.name}-${offset}`}
                  initial={false}
                  animate={{
                    scale: isCenter ? 1 : 0.88,
                    opacity: isCenter ? 1 : 0.45,
                    y: isCenter ? 0 : 24,
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  onClick={() => {
                    if (!isCenter) {
                      pauseAutoPlay();
                      if (offset === -1) prev();
                      else next();
                    }
                  }}
                  className={`relative rounded-2xl border overflow-hidden transition-shadow duration-500 ${
                    isCenter
                      ? "w-full max-w-md border-gold/30 shadow-2xl shadow-gold/10 cursor-default"
                      : "hidden lg:block w-72 border-border/20 cursor-pointer hover:opacity-60"
                  }`}
                  style={{
                    background: isCenter
                      ? "linear-gradient(145deg, oklch(0.16 0.03 155 / 0.95), oklch(0.12 0.02 155 / 0.9))"
                      : "oklch(0.14 0.02 155 / 0.6)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {/* Gold top border on active */}
                  {isCenter && (
                    <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
                  )}

                  <div className="p-6 sm:p-8">
                    {/* Quote icon */}
                    <Quote className="w-10 h-10 text-gold/15 mb-4" />

                    {/* Stars */}
                    <StarRating count={testimonial.rating} />

                    {/* Text */}
                    <p className="mt-4 text-sm sm:text-base text-muted-foreground italic leading-relaxed">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="mt-6 pt-5 border-t border-border/20 flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.color} text-white font-display text-sm font-bold shadow-lg`}
                      >
                        {testimonial.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-display text-sm font-semibold text-foreground">
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{testimonial.event}</p>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold font-medium whitespace-nowrap shrink-0">
                        {testimonial.template}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => { pauseAutoPlay(); prev(); }}
              className="flex items-center justify-center w-12 h-12 rounded-full border border-gold/20 bg-card/60 text-muted-foreground hover:text-gold hover:border-gold/50 transition-all duration-300"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-1">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { pauseAutoPlay(); setActiveIdx(i); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full focus:outline-none"
                  aria-label={`Go to testimonial slide ${i + 1}`}
                >
                  <div className={`rounded-full transition-all duration-300 ${
                    i === activeIdx ? "w-5 h-2 bg-gold" : "w-2 h-2 bg-muted-foreground/30 hover:bg-gold/40"
                  }`} />
                </button>
              ))}
            </div>

            <button
              onClick={() => { pauseAutoPlay(); next(); }}
              className="flex items-center justify-center w-12 h-12 rounded-full border border-gold/20 bg-card/60 text-muted-foreground hover:text-gold hover:border-gold/50 transition-all duration-300"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10"
        >
          {[
            { value: "5,000+", label: "Families served" },
            { value: "4.9 / 5", label: "Average rating" },
            { value: "30+ countries", label: "Global reach" },
            { value: "98%", label: "Satisfaction rate" },
          ].map((badge) => (
            <div key={badge.label} className="text-center">
              <p className="font-display text-2xl font-bold text-gold text-glow-gold">{badge.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{badge.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
