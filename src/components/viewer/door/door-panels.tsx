
'use client'

import { DoorSvgPattern } from './door-patterns';


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


/* ─── Door Panel Layout Renderer ─── */
export function DoorPanelLayout({ theme, side }: { theme: TemplateTheme; side: 'left' | 'right' }) {
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
            border: `2.5px solid rgba(${a},0.45)`,
            borderRadius: '3px',
          }} />
        </>
      )
    case 'flat':
    default:
      // Render a modern clean inset border for flat panels so they are visible
      return (
        <div className="absolute" style={{
          left: '8%', top: '6%', width: '84%', height: '88%',
          border: `1.5px solid rgba(${a}, 0.55)`,
          borderRadius: '4px',
          boxShadow: `inset 0 0 12px rgba(${a}, 0.15)`,
        }} />
      )
  }
}

/* ─── 3D Door Panel Inset (Raised Panel) - Multi-Layout ─── */
export function DoorPanelInset({ x, y, w, h, accent, accentRgb, arched }: { x: string; y: string; w: string; h: string; accent: string; accentRgb: string; arched?: boolean }) {
  return (
    <div className="absolute overflow-hidden" style={{
      left: x, top: y, width: w, height: h,
      background: `linear-gradient(145deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 100%)`,
      border: `1.5px solid rgba(${accentRgb},0.35)`,
      borderTopColor: `rgba(${accentRgb},0.6)`,
      borderLeftColor: `rgba(${accentRgb},0.5)`,
      borderBottomColor: `rgba(${accentRgb},0.18)`,
      borderRightColor: `rgba(${accentRgb},0.18)`,
      borderRadius: arched ? '10px 10px 4px 4px' : '4px',
      boxShadow: `inset 3px 3px 10px rgba(0,0,0,0.7), inset -3px -3px 8px rgba(255,255,255,0.06), 0 2px 6px rgba(0,0,0,0.4)`,
    }}>
      {/* Top architectural light highlight */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: `radial-gradient(ellipse at 50% 0%, rgba(${accentRgb},0.2) 0%, transparent 65%)`
        }} 
      />

      {/* Inner recess border - gives raised panel effect */}
      <div className="absolute" style={{
        left: '5px', top: '5px', right: '5px', bottom: '5px',
        border: `1px solid rgba(${accentRgb},0.14)`,
        borderRadius: arched ? '7px 7px 2px 2px' : '2px',
        boxShadow: `inset 0 1px 3px rgba(0,0,0,0.2), 0 0.5px 1px rgba(${accentRgb},0.1)`,
      }} />

      {/* Ornate corner filigree brackets */}
      <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t border-l opacity-50" style={{ borderColor: accent }} />
      <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t border-r opacity-50" style={{ borderColor: accent }} />
      <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b border-l opacity-50" style={{ borderColor: accent }} />
      <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b border-r opacity-50" style={{ borderColor: accent }} />

      {/* Subtle inner highlight - simulates light catching the panel edge */}
      <div className="absolute" style={{
        left: '1px', top: '1px', right: '60%', bottom: '85%',
        background: `linear-gradient(135deg, rgba(${accentRgb},0.25), transparent)`,
        borderRadius: arched ? '7px 0 0 0' : '3px 0 0 0',
      }} />

      {/* Arched top detail */}
      {arched && (
        <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-[85%] h-[32%] opacity-40" viewBox="0 0 100 30" fill="none">
          <path d="M5 30 Q5 5 50 2 Q95 5 95 30" stroke={`rgba(${accentRgb},0.65)`} strokeWidth="0.8" fill="none" />
        </svg>
      )}
    </div>
  )
}

