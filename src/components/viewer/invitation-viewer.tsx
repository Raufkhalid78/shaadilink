'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  MapPin,
  Calendar,
  Clock,
  ChevronDown,
  Heart,
  Sparkles,
  Send,
  Check,
  X,
  Star,
  Music,
  Music2,
  User,
  MessageCircle,
  Loader2,
} from 'lucide-react'
import type { FlowData } from '@/lib/flow-types'

/* ─── Template Theme Configuration ─── */
export interface TemplateTheme {
  id: string
  name: string
  // Background colors
  bgPrimary: string
  bgSecondary: string
  bgDoor: string
  bgDoorGradient: string
  // Accent / gold colors
  accent: string
  accentLight: string
  accentDark: string
  accentRgb: string // for rgba usage
  // Text colors
  textPrimary: string
  textSecondary: string
  textMuted: string
  // Border / ornamental
  borderAccent: string
  borderSubtle: string
  // Scratch card
  scratchBg: string[]
  scratchAccent: string
  // Firework colors
  fireworkColors: string[]
  // Confetti colors
  confettiColors: string[]
  // Door style configuration
  doorStyle: {
    type: 'classic-doors' | 'curtains' | 'petals' | 'split-screen' | 'archway' | 'scroll' | 'geometric' | 'lotus' | 'lantern' | 'dome'
    doorMaterial: 'wood' | 'lacquer' | 'glass' | 'stone' | 'painted'
    panelLayout: '2-panel' | '4-panel' | 'arched-panel' | 'glass-grid' | 'flat' | 'carved' | 'studded'
    handleType: 'ring-knocker' | 'lever' | 'pull' | 'iron-ring' | 'crystal' | 'none'
    frameStyle: 'ornate' | 'simple' | 'arched-stone' | 'painted-rosettes' | 'modern'
    leftText: string
    rightText: string
    leftTextLang: 'ar' | 'en' | 'ur'
    rightTextLang: 'ar' | 'en' | 'ur'
    svgPattern: 'arch' | 'geometric' | 'floral' | 'minimal' | 'mandala' | 'paisley' | 'diamond' | 'star' | 'lantern' | 'dome'
    centerIcon: string
    animationClass: string
    buttonStyle: 'circle' | 'diamond' | 'shield' | 'hexagon' | 'star'
  }
}

const TEMPLATE_THEMES: Record<string, TemplateTheme> = {
  'emerald-noir': {
    id: 'emerald-noir',
    name: 'Emerald Noir',
    bgPrimary: '#0f1a16',
    bgSecondary: '#0a1210',
    bgDoor: '#152822',
    bgDoorGradient: 'linear-gradient(135deg, #152822 0%, #1f332c 50%, #141f1b 100%)',
    accent: '#d4a853',
    accentLight: '#e8c66a',
    accentDark: '#b4914d',
    accentRgb: '180,145,77',
    textPrimary: '#e0ccaa',
    textSecondary: '#c9a96e',
    textMuted: '#8f7c56',
    borderAccent: 'rgba(180,145,77,0.4)',
    borderSubtle: 'rgba(180,145,77,0.15)',
    scratchBg: ['#1a332a', '#0f2920', '#1a3530'],
    scratchAccent: '#d4a853',
    fireworkColors: ['#b4914d', '#d4a853', '#e8c66a', '#8b6d2f', '#fff4d0', '#f0d78c', '#ffd700'],
    confettiColors: ['#b4914d', '#d4a853', '#e8c66a', '#22c55e', '#f0d78c', '#fff4d0', '#e8a4b8'],
    doorStyle: {
      type: 'classic-doors',
      doorMaterial: 'wood',
      panelLayout: 'carved',
      handleType: 'ring-knocker',
      frameStyle: 'ornate',
      leftText: 'بِسْمِ اللَّهِ',
      rightText: 'الرَّحْمَنِ الرَّحِيمِ',
      leftTextLang: 'ar',
      rightTextLang: 'ar',
      svgPattern: 'arch',
      centerIcon: '✦',
      animationClass: 'door-open',
      buttonStyle: 'circle',
    },
  },
  'crimson-royale': {
    id: 'crimson-royale',
    name: 'Crimson Royale',
    bgPrimary: '#1a0a0e',
    bgSecondary: '#120810',
    bgDoor: '#2a1018',
    bgDoorGradient: 'linear-gradient(135deg, #2a1018 0%, #3d1525 50%, #1f0e16 100%)',
    accent: '#dc2626',
    accentLight: '#f87171',
    accentDark: '#991b1b',
    accentRgb: '220,38,38',
    textPrimary: '#f5c6c6',
    textSecondary: '#d4a0a0',
    textMuted: '#8b5e5e',
    borderAccent: 'rgba(220,38,38,0.4)',
    borderSubtle: 'rgba(220,38,38,0.15)',
    scratchBg: ['#2a1018', '#1f0e16', '#3d1525'],
    scratchAccent: '#dc2626',
    fireworkColors: ['#dc2626', '#f87171', '#ef4444', '#b91c1c', '#d4a853', '#ffd700', '#fca5a5'],
    confettiColors: ['#dc2626', '#f87171', '#d4a853', '#ffd700', '#ef4444', '#fca5a5', '#e8c66a'],
    doorStyle: {
      type: 'classic-doors',
      doorMaterial: 'lacquer',
      panelLayout: '2-panel',
      handleType: 'ring-knocker',
      frameStyle: 'ornate',
      leftText: 'نّ',
      rightText: 'و',
      leftTextLang: 'ar',
      rightTextLang: 'ar',
      svgPattern: 'floral',
      centerIcon: '👑',
      animationClass: 'door-open',
      buttonStyle: 'shield',
    },
  },
  'majestic-love': {
    id: 'majestic-love',
    name: 'Majestic Love',
    bgPrimary: '#1a1408',
    bgSecondary: '#12100a',
    bgDoor: '#2a2010',
    bgDoorGradient: 'linear-gradient(135deg, #2a2010 0%, #3d3018 50%, #1f1a0e 100%)',
    accent: '#f59e0b',
    accentLight: '#fbbf24',
    accentDark: '#d97706',
    accentRgb: '245,158,11',
    textPrimary: '#f5e6c8',
    textSecondary: '#d4b88a',
    textMuted: '#8b7650',
    borderAccent: 'rgba(245,158,11,0.4)',
    borderSubtle: 'rgba(245,158,11,0.15)',
    scratchBg: ['#2a2010', '#1f1a0e', '#3d3018'],
    scratchAccent: '#f59e0b',
    fireworkColors: ['#f59e0b', '#fbbf24', '#d97706', '#92400e', '#fff4d0', '#fde68a', '#ffd700'],
    confettiColors: ['#f59e0b', '#fbbf24', '#d97706', '#ffd700', '#fde68a', '#fff4d0', '#e8a4b8'],
    doorStyle: {
      type: 'classic-doors',
      doorMaterial: 'wood',
      panelLayout: '2-panel',
      handleType: 'lever',
      frameStyle: 'simple',
      leftText: 'ع',
      rightText: 'ش',
      leftTextLang: 'ar',
      rightTextLang: 'ar',
      svgPattern: 'paisley',
      centerIcon: '💫',
      animationClass: 'door-open',
      buttonStyle: 'diamond',
    },
  },
  'garden-romance': {
    id: 'garden-romance',
    name: 'Garden Romance',
    bgPrimary: '#1a0a14',
    bgSecondary: '#120810',
    bgDoor: '#2a1020',
    bgDoorGradient: 'linear-gradient(135deg, #2a1020 0%, #3d1830 50%, #1f0e18 100%)',
    accent: '#ec4899',
    accentLight: '#f472b6',
    accentDark: '#be185d',
    accentRgb: '236,72,153',
    textPrimary: '#f5c6e0',
    textSecondary: '#d4a0c0',
    textMuted: '#8b5e78',
    borderAccent: 'rgba(236,72,153,0.4)',
    borderSubtle: 'rgba(236,72,153,0.15)',
    scratchBg: ['#2a1020', '#1f0e18', '#3d1830'],
    scratchAccent: '#ec4899',
    fireworkColors: ['#ec4899', '#f472b6', '#db2777', '#9d174d', '#ffd700', '#fbbf24', '#fca5a5'],
    confettiColors: ['#ec4899', '#f472b6', '#db2777', '#ffd700', '#fbbf24', '#fca5a5', '#e8c66a'],
    doorStyle: {
      type: 'classic-doors',
      doorMaterial: 'painted',
      panelLayout: 'glass-grid',
      handleType: 'crystal',
      frameStyle: 'painted-rosettes',
      leftText: 'Garden',
      rightText: 'Romance',
      leftTextLang: 'en',
      rightTextLang: 'en',
      svgPattern: 'floral',
      centerIcon: '🌸',
      animationClass: 'door-open',
      buttonStyle: 'circle',
    },
  },
  'modern-minimal': {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    bgPrimary: '#0a0e1a',
    bgSecondary: '#080c14',
    bgDoor: '#101828',
    bgDoorGradient: 'linear-gradient(135deg, #101828 0%, #182038 50%, #0e1420 100%)',
    accent: '#60a5fa',
    accentLight: '#93c5fd',
    accentDark: '#3b82f6',
    accentRgb: '96,165,250',
    textPrimary: '#c8daf5',
    textSecondary: '#a0b8d4',
    textMuted: '#5e788b',
    borderAccent: 'rgba(96,165,250,0.4)',
    borderSubtle: 'rgba(96,165,250,0.15)',
    scratchBg: ['#101828', '#0e1420', '#182038'],
    scratchAccent: '#60a5fa',
    fireworkColors: ['#60a5fa', '#93c5fd', '#3b82f6', '#1d4ed8', '#ffd700', '#d4a853', '#dbeafe'],
    confettiColors: ['#60a5fa', '#93c5fd', '#3b82f6', '#ffd700', '#d4a853', '#dbeafe', '#e8c66a'],
    doorStyle: {
      type: 'classic-doors',
      doorMaterial: 'glass',
      panelLayout: 'flat',
      handleType: 'none',
      frameStyle: 'modern',
      leftText: 'Save',
      rightText: 'Date',
      leftTextLang: 'en',
      rightTextLang: 'en',
      svgPattern: 'minimal',
      centerIcon: '▷',
      animationClass: 'door-open',
      buttonStyle: 'hexagon',
    },
  },
  'mughal-emerald': {
    id: 'mughal-emerald',
    name: 'Mughal Emerald',
    bgPrimary: '#0a1a18',
    bgSecondary: '#081412',
    bgDoor: '#102a25',
    bgDoorGradient: 'linear-gradient(135deg, #102a25 0%, #183d35 50%, #0e2018 100%)',
    accent: '#2dd4bf',
    accentLight: '#5eead4',
    accentDark: '#14b8a6',
    accentRgb: '45,212,191',
    textPrimary: '#c8f5ef',
    textSecondary: '#a0d4c8',
    textMuted: '#5e8b80',
    borderAccent: 'rgba(45,212,191,0.4)',
    borderSubtle: 'rgba(45,212,191,0.15)',
    scratchBg: ['#102a25', '#0e2018', '#183d35'],
    scratchAccent: '#2dd4bf',
    fireworkColors: ['#2dd4bf', '#5eead4', '#14b8a6', '#0d9488', '#ffd700', '#d4a853', '#a7f3d0'],
    confettiColors: ['#2dd4bf', '#5eead4', '#14b8a6', '#ffd700', '#d4a853', '#a7f3d0', '#e8c66a'],
    doorStyle: {
      type: 'classic-doors',
      doorMaterial: 'stone',
      panelLayout: 'carved',
      handleType: 'iron-ring',
      frameStyle: 'arched-stone',
      leftText: 'مغل',
      rightText: 'شاهی',
      leftTextLang: 'ur',
      rightTextLang: 'ur',
      svgPattern: 'mandala',
      centerIcon: '🕌',
      animationClass: 'door-open',
      buttonStyle: 'circle',
    },
  },
  'rose-gold-blush': {
    id: 'rose-gold-blush',
    name: 'Rose Gold Blush',
    bgPrimary: '#1a0a12',
    bgSecondary: '#12080e',
    bgDoor: '#2a1018',
    bgDoorGradient: 'linear-gradient(135deg, #2a1018 0%, #3d1828 50%, #1f0e16 100%)',
    accent: '#fb7185',
    accentLight: '#fda4af',
    accentDark: '#e11d48',
    accentRgb: '251,113,133',
    textPrimary: '#f5c6d0',
    textSecondary: '#d4a0b0',
    textMuted: '#8b5e6e',
    borderAccent: 'rgba(251,113,133,0.4)',
    borderSubtle: 'rgba(251,113,133,0.15)',
    scratchBg: ['#2a1018', '#1f0e16', '#3d1828'],
    scratchAccent: '#fb7185',
    fireworkColors: ['#fb7185', '#fda4af', '#e11d48', '#be123c', '#ffd700', '#d4a853', '#fecdd3'],
    confettiColors: ['#fb7185', '#fda4af', '#e11d48', '#ffd700', '#d4a853', '#fecdd3', '#e8c66a'],
    doorStyle: {
      type: 'classic-doors',
      doorMaterial: 'painted',
      panelLayout: '4-panel',
      handleType: 'crystal',
      frameStyle: 'painted-rosettes',
      leftText: 'Rose',
      rightText: 'Gold',
      leftTextLang: 'en',
      rightTextLang: 'en',
      svgPattern: 'floral',
      centerIcon: '🌹',
      animationClass: 'door-open',
      buttonStyle: 'diamond',
    },
  },
  'ivory-dream': {
    id: 'ivory-dream',
    name: 'Ivory Dream',
    bgPrimary: '#1a1610',
    bgSecondary: '#12100c',
    bgDoor: '#2a2418',
    bgDoorGradient: 'linear-gradient(135deg, #2a2418 0%, #3d3528 50%, #1f1a10 100%)',
    accent: '#a8a29e',
    accentLight: '#d6d3d1',
    accentDark: '#78716c',
    accentRgb: '168,162,158',
    textPrimary: '#e7e5e4',
    textSecondary: '#c8c4c0',
    textMuted: '#78716c',
    borderAccent: 'rgba(168,162,158,0.4)',
    borderSubtle: 'rgba(168,162,158,0.15)',
    scratchBg: ['#2a2418', '#1f1a10', '#3d3528'],
    scratchAccent: '#a8a29e',
    fireworkColors: ['#a8a29e', '#d6d3d1', '#78716c', '#57534e', '#ffd700', '#d4a853', '#e7e5e4'],
    confettiColors: ['#a8a29e', '#d6d3d1', '#78716c', '#ffd700', '#d4a853', '#e7e5e4', '#e8c66a'],
    doorStyle: {
      type: 'classic-doors',
      doorMaterial: 'painted',
      panelLayout: '4-panel',
      handleType: 'lever',
      frameStyle: 'ornate',
      leftText: 'Ivory',
      rightText: 'Dream',
      leftTextLang: 'en',
      rightTextLang: 'en',
      svgPattern: 'diamond',
      centerIcon: '◈',
      animationClass: 'door-open',
      buttonStyle: 'diamond',
    },
  },
  'royal-imperial': {
    id: 'royal-imperial',
    name: 'Royal Imperial',
    bgPrimary: '#1a100a',
    bgSecondary: '#120c08',
    bgDoor: '#2a1a10',
    bgDoorGradient: 'linear-gradient(135deg, #2a1a10 0%, #3d2818 50%, #1f140e 100%)',
    accent: '#f59e0b',
    accentLight: '#fbbf24',
    accentDark: '#d97706',
    accentRgb: '245,158,11',
    textPrimary: '#f5e6c8',
    textSecondary: '#d4b88a',
    textMuted: '#8b7650',
    borderAccent: 'rgba(245,158,11,0.5)',
    borderSubtle: 'rgba(245,158,11,0.2)',
    scratchBg: ['#2a1a10', '#1f140e', '#3d2818'],
    scratchAccent: '#f59e0b',
    fireworkColors: ['#f59e0b', '#fbbf24', '#d97706', '#92400e', '#ffd700', '#fff4d0', '#fde68a', '#e8c66a'],
    confettiColors: ['#f59e0b', '#fbbf24', '#d97706', '#ffd700', '#fde68a', '#fff4d0', '#e8a4b8', '#ec4899'],
    doorStyle: {
      type: 'classic-doors',
      doorMaterial: 'wood',
      panelLayout: 'studded',
      handleType: 'iron-ring',
      frameStyle: 'ornate',
      leftText: 'سلطنت',
      rightText: 'شاهی',
      leftTextLang: 'ur',
      rightTextLang: 'ur',
      svgPattern: 'dome',
      centerIcon: '🏰',
      animationClass: 'door-open',
      buttonStyle: 'shield',
    },
  },
  'royal-elegance': {
    id: 'royal-elegance',
    name: 'Royal Elegance',
    bgPrimary: '#1a080e',
    bgSecondary: '#12060a',
    bgDoor: '#2a1018',
    bgDoorGradient: 'linear-gradient(135deg, #2a1018 0%, #3d1525 50%, #1f0e16 100%)',
    accent: '#f43f5e',
    accentLight: '#fb7185',
    accentDark: '#e11d48',
    accentRgb: '244,63,94',
    textPrimary: '#f5c6d0',
    textSecondary: '#d4a0b0',
    textMuted: '#8b5e6e',
    borderAccent: 'rgba(244,63,94,0.5)',
    borderSubtle: 'rgba(244,63,94,0.2)',
    scratchBg: ['#2a1018', '#1f0e16', '#3d1525'],
    scratchAccent: '#f43f5e',
    fireworkColors: ['#f43f5e', '#fb7185', '#e11d48', '#be123c', '#ffd700', '#d4a853', '#fecdd3', '#e8c66a'],
    confettiColors: ['#f43f5e', '#fb7185', '#e11d48', '#ffd700', '#d4a853', '#fecdd3', '#e8c66a', '#fbbf24'],
    doorStyle: {
      type: 'classic-doors',
      doorMaterial: 'wood',
      panelLayout: 'carved',
      handleType: 'ring-knocker',
      frameStyle: 'ornate',
      leftText: 'Royal',
      rightText: 'Elegance',
      leftTextLang: 'en',
      rightTextLang: 'en',
      svgPattern: 'star',
      centerIcon: '⭐',
      animationClass: 'door-open',
      buttonStyle: 'star',
    },
  },
}

