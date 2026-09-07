"use client";

import { useLanguage } from "@/components/language-provider";
import { m } from "framer-motion";
import { Sparkles, BarChart3, Users, Link as LinkIcon, Share2, Paintbrush } from "lucide-react";

export function Features() {
  const { t, language } = useLanguage();
  const isRtl = language === 'ur';

  const features = [
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: isRtl ? "آسان گیسٹ لسٹ مینجمنٹ" : "Smart Guest Management",
      desc: isRtl ? "اپنے مہمانوں کی فہرست بنائیں اور ان کے آنے کی تصدیق (RSVP) ایک ہی جگہ پر دیکھیں۔" : "Effortlessly manage your guest list and track RSVPs in real-time from a beautiful dashboard.",
      className: "md:col-span-2 md:row-span-2 bg-gradient-to-br from-primary/10 to-transparent",
    },
    {
      icon: <Paintbrush className="w-6 h-6 text-primary" />,
      title: isRtl ? "خوبصورت ڈیزائنز" : "Premium Themes",
      desc: isRtl ? "ہر تقریب کے لیے بہترین رنگ اور ڈیزائن کا انتخاب کریں۔" : "Choose from stunning, highly customizable themes for weddings, birthdays, and galas.",
      className: "md:col-span-1 md:row-span-1",
    },
    {
      icon: <Share2 className="w-6 h-6 text-primary" />,
      title: isRtl ? "واٹس ایپ شیئرنگ" : "Instant WhatsApp Share",
      desc: isRtl ? "ایک کلک سے واٹس ایپ پر دعوت نامہ بھیجیں۔" : "Share your personalized invitation link instantly via WhatsApp with zero friction.",
      className: "md:col-span-1 md:row-span-1",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-primary" />,
      title: isRtl ? "لائیو اینالیٹکس" : "Live Analytics",
      desc: isRtl ? "دیکھیں کہ کتنے لوگوں نے آپ کا دعوت نامہ دیکھا ہے۔" : "Track exactly how many guests have opened your invitation and responded.",
      className: "md:col-span-2 md:row-span-1 bg-gradient-to-r from-transparent to-primary/5",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <m.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-medium tracking-widest uppercase text-xs text-primary mb-4 block"
          >
            {isRtl ? "خصوصیات" : "Everything You Need"}
          </m.span>
          <m.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4"
          >
            {isRtl ? "آپ کی تقریب کے لیے بہترین ٹولز" : "Powerful features for perfect events."}
          </m.h2>
          <m.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg"
          >
            {isRtl ? "اسمارٹ انوائٹس کے ساتھ اپنی تقریبات کو یادگار بنائیں۔" : "We provide everything you need to impress your guests and manage your event flawlessly."}
          </m.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[200px]">
          {features.map((feat, i) => (
            <m.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-3xl border border-primary/10 bg-card p-8 overflow-hidden hover:border-primary/30 transition-colors group ${feat.className}`}
            >
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity duration-500 transform group-hover:scale-110">
                {feat.icon}
              </div>
              
              <div className="relative z-10 h-full flex flex-col justify-end">
                <div className="w-12 h-12 rounded-xl bg-background border border-primary/20 flex items-center justify-center mb-6 shadow-lg shadow-primary/10">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{feat.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed max-w-[85%]">{feat.desc}</p>
              </div>
            </m.div>
          ))}
        </div>

      </div>
    </section>
  );
}
