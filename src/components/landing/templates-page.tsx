"use client";

import { useState } from "react";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, Heart, Sparkles, Star, Search, X, Check, Crown, Gem, Shield, Cake, GraduationCap, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger, ScrollableTabsList } from "@/components/ui/tabs";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { ScrollableMenu } from "@/components/ui/scrollable-menu";

/* ---------- Template Data ---------- */
const classicTemplates = [
  {
    id: "emerald-noir",
    name: "Emerald Noir",
    theme: "Mehndi",
    description: "Deep green and gold with ornate corner accents and luxury door opening animation",
    category: "Wedding",
    bgClass: "bg-gradient-to-br from-emerald-dark via-emerald to-emerald-dark",
    borderClass: "border-gold/30",
    badgeText: "Limited Edition",
    badgeClass: "bg-gold/15 text-gold border-gold/25",
    patternColor: "text-gold/10",
    doorType: "3D Door Opening",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP"],
  },
  {
    id: "crimson-royale",
    name: "Crimson Royale",
    theme: "Baraat",
    description: "Dark charcoal base with gold and deep red accents, luxury card reveal experience",
    category: "Wedding",
    bgClass: "bg-gradient-to-br from-gray-900 via-red-950 to-gray-900",
    borderClass: "border-red-400/30",
    badgeText: "Most Liked",
    badgeClass: "bg-red-500/15 text-red-400 border-red-400/25",
    patternColor: "text-red-400/10",
    doorType: "Scratch Card Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP"],
  },
  {
    id: "majestic-love",
    name: "Majestic Love",
    theme: "Baraat",
    description: "Classic ivory and gold with palace motifs and velvet curtain opening animation",
    category: "Wedding",
    bgClass: "bg-gradient-to-br from-amber-950 via-yellow-900 to-amber-950",
    borderClass: "border-amber-400/30",
    badgeText: "New",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-400/25",
    patternColor: "text-amber-400/10",
    doorType: "Curtain Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP"],
  },
  {
    id: "garden-romance",
    name: "Garden Romance",
    theme: "Walima",
    description: "Soft rose and blush with floral accents and vertical card opening animation",
    category: "Wedding",
    bgClass: "bg-gradient-to-br from-rose-900 via-pink-900 to-rose-950",
    borderClass: "border-pink-400/30",
    badgeText: "New",
    badgeClass: "bg-pink-500/15 text-pink-400 border-pink-400/25",
    patternColor: "text-pink-400/10",
    doorType: "Petal Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP"],
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    theme: "Reception",
    description: "Deep navy and gold with geometric patterns and book-style opening animation",
    category: "Wedding",
    bgClass: "bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900",
    borderClass: "border-blue-400/30",
    badgeText: "New",
    badgeClass: "bg-blue-500/15 text-blue-400 border-blue-400/25",
    patternColor: "text-blue-400/10",
    doorType: "Book-style Opening",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP"],
  },
  {
    id: "mughal-emerald",
    name: "Mughal Emerald",
    theme: "Nikkah",
    description: "Emerald green and gold with Mughal-inspired floral door opening and Islamic patterns",
    category: "Wedding",
    bgClass: "bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-950",
    borderClass: "border-teal-400/30",
    badgeText: "Popular",
    badgeClass: "bg-teal-500/15 text-teal-400 border-teal-400/25",
    patternColor: "text-teal-400/10",
    doorType: "Floral Door Opening",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP", "Music"],
  },
  {
    id: "rose-gold-blush",
    name: "Rose Gold Blush",
    theme: "Walima",
    description: "Blush pink and rose gold with ornate floral door animation and elegant design",
    category: "Wedding",
    bgClass: "bg-gradient-to-br from-rose-900 via-rose-800 to-rose-950",
    borderClass: "border-rose-400/30",
    badgeText: "Popular",
    badgeClass: "bg-rose-500/15 text-rose-400 border-rose-400/25",
    patternColor: "text-rose-400/10",
    doorType: "Curtain Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP", "Music"],
  },
  {
    id: "ivory-dream",
    name: "Ivory Dream",
    theme: "Mayun",
    description: "Soft ivory and sage green with delicate botanical elements and gentle reveal animation",
    category: "Wedding",
    bgClass: "bg-gradient-to-br from-stone-800 via-stone-700 to-stone-800",
    borderClass: "border-stone-400/30",
    badgeText: "Elegant",
    badgeClass: "bg-stone-500/15 text-stone-300 border-stone-400/25",
    patternColor: "text-stone-400/10",
    doorType: "Petal Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP"],
  },
  {
    id: "watercolor-peach",
    name: "Watercolor Peach",
    theme: "Mehndi",
    description: "Soft peach and orange watercolor with petal reveal animation",
    category: "Wedding",
    bgClass: "bg-gradient-to-br from-orange-950 via-orange-900 to-orange-950",
    borderClass: "border-orange-400/30",
    badgeText: "New",
    badgeClass: "bg-orange-500/15 text-orange-300 border-orange-400/25",
    patternColor: "text-orange-400/10",
    doorType: "Petal Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP"],
  },
  {
    id: "pastel-floral",
    name: "Pastel Floral",
    theme: "Walima",
    description: "Soft pink and blush with elegant floral curtains and premium typography",
    category: "Wedding",
    bgClass: "bg-gradient-to-br from-fuchsia-950 via-pink-900 to-fuchsia-950",
    borderClass: "border-pink-300/30",
    badgeText: "Elegant",
    badgeClass: "bg-pink-400/15 text-pink-200 border-pink-400/25",
    patternColor: "text-pink-300/10",
    doorType: "Curtain Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP"],
  },
  {
    id: "minimal-white",
    name: "Minimal White",
    theme: "Reception",
    description: "Clean, elegant white and slate with a modern split-screen glass door reveal",
    category: "Wedding",
    bgClass: "bg-slate-50",
    borderClass: "border-slate-300/50",
    badgeText: "Modern",
    badgeClass: "bg-slate-200 text-slate-700 border-slate-300",
    patternColor: "text-slate-200",
    doorType: "Split-Screen Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP"],
    isLight: true,
  },
  // ==================== BIRTHDAY CLASSICS ====================
  {
    id: "pastel-paradise",
    name: "Pastel Paradise",
    theme: "Pastel Dream",
    description: "Whimsical pastel pink, mint, and lavender with soft curtain reveal and playful confetti",
    category: "Birthday",
    bgClass: "bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50",
    borderClass: "border-pink-300/60",
    badgeText: "Sweet & Fun",
    badgeClass: "bg-pink-400/15 text-pink-700 border-pink-400/25",
    patternColor: "text-pink-400/15",
    doorType: "Curtain Reveal",
    features: ["Curtain Animation", "Scratch Card", "Countdown", "Confetti", "RSVP"],
    isLight: true,
  },
  {
    id: "boho-chic",
    name: "Boho Chic",
    theme: "Terracotta & Blush",
    description: "Warm earthy terracotta, champagne tones, and botanical archway reveal",
    category: "Birthday",
    bgClass: "bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100",
    borderClass: "border-amber-600/30",
    badgeText: "Trendy Aesthetic",
    badgeClass: "bg-amber-600/15 text-amber-800 border-amber-600/25",
    patternColor: "text-amber-600/15",
    doorType: "Botanical Arch",
    features: ["Archway Animation", "Scratch Card", "Countdown", "RSVP", "Music"],
    isLight: true,
  },
  {
    id: "vintage-milestones",
    name: "Vintage Milestones",
    theme: "Charcoal & Gold",
    description: "Sophisticated charcoal lacquer with antique gold details for iconic milestone birthdays",
    category: "Birthday",
    bgClass: "bg-gradient-to-br from-zinc-950 via-neutral-900 to-zinc-950",
    borderClass: "border-amber-400/40",
    badgeText: "Milestone VIP",
    badgeClass: "bg-amber-400/15 text-amber-300 border-amber-400/25",
    patternColor: "text-amber-400/10",
    doorType: "Lacquer Doors",
    features: ["3D Door Opening", "Scratch Card", "Countdown", "Gold Dust", "RSVP"],
  },

  // ==================== SCHOOL & COLLEGE CLASSICS ====================
  {
    id: "academic-excellence",
    name: "Academic Excellence",
    theme: "Oxford Navy & Gold",
    description: "Prestigious navy and collegiate gold with formal crest doors for graduations & alumni",
    category: "School",
    bgClass: "bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950",
    borderClass: "border-yellow-400/40",
    badgeText: "Graduation Honor",
    badgeClass: "bg-yellow-400/15 text-yellow-300 border-yellow-400/25",
    patternColor: "text-yellow-400/10",
    doorType: "Crest Doors",
    features: ["Formal Doors", "Event Timeline", "Countdown", "Confetti", "RSVP"],
  },
  {
    id: "future-innovators",
    name: "Future Innovators",
    theme: "Cyber Cyan & Slate",
    description: "Futuristic tech grid aesthetic with glass panel reveal for hackathons and science fests",
    category: "School",
    bgClass: "bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950",
    borderClass: "border-cyan-400/40",
    badgeText: "Hackathon & Tech",
    badgeClass: "bg-cyan-400/15 text-cyan-300 border-cyan-400/25",
    patternColor: "text-cyan-400/10",
    doorType: "Glass Grid Reveal",
    features: ["Cyber Panel Reveal", "Live Countdown", "Schedule", "RSVP"],
  },
  {
    id: "campus-memories",
    name: "Campus Memories",
    theme: "Heritage Crimson",
    description: "Warm collegiate cream and heritage crimson with yearbook nostalgia for farewells & reunions",
    category: "School",
    bgClass: "bg-gradient-to-br from-stone-100 via-rose-50 to-stone-50",
    borderClass: "border-rose-900/30",
    badgeText: "Reunion & Prom",
    badgeClass: "bg-rose-900/15 text-rose-900 border-rose-900/25",
    patternColor: "text-rose-900/10",
    doorType: "Archway Reveal",
    features: ["Archway Reveal", "Photo Wall", "Countdown", "RSVP"],
    isLight: true,
  },

  // ==================== MEETINGS & CORPORATE CLASSICS ====================
  {
    id: "executive-summit",
    name: "Executive Summit",
    theme: "Platinum Steel",
    description: "Ultra-clean corporate steel and sky blue with modern split-glass reveal for summits & conferences",
    category: "Meeting",
    bgClass: "bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950",
    borderClass: "border-sky-400/40",
    badgeText: "Executive Suite",
    badgeClass: "bg-sky-400/15 text-sky-300 border-sky-400/25",
    patternColor: "text-sky-400/10",
    doorType: "Split Glass Reveal",
    features: ["Split Reveal", "Speaker Agenda", "Calendar Sync", "RSVP"],
  },
  {
    id: "creative-startup",
    name: "Creative Startup",
    theme: "Electric Amber",
    description: "High-contrast jet black and electric orange with modern bold typography for launches",
    category: "Meeting",
    bgClass: "bg-gradient-to-br from-black via-zinc-950 to-neutral-900",
    borderClass: "border-orange-500/40",
    badgeText: "Product Launch",
    badgeClass: "bg-orange-500/15 text-orange-400 border-orange-500/25",
    patternColor: "text-orange-500/10",
    doorType: "Modern Portal",
    features: ["Modern Portal", "Keynote Agenda", "Countdown", "RSVP"],
  },
  {
    id: "global-connect",
    name: "Global Connect",
    theme: "Emerald Slate",
    description: "Deep obsidian green with geometric network nodes for international forums & networking",
    category: "Meeting",
    bgClass: "bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950",
    borderClass: "border-emerald-400/40",
    badgeText: "Global Forum",
    badgeClass: "bg-emerald-400/15 text-emerald-300 border-emerald-400/25",
    patternColor: "text-emerald-400/10",
    doorType: "Geometric Matrix",
    features: ["Matrix Reveal", "Session Agenda", "Calendar Sync", "RSVP"],
  },
];

