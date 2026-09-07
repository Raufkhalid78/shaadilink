"use client";

import { m } from "framer-motion";
import { useLanguage } from "@/components/language-provider";
import { Heart, Cake, GraduationCap } from "lucide-react";

export function HowItWorks() {
  const { t, language } = useLanguage();
  const isRtl = language === 'ur';

  const events = [
    {
      icon: <Heart className="w-8 h-8 text-rose-400" />,
      title: isRtl ? "شادی کی تقریبات" : "Weddings & Marriages",
      desc: isRtl ? "مہندی، بارات، اور ولیمے کے لیے خوبصورت ڈیجیٹل کارڈز بنائیں۔" : "Create breathtaking, elegant digital invitations with 3D envelope reveals and customized itineraries for your special day.",
      gradient: "from-rose-500/20 to-transparent",
      borderColor: "border-rose-500/20",
    },
    {
      icon: <Cake className="w-8 h-8 text-amber-400" />,
      title: isRtl ? "سالگرہ کی پارٹیاں" : "Birthdays & Parties",
      desc: isRtl ? "بچوں اور بڑوں کی سالگرہ کے لیے تفریحی اور دلچسپ دعوت نامے۔" : "Fun, vibrant, and interactive invitations perfect for kids' birthdays, milestone celebrations, and private parties.",
      gradient: "from-amber-500/20 to-transparent",
      borderColor: "border-amber-500/20",
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-blue-400" />,
      title: isRtl ? "اسکول اور کالج ایونٹس" : "School & College Events",
      desc: isRtl ? "اسکول کی تقریبات، الوداعی پارٹیوں اور کانووکیشن کے لیے۔" : "Professional yet highly approachable digital invites for graduations, farewell parties, and alumni meetups.",
      gradient: "from-blue-500/20 to-transparent",
      borderColor: "border-blue-500/20",
    },
  ];

  return (
    <section id="use-cases" className="py-24 relative bg-card/30 border-y border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <m.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-medium tracking-widest uppercase text-xs text-primary mb-4 block"
          >
            {isRtl ? "ہر تقریب کے لیے" : "Events We Support"}
          </m.span>
          <m.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4"
          >
            {isRtl ? "آپ کی ہر خوشی کے لیے تیار کردہ" : "Beautifully crafted for every occasion."}
          </m.h2>
          <m.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg"
          >
            {isRtl ? "چاہے شادی ہو یا سالگرہ، ہم آپ کے لیے موجود ہیں۔" : "Whether you are walking down the aisle or blowing out candles, Smart Invites makes your event unforgettable from the first click."}
          </m.p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {events.map((event, i) => (
            <m.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`relative bg-background rounded-3xl p-8 border ${event.borderColor} hover:bg-white/[0.02] transition-colors`}
            >
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${event.gradient} opacity-20 pointer-events-none`} />
              <div className="relative z-10">
                <div className="mb-6 bg-card inline-flex p-4 rounded-2xl shadow-lg border border-white/5">
                  {event.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{event.title}</h3>
                <p className="text-white/60 leading-relaxed">{event.desc}</p>
              </div>
            </m.div>
          ))}
        </div>

      </div>
    </section>
  );
}