const DEFAULT_THEME = TEMPLATE_THEMES['emerald-noir']

export function getTheme(templateId?: string | null): TemplateTheme {
  if (!templateId) return DEFAULT_THEME
  return TEMPLATE_THEMES[templateId] || DEFAULT_THEME
}

/* ─── InvitationViewer Props ─── */
interface InvitationViewerProps {
  templateId?: string
  flowData?: FlowData
}

/* ─── Corner Ornament SVG (Zareqia-style) ─── */
function CornerOrnament({ position, accentColor }: { position: 'tl' | 'tr' | 'bl' | 'br'; accentColor?: string }) {
  const color = accentColor || 'hsl(40, 50%, 55%)'
  const transforms: Record<string, string> = {
    tl: '',
    tr: '-scale-x-100',
    bl: '-scale-y-100',
    br: '-scale-x-100 -scale-y-100',
  }
  const classes: Record<string, string> = {
    tl: 'top-4 left-4',
    tr: 'top-4 right-4',
    bl: 'bottom-4 left-4',
    br: 'bottom-4 right-4',
  }
  return (
    <svg
      className={`absolute ${classes[position]} w-16 h-16 sm:w-20 sm:h-20 opacity-25 z-10 ${transforms[position]}`}
      viewBox="0 0 80 80"
      fill="none"
    >
      <path d="M5 5 L5 30 Q5 50 25 60 L50 70" stroke={color} strokeWidth="0.8" fill="none" />
      <path d="M8 5 L8 25 Q8 40 20 48" stroke={color} strokeWidth="0.5" fill="none" opacity="0.5" />
      <circle cx="5" cy="5" r="2" fill={color} opacity="0.4" />
    </svg>
  )
}

/* ─── Decorative Divider ─── */
function GoldDivider({ className = '', accentColor }: { className?: string; accentColor?: string }) {
  const color = accentColor || 'var(--gold)'
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${color}80, transparent)` }} />
      <div className="w-2.5 h-2.5 rotate-45" style={{ border: `1px solid ${color}b3` }} />
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${color}80, transparent)` }} />
    </div>
  )
}

function HeartDivider({ accentColor }: { accentColor?: string }) {
  const color = accentColor || 'var(--gold)'
  return (
    <div className="flex items-center justify-center gap-3 my-6">
      <div className="w-16 h-px" style={{ backgroundColor: `${color}4d` }} />
      <Heart className="w-3 h-3" style={{ color, fill: `${color}33` }} />
      <div className="w-16 h-px" style={{ backgroundColor: `${color}4d` }} />
    </div>
  )
}

/* ─── Wave SVG Divider ─── */
function WaveDivider({ accentColor }: { accentColor?: string }) {
  const color = accentColor || 'var(--gold)'
  return (
    <div className="w-full py-4 flex items-center justify-center overflow-hidden">
      <svg width="100%" height="30" viewBox="0 0 800 30" preserveAspectRatio="none" fill="none">
        <path d="M0 15 Q50 0 100 15 Q150 30 200 15 Q250 0 300 15 Q350 30 400 15 Q450 0 500 15 Q550 30 600 15 Q650 0 700 15 Q750 30 800 15" stroke={color} strokeWidth="0.8" opacity="0.25" />
        <path d="M0 15 Q50 10 100 15 Q150 20 200 15 Q250 10 300 15 Q350 20 400 15 Q450 10 500 15 Q550 20 600 15 Q650 10 700 15 Q750 20 800 15" stroke={color} strokeWidth="0.5" opacity="0.15" />
      </svg>
    </div>
  )
}

/* ─── Scroll Reveal Section Wrapper ─── */
function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.9, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Background Floating Particles ─── */
function BackgroundParticles({ accentColor }: { accentColor?: string }) {
  const color = accentColor || '#d4a853'
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {Array.from({ length: 18 }).map((_, i) => {
        const left = Math.random() * 100
        const size = 1 + Math.random() * 2
        const duration = 15 + Math.random() * 25
        const delay = Math.random() * 20
        const opacity = 0.06 + Math.random() * 0.12
        const drift = (Math.random() - 0.5) * 50
        return (
          <div
            key={i}
            className="absolute rounded-full bg-particle"
            style={{
              backgroundColor: color,
              left: `${left}%`,
              bottom: '-10px',
              width: `${size}px`,
              height: `${size}px`,
              '--particle-opacity': opacity,
              '--particle-duration': `${duration}s`,
              '--particle-delay': `${delay}s`,
              '--particle-drift': `${drift}px`,
            } as React.CSSProperties}
          />
        )
      })}
    </div>
  )
}

/* ─── Fireworks Component ─── */
function FireworksDisplay({ show, colors: propColors }: { show: boolean; colors?: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    if (!show || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    interface FParticle { x: number; y: number; color: string; size: number; angle: number; speed: number; decay: number; trail: number[] }
    const particles: FParticle[] = []
    const colors = propColors || ['#b4914d', '#d4a853', '#e8c66a', '#8b6d2f', '#fff4d0', '#f0d78c', '#ffd700', '#ffe4b5', '#f5deb3']

    function createBurst(x: number, y: number) {
      const count = 60 + Math.floor(Math.random() * 30)
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4
        particles.push({
          x, y,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 1.5 + Math.random() * 3,
          angle,
          speed: 2 + Math.random() * 6,
          decay: 0.007 + Math.random() * 0.012,
          trail: [],
        })
      }
    }

    // Initial big burst
    createBurst(canvas.width * 0.5, canvas.height * 0.25)
    const t1 = setTimeout(() => createBurst(canvas.width * 0.25, canvas.height * 0.35), 300)
    const t2 = setTimeout(() => createBurst(canvas.width * 0.75, canvas.height * 0.3), 500)
    const t3 = setTimeout(() => createBurst(canvas.width * 0.35, canvas.height * 0.2), 800)
    const t4 = setTimeout(() => createBurst(canvas.width * 0.65, canvas.height * 0.45), 1000)
    const t5 = setTimeout(() => createBurst(canvas.width * 0.15, canvas.height * 0.4), 1300)
    const t6 = setTimeout(() => createBurst(canvas.width * 0.85, canvas.height * 0.25), 1500)
    const t7 = setTimeout(() => createBurst(canvas.width * 0.5, canvas.height * 0.5), 1800)
    const t8 = setTimeout(() => createBurst(canvas.width * 0.4, canvas.height * 0.15), 2100)

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        // Store trail positions
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > 5) p.trail.shift()

        p.x += Math.cos(p.angle) * p.speed
        p.y += Math.sin(p.angle) * p.speed + 0.3
        p.speed *= 1 - p.decay
        p.size *= 0.997

        if (p.size < 0.15 || p.speed < 0.03) { particles.splice(i, 1); continue }

        const alpha = Math.min(1, p.speed / 2)

        // Draw trail
        for (let t = 0; t < p.trail.length; t++) {
          const ta = alpha * (t / p.trail.length) * 0.3
          ctx.beginPath()
          ctx.arc(p.trail[t].x, p.trail[t].y, p.size * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = ta
          ctx.fill()
        }

        // Main particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = alpha
        ctx.fill()

        // Glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = alpha * 0.1
        ctx.fill()
      }
      ctx.globalAlpha = 1
      if (particles.length > 0) animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => { cancelAnimationFrame(animRef.current); [t1,t2,t3,t4,t5,t6,t7,t8].forEach(clearTimeout) }
  }, [show])

  if (!show) return null
  return <canvas ref={canvasRef} className="fixed inset-0 z-[60] pointer-events-none" style={{ width: '100vw', height: '100vh' }} />
}