const royalTemplates = [
  {
    id: "lumina-celebration",
    name: "Lumina Celebration",
    theme: "Neon Glow",
    category: "Birthday",
    description: "A highly vibrant, animated, neon glowing celebration with playful fireworks and confetti. Absolute premium quality.",
    bgClass: "bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-950",
    borderClass: "border-fuchsia-400/30",
    badgeText: "Birthday Premium",
    badgeClass: "bg-fuchsia-400/15 text-fuchsia-300 border-fuchsia-400/25",
    patternColor: "text-fuchsia-300/10",
    doorType: "Glass Split Door Reveal",
    features: ["Glass Grid Reveal", "Laser Grid", "Neon Text", "Confetti", "Countdown", "Photo Gallery"],
  },
  {
    id: "royal-imperial",
    name: "Royal Imperial",
    theme: "Baraat",
    image: "/templates/royal-imperial.jpg",
    description: "Cinematic rose-gold opening with luxurious motifs and grand door animation",
    category: "Wedding",
    bgClass: "bg-gradient-to-br from-rose-950 via-amber-900 to-rose-950",
    borderClass: "border-amber-300/30",
    badgeText: "Cinematic Royal",
    badgeClass: "bg-amber-400/15 text-amber-300 border-amber-400/25",
    patternColor: "text-amber-300/10",
    doorType: "Cinematic Door Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP", "Music", "Photo Gallery", "Custom Domain"],
  },
  {
    id: "royal-elegance",
    name: "Royal Elegance",
    theme: "Walima",
    image: "/templates/royal-elegance.jpg",
    description: "Velvet cream and crimson cinematic experience with luxurious curtain animation",
    category: "Wedding",
    bgClass: "bg-gradient-to-br from-red-950 via-rose-900 to-red-950",
    borderClass: "border-rose-300/30",
    badgeText: "Premium Royal",
    badgeClass: "bg-rose-400/15 text-rose-300 border-rose-400/25",
    patternColor: "text-rose-300/10",
    doorType: "Curtain Door Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP", "Music", "Photo Gallery", "Custom Domain", "Priority Support"],
  },
  {
    id: "geometric-gold",
    name: "Geometric Gold",
    theme: "Reception",
    image: "/templates/geometric-gold.jpg",
    description: "Luxurious deep navy and gold geometric doors with sleek glass-grid panel reveal",
    category: "Wedding",
    bgClass: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950",
    borderClass: "border-amber-400/30",
    badgeText: "Modern Royal",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-400/25",
    patternColor: "text-amber-400/10",
    doorType: "Geometric Reveal",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP", "Music", "Photo Gallery", "Custom Domain"],
  },
  {
    id: "dark-velvet",
    name: "Dark Velvet",
    theme: "Baraat",
    image: "/templates/dark-velvet.jpg",
    description: "Deep violet and velvet black with classic door opening and premium gold accents",
    category: "Wedding",
    bgClass: "bg-gradient-to-br from-violet-950 via-purple-900 to-violet-950",
    borderClass: "border-purple-300/30",
    badgeText: "Premium Royal",
    badgeClass: "bg-purple-500/15 text-purple-200 border-purple-400/25",
    patternColor: "text-purple-300/10",
    doorType: "Classic Doors",
    features: ["Door Animation", "Scratch Card", "Countdown", "Fireworks", "RSVP", "Music", "Photo Gallery", "Custom Domain", "Priority Support"],
  },
  {
    id: "golden-jubilee",
    name: "Golden Jubilee",
    theme: "Pure Gold & Ivory",
    category: "Birthday",
    description: "A lavish Ivory and 24K Pure Gold 3D door reveal with gold dust particle blast and VIP styling.",
    bgClass: "bg-gradient-to-br from-amber-950 via-yellow-900 to-stone-950",
    borderClass: "border-amber-300/40",
    badgeText: "VIP Birthday Royal",
    badgeClass: "bg-amber-400/20 text-amber-300 border-amber-400/30",
    patternColor: "text-amber-300/15",
    doorType: "24K Gold Double Doors",
    features: ["3D Gold Doors", "Gold Dust Explosion", "Photo Gallery", "Custom Audio", "VIP Guest RSVP"],
  },
  {
    id: "grand-gala",
    name: "The Grand Gala",
    theme: "Midnight Rose Gold",
    category: "School",
    description: "Cinematic starfield entrance with grand velvet ballroom doors for University Proms & Society Balls.",
    bgClass: "bg-gradient-to-br from-zinc-950 via-rose-950 to-purple-950",
    borderClass: "border-rose-300/40",
    badgeText: "Cinematic Gala",
    badgeClass: "bg-rose-400/20 text-rose-300 border-rose-400/30",
    patternColor: "text-rose-300/15",
    doorType: "Ballroom Double Doors",
    features: ["Ballroom Doors", "Starfield Glow", "Music Player", "Photo Wall", "Ticket Pass RSVP"],
  },
  {
    id: "valedictorian-prestige",
    name: "Valedictorian Prestige",
    theme: "Imperial Emerald",
    category: "School",
    description: "Regal emerald and gold scroll with official wax seal reveal for distinguished graduation ceremonies.",
    bgClass: "bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950",
    borderClass: "border-emerald-300/40",
    badgeText: "Graduation Royal",
    badgeClass: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30",
    patternColor: "text-emerald-300/15",
    doorType: "Imperial Crest Reveal",
    features: ["Imperial Crest", "Diploma Seal", "Live Countdown", "Custom Music", "Alumni RSVP"],
  },
  {
    id: "the-boardroom",
    name: "The Boardroom",
    theme: "Obsidian & Bronze",
    category: "Meeting",
    description: "Frosted acoustic glass sliding portal with metallic bronze hardware for ultra-high-end corporate galas.",
    bgClass: "bg-gradient-to-br from-stone-950 via-zinc-900 to-stone-950",
    borderClass: "border-amber-600/40",
    badgeText: "Executive Royal",
    badgeClass: "bg-amber-600/20 text-amber-300 border-amber-600/30",
    patternColor: "text-amber-500/15",
    doorType: "Frosted Glass Sliding Doors",
    features: ["Sliding Glass Portal", "Executive Agenda", "Calendar Sync", "Keynote Profiles", "RSVP"],
  },
  {
    id: "visionary-keynote",
    name: "Visionary Keynote",
    theme: "Eclipse Sapphire",
    category: "Meeting",
    description: "Cinematic dark spotlight beam doors with laser particle grid for revolutionary product launches.",
    bgClass: "bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950",
    borderClass: "border-blue-400/40",
    badgeText: "Keynote Royal",
    badgeClass: "bg-blue-400/20 text-blue-300 border-blue-400/30",
    patternColor: "text-blue-400/15",
    doorType: "Spotlight Beam Doors",
    features: ["Spotlight Reveal", "Laser Particle Grid", "Speaker Bios", "Livestream Embed", "VIP Passes"],
  },
];

