"use client";

import { motion } from "framer-motion";
import { Star, Heart, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Aisha & Omar",
    event: "Baraat — Lahore",
    quote:
      "Our guests were absolutely blown away! The scratch card reveal had everyone excited, and the door animation set the perfect tone for our celebration.",
    rating: 5,
    template: "Crimson Royale",
  },
  {
    name: "Fatima & Hassan",
    event: "Walima — Karachi",
    quote:
      "We saved so much money compared to paper cards, and the digital invitation was 100x more impressive. The countdown timer built so much excitement!",
    rating: 5,
    template: "Emerald Noir",
  },
  {
    name: "Zara & Bilal",
    event: "Mehndi — Islamabad",
    quote:
      "The RSVP feature was a lifesaver — we could track exactly who was coming. And the WhatsApp sharing made distribution effortless.",
    rating: 5,
    template: "Rose Gold Blush",
  },
  {
    name: "Maryam & Ahmed",
    event: "Nikkah — Faisalabad",
    quote:
      "Our families in Saudi Arabia and the UK could see the invitation instantly. The map integration helped international guests find the venue easily.",
    rating: 5,
    template: "Mughal Emerald",
  },
  {
    name: "Sana & Rizwan",
    event: "Reception — Multan",
    quote:
      "The background music and animations made it feel so luxurious. Our guests kept asking how we made such an amazing invitation!",
    rating: 5,
    template: "Midnight Royal",
  },
  {
    name: "Hina & Kamran",
    event: "Dholki — Peshawar",
    quote:
      "Absolutely worth every rupee. The Royal plan's fireworks and effects added that extra magic to our invitation. Highly recommended!",
    rating: 5,
    template: "Golden Nawab",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function Testimonials() {
  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-20 reveal-on-scroll">
          <span className="inline-block font-calligraphy text-gold text-lg mb-3">
            ✦ Reviews ✦
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            What Our <span className="gold-shimmer">Couples</span> Say
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-base sm:text-lg">
            Join thousands of happy Pakistani families who chose ShaadiLink.
          </p>
        </div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={cardVariants}>
              <Card className="group relative overflow-hidden border-border/50 hover:border-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-gold/5 h-full">
                <CardContent className="p-6">
                  {/* Quote icon */}
                  <Quote className="w-8 h-8 text-gold/20 mb-3" />

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-gold fill-gold"
                      />
                    ))}
                  </div>

                  {/* Quote text */}
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div>
                      <p className="font-display text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Heart className="w-3 h-3 text-gold fill-gold" />
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {testimonial.event}
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-emerald/10 text-emerald font-medium">
                      {testimonial.template}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
