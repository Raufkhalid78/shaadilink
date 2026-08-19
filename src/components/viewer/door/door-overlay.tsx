
'use client'

import { DoorFrame, LightLeak } from './door-frame';
import { DoorPanelLayout, DoorSurface, DoorPanelContent } from './door-panels';
import { DoorHandle, DoorHinges } from './door-hardware';


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


/* ─── Door Overlay Component ─── */
export function DoorOverlay({ theme, doorsOpened, onOpen }: { theme: TemplateTheme; doorsOpened: boolean; onOpen: (instant?: boolean) => void }) {
  const ds = theme.doorStyle
  const a = theme.accentRgb

  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Pre-generate star positions deterministically
  const stars = [
    { left: 8, top: 12, size: 1.5, opacity: 0.6, delay: 0 },
    { left: 22, top: 8, size: 1, opacity: 0.4, delay: 0.3 },
    { left: 35, top: 18, size: 2, opacity: 0.5, delay: 0.8 },
    { left: 72, top: 6, size: 1.5, opacity: 0.55, delay: 0.2 },
    { left: 85, top: 15, size: 1, opacity: 0.45, delay: 0.6 },
    { left: 92, top: 9, size: 2, opacity: 0.4, delay: 1.1 },
    { left: 12, top: 85, size: 1.5, opacity: 0.35, delay: 0.7 },
    { left: 88, top: 82, size: 1, opacity: 0.4, delay: 0.4 },
    { left: 48, top: 4, size: 1.2, opacity: 0.5, delay: 0.9 },
    { left: 60, top: 88, size: 1.8, opacity: 0.3, delay: 1.4 },
    { left: 25, top: 90, size: 1.2, opacity: 0.35, delay: 0.5 },
    { left: 75, top: 92, size: 1, opacity: 0.3, delay: 1.0 },
  ]

  // Canvas particle simulation (ambient floating stars & opening explosion)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      color: string
      alpha: number
      decay: number
      gravity: number
      spin: number
      spinSpeed: number
    }

    let particles: Particle[] = []

    // Ambient floating dust particles
    const createAmbientParticle = () => {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.5,
        radius: Math.random() * 1.5 + 0.5,
        color: `rgba(${a}, ${Math.random() * 0.4 + 0.2})`,
        alpha: Math.random() * 0.6 + 0.2,
        decay: 0.001 + Math.random() * 0.002,
        gravity: 0,
        spin: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.02,
      }
    }

    // Populate ambient particles
    for (let i = 0; i < 25; i++) {
      particles.push(createAmbientParticle())
    }

    let burstTriggered = false

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // Maintain ambient particle count
      if (particles.filter(p => p.gravity === 0).length < 25 && Math.random() < 0.1) {
        particles.push(createAmbientParticle())
      }

      // Trigger gold dust explosion when doors part
      if (doorsOpened && !burstTriggered) {
        burstTriggered = true
        const centerX = width / 2
        const centerY = height / 2
        for (let i = 0; i < 60; i++) {
          const angle = Math.random() * Math.PI * 2
          const speed = Math.random() * 6 + 2
          particles.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1, // upward bias
            radius: Math.random() * 3 + 1,
            color: Math.random() > 0.35 ? 'rgba(212, 168, 83, 1)' : 'rgba(255, 244, 208, 1)',
            alpha: 1,
            decay: 0.015 + Math.random() * 0.02,
            gravity: 0.08, // drop down
            spin: Math.random() * Math.PI * 2,
            spinSpeed: (Math.random() - 0.5) * 0.1,
          })
        }
      }

      // Render loop
      particles = particles.filter(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy += p.gravity
        p.alpha -= p.decay
        p.spin += p.spinSpeed

        if (p.alpha <= 0) return false

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.spin)
        ctx.globalAlpha = p.alpha

        ctx.fillStyle = p.color
        ctx.beginPath()
        if (p.gravity > 0) {
          // Sparkle four-point star shape for burst particles
          ctx.moveTo(0, -p.radius * 2)
          ctx.lineTo(p.radius * 0.5, -p.radius * 0.5)
          ctx.lineTo(p.radius * 2, 0)
          ctx.lineTo(p.radius * 0.5, p.radius * 0.5)
          ctx.lineTo(0, p.radius * 2)
          ctx.lineTo(-p.radius * 0.5, p.radius * 0.5)
          ctx.lineTo(-p.radius * 2, 0)
          ctx.lineTo(-p.radius * 0.5, -p.radius * 0.5)
        } else {
          // Soft ambient circular drift
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2)
        }
        ctx.closePath()
        ctx.fill()
        ctx.restore()

        return true
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [doorsOpened, a])

  const getAnimClasses = () => {
    if (!doorsOpened) return { left: '', right: '' }
    switch (ds.type) {
      case 'curtains':
        return { left: 'curtain-open-left', right: 'curtain-open-right' }
      case 'petals':
      case 'lotus':
        return { left: 'petal-open-left', right: 'petal-open-right' }
      case 'split-screen':
      case 'geometric':
        return { left: 'split-open-left', right: 'split-open-right' }
      case 'archway':
        return { left: 'arch-open-left', right: 'arch-open-right' }
      case 'scroll':
        return { left: 'scroll-unfurl-left', right: 'scroll-unfurl-right' }
      case 'dome':
        return { left: 'dome-lift-up', right: 'dome-lift-up' }
      case 'lantern':
        return { left: 'lantern-open-left', right: 'lantern-open-right' }
      case 'classic-doors':
      default:
        return { left: 'door-open-left', right: 'door-open-right' }
    }
  }
  const anim = getAnimClasses()

  const getIdleClass = () => {
    switch (ds.type) {
      case 'curtains':
        return 'curtain-drape-idle'
      case 'petals':
      case 'lotus':
        return 'petal-sway-idle'
      case 'scroll':
        return 'scroll-shimmer-idle'
      case 'split-screen':
      case 'geometric':
        return 'split-shimmer-idle'
      case 'dome':
        return 'dome-float-idle'
      case 'lantern':
        return 'lantern-glow-idle'
      case 'archway':
        return 'arch-breathe-idle'
      case 'classic-doors':
      default:
        return 'door-breathe-idle'
    }
  }
  const idleClass = getIdleClass()

  // Get panel gradient based on material
  const getPanelGradient = (isLeft: boolean): string => {
    if (ds.doorMaterial === 'glass') {
      return isLeft
        ? `linear-gradient(90deg, rgba(${theme.accentRgb}, 0.12) 0%, rgba(${theme.accentRgb}, 0.03) 100%)`
        : `linear-gradient(270deg, rgba(${theme.accentRgb}, 0.12) 0%, rgba(${theme.accentRgb}, 0.03) 100%)`
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
    if (!['classic-doors', 'archway', 'dome'].includes(ds.type)) return null

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
          borderLeft: `1px solid ${theme.getOpacityStyle('border', 0.15)}`,
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
          borderRight: `1px solid ${theme.getOpacityStyle('border', 0.15)}`,
          borderLeft: `1px solid rgba(0,0,0,0.2)`,
        }
    return (
      <div style={edgeStyle}>
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 12px, ${theme.getOpacityStyle('text', 0.08)} 12px, ${theme.getOpacityStyle('text', 0.08)} 13px)`,
        }} />
        <div className="absolute inset-0" style={{
          background: `linear-gradient(${side === 'left' ? '270deg' : '90deg'}, ${theme.getOpacityStyle('text', 0.12)}, transparent 60%)`,
        }} />
      </div>
    )
  }

  const renderDoorTypeOverlays = (side: 'left' | 'right') => {
    if (ds.type === 'curtains') {
      return (
        <div className="absolute inset-0 pointer-events-none shadow-inner" style={{ zIndex: 3 }}>
          {/* Real curtain fabric pleats/folds */}
          <div 
            className="absolute inset-0 opacity-45" 
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, 
                rgba(0,0,0,0.35) 0px, 
                rgba(0,0,0,0.15) 15px, 
                transparent 35px, 
                rgba(255,255,255,0.06) 55px, 
                transparent 75px, 
                rgba(0,0,0,0.15) 95px, 
                rgba(0,0,0,0.35) 110px
              )`,
              backgroundSize: '120px 100%',
            }} 
          />
          <div className="absolute top-0 left-0 w-full h-3.5 bg-gradient-to-b from-gold via-gold-light to-amber-700/80 border-b border-gold/40" />
          <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-gold via-gold-light to-amber-700/80 border-t border-gold/40" style={{
            backgroundImage: `repeating-linear-gradient(90deg, ${theme.accent} 0px, ${theme.accent} 3px, transparent 3px, transparent 6px)`
          }} />
          <div className="absolute inset-0" style={{
            background: `linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.35) 100%)`
          }} />
        </div>
      )
    }
    if (ds.type === 'scroll') {
      return (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 4 }}>
          {/* Roller tube representing wood bar */}
          <div 
            className={`absolute top-0 w-6 h-full bg-gradient-to-r from-amber-950 via-amber-700 to-amber-950 border-amber-950 shadow-md ${
              doorsOpened 
                ? (side === 'left' ? 'scroll-roll-left-cylinder' : 'scroll-roll-right-cylinder') 
                : ''
            }`}
            style={{
              left: side === 'left' ? 'auto' : '-12px',
              right: side === 'left' ? '-12px' : 'auto',
              boxShadow: side === 'left' ? '-3px 0 8px rgba(0,0,0,0.5)' : '3px 0 8px rgba(0,0,0,0.5)'
            }}
          >
             {/* Gold Caps for Cylinders */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3.5 rounded-sm bg-gradient-to-r from-gold-light via-gold to-amber-700 border border-gold/40" />
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-3.5 rounded-sm bg-gradient-to-r from-gold-light via-gold to-amber-700 border border-gold/40" />
          </div>
          <div className="absolute top-0 bottom-0 w-0.5 bg-gold/40" style={{
            left: side === 'left' ? 'auto' : '15px',
            right: side === 'left' ? '15px' : 'auto',
          }} />
        </div>
      )
    }
    if (ds.type === 'petals' || ds.type === 'lotus') {
      return (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
          <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path 
              d={side === 'left' 
                ? "M0,10 C40,20 60,45 100,50 M0,50 C40,48 70,68 100,90 M0,90 C30,80 50,95 100,100" 
                : "M100,10 C60,20 40,45 0,50 M100,50 C60,48 30,68 0,90 M100,90 C70,80 50,95 0,100"} 
              stroke={theme.accent} 
              strokeWidth="0.5" 
              fill="none" 
            />
            <path 
              d={side === 'left' 
                ? "M0,30 Q50,40 100,35 M0,70 Q50,60 100,75" 
                : "M100,30 Q50,40 0,35 M100,70 Q50,60 0,75"} 
              stroke={theme.getOpacityStyle('text', 0.4)} 
              strokeWidth="0.3" 
              fill="none" 
            />
          </svg>
          <div className="absolute w-24 h-24 rounded-full bg-pink-500/5 blur-xl top-1/2 -translate-y-1/2" style={{
            left: side === 'left' ? 'auto' : '-48px',
            right: side === 'right' ? 'auto' : '-48px',
          }} />
        </div>
      )
    }
    if (ds.type === 'archway') {
      return (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
          <svg className="absolute top-0 left-0 w-full h-full opacity-60" viewBox="0 0 100 200" preserveAspectRatio="none">
            {/* Main elegant arch outline */}
            <path 
              d={side === 'left' 
                ? "M 7.5 70 L 7.5 45 Q 7.5 38 12 35 Q 15 28 25 25 Q 32 19 45 17 Q 55 13 70 11 Q 82 8 100 7" 
                : "M 92.5 70 L 92.5 45 Q 92.5 38 88 35 Q 85 28 75 25 Q 68 19 55 17 Q 45 13 30 11 Q 18 8 0 7"} 
              fill="none" 
              stroke={theme.accent} 
              strokeWidth="1.2" 
              filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.5))"
            />
            {/* Parallel inner detail line */}
            <path 
              d={side === 'left' 
                ? "M 11.5 70 L 11.5 45 Q 11.5 39 16 38 Q 19 31.5 28.5 29 Q 35 23 48 21 Q 57.5 17 72 15 Q 83.5 12 100 11" 
                : "M 88.5 70 L 88.5 45 Q 88.5 39 84 38 Q 81 31.5 71.5 29 Q 65 23 52 21 Q 42.5 17 28 15 Q 16.5 12 0 11"} 
              fill="none" 
              stroke={theme.getOpacityStyle('text', 0.45)} 
              strokeWidth="0.6" 
            />
          </svg>
        </div>
      )
    }
    if (ds.type === 'lantern') {
      return (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
          <div className="absolute inset-3 border border-gold/30 rounded-sm">
            <div className="absolute inset-1 border border-gold/15" />
          </div>
          <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="0" y1="0" x2="100" y2="100" stroke={theme.accent} strokeWidth="0.4" />
            <line x1="0" y1="100" x2="100" y2="0" stroke={theme.accent} strokeWidth="0.4" />
            <line x1="50" y1="0" x2="50" y2="100" stroke={theme.accent} strokeWidth="0.5" />
            <line x1="0" y1="50" x2="100" y2="50" stroke={theme.accent} strokeWidth="0.5" />
          </svg>
        </div>
      )
    }
    if (ds.type === 'dome') {
      return (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
          <svg className="absolute top-0 left-0 w-full h-full opacity-40" viewBox="0 0 100 200" preserveAspectRatio="none">
            <path 
              d={side === 'left' 
                ? "M 0 0 L 100 0 L 100 30 Q 95 38 85 45 Q 65 52 50 65 L 50 200 L 0 200 Z" 
                : "M 100 0 L 0 0 L 0 30 Q 5 38 15 45 Q 35 52 50 65 L 50 200 L 100 200 Z"} 
              fill="none" 
              stroke={theme.accent} 
              strokeWidth="0.8" 
            />
          </svg>
        </div>
      )
    }
    return null
  }

  // Render splitting wax seal half
  const renderWaxSealHalf = (side: 'left' | 'right') => {
    const sealColor = theme.id === 'emerald-noir' || theme.id === 'mughal-emerald'
      ? '#062017'
      : theme.id === 'crimson-royale' || theme.id === 'royal-elegance'
      ? '#380a10'
      : theme.id === 'rose-gold-blush' || theme.id === 'rose-gold-blush-royal'
      ? '#4a1924'
      : theme.id === 'majestic-love'
      ? '#301d08'
      : theme.id === 'garden-romance' || theme.id === 'pastel-floral'
      ? '#44142a'
      : theme.id === 'modern-minimal'
      ? '#0f172a'
      : theme.id === 'ivory-dream'
      ? '#2e2014'
      : theme.id === 'watercolor-peach'
      ? '#3d1d12'
      : '#1a1815'

    const sealHighlight = theme.id === 'emerald-noir' || theme.id === 'mughal-emerald'
      ? '#124838'
      : theme.id === 'crimson-royale' || theme.id === 'royal-elegance'
      ? '#6e1723'
      : theme.id === 'rose-gold-blush' || theme.id === 'rose-gold-blush-royal'
      ? '#823143'
      : theme.id === 'majestic-love'
      ? '#5c3a19'
      : theme.id === 'garden-romance' || theme.id === 'pastel-floral'
      ? '#7a2850'
      : theme.id === 'modern-minimal'
      ? '#1e293b'
      : theme.id === 'ivory-dream'
      ? '#543b25'
      : theme.id === 'watercolor-peach'
      ? '#663220'
      : '#3d3830'

    const accent = theme.accent

    return (
      <div 
        className={`absolute top-1/2 -translate-y-1/2 w-14 h-28 md:w-18 md:h-36 overflow-hidden pointer-events-none z-30 transition-all duration-300 ${
          side === 'left' ? 'right-0 origin-right' : 'left-0 origin-left'
        }`}
        style={{
          transform: isPressed ? 'translateY(-50%) scale(0.94)' : isHovered ? 'translateY(-50%) scale(1.08)' : 'translateY(-50%) scale(1)',
          filter: isHovered ? `drop-shadow(0 0 14px ${theme.accent}99)` : 'none'
        }}
      >
        {/* Full wax seal container shifted so only one half is visible */}
        <div 
          className={`absolute top-0 w-28 h-28 md:w-36 md:h-36 ${
            side === 'left' ? 'left-0' : 'left-[-3.5rem] md:left-[-4.5rem]'
          }`}
        >
          {/* Outer irregular melted wax overflow */}
          <div 
            className="absolute inset-0 shadow-2xl transition-all duration-300"
            style={{
              borderRadius: '48% 52% 51% 49% / 51% 48% 52% 49%',
              background: `radial-gradient(circle at 35% 35%, ${sealHighlight}, ${sealColor})`,
              boxShadow: isHovered
                ? `0 12px 35px rgba(0,0,0,0.8), 0 0 20px rgba(${theme.accentRgb}, 0.35), inset 0 2px 4px rgba(255,255,255,0.25), inset 0 -3px 8px rgba(0,0,0,0.55)`
                : `0 10px 30px rgba(0,0,0,0.65), inset 0 2px 4px rgba(255,255,255,0.18), inset 0 -3px 8px rgba(0,0,0,0.45)`,
              border: `1.5px solid ${theme.getOpacityStyle('border', 0.25)}`
            }}
          />
          {/* Inner wax stamp stamp-recess */}
          <div 
            className="absolute inset-2.5"
            style={{
              borderRadius: '50% 50% 48% 52% / 48% 52% 50% 50%',
              background: `radial-gradient(circle at 40% 30%, ${sealHighlight}, ${sealColor})`,
              boxShadow: 'inset 2px 3px 8px rgba(0,0,0,0.55), inset -2px -2px 5px rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.3)',
              border: `0.5px solid ${theme.getOpacityStyle('border', 0.15)}`
            }}
          />
          {/* Gold monogram circle border inside seal */}
          <div 
            className="absolute inset-5 opacity-40 border border-dashed"
            style={{ 
              borderColor: accent,
              borderRadius: '50% 48% 51% 49% / 51% 49% 50% 50%',
            }} 
          />
          {/* Embossed symbol / letter in the center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span 
              className={`text-3xl md:text-4xl font-semibold select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] ${theme.fontDisplay}`} 
              style={{ 
                color: accent,
                textShadow: `0 0 10px rgba(${theme.accentRgb}, 0.5)`
              }}
            >
              {ds.centerIcon || '✦'}
            </span>
            <span 
              className={`text-[7px] md:text-[9px] tracking-[0.28em] font-bold uppercase mt-0.5 select-none ${theme.fontDisplay}`} 
              style={{ 
                color: accent,
                opacity: 0.85,
                textShadow: '0 1px 3px rgba(0,0,0,0.6)'
              }}
            >
              OPEN
            </span>
          </div>
          {/* Melty wax outer ripple shadow ring - only render on the left side to prevent double animation */}
          {side === 'left' && (
            <div 
              className="absolute inset-[-6px] border animate-ping opacity-20" 
              style={{ 
                borderColor: theme.accent, 
                borderRadius: '50%' 
              }} 
            />
          )}
        </div>
      </div>
    )
  }

  const shouldRenderHingesAndHandle = ['classic-doors', 'archway', 'dome'].includes(ds.type);

  if (theme.openingVideoUrl) {
    return (
      <div 
        className="fixed inset-0 z-[100] bg-black cursor-pointer flex items-center justify-center overflow-hidden transition-opacity duration-1000 "
        onClick={() => {
          if (doorsOpened) return;
          setIsPressed(true);
          const video = document.getElementById('opening-video') as HTMLVideoElement;
          if (video) video.play();
        }}
      >
        <video 
          id="opening-video"
          src={theme.openingVideoUrl} 
          className="w-full h-full object-cover" 
          playsInline 
          muted 
          preload="metadata"
          onEnded={() => onOpen(true)}
        />
        <AnimatePresence>
          {!isPressed && !doorsOpened && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="px-6 py-3 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/90 text-sm uppercase tracking-widest animate-pulse">
                Tap anywhere to open
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <>
      {/* ─── ENHANCED CINEMATIC BACKGROUND ─── */}
      <div className="absolute inset-0" style={{ backgroundColor: theme.bgSecondary }}>
        {/* Deep radial sky glow */}
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse at 50% 40%, rgba(${a},0.18) 0%, rgba(${a},0.06) 30%, transparent 65%)`
        }} />
        {/* Starfield */}
        {stars.map((star, i) => (
          <m.div
            key={i}
            className="absolute rounded-full"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, star.opacity, star.opacity * 0.6, star.opacity], scale: 1 }}
            transition={{ delay: star.delay, duration: 1.5, repeat: Infinity, repeatType: 'reverse', repeatDelay: 2 + star.delay }}
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: theme.accent,
              boxShadow: `0 0 ${star.size * 3}px ${theme.accent}`,
            }}
          />
        ))}

        {/* Door glow animation background */}
        {!doorsOpened && (
          <div className="absolute inset-0 animate-door-glow">
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, rgba(${a},0.12) 0%, rgba(${a},0.04) 40%, transparent 70%)` }} />
          </div>
        )}
        {doorsOpened && (
          <m.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }} className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, rgba(${a},0.22) 0%, rgba(${a},0.08) 40%, transparent 70%)` }} />
        )}
      </div>

      {/* Light leak effect - between doors */}
      <LightLeak accentRgb={theme.accentRgb} doorsOpened={doorsOpened} />

      {/* Door Frame - visible behind the doors */}
      <div className={doorsOpened ? 'door-frame-shadow' : ''} style={doorsOpened ? { transition: 'opacity 2s ease-out' } : {}}>
        <DoorFrame theme={theme} />
      </div>

      {/* Left Panel */}
      <m.div
        className={`absolute top-0 left-0 w-1/2 h-full ${!doorsOpened ? idleClass : ''}`}
        style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d', willChange: 'transform' }}
        initial={{ rotateY: 0, x: 0, rotateZ: 0, scaleX: 1, y: 0 }}
        animate={
          doorsOpened
            ? ds.type === 'curtains' ? { x: '-100%' }
            : ds.type === 'petals' || ds.type === 'lotus' ? { rotateZ: -45, opacity: 0 }
            : ds.type === 'scroll' ? { scaleX: 0 }
            : ds.type === 'split-screen' || ds.type === 'geometric' ? { x: '-100%' }
            : ds.type === 'dome' ? { rotateY: -100 }
            : ds.type === 'lantern' ? { y: '-100%', opacity: 0 }
            : { rotateY: -110 }
            : {}
        }
        transition={{ duration: 2.6, ease: [0.25, 1, 0.5, 1] }}
      >
        {/* Front face of door */}
        <div className="relative w-full h-full border-r overflow-hidden"
          style={{
            background: getPanelGradient(true),
            borderColor: theme.borderSubtle,
            backfaceVisibility: 'hidden',
          }}
        >
          <DoorSurface theme={theme} side="left" />
          {renderDoorTypeOverlays('left')}
          <div className="absolute inset-0 door-shimmer" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, transparent, ${theme.getOpacityStyle('text', 0.05)})` }} />
          {/* Vignette shadow overlay - sits under panel content */}
          <div 
            className="absolute inset-0 transition-opacity duration-[3200ms] pointer-events-none z-[1]"
            style={{
              background: `linear-gradient(to left, rgba(0,0,0,0.4), transparent)`,
              opacity: doorsOpened ? 0 : 0.85,
            }}
          />
          {/* Panel layout */}
          <DoorPanelLayout theme={theme} side="left" />
          <DoorPanelContent theme={theme} text={ds.leftText} textLang={ds.leftTextLang} />
          {shouldRenderHingesAndHandle && <DoorHandle theme={theme} side="left" />}
          {/* Center seam vertical golden divider */}
          <div className="absolute right-0 top-0 bottom-0 w-[3px] z-20 transition-all duration-300" style={{
            background: `linear-gradient(to bottom, transparent, ${theme.accent}, transparent)`,
            boxShadow: isHovered ? `0 0 12px ${theme.accent}` : 'none'
          }} />
          {/* Hinges on hinge side (left) */}
          {shouldRenderHingesAndHandle && <DoorHinges side="left" accent={theme.accent} accentRgb={theme.accentRgb} />}
          {/* Left half of breaking wax seal */}
          {renderWaxSealHalf('left')}
        </div>
        {/* 3D Edge face (door thickness) */}
        {renderEdgeFace('left')}
      </m.div>

      {/* Right Panel */}
      <m.div
        className={`absolute top-0 right-0 w-1/2 h-full ${!doorsOpened ? idleClass : ''}`}
        style={{ transformOrigin: 'right center', transformStyle: 'preserve-3d', willChange: 'transform' }}
        initial={{ rotateY: 0, x: 0, rotateZ: 0, scaleX: 1, y: 0 }}
        animate={
          doorsOpened
            ? ds.type === 'curtains' ? { x: '100%' }
            : ds.type === 'petals' || ds.type === 'lotus' ? { rotateZ: 45, opacity: 0 }
            : ds.type === 'scroll' ? { scaleX: 0 }
            : ds.type === 'split-screen' || ds.type === 'geometric' ? { x: '100%' }
            : ds.type === 'dome' ? { rotateY: 100 }
            : ds.type === 'lantern' ? { y: '100%', opacity: 0 }
            : { rotateY: 110 }
            : {}
        }
        transition={{ duration: 2.6, ease: [0.25, 1, 0.5, 1] }}
      >
        {/* Front face of door */}
        <div className="relative w-full h-full border-l overflow-hidden"
          style={{
            background: getPanelGradient(false),
            borderColor: theme.borderSubtle,
            backfaceVisibility: 'hidden',
          }}
        >
          <DoorSurface theme={theme} side="right" />
          {renderDoorTypeOverlays('right')}
          <div className="absolute inset-0 door-shimmer" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to left, transparent, ${theme.getOpacityStyle('text', 0.05)})` }} />
          {/* Vignette shadow overlay - sits under panel content */}
          <div 
            className="absolute inset-0 transition-opacity duration-[3200ms] pointer-events-none z-[1]"
            style={{
              background: `linear-gradient(to right, rgba(0,0,0,0.4), transparent)`,
              opacity: doorsOpened ? 0 : 0.85,
            }}
          />
          {/* Panel layout */}
          <DoorPanelLayout theme={theme} side="right" />
          <DoorPanelContent theme={theme} text={ds.rightText} textLang={ds.rightTextLang} />
          {shouldRenderHingesAndHandle && <DoorHandle theme={theme} side="right" />}
          {/* Center seam vertical golden divider */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] z-20 transition-all duration-300" style={{
            background: `linear-gradient(to bottom, transparent, ${theme.accent}, transparent)`,
            boxShadow: isHovered ? `0 0 12px ${theme.accent}` : 'none'
          }} />
          {/* Hinges on hinge side (right) */}
          {shouldRenderHingesAndHandle && <DoorHinges side="right" accent={theme.accent} accentRgb={theme.accentRgb} />}
          {/* Right half of breaking wax seal */}
          {renderWaxSealHalf('right')}
        </div>
        {/* 3D Edge face (door thickness) */}
        {renderEdgeFace('right')}
      </m.div>

      {/* Center tap-to-open button (invisible click target) */}
      {!doorsOpened && (
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
          <button
            onClick={() => onOpen()}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false)
              setIsPressed(false)
            }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => {
              setIsPressed(false)
              setIsHovered(false)
            }}
            className="w-28 h-28 md:w-36 md:h-36 cursor-pointer rounded-full focus:outline-none select-none pointer-events-auto bg-transparent border-none"
            aria-label="Open invitation"
          />
        </div>
      )}

      {/* Accessibility / Direct Details Bypass */}
      {!doorsOpened && (
        <div className="absolute bottom-10 left-0 right-0 flex justify-center z-[100]">
          <button
            onClick={() => onOpen(true)}
            className="px-4 py-2 rounded-full border bg-black/40 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/60 transition-all text-xs tracking-wider flex items-center gap-2"
            style={{ borderColor: theme.getOpacityStyle('border', 0.2) }}
          >
            Skip Animation
          </button>
        </div>
      )}

      {/* Particle Canvas Emitter */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-50" />
    </>
  )
}
