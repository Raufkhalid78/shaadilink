
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



/* ─── Scroll Reveal Section Wrapper ─── */
export function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.9, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function getMapEmbedQuery(googleMapsUrl?: string, address?: string, fallback?: string): string {
  if (!googleMapsUrl) {
    return address || fallback || 'Pakistan';
  }

  try {
    // 1. Check for coordinates in URL path: e.g. /@31.5204,74.3587,17z
    const coordMatch = googleMapsUrl.match(/@(-?[0-9\.]+),(-?[0-9\.]+)/);
    if (coordMatch) {
      return `${coordMatch[1]},${coordMatch[2]}`;
    }

    // 2. Check for standard query parameters (q or query)
    const urlObj = new URL(googleMapsUrl);
    const qParam = urlObj.searchParams.get('q') || urlObj.searchParams.get('query');
    if (qParam) {
      return qParam;
    }

    // 3. Check for place name in path: e.g. /place/Grand+Palace/
    const placeMatch = googleMapsUrl.match(/\/place\/([^/]+)/);
    if (placeMatch) {
      return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    }
  } catch (e) {
    // Fail-safe: if URL parser fails, fallback to regex or address
  }

  // Fallback to text address
  return address || fallback || 'Pakistan';
}