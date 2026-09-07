"use client";

import { m } from 'framer-motion';
import { Heart, Cake, GraduationCap, Briefcase } from 'lucide-react';

export function CategorySelector({ onSelect }: { onSelect: (id: string) => void }) {
  const categories = [
    { id: 'wedding', icon: <Heart className="w-10 h-10 text-rose-400" />, title: 'Weddings & Marriages', desc: 'Elegant digital invitations for your special day.', gradient: 'from-rose-500/20 to-transparent' },
    { id: 'school', icon: <GraduationCap className="w-10 h-10 text-blue-400" />, title: 'School & College', desc: 'Professional invites for graduations and farewells.', gradient: 'from-blue-500/20 to-transparent' },
    { id: 'birthday', icon: <Cake className="w-10 h-10 text-amber-400" />, title: 'Birthdays & Parties', desc: 'Fun and vibrant invitations for all ages.', gradient: 'from-amber-500/20 to-transparent' },
    { id: 'meeting', icon: <Briefcase className="w-10 h-10 text-emerald-400" />, title: 'Meetings & Corporate', desc: 'Clean, modern invitations for professional events.', gradient: 'from-emerald-500/20 to-transparent' },
  ];

  return (
    <div className="min-h-screen bg-background pt-32 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <m.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            What are you hosting?
          </m.h1>
          <m.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/60"
          >
            Select an event type to view tailored templates and pricing.
          </m.p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <m.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onSelect(cat.id)}
              className="relative bg-card text-left p-8 rounded-3xl border border-white/10 hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 group overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative z-10">
                <div className="mb-6 bg-background inline-flex p-4 rounded-2xl shadow-lg border border-white/5 group-hover:scale-110 transition-transform duration-500">
                  {cat.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{cat.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{cat.desc}</p>
              </div>
            </m.button>
          ))}
        </div>
      </div>
    </div>
  );
}
