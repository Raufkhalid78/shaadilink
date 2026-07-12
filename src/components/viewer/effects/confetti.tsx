
'use client'
// @ts-nocheck
type ConfettiPiece = any;

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


/* ─── Confetti ─── */
export function ConfettiDisplay({ show, colors: propColors }: { show: boolean; colors?: string[] }) {
  const colors = propColors || ['#b4914d', '#d4a853', '#e8c66a', '#22c55e', '#f0d78c', '#fff4d0', '#e8a4b8']
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    if (show) {
      const generated = Array.from({ length: 50 }).map(() => {
        const w = 4 + Math.random() * 8
        return {
          left: Math.random() * 100,
          width: w,
          height: w * 0.6,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 0.8,
          duration: 2 + Math.random() * 2,
          rotation: Math.random() * 360,
        }
      })
      setPieces(generated)
    } else {
      setPieces([])
    }
  }, [show])

  if (!show || pieces.length === 0) return null

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none overflow-hidden">
      {pieces.map((p, i) => (
        <div
          key={i}
          className="absolute confetti-piece"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: `${p.width}px`,
            height: `${p.height}px`,
            backgroundColor: p.color,
            borderRadius: '1px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}
