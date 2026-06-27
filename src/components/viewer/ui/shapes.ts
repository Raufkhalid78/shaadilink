
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




/* ─── Heart Path Helper ─── */
export const drawHeartPath = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  ctx.beginPath()
  const topCurveHeight = h * 0.3
  ctx.moveTo(x + w / 2, y + topCurveHeight)
  // Top-left curve
  ctx.bezierCurveTo(
    x + w / 2, y,
    x, y,
    x, y + topCurveHeight + (h - topCurveHeight) * 0.15
  )
  // Bottom-left curve
  ctx.bezierCurveTo(
    x, y + topCurveHeight + (h - topCurveHeight) * 0.6,
    x + w / 2 - w * 0.05, y + h - h * 0.05,
    x + w / 2, y + h
  )
  // Bottom-right curve
  ctx.bezierCurveTo(
    x + w / 2 + w * 0.05, y + h - h * 0.05,
    x + w, y + topCurveHeight + (h - topCurveHeight) * 0.6,
    x + w, y + topCurveHeight + (h - topCurveHeight) * 0.15
  )
  // Top-right curve
  ctx.bezierCurveTo(
    x + w, y,
    x + w / 2, y,
    x + w / 2, y + topCurveHeight
  )
  ctx.closePath()
}

export const getHeartSvgPath = (w: number, h: number, margin = 0) => {
  const x = margin
  const y = margin
  const width = w - margin * 2
  const height = h - margin * 2
  const topCurveHeight = height * 0.3
  
  const startX = x + width / 2
  const startY = y + topCurveHeight
  
  return `M ${startX} ${startY}
          C ${startX} ${y}, ${x} ${y}, ${x} ${startY + (height - topCurveHeight) * 0.15}
          C ${x} ${startY + (height - topCurveHeight) * 0.6}, ${startX - width * 0.05} ${y + height - height * 0.05}, ${startX} ${y + height}
          C ${startX + width * 0.05} ${y + height - height * 0.05}, ${x + width} ${startY + (height - topCurveHeight) * 0.6}, ${x + width} ${startY + (height - topCurveHeight) * 0.15}
          C ${x + width} ${y}, ${startX} ${y}, ${startX} ${startY} Z`
}