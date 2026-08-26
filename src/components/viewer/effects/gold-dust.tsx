
'use client'
// @ts-nocheck
type GDParticle = any;

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


export function GoldDustSplash({ show, colors: propColors }: { show: boolean; colors?: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<GDParticle[]>([])
  const animRef = useRef<number>(0)
  const colors = propColors || ['#b4914d', '#d4a853', '#e8c66a', '#f0d78c', '#fff4d0']

  useEffect(() => {
    if (!show) return
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const isMobile = window.innerWidth < 768
    // Spawn initial burst of particles along the center seam
    const count = isMobile ? 20 : 60
    const maxParticles = isMobile ? 25 : 80
    const w = window.innerWidth
    const h = window.innerHeight
    const particles: GDParticle[] = []
    for (let i = 0; i < count; i++) {
      const isLeft = Math.random() < 0.5
      const vx = (isLeft ? -1 : 1) * (2 + Math.random() * (isMobile ? 6 : 10))
      const vy = (Math.random() - 0.5) * 3
      particles.push({
        x: w / 2,
        y: Math.random() * h,
        vx,
        vy,
        swaySpeed: 0.02 + Math.random() * 0.05,
        swayOffset: Math.random() * Math.PI * 2,
        life: 50 + Math.random() * (isMobile ? 50 : 90),
        maxLife: isMobile ? 100 : 150,
        size: 1.5 + Math.random() * (isMobile ? 2 : 3),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08,
      })
    }
    particlesRef.current = particles

    const ctx = canvas.getContext('2d')!
    function animate() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      const current = particlesRef.current

      // Spawn a few more tailing particles for a continuous flow
      if (current.length < maxParticles && Math.random() < (isMobile ? 0.3 : 0.6)) {
        const isLeft = Math.random() < 0.5
        current.push({
          x: window.innerWidth / 2,
          y: Math.random() * window.innerHeight,
          vx: (isLeft ? -1 : 1) * (1 + Math.random() * (isMobile ? 4 : 6)),
          vy: (Math.random() - 0.5) * 2,
          swaySpeed: 0.02 + Math.random() * 0.05,
          swayOffset: Math.random() * Math.PI * 2,
          life: 40 + Math.random() * 60,
          maxLife: 100,
          size: 1.2 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.08,
        })
      }

      for (let i = current.length - 1; i >= 0; i--) {
        const p = current[i]
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotSpeed

        p.vx *= 0.96
        p.vy *= 0.97

        p.y += Math.sin(p.swayOffset) * 0.2
        p.swayOffset += p.swaySpeed
        p.y -= 0.15

        p.life--
        if (p.life <= 0) {
          current.splice(i, 1)
          continue
        }

        const alpha = p.life / p.maxLife
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color

        const r = p.size * (0.4 + alpha * 0.6)
        
        ctx.beginPath()
        ctx.moveTo(p.x, p.y - r)
        ctx.quadraticCurveTo(p.x, p.y, p.x + r, p.y)
        ctx.quadraticCurveTo(p.x, p.y, p.x, p.y + r)
        ctx.quadraticCurveTo(p.x, p.y, p.x - r, p.y)
        ctx.quadraticCurveTo(p.x, p.y, p.x, p.y - r)
        ctx.closePath()
        ctx.fill()

        if (p.size > 2.5) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, r * 2.5, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = alpha * 0.15
          ctx.fill()
        }
      }

      ctx.globalAlpha = 1
      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [show, colors])

  if (!show) return null
  return <canvas ref={canvasRef} className="fixed inset-0 z-[49] pointer-events-none" style={{ width: '100vw', height: '100vh' }} />
}
