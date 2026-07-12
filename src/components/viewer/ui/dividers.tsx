
'use client'

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


/* ─── Decorative Divider ─── */
export function GoldDivider({ 
  className = '', 
  themeId,
  accentColor 
}: { 
  className?: string; 
  themeId?: string;
  accentColor?: string 
}) {
  const color = accentColor || 'var(--gold)'
  
  if (themeId === 'minimal-white') {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <div className="h-[1px] w-12" style={{ backgroundColor: `${color}40` }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        <div className="h-[1px] w-12" style={{ backgroundColor: `${color}40` }} />
      </div>
    )
  }
  
  if (themeId === 'modern-minimal') {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <div className="h-[1px] w-16" style={{ backgroundColor: `${color}50` }} />
      </div>
    )
  }

  if (themeId === 'geometric-gold') {
    return (
      <div className={`flex items-center justify-center gap-3 ${className}`}>
        <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${color}80, transparent)` }} />
        <div className="w-2 h-2 border transform rotate-45" style={{ borderColor: color }} />
        <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${color}80, transparent)` }} />
      </div>
    )
  }

  if (themeId === 'pastel-floral' || themeId === 'watercolor-peach' || themeId === 'garden-romance') {
    return (
      <div className={`flex items-center justify-center gap-3 ${className}`}>
        <div className="h-px flex-1 opacity-40" style={{ background: `linear-gradient(to right, transparent, ${color}, transparent)` }} />
        <span className="text-xs" style={{ color }}>✿</span>
        <div className="h-px flex-1 opacity-40" style={{ background: `linear-gradient(to right, transparent, ${color}, transparent)` }} />
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${color}80, transparent)` }} />
      <div className="w-2.5 h-2.5 rotate-45" style={{ border: `1px solid ${color}b3` }} />
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${color}80, transparent)` }} />
    </div>
  )
}

export function HeartDivider({ 
  themeId,
  accentColor 
}: { 
  themeId?: string;
  accentColor?: string 
}) {
  const color = accentColor || 'var(--gold)'
  
  if (themeId === 'minimal-white') {
    return (
      <div className="flex items-center justify-center gap-2 my-5">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `${color}40` }} />
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `${color}40` }} />
      </div>
    )
  }
  
  if (themeId === 'modern-minimal') {
    return (
      <div className="flex items-center justify-center gap-2 my-5">
        <div className="w-10 h-[1px]" style={{ backgroundColor: `${color}40` }} />
        <span className="text-[10px] tracking-widest uppercase font-sans font-medium" style={{ color }}>✦</span>
        <div className="w-10 h-[1px]" style={{ backgroundColor: `${color}40` }} />
      </div>
    )
  }

  if (themeId === 'geometric-gold') {
    return (
      <div className="flex items-center justify-center gap-3 my-6">
        <div className="w-12 h-px" style={{ background: `linear-gradient(to right, transparent, ${color})` }} />
        <div className="w-2 h-2 rotate-45 border" style={{ borderColor: color, backgroundColor: `${color}20` }} />
        <div className="w-12 h-px" style={{ background: `linear-gradient(to left, transparent, ${color})` }} />
      </div>
    )
  }

  if (themeId === 'pastel-floral' || themeId === 'watercolor-peach' || themeId === 'garden-romance') {
    return (
      <div className="flex items-center justify-center gap-3 my-6">
        <div className="w-12 h-px" style={{ backgroundColor: `${color}33` }} />
        <span className="text-sm font-light select-none" style={{ color }}>🌸</span>
        <div className="w-12 h-px" style={{ backgroundColor: `${color}33` }} />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-3 my-6">
      <div className="w-16 h-px" style={{ backgroundColor: `${color}4d` }} />
      <Heart className="w-3 h-3" style={{ color, fill: `${color}33` }} />
      <div className="w-16 h-px" style={{ backgroundColor: `${color}4d` }} />
    </div>
  )
}

/* ─── Wave SVG Divider ─── */
export function WaveDivider({ accentColor }: { accentColor?: string }) {
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