/* ─── Confetti ─── */
function ConfettiDisplay({ show, colors: propColors }: { show: boolean; colors?: string[] }) {
  if (!show) return null
  const colors = propColors || ['#b4914d', '#d4a853', '#e8c66a', '#22c55e', '#f0d78c', '#fff4d0', '#e8a4b8']
  return (
    <div className="fixed inset-0 z-[70] pointer-events-none overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            width: `${4 + Math.random() * 8}px`,
            height: `${(4 + Math.random() * 8) * 0.6}px`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: '1px',
            animationDelay: `${Math.random() * 0.8}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  )
}

/* ─── Scratch Card (v8 - Grid-based tracking + fixed DPR + sparkle trail) ─── */
function ScratchCard({ revealed, onReveal, theme }: { revealed: boolean; onReveal: () => void; theme: TemplateTheme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const revealedRef = useRef(false)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)
  const onRevealRef = useRef(onReveal)
  const [canvasFading, setCanvasFading] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [scratchPercent, setScratchPercent] = useState(0)
  const sparkleCanvasRef = useRef<HTMLCanvasElement>(null)
  const sparklesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string }>>([])
  const sparkleAnimRef = useRef<number>(0)

  // Grid-based scratch tracking (reliable, no getImageData needed)
  const GRID_COLS = 17
  const GRID_ROWS = 11
  const REVEAL_THRESHOLD = 60 // Reveal when 60% of grid cells scratched
  const gridRef = useRef<Set<string>>(new Set())

  // Keep onReveal ref always current
  useEffect(() => {
    onRevealRef.current = onReveal
  }, [onReveal])

  const CARD_W = 340
  const CARD_H = 220

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || revealed) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = CARD_W * dpr
    canvas.height = CARD_H * dpr
    canvas.style.width = `${CARD_W}px`
    canvas.style.height = `${CARD_H}px`
    const ctx = canvas.getContext('2d')!
    // Use setTransform to set DPR scaling cleanly
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Rich dark gradient surface (theme-aware)
    const grad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
    grad.addColorStop(0, theme.scratchBg[0])
    grad.addColorStop(0.2, theme.scratchBg[1])
    grad.addColorStop(0.5, theme.scratchBg[2])
    grad.addColorStop(0.8, theme.scratchBg[1])
    grad.addColorStop(1, theme.scratchBg[0])
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, CARD_W, CARD_H)

    // Metallic sheen overlay (theme-aware)
    const sheenGrad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H * 0.5)
    sheenGrad.addColorStop(0, `rgba(${theme.accentRgb}, 0.15)`)
    sheenGrad.addColorStop(0.5, `rgba(${theme.accentRgb}, 0.22)`)
    sheenGrad.addColorStop(1, `rgba(${theme.accentRgb}, 0.15)`)
    ctx.fillStyle = sheenGrad
    ctx.fillRect(0, 0, CARD_W, CARD_H)

    // Geometric mandala pattern
    ctx.globalAlpha = 0.07
    const cx = CARD_W / 2, cy = CARD_H / 2
    for (let r = 15; r < 80; r += 10) {
      ctx.beginPath()
      const sides = r < 40 ? 8 : 12
      for (let i = 0; i < sides; i++) {
        const a = (Math.PI * 2 * i) / sides - Math.PI / sides
        const px = cx + Math.cos(a) * r
        const py = cy + Math.sin(a) * r
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.strokeStyle = theme.scratchAccent
      ctx.lineWidth = 0.8
      ctx.stroke()
    }
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI * 2 * i) / 12
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a) * 12, cy + Math.sin(a) * 12)
      ctx.lineTo(cx + Math.cos(a) * 80, cy + Math.sin(a) * 80)
      ctx.strokeStyle = theme.scratchAccent
      ctx.lineWidth = 0.4
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    // Double border (theme-aware)
    ctx.strokeStyle = `rgba(${theme.accentRgb}, 0.6)`
    ctx.lineWidth = 2.5
    ctx.strokeRect(4, 4, CARD_W - 8, CARD_H - 8)
    ctx.strokeStyle = `rgba(${theme.accentRgb}, 0.25)`
    ctx.lineWidth = 1
    ctx.strokeRect(10, 10, CARD_W - 20, CARD_H - 20)

    // Corner decorations
    const cornerSize = 20
    const cornerOffset = 14
    ctx.strokeStyle = `rgba(${theme.accentRgb}, 0.5)`
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(cornerOffset, cornerOffset + cornerSize)
    ctx.lineTo(cornerOffset, cornerOffset)
    ctx.lineTo(cornerOffset + cornerSize, cornerOffset)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(CARD_W - cornerOffset - cornerSize, cornerOffset)
    ctx.lineTo(CARD_W - cornerOffset, cornerOffset)
    ctx.lineTo(CARD_W - cornerOffset, cornerOffset + cornerSize)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cornerOffset, CARD_H - cornerOffset - cornerSize)
    ctx.lineTo(cornerOffset, CARD_H - cornerOffset)
    ctx.lineTo(cornerOffset + cornerSize, CARD_H - cornerOffset)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(CARD_W - cornerOffset - cornerSize, CARD_H - cornerOffset)
    ctx.lineTo(CARD_W - cornerOffset, CARD_H - cornerOffset)
    ctx.lineTo(CARD_W - cornerOffset, CARD_H - cornerOffset - cornerSize)
    ctx.stroke()

    // "Scratch Here" text with glow (theme-aware)
    ctx.shadowColor = `rgba(${theme.accentRgb}, 0.5)`
    ctx.shadowBlur = 12
    ctx.fillStyle = `rgba(${theme.accentRgb}, 0.85)`
    ctx.font = 'bold 18px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('✦  Scratch Here  ✦', cx, cy - 8)
    ctx.shadowBlur = 0
    ctx.fillStyle = `rgba(${theme.accentRgb}, 0.5)`
    ctx.font = '11px serif'
    ctx.fillText('to reveal your invitation', cx, cy + 14)

    // Finger icon hint
    ctx.fillStyle = `rgba(${theme.accentRgb}, 0.25)`
    ctx.font = '22px serif'
    ctx.fillText('👆', cx, cy + 40)

    // Reset grid and percent
    gridRef.current = new Set()
    setScratchPercent(0)
  }, [revealed, theme])

  // Sparkle trail animation loop
  useEffect(() => {
    const sparkleCanvas = sparkleCanvasRef.current
    if (!sparkleCanvas || revealed) return
    const dpr = window.devicePixelRatio || 1
    sparkleCanvas.width = CARD_W * dpr
    sparkleCanvas.height = CARD_H * dpr
    sparkleCanvas.style.width = `${CARD_W}px`
    sparkleCanvas.style.height = `${CARD_H}px`
    const sCtx = sparkleCanvas.getContext('2d')!
    sCtx.setTransform(dpr, 0, 0, dpr, 0, 0)

    function animateSparkles() {
      sCtx.clearRect(0, 0, CARD_W, CARD_H)
      const sparkles = sparklesRef.current
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i]
        s.x += s.vx
        s.y += s.vy
        s.vy += 0.08 // gravity
        s.life--
        if (s.life <= 0) { sparkles.splice(i, 1); continue }
        const alpha = s.life / s.maxLife
        sCtx.globalAlpha = alpha
        sCtx.fillStyle = s.color
        sCtx.beginPath()
        // Star shape for sparkle
        const r = s.size * alpha
        sCtx.save()
        sCtx.translate(s.x, s.y)
        for (let j = 0; j < 4; j++) {
          sCtx.rotate(Math.PI / 4)
          sCtx.fillRect(-r * 0.15, -r, r * 0.3, r * 2)
        }
        sCtx.restore()
        // Glow
        sCtx.beginPath()
        sCtx.arc(s.x, s.y, r * 2, 0, Math.PI * 2)
        sCtx.fillStyle = s.color
        sCtx.globalAlpha = alpha * 0.15
        sCtx.fill()
      }
      sCtx.globalAlpha = 1
      sparkleAnimRef.current = requestAnimationFrame(animateSparkles)
    }
    sparkleAnimRef.current = requestAnimationFrame(animateSparkles)
    return () => cancelAnimationFrame(sparkleAnimRef.current)
  }, [revealed])

  // Celebration effect on reveal
  useEffect(() => {
    if (!revealed) return
    setShowCelebration(true)
    const t = setTimeout(() => setShowCelebration(false), 3000)
    return () => clearTimeout(t)
  }, [revealed])

  // Trigger reveal
  const doReveal = useCallback(() => {
    if (revealedRef.current) return
    revealedRef.current = true
    setCanvasFading(true)
    setTimeout(() => onRevealRef.current(), 400)
  }, [])

  // Mark grid cells around a scratch point
  const markGrid = useCallback((x: number, y: number) => {
    const cellW = CARD_W / GRID_COLS
    const cellH = CARD_H / GRID_ROWS
    // Mark the main cell and neighbors for smoother tracking
    const col = Math.floor(x / cellW)
    const row = Math.floor(y / cellH)
    const grid = gridRef.current
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = row + dr
        const c = col + dc
        if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
          grid.add(`${r}-${c}`)
        }
      }
    }
    const totalCells = GRID_ROWS * GRID_COLS
    const pct = Math.round((grid.size / totalCells) * 100)
    setScratchPercent(pct)
    if (pct >= REVEAL_THRESHOLD && !revealedRef.current) {
      doReveal()
    }
  }, [doReveal])

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }, [])

  const scratch = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas || revealedRef.current) return
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    // Reset transform to identity, then set DPR scale — ensures no double-scaling
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalCompositeOperation = 'destination-out'

    // Interpolate from last position for smooth lines
    const last = lastPosRef.current
    if (last) {
      const dx = x - last.x
      const dy = y - last.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const steps = Math.max(1, Math.floor(dist / 4))
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const ix = last.x + dx * t
        const iy = last.y + dy * t
        ctx.beginPath()
        ctx.arc(ix, iy, 24, 0, Math.PI * 2)
        ctx.fill()
      }
      // Add sparkle particles along the scratch path
      if (dist > 3) {
        const sparkColors = [theme.accentLight, theme.accent, theme.scratchAccent, '#fff4d0']
        for (let i = 0; i < Math.min(3, Math.floor(dist / 8)); i++) {
          sparklesRef.current.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 3 - 1,
            life: 20 + Math.random() * 20,
            maxLife: 40,
            size: 1.5 + Math.random() * 2.5,
            color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
          })
        }
      }
    } else {
      ctx.beginPath()
      ctx.arc(x, y, 24, 0, Math.PI * 2)
      ctx.fill()
    }

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over'
    lastPosRef.current = { x, y }

    // Mark grid cells and check reveal (every scratch move, not random)
    markGrid(x, y)
  }, [markGrid])

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    isDrawing.current = true
    lastPosRef.current = null
    const pos = getPos(e)
    scratch(pos.x, pos.y)
  }, [getPos, scratch])

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing.current) return
    const pos = getPos(e)
    scratch(pos.x, pos.y)
  }, [getPos, scratch])

  const handleEnd = useCallback(() => {
    isDrawing.current = false
    lastPosRef.current = null
  }, [])

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-calligraphy text-3xl sm:text-4xl"
        style={{ color: theme.accent }}
      >
        Scratch to Reveal
      </motion.h2>
      <HeartDivider accentColor={theme.accent} />
      {/* Progress indicator */}
      {!revealed && scratchPercent > 5 && (
        <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `rgba(${theme.accentRgb}, 0.1)` }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${theme.accentDark}, ${theme.accentLight})` }}
            animate={{ width: `${Math.min(scratchPercent, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          width: CARD_W,
          height: CARD_H,
          boxShadow: revealed
            ? `0 0 50px rgba(${theme.accentRgb},0.5), 0 0 100px rgba(${theme.accentRgb},0.2), rgba(0,0,0,0.3) 0px 4px 12px`
            : `rgba(${theme.accentRgb}, 0.3) 0px 8px 40px, rgba(0,0,0,0.3) 0px 4px 12px`,
        }}
      >
        {/* Hidden content underneath scratch surface */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl transition-all duration-1000 ${revealed ? 'gold-border-pulse' : ''}`}
          style={{
            background: `linear-gradient(135deg, ${theme.scratchBg[1]} 0%, ${theme.bgDoor} 30%, ${theme.scratchBg[2]} 50%, ${theme.bgDoor} 70%, ${theme.scratchBg[1]} 100%)`,
            border: revealed ? `2px solid rgba(${theme.accentRgb}, 0.8)` : `2px solid rgba(${theme.accentRgb}, 0.4)`,
            boxShadow: revealed
              ? `0 0 40px rgba(${theme.accentRgb},0.5), 0 0 80px rgba(${theme.accentRgb},0.2), inset 0 0 40px rgba(${theme.accentRgb},0.12)`
              : `inset 0 0 30px rgba(${theme.accentRgb},0.05)`,
          }}
        >
          {/* Corner ornamental borders */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${CARD_W} ${CARD_H}`} fill="none">
            <path d="M20 4 L4 4 L4 20" stroke={theme.scratchAccent} strokeWidth="1.5" opacity="0.5" />
            <path d={`M${CARD_W - 20} 4 L${CARD_W - 4} 4 L${CARD_W - 4} 20`} stroke={theme.scratchAccent} strokeWidth="1.5" opacity="0.5" />
            <path d={`M4 ${CARD_H - 20} L4 ${CARD_H - 4} L20 ${CARD_H - 4}`} stroke={theme.scratchAccent} strokeWidth="1.5" opacity="0.5" />
            <path d={`M${CARD_W - 4} ${CARD_H - 20} L${CARD_W - 4} ${CARD_H - 4} L${CARD_W - 20} ${CARD_H - 4}`} stroke={theme.scratchAccent} strokeWidth="1.5" opacity="0.5" />
          </svg>

          <AnimatePresence mode="wait">
            {revealed ? (
              <motion.div
                key="revealed"
                initial={{ scale: 0.5, opacity: 0, filter: 'blur(10px)' }}
                animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                className="flex flex-col items-center gap-2 z-10"
              >
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Sparkles className="w-6 h-6 mx-auto mb-1" style={{ color: theme.accentLight }} />
                </motion.div>
                <motion.p
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="font-calligraphy text-2xl sm:text-3xl font-bold"
                  style={{ color: theme.accentLight, textShadow: `0 0 25px rgba(${theme.accentRgb},0.4), 0 0 50px rgba(${theme.accentRgb},0.2)` }}
                >
                  You&apos;re Invited!
                </motion.p>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="h-px w-24"
                  style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }}
                />
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="font-display text-2xl sm:text-3xl font-bold"
                  style={{ color: theme.textSecondary, textShadow: `0 0 15px rgba(${theme.accentRgb},0.3)` }}
                >
                  March 15, 2027
                </motion.p>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="font-calligraphy text-lg"
                  style={{ color: theme.accent }}
                >
                  Sunday
                </motion.p>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="text-sm"
                  style={{ color: theme.accentLight }}
                >
                  7:00 PM <span style={{ color: theme.accentLight, fontWeight: 600 }}>PKT</span>
                </motion.p>
              </motion.div>
            ) : (
              <motion.div
                key="hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-2 z-10"
              >
                <Sparkles className="w-5 h-5 mx-auto mb-0.5" style={{ color: theme.accent }} />
                <p
                  className="font-calligraphy text-2xl sm:text-3xl font-bold"
                  style={{ color: theme.accentLight, textShadow: `0 0 15px rgba(${theme.accentRgb},0.25)` }}
                >
                  You&apos;re Invited!
                </p>
                <div
                  className="h-px w-20"
                  style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }}
                />
                <p
                  className="font-display text-2xl sm:text-3xl font-bold"
                  style={{ color: theme.textSecondary, textShadow: `0 0 10px rgba(${theme.accentRgb},0.15)` }}
                >
                  March 15, 2027
                </p>
                <p
                  className="font-calligraphy text-lg"
                  style={{ color: theme.accentLight }}
                >
                  Sunday
                </p>
                <p
                  className="text-sm"
                  style={{ color: theme.accent }}
                >
                  7:00 PM <span style={{ color: theme.accentLight, fontWeight: 600 }}>PKT</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Celebration sparkles overlay */}
        <AnimatePresence>
          {showCelebration && Array.from({ length: 24 }).map((_, i) => {
            const angle = (Math.PI * 2 * i) / 24
            const dist = 30 + Math.random() * 50
            return (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist,
                }}
                transition={{ duration: 1.5, delay: i * 0.04, ease: 'easeOut' }}
                className="absolute z-30 pointer-events-none"
                style={{
                  width: 4 + Math.random() * 6,
                  height: 4 + Math.random() * 6,
                  left: '50%',
                  top: '50%',
                  borderRadius: '50%',
                  background: [theme.accentLight, theme.accent, theme.scratchAccent, '#fff4d0'][i % 4],
                  boxShadow: `0 0 8px ${[theme.accentLight, theme.accent, theme.scratchAccent, '#fff4d0'][i % 4]}`,
                }}
              />
            )
          })}
        </AnimatePresence>

        {/* Sparkle trail canvas */}
        {!revealed && (
          <canvas
            ref={sparkleCanvasRef}
            className="absolute inset-0 rounded-2xl pointer-events-none z-40"
            style={{ width: CARD_W, height: CARD_H }}
          />
        )}

        {/* Canvas overlay (scratch surface) */}
        {!revealed && (
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 rounded-2xl cursor-pointer touch-none z-30 transition-opacity duration-400 ${canvasFading ? 'opacity-0' : 'opacity-100'}`}
            style={{ width: CARD_W, height: CARD_H, touchAction: 'none' }}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />
        )}
      </div>
    </div>
  )
}

/* ─── Countdown Timer ─── */
const COUNTDOWN_TARGET = new Date('2027-03-15T19:00:00+05:00').getTime()

