"use client";

import { m } from "framer-motion";
import { Star, Heart, CheckCircle2, LayoutTemplate } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useEffect, useState } from "react";

interface Testimonial {
  id: string | number;
  initials: string;
  name: string;
  location: string;
  eventType: string;
  date: string;
  stars: number;
  quote: string;
  avatarColor: string;
  templateName?: string;
}

const fallbackTestimonials: Testimonial[] = [
  {
    id: 'f1',
    initials: "ZA",
    name: "Zainab & Ahmed",
    location: "Lahore",
    eventType: "Walima",
    date: "October 2026",
    stars: 5,
    quote: "ShaadiLink made our Walima invitation absolutely magical. Our guests couldn't believe it wasn't a printed card — the 3D door reveal left everyone speechless!",
    avatarColor: "bg-[#f59e0b]", // Solid orange-amber
    templateName: "Used Crimson Royale",
  },
  {
    id: 'f2',
    initials: "SA",
    name: "Sara & Ali",
    location: "Karachi",
    eventType: "Baraat",
    date: "December 2026",
    stars: 5,
    quote: "The scratch card feature for revealing our wedding date was the most talked about thing at our engagement! Every family member loved it.",
    avatarColor: "bg-[#10b981]", // Solid emerald
    templateName: "Used Emerald Noir",
  },
  {
    id: 'f3',
    initials: "FK",
    name: "Fatima & Kamran",
    location: "Islamabad",
    eventType: "Mehndi",
    date: "March 2027",
    stars: 5,
    quote: "The Urdu translation feature is beautiful and our older relatives really appreciated being able to read it in their native tongue.",
    avatarColor: "bg-[#8b5cf6]", // Solid violet
    templateName: "Used Mint Elegance",
  },
];

export function Testimonials() {
  const { language } = useLanguage();
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews');
        if (!res.ok) return;
        const data = await res.json();
        const reviews = data.reviews || [];
        
        if (reviews.length > 0) {
          const formatted = reviews.map((r: any, idx: number) => {
            const p1 = r.invitations?.partner1_name || "Partner";
            const p2 = r.invitations?.partner2_name || "";
            const name = p2 ? `${p1} & ${p2}` : p1;
            const initials = (p1.charAt(0) + (p2 ? p2.charAt(0) : p1.charAt(1) || '')).toUpperCase();
            
            // Generate a deterministic color based on index
            const colors = ['bg-[#f59e0b]', 'bg-[#10b981]', 'bg-[#8b5cf6]', 'bg-[#ec4899]', 'bg-[#3b82f6]'];
            const avatarColor = colors[idx % colors.length];

            const date = new Date(r.created_at).toLocaleDateString("en-US", { month: 'long', year: 'numeric' });

            return {
              id: r.id,
              initials,
              name,
              location: r.invitations?.venue?.split(',')[0] || "Pakistan",
              eventType: "WEDDING", 
              date,
              stars: r.rating,
              quote: r.message,
              avatarColor,
              templateName: r.template_name ? `Used ${r.template_name}` : "Used ShaadiLink",
            };
          });
          
          if (formatted.length >= 3) {
            setTestimonials(formatted);
          } else {
            setTestimonials([...formatted, ...fallbackTestimonials.slice(0, 3 - formatted.length)]);
          }
        }
      } catch (err) {
        console.error("Failed to load reviews", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchReviews();
  }, []);

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-[#0A0A0A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <m.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/10 text-gold text-xs font-semibold tracking-wider uppercase mb-4"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            {language === 'en' ? 'Love Stories' : 'محبت کی کہانیاں'}
          </m.span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            {language === 'en' ? 'What Our ' : 'ہمارے '}<span className="gold-shimmer">{language === 'en' ? 'Couples' : 'جوڑوں'}</span>{language === 'en' ? ' Say' : ' کی رائے'}
          </h2>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
            <div className="h-1.5 w-1.5 rounded-full bg-gold/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {testimonials.map((t, idx) => (
            <m.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="relative p-8 rounded-2xl border border-gold/20 bg-[#0f1110] flex flex-col justify-between transition-all duration-300 hover:border-gold/40 group shadow-lg"
            >
              <div>
                {/* Profile Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-full ${t.avatarColor} flex items-center justify-center text-white font-bold text-lg tracking-wide shadow-md`}>
                    {t.initials}
                  </div>
                  <div className="text-left">
                    <p className="font-display font-bold text-base text-white">
                      {t.name}
                    </p>
                    <span className="text-xs text-muted-foreground/80">
                      {t.location} · {t.date}
                    </span>
                  </div>
                </div>

                {/* Stars and Event Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex gap-1 text-gold">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-gold px-3 py-1 rounded-full font-semibold border border-gold/30 bg-black/40">
                    {t.eventType}
                  </span>
                </div>

                {/* Quote Content */}
                <p className="text-muted-foreground/90 text-sm sm:text-base leading-relaxed text-left italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Bottom Verification Label */}
              <div className="mt-8 pt-4 border-t border-border/10 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground/60">
                <span className="flex items-center gap-1.5 text-emerald-500">
                  <CheckCircle2 className="w-4 h-4" />
                  {language === 'en' ? 'Verified Couple' : 'تصدیق شدہ جوڑا'}
                </span>
                
                {t.templateName && (
                  <span className="flex items-center gap-1.5 text-gold/80">
                    <LayoutTemplate className="w-4 h-4" />
                    {t.templateName}
                  </span>
                )}
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