/* ---------- Decorative Pattern ---------- */
function TemplatePattern({ colorClass, id }: { colorClass: string; id: string }) {
  return (
    <svg className={`absolute inset-0 w-full h-full ${colorClass}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={`tp-${id}`} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M30 15 L30 45 M15 30 L45 30" stroke="currentColor" strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#tp-${id})`} />
    </svg>
  );
}

/* ---------- Category Helper for Royal Card Overlays ---------- */
function getCategoryCardPreview(category?: string, templateId?: string) {
  switch (category) {
    case 'School':
      return {
        header: 'CONVOCATION',
        title: templateId === 'valedictorian-prestige' ? 'Class of 2026' : templateId === 'grand-gala' ? 'Commencement Gala' : 'Oxford Academy',
        isArabic: false
      };
    case 'Meeting':
      return {
        header: 'EXECUTIVE SUMMIT',
        title: templateId === 'visionary-keynote' ? 'Visionary Keynote' : templateId === 'the-boardroom' ? 'Leadership Summit' : 'Tech Global Expo',
        isArabic: false
      };
    case 'Birthday':
      return {
        header: 'CELEBRATION',
        title: templateId === 'golden-jubilee' ? "Kamran's 50th" : "Zara's 21st",
        isArabic: false
      };
    case 'Wedding':
    default:
      return {
        header: 'دعوة زفاف',
        title: 'Ahmed & Fatima',
        isArabic: true
      };
  }
}