function CountdownTimer({ theme, translations }: { theme: TemplateTheme; translations?: Record<string, string> }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    function update() {
      const diff = Math.max(0, COUNTDOWN_TARGET - Date.now())
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  const t = (key: string, fallback: string) => translations?.[key] || fallback

  const units = [
    { value: timeLeft.days, label: t('days', 'Days') },
    { value: timeLeft.hours, label: t('hours', 'Hours') },
    { value: timeLeft.minutes, label: t('minutes', 'Minutes') },
    { value: timeLeft.seconds, label: t('seconds', 'Seconds') },
  ]

  return (
    <div className="flex gap-3 sm:gap-4 items-center justify-center">
      {units.map((unit, idx) => (
        <React.Fragment key={unit.label}>
          <div className="flex flex-col items-center">
            <div className="rounded-lg backdrop-blur-sm w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center countdown-pulse relative overflow-hidden" style={{ border: `1px solid rgba(${theme.accentRgb},0.25)`, backgroundColor: `rgba(${theme.accentRgb},0.08)` }}>
              <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, rgba(${theme.accentRgb},0.05), transparent)` }} />
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={unit.value}
                  initial={{ y: -15, opacity: 0, rotateX: -90 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  exit={{ y: 15, opacity: 0, rotateX: 90 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="font-display text-2xl sm:text-3xl font-bold relative z-10"
                  style={{ color: theme.accent }}
                >
                  {String(unit.value).padStart(2, '0')}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider mt-2" style={{ color: `rgba(${theme.accentRgb},0.5)` }}>{unit.label}</span>
          </div>
          {idx < units.length - 1 && (
            <div className="flex flex-col items-center gap-1 mb-5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `rgba(${theme.accentRgb},0.35)` }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `rgba(${theme.accentRgb},0.25)` }} />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

/* ─── Photo Gallery ─── */
function PhotoGallery({ theme }: { theme: TemplateTheme }) {
  const images = [
    { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=500&fit=crop', alt: 'Wedding couple' },
    { src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=500&fit=crop', alt: 'Wedding rings' },
    { src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=500&fit=crop', alt: 'Wedding celebration' },
    { src: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&h=500&fit=crop', alt: 'Wedding decorations' },
  ]
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setActiveIndex((p) => (p + 1) % images.length), 4000)
    return () => clearInterval(interval)
  }, [images.length])

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative overflow-hidden rounded-xl aspect-[16/9] sm:aspect-[2/1] group shadow-lg" style={{ border: `1px solid rgba(${theme.accentRgb}, 0.2)`, boxShadow: `0 10px 15px -3px rgba(${theme.accentRgb}, 0.05)` }}>
        {images.map((img, idx) => (
          <motion.img
            key={idx}
            src={img.src}
            alt={img.alt}
            initial={false}
            animate={{ opacity: idx === activeIndex ? 1 : 0 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 h-1/4" style={{ background: `linear-gradient(to top, ${theme.bgPrimary}cc, transparent)` }} />
        <div className="absolute inset-0 rounded-xl transition-all duration-500" style={{ boxShadow: `inset 0 0 0 1px rgba(${theme.accentRgb}, 0.1)` }} />
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`rounded-full transition-all duration-500 ${idx === activeIndex ? 'w-7 h-2.5' : 'w-2.5 h-2.5'}`}
            style={idx === activeIndex 
              ? { backgroundColor: theme.accent, boxShadow: `0 0 8px rgba(${theme.accentRgb}, 0.4)` } 
              : { backgroundColor: `rgba(${theme.accentRgb}, 0.25)` }
            }
            aria-label={`Go to image ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

/* ─── Music Toggle ─── */
function MusicToggle({ isPlaying, onToggle, theme }: { isPlaying: boolean; onToggle: () => void; theme: TemplateTheme }) {
  return (
    <button
      onClick={onToggle}
      className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${isPlaying ? 'music-pulse' : ''}`}
      style={{ border: `1px solid rgba(${theme.accentRgb},0.3)`, backgroundColor: `${theme.bgPrimary}cc` }}
      aria-label={isPlaying ? 'Mute music' : 'Play music'}
    >
      {isPlaying ? <Music2 className="w-4 h-4" style={{ color: theme.accent }} /> : <Music className="w-4 h-4" style={{ color: `rgba(${theme.accentRgb},0.5)` }} />}
    </button>
  )
}

/* ─── Realistic Door Surface Material ─── */
function DoorSurface({ theme }: { theme: TemplateTheme }) {
  const ds = theme.doorStyle
  const a = theme.accentRgb

  // Material-specific CSS background textures
  const materialStyles: Record<string, React.CSSProperties> = {
    wood: {
      backgroundImage: `
        repeating-linear-gradient(87deg, transparent 0px, rgba(${a},0.04) 1px, transparent 2px, transparent 8px),
        repeating-linear-gradient(2deg, rgba(${a},0.02) 0px, transparent 2px, transparent 20px),
        repeating-linear-gradient(91deg, transparent 0px, rgba(${a},0.03) 1px, transparent 3px, transparent 12px),
        linear-gradient(180deg, ${theme.bgDoor}, ${theme.bgSecondary})
      `,
    },
    lacquer: {
      backgroundImage: `
        linear-gradient(155deg, rgba(255,255,255,0.12) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.06) 100%),
        linear-gradient(180deg, ${theme.bgDoor}, ${theme.bgSecondary})
      `,
      boxShadow: `inset 0 1px 3px rgba(255,255,255,0.15), inset 0 -1px 2px rgba(0,0,0,0.2)`,
    },
    glass: {
      backgroundImage: `
        linear-gradient(155deg, rgba(255,255,255,0.08) 0%, transparent 40%, rgba(255,255,255,0.04) 60%, transparent 100%),
        linear-gradient(180deg, ${theme.bgDoor}, ${theme.bgSecondary})
      `,
      backdropFilter: 'blur(2px)',
    },
    stone: {
      backgroundImage: `
        repeating-linear-gradient(0deg, transparent 0px, rgba(${a},0.015) 15px, transparent 16px, transparent 30px),
        repeating-linear-gradient(90deg, transparent 0px, rgba(${a},0.01) 20px, transparent 21px, transparent 40px),
        radial-gradient(ellipse at 30% 20%, rgba(${a},0.04), transparent 50%),
        radial-gradient(ellipse at 70% 80%, rgba(${a},0.03), transparent 50%),
        linear-gradient(180deg, ${theme.bgDoor}, ${theme.bgSecondary})
      `,
    },
    painted: {
      backgroundImage: `
        repeating-linear-gradient(175deg, transparent 0px, rgba(255,255,255,0.01) 3px, transparent 6px, transparent 30px),
        linear-gradient(180deg, ${theme.bgDoor}, ${theme.bgSecondary})
      `,
    },
  }

  // Ornamental inlay overlay (carved/studded patterns)
  const renderInlay = () => {
    if (ds.panelLayout === 'carved') {
      return (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
          {/* Central ornamental inlay - Mughal-inspired carved pattern */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] h-[30%]" style={{
            border: `2px solid rgba(${a},0.3)`,
            borderRadius: '8px 8px 4px 4px',
            boxShadow: `inset 0 0 12px rgba(${a},0.1), 0 0 8px rgba(${a},0.08)`,
          }}>
            <div className="absolute inset-2" style={{
              border: `1px solid rgba(${a},0.2)`,
              borderRadius: '4px',
            }} />
            {/* Central motif */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full" style={{
              border: `2px solid rgba(${a},0.35)`,
              boxShadow: `inset 0 0 6px rgba(${a},0.15), 0 0 4px rgba(${a},0.1)`,
            }}>
              <div className="absolute inset-1.5 rounded-full" style={{ border: `1px solid rgba(${a},0.2)` }} />
            </div>
          </div>
          {/* Top decorative arch carving */}
          <svg className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[50%] h-[15%] opacity-40" viewBox="0 0 120 50" fill="none">
            <path d="M10 50 Q10 10 60 5 Q110 10 110 50" stroke={`rgba(${a},0.5)`} strokeWidth="1.2" fill="none" />
            <path d="M18 50 Q18 18 60 13 Q102 18 102 50" stroke={`rgba(${a},0.3)`} strokeWidth="0.8" fill="none" />
          </svg>
          {/* Bottom decorative carving */}
          <svg className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[50%] h-[10%] opacity-30" viewBox="0 0 120 30" fill="none">
            <path d="M10 0 Q30 25 60 28 Q90 25 110 0" stroke={`rgba(${a},0.5)`} strokeWidth="1" fill="none" />
          </svg>
        </div>
      )
    }
    if (ds.panelLayout === 'studded') {
      // Brass stud pattern
      return (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
          {/* Stud pattern grid */}
          {Array.from({ length: 5 }).map((_, row) =>
            Array.from({ length: 3 }).map((_, col) => (
              <div
                key={`stud-${row}-${col}`}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  top: `${15 + row * 17}%`,
                  left: `${20 + col * 25}%`,
                  background: `radial-gradient(circle at 35% 35%, ${theme.accentLight}, ${theme.accent}, ${theme.accentDark})`,
                  boxShadow: `0 1px 3px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.3)`,
                  border: `0.5px solid rgba(${a},0.6)`,
                }}
              />
            ))
          )}
          {/* Stud border rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`top-stud-${i}`}
              className="absolute w-2.5 h-2.5 rounded-full"
              style={{
                top: '5%',
                left: `${10 + i * 11}%`,
                background: `radial-gradient(circle at 35% 35%, ${theme.accentLight}, ${theme.accentDark})`,
                boxShadow: `0 1px 2px rgba(0,0,0,0.4)`,
              }}
            />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`bot-stud-${i}`}
              className="absolute w-2.5 h-2.5 rounded-full"
              style={{
                bottom: '5%',
                left: `${10 + i * 11}%`,
                background: `radial-gradient(circle at 35% 35%, ${theme.accentLight}, ${theme.accentDark})`,
                boxShadow: `0 1px 2px rgba(0,0,0,0.4)`,
              }}
            />
          ))}
        </div>
      )
    }
    return null
  }

  // Glass pane grid for French door style
  const renderGlassGrid = () => {
    if (ds.panelLayout !== 'glass-grid') return null
    const rows = 4
    const cols = 2
    return (
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2, padding: '8%' }}>
        <div className="w-full h-full grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: '4px' }}>
          {Array.from({ length: rows * cols }).map((_, i) => (
            <div key={`glass-${i}`} style={{
              background: `linear-gradient(155deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 40%, rgba(255,255,255,0.04) 100%)`,
              border: `2px solid rgba(${a},0.25)`,
              borderRadius: '2px',
              boxShadow: `inset 0 0 8px rgba(255,255,255,0.03), 0 1px 2px rgba(0,0,0,0.15)`,
            }}>
              {/* Glass reflection highlight */}
              <div className="w-full h-full" style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)`,
                borderRadius: '1px',
              }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      {/* Material base texture */}
      <div className="absolute inset-0" style={materialStyles[ds.doorMaterial] || materialStyles.wood} />
      {/* Glass-specific frosted overlay */}
      {ds.doorMaterial === 'glass' && (
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.06), transparent 60%)`,
        }} />
      )}
      {/* Stone marble veining */}
      {ds.doorMaterial === 'stone' && (
        <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 200 400" fill="none">
          <path d="M30 50 Q80 80 60 150 Q40 220 90 280 Q120 320 80 400" stroke={`rgba(${a},0.4)`} strokeWidth="0.6" fill="none" />
          <path d="M170 30 Q130 70 150 130 Q170 190 120 250 Q100 290 140 380" stroke={`rgba(${a},0.3)`} strokeWidth="0.4" fill="none" />
          <path d="M100 0 Q90 60 110 120 Q130 180 100 240" stroke={`rgba(${a},0.2)`} strokeWidth="0.3" fill="none" />
        </svg>
      )}
      {/* Lacquer gloss highlight */}
      {ds.doorMaterial === 'lacquer' && (
        <div className="absolute inset-0" style={{
          background: `linear-gradient(160deg, rgba(255,255,255,0.1) 0%, transparent 25%, transparent 75%, rgba(255,255,255,0.04) 100%)`,
        }} />
      )}
      {/* Panel inlay/carving overlay */}
      {renderInlay()}
      {/* Glass grid panes */}
      {renderGlassGrid()}
    </div>
  )
}

/* ─── Door Panel Content ─── */
function DoorPanelContent({ theme, text, textLang }: { theme: TemplateTheme; text: string; textLang: string }) {
  const isRtl = textLang === 'ar' || textLang === 'ur'
  const ds = theme.doorStyle
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        {/* Central ornament - varies by svgPattern */}
        <svg className="w-20 h-20 opacity-30" viewBox="0 0 100 100" fill="none">
          {ds.svgPattern === 'arch' && (
            <>
              <circle cx="50" cy="50" r="40" stroke={theme.accent} strokeWidth="0.5" opacity="0.4" />
              <circle cx="50" cy="50" r="30" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
                <line key={a} x1="50" y1="10" x2="50" y2="90" stroke={theme.accent} strokeWidth="0.3" opacity="0.15" transform={`rotate(${a} 50 50)`} />
              ))}
            </>
          )}
          {ds.svgPattern === 'floral' && (
            <>
              <circle cx="50" cy="50" r="25" stroke={theme.accent} strokeWidth="0.5" opacity="0.4" />
              {[0, 72, 144, 216, 288].map(a => (
                <ellipse key={a} cx="50" cy="25" rx="6" ry="14" stroke={theme.accent} strokeWidth="0.4" opacity="0.3" transform={`rotate(${a} 50 50)`} />
              ))}
            </>
          )}
          {ds.svgPattern === 'minimal' && (
            <>
              <line x1="20" y1="50" x2="80" y2="50" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" />
              <line x1="50" y1="20" x2="50" y2="80" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" />
              <circle cx="50" cy="50" r="2" fill={theme.accent} opacity="0.4" />
            </>
          )}
          {ds.svgPattern === 'mandala' && (
            <>
              <circle cx="50" cy="50" r="35" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" />
              <circle cx="50" cy="50" r="22" stroke={theme.accent} strokeWidth="0.4" opacity="0.25" />
              <circle cx="50" cy="50" r="10" stroke={theme.accent} strokeWidth="0.3" opacity="0.2" />
              {Array.from({ length: 12 }).map((_, i) => (
                <line key={i} x1="50" y1="15" x2="50" y2="85" stroke={theme.accent} strokeWidth="0.2" opacity="0.15" transform={`rotate(${i * 30} 50 50)`} />
              ))}
            </>
          )}
          {ds.svgPattern === 'paisley' && (
            <>
              <path d="M50 20 Q70 35 65 55 Q60 70 45 65 Q30 55 35 40 Q40 25 50 20Z" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" fill="none" />
              <path d="M50 25 Q60 35 55 50 Q50 60 42 55" stroke={theme.accent} strokeWidth="0.3" opacity="0.2" fill="none" />
            </>
          )}
          {ds.svgPattern === 'diamond' && (
            <>
              <polygon points="50,15 85,50 50,85 15,50" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" fill="none" />
              <polygon points="50,30 70,50 50,70 30,50" stroke={theme.accent} strokeWidth="0.4" opacity="0.25" fill="none" />
            </>
          )}
          {ds.svgPattern === 'dome' && (
            <>
              <path d="M20 60 Q20 25 50 15 Q80 25 80 60" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" fill="none" />
              <line x1="50" y1="15" x2="50" y2="8" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" />
              <circle cx="50" cy="6" r="3" stroke={theme.accent} strokeWidth="0.4" opacity="0.25" fill="none" />
            </>
          )}
          {ds.svgPattern === 'star' && (
            <>
              <polygon points="50,15 57,38 80,38 62,52 68,75 50,62 32,75 38,52 20,38 43,38" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" fill="none" />
              <polygon points="50,25 54,38 65,38 56,46 59,58 50,52 41,58 44,46 35,38 46,38" stroke={theme.accent} strokeWidth="0.3" opacity="0.2" fill="none" />
            </>
          )}
          {ds.svgPattern === 'lantern' && (
            <>
              <path d="M35 40 Q35 25 50 20 Q65 25 65 40" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" fill="none" />
              <rect x="37" y="40" width="26" height="30" stroke={theme.accent} strokeWidth="0.4" opacity="0.25" fill="none" rx="2" />
              <path d="M37 70 Q37 80 50 85 Q63 80 65 70" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" fill="none" />
            </>
          )}
          {ds.svgPattern === 'geometric' && (
            <>
              <polygon points="50,20 70,35 70,60 50,75 30,60 30,35" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" fill="none" />
              <polygon points="50,30 60,38 60,55 50,63 40,55 40,38" stroke={theme.accent} strokeWidth="0.3" opacity="0.2" fill="none" />
            </>
          )}
        </svg>
        <span
          className="font-calligraphy text-3xl sm:text-4xl leading-relaxed"
          dir={isRtl ? 'rtl' : 'ltr'}
          style={{ color: `rgba(${theme.accentRgb},0.8)` }}
        >
          {text}
        </span>
        <div className="w-12 h-px" style={{ backgroundColor: `rgba(${theme.accentRgb},0.3)` }} />
      </div>
    </div>
  )
}

/* ─── Door Handle - Per-type realistic hardware ─── */
function DoorHandle({ theme, side }: { theme: TemplateTheme; side: 'left' | 'right' }) {
  const ds = theme.doorStyle
  const a = theme.accentRgb
  const al = theme.accentLight
  const ad = theme.accentDark
  const ac = theme.accent
  const posClass = side === 'left' ? 'right-5' : 'left-5'

  switch (ds.handleType) {
    case 'none':
      return null

    case 'ring-knocker':
      return (
        <div className={`absolute ${posClass} top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-10`}>
          {/* Door knocker ring */}
          <div className="relative">
            {/* Knocker plate / backplate */}
            <div className="w-10 h-12 rounded" style={{
              background: `linear-gradient(145deg, ${al}, ${ac}, ${ad})`,
              boxShadow: `0 3px 8px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.2)`,
              border: `1px solid rgba(${a},0.6)`,
            }}>
              {/* Plate screw holes */}
              <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.25)', boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.15)' }} />
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.25)', boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.15)' }} />
              <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.25)', boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.15)' }} />
              <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.25)', boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.15)' }} />
            </div>
            {/* Knocker ring */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-7 h-9 rounded-full border-[3px]" style={{
              borderColor: ac,
              boxShadow: `0 2px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.25), 0 0 8px rgba(${a},0.3)`,
              background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.12), transparent)`,
            }} />
            {/* Attachment point */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full" style={{
              background: `linear-gradient(145deg, ${al}, ${ad})`,
              boxShadow: `0 1px 2px rgba(0,0,0,0.3)`,
            }} />
          </div>
          {/* Keyhole plate */}
          <div className="w-6 h-10 rounded relative" style={{
            background: `linear-gradient(145deg, ${ad}, ${ac}, ${ad})`,
            boxShadow: `0 2px 5px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.2)`,
            border: `1px solid rgba(${a},0.4)`,
          }}>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.7)', boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.1)' }} />
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-0.5 h-3" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }} />
            <div className="absolute inset-1 rounded-sm border" style={{ borderColor: `rgba(${a},0.25)` }} />
          </div>
        </div>
      )

    case 'lever':
      return (
        <div className={`absolute ${posClass} top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10`}>
          {/* Lever handle - horizontal bar */}
          <div className="relative">
            {/* Backplate */}
            <div className="w-8 h-20 rounded-lg" style={{
              background: `linear-gradient(145deg, ${al}, ${ac}, ${ad})`,
              boxShadow: `0 2px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.2)`,
              border: `1px solid rgba(${a},0.5)`,
            }}>
              {/* Screw holes */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.3)', boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.15)' }} />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.3)', boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.15)' }} />
            </div>
            {/* Lever arm */}
            <div className="absolute top-1/2 -translate-y-1/2" style={{
              [side === 'left' ? 'right' : 'left']: '100%',
              width: '28px',
              height: '6px',
              background: `linear-gradient(180deg, ${al}, ${ac}, ${ad})`,
              borderRadius: '0 3px 3px 0',
              boxShadow: `0 2px 4px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.15)`,
            }} />
            {/* Lever tip */}
            <div className="absolute top-1/2 -translate-y-1/2" style={{
              [side === 'left' ? 'right' : 'left']: 'calc(100% + 24px)',
              width: '8px',
              height: '10px',
              background: `linear-gradient(145deg, ${al}, ${ad})`,
              borderRadius: '0 4px 4px 0',
              boxShadow: `0 1px 3px rgba(0,0,0,0.3)`,
            }} />
          </div>
          {/* Keyhole */}
          <div className="w-4 h-6 rounded relative" style={{
            background: `linear-gradient(145deg, ${ad}, ${ac})`,
            boxShadow: `0 1px 3px rgba(0,0,0,0.3)`,
            border: `1px solid rgba(${a},0.3)`,
          }}>
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} />
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-0.5 h-2" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} />
          </div>
        </div>
      )

    case 'iron-ring':
      return (
        <div className={`absolute ${posClass} top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-10`}>
          {/* Heavy iron ring handle */}
          <div className="relative">
            {/* Mounting plate */}
            <div className="w-10 h-14 rounded-sm" style={{
              background: `linear-gradient(145deg, #555, #333, #222)`,
              boxShadow: `0 3px 8px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.08)`,
              border: `1px solid rgba(${a},0.3)`,
            }}>
              {/* Rivets */}
              <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full" style={{ background: 'radial-gradient(circle at 40% 35%, #666, #222)', boxShadow: '0 1px 1px rgba(0,0,0,0.3)' }} />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'radial-gradient(circle at 40% 35%, #666, #222)', boxShadow: '0 1px 1px rgba(0,0,0,0.3)' }} />
              <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full" style={{ background: 'radial-gradient(circle at 40% 35%, #666, #222)', boxShadow: '0 1px 1px rgba(0,0,0,0.3)' }} />
              <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'radial-gradient(circle at 40% 35%, #666, #222)', boxShadow: '0 1px 1px rgba(0,0,0,0.3)' }} />
            </div>
            {/* Iron ring */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-10 rounded-full border-[4px]" style={{
              borderColor: '#444',
              boxShadow: `0 2px 6px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.08), 0 0 6px rgba(${a},0.15)`,
              background: `radial-gradient(circle at 40% 35%, rgba(255,255,255,0.06), transparent)`,
            }} />
            {/* Ring attachment */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full" style={{
              background: `linear-gradient(145deg, #555, #222)`,
              boxShadow: `0 1px 2px rgba(0,0,0,0.4)`,
            }} />
          </div>
        </div>
      )

    case 'crystal':
      return (
        <div className={`absolute ${posClass} top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10`}>
          {/* Crystal/delicate knob */}
          <div className="relative">
            {/* Small backplate */}
            <div className="w-6 h-6 rounded-full" style={{
              background: `linear-gradient(145deg, ${al}, ${ac})`,
              boxShadow: `0 2px 5px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)`,
              border: `1px solid rgba(${a},0.5)`,
            }} />
            {/* Crystal knob - clear/frosted look */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full" style={{
              background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35), rgba(255,255,255,0.15) 40%, rgba(${a},0.2) 70%, rgba(${a},0.1))`,
              boxShadow: `0 2px 8px rgba(0,0,0,0.3), 0 0 12px rgba(${a},0.2), inset 0 1px 3px rgba(255,255,255,0.3)`,
              border: `1.5px solid rgba(${a},0.35)`,
            }}>
              {/* Internal refraction highlight */}
              <div className="absolute top-1 left-1.5 w-2 h-2 rounded-full" style={{
                background: `radial-gradient(circle, rgba(255,255,255,0.6), transparent)`,
              }} />
            </div>
            {/* Knob stem */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-3" style={{
              background: `linear-gradient(180deg, ${al}, ${ac})`,
              borderRadius: '1px',
            }} />
          </div>
        </div>
      )

    case 'pull':
      return (
        <div className={`absolute ${posClass} top-1/2 -translate-y-1/2 z-10`}>
          {/* Modern pull handle - horizontal bar */}
          <div className="w-2 h-16 rounded-full" style={{
            background: `linear-gradient(180deg, #888, #555, #888)`,
            boxShadow: `0 2px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.15)`,
          }}>
            {/* Top mount */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-3 rounded-sm" style={{
              background: `linear-gradient(145deg, #777, #444)`,
              boxShadow: `0 1px 2px rgba(0,0,0,0.3)`,
            }}>
              <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} />
            </div>
            {/* Bottom mount */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-3 rounded-sm" style={{
              background: `linear-gradient(145deg, #777, #444)`,
              boxShadow: `0 1px 2px rgba(0,0,0,0.3)`,
            }}>
              <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} />
            </div>
          </div>
        </div>
      )

    default:
      return null
  }
}

