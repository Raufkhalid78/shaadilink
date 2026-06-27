
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


/* ─── Center Button Styles ─── */
export function CenterButton({ theme, onClick }: { theme: TemplateTheme; onClick: () => void }) {
  const ds = theme.doorStyle

  // Organic wax seal colors matching each theme's vibe
  const sealColor = theme.id === 'emerald-noir' || theme.id === 'mughal-emerald'
    ? '#09251c'
    : theme.id === 'crimson-royale' || theme.id === 'royal-elegance'
    ? '#420d14'
    : theme.id === 'rose-gold-blush' || theme.id === 'rose-gold-blush-royal'
    ? '#5c222e'
    : theme.id === 'majestic-love'
    ? '#3b250d'
    : '#1e1a14' // woody/slate brown default

  const sealHighlight = theme.id === 'emerald-noir' || theme.id === 'mughal-emerald'
    ? '#184b3b'
    : theme.id === 'crimson-royale' || theme.id === 'royal-elegance'
    ? '#7c1c27'
    : theme.id === 'rose-gold-blush' || theme.id === 'rose-gold-blush-royal'
    ? '#993f51'
    : theme.id === 'majestic-love'
    ? '#6b4822'
    : '#483f36'

  const accent = theme.accent

  return (
    <motion.button
      onClick={onClick}
      className="relative w-28 h-28 md:w-36 md:h-36 cursor-pointer focus:outline-none select-none z-30"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      animate={{ y: [0, -6, 0] }}
      transition={{ y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } }}
      aria-label="Open invitation"
    >
      {/* Outer irregular melted wax overflow */}
      <div 
        className="absolute inset-0 shadow-2xl transition-all duration-300"
        style={{
          borderRadius: '48% 52% 51% 49% / 51% 48% 52% 49%',
          background: `radial-gradient(circle at 35% 35%, ${sealHighlight}, ${sealColor})`,
          boxShadow: '0 10px 30px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.18), inset 0 -3px 8px rgba(0,0,0,0.45)',
          border: `1px solid ${theme.getOpacityStyle('border', 0.12)}`
        }}
      />
      {/* Inner wax stamp stamp-recess */}
      <div 
        className="absolute inset-2.5"
        style={{
          borderRadius: '50% 50% 48% 52% / 48% 52% 50% 50%',
          background: `radial-gradient(circle at 40% 30%, ${sealHighlight}, ${sealColor})`,
          boxShadow: 'inset 2px 3px 6px rgba(0,0,0,0.45), inset -2px -2px 4px rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.2)',
          border: `0.5px solid ${theme.getOpacityStyle('border', 0.08)}`
        }}
      />
      {/* Gold monogram circle border inside seal */}
      <div 
        className="absolute inset-5 opacity-30 border border-dashed"
        style={{ 
          borderColor: accent,
          borderRadius: '50% 48% 51% 49% / 51% 49% 50% 50%',
        }} 
      />
      {/* Embossed symbol / letter in the center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span 
          className={`text-3xl md:text-4xl font-semibold select-none filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.55)] ${theme.fontDisplay}`} 
          style={{ 
            color: accent,
          }}
        >
          {ds.centerIcon || '❦'}
        </span>
        <span 
          className={`text-[7px] md:text-[9px] tracking-[0.25em] uppercase mt-0.5 select-none opacity-70 ${theme.fontDisplay}`} 
          style={{ 
            color: accent,
            textShadow: '0 1px 2px rgba(0,0,0,0.4)'
          }}
        >
          open
        </span>
      </div>
      {/* Melty wax outer ripple shadow ring */}
      <div 
        className="absolute inset-[-6px] border animate-ping opacity-15" 
        style={{ 
          borderColor: theme.accent, 
          borderRadius: '50%' 
        }} 
      />
    </motion.button>
  )
}