/* ---------- Classic Miniature 3D Door Thumbnail ---------- */
function ClassicDoorThumbnail({ template }: { template: any }) {
  const isLight = template.isLight;

  const meta: Record<string, { 
    icon: string; 
    accent: string; 
    subtext: string; 
    headerLabel: string;
    sampleTitle: string;
    sealText?: string;
    leftText?: string; 
    rightText?: string;
    isArabicFont?: boolean;
  }> = {
    // Weddings
    'emerald-noir': { icon: '✦', accent: '#d4a853', subtext: 'Mehndi', headerLabel: 'دعوة زفاف', sampleTitle: 'Ahmed & Fatima', sealText: 'OPEN', leftText: 'بِسْمِ اللَّهِ', rightText: 'الرَّحْمَنِ الرَّحِيمِ', isArabicFont: true },
    'crimson-royale': { icon: '👑', accent: '#f87171', subtext: 'Baraat', headerLabel: 'دعوة زفاف', sampleTitle: 'Ahmed & Fatima', sealText: 'OPEN', leftText: 'نّ', rightText: 'و', isArabicFont: true },
    'majestic-love': { icon: '💫', accent: '#f59e0b', subtext: 'Baraat', headerLabel: 'دعوة زفاف', sampleTitle: 'Ahmed & Fatima', sealText: 'OPEN', leftText: 'ع', rightText: 'ش', isArabicFont: true },
    'garden-romance': { icon: '🌸', accent: '#ec4899', subtext: 'Walima', headerLabel: 'دعوة زفاف', sampleTitle: 'Zayd & Ayla', sealText: 'OPEN' },
    'modern-minimal': { icon: '▷', accent: '#60a5fa', subtext: 'Reception', headerLabel: 'دعوة زفاف', sampleTitle: 'Hamza & Sarah', sealText: 'OPEN' },
    'mughal-emerald': { icon: '✦', accent: '#2dd4bf', subtext: 'Nikkah', headerLabel: 'دعوة زفاف', sampleTitle: 'Ahmed & Fatima', sealText: 'OPEN', leftText: 'مغل', rightText: 'شاہی', isArabicFont: true },
    'rose-gold-blush': { icon: '🌹', accent: '#fb7185', subtext: 'Walima', headerLabel: 'دعوة زفاف', sampleTitle: 'Bilal & Hania', sealText: 'OPEN' },
    'ivory-dream': { icon: '◈', accent: '#d97706', subtext: 'Mayun', headerLabel: 'دعوة زفاف', sampleTitle: 'Saad & Maryam', sealText: 'OPEN' },
    'watercolor-peach': { icon: '🍑', accent: '#f97316', subtext: 'Mehndi', headerLabel: 'دعوة زفاف', sampleTitle: 'Zain & Anum', sealText: 'OPEN' },
    'pastel-floral': { icon: '🌸', accent: '#f472b6', subtext: 'Walima', headerLabel: 'دعوة زفاف', sampleTitle: 'Usman & Sana', sealText: 'OPEN' },
    'minimal-white': { icon: '💍', accent: '#64748b', subtext: 'Reception', headerLabel: 'دعوة زفاف', sampleTitle: 'Mustafa & Maham', sealText: 'OPEN' },
    
    // Birthdays
    'pastel-paradise': { icon: '🎂', accent: '#f472b6', subtext: 'Sweet 16', headerLabel: 'CELEBRATION', sampleTitle: "Sophia's Sweet 16", sealText: 'PARTY', leftText: 'Sweet', rightText: 'Sixteen' },
    'boho-chic': { icon: '✨', accent: '#d97706', subtext: 'Golden 25th', headerLabel: 'CELEBRATION', sampleTitle: "Maya's Golden 25th", sealText: 'WISH', leftText: 'Golden', rightText: 'Quarter' },
    'vintage-milestones': { icon: '👑', accent: '#fbbf24', subtext: 'Milestone 40th', headerLabel: 'CELEBRATION', sampleTitle: "Farhan's 40th Gala", sealText: 'CHEERS', leftText: 'Celebrate', rightText: 'Life' },
    'lumina-celebration': { icon: '✨', accent: '#ec4899', subtext: 'Birthday Gala', headerLabel: 'CELEBRATION', sampleTitle: "Zara's 21st Gala", sealText: 'PARTY', leftText: 'Happy', rightText: 'Birthday' },
    'golden-jubilee': { icon: '👑', accent: '#f59e0b', subtext: '50th Jubilee', headerLabel: 'GOLDEN JUBILEE', sampleTitle: "Kamran's 50th", sealText: 'VIP', leftText: 'Golden', rightText: 'Jubilee' },
    
    // School & Academics
    'academic-excellence': { icon: '🎓', accent: '#fbbf24', subtext: 'Commencement', headerLabel: 'CONVOCATION', sampleTitle: 'Class of 2026', sealText: 'ENTER', leftText: 'Class of', rightText: '2026' },
    'future-innovators': { icon: '⚡', accent: '#06b6d4', subtext: 'Science & Tech', headerLabel: 'TECH FEST', sampleTitle: 'Future Innovators', sealText: 'JOIN', leftText: 'Hack', rightText: 'Innovate' },
    'campus-memories': { icon: '🏛️', accent: '#dc2626', subtext: 'Alumni Reunion', headerLabel: 'ALUMNI REUNION', sampleTitle: 'Annual Homecoming', sealText: 'VISIT', leftText: 'Farewell', rightText: 'Reunion' },
    'grand-gala': { icon: '✨', accent: '#f43f5e', subtext: 'Annual Gala', headerLabel: 'COMMENCEMENT GALA', sampleTitle: 'University Prom 2026', sealText: 'ENTER', leftText: 'Grand', rightText: 'Gala' },
    'valedictorian-prestige': { icon: '📜', accent: '#10b981', subtext: 'Commencement', headerLabel: 'CONVOCATION', sampleTitle: 'Class of 2026', sealText: 'ENTER', leftText: 'Summa Cum', rightText: 'Laude' },
    
    // Corporate & Meetings
    'executive-summit': { icon: '💼', accent: '#38bdf8', subtext: 'Annual Summit', headerLabel: 'EXECUTIVE SUMMIT', sampleTitle: 'Global Tech Summit', sealText: 'ACCESS', leftText: 'Annual', rightText: 'Summit' },
    'creative-startup': { icon: '🚀', accent: '#f97316', subtext: 'Product Launch', headerLabel: 'PRODUCT LAUNCH', sampleTitle: 'Product Launch 2026', sealText: 'DEMO', leftText: 'NextGen', rightText: 'Launch' },
    'global-connect': { icon: '🌐', accent: '#10b981', subtext: 'Global Forum', headerLabel: 'GLOBAL FORUM', sampleTitle: 'World Business Forum', sealText: 'CONNECT', leftText: 'Global', rightText: 'Connect' },
    'the-boardroom': { icon: '🏢', accent: '#d97706', subtext: 'Board Meeting', headerLabel: 'EXECUTIVE SUMMIT', sampleTitle: 'Annual Board Meeting', sealText: 'ACCESS', leftText: 'Boardroom', rightText: 'Summit' },
    'visionary-keynote': { icon: '💡', accent: '#3b82f6', subtext: 'Keynote 2026', headerLabel: 'ANNUAL KEYNOTE', sampleTitle: 'Visionary Keynote 2026', sealText: 'ACCESS', leftText: 'Visionary', rightText: 'Keynote' },
  };

  const catNorm = (template.category || '').toLowerCase();
  const categoryDefault = (catNorm === 'school' || catNorm === 'academic')
    ? { icon: '🎓', accent: '#fbbf24', subtext: template.theme || 'Commencement', headerLabel: 'CONVOCATION', sampleTitle: 'Class of 2026', sealText: 'ENTER' }
    : (catNorm === 'meeting' || catNorm === 'corporate')
    ? { icon: '💼', accent: '#38bdf8', subtext: template.theme || 'Summit', headerLabel: 'EXECUTIVE SUMMIT', sampleTitle: 'Global Tech Summit', sealText: 'ACCESS' }
    : (catNorm === 'birthday')
    ? { icon: '🎂', accent: '#f472b6', subtext: template.theme || 'Birthday', headerLabel: 'CELEBRATION', sampleTitle: "Zara's 21st", sealText: 'PARTY' }
    : { icon: '✦', accent: '#d4a853', subtext: template.theme || 'Wedding', headerLabel: 'دعوة زفاف', sampleTitle: 'Ahmed & Fatima', sealText: 'OPEN', isArabicFont: true };

  const m = meta[template.id] || categoryDefault;

  return (
    <div className="relative w-full h-full p-3.5 flex flex-col justify-between overflow-hidden select-none">
      {/* Radial lighting spotlight */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: isLight 
            ? `radial-gradient(ellipse at 50% 10%, rgba(255,255,255,0.95) 0%, rgba(240,240,245,0.4) 60%, rgba(0,0,0,0.06) 100%)`
            : `radial-gradient(ellipse at 50% 15%, rgba(255,255,255,0.18) 0%, transparent 60%), radial-gradient(circle at 50% 50%, ${m.accent}20 0%, transparent 70%)`
        }} 
      />

      {/* Decorative SVG Pattern Background */}
      <TemplatePattern colorClass={template.patternColor} id={template.id} />

      {/* 2-Panel Door Inset Framing */}
      <div className="absolute inset-2.5 rounded-xl border border-white/10 pointer-events-none flex overflow-hidden shadow-inner">
        {/* Left Panel */}
        <div 
          className="flex-1 border-r border-white/15 h-full relative"
          style={{
            background: isLight ? 'rgba(255,255,255,0.35)' : 'linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.04) 100%)'
          }}
        >
          {m.leftText && (
            <span className={`absolute left-1 top-1/2 -translate-y-1/2 ${m.isArabicFont ? 'font-arabic text-xs' : 'font-sans font-bold text-[10px] tracking-widest uppercase'} text-white/40 rotate-[-90deg] origin-center block whitespace-nowrap`}>
              {m.leftText}
            </span>
          )}
        </div>
        {/* Right Panel */}
        <div 
          className="flex-1 border-l border-black/30 h-full relative"
          style={{
            background: isLight ? 'rgba(255,255,255,0.2)' : 'linear-gradient(270deg, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.04) 100%)'
          }}
        >
          {m.rightText && (
            <span className={`absolute right-1 top-1/2 -translate-y-1/2 ${m.isArabicFont ? 'font-arabic text-xs' : 'font-sans font-bold text-[10px] tracking-widest uppercase'} text-white/40 rotate-[90deg] origin-center block whitespace-nowrap`}>
              {m.rightText}
            </span>
          )}
        </div>
      </div>

      {/* Top Header: Bismillah / Calligraphy / Convocation Arch */}
      <div className="relative z-10 text-center pt-1">
        <div className="flex items-center justify-center gap-2 mb-1 opacity-80">
          <div className="w-7 h-px" style={{ background: `linear-gradient(90deg, transparent, ${m.accent})` }} />
          <svg width="10" height="10" viewBox="0 0 20 20" fill="none">
            <polygon points="10,1 12.5,7.5 19,7.5 14,11.5 16,18 10,14 4,18 6,11.5 1,7.5 7.5,7.5" stroke={m.accent} strokeWidth="1.5" fill="none" />
          </svg>
          <div className="w-7 h-px" style={{ background: `linear-gradient(270deg, transparent, ${m.accent})` }} />
        </div>
        <span 
          className={`${m.isArabicFont ? 'font-medium tracking-widest text-base sm:text-lg' : 'font-sans font-bold tracking-[0.2em] text-[11px] sm:text-xs uppercase'} block`}
          style={{ 
            color: isLight ? '#475569' : '#ffffff',
            textShadow: isLight ? 'none' : `0 0 15px ${m.accent}66`
          }}
        >
          {m.headerLabel}
        </span>
      </div>

      {/* Center 3D Wax Seal / Door Knocker */}
      <div className="relative z-20 flex flex-col items-center justify-center my-auto">
        <div className="text-center mb-1 px-2">
          <p 
            className="font-display text-sm sm:text-base font-bold tracking-wider truncate max-w-[180px]"
            style={{ 
              color: isLight ? '#0f172a' : '#ffffff',
              textShadow: isLight ? 'none' : '0 2px 8px rgba(0,0,0,0.8)'
            }}
          >
            {m.sampleTitle}
          </p>
        </div>

        {/* Central 3D Embossed Emblem / Seal */}
        <div className="relative my-1">
          <div 
            className="w-11 h-11 rounded-full flex flex-col items-center justify-center shadow-2xl border"
            style={{
              background: isLight 
                ? `radial-gradient(circle at 35% 30%, #ffffff 0%, #e2e8f0 100%)`
                : `radial-gradient(circle at 35% 30%, ${m.accent}55 0%, #000000 90%)`,
              borderColor: `${m.accent}99`,
              boxShadow: `0 4px 15px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.3)`
            }}
          >
            <span 
              className="text-base font-bold leading-none select-none"
              style={{ color: m.accent }}
            >
              {m.icon}
            </span>
            <span 
              className="text-[7px] uppercase tracking-[0.2em] font-semibold mt-0.5"
              style={{ color: isLight ? '#64748b' : `${m.accent}ee` }}
            >
              {m.sealText || 'OPEN'}
            </span>
          </div>

          {/* Golden Seam line passing through */}
          <div 
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3"
            style={{ background: `linear-gradient(to top, ${m.accent}, transparent)` }}
          />
          <div 
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0.5 h-3"
            style={{ background: `linear-gradient(to bottom, ${m.accent}, transparent)` }}
          />
        </div>
      </div>

      {/* Bottom Door Details & Badge */}
      <div className="relative z-10 flex items-center justify-between px-2 pb-0.5">
        <span 
          className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border backdrop-blur-sm"
          style={{
            color: isLight ? '#334155' : m.accent,
            borderColor: `${m.accent}44`,
            backgroundColor: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'
          }}
        >
          {m.subtext}
        </span>
        <div className="flex items-center gap-1">
          <Star className="w-2.5 h-2.5" style={{ color: m.accent }} />
          <span 
            className="text-[9px] uppercase tracking-wider font-medium opacity-80"
            style={{ color: isLight ? '#64748b' : '#ffffff' }}
          >
            {template.doorType}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Template Card ---------- */
function TemplateCard({
  template,
  onSelect,
  onPreview,
  isRoyal = false,
}: {
  template: any; // Using any to avoid type errors with isLight since classic/royal arrays have different types now
  onSelect: (id: string, plan: "classic" | "royal", category?: string) => void;
  onPreview: (id: string) => void;
  isRoyal?: boolean;
}) {
  const [liked, setLiked] = useState(false);

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="group flex flex-col relative rounded-2xl overflow-hidden border border-border/50 hover:border-gold/40 transition-all duration-500 hover:shadow-xl hover:shadow-gold/10 hover:-translate-y-1 bg-card"
    >
      <div className={`relative shrink-0 ${template.bgClass} h-56 sm:h-64 overflow-hidden flex flex-col items-center justify-center`}>
        {template.image ? (
          <>
            <Image
              src={template.image}
              alt={template.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25" />
            
            {/* Elegant glass overlay card over the picture */}
            <div className="relative z-10 w-full px-5 flex flex-col items-center justify-center text-center">
              <div className="bg-black/55 backdrop-blur-md rounded-xl p-3.5 border border-gold/30 shadow-xl max-w-[210px] w-full">
                {(() => {
                  const preview = getCategoryCardPreview(template.category, template.id);
                  return (
                    <>
                      <span className={`tracking-widest uppercase text-amber-300 block ${preview.isArabic ? 'font-medium text-base sm:text-lg' : 'font-sans font-bold text-xs tracking-[0.2em]'}`}>
                        {preview.header}
                      </span>
                      <p className="font-display text-white text-sm sm:text-base font-semibold tracking-wide mt-0.5 truncate">
                        {preview.title}
                      </p>
                    </>
                  );
                })()}
                <div className="w-10 h-px bg-gold/50 mx-auto my-1.5" />
                <div className="flex items-center justify-center gap-1.5">
                  <Star className="w-3 h-3 text-amber-300" />
                  <span className="text-[10px] uppercase tracking-wider text-white/90 font-medium">{template.doorType}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <ClassicDoorThumbnail template={template} />
        )}

        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-1 right-1 z-30 w-12 h-12 flex items-center justify-center focus:outline-none"
          aria-label="Add template to favorites"
        >
          <div className={`w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors`}>
            <Heart className={`w-4 h-4 transition-colors ${liked ? "text-red-400 fill-red-400" : "text-white/60"}`} />
          </div>
        </button>

        {isRoyal && (
          <div className="absolute top-3 left-3 z-30">
            <Badge className="bg-gold/20 text-gold border-gold/30 backdrop-blur-sm text-[10px]">
              <Crown className="w-2.5 h-2.5 mr-1" /> Royal
            </Badge>
          </div>
        )}
      </div>

      <div className="bg-card p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between mb-2 gap-2">
            <h3 className="font-display text-base font-semibold text-foreground">{template.name}</h3>
            <Badge className={`${template.badgeClass} text-[10px] px-1.5 py-0 whitespace-nowrap shrink-0`}>{template.badgeText}</Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{template.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {template.features.slice(0, 4).map((feature: string) => (
              <span key={feature} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{feature}</span>
            ))}
            {template.features.length > 4 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{template.features.length - 4}</span>
            )}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => onPreview(template.id)} className="w-full border-gold text-gold hover:bg-gold/10 font-medium">
            <Eye className="h-4 w-4 mr-1.5 shrink-0" /> Demo
          </Button>
          <Button size="sm" onClick={() => onSelect(template.id, isRoyal ? "royal" : "classic", template.category)} className="w-full bg-gold hover:bg-gold-light text-slate-950 font-black border-none shadow-md">
            <Check className="h-4 w-4 mr-1.5 shrink-0 text-slate-950 stroke-[2.5]" /> Select
          </Button>
        </div>
      </div>
    </m.div>
  );
}

