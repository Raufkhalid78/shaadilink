
'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { MapPin, Calendar, Clock, ChevronDown, Heart, Sparkles, Send, Check, X, Star, Music, Music2, User, MessageCircle, Loader2, Copy, Hotel, Car, Gift, HelpCircle, Info, ChevronLeft, ChevronRight, Maximize, Share2 } from 'lucide-react'
import type { FlowData } from '@/lib/flow-types'
import { TemplateTheme, TEMPLATE_THEMES, DEFAULT_THEME } from '../themes';
import { InvitationViewerProps, hexToRgb, getTheme, extractColors, parseGiftDetails, getCalendarDates, getGoogleCalendarLink, generateICSContent, getOutlookWebLink, formatScratchDate, formatScratchTime } from '../utils';


/* ─── Door Frame - Per-style frame rendering ─── */
export function DoorFrame({ theme }: { theme: TemplateTheme }) {
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
            {/* Outer arch spandrel frame (hollow archway) */}
            <path d="M 0 150 L 0 0 L 400 0 L 400 150 L 400 80 Q 400 0 200 0 Q 0 0 0 80 Z" fill={fc} stroke={`rgba(${a},0.4)`} strokeWidth="2" />
            {/* Inner arch outline */}
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

/* ─── Door Decorative Elements ─── */
export function CurtainEdge({ side, accentRgb }: { side: 'left' | 'right'; accentRgb: string }) {
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

export function DomeCap({ accent }: { accent: string }) {
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

export function ArchwayCap({ accent }: { accent: string }) {
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

export function ScrollCap({ side, accent, accentRgb }: { side: 'top' | 'bottom'; accent: string; accentRgb: string }) {
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

/* ─── Light Leak Effect ─── */
export function LightLeak({ accentRgb, doorsOpened }: { accentRgb: string; doorsOpened: boolean }) {
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