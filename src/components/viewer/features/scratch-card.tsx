
'use client'
import { drawHeartPath, getHeartSvgPath } from '../ui/shapes';
import { HeartDivider } from '../ui/dividers';

import React, { useState, useRef, useEffect, useCallback, useMemo, useId } from 'react'
import { createPortal } from 'react-dom'
import { m, AnimatePresence, useInView } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { MapPin, Calendar, Clock, ChevronDown, Heart, Sparkles, Send, Check, X, Star, Music, Music2, User, MessageCircle, Loader2, Copy, Hotel, Car, Gift, HelpCircle, Info, ChevronLeft, ChevronRight, Maximize, Share2 } from 'lucide-react'
import type { FlowData } from '@/lib/flow-types'
import { TemplateTheme, TEMPLATE_THEMES, DEFAULT_THEME } from '../themes';
import { InvitationViewerProps, hexToRgb, getTheme, extractColors, parseGiftDetails, getCalendarDates, getGoogleCalendarLink, generateICSContent, getOutlookWebLink, formatScratchDate, formatScratchTime } from '../utils';


/* ─── Scratch Card (v8 - Grid-based tracking + fixed DPR + sparkle trail) ─── */
export function ScratchCard({
  revealed,
  onReveal,
  theme,
  language,
  translations,
  scratchDateInfo,
  scratchTimeFormatted,
}: {
  revealed: boolean;
  onReveal: () => void;
  theme: TemplateTheme;
  language: 'en' | 'ur';
  translations: Record<string, string>;
  scratchDateInfo: { date: string; day: string };
  scratchTimeFormatted: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const revealedRef = useRef(false)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)
  const onRevealRef = useRef(onReveal)
  const [canvasFading, setCanvasFading] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const celebrationSparkles = useMemo(() => {
    if (!showCelebration) return []
    return Array.from({ length: 24 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 24
      const dist = 30 + Math.random() * 50
      const size = 4 + Math.random() * 6
      return { angle, dist, size }
    })
  }, [showCelebration])
  const [scratchPercent, setScratchPercent] = useState(0)
  const sparkleCanvasRef = useRef<HTMLCanvasElement>(null)
  const sparklesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string }>>([])
  const sparkleAnimRef = useRef<number>(0)

  const isRoyal = theme.id.includes('royal') || theme.id === 'geometric-gold' || theme.id === 'dark-velvet'
  const clipId = useId().replace(/:/g, '')
  // Responsive width: never exceed viewport width minus padding (fixes overflow on iPhone SE)
  const maxWidth = typeof window !== 'undefined' ? window.innerWidth - 32 : 340
  const CARD_W = Math.min(340, maxWidth)
  // Taller heart card so revealed content fits without clipping
  const CARD_H = isRoyal ? 360 : 220

  // Grid-based scratch tracking (reliable, no getImageData needed)
  const GRID_COLS = isRoyal ? 15 : 17
  const GRID_ROWS = isRoyal ? 16 : 11
  const REVEAL_THRESHOLD = isRoyal ? 40 : 60
  const gridRef = useRef<Set<string>>(new Set())

  // Keep onReveal ref always current
  useEffect(() => {
    onRevealRef.current = onReveal
  }, [onReveal])

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
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    if (isRoyal) {
      drawHeartPath(ctx, 0, 0, CARD_W, CARD_H)
      ctx.clip()
    }

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
    sheenGrad.addColorStop(0, theme.getOpacityStyle('border', 0.15))
    sheenGrad.addColorStop(0.5, theme.getOpacityStyle('border', 0.22))
    sheenGrad.addColorStop(1, theme.getOpacityStyle('border', 0.15))
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
    if (isRoyal) {
      ctx.strokeStyle = theme.getOpacityStyle('text', 0.6)
      ctx.lineWidth = 2.5
      drawHeartPath(ctx, 4, 4, CARD_W - 8, CARD_H - 8)
      ctx.stroke()

      ctx.strokeStyle = theme.getOpacityStyle('border', 0.25)
      ctx.lineWidth = 1
      drawHeartPath(ctx, 10, 10, CARD_W - 20, CARD_H - 20)
      ctx.stroke()
    } else {
      ctx.strokeStyle = theme.getOpacityStyle('text', 0.6)
      ctx.lineWidth = 2.5
      ctx.strokeRect(4, 4, CARD_W - 8, CARD_H - 8)
      ctx.strokeStyle = theme.getOpacityStyle('border', 0.25)
      ctx.lineWidth = 1
      ctx.strokeRect(10, 10, CARD_W - 20, CARD_H - 20)

      // Corner decorations
      const cornerSize = 20
      const cornerOffset = 14
      ctx.strokeStyle = theme.getOpacityStyle('text', 0.5)
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
    }

    // "Scratch Here" text with glow (theme-aware)
    ctx.shadowColor = theme.getOpacityStyle('text', 0.5)
    ctx.shadowBlur = 12
    ctx.fillStyle = theme.getOpacityStyle('text', 0.85)
    ctx.font = language === 'ur' ? 'bold 18px Noto Nastaliq Urdu, serif' : 'bold 18px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const cyOffset = isRoyal ? -12 : 0
    ctx.fillText(language === 'ur' ? (translations.scratchHere || '✦  یہاں کھرچیں  ✦') : '✦  Scratch Here  ✦', cx, cy + cyOffset - 8)
    ctx.shadowBlur = 0
    ctx.fillStyle = theme.getOpacityStyle('text', 0.5)
    ctx.font = language === 'ur' ? '11px Noto Nastaliq Urdu, serif' : '11px serif'
    ctx.fillText(language === 'ur' ? (translations.toReveal || 'دعوت نامہ دیکھنے کے لیے') : 'to reveal your invitation', cx, cy + cyOffset + 14)

    // Finger icon hint
    ctx.fillStyle = theme.getOpacityStyle('border', 0.25)
    ctx.font = '22px serif'
    ctx.fillText('👆', cx, cy + cyOffset + 42)

    // Reset grid and percent
    gridRef.current = new Set()
    setScratchPercent(0)
    revealedRef.current = false
  }, [revealed, theme, language, translations, CARD_W, CARD_H, isRoyal])

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
      const sparkles = sparklesRef.current
      if (sparkles.length === 0) {
        sparkleAnimRef.current = requestAnimationFrame(animateSparkles)
        return
      }
      sCtx.clearRect(0, 0, CARD_W, CARD_H)
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i]
        s.x += s.vx
        s.y += s.vy
        s.vy += 0.08
        s.life--
        if (s.life <= 0) { sparkles.splice(i, 1); continue }
        const alpha = s.life / s.maxLife
        sCtx.globalAlpha = alpha
        sCtx.fillStyle = s.color
        sCtx.beginPath()
        const r = s.size * alpha
        sCtx.save()
        sCtx.translate(s.x, s.y)
        for (let j = 0; j < 4; j++) {
          sCtx.rotate(Math.PI / 4)
          sCtx.fillRect(-r * 0.15, -r, r * 0.3, r * 2)
        }
        sCtx.restore()
        sCtx.beginPath()
        sCtx.arc(s.x, s.y, r * 2, 0, Math.PI * 2)
        sCtx.fillStyle = s.color
        sCtx.globalAlpha = alpha * 0.15
        sCtx.fill()
      }
      sCtx.globalAlpha = 1
      if (sparkles.length === 0) {
         sCtx.clearRect(0, 0, CARD_W, CARD_H)
      }
      sparkleAnimRef.current = requestAnimationFrame(animateSparkles)
    }
    sparkleAnimRef.current = requestAnimationFrame(animateSparkles)
    return () => cancelAnimationFrame(sparkleAnimRef.current)
  }, [revealed, CARD_W, CARD_H])

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
  }, [doReveal, CARD_W, CARD_H, GRID_COLS, GRID_ROWS, REVEAL_THRESHOLD])

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
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    if (isRoyal) {
      drawHeartPath(ctx, 0, 0, CARD_W, CARD_H)
    }

    ctx.globalCompositeOperation = 'destination-out'

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

    ctx.globalCompositeOperation = 'source-over'
    lastPosRef.current = { x, y }
    markGrid(x, y)
  }, [markGrid, isRoyal, CARD_W, CARD_H, theme.accentLight, theme.accent, theme.scratchAccent])

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
      <m.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`${theme.fontCalligraphy} text-3xl sm:text-4xl`}
        style={{ color: theme.accent }}
      >
        {language === 'ur' ? (translations.scratchReveal || 'دعوت نامہ دیکھنے کے لیے') : 'Scratch to Reveal'}
      </m.h2>
      <HeartDivider themeId={theme.id} accentColor={theme.accent} />
      {!revealed && scratchPercent > 5 && (
        <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.getOpacityStyle('bg', 0.1) }}>
          <m.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${theme.accentDark}, ${theme.accentLight})` }}
            animate={{ width: `${Math.min(scratchPercent, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
      
      {/* Dynamic heart clip path for the current dimensions */}
      {isRoyal && (
        <svg width="0" height="0" className="absolute pointer-events-none">
          <defs>
            <clipPath id={`heart-clip-${clipId}`} clipPathUnits="userSpaceOnUse">
              <path d={getHeartSvgPath(CARD_W, CARD_H)} />
            </clipPath>
          </defs>
        </svg>
      )}

      <div
        className={`relative ${isRoyal ? '' : 'rounded-2xl'} overflow-hidden`}
        style={{
          width: CARD_W,
          height: CARD_H,
          boxShadow: revealed
            ? `0 0 50px ${theme.getOpacityStyle('accent', 0.15)}, 0 0 100px ${theme.getOpacityStyle('border', 0.2)}, rgba(0,0,0,0.4) 0px 10px 30px`
            : `${theme.getOpacityStyle('text', 0.25)} 0px 8px 40px, rgba(0,0,0,0.3) 0px 4px 12px`,
          borderRadius: isRoyal ? '0' : '1rem',
          clipPath: isRoyal ? `url(#heart-clip-${clipId})` : undefined,
          WebkitClipPath: isRoyal ? `url(#heart-clip-${clipId})` : undefined
        }}
      >
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center ${isRoyal ? '' : 'rounded-2xl'} transition-all duration-1000 ${revealed ? 'gold-border-pulse luxury-shimmer' : ''}`}
            style={{
              width: CARD_W,
              height: CARD_H,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E"), radial-gradient(circle at 50% 40%, ${theme.bgCard} 0%, ${theme.bgPrimary} 140%)`,
              backgroundBlendMode: 'overlay, normal',
              border: isRoyal 
                ? 'none' 
                : revealed ? `2px solid ${theme.getOpacityStyle('accent', 0.6)}` : `2px solid ${theme.getOpacityStyle('text', 0.4)}`,
              boxShadow: revealed
                ? `inset 0 0 60px ${theme.getOpacityStyle('bg', 0.1)}, inset 0 0 20px ${theme.getOpacityStyle('accent', 0.05)}`
                : `inset 0 0 30px ${theme.getOpacityStyle('bg', 0.05)}`,
            }}
          >
          {isRoyal ? (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${CARD_W} ${CARD_H}`} fill="none">
              <path d={getHeartSvgPath(CARD_W, CARD_H, 4)} stroke={theme.getOpacityStyle('text', 0.8)} strokeWidth="2.5" />
              <path d={getHeartSvgPath(CARD_W, CARD_H, 10)} stroke={theme.scratchAccent} strokeWidth="1" opacity="0.5" />
            </svg>
          ) : (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${CARD_W} ${CARD_H}`} fill="none">
              <path d="M24 12 L12 12 L12 24" stroke={theme.accent} strokeWidth="2" opacity="0.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d={`M${CARD_W - 24} 12 L${CARD_W - 12} 12 L${CARD_W - 12} 24`} stroke={theme.accent} strokeWidth="2" opacity="0.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d={`M12 ${CARD_H - 24} L12 ${CARD_H - 12} L24 ${CARD_H - 12}`} stroke={theme.accent} strokeWidth="2" opacity="0.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d={`M${CARD_W - 12} ${CARD_H - 24} L${CARD_W - 12} ${CARD_H - 12} L${CARD_W - 24} ${CARD_H - 12}`} stroke={theme.accent} strokeWidth="2" opacity="0.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}

          <AnimatePresence mode="wait">
            {revealed ? (
              <m.div
                key="revealed"
                initial={{ scale: 0.7, opacity: 0, filter: 'blur(8px)' }}
                animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.7, ease: [0.34, 1.4, 0.64, 1] }}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', zIndex: 10, paddingLeft: isRoyal ? '2.5rem' : '0.75rem', paddingRight: isRoyal ? '2.5rem' : '0.75rem', paddingTop: isRoyal ? '3.5rem' : undefined }}
              >
                <m.div
                  initial={{ y: -12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                >
                  <Sparkles className="w-5 h-5 mx-auto" style={{ color: theme.accent, filter: `drop-shadow(0 0 8px ${theme.getOpacityStyle('accent', 0.5)})` }} />
                </m.div>
                <m.p
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className={`${theme.fontCalligraphy} ${isRoyal ? 'text-xl' : 'text-2xl sm:text-3xl'} font-bold text-center leading-tight`}
                  style={{ color: theme.text, textShadow: `0 2px 4px rgba(0,0,0,0.15), 0 0 20px ${theme.getOpacityStyle('accent', 0.3)}` }}
                >
                  {language === 'ur' ? (translations.youreInvited || 'آپ مدعو ہیں!') : "You're Invited!"}
                </m.p>
                <m.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.35 }}
                  className="h-px w-20"
                  style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }}
                />
                <m.p
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className={`${theme.fontDisplay} ${isRoyal ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'} font-bold text-center leading-tight tracking-wide`}
                  style={{ color: theme.text, textShadow: `0 2px 8px rgba(0,0,0,0.1), 0 0 15px ${theme.getOpacityStyle('accent', 0.2)}` }}
                >
                  {scratchDateInfo.date}
                </m.p>
                <m.p
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className={`${theme.fontCalligraphy} ${isRoyal ? 'text-base' : 'text-lg'}`}
                  style={{ color: theme.textSecondary }}
                >
                  {scratchDateInfo.day}
                </m.p>
                <m.p
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  className="text-sm text-center font-medium tracking-wide"
                  style={{ color: theme.textSecondary }}
                >
                  {scratchTimeFormatted} <span style={{ color: theme.textSecondary, fontWeight: 600 }}>{language === 'ur' ? 'پاکستانی وقت' : 'PKT'}</span>
                </m.p>
              </m.div>
            ) : (
              <m.div
                key="hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', zIndex: 10, paddingLeft: isRoyal ? '2.5rem' : '0.75rem', paddingRight: isRoyal ? '2.5rem' : '0.75rem', paddingTop: isRoyal ? '3.5rem' : undefined }}
              >
                <Sparkles className="w-5 h-5 mx-auto" style={{ color: theme.accent }} />
                <p
                  className={`${theme.fontCalligraphy} ${isRoyal ? 'text-xl' : 'text-2xl sm:text-3xl'} font-bold text-center leading-tight`}
                  style={{ color: theme.accent, textShadow: `0 0 15px ${theme.getOpacityStyle('text', 0.15)}` }}
                >
                  {language === 'ur' ? (translations.youreInvited || 'آپ مدعو ہیں!') : "You're Invited!"}
                </p>
                <div
                  className="h-px w-20"
                  style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }}
                />
                <p
                  className={`${theme.fontDisplay} ${isRoyal ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'} font-bold text-center leading-tight`}
                  style={{ color: theme.text, textShadow: `0 0 10px ${theme.getOpacityStyle('text', 0.1)}` }}
                >
                  {scratchDateInfo.date}
                </p>
                <p
                  className={`${theme.fontCalligraphy} ${isRoyal ? 'text-base' : 'text-lg'}`}
                  style={{ color: theme.textSecondary }}
                >
                  {scratchDateInfo.day}
                </p>
                <p
                  className="text-sm text-center"
                  style={{ color: theme.textSecondary }}
                >
                  {scratchTimeFormatted} <span style={{ color: theme.textSecondary, fontWeight: 600 }}>{language === 'ur' ? 'پاکستانی وقت' : 'PKT'}</span>
                </p>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        {/* Celebration sparkles overlay */}
        <AnimatePresence>
          {showCelebration && celebrationSparkles.map((sparkle, i) => {
            return (
              <m.div
                key={i}
                initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                  x: Math.cos(sparkle.angle) * sparkle.dist,
                  y: Math.sin(sparkle.angle) * sparkle.dist,
                }}
                transition={{ duration: 1.5, delay: i * 0.04, ease: 'easeOut' }}
                className="absolute z-30 pointer-events-none"
                style={{
                  width: sparkle.size,
                  height: sparkle.size,
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
            className={`absolute inset-0 ${isRoyal ? '' : 'rounded-2xl'} pointer-events-none z-40`}
            style={{ width: '100%', height: '100%' }}
          />
        )}

        {/* Canvas overlay (scratch surface) */}
        {!revealed && (
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 ${isRoyal ? '' : 'rounded-2xl'} cursor-pointer touch-none z-30 transition-opacity duration-400 ${canvasFading ? 'opacity-0' : 'opacity-100'}`}
            style={{ width: '100%', height: '100%', touchAction: 'none' }}
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
