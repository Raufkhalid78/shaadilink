
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


/* ─── Door SVG Pattern Component ─── */
export function DoorSvgPattern({ pattern, accent, accentRgb }: { pattern: string; accent: string; accentRgb: string }) {
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