/* ─── Center Button Styles ─── */
function CenterButton({ theme, onClick }: { theme: TemplateTheme; onClick: () => void }) {
  const ds = theme.doorStyle
  const sizeClass = 'w-28 h-28 md:w-36 md:h-36'

  const renderButtonContent = () => (
    <>
      {/* Outer ring with 3D depth */}
      <div className="absolute inset-0" style={{
        background: `radial-gradient(circle at 35% 35%, ${theme.accentDark}, ${theme.bgDoor})`,
        boxShadow: '0 8px 30px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -2px 6px rgba(0,0,0,0.3)',
      }} />
      <div className="absolute inset-1" style={{
        background: `radial-gradient(circle at 40% 30%, ${theme.accentDark}, ${theme.bgDoor})`,
        boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.1)',
      }} />
      {/* Inner accent ring */}
      <div className="absolute inset-3 md:inset-4 border-2 opacity-30" style={{ borderColor: theme.accent }} />
      {/* Rotating shimmer line */}
      <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 'inherit' }}>
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
          transform: 'rotate(25deg)',
          animation: 'shimmerRotate 3s ease-in-out infinite',
        }} />
      </div>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl md:text-3xl font-bold" style={{ color: theme.accent, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{ds.centerIcon}</span>
        <span className="text-[8px] md:text-[10px] tracking-[0.2em] uppercase mt-0.5" style={{ color: theme.accent }}>tap to open</span>
      </div>
      {/* Pulsing ring */}
      <div className="absolute inset-[-8px] border animate-ping opacity-20" style={{ borderColor: theme.borderSubtle, borderRadius: 'inherit' }} />
    </>
  )

  switch (ds.buttonStyle) {
    case 'diamond':
      return (
        <button
          onClick={onClick}
          className={`relative ${sizeClass} rotate-45 cursor-pointer focus:outline-none group animate-float`}
          aria-label="Open invitation"
        >
          <div className="absolute inset-0 rotate-0" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}>
            {renderButtonContent()}
          </div>
        </button>
      )
    case 'shield':
      return (
        <button
          onClick={onClick}
          className={`relative ${sizeClass} cursor-pointer focus:outline-none group animate-float`}
          style={{ clipPath: 'polygon(15% 0%, 85% 0%, 100% 20%, 100% 70%, 50% 100%, 0% 70%, 0% 20%)' }}
          aria-label="Open invitation"
        >
          {renderButtonContent()}
        </button>
      )
    case 'hexagon':
      return (
        <button
          onClick={onClick}
          className={`relative ${sizeClass} cursor-pointer focus:outline-none group animate-float`}
          style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
          aria-label="Open invitation"
        >
          {renderButtonContent()}
        </button>
      )
    case 'star':
      return (
        <button
          onClick={onClick}
          className={`relative ${sizeClass} cursor-pointer focus:outline-none group animate-float`}
          style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}
          aria-label="Open invitation"
        >
          {renderButtonContent()}
        </button>
      )
    case 'circle':
    default:
      return (
        <button
          onClick={onClick}
          className={`relative ${sizeClass} rounded-full cursor-pointer focus:outline-none group animate-float`}
          aria-label="Open invitation"
        >
          {renderButtonContent()}
        </button>
      )
  }
}

/* ─── Door Decorative Elements ─── */
function CurtainEdge({ side, accentRgb }: { side: 'left' | 'right'; accentRgb: string }) {
  return (
    <>
      {/* Fabric tassel bottom edge */}
      <svg className={`absolute bottom-0 ${side === 'left' ? 'right-0' : 'left-0'} w-full h-28 opacity-30`} viewBox="0 0 200 70" preserveAspectRatio="none" fill="none">
        <path
          d="M0 0 Q25 15 50 5 Q75 20 100 8 Q125 18 150 5 Q175 15 200 0 L200 50 L0 50Z"
          fill={`rgba(${accentRgb},0.15)`}
        />
        {/* Tassels */}
        {[20, 50, 80, 120, 150, 180].map(x => (
          <g key={x}>
            <line x1={x} y1="48" x2={x} y2="65" stroke={`rgba(${accentRgb},0.3)`} strokeWidth="1" />
            <circle cx={x} cy="67" r="2" fill={`rgba(${accentRgb},0.25)`} />
          </g>
        ))}
      </svg>
      {/* Curtain rod top */}
      <div className={`absolute top-0 ${side === 'left' ? 'right-0' : 'left-0'} w-full h-3 opacity-40`} style={{
        background: `linear-gradient(180deg, rgba(${accentRgb},0.4), rgba(${accentRgb},0.1))`,
        borderRadius: '0 0 2px 2px',
      }} />
    </>
  )
}

function DomeCap({ accent }: { accent: string }) {
  return (
    <svg className="absolute top-0 left-0 w-full h-1/3 opacity-20" viewBox="0 0 400 150" preserveAspectRatio="none" fill="none">
      {/* Main dome */}
      <path d="M0 150 Q0 30 200 0 Q400 30 400 150" stroke={accent} strokeWidth="1.5" fill="none" />
      <path d="M20 150 Q20 50 200 20 Q380 50 380 150" stroke={accent} strokeWidth="0.8" fill="none" />
      {/* Finial */}
      <circle cx="200" cy="10" r="8" stroke={accent} strokeWidth="0.6" fill="none" />
      <line x1="200" y1="0" x2="200" y2="18" stroke={accent} strokeWidth="0.8" />
      {/* Crescent moon atop finial */}
      <path d="M196 4 Q200 0 204 4" stroke={accent} strokeWidth="0.5" fill="none" />
      {/* Minarets */}
      <rect x="10" y="120" width="8" height="30" stroke={accent} strokeWidth="0.4" fill="none" />
      <path d="M10 120 Q14 112 18 120" stroke={accent} strokeWidth="0.4" fill="none" />
      <rect x="382" y="120" width="8" height="30" stroke={accent} strokeWidth="0.4" fill="none" />
      <path d="M382 120 Q386 112 390 120" stroke={accent} strokeWidth="0.4" fill="none" />
      {/* Decorative bands */}
      <line x1="0" y1="130" x2="400" y2="130" stroke={accent} strokeWidth="0.4" />
      <line x1="0" y1="140" x2="400" y2="140" stroke={accent} strokeWidth="0.3" />
    </svg>
  )
}

function ArchwayCap({ accent }: { accent: string }) {
  return (
    <svg className="absolute top-0 left-0 w-full h-1/4 opacity-15" viewBox="0 0 400 120" preserveAspectRatio="none" fill="none">
      {/* Main arch */}
      <path d="M0 120 L0 60 Q0 0 200 0 Q400 0 400 60 L400 120" stroke={accent} strokeWidth="1.5" fill="none" />
      <path d="M20 120 L20 65 Q20 15 200 15 Q380 15 380 65 L380 120" stroke={accent} strokeWidth="0.8" fill="none" />
      {/* Keystone at top */}
      <path d="M190 0 L200 -8 L210 0" stroke={accent} strokeWidth="0.6" fill="none" />
      {/* Decorative voussoirs (arch segments) */}
      {[30, 60, 90, 120, 150, 200, 250, 280, 310, 340, 370].map(x => (
        <line key={x} x1={x} y1="0" x2={x} y2="30" stroke={accent} strokeWidth="0.2" opacity="0.3" />
      ))}
    </svg>
  )
}

function ScrollCap({ side, accent, accentRgb }: { side: 'top' | 'bottom'; accent: string; accentRgb: string }) {
  return (
    <svg className={`absolute ${side === 'top' ? 'top-0' : 'bottom-0'} left-0 w-full h-10 opacity-30`} viewBox="0 0 400 28" preserveAspectRatio="none" fill="none">
      {/* Scroll rod */}
      <rect x="0" y={side === 'top' ? '0' : '14'} width="400" height="14" rx="7" fill={`rgba(${accentRgb},0.2)`} stroke={accent} strokeWidth="0.5" />
      {/* Scroll rolled edge highlight */}
      <rect x="2" y={side === 'top' ? '2' : '16'} width="396" height="4" rx="2" fill={`rgba(${accentRgb},0.1)`} />
      {/* End caps */}
      <circle cx="10" cy={side === 'top' ? '7' : '21'} r="5" stroke={accent} strokeWidth="0.5" fill={`rgba(${accentRgb},0.15)`} />
      <circle cx="390" cy={side === 'top' ? '7' : '21'} r="5" stroke={accent} strokeWidth="0.5" fill={`rgba(${accentRgb},0.15)`} />
    </svg>
  )
}

/* ─── 3D Door Panel Inset (Raised Panel) - Multi-Layout ─── */
function DoorPanelInset({ x, y, w, h, accent, accentRgb, arched }: { x: string; y: string; w: string; h: string; accent: string; accentRgb: string; arched?: boolean }) {
  return (
    <div className="absolute" style={{
      left: x, top: y, width: w, height: h,
      background: `linear-gradient(145deg, rgba(${accentRgb},0.08), rgba(${accentRgb},0.16))`,
      border: `1.5px solid rgba(${accentRgb},0.25)`,
      borderRadius: arched ? '8px 8px 3px 3px' : '3px',
      boxShadow: `inset 2px 2px 6px rgba(0,0,0,0.25), inset -2px -2px 4px rgba(${accentRgb},0.1), 0 1px 3px rgba(${accentRgb},0.15)`,
    }}>
      {/* Inner recess border - gives raised panel effect */}
      <div className="absolute" style={{
        left: '5px', top: '5px', right: '5px', bottom: '5px',
        border: `1px solid rgba(${accentRgb},0.12)`,
        borderRadius: arched ? '6px 6px 2px 2px' : '2px',
        boxShadow: `inset 0 1px 2px rgba(0,0,0,0.12), 0 0.5px 1px rgba(${accentRgb},0.08)`,
      }} />
      {/* Subtle inner highlight - simulates light catching the panel edge */}
      <div className="absolute" style={{
        left: '1px', top: '1px', right: '60%', bottom: '85%',
        background: `linear-gradient(135deg, rgba(${accentRgb},0.12), transparent)`,
        borderRadius: arched ? '6px 0 0 0' : '2px 0 0 0',
      }} />
      {/* Arched top detail */}
      {arched && (
        <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[30%] opacity-30" viewBox="0 0 100 30" fill="none">
          <path d="M5 30 Q5 5 50 2 Q95 5 95 30" stroke={`rgba(${accentRgb},0.5)`} strokeWidth="0.8" fill="none" />
        </svg>
      )}
    </div>
  )
}

/* ─── Door Panel Layout Renderer ─── */
function DoorPanelLayout({ theme, side }: { theme: TemplateTheme; side: 'left' | 'right' }) {
  const ds = theme.doorStyle
  const a = theme.accentRgb
  const ac = theme.accent
  // Panel inset position depends on handle side - offset panels away from handle
  const panelLeft = side === 'left' ? '12%' : '8%'
  const panelW = '55%'

  switch (ds.panelLayout) {
    case '2-panel':
      return (
        <>
          <DoorPanelInset x={panelLeft} y="10%" w={panelW} h="32%" accent={ac} accentRgb={a} />
          <DoorPanelInset x={panelLeft} y="56%" w={panelW} h="32%" accent={ac} accentRgb={a} />
        </>
      )
    case '4-panel':
      return (
        <>
          <DoorPanelInset x={panelLeft} y="6%" w={panelW} h="20%" accent={ac} accentRgb={a} />
          <DoorPanelInset x={panelLeft} y="30%" w={panelW} h="20%" accent={ac} accentRgb={a} />
          <DoorPanelInset x={panelLeft} y="56%" w={panelW} h="18%" accent={ac} accentRgb={a} />
          <DoorPanelInset x={panelLeft} y="78%" w={panelW} h="16%" accent={ac} accentRgb={a} />
        </>
      )
    case 'arched-panel':
      return (
        <>
          <DoorPanelInset x={panelLeft} y="8%" w={panelW} h="38%" accent={ac} accentRgb={a} arched />
          <DoorPanelInset x={panelLeft} y="56%" w={panelW} h="32%" accent={ac} accentRgb={a} />
        </>
      )
    case 'carved':
      // Carved doors have subtle recessed outlines instead of raised panels
      return (
        <>
          <div className="absolute" style={{
            left: panelLeft, top: '10%', width: panelW, height: '80%',
            border: `1px solid rgba(${a},0.15)`,
            borderRadius: '4px',
            boxShadow: `inset 0 0 10px rgba(0,0,0,0.15)`,
          }}>
            <div className="absolute" style={{
              left: '6px', top: '6px', right: '6px', bottom: '6px',
              border: `1px solid rgba(${a},0.1)`,
              borderRadius: '2px',
            }} />
          </div>
        </>
      )
    case 'studded':
      // Studded doors have a border outline but no raised panels
      return (
        <>
          <div className="absolute" style={{
            left: '10%', top: '10%', width: '70%', height: '80%',
            border: `2px solid rgba(${a},0.2)`,
            borderRadius: '3px',
            boxShadow: `inset 0 0 8px rgba(0,0,0,0.1)`,
          }} />
        </>
      )
    case 'glass-grid':
      // French door - glass grid is handled by DoorSurface, just add a subtle outer border
      return (
        <>
          <div className="absolute" style={{
            left: '6%', top: '6%', width: '88%', height: '88%',
            border: `2px solid rgba(${a},0.2)`,
            borderRadius: '3px',
          }} />
        </>
      )
    case 'flat':
    default:
      // Flat / modern - no panels, just a subtle border
      return null
  }
}

/* ─── Door Hinges ─── */
function DoorHinges({ side, accent, accentRgb }: { side: 'left' | 'right'; accent: string; accentRgb: string }) {
  const hingePositions = ['15%', '45%', '75%']
  const posClass = side === 'left' ? 'left-1 -translate-x-1/3' : 'right-1 translate-x-1/3'
  return (
    <>
      {hingePositions.map((top, i) => (
        <div key={i} className={`absolute ${posClass}`} style={{ top, zIndex: 5 }}>
          {/* Hinge body - wider and taller */}
          <div className="w-4 h-14 rounded-sm" style={{
            background: `linear-gradient(${side === 'left' ? '90deg' : '270deg'}, ${accent}, ${accent}aa)`,
            boxShadow: `0 2px 5px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.2)`,
            border: `1px solid rgba(${accentRgb},0.6)`,
          }}>
            {/* Hinge pin dots - larger */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.4)', boxShadow: 'inset 0 0.5px 0.5px rgba(255,255,255,0.2)' }} />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.4)', boxShadow: 'inset 0 0.5px 0.5px rgba(255,255,255,0.2)' }} />
            {/* Center screw */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} />
          </div>
          {/* Hinge plate (mortise) - wider */}
          <div className={`absolute ${side === 'left' ? '-left-1' : '-right-1'} top-0 w-6 h-14 rounded-sm`} style={{
            background: `rgba(${accentRgb},0.2)`,
            border: `1px solid rgba(${accentRgb},0.25)`,
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)',
          }}>
            {/* Mortise screw holes */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} />
          </div>
        </div>
      ))}
    </>
  )
}

