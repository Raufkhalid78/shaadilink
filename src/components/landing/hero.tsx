"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { Sparkles, ArrowRight, Play } from "lucide-react";
import { useRouter } from "next/navigation";

export function Hero() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 768px)').matches);
  }, []);

  const orbs = useMemo(() => {
    if (isMobile) return []; // Save battery on mobile
    return [
      { id: 1, size: 400, left: 10, top: 20, delay: 0, duration: 15, color: 'rgba(251, 191, 36, 0.08)' },
      { id: 2, size: 500, left: 60, top: 40, delay: 2, duration: 20, color: 'rgba(251, 146, 60, 0.08)' },
      { id: 3, size: 300, left: 40, top: -10, delay: 5, duration: 18, color: 'rgba(244, 114, 182, 0.08)' }
    ];
  }, [isMobile]);

  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden bg-background">
      
      {/* Background Orbs */}
      {orbs.map((o) => (
        <m.div
          key={o.id}
          className="absolute rounded-full pointer-events-none mix-blend-screen filter blur-[100px]"
          style={{ width: o.size, height: o.size, left: `${o.left}%`, top: `${o.top}%`, backgroundColor: o.color }}
          animate={{ x: [0, 40, -40, 0], y: [0, -40, 40, 0], scale: [1, 1.2, 0.8, 1] }}
          transition={{ duration: o.duration, delay: o.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Copy */}
        <div className="text-left space-y-8">
          <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm tracking-wide"
          >
            <Sparkles className="w-4 h-4" />
            {language === 'en' ? "Smart Invites 2.0 is Here" : "اسمارٹ انوائٹس متعارف کروا رہے ہیں"}
          </m.div>

          <m.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]"
          >
            {language === 'en' ? (
              <>Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300">Beautiful</span><br/> Digital Invitations.</>
            ) : (
              <>خوبصورت <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300">ڈیجیٹل</span><br/> دعوت نامے بنائیں۔</>
            )}
          </m.h1>

          <m.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-white/60 max-w-xl leading-relaxed"
          >
            {language === 'en' 
              ? "The smartest way to host weddings, birthdays, and school events. Send custom links, track RSVPs, and manage your guest list effortlessly."
              : "شادیوں، سالگرہ، اور اسکول کی تقریبات کے لیے بہترین پلیٹ فارم۔ کسٹم لنکس بھیجیں اور مہمانوں کی فہرست آسانی سے مینیج کریں۔"}
          </m.p>

          <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <Button size="lg" className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all gap-2" onClick={() => router.push('/dashboard')}>
              {language === 'en' ? "Create Event Free" : "مفت دعوت نامہ بنائیں"}
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 border-primary/20 text-foreground hover:bg-primary/5 rounded-full font-medium text-lg gap-2" onClick={() => router.push('/templates')}>
              <Play className="w-5 h-5 fill-current opacity-70" />
              {language === 'en' ? "View Templates" : "ڈیزائنز دیکھیں"}
            </Button>
          </m.div>

          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-8 flex items-center gap-4 text-sm text-white/40"
          >
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /> No credit card required</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Cancel anytime</span>
          </m.div>
        </div>

        {/* Right: Floating 3D Event Card (SaaS Style) */}
        <m.div 
          initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
          animate={{ opacity: 1, scale: 1, rotateY: -10 }}
          transition={{ duration: 1, delay: 0.2, type: "spring" }}
          className="relative perspective-1000 hidden lg:block"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-[2rem] filter blur-3xl transform -translate-y-4" />
          
          <div className="relative bg-card/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-10 shadow-2xl transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-y-0 transition-transform duration-700">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-12">
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium tracking-widest text-primary uppercase">
                You're Invited
              </span>
              <Sparkles className="w-5 h-5 text-primary/50" />
            </div>

            {/* Event Name */}
            <div className="text-center space-y-4 mb-16">
              <h3 className="text-4xl font-bold text-white tracking-tight">Annual Tech Summit</h3>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-px bg-gradient-to-r from-transparent to-primary/50" />
                <span className="text-primary tracking-widest text-sm font-medium">2026</span>
                <div className="w-12 h-px bg-gradient-to-l from-transparent to-primary/50" />
              </div>
            </div>

            {/* Agenda/Details */}
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-white/60 text-sm">MARCH 15</span>
                <span className="text-white font-medium">9:00 AM</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-white/60 text-sm">KEYNOTE</span>
                <span className="text-white font-medium">MAIN HALL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">NETWORKING</span>
                <span className="text-white font-medium">ROOFTOP</span>
              </div>
            </div>
            
            <div className="mt-12 flex justify-center">
              <div className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium shadow-inner">
                RSVP Now
              </div>
            </div>
          </div>
        </m.div>

      </div>
    </section>
  );
}