/* ---------- Main Templates Page ---------- */
interface TemplatesPageProps {
  selectedCategory?: string;
  selectedPlan: "classic" | "royal";
  onBack: () => void;
  onPreview: (id: string) => void;
  onSelectTemplate: (id: string, plan: "classic" | "royal", category?: string) => void;
  crumbs?: { label: string; href?: string; onClick?: () => void }[];
}

export function TemplatesPage({ selectedCategory,
  selectedPlan,
  onBack,
  onPreview,
  onSelectTemplate,
  crumbs,
}: TemplatesPageProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(selectedCategory || "All");
  const [activeTab, setActiveTab] = useState<string>(selectedPlan === "royal" ? "royal" : "classic");

  const filterTemplates = (templates: typeof classicTemplates) => {
    return templates.filter((t) => {
      // Filter by category
      const matchesCategory = !categoryFilter || categoryFilter === "All" || t.category?.toLowerCase() === categoryFilter.toLowerCase();
      // Filter by search
      const matchesSearch = search === "" || 
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.theme.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
        
      return matchesCategory && matchesSearch;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={onBack} className="gap-2 text-foreground/70 hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{selectedCategory ? "Back to Categories" : "Back to Home"}</span>
            </Button>
            <h1 className="font-display text-lg sm:text-xl font-bold text-foreground">
              {(categoryFilter && categoryFilter !== "All") ? (categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)) : "All"} <span className="gold-shimmer">Templates</span>
            </h1>
            <div className="hidden sm:block w-24" />
          </div>
        </div>
      </header>

      {/* Breadcrumb path */}
      <PageBreadcrumb crumbs={crumbs || [{ label: "Home", href: "/" }, { label: "Choose Your Template" }]} />

      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Collection notice */}
          <div className="mb-6 text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-emerald" />
              One Payment • Access All Templates In Your Collection
            </p>
          </div>

          {/* Interactive Category Filter Pills with Corner Scroll Arrows */}
          <div className="max-w-3xl mx-auto mb-6 px-3">
            <ScrollableMenu
              variant="gold"
              scrollDistance={180}
              className="w-full"
              contentClassName="justify-start sm:justify-center gap-2 py-1 px-1"
            >
              {[
                { id: 'All', label: 'All Templates', icon: Sparkles },
                { id: 'Wedding', label: 'Weddings', icon: Heart },
                { id: 'Birthday', label: 'Birthdays', icon: Cake },
                { id: 'School', label: 'School & College', icon: GraduationCap },
                { id: 'Meeting', label: 'Corporate & Meetings', icon: Briefcase },
              ].map((cat) => {
                const Icon = cat.icon;
                const isActive = (categoryFilter?.toLowerCase() || 'all') === cat.id.toLowerCase();
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-gold text-slate-950 font-black shadow-md shadow-gold/20 scale-105 ring-1 ring-gold/50'
                        : 'bg-card/70 hover:bg-card text-slate-200 hover:text-white font-medium border border-border/60 hover:border-gold/30'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-slate-950 stroke-[2.5]" : "text-slate-300"}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </ScrollableMenu>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input aria-label="Search templates" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..." className="pl-10 bg-muted/50 border-border/50 focus:border-gold/40" />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Tabs: Classics / Royal */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-8 max-w-lg mx-auto">
              <ScrollableTabsList variant="gold" className="bg-muted/50 border border-border/50 p-1 h-auto">
                <TabsTrigger
                  value="classic"
                  className="data-[state=active]:bg-emerald data-[state=active]:text-white data-[state=active]:shadow-sm px-6 py-2.5 text-sm font-bold gap-1.5 [&[data-state=active]_svg]:text-white [&[data-state=active]_svg]:stroke-[2.5]"
                >
                  <Gem className="w-4 h-4" />
                  Smart Invites Classics
                </TabsTrigger>
                <TabsTrigger
                  value="royal"
                  className="data-[state=active]:bg-gold data-[state=active]:text-slate-950 data-[state=active]:font-black data-[state=active]:shadow-sm px-6 py-2.5 text-sm gap-1.5 [&[data-state=active]_svg]:text-slate-950 [&[data-state=active]_svg]:stroke-[2.5]"
                >
                  <Crown className="w-4 h-4" />
                  Smart Invites Royal
                </TabsTrigger>
              </ScrollableTabsList>
            </div>

            {/* Classic Templates */}
            <TabsContent value="classic">
              <div className="text-center mb-6">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  Smart Invites Classic Invitations
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {filterTemplates(classicTemplates).length} premium designs included with Classic plan
                </p>
              </div>
              <m.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {filterTemplates(classicTemplates).map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={onSelectTemplate}
                      onPreview={(id) => onPreview(id)}
                    />
                  ))}
                </AnimatePresence>
              </m.div>
              {filterTemplates(classicTemplates).length === 0 && (
                <EmptyState onClear={() => setSearch("")} />
              )}
            </TabsContent>

            {/* Royal Templates */}
            <TabsContent value="royal">
              <div className="text-center mb-6">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  Smart Invites Royal Invitations
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {filterTemplates(royalTemplates).length} cinematic designs with premium animations
                </p>
              </div>
              <m.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {filterTemplates(royalTemplates).map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={onSelectTemplate}
                      onPreview={(id) => onPreview(id)}
                      isRoyal
                    />
                  ))}
                </AnimatePresence>
              </m.div>
              {filterTemplates(royalTemplates).length === 0 && (
                <EmptyState onClear={() => setSearch("")} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

/* ---------- Empty State ---------- */
function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
      <Sparkles className="w-12 h-12 text-gold/30 mx-auto mb-4" />
      <h3 className="font-display text-xl font-semibold text-foreground mb-2">No templates found</h3>
      <p className="text-muted-foreground text-sm">Try adjusting your search terms.</p>
      <Button variant="outline" className="mt-4 border-gold/30 text-gold hover:bg-gold/10" onClick={onClear}>Clear Search</Button>
    </m.div>
  );
}