/* ─── Door Frame - Per-style frame rendering ─── */
function DoorFrame({ theme }: { theme: TemplateTheme }) {
  const ds = theme.doorStyle
  const fc = theme.bgDoor
  const a = theme.accentRgb
  const ac = theme.accent

  const renderCornerAccents = () => (
    <>
      {[
        { top: '0', left: '0' },
        { top: '0', right: '0' },
        { bottom: '0', left: '0' },
        { bottom: '0', right: '0' },
      ].map((pos, i) => (
        <div key={i} className="absolute w-8 h-8" style={{ ...pos, background: `radial-gradient(circle at center, rgba(${a},0.25), transparent)` }} />
      ))}
    </>
  )

  switch (ds.frameStyle) {
    case 'modern':
      // Sleek minimal steel frame
      return (
        <div className="absolute inset-0 pointer-events-none z-[1]">
          {/* Top - thin steel bar */}
          <div className="absolute top-0 left-0 right-0 h-4" style={{
            background: `linear-gradient(180deg, #444, #333)`,
            borderBottom: `1px solid rgba(255,255,255,0.1)`,
          }} />
          {/* Bottom threshold - thin */}
          <div className="absolute bottom-0 left-0 right-0 h-3" style={{
            background: `linear-gradient(0deg, #444, #333)`,
            borderTop: `1px solid rgba(255,255,255,0.08)`,
          }} />
          {/* Left pillar - thin steel */}
          <div className="absolute top-4 left-0 w-3 bottom-3" style={{
            background: `linear-gradient(90deg, #444, #3a3a3a)`,
            borderRight: `1px solid rgba(255,255,255,0.08)`,
          }} />
          {/* Right pillar */}
          <div className="absolute top-4 right-0 w-3 bottom-3" style={{
            background: `linear-gradient(270deg, #444, #3a3a3a)`,
            borderLeft: `1px solid rgba(255,255,255,0.08)`,
          }} />
        </div>
      )

    case 'simple':
      // Clean simple molding
      return (
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute top-0 left-0 right-0 h-5" style={{
            background: `linear-gradient(180deg, ${fc}, ${fc}cc)`,
            borderBottom: `1px solid rgba(${a},0.2)`,
          }} />
          <div className="absolute bottom-0 left-0 right-0 h-4" style={{
            background: `linear-gradient(0deg, ${fc}, ${fc}bb)`,
            borderTop: `1px solid rgba(${a},0.2)`,
          }} />
          <div className="absolute top-5 left-0 w-5 bottom-4" style={{
            background: `linear-gradient(90deg, ${fc}, ${fc}99)`,
            borderRight: `1px solid rgba(${a},0.15)`,
          }} />
          <div className="absolute top-5 right-0 w-5 bottom-4" style={{
            background: `linear-gradient(270deg, ${fc}, ${fc}99)`,
            borderLeft: `1px solid rgba(${a},0.15)`,
          }} />
        </div>
      )

    case 'arched-stone':
      // Grand stone/marble Mughal archway frame
      return (
        <div className="absolute inset-0 pointer-events-none z-[1]">
          {/* Arch shape at top */}
          <svg className="absolute top-0 left-0 w-full h-[35%]" viewBox="0 0 400 150" preserveAspectRatio="none" fill="none">
            {/* Outer arch */}
            <path d="M0 150 L0 80 Q0 0 200 0 Q400 0 400 80 L400 150" fill={fc} stroke={`rgba(${a},0.4)`} strokeWidth="2" />
            {/* Inner arch */}
            <path d="M15 150 L15 85 Q15 15 200 15 Q385 15 385 85 L385 150" fill="none" stroke={`rgba(${a},0.25)`} strokeWidth="1.5" />
            {/* Keystone */}
            <path d="M190 0 L200 -10 L210 0" stroke={`rgba(${a},0.5)`} strokeWidth="1.5" fill="none" />
            {/* Voussoirs (arch segment lines) */}
            {[40, 80, 120, 160, 200, 240, 280, 320, 360].map(x => (
              <line key={x} x1={x} y1="0" x2={x} y2="40" stroke={`rgba(${a},0.15)`} strokeWidth="0.5" />
            ))}
            {/* Decorative jali pattern in arch spandrels */}
            <circle cx="60" cy="70" r="12" stroke={`rgba(${a},0.2)`} strokeWidth="0.5" fill="none" />
            <circle cx="340" cy="70" r="12" stroke={`rgba(${a},0.2)`} strokeWidth="0.5" fill="none" />
          </svg>
          {/* Left pillar - thick stone */}
          <div className="absolute top-[30%] left-0 w-8 bottom-0" style={{
            background: `linear-gradient(90deg, ${fc}, ${fc}88)`,
            borderRight: `3px solid rgba(${a},0.2)`,
            boxShadow: `6px 0 16px rgba(0,0,0,0.3)`,
          }}>
            {/* Stone carving lines */}
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-3 h-[80%]" style={{ borderLeft: `1.5px solid rgba(${a},0.2)`, borderRight: `1.5px solid rgba(${a},0.2)` }} />
            {/* Jali lattice pattern */}
            <svg className="absolute top-[25%] left-0 w-full h-[50%] opacity-20" viewBox="0 0 30 100" fill="none">
              {Array.from({ length: 3 }).map((_, i) => (
                <polygon key={i} points={`15,${15 + i * 30} 25,${25 + i * 30} 15,${35 + i * 30} 5,${25 + i * 30}`} stroke={`rgba(${a},0.5)`} strokeWidth="0.5" fill="none" />
              ))}
            </svg>
          </div>
          {/* Right pillar */}
          <div className="absolute top-[30%] right-0 w-8 bottom-0" style={{
            background: `linear-gradient(270deg, ${fc}, ${fc}88)`,
            borderLeft: `3px solid rgba(${a},0.2)`,
            boxShadow: `-6px 0 16px rgba(0,0,0,0.3)`,
          }}>
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-3 h-[80%]" style={{ borderLeft: `1.5px solid rgba(${a},0.2)`, borderRight: `1.5px solid rgba(${a},0.2)` }} />
            <svg className="absolute top-[25%] left-0 w-full h-[50%] opacity-20" viewBox="0 0 30 100" fill="none">
              {Array.from({ length: 3 }).map((_, i) => (
                <polygon key={i} points={`15,${15 + i * 30} 25,${25 + i * 30} 15,${35 + i * 30} 5,${25 + i * 30}`} stroke={`rgba(${a},0.5)`} strokeWidth="0.5" fill="none" />
              ))}
            </svg>
          </div>
          {/* Bottom step */}
          <div className="absolute bottom-0 left-0 right-0 h-5" style={{
            background: `linear-gradient(0deg, ${fc}, ${fc}aa)`,
            borderTop: `2px solid rgba(${a},0.25)`,
          }} />
          {renderCornerAccents()}
        </div>
      )

    case 'painted-rosettes':
      // Painted frame with rosette corner blocks
      return (
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute top-0 left-0 right-0 h-6" style={{
            background: `linear-gradient(180deg, ${fc}, ${fc}cc)`,
            borderBottom: `2px solid rgba(${a},0.3)`,
            boxShadow: `0 3px 10px rgba(0,0,0,0.3), inset 0 -1px 3px rgba(${a},0.1)`,
          }}>
            {/* Top molding profile */}
            <div className="absolute bottom-0 left-0 right-0 h-2" style={{
              background: `linear-gradient(180deg, rgba(${a},0.08), transparent)`,
            }} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-5" style={{
            background: `linear-gradient(0deg, ${fc}, ${fc}bb)`,
            borderTop: `2px solid rgba(${a},0.3)`,
          }} />
          <div className="absolute top-6 left-0 w-6 bottom-5" style={{
            background: `linear-gradient(90deg, ${fc}, ${fc}99)`,
            borderRight: `2px solid rgba(${a},0.2)`,
            boxShadow: `3px 0 10px rgba(0,0,0,0.25)`,
          }}>
            {/* Simple molding */}
            <div className="absolute top-[20%] left-1 right-1 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
            <div className="absolute top-[50%] left-1 right-1 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
            <div className="absolute top-[80%] left-1 right-1 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
          </div>
          <div className="absolute top-6 right-0 w-6 bottom-5" style={{
            background: `linear-gradient(270deg, ${fc}, ${fc}99)`,
            borderLeft: `2px solid rgba(${a},0.2)`,
            boxShadow: `-3px 0 10px rgba(0,0,0,0.25)`,
          }}>
            <div className="absolute top-[20%] left-1 right-1 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
            <div className="absolute top-[50%] left-1 right-1 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
            <div className="absolute top-[80%] left-1 right-1 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
          </div>
          {/* Rosette corner blocks */}
          {[
            { top: '0', left: '0' },
            { top: '0', right: '0' },
            { bottom: '0', left: '0' },
            { bottom: '0', right: '0' },
          ].map((pos, i) => (
            <div key={i} className="absolute w-8 h-8 flex items-center justify-center" style={{ ...pos }}>
              {/* Rosette flower */}
              <div className="w-5 h-5 rounded-full" style={{
                border: `1.5px solid rgba(${a},0.35)`,
                boxShadow: `inset 0 0 4px rgba(${a},0.15)`,
              }}>
                <div className="w-full h-full rounded-full" style={{
                  background: `radial-gradient(circle, rgba(${a},0.2), transparent 60%)`,
                }} />
              </div>
            </div>
          ))}
        </div>
      )

    case 'ornate':
    default:
      // Ornate carved frame (original enhanced)
      return (
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute top-0 left-0 right-0 h-8" style={{
            background: `linear-gradient(180deg, ${fc}, ${fc}cc)`,
            borderBottom: `2px solid rgba(${a},0.3)`,
            boxShadow: `0 4px 12px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(${a},0.12)`,
          }}>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1/3 h-px" style={{ backgroundColor: `rgba(${a},0.25)` }} />
            <div className="absolute bottom-0 left-0 right-0 h-1" style={{
              background: `linear-gradient(180deg, rgba(${a},0.08), transparent)`,
            }} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-7" style={{
            background: `linear-gradient(0deg, ${fc}, ${fc}bb)`,
            borderTop: `2px solid rgba(${a},0.3)`,
            boxShadow: `0 -3px 10px rgba(0,0,0,0.3), inset 0 2px 4px rgba(${a},0.1)`,
          }}>
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1/4 h-px" style={{ backgroundColor: `rgba(${a},0.2)` }} />
          </div>
          <div className="absolute top-8 left-0 w-7 bottom-7" style={{
            background: `linear-gradient(90deg, ${fc}, ${fc}99)`,
            borderRight: `2px solid rgba(${a},0.25)`,
            boxShadow: `4px 0 12px rgba(0,0,0,0.3), inset -2px 0 4px rgba(${a},0.08)`,
          }}>
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-2 h-[70%]" style={{
              borderLeft: `1.5px solid rgba(${a},0.25)`,
              borderRight: `1.5px solid rgba(${a},0.25)`,
            }} />
            <div className="absolute top-[20%] left-1 w-5 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
            <div className="absolute top-[50%] left-1 w-5 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
            <div className="absolute top-[80%] left-1 w-5 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
          </div>
          <div className="absolute top-8 right-0 w-7 bottom-7" style={{
            background: `linear-gradient(270deg, ${fc}, ${fc}99)`,
            borderLeft: `2px solid rgba(${a},0.25)`,
            boxShadow: `-4px 0 12px rgba(0,0,0,0.3), inset 2px 0 4px rgba(${a},0.08)`,
          }}>
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-2 h-[70%]" style={{
              borderLeft: `1.5px solid rgba(${a},0.25)`,
              borderRight: `1.5px solid rgba(${a},0.25)`,
            }} />
            <div className="absolute top-[20%] right-1 w-5 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
            <div className="absolute top-[50%] right-1 w-5 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
            <div className="absolute top-[80%] right-1 w-5 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
          </div>
          {renderCornerAccents()}
          {/* Keystone at top center */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-8" style={{
            background: `linear-gradient(180deg, ${fc}, ${fc}aa)`,
            borderBottom: `2px solid rgba(${a},0.3)`,
            clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',
          }}>
            <div className="absolute inset-x-2 top-2 bottom-2 border" style={{ borderColor: `rgba(${a},0.2)`, borderRadius: '1px' }} />
          </div>
        </div>
      )
  }
}

/* ─── Light Leak Effect ─── */
function LightLeak({ accentRgb, doorsOpened }: { accentRgb: string; doorsOpened: boolean }) {
  if (!doorsOpened) return null
  return (
    <div className="absolute inset-0 pointer-events-none z-[2] flex items-center justify-center">
      {/* Central vertical light beam */}
      <div className="door-light-leak" style={{
        width: '40px',
        height: '100%',
        background: `linear-gradient(90deg,
          transparent 0%,
          rgba(${accentRgb},0.02) 15%,
          rgba(${accentRgb},0.08) 30%,
          rgba(255,245,200,0.12) 45%,
          rgba(255,250,220,0.18) 50%,
          rgba(255,245,200,0.12) 55%,
          rgba(${accentRgb},0.08) 70%,
          rgba(${accentRgb},0.02) 85%,
          transparent 100%
        )`,
      }} />
      {/* Wide ambient glow */}
      <div className="absolute inset-0 door-light-leak" style={{
        background: `radial-gradient(ellipse at center, rgba(${accentRgb},0.06) 0%, rgba(${accentRgb},0.02) 30%, transparent 60%)`,
        animationDelay: '0.3s',
      }} />
      {/* Light rays */}
      <div className="absolute inset-0 overflow-hidden">
        {[-30, -15, 0, 15, 30].map((angle, i) => (
          <div key={i} className="absolute door-light-leak" style={{
            left: '50%',
            top: '30%',
            width: '2px',
            height: '60%',
            background: `linear-gradient(180deg, rgba(255,250,220,0.15), transparent)`,
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transformOrigin: 'top center',
            animationDelay: `${0.2 + i * 0.1}s`,
          }} />
        ))}
      </div>
    </div>
  )
}

/* ─── Door SVG Pattern Component ─── */
function DoorSvgPattern({ pattern, accent, accentRgb }: { pattern: string; accent: string; accentRgb: string }) {
  const color = accent
  const faintColor = `rgba(${accentRgb}, 0.12)`
  const midColor = `rgba(${accentRgb}, 0.2)`

  if (pattern === 'arch') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 200 400" fill="none" preserveAspectRatio="none">
        <path d="M100 40 Q160 40 160 120 L160 360 M100 40 Q40 40 40 120 L40 360" stroke={color} strokeWidth="0.5" fill="none" />
        <path d="M100 60 Q140 60 140 120 L140 340 M100 60 Q60 60 60 120 L60 340" stroke={color} strokeWidth="0.3" fill="none" opacity="0.5" />
        <circle cx="100" cy="80" r="20" stroke={color} strokeWidth="0.5" fill="none" opacity="0.3" />
      </svg>
    )
  }

  if (pattern === 'floral') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 200 400" fill="none" preserveAspectRatio="none">
        <circle cx="100" cy="100" r="30" stroke={color} strokeWidth="0.5" fill="none" />
        <circle cx="100" cy="100" r="15" stroke={color} strokeWidth="0.3" fill={faintColor} />
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse key={angle} cx="100" cy="60" rx="8" ry="20" stroke={color} strokeWidth="0.4" fill="none" transform={`rotate(${angle} 100 100)`} />
        ))}
        <circle cx="100" cy="300" r="25" stroke={color} strokeWidth="0.5" fill="none" />
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={angle} cx="100" cy="270" rx="6" ry="16" stroke={color} strokeWidth="0.3" fill="none" transform={`rotate(${angle} 100 300)`} />
        ))}
      </svg>
    )
  }

  if (pattern === 'mandala') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 200 400" fill="none" preserveAspectRatio="none">
        {[20, 40, 60].map((r) => (
          <circle key={r} cx="100" cy="150" r={r} stroke={color} strokeWidth="0.4" fill="none" />
        ))}
        {[0, 30, 60, 90, 120, 150].map((angle) => (
          <line key={angle} x1="100" y1="150" x2={100 + 60 * Math.cos((angle * Math.PI) / 180)} y2={150 + 60 * Math.sin((angle * Math.PI) / 180)} stroke={color} strokeWidth="0.3" />
        ))}
        {[20, 40, 60].map((r) => (
          <circle key={`b${r}`} cx="100" cy="280" r={r} stroke={color} strokeWidth="0.4" fill="none" />
        ))}
      </svg>
    )
  }

  if (pattern === 'paisley') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 200 400" fill="none" preserveAspectRatio="none">
        <path d="M80 80 Q60 140 80 200 Q100 260 80 320" stroke={color} strokeWidth="0.5" fill="none" />
        <path d="M120 80 Q140 140 120 200 Q100 260 120 320" stroke={color} strokeWidth="0.5" fill="none" />
        <circle cx="80" cy="80" r="15" stroke={color} strokeWidth="0.4" fill={faintColor} />
        <circle cx="120" cy="80" r="15" stroke={color} strokeWidth="0.4" fill={faintColor} />
      </svg>
    )
  }

  if (pattern === 'minimal') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-15" viewBox="0 0 200 400" fill="none" preserveAspectRatio="none">
        <line x1="60" y1="80" x2="140" y2="80" stroke={color} strokeWidth="0.5" />
        <line x1="60" y1="320" x2="140" y2="320" stroke={color} strokeWidth="0.5" />
        <rect x="80" y="160" width="40" height="80" rx="2" stroke={color} strokeWidth="0.4" fill="none" />
      </svg>
    )
  }

  if (pattern === 'diamond') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 200 400" fill="none" preserveAspectRatio="none">
        <rect x="70" y="100" width="60" height="60" transform="rotate(45 100 130)" stroke={color} strokeWidth="0.5" fill="none" />
        <rect x="80" y="230" width="40" height="40" transform="rotate(45 100 250)" stroke={color} strokeWidth="0.4" fill={faintColor} />
        <line x1="100" y1="70" x2="100" y2="330" stroke={color} strokeWidth="0.2" opacity="0.5" />
      </svg>
    )
  }

  if (pattern === 'star') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 200 400" fill="none" preserveAspectRatio="none">
        <polygon points="100,70 115,120 170,120 125,150 140,200 100,170 60,200 75,150 30,120 85,120" stroke={color} strokeWidth="0.5" fill="none" />
        <polygon points="100,230 112,265 150,265 120,285 132,320 100,298 68,320 80,285 50,265 88,265" stroke={color} strokeWidth="0.4" fill={faintColor} />
      </svg>
    )
  }

  if (pattern === 'dome') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 200 400" fill="none" preserveAspectRatio="none">
        <path d="M40 200 Q100 60 160 200" stroke={color} strokeWidth="0.6" fill="none" />
        <path d="M50 200 Q100 80 150 200" stroke={color} strokeWidth="0.3" fill={faintColor} />
        <line x1="100" y1="60" x2="100" y2="30" stroke={color} strokeWidth="0.5" />
        <circle cx="100" cy="25" r="5" stroke={color} strokeWidth="0.5" fill={midColor} />
      </svg>
    )
  }

  // Default: geometric/lantern
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 200 400" fill="none" preserveAspectRatio="none">
      <polygon points="100,80 130,120 130,180 100,200 70,180 70,120" stroke={color} strokeWidth="0.5" fill="none" />
      <polygon points="100,220 120,250 120,300 100,320 80,300 80,250" stroke={color} strokeWidth="0.4" fill={faintColor} />
    </svg>
  )
}

