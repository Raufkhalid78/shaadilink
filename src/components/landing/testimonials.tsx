"use client";

import { m } from "framer-motion";
import { Star, Heart, CheckCircle2, MessageSquare } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

interface Testimonial {
  id: number;
  initials: string;
  name: string;
  nameUr: string;
  location: string;
  locationUr: string;
  eventType: string;
  eventTypeUr: string;
  date: string;
  dateUr: string;
  stars: number;
  quote: string;
  quoteUr: string;
  avatarGradient: string;
  featured?: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    initials: "ZA",
    name: "Zainab & Ahmed",
    nameUr: "زینب اور احمد",
    location: "Lahore",
    locationUr: "لاہور",
    eventType: "Walima",
    eventTypeUr: "ولیمہ",
    date: "October 2026",
    dateUr: "اکتوبر 2026",
    stars: 5,
    quote: "ShaadiLink made our Walima invitation absolutely magical. Our guests couldn't believe it wasn't a printed card — the 3D door reveal left everyone speechless!",
    quoteUr: "شادی لنک نے ہمارے ولیمے کا دعوت نامہ بالکل جادوئی بنا دیا۔ ہمارے مہمان یقین نہیں کر پا رہے تھے کہ یہ ایک آن لائن کارڈ ہے — 3D گیٹ کھلنے کے انداز نے سب کو حیران کر دیا!",
    avatarGradient: "from-gold to-amber-600",
  },
  {
    id: 2,
    initials: "SA",
    name: "Sara & Ali",
    nameUr: "سارہ اور علی",
    location: "Karachi",
    locationUr: "کراچی",
    eventType: "Baraat",
    eventTypeUr: "بارات",
    date: "December 2026",
    dateUr: "دسمبر 2026",
    stars: 5,
    quote: "The scratch card feature for revealing our wedding date was the most talked about thing at our engagement! Every family member loved it. 100% recommend ShaadiLink.",
    quoteUr: "ہماری شادی کی تاریخ ظاہر کرنے کا اسکریچ کارڈ فیچر ہماری منگنی پر سب سے زیادہ پسند کیا گیا! خاندان کے ہر فرد نے اسے بے حد پسند کیا۔ میں اسے ضرور تجویز کروں گی۔",
    avatarGradient: "from-emerald to-teal-600",
    featured: true,
  },
  {
    id: 3,
    initials: "FK",
    name: "Fatima & Kamran",
    nameUr: "فاطمہ اور کامران",
    location: "Islamabad",
    locationUr: "اسلام آباد",
    eventType: "Mehndi",
    eventTypeUr: "مہندی",
    date: "March 2027",
    dateUr: "مارچ 2027",
    stars: 5,
    quote: "We ordered for our Mehndi and Baraat separately. The Urdu translation feature is beautiful and our older relatives really appreciated being able to read it in Urdu.",
    quoteUr: "ہم نے اپنی مہندی اور بارات کے لیے الگ الگ کارڈز کا آرڈر دیا تھا۔ اردو ترجمے کی سہولت بہت خوبصورت ہے اور ہمارے بزرگوں نے اسے اپنی زبان میں پڑھ کر بہت خوشی ظاہر کی۔",
    avatarGradient: "from-violet-500 to-purple-700",
  },
];

export function Testimonials() {
  const { language } = useLanguage();

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-dark/10 via-background to-background pointer-events-none" />
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 20% 50%, rgba(212,168,83,0.08) 0%, transparent 65%), radial-gradient(ellipse at 80% 50%, rgba(82,170,120,0.08) 0%, transparent 65%)",
        }}
      />

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
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            {language === 'en' ? 'What Our ' : 'ہمارے '}<span className="gold-shimmer">{language === 'en' ? 'Couples' : 'جوڑوں'}</span>{language === 'en' ? ' Say' : ' کی رائے'}
          </h2>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/50" />
            <div className="h-1.5 w-1.5 rounded-full bg-gold/60" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/50" />
          </div>
          <p className="mt-5 text-muted-foreground max-w-xl mx-auto text-sm sm:text-base md:text-lg text-center">
            {language === 'en'
              ? 'Real experiences from couples who created their digital wedding invitations with ShaadiLink.'
              : 'شادی لنک کے ساتھ ڈیجیٹل شادی دعوت نامے بنانے والے جوڑوں کے حقیقی تاثرات۔'}
          </p>
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
              className={`relative p-8 rounded-2xl border bg-card/40 backdrop-blur-md flex flex-col justify-between transition-all duration-300 hover:border-gold/30 group ${
                t.featured
                  ? "border-gold/30 shadow-xl shadow-gold/5 scale-102 z-10"
                  : "border-border/60"
              }`}
            >
              {/* Gold light leak effect on featured card */}
              {t.featured && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-50 pointer-events-none" />
              )}

              <div>
                {/* Profile Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.avatarGradient} flex items-center justify-center text-white font-bold tracking-wide shadow-md`}>
                    {t.initials}
                  </div>
                  <div className="text-left">
                    <p className="font-display font-bold text-base text-white">
                      {language === 'en' ? t.name : t.nameUr}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {language === 'en' ? `${t.location} · ${t.date}` : `${t.locationUr} · ${t.dateUr}`}
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
                  <span className="text-[10px] uppercase tracking-wider bg-gold/10 text-gold px-2.5 py-0.5 rounded-full font-semibold border border-gold/20">
                    {language === 'en' ? t.eventType : t.eventTypeUr}
                  </span>
                </div>

                {/* Quote Content */}
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed text-left italic">
                  &ldquo;{language === 'en' ? t.quote : t.quoteUr}&rdquo;
                </p>
              </div>

              {/* Bottom Verification Label */}
              <div className="mt-6 pt-4 border-t border-border/20 flex items-center justify-between text-xs text-muted-foreground/60">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald fill-emerald/20" />
                  {language === 'en' ? 'Verified Couple' : 'تصدیق شدہ جوڑا'}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-gold/60" />
                  {language === 'en' ? 'Share Story' : 'کہانی شیئر کریں'}
                </span>
              </div>
            </m.div>
          ))}
        </div>

        {/* Call to Action Button */}
        <div className="mt-12 text-center">
          <m.a
            href="https://wa.me/447517879333?text=I%20want%20to%20share%20my%20ShaadiLink%20review"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#25D366] text-emerald-dark font-bold text-sm tracking-wide shadow-lg shadow-[#25D366]/10 hover:bg-[#25D366]/90 transition-all duration-300"
          >
            💬 {language === 'en' ? 'Share Your Review on WhatsApp' : 'واٹس ایپ پر اپنی رائے شیئر کریں'}
          </m.a>
        </div>
      </div>
    </section>
  );
}
