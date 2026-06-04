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

function CountdownTimer({ theme }: { theme: TemplateTheme }) {
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

  const units = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' },
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

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ backgroundColor: theme.bgPrimary, color: theme.textPrimary }}>
      <BackgroundParticles accentColor={theme.accent} />

      {/* ═══ Door Opening Overlay ═══ */}
      <AnimatePresence>
        {doorOverlayVisible && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="fixed inset-0 z-50"
            style={{ perspective: '1600px' }}
          >
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

            {/* Left Door */}
            <div className={`absolute top-0 left-0 w-1/2 h-full ${doorsOpened ? 'door-open-left' : ''}`} style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}>
              <div className="relative w-full h-full border-r overflow-hidden" style={{ background: theme.bgDoorGradient, borderColor: theme.borderSubtle }}>
                {/* Door pattern SVG */}
                <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 400" fill="none">
                  <path d="M30 80 Q100 10 170 80" stroke={theme.accent} strokeWidth="1.5" />
                  <path d="M40 80 Q100 25 160 80" stroke={theme.accent} strokeWidth="1" />
                  <polygon points="100,130 140,180 100,230 60,180" stroke={theme.accent} strokeWidth="1" fill="none" />
                  <line x1="60" y1="80" x2="60" y2="350" stroke={theme.accent} strokeWidth="0.5" />
                  <line x1="140" y1="80" x2="140" y2="350" stroke={theme.accent} strokeWidth="0.5" />
                  <line x1="30" y1="120" x2="170" y2="120" stroke={theme.accent} strokeWidth="0.5" />
                  <line x1="30" y1="240" x2="170" y2="240" stroke={theme.accent} strokeWidth="0.5" />
                </svg>
                <div className="absolute inset-0 door-shimmer" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to right, transparent, rgba(${theme.accentRgb},0.05))` }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-20 h-20 opacity-30" viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="50" r="40" stroke={theme.accent} strokeWidth="0.5" opacity="0.4" />
                      <circle cx="50" cy="50" r="30" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" />
                      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
                        <line key={a} x1="50" y1="10" x2="50" y2="90" stroke={theme.accent} strokeWidth="0.3" opacity="0.15" transform={`rotate(${a} 50 50)`} />
                      ))}
                    </svg>
                    <span className="font-calligraphy text-3xl sm:text-4xl leading-relaxed" dir="rtl" style={{ color: `rgba(${theme.accentRgb},0.8)` }}>الحمد لله</span>
                    <div className="w-12 h-px" style={{ backgroundColor: `rgba(${theme.accentRgb},0.3)` }} />
                  </div>
                </div>
                {/* Door handle */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                  <div className="w-2 h-8 rounded-full" style={{ backgroundColor: `rgba(${theme.accentRgb},0.3)` }} />
                  <div className="w-3 h-3 rounded-full border" style={{ borderColor: `rgba(${theme.accentRgb},0.4)` }} />
                </div>
              </div>
            </div>

            {/* Right Door */}
            <div className={`absolute top-0 right-0 w-1/2 h-full ${doorsOpened ? 'door-open-right' : ''}`} style={{ transformOrigin: 'right center', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}>
              <div className="relative w-full h-full border-l overflow-hidden" style={{ background: theme.bgDoorGradient.replace('135deg', '225deg'), borderColor: theme.borderSubtle }}>
                <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 400" fill="none">
                  <path d="M30 80 Q100 10 170 80" stroke={theme.accent} strokeWidth="1.5" />
                  <path d="M40 80 Q100 25 160 80" stroke={theme.accent} strokeWidth="1" />
                  <polygon points="100,130 140,180 100,230 60,180" stroke={theme.accent} strokeWidth="1" fill="none" />
                  <line x1="60" y1="80" x2="60" y2="350" stroke={theme.accent} strokeWidth="0.5" />
                  <line x1="140" y1="80" x2="140" y2="350" stroke={theme.accent} strokeWidth="0.5" />
                  <line x1="30" y1="120" x2="170" y2="120" stroke={theme.accent} strokeWidth="0.5" />
                  <line x1="30" y1="240" x2="170" y2="240" stroke={theme.accent} strokeWidth="0.5" />
                </svg>
                <div className="absolute inset-0 door-shimmer" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to left, transparent, rgba(${theme.accentRgb},0.05))` }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-20 h-20 opacity-30" viewBox="0 0 100 100" fill="none">
                      <circle cx="50" cy="50" r="40" stroke={theme.accent} strokeWidth="0.5" opacity="0.4" />
                      <circle cx="50" cy="50" r="30" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" />
                      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
                        <line key={a} x1="50" y1="10" x2="50" y2="90" stroke={theme.accent} strokeWidth="0.3" opacity="0.15" transform={`rotate(${a} 50 50)`} />
                      ))}
                    </svg>
                    <span className="font-calligraphy text-3xl sm:text-4xl leading-relaxed" dir="rtl" style={{ color: `rgba(${theme.accentRgb},0.8)` }}>ما شاء الله</span>
                    <div className="w-12 h-px" style={{ backgroundColor: `rgba(${theme.accentRgb},0.3)` }} />
                  </div>
                </div>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                  <div className="w-2 h-8 rounded-full" style={{ backgroundColor: `rgba(${theme.accentRgb},0.3)` }} />
                  <div className="w-3 h-3 rounded-full border" style={{ borderColor: `rgba(${theme.accentRgb},0.4)` }} />
                </div>
              </div>
            </div>

            {/* Center tap-to-open button (Zareqia-style 3D button) */}
            {!doorsOpened && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center z-10"
              >
                <button
                  onClick={handleDoorOpen}
                  className="relative w-28 h-28 md:w-36 md:h-36 rounded-full cursor-pointer focus:outline-none group animate-float"
                  aria-label="Open invitation"
                >
                  {/* Outer ring with 3D depth */}
                  <div className="absolute inset-0 rounded-full" style={{
                    background: `radial-gradient(circle at 35% 35%, ${theme.accentDark}, ${theme.bgDoor})`,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -2px 6px rgba(0,0,0,0.3)',
                  }} />
                  <div className="absolute inset-1 rounded-full" style={{
                    background: `radial-gradient(circle at 40% 30%, ${theme.accentDark}, ${theme.bgDoor})`,
                    boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.1)',
                  }} />
                  {/* Inner gold ring */}
                  <div className="absolute inset-3 md:inset-4 rounded-full border-2 opacity-30" style={{ borderColor: theme.accent }} />
                  {/* Rotating shimmer line */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="absolute inset-0" style={{
                      background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
                      transform: 'rotate(25deg)',
                      animation: 'shimmerRotate 3s ease-in-out infinite',
                    }} />
                  </div>
                  {/* Center content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-calligraphy text-2xl md:text-3xl font-bold" style={{ color: theme.accent, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>S</span>
                    <span className="text-[8px] md:text-[10px] tracking-[0.2em] uppercase mt-0.5" style={{ color: theme.accent }}>tap to open</span>
                  </div>
                  {/* Pulsing ring */}
                  <div className="absolute inset-[-8px] rounded-full border animate-ping opacity-20" style={{ borderColor: theme.borderSubtle }} />
                </button>
              </motion.div>
            )}
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
          className="w-10 h-10 rounded-full border backdrop-blur-sm flex items-center justify-center transition-all duration-300 text-xs font-bold"
          style={{ backgroundColor: theme.bgPrimary + 'cc', borderColor: theme.borderSubtle, color: `rgba(${theme.accentRgb},0.7)` }}
          aria-label="Toggle language"
        >
          {language === 'en' ? 'اردو' : 'EN'}
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
              We&apos;re getting married
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
              Request the honour of your presence
            </motion.p>
          </div>

          {/* Bottom gold line */}
          <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 w-64 md:w-80 z-10">
            <GoldDivider accentColor={theme.accent} />
          </div>

          {/* Scroll indicator */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="absolute bottom-8 flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>Scroll</span>
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
                {welcomeMsg}
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
              <h2 className="font-calligraphy text-3xl sm:text-4xl text-center" style={{ color: theme.accent }}>Our Moments</h2>
              <HeartDivider accentColor={theme.accent} />
              <PhotoGallery theme={theme} />
            </div>
          </section>
        </RevealSection>

        {/* ─── Countdown Timer ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-8">
              <h2 className="font-calligraphy text-3xl sm:text-4xl text-center" style={{ color: theme.accent }}>Counting Down to Forever</h2>
              <HeartDivider accentColor={theme.accent} />
              <CountdownTimer theme={theme} />
            </div>
          </section>
        </RevealSection>

        {/* ─── Event Timeline ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
              <h2 className="font-calligraphy text-3xl sm:text-4xl text-center" style={{ color: theme.accent }}>Program Timeline</h2>
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
                          <p className="text-sm leading-relaxed" style={{ color: `rgba(${theme.accentRgb},0.5)` }}>{event.description}</p>
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
                Venue
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
                  View on Google Maps
                </a>
              </Button>
            </div>
          </section>
        </RevealSection>

        {/* ─── RSVP ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
              <h2 className="font-calligraphy text-3xl sm:text-4xl text-center" style={{ color: theme.accent }}>Will You Attend?</h2>
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
                        <label className="text-sm font-display" style={{ color: `rgba(${theme.accentRgb},0.7)` }}>Your Name</label>
                        <Input
                          value={rsvpName}
                          onChange={(e) => setRsvpName(e.target.value)}
                          placeholder="Enter your full name"
                          className="border transition-all duration-300"
                          style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle, color: theme.textPrimary }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-display" style={{ color: `rgba(${theme.accentRgb},0.7)` }}>Email <span style={{ color: `rgba(${theme.accentRgb},0.3)` }}>(optional)</span></label>
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
                        <label className="text-sm font-display" style={{ color: `rgba(${theme.accentRgb},0.7)` }}>Will you be attending?</label>
                        <select
                          value={rsvpStatus || ''}
                          onChange={(e) => setRsvpStatus(e.target.value as 'accept' | 'decline' | null || null)}
                          className="w-full h-11 rounded-lg border text-sm px-3 focus:outline-none transition-all duration-300 appearance-none cursor-pointer"
                          style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle, color: theme.textPrimary, backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='${encodeURIComponent(theme.accentDark)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                        >
                          <option value="" style={{ backgroundColor: theme.bgSecondary }}>Select...</option>
                          <option value="accept" style={{ backgroundColor: theme.bgSecondary, color: theme.textPrimary }}>Yes, I'll be there! 🎉</option>
                          <option value="decline" style={{ backgroundColor: theme.bgSecondary, color: theme.textPrimary }}>Sorry, I can't make it 💌</option>
                        </select>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button 
                          onClick={() => handleRSVP('accept')} 
                          className="flex-1 text-white border rounded-lg h-11 font-display green-glow transition-all duration-300 hover:scale-[1.02]"
                          style={{ backgroundColor: `rgba(${theme.accentRgb},0.8)`, borderColor: theme.borderSubtle }}
                        >
                          <Check className="w-4 h-4 mr-1.5" />
                          Joyfully Accept
                        </Button>
                        <Button 
                          onClick={() => handleRSVP('decline')} 
                          className="flex-1 border rounded-lg h-11 font-display transition-all duration-300" 
                          style={{ backgroundColor: 'transparent', borderColor: theme.borderSubtle, color: `rgba(${theme.accentRgb},0.7)` }}
                          variant="outline"
                        >
                          <X className="w-4 h-4 mr-1.5" />
                          Respectfully Decline
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
                      {rsvpStatus === 'accept' ? 'Joyfully Accepted!' : 'Thank You!'}
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
              <h2 className="font-calligraphy text-3xl sm:text-4xl text-center" style={{ color: theme.accent }}>Blessings &amp; Wishes</h2>
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
                    placeholder="Your name (so they know who sent this)"
                    className="border h-10 transition-all duration-300 flex-1"
                    style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle, color: theme.textPrimary }}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Textarea
                      value={wishMessage}
                      onChange={(e) => setWishMessage(e.target.value)}
                      placeholder="Write your blessing or wish..."
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
          <p className="text-xs tracking-wider" style={{ color: `rgba(${theme.accentRgb},0.3)` }}>Made with love by ShaadiLink</p>
        </div>
      </motion.div>
    </div>
  )
}