/* ─── Door Overlay Component ─── */
function DoorOverlay({ theme, doorsOpened, onOpen }: { theme: TemplateTheme; doorsOpened: boolean; onOpen: () => void }) {
  const ds = theme.doorStyle

  const anim = doorsOpened
    ? { left: 'door-open-left', right: 'door-open-right' }
    : { left: '', right: '' }

  const idleClass = 'door-breathe-idle'

  // Get panel gradient based on material
  const getPanelGradient = (isLeft: boolean): string => {
    if (ds.doorMaterial === 'glass') {
      return isLeft
        ? `linear-gradient(90deg, ${theme.bgDoor} 0%, ${theme.bgSecondary} 100%)`
        : `linear-gradient(270deg, ${theme.bgDoor} 0%, ${theme.bgSecondary} 100%)`
    }
    if (ds.doorMaterial === 'stone') {
      return `linear-gradient(180deg, ${theme.bgDoor} 0%, ${theme.bgSecondary} 60%, ${theme.bgDoor} 100%)`
    }
    return isLeft ? theme.bgDoorGradient : theme.bgDoorGradient.replace('135deg', '225deg')
  }

  // Edge color for 3D door thickness
  const edgeColor = ds.doorMaterial === 'stone' ? theme.bgSecondary : theme.accentDark
  const edgeWidth = 18

  // Render 3D edge face (door thickness)
  const renderEdgeFace = (side: 'left' | 'right') => {
    const edgeStyle: React.CSSProperties = side === 'left'
      ? {
          position: 'absolute',
          top: 0,
          right: `-${edgeWidth}px`,
          width: `${edgeWidth}px`,
          height: '100%',
          background: `linear-gradient(90deg, ${edgeColor}, ${theme.bgDoor}aa)`,
          transform: 'rotateY(90deg)',
          transformOrigin: 'left center',
          boxShadow: `3px 0 8px rgba(0,0,0,0.4), inset 0 0 3px rgba(0,0,0,0.15)`,
          borderLeft: `1px solid rgba(${theme.accentRgb},0.15)`,
          borderRight: `1px solid rgba(0,0,0,0.2)`,
        }
      : {
          position: 'absolute',
          top: 0,
          left: `-${edgeWidth}px`,
          width: `${edgeWidth}px`,
          height: '100%',
          background: `linear-gradient(270deg, ${edgeColor}, ${theme.bgDoor}aa)`,
          transform: 'rotateY(-90deg)',
          transformOrigin: 'right center',
          boxShadow: `-3px 0 8px rgba(0,0,0,0.4), inset 0 0 3px rgba(0,0,0,0.15)`,
          borderRight: `1px solid rgba(${theme.accentRgb},0.15)`,
          borderLeft: `1px solid rgba(0,0,0,0.2)`,
        }
    return (
      <div style={edgeStyle}>
        {/* Edge grain lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 12px, rgba(${theme.accentRgb},0.08) 12px, rgba(${theme.accentRgb},0.08) 13px)`,
        }} />
        {/* Light highlight on inner edge */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(${side === 'left' ? '270deg' : '90deg'}, rgba(${theme.accentRgb},0.12), transparent 60%)`,
        }} />
      </div>
    )
  }

  return (
    <>
      {/* Background behind doors */}
      <div className="absolute inset-0" style={{ backgroundColor: theme.bgSecondary }}>
        {!doorsOpened && (
          <div className="absolute inset-0 animate-door-glow">
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, rgba(${theme.accentRgb},0.1) 0%, rgba(${theme.accentRgb},0.04) 40%, transparent 70%)` }} />
          </div>
        )}
        {doorsOpened && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }} className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, rgba(${theme.accentRgb},0.18) 0%, rgba(${theme.accentRgb},0.06) 40%, transparent 70%)` }} />
        )}
      </div>

      {/* Light leak effect - between doors */}
      <LightLeak accentRgb={theme.accentRgb} doorsOpened={doorsOpened} />

      {/* Door Frame - visible behind the doors */}
      <div className={doorsOpened ? 'door-frame-shadow' : ''} style={doorsOpened ? { transition: 'opacity 2s ease-out' } : {}}>
        <DoorFrame theme={theme} />
      </div>

      {/* Left Panel */}
      <div
        className={`absolute top-0 left-0 w-1/2 h-full ${anim.left} ${!doorsOpened ? idleClass : ''}`}
        style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
      >
        {/* Front face of door */}
        <div className="relative w-full h-full border-r overflow-hidden"
          style={{
            background: getPanelGradient(true),
            borderColor: theme.borderSubtle,
            backfaceVisibility: 'hidden',
          }}
        >
          <DoorSurface theme={theme} />
          <div className="absolute inset-0 door-shimmer" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, transparent, rgba(${theme.accentRgb},0.05))` }} />
          {/* Panel layout */}
          <DoorPanelLayout theme={theme} side="left" />
          <DoorPanelContent theme={theme} text={ds.leftText} textLang={ds.leftTextLang} />
          <DoorHandle theme={theme} side="left" />
          {/* Hinges on hinge side (left) */}
          <DoorHinges side="left" accent={theme.accent} accentRgb={theme.accentRgb} />
        </div>
        {/* 3D Edge face (door thickness) */}
        {renderEdgeFace('left')}
      </div>

      {/* Right Panel */}
      <div
        className={`absolute top-0 right-0 w-1/2 h-full ${anim.right} ${!doorsOpened ? idleClass : ''}`}
        style={{ transformOrigin: 'right center', transformStyle: 'preserve-3d' }}
      >
        {/* Front face of door */}
        <div className="relative w-full h-full border-l overflow-hidden"
          style={{
            background: getPanelGradient(false),
            borderColor: theme.borderSubtle,
            backfaceVisibility: 'hidden',
          }}
        >
          <DoorSurface theme={theme} />
          <div className="absolute inset-0 door-shimmer" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to left, transparent, rgba(${theme.accentRgb},0.05))` }} />
          {/* Panel layout */}
          <DoorPanelLayout theme={theme} side="right" />
          <DoorPanelContent theme={theme} text={ds.rightText} textLang={ds.rightTextLang} />
          <DoorHandle theme={theme} side="right" />
          {/* Hinges on hinge side (right) */}
          <DoorHinges side="right" accent={theme.accent} accentRgb={theme.accentRgb} />
        </div>
        {/* 3D Edge face (door thickness) */}
        {renderEdgeFace('right')}
      </div>

      {/* Center tap-to-open button */}
      {!doorsOpened && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <CenterButton theme={theme} onClick={onOpen} />
        </motion.div>
      )}
    </>
  )
}

/* ─── Main Invitation Viewer ─── */
export default function InvitationViewer({ templateId, flowData }: InvitationViewerProps) {
  const theme = useMemo(() => getTheme(templateId), [templateId])

  // Use flowData for dynamic content, fall back to demo defaults
  const partner1 = flowData?.partner1Name?.trim() || 'Ahmed'
  const partner2 = flowData?.partner2Name?.trim() || 'Fatima'
  const venueName = flowData?.venue?.trim() || 'The Grand Pearl Hall'
  const venueAddress = flowData?.venueAddress?.trim() || 'Main Boulevard, Gulberg, Lahore'
  const welcomeMsg = flowData?.welcomeMessage?.trim() || "With hearts full of love and joy, we warmly invite you to share in the celebration of our union. Your presence would mean the world to us as we begin this beautiful journey together."

  const dynamicEvents = useMemo(() => {
    if (flowData?.events && flowData.events.some(e => e.date || e.time)) {
      return flowData.events.filter(e => e.name).map(e => ({
        name: e.name,
        time: e.time || 'TBD',
        date: e.date || 'TBD',
        description: e.venue ? `At ${e.venue}` : `Join us for the ${e.name} celebration.`,
      }))
    }
    // Default demo events
    return [
      { name: 'Mehndi', time: '6:00 PM', date: 'March 14, 2027', description: 'A night of colors, henna, and celebration with traditional music and dance.' },
      { name: 'Baraat', time: '7:00 PM', date: 'March 15, 2027', description: 'The grand wedding procession — dhol beats, dancing, and joyful arrival.' },
      { name: 'Nikkah', time: '7:30 PM', date: 'March 15, 2027', description: 'The sacred Islamic marriage ceremony — the signing of the Nikkah Nama.' },
      { name: 'Walima', time: '8:00 PM', date: 'March 16, 2027', description: 'The wedding reception hosted by the groom — feast, blessings, and joy.' },
    ]
  }, [flowData?.events])

  const [doorsOpened, setDoorsOpened] = useState(false)
  const [scratchRevealed, setScratchRevealed] = useState(false)
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)
  const [doorOverlayVisible, setDoorOverlayVisible] = useState(true)
  const [rsvpName, setRsvpName] = useState('')
  const [rsvpEmail, setRsvpEmail] = useState('')
  const [rsvpStatus, setRsvpStatus] = useState<'accept' | 'decline' | null>(null)
  const [wishName, setWishName] = useState('')
  const [wishMessage, setWishMessage] = useState('')
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [language, setLanguage] = useState<'en' | 'ur'>('en')
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isTranslating, setIsTranslating] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [rsvpHearts, setRsvpHearts] = useState<number[]>([])
  const [heroVisible, setHeroVisible] = useState(false)
  const [wishes, setWishes] = useState([
    { name: 'Ayesha Khan', message: 'May Allah bless your union with endless love and happiness! 🤲' },
    { name: 'Omar Farooq', message: 'Wishing you a lifetime of joy and togetherness! 💒' },
    { name: 'Zainab Malik', message: 'MashaAllah! May your journey be filled with blessings! ✨' },
  ])

  const handleDoorOpen = useCallback(() => {
    if (doorsOpened) return
    setDoorsOpened(true)
    setShowFireworks(true)
    setTimeout(() => setShowFireworks(false), 5000)
    setTimeout(() => setDoorOverlayVisible(false), 2200)
    setTimeout(() => setHeroVisible(true), 1800)
  }, [doorsOpened])

  const handleRSVP = useCallback((status: 'accept' | 'decline') => {
    if (!rsvpName.trim()) { toast.error('Please enter your name'); return }
    setRsvpStatus(status)
    setRsvpSubmitted(true)
    if (status === 'accept') {
      toast.success(`Joyfully accepted! We can't wait to see you, ${rsvpName}! 🎉`)
      setShowConfetti(true)
      setRsvpHearts([1, 2, 3, 4, 5])
      setTimeout(() => setRsvpHearts([]), 3000)
      setTimeout(() => setShowConfetti(false), 4000)
    } else {
      toast.success(`Thank you for letting us know, ${rsvpName}. You'll be missed! 💌`)
    }
  }, [rsvpName])

  const handleSendWish = useCallback(() => {
    if (!wishName.trim()) { toast.error('Please enter your name'); return }
    if (!wishMessage.trim()) { toast.error('Please write a blessing or wish'); return }
    setWishes((prev) => [{ name: wishName.trim(), message: wishMessage.trim() }, ...prev])
    setWishName('')
    setWishMessage('')
    toast.success('Your blessing has been sent! 💝')
  }, [wishName, wishMessage])

  const handleScratchReveal = useCallback(() => {
    setScratchRevealed(true)
    setShowFireworks(true)
    setTimeout(() => setShowFireworks(false), 5000)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 4500)
  }, [])

  const events = dynamicEvents

  // Static Urdu translations for known strings (instant, reliable)
  const URDU_DICT: Record<string, string> = {
    gettingMarried: 'ہم شادی کر رہے ہیں',
    requestHonour: 'آپ کی موجودگی کی عزت کی درخواست ہے',
    scratchReveal: 'دعوت نامہ دیکھنے کے لیے',
    scratchHere: 'ظاہر کرنے کے لیے کھرچیں',
    youreInvited: 'آپ مدعو ہیں!',
    sunday: 'اتوار',
    pkt: 'پاکستانی وقت',
    ourMoments: 'ہماری یادگاریں',
    countingDown: 'ہمیشہ کی طرف گنتی',
    days: 'دن',
    hours: 'گھنٹے',
    minutes: 'منٹ',
    seconds: 'سیکنڈ',
    programTimeline: 'پروگرام کی ٹائم لائن',
    venue: 'مقام',
    viewOnMaps: 'گوگل میپ پر دیکھیں',
    willYouAttend: 'کیا آپ تشریف لائیں گے؟',
    yourName: 'آپ کا نام',
    enterName: 'اپنا پورا نام لکھیں',
    email: 'ای میل',
    emailOptional: '(اختیاری)',
    willYouBeAttending: 'کیا آپ شرکت کریں گے؟',
    selectOption: 'منتخب کریں...',
    acceptYes: 'جی ہاں، میں آ رہا ہوں! 🎉',
    declineSorry: 'معذرت، میں نہیں آ سکتا 💌',
    joyfullyAccept: 'خوشی سے قبول',
    respectfullyDecline: 'باادب معذرت',
    joyfullyAccepted: 'خوشی سے قبول کر لیا!',
    thankYou: 'شکریہ!',
    blessingsWishes: 'دعائیں اور آرزوئیں',
    writeBlessing: 'اپنی دعا یا آرزو لکھیں...',
    yourNameSender: 'آپ کا نام (تاکہ وہ جان سکیں کہ کس نے بھیجا)',
    madeWithLove: 'شادی لنک کی طرف سے محبت سے بنایا گیا',
    scroll: 'سکرول',
    tapToOpen: 'کھولنے کے لیے ٹچ کریں',
    mehndiDesc: 'رنگوں، مہندی اور روایتی موسیقی و رقص کی شام',
    baraatDesc: 'شادی کا شان دار جلوس — ڈھول کی تھاپ، رقص اور خوش آمدید',
    nikkahDesc: 'مقدس اسلامی شادی کی تقریب — نکاح نامہ کی دستخط',
    walimaDesc: 'دولہا کی طرف سے ولیمہ — ضیافت، دعائیں اور خوشیاں',
    welcomeMsg: 'محبت اور خوشی سے بھرے دلوں کے ساتھ، ہم آپ کو اپنے اتحاد کی تقریب میں شریک ہونے کی دعوت دیتے ہیں۔ ہماری اس خوبصورت سفری شروعات میں آپ کی موجودگی ہمارے لیے سب کچھ ہوگی۔',
    at: 'پر',
    joinUs: 'میں شامل ہوں',
    celebration: 'تقریب',
  }

  // Translation function - uses static dictionary first, then AI for dynamic content
  const translateToUrdu = useCallback(async () => {
    if (language !== 'ur' || Object.keys(translations).length > 0) return

    // Immediately set static translations (instant)
    setTranslations(URDU_DICT)

    // For any dynamic content that needs AI translation, add it here
    // For now, static dictionary covers all known strings
    setIsTranslating(false)
  }, [language, translations])

  // Trigger translation when language switches to Urdu
  useEffect(() => {
    if (language === 'ur' && Object.keys(translations).length === 0) {
      translateToUrdu()
    }
  }, [language, translations, translateToUrdu])

  // Helper to get translated text
  const t = useCallback((key: string, fallback: string): string => {
    if (language === 'en') return fallback
    return translations[key] || fallback
  }, [language, translations])

  // Get translated event description
  const getEventDescription = useCallback((eventName: string, originalDesc: string): string => {
    if (language === 'en') return originalDesc
    const keyMap: Record<string, string> = {
      'Mehndi': 'mehndiDesc',
      'Baraat': 'baraatDesc',
      'Nikkah': 'nikkahDesc',
      'Walima': 'walimaDesc',
    }
    const key = keyMap[eventName]
    if (key && translations[key]) return translations[key]
    return originalDesc
  }, [language, translations])

  // Get translated welcome message
  const translatedWelcomeMsg = language === 'ur' && translations.welcomeMsg ? translations.welcomeMsg : welcomeMsg

  return (
    <div className="relative min-h-screen overflow-x-hidden" dir={language === 'ur' ? 'rtl' : 'ltr'} style={{ backgroundColor: theme.bgPrimary, color: theme.textPrimary }}>
      <BackgroundParticles accentColor={theme.accent} />

      {/* ═══ Door Opening Overlay ═══ */}
      <AnimatePresence>
        {doorOverlayVisible && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="fixed inset-0 z-50"
            style={{ perspective: ['classic-doors', 'archway', 'lantern'].includes(theme.doorStyle.type) ? '1600px' : undefined }}
          >
            <DoorOverlay theme={theme} doorsOpened={doorsOpened} onOpen={handleDoorOpen} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fireworks */}
      <FireworksDisplay show={showFireworks} colors={theme.fireworkColors} />
      <ConfettiDisplay show={showConfetti} colors={theme.confettiColors} />

      {/* Music toggle */}
      <div className="fixed top-4 right-4 z-[200] flex items-center gap-2">
        <button
          onClick={() => {
            const newLang = language === 'en' ? 'ur' : 'en'
            setLanguage(newLang)
          }}
          className="w-10 h-10 rounded-full border backdrop-blur-sm flex items-center justify-center transition-all duration-300 text-xs font-bold relative"
          style={{ backgroundColor: theme.bgPrimary + 'cc', borderColor: theme.borderSubtle, color: `rgba(${theme.accentRgb},0.7)` }}
          aria-label="Toggle language"
          disabled={isTranslating}
        >
          {isTranslating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            language === 'en' ? 'اردو' : 'EN'
          )}
        </button>
        <MusicToggle isPlaying={musicPlaying} onToggle={() => setMusicPlaying(!musicPlaying)} theme={theme} />
      </div>

      {/* ═══ Main Content ═══ */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: heroVisible ? 1 : 0 }} transition={{ duration: 1.5, ease: 'easeOut' }}>

        {/* ─── Hero Section ─── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0" style={{ backgroundColor: theme.bgPrimary }}>
            <div className="absolute inset-0" style={{ background: `radial-gradient(at 50% 40%, rgba(${theme.accentRgb},0.06), transparent 60%)` }} />
          </div>
          {/* Corner ornaments */}
          <CornerOrnament position="tl" accentColor={theme.accent} />
          <CornerOrnament position="tr" accentColor={theme.accent} />
          <CornerOrnament position="bl" accentColor={theme.accent} />
          <CornerOrnament position="br" accentColor={theme.accent} />
          {/* Top gold line */}
          <div className="absolute top-16 md:top-20 left-1/2 -translate-x-1/2 w-64 md:w-80 z-10">
            <GoldDivider accentColor={theme.accent} />
          </div>

          <div className="relative z-10 max-w-lg text-center">
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-calligraphy text-sm sm:text-base tracking-[0.4em] uppercase mb-8"
              style={{ color: theme.textSecondary }}
            >
              {t('gettingMarried', "We're getting married")}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-[0.08em] mb-2"
              style={{ color: theme.textPrimary }}
            >
              {partner1}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex items-center justify-center gap-6 my-5"
            >
              <div className="w-20 h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.accentDark})` }} />
              <div className="w-3 h-3 rotate-45 border" style={{ borderColor: theme.accentDark }} />
              <div className="w-20 h-px" style={{ background: `linear-gradient(270deg, transparent, ${theme.accentDark})` }} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-[0.08em] mb-8"
              style={{ color: theme.textPrimary }}
            >
              {partner2}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="w-8 h-px" style={{ background: theme.textMuted }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accentDark }} />
              <div className="w-8 h-px" style={{ background: theme.textMuted }} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="font-calligraphy text-base sm:text-lg tracking-[0.15em]"
              style={{ color: theme.textSecondary }}
            >
              {t('requestHonour', 'Request the honour of your presence')}
            </motion.p>
          </div>

          {/* Bottom gold line */}
          <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 w-64 md:w-80 z-10">
            <GoldDivider accentColor={theme.accent} />
          </div>

          {/* Scroll indicator */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="absolute bottom-8 flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>{t('scroll', 'Scroll')}</span>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
              <ChevronDown className="w-4 h-4" style={{ color: theme.textMuted }} />
            </motion.div>
          </motion.div>
        </section>

        {/* ─── Message / Quote Section ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="max-w-lg mx-auto text-center">
              <WaveDivider accentColor={theme.accent} />
              <p className="font-calligraphy text-xl md:text-2xl leading-relaxed italic whitespace-pre-wrap break-words my-8" style={{ color: theme.accentLight, textShadow: `0 0 15px rgba(${theme.accentRgb},0.2)` }}>
                {translatedWelcomeMsg}
              </p>
              <WaveDivider accentColor={theme.accent} />
            </div>
          </section>
        </RevealSection>

        {/* ─── Scratch to Reveal ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <ScratchCard revealed={scratchRevealed} onReveal={handleScratchReveal} theme={theme} />
          </section>
        </RevealSection>

        {/* ─── Photo Gallery ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-6">
              <h2 className="font-calligraphy text-3xl sm:text-4xl text-center" style={{ color: theme.accent }}>{t('ourMoments', 'Our Moments')}</h2>
              <HeartDivider accentColor={theme.accent} />
              <PhotoGallery theme={theme} />
            </div>
          </section>
        </RevealSection>

        {/* ─── Countdown Timer ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-8">
              <h2 className="font-calligraphy text-3xl sm:text-4xl text-center" style={{ color: theme.accent }}>{t('countingDown', 'Counting Down to Forever')}</h2>
              <HeartDivider accentColor={theme.accent} />
              <CountdownTimer theme={theme} translations={language === 'ur' ? translations : undefined} />
            </div>
          </section>
        </RevealSection>

        {/* ─── Event Timeline ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
              <h2 className="font-calligraphy text-3xl sm:text-4xl text-center" style={{ color: theme.accent }}>{t('programTimeline', 'Program Timeline')}</h2>
              <HeartDivider accentColor={theme.accent} />

              <div className="relative w-full">
                <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: `linear-gradient(to bottom, rgba(${theme.accentRgb},0.4), rgba(${theme.accentRgb},0.2), rgba(${theme.accentRgb},0.4))` }} />
                <div className="flex flex-col gap-8">
                  {events.map((event, idx) => (
                    <RevealSection key={event.name} delay={idx * 0.12}>
                      <div className="flex gap-5 items-start">
                        <div className="relative z-10 flex-shrink-0">
                          <div className="w-[10px] h-[10px] rounded-full mt-1.5" style={{ backgroundColor: theme.accent, boxShadow: `0 0 8px rgba(${theme.accentRgb},0.5)` }} />
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-3.5 h-3.5" style={{ color: `rgba(${theme.accentRgb},0.5)` }} />
                            <span className="text-xs" style={{ color: `rgba(${theme.accentRgb},0.5)` }}>{event.date}</span>
                            <Clock className="w-3.5 h-3.5 ml-2" style={{ color: `rgba(${theme.accentRgb},0.5)` }} />
                            <span className="text-xs" style={{ color: `rgba(${theme.accentRgb},0.5)` }}>{event.time}</span>
                          </div>
                          <h3 className="font-display text-xl font-semibold mb-1" style={{ color: theme.accent }}>{event.name}</h3>
                          <p className="text-sm leading-relaxed" style={{ color: `rgba(${theme.accentRgb},0.5)` }}>{getEventDescription(event.name, event.description)}</p>
                        </div>
                      </div>
                    </RevealSection>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ─── Venue ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
              <h2 className="font-calligraphy text-3xl sm:text-4xl text-center flex items-center gap-3" style={{ color: theme.accent }}>
                <MapPin className="w-7 h-7" style={{ color: `rgba(${theme.accentRgb},0.7)` }} />
                {t('venue', 'Venue')}
              </h2>
              <HeartDivider accentColor={theme.accent} />

              {/* Venue illustration */}
              <svg viewBox="0 0 200 140" fill="none" className="w-40 h-28 mx-auto opacity-50">
                <rect x="40" y="50" width="120" height="70" fill={theme.accent} opacity="0.15" stroke={theme.accent} strokeWidth="0.8" />
                <path d="M30 55 L100 20 L170 55" fill="none" stroke={theme.accent} strokeWidth="1" opacity="0.6" />
                <path d="M35 52 L100 25 L165 52" fill={theme.accent} opacity="0.08" />
                <rect x="82" y="80" width="36" height="40" rx="18" fill={theme.accent} opacity="0.1" stroke={theme.accent} strokeWidth="0.5" />
                <circle cx="113" cy="100" r="2" fill={theme.accent} opacity="0.4" />
                <rect x="52" y="65" width="20" height="20" rx="2" fill={theme.accent} opacity="0.08" stroke={theme.accent} strokeWidth="0.5" />
                <rect x="128" y="65" width="20" height="20" rx="2" fill={theme.accent} opacity="0.08" stroke={theme.accent} strokeWidth="0.5" />
                <line x1="20" y1="120" x2="180" y2="120" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" />
              </svg>

              <div className="text-center space-y-2">
                <h3 className="font-display text-2xl" style={{ color: theme.accent }}>{venueName}</h3>
                <p className="text-sm" style={{ color: `rgba(${theme.accentRgb},0.6)` }}>{venueAddress}</p>
              </div>

              <Button
                asChild
                className="border rounded-lg px-6 py-2.5 h-auto font-display transition-all duration-300"
                style={{ backgroundColor: `rgba(${theme.accentRgb},0.1)`, borderColor: theme.borderSubtle, color: theme.accent }}
                variant="outline"
              >
                <a href={`https://maps.google.com/?q=${encodeURIComponent(venueAddress)}`} target="_blank" rel="noopener noreferrer">
                  <MapPin className="w-4 h-4 mr-2" />
                  {t('viewOnMaps', 'View on Google Maps')}
                </a>
              </Button>
            </div>
          </section>
        </RevealSection>

        {/* ─── RSVP ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
              <h2 className="font-calligraphy text-3xl sm:text-4xl text-center" style={{ color: theme.accent }}>{t('willYouAttend', 'Will You Attend?')}</h2>
              <HeartDivider accentColor={theme.accent} />

              <div className="relative w-full">
                {/* Decorative corner borders */}
                <div className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: theme.borderSubtle }} />
                <div className="absolute -top-3 -right-3 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: theme.borderSubtle }} />
                <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: theme.borderSubtle }} />
                <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: theme.borderSubtle }} />

                {/* Floating hearts on RSVP accept */}
                {rsvpHearts.map((h) => (
                  <div key={h} className="absolute heart-float pointer-events-none" style={{ left: `${20 + Math.random() * 60}%`, top: '40%', animationDelay: `${h * 0.15}s` }}>
                    <Heart className="w-5 h-5" style={{ color: theme.accent, fill: `rgba(${theme.accentRgb},0.4)` }} />
                  </div>
                ))}

                {!rsvpSubmitted ? (
                  <Card className="w-full backdrop-blur-sm" style={{ backgroundColor: theme.bgPrimary + 'cc', borderColor: theme.borderSubtle }}>
                    <CardContent className="flex flex-col gap-5 pt-6">
                      <div className="space-y-2">
                        <label className="text-sm font-display" style={{ color: `rgba(${theme.accentRgb},0.7)` }}>{t('yourName', 'Your Name')}</label>
                        <Input
                          value={rsvpName}
                          onChange={(e) => setRsvpName(e.target.value)}
                          placeholder={t('enterName', 'Enter your full name')}
                          className="border transition-all duration-300"
                          style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle, color: theme.textPrimary }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-display" style={{ color: `rgba(${theme.accentRgb},0.7)` }}>{t('email', 'Email')} <span style={{ color: `rgba(${theme.accentRgb},0.3)` }}>{t('emailOptional', '(optional)')}</span></label>
                        <Input
                          type="email"
                          value={rsvpEmail}
                          onChange={(e) => setRsvpEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="border transition-all duration-300"
                          style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle, color: theme.textPrimary }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-display" style={{ color: `rgba(${theme.accentRgb},0.7)` }}>{t('willYouBeAttending', 'Will you be attending?')}</label>
                        <select
                          value={rsvpStatus || ''}
                          onChange={(e) => setRsvpStatus(e.target.value as 'accept' | 'decline' | null || null)}
                          className="w-full h-11 rounded-lg border text-sm px-3 focus:outline-none transition-all duration-300 appearance-none cursor-pointer"
                          style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle, color: theme.textPrimary, backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='${encodeURIComponent(theme.accentDark)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                        >
                          <option value="" style={{ backgroundColor: theme.bgSecondary }}>{t('selectOption', 'Select...')}</option>
                          <option value="accept" style={{ backgroundColor: theme.bgSecondary, color: theme.textPrimary }}>{t('acceptYes', "Yes, I'll be there! 🎉")}</option>
                          <option value="decline" style={{ backgroundColor: theme.bgSecondary, color: theme.textPrimary }}>{t('declineSorry', "Sorry, I can't make it 💌")}</option>
                        </select>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button 
                          onClick={() => handleRSVP('accept')} 
                          className="flex-1 text-white border rounded-lg h-11 font-display green-glow transition-all duration-300 hover:scale-[1.02]"
                          style={{ backgroundColor: `rgba(${theme.accentRgb},0.8)`, borderColor: theme.borderSubtle }}
                        >
                          <Check className="w-4 h-4 mr-1.5" />
                          {t('joyfullyAccept', 'Joyfully Accept')}
                        </Button>
                        <Button 
                          onClick={() => handleRSVP('decline')} 
                          className="flex-1 border rounded-lg h-11 font-display transition-all duration-300" 
                          style={{ backgroundColor: 'transparent', borderColor: theme.borderSubtle, color: `rgba(${theme.accentRgb},0.7)` }}
                          variant="outline"
                        >
                          <X className="w-4 h-4 mr-1.5" />
                          {t('respectfullyDecline', 'Respectfully Decline')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="text-center py-10">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 300 }} className="mb-4">
                      {rsvpStatus === 'accept' ? (
                        <div className="w-16 h-16 rounded-full border flex items-center justify-center mx-auto" style={{ backgroundColor: `rgba(${theme.accentRgb},0.2)`, borderColor: `rgba(${theme.accentRgb},0.4)` }}>
                          <Check className="w-8 h-8" style={{ color: theme.accent }} />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full border flex items-center justify-center mx-auto" style={{ backgroundColor: `rgba(${theme.accentRgb},0.1)`, borderColor: theme.borderSubtle }}>
                          <Heart className="w-8 h-8" style={{ color: theme.accent }} />
                        </div>
                      )}
                    </motion.div>
                    <h3 className="font-display text-xl mb-2" style={{ color: theme.accent }}>
                      {rsvpStatus === 'accept' ? t('joyfullyAccepted', 'Joyfully Accepted!') : t('thankYou', 'Thank You!')}
                    </h3>
                    <p className="text-sm" style={{ color: `rgba(${theme.accentRgb},0.6)` }}>
                      {rsvpStatus === 'accept'
                        ? `We can't wait to celebrate with you, ${rsvpName}! 🎉`
                        : `We'll miss you, ${rsvpName}. You'll be in our hearts! 💌`}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ─── Blessings & Wishes ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
              <h2 className="font-calligraphy text-3xl sm:text-4xl text-center" style={{ color: theme.accent }}>{t('blessingsWishes', 'Blessings & Wishes')}</h2>
              <HeartDivider accentColor={theme.accent} />

              <div className="w-full space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {wishes.map((wish, idx) => (
                  <motion.div
                    key={`${wish.name}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border rounded-lg p-4"
                    style={{ backgroundColor: `rgba(${theme.accentRgb},0.05)`, borderColor: `rgba(${theme.accentRgb},0.15)` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `linear-gradient(to bottom right, rgba(${theme.accentRgb},0.3), rgba(${theme.accentRgb},0.1))`, borderColor: theme.borderSubtle }}>
                        <span className="text-xs font-bold" style={{ color: theme.accent }}>{wish.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-display mb-1" style={{ color: `rgba(${theme.accentRgb},0.7)` }}>{wish.name}</p>
                        <p className="text-sm leading-relaxed" style={{ color: `rgba(${theme.accentRgb},0.8)` }}>{wish.message}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="w-full space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `rgba(${theme.accentRgb},0.1)`, borderColor: theme.borderSubtle }}>
                    <User className="w-3.5 h-3.5" style={{ color: `rgba(${theme.accentRgb},0.5)` }} />
                  </div>
                  <Input
                    value={wishName}
                    onChange={(e) => setWishName(e.target.value)}
                    placeholder={t('yourNameSender', 'Your name (so they know who sent this)')}
                    className="border h-10 transition-all duration-300 flex-1"
                    style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle, color: theme.textPrimary }}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Textarea
                      value={wishMessage}
                      onChange={(e) => setWishMessage(e.target.value)}
                      placeholder={t('writeBlessing', 'Write your blessing or wish...')}
                      className="border min-h-[44px] resize-none transition-all duration-300 w-full"
                      style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle, color: theme.textPrimary }}
                      rows={2}
                    />
                  </div>
                  <Button onClick={handleSendWish} className="border h-auto px-4 rounded-lg font-display transition-all duration-300 flex-shrink-0 self-end" style={{ backgroundColor: `rgba(${theme.accentRgb},0.2)`, borderColor: theme.borderSubtle, color: theme.accent }}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ─── Footer ─── */}
        <div className="py-10 text-center border-t" style={{ borderColor: `rgba(${theme.accentRgb},0.1)` }}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-px" style={{ backgroundColor: `rgba(${theme.accentRgb},0.2)` }} />
            <Heart className="w-3 h-3" style={{ color: `rgba(${theme.accentRgb},0.3)` }} />
            <div className="w-8 h-px" style={{ backgroundColor: `rgba(${theme.accentRgb},0.2)` }} />
          </div>
          <p className="text-xs tracking-wider" style={{ color: `rgba(${theme.accentRgb},0.3)` }}>{t('madeWithLove', 'Made with love by ShaadiLink')}</p>
        </div>
      </motion.div>
    </div>
  )
}
