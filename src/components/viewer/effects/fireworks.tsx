
'use client'
// @ts-nocheck
type Particle = any;

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
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


/* ─── Fireworks Component ─── */
export function FireworksDisplay({ show, colors: propColors }: { show: boolean; colors?: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    if (!show || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    interface FParticle { x: number; y: number; color: string; size: number; angle: number; speed: number; decay: number; trail: { x: number; y: number }[] }
    const particles: FParticle[] = []
    const colors = propColors || ['#b4914d', '#d4a853', '#e8c66a', '#8b6d2f', '#fff4d0', '#f0d78c', '#ffd700', '#ffe4b5', '#f5deb3']

    const isMobile = window.innerWidth < 768
    const maxBursts = isMobile ? 5 : 9

    function createBurst(x: number, y: number) {
      const count = isMobile ? (22 + Math.floor(Math.random() * 12)) : (60 + Math.floor(Math.random() * 30))
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4
        particles.push({
          x, y,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 1.5 + Math.random() * (isMobile ? 2 : 3),
          angle,
          speed: 2 + Math.random() * (isMobile ? 4 : 6),
          decay: 0.009 + Math.random() * 0.015,
          trail: [],
        })
      }
    }

    // Initial bursts
    createBurst(canvas.width * 0.5, canvas.height * 0.25)
    const t1 = setTimeout(() => createBurst(canvas.width * 0.25, canvas.height * 0.35), 300)
    const t2 = setTimeout(() => createBurst(canvas.width * 0.75, canvas.height * 0.3), 500)
    const t3 = setTimeout(() => createBurst(canvas.width * 0.35, canvas.height * 0.2), 800)
    const t4 = !isMobile ? setTimeout(() => createBurst(canvas.width * 0.65, canvas.height * 0.45), 1000) : null
    const t5 = !isMobile ? setTimeout(() => createBurst(canvas.width * 0.15, canvas.height * 0.4), 1300) : null
    const t6 = !isMobile ? setTimeout(() => createBurst(canvas.width * 0.85, canvas.height * 0.25), 1500) : null
    const t7 = !isMobile ? setTimeout(() => createBurst(canvas.width * 0.5, canvas.height * 0.5), 1800) : null
    const t8 = !isMobile ? setTimeout(() => createBurst(canvas.width * 0.4, canvas.height * 0.15), 2100) : null

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        // Store trail positions (max 2 on mobile, 4 on desktop)
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > (isMobile ? 2 : 4)) p.trail.shift()

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

        // Glow (desktop only for 60fps mobile smoothness)
        if (!isMobile) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = alpha * 0.08
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
      if (particles.length > 0) animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)

    // Resize handler so canvas stays full-screen on device rotation
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', handleResize)
      ;[t1, t2, t3, t4, t5, t6, t7, t8].forEach((t) => {
        if (t) clearTimeout(t)
      })
    }
  }, [show])

  if (!show) return null
  return <canvas ref={canvasRef} className="fixed inset-0 z-[60] pointer-events-none" style={{ width: '100vw', height: '100vh' }} />
}