/* ─── Door Panel Content ─── */
export function DoorPanelContent({ theme, text, textLang }: { theme: TemplateTheme; text: string; textLang: string }) {
  const isRtl = textLang === 'ar' || textLang === 'ur'
  const ds = theme.doorStyle
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        {/* Central ornament - varies by svgPattern (boosted opacity for visibility) */}
        <svg className="w-24 h-24 opacity-85" viewBox="0 0 100 100" fill="none">
          {ds.svgPattern === 'arch' && (
            <>
              <circle cx="50" cy="50" r="40" stroke={theme.accent} strokeWidth="0.8" opacity="0.75" />
              <circle cx="50" cy="50" r="30" stroke={theme.accent} strokeWidth="0.6" opacity="0.65" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
                <line key={a} x1="50" y1="10" x2="50" y2="90" stroke={theme.accent} strokeWidth="0.4" opacity="0.45" transform={`rotate(${a} 50 50)`} />
              ))}
            </>
          )}
          {ds.svgPattern === 'floral' && (
            <>
              <circle cx="50" cy="50" r="25" stroke={theme.accent} strokeWidth="0.8" opacity="0.75" />
              {[0, 72, 144, 216, 288].map(a => (
                <ellipse key={a} cx="50" cy="25" rx="6" ry="14" stroke={theme.accent} strokeWidth="0.6" opacity="0.65" transform={`rotate(${a} 50 50)`} />
              ))}
            </>
          )}
          {ds.svgPattern === 'minimal' && (
            <>
              <line x1="20" y1="50" x2="80" y2="50" stroke={theme.accent} strokeWidth="0.8" opacity="0.7" />
              <line x1="50" y1="20" x2="50" y2="80" stroke={theme.accent} strokeWidth="0.8" opacity="0.7" />
              <circle cx="50" cy="50" r="3.5" fill={theme.accent} opacity="0.8" />
            </>
          )}
          {ds.svgPattern === 'mandala' && (
            <>
              <circle cx="50" cy="50" r="35" stroke={theme.accent} strokeWidth="0.8" opacity="0.65" />
              <circle cx="50" cy="50" r="22" stroke={theme.accent} strokeWidth="0.6" opacity="0.55" />
              <circle cx="50" cy="50" r="10" stroke={theme.accent} strokeWidth="0.5" opacity="0.45" />
              {Array.from({ length: 12 }).map((_, i) => (
                <line key={i} x1="50" y1="15" x2="50" y2="85" stroke={theme.accent} strokeWidth="0.35" opacity="0.4" transform={`rotate(${i * 30} 50 50)`} />
              ))}
            </>
          )}
          {ds.svgPattern === 'paisley' && (
            <>
              <path d="M50 20 Q70 35 65 55 Q60 70 45 65 Q30 55 35 40 Q40 25 50 20Z" stroke={theme.accent} strokeWidth="0.8" opacity="0.75" fill="none" />
              <path d="M50 25 Q60 35 55 50 Q50 60 42 55" stroke={theme.accent} strokeWidth="0.5" opacity="0.6" fill="none" />
            </>
          )}
          {ds.svgPattern === 'diamond' && (
            <>
              <polygon points="50,15 85,50 50,85 15,50" stroke={theme.accent} strokeWidth="0.8" opacity="0.7" fill="none" />
              <polygon points="50,30 70,50 50,70 30,50" stroke={theme.accent} strokeWidth="0.6" opacity="0.6" fill="none" />
            </>
          )}
          {ds.svgPattern === 'dome' && (
            <>
              <path d="M20 60 Q20 25 50 15 Q80 25 80 60" stroke={theme.accent} strokeWidth="0.8" opacity="0.7" fill="none" />
              <line x1="50" y1="15" x2="50" y2="8" stroke={theme.accent} strokeWidth="0.8" opacity="0.7" />
              <circle cx="50" cy="6" r="3.5" stroke={theme.accent} strokeWidth="0.6" opacity="0.65" fill="none" />
            </>
          )}
          {ds.svgPattern === 'star' && (
            <>
              <polygon points="50,15 57,38 80,38 62,52 68,75 50,62 32,75 38,52 20,38 43,38" stroke={theme.accent} strokeWidth="0.8" opacity="0.7" fill="none" />
              <polygon points="50,25 54,38 65,38 56,46 59,58 50,52 41,58 44,46 35,38 46,38" stroke={theme.accent} strokeWidth="0.5" opacity="0.55" fill="none" />
            </>
          )}
          {ds.svgPattern === 'lantern' && (
            <>
              <path d="M35 40 Q35 25 50 20 Q65 25 65 40" stroke={theme.accent} strokeWidth="0.8" opacity="0.7" fill="none" />
              <rect x="37" y="40" width="26" height="30" stroke={theme.accent} strokeWidth="0.6" opacity="0.6" fill="none" rx="2" />
              <path d="M37 70 Q37 80 50 85 Q63 80 65 70" stroke={theme.accent} strokeWidth="0.8" opacity="0.7" fill="none" />
            </>
          )}
          {ds.svgPattern === 'geometric' && (
            <>
              <polygon points="50,20 70,35 70,60 50,75 30,60 30,35" stroke={theme.accent} strokeWidth="0.8" opacity="0.7" fill="none" />
              <polygon points="50,30 60,38 60,55 50,63 40,55 40,38" stroke={theme.accent} strokeWidth="0.5" opacity="0.55" fill="none" />
            </>
          )}
        </svg>
        <div className="flex items-center justify-center gap-2 opacity-80 mb-1">
          <div className="w-6 h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent})` }} />
          <span className="text-[10px]" style={{ color: theme.accent }}>✦</span>
          <div className="w-6 h-px" style={{ background: `linear-gradient(270deg, transparent, ${theme.accent})` }} />
        </div>
        <span
          className={`${theme.fontCalligraphy} text-3xl sm:text-4xl leading-relaxed tracking-wide`}
          dir={isRtl ? 'rtl' : 'ltr'}
          style={{ 
            color: theme.getOpacityStyle('text', 0.95), 
            textShadow: theme.isLight ? 'none' : `0 2px 10px rgba(0,0,0,0.7), 0 0 15px rgba(${theme.accentRgb},0.3)` 
          }}
        >
          {text}
        </span>
        <div className="flex items-center justify-center gap-2 opacity-75 mt-1">
          <div className="w-8 h-[1.5px]" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent})` }} />
          <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: theme.accent }} />
          <div className="w-8 h-[1.5px]" style={{ background: `linear-gradient(270deg, transparent, ${theme.accent})` }} />
        </div>
      </div>
    </div>
  )
}

/* ─── Realistic Door Surface Material ─── */
export function DoorSurface({ theme, side }: { theme: TemplateTheme; side: 'left' | 'right' }) {
  const ds = theme.doorStyle
  const a = theme.accentRgb

  const escapedAccent = theme.accent.replace('#', '%23')
  const boardSeamsPattern = `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='0'%3E%3Cstop offset='0' stop-color='${escapedAccent}' stop-opacity='0.03'/%3E%3Cstop offset='0.5' stop-color='${escapedAccent}' stop-opacity='0.06'/%3E%3Cstop offset='1' stop-color='${escapedAccent}' stop-opacity='0.02'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='200' height='200'/%3E%3Cpath d='M25 0v200M55 0v200M85 0v200M115 0v200M145 0v200M175 0v200' stroke='${escapedAccent}' stroke-width='0.4' opacity='0.25'/%3E%3C/svg%3E")`

  // Material-specific CSS background textures
  const materialStyles: Record<string, React.CSSProperties> = {
    wood: {
      backgroundImage: `
        ${boardSeamsPattern},
        repeating-linear-gradient(90deg, transparent 0px, rgba(${a},0.02) 1px, transparent 2px, transparent 8px),
        repeating-linear-gradient(180deg, rgba(${a},0.015) 0px, transparent 2px, transparent 20px),
        linear-gradient(160deg, ${theme.bgDoor} 0%, ${(theme.id === 'emerald-noir' || theme.id === 'mughal-emerald') ? '#183d35' : '#3d2614'} 35%, ${theme.bgDoor} 60%, ${theme.bgSecondary} 100%)
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
      background: `linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.05) 100%)`,
      backgroundColor: theme.isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(12, 18, 33, 0.92)',
      backdropFilter: 'blur(24px) saturate(120%)',
      border: `2.5px solid ${theme.accent}`,
      boxShadow: `inset 0 1px 3px rgba(255,255,255,0.35), inset 0 0 25px rgba(${a}, 0.25), 0 12px 40px rgba(0, 0, 0, 0.5)`,
    },
    stone: {
      backgroundImage: `
        repeating-linear-gradient(180deg, transparent 0px, rgba(0,0,0,0.15) 1px, transparent 2px, transparent 90px),
        repeating-linear-gradient(90deg, transparent 0px, rgba(0,0,0,0.15) 1px, transparent 2px, transparent 110px),
        radial-gradient(ellipse at 30% 20%, rgba(${a},0.08), transparent 50%),
        radial-gradient(ellipse at 70% 80%, rgba(${a},0.06), transparent 50%),
        linear-gradient(180deg, ${theme.bgDoor}, ${theme.bgSecondary})
      `,
    },
    painted: {
      backgroundImage: `
        ${boardSeamsPattern},
        repeating-linear-gradient(90deg, rgba(0,0,0,0.03) 0px, transparent 1px, transparent 20px, rgba(255,255,255,0.02) 21px, transparent 40px),
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

  const renderMughalEmeraldDetails = () => {
    if (theme.id !== 'mughal-emerald') return null
    const isLeft = side === 'left'
    const gold = '#dfba73'
    const goldLight = '#fbeaa8'
    const rosettesY = [16, 46, 76, 106, 136, 166]

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
        <svg className="absolute inset-0 w-full h-full opacity-90" viewBox="0 0 100 200" preserveAspectRatio="none">
          {/* Side Border Area (Hinge side) */}
          <line 
            x1={isLeft ? '14' : '86'} 
            y1='0' 
            x2={isLeft ? '14' : '86'} 
            y2='200' 
            stroke={gold} 
            strokeWidth='0.8' 
          />
          
          {/* Scalloped Medallions in Side Border */}
          {rosettesY.map((y, i) => {
            const rx = isLeft ? 7 : 93
            return (
              <g key={i}>
                {/* Scalloped Frame */}
                <path 
                  d={`
                    M ${rx} ${y - 9} 
                    Q ${rx + 5} ${y - 9} ${rx + 5} ${y - 5}
                    Q ${rx + 5} ${y} ${rx + 5} ${y + 5}
                    Q ${rx + 5} ${y + 9} ${rx} ${y + 9}
                    Q ${rx - 5} ${y + 9} ${rx - 5} ${y + 5}
                    Q ${rx - 5} ${y} ${rx - 5} ${y - 5}
                    Q ${rx - 5} ${y - 9} ${rx} ${y - 9}
                  `} 
                  fill="none" 
                  stroke={gold} 
                  strokeWidth="0.6" 
                />
                {/* Inner rosette flower */}
                <circle cx={rx} cy={y} r="1.5" fill={goldLight} />
                {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
                  const rad = (deg * Math.PI) / 180
                  const x2 = rx + Math.cos(rad) * 4
                  const y2 = y + Math.sin(rad) * 4
                  return (
                    <line key={deg} x1={rx} y1={y} x2={x2} y2={y2} stroke={gold} strokeWidth="0.4" />
                  )
                })}
              </g>
            )
          })}

          {/* Climbing Wavy Vine Border */}
          <path 
            d={isLeft 
              ? "M 19 0 Q 16 16 19 32 Q 22 48 19 64 Q 16 80 19 96 Q 22 112 19 128 Q 16 144 19 160 Q 22 176 19 192 L 19 200" 
              : "M 81 0 Q 78 16 81 32 Q 84 48 81 64 Q 78 80 81 96 Q 84 112 81 128 Q 78 144 81 160 Q 84 176 81 192 L 81 200"}
            fill="none" 
            stroke={gold} 
            strokeWidth="0.5" 
          />
          {/* Leaves along the vine */}
          {[10, 30, 50, 70, 90, 110, 130, 150, 170, 190].map(y => {
            const vx = isLeft ? 19 : 81
            const dir = y % 20 === 0 ? 1.5 : -1.5
            return (
              <circle key={y} cx={vx + dir} cy={y} r="0.8" fill={goldLight} />
            )
          })}

          {/* Central Panel Layout (Spanning from side-border to center seam) */}
          
          {/* 1. Upper Arched Panel (Y = 8 to Y = 32) */}
          <path 
            d={isLeft 
              ? "M 24 32 L 24 24 Q 24 16 35 14 Q 45 12 55 10 L 100 10 L 100 32 Z" 
              : "M 76 32 L 76 24 Q 76 16 65 14 Q 55 12 45 10 L 0 10 L 0 32 Z"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.8" 
          />
          {/* Inner details for upper arched panel */}
          <path 
            d={isLeft 
              ? "M 27 30 L 27 25 Q 27 18 36 16 Q 46 14 56 12 L 100 12" 
              : "M 73 30 L 73 25 Q 73 18 64 16 Q 54 14 44 12 L 0 12"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.4" 
            strokeDasharray="1.5,1.5" 
          />
          {/* Branching bouquet inside upper arched panel */}
          <path 
            d={isLeft 
              ? "M 100 32 Q 85 28 85 22 Q 85 16 93 14" 
              : "M 0 32 Q 15 28 15 22 Q 15 16 7 14"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.6" 
          />
          <path 
            d={isLeft 
              ? "M 100 28 Q 78 26 75 18" 
              : "M 0 28 Q 22 26 25 18"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.5" 
          />
          <circle cx={isLeft ? 85 : 15} cy="22" r="1.5" fill={goldLight} />
          <circle cx={isLeft ? 75 : 25} cy="18" r="1.5" fill={goldLight} />
          <circle cx={isLeft ? 93 : 7} cy="14" r="1" fill={goldLight} />

          {/* 2. Middle Panel (Y = 35 to Y = 135) */}
          <rect 
            x={isLeft ? '24' : '0'} 
            y='35' 
            width='76' 
            height='100' 
            fill='none' 
            stroke={gold} 
            strokeWidth='0.8' 
          />
          <rect 
            x={isLeft ? '26' : '2'} 
            y='37' 
            width='72' 
            height='96' 
            fill='none' 
            stroke={gold} 
            strokeWidth='0.4' 
            strokeDasharray="2,2" 
          />

          {/* Oval Medallion inside Middle Panel */}
          <path 
            d={isLeft 
              ? "M 100 45 C 55 45 38 65 38 85 C 38 105 55 125 100 125" 
              : "M 0 45 C 45 45 62 65 62 85 C 62 105 45 125 0 125"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="1.2" 
          />
          {/* Inner bead border of Oval */}
          <path 
            d={isLeft 
              ? "M 100 48 C 58 48 41 67 41 85 C 41 103 58 122 100 122" 
              : "M 0 48 C 42 48 59 67 59 85 C 59 103 42 122 0 122"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.4" 
            strokeDasharray="1,2" 
          />

          {/* Tree of Life Inside Oval */}
          {/* Main trunk along center seam */}
          <line 
            x1={isLeft ? '100' : '0'} 
            y1='122' 
            x2={isLeft ? '100' : '0'} 
            y2='50' 
            stroke={gold} 
            strokeWidth='2' 
          />
          
          {/* Branches curving out from trunk */}
          {/* Lower branch */}
          <path 
            d={isLeft 
              ? "M 100 110 Q 75 108 65 95 C 55 82 72 75 75 88" 
              : "M 0 110 Q 25 108 35 95 C 45 82 28 75 25 88"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.8" 
          />
          <circle cx={isLeft ? 75 : 25} cy="88" r="2.2" fill={goldLight} />
          
          {/* Middle branch */}
          <path 
            d={isLeft 
              ? "M 100 90 Q 70 85 58 72 C 48 60 62 55 64 65" 
              : "M 0 90 Q 30 85 42 72 C 52 60 38 55 36 65"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.8" 
          />
          <circle cx={isLeft ? 64 : 36} cy="65" r="2" fill={goldLight} />

          {/* Upper branch */}
          <path 
            d={isLeft 
              ? "M 100 70 Q 78 65 70 54 C 65 45 74 42 76 50" 
              : "M 0 70 Q 22 65 30 54 C 35 45 26 42 24 50"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.6" 
          />
          <circle cx={isLeft ? 76 : 24} cy="50" r="1.8" fill={goldLight} />

          {/* Top branching shoots */}
          <path 
            d={isLeft 
              ? "M 100 58 Q 88 52 86 44" 
              : "M 0 58 Q 12 52 14 44"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.5" 
          />
          <circle cx={isLeft ? 86 : 14} cy="44" r="1" fill={goldLight} />

          {/* Corner Scrolls (Outside Oval, inside middle panel) */}
          {/* Top Corner Scroll */}
          <path 
            d={isLeft 
              ? "M 28 40 Q 38 40 38 48 C 38 54 30 54 33 46" 
              : "M 72 40 Q 62 40 62 48 C 62 54 70 54 67 46"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.5" 
          />
          <circle cx={isLeft ? 33 : 67} cy="46" r="1" fill={goldLight} />
          {/* Bottom Corner Scroll */}
          <path 
            d={isLeft 
              ? "M 28 130 Q 38 130 38 122 C 38 116 30 116 33 124" 
              : "M 72 130 Q 62 130 62 122 C 62 116 70 116 67 124"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.5" 
          />
          <circle cx={isLeft ? 33 : 67} cy="124" r="1" fill={goldLight} />


          {/* 3. Bottom Panel (Y = 138 to Y = 192) */}
          <rect 
            x={isLeft ? '24' : '0'} 
            y='138' 
            width='76' 
            height='54' 
            fill='none' 
            stroke={gold} 
            strokeWidth='0.8' 
          />
          <rect 
            x={isLeft ? '26' : '2'} 
            y='140' 
            width='72' 
            height='50' 
            fill='none' 
            stroke={gold} 
            strokeWidth='0.4' 
            strokeDasharray="2,2" 
          />

          {/* Bottom Horizontal Oval Medallion */}
          <path 
            d={isLeft 
              ? "M 100 148 C 50 148 34 154 34 165 C 34 176 50 182 100 182" 
              : "M 0 148 C 50 148 66 154 66 165 C 66 176 50 182 0 182"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="1" 
          />
          {/* Flowering branch inside Bottom Oval */}
          <path 
            d={isLeft 
              ? "M 100 165 Q 65 160 55 165 C 45 170 58 178 66 174" 
              : "M 0 165 Q 35 160 45 165 C 55 170 42 178 34 174"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.6" 
          />
          <circle cx={isLeft ? 66 : 34} cy="174" r="1.8" fill={goldLight} />
          <path 
            d={isLeft 
              ? "M 85 163 Q 75 152 78 156" 
              : "M 15 163 Q 25 152 22 156"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.5" 
          />
          <circle cx={isLeft ? 78 : 22} cy="156" r="1.2" fill={goldLight} />
        </svg>
      </div>
    )
  }

  let baseStyle = materialStyles[ds.doorMaterial] || materialStyles.wood;

  if (ds.type === 'curtains') {
    baseStyle = {
      backgroundImage: `
        linear-gradient(90deg, 
          rgba(0,0,0,0.45) 0%, 
          rgba(255,255,255,0.06) 8%, 
          rgba(0,0,0,0.15) 16%, 
          rgba(255,255,255,0.04) 24%, 
          rgba(0,0,0,0.35) 32%, 
          rgba(255,255,255,0.08) 40%, 
          rgba(0,0,0,0.2) 48%, 
          rgba(255,255,255,0.06) 56%, 
          rgba(0,0,0,0.35) 64%, 
          rgba(255,255,255,0.08) 72%, 
          rgba(0,0,0,0.2) 80%, 
          rgba(255,255,255,0.06) 88%, 
          rgba(0,0,0,0.5) 100%
        ),
        linear-gradient(180deg, ${theme.bgDoor}, ${theme.bgSecondary})
      `,
      boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.6)',
    };
  } else if (ds.type === 'scroll') {
    baseStyle = {
      backgroundImage: `
        linear-gradient(0deg, rgba(0,0,0,0.2) 0%, transparent 6%, transparent 94%, rgba(0,0,0,0.2) 100%),
        repeating-linear-gradient(0deg, transparent 0px, rgba(${a}, 0.015) 2px, transparent 4px),
        linear-gradient(90deg, rgba(${a}, 0.15) 0%, transparent 8%, transparent 92%, rgba(${a}, 0.15) 100%),
        linear-gradient(180deg, ${theme.bgDoor}, ${theme.bgSecondary})
      `,
      border: `2px solid ${theme.accent}`,
      boxShadow: `0 10px 30px rgba(0,0,0,0.45), inset 0 0 25px rgba(0,0,0,0.3)`,
    };
  } else if (ds.type === 'petals' || ds.type === 'lotus') {
    baseStyle = {
      backgroundImage: `
        radial-gradient(circle at 100% 50%, rgba(${a},0.06) 0%, transparent 65%),
        radial-gradient(circle at 0% 50%, rgba(${a},0.06) 0%, transparent 65%),
        linear-gradient(180deg, ${theme.bgDoor}, ${theme.bgSecondary})
      `,
    };
  } else if (ds.type === 'archway') {
    baseStyle = {
      backgroundImage: `
        repeating-linear-gradient(90deg, transparent 0px, rgba(0,0,0,0.12) 30px, transparent 31px),
        repeating-linear-gradient(0deg, transparent 0px, rgba(0,0,0,0.12) 15px, transparent 16px),
        radial-gradient(circle at 50% 50%, transparent 20%, rgba(0,0,0,0.35) 100%),
        linear-gradient(180deg, ${theme.bgDoor}, ${theme.bgSecondary})
      `,
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)',
    };
  } else if (ds.type === 'lantern') {
    baseStyle = {
      backgroundImage: `
        radial-gradient(circle at 50% 50%, rgba(255, 244, 200, 0.22) 0%, transparent 70%),
        linear-gradient(180deg, ${theme.bgDoor}, ${theme.bgSecondary})
      `,
      boxShadow: `inset 0 0 25px rgba(${a}, 0.15), 0 0 10px rgba(${a}, 0.05)`,
    };
  } else if (ds.type === 'dome') {
    baseStyle = {
      backgroundImage: `
        radial-gradient(circle at 50% 10%, rgba(${a}, 0.08) 0%, transparent 60%),
        linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(0,0,0,0.25) 100%),
        linear-gradient(180deg, ${theme.bgDoor}, ${theme.bgSecondary})
      `,
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.35)',
    };
  }

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      {/* Material base texture */}
      <div className="absolute inset-0" style={baseStyle} />
      {/* Glass-specific frosted overlay & sheen reflection */}
      {ds.doorMaterial === 'glass' && (
        <>
          <div className="absolute inset-0" style={{
            background: `radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.06), transparent 60%)`,
          }} />
          <div 
            className="absolute inset-y-0 w-1/2 opacity-20" 
            style={{
              background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4) 50%, transparent)`,
              animation: 'doorShimmerComposited 6s ease-in-out infinite',
            }} 
          />
          <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.18)]" />
        </>
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
      {/* Mughal Emerald custom ornaments */}
      {renderMughalEmeraldDetails()}
    </div>
  )
}
