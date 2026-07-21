
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


/* ─── Background Floating Particles ─── */
export function BackgroundParticles({ accentColor }: { accentColor?: string }) {
  const color = accentColor || '#d4a853'
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const generated = Array.from({ length: 25 }).map(() => ({
      left: Math.random() * 100,
      size: 2 + Math.random() * 3,
      duration: 12 + Math.random() * 20,
      delay: Math.random() * 15,
      opacity: 0.2 + Math.random() * 0.3,
      drift: (Math.random() - 0.5) * 50,
    }))
    setParticles(generated)
  }, [])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-particle"
          style={{
            backgroundColor: color,
            left: `${p.left}%`,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            '--particle-opacity': p.opacity,
            '--particle-duration': `${p.duration}s`,
            '--particle-delay': `${p.delay}s`,
            '--particle-drift': `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
