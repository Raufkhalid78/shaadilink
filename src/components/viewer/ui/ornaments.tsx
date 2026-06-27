
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


export function CornerOrnament({ 
  position, 
  themeId,
  accentColor 
}: { 
  position: 'tl' | 'tr' | 'bl' | 'br'; 
  themeId?: string;
  accentColor?: string 
}) {
  if (themeId === 'minimal-white') {
    // Clean modern minimalism has no corner ornaments
    return null
  }
  
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

  // Geometric style
  if (themeId === 'geometric-gold') {
    return (
      <svg
        className={`absolute ${classes[position]} w-12 h-12 sm:w-16 sm:h-16 opacity-35 z-10 ${transforms[position]}`}
        viewBox="0 0 60 60"
        fill="none"
      >
        <path d="M5 5 L5 40 L12 40 L12 12 L40 12 L40 5 Z" fill={color} opacity="0.12" />
        <path d="M5 5 L5 45 M5 5 L45 5" stroke={color} strokeWidth="1.5" />
        <path d="M10 10 L10 25 M10 10 L25 10" stroke={color} strokeWidth="0.8" opacity="0.5" />
      </svg>
    )
  }

  // Modern Minimal style
  if (themeId === 'modern-minimal') {
    return (
      <svg
        className={`absolute ${classes[position]} w-8 h-8 sm:w-10 sm:h-10 opacity-40 z-10 ${transforms[position]}`}
        viewBox="0 0 40 40"
        fill="none"
      >
        <path d="M2 2 L2 20 M2 2 L20 2" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )
  }

  // Pastel/Watercolor/Floral style
  if (themeId === 'pastel-floral' || themeId === 'watercolor-peach' || themeId === 'garden-romance') {
    return (
      <svg
        className={`absolute ${classes[position]} w-16 h-16 sm:w-20 sm:h-20 opacity-30 z-10 ${transforms[position]}`}
        viewBox="0 0 80 80"
        fill="none"
      >
        <path d="M5 5 C 5 20, 10 30, 25 35 C 40 40, 50 35, 55 50" stroke={color} strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <path d="M5 5 C 20 5, 30 10, 35 25" stroke={color} strokeWidth="0.6" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M15 17 Q 18 12, 22 15 Q 18 20, 15 17 Z" fill={color} opacity="0.4" />
        <path d="M28 28 Q 32 24, 35 28 Q 30 33, 28 28 Z" fill={color} opacity="0.4" />
        <circle cx="5" cy="5" r="2.5" fill={color} opacity="0.6" />
      </svg>
    )
  }

  // Default: Royal/Traditional Ornate Zareqia scroll
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