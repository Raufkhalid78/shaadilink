
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


export function CountdownTimer({
  theme,
  translations,
  targetDate,
  targetTime,
}: {
  theme: TemplateTheme
  translations?: Record<string, string>
  targetDate?: string
  targetTime?: string
}) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  const countdownTarget = useMemo(() => {
    return getCountdownTarget(targetDate, targetTime)
  }, [targetDate, targetTime])

  useEffect(() => {
    function update() {
      const diff = Math.max(0, countdownTarget - Date.now())
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [countdownTarget])

  const t = (key: string, fallback: string) => translations?.[key] || fallback

  const units = [
    { value: timeLeft.days, label: t('days', 'Days') },
    { value: timeLeft.hours, label: t('hours', 'Hours') },
    { value: timeLeft.minutes, label: t('minutes', 'Minutes') },
    { value: timeLeft.seconds, label: t('seconds', 'Seconds') },
  ]

  return (
    <div className="flex gap-3 sm:gap-4 items-center justify-center">
      {units.map((unit, idx) => (
        <React.Fragment key={unit.label}>
          <div className="flex flex-col items-center">
            <div className="rounded-lg backdrop-blur-sm w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center countdown-pulse relative overflow-hidden" style={{ border: `1px solid ${theme.getOpacityStyle('border', 0.25)}`, backgroundColor: theme.getOpacityStyle('border', 0.08) }}>
              <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${theme.getOpacityStyle('text', 0.05)}, transparent)` }} />
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={unit.value}
                  initial={{ y: -15, opacity: 0, rotateX: -90 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  exit={{ y: 15, opacity: 0, rotateX: 90 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className={`${theme.fontDisplay} text-2xl sm:text-3xl font-bold relative z-10`}
                  style={{ color: theme.accent }}
                >
                  {String(unit.value).padStart(2, '0')}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest mt-2" style={{ color: theme.accent }}>{unit.label}</span>
          </div>
          {idx < units.length - 1 && (
            <div className="text-2xl font-light pb-6" style={{ color: theme.getOpacityStyle('text', 0.3) }}>:</div>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

/* ─── Add to Calendar Dropdown ─── */
export function AddToCalendarDropdown({
  event, partner1, partner2, theme, label, location
}: {
  event: { name: string; date: string; time: string; description: string; venue?: string };
  partner1: string; partner2: string; theme: TemplateTheme; label: string; location?: string;
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleAppleCalendar = () => {
    const ics = generateICSContent(event, partner1, partner2, location)
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.name.replace(/\s+/g, '-')}-shaadilink.ics`
    a.click()
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  const options = [
    {
      label: 'Google Calendar',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <text x="12" y="19" textAnchor="middle" fontSize="7" fill="currentColor" fontWeight="bold">G</text>
        </svg>
      ),
      href: getGoogleCalendarLink(event, partner1, partner2, location),
      external: true,
    },
    {
      label: 'Apple Calendar',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 14.5 a2.5 2.5 0 1 1 0-.01z" fill="currentColor"/>
        </svg>
      ),
      onClick: handleAppleCalendar,
    },
    {
      label: 'Outlook / iCal',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <text x="12" y="19" textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="bold">OL</text>
        </svg>
      ),
      href: getOutlookWebLink(event, partner1, partner2, location),
      external: true,
    },
  ]

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border transition-all duration-300 hover:scale-[1.02] ${theme.fontDisplay} hover:opacity-90`}
        style={{
          backgroundColor: theme.getOpacityStyle('bg', 0.05),
          borderColor: theme.borderSubtle,
          color: theme.accent,
        }}
      >
        <Calendar className="w-3.5 h-3.5" />
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 1 }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div
          className="absolute bottom-full mb-1.5 left-0 z-50 rounded-xl border backdrop-blur-md shadow-2xl overflow-hidden min-w-[170px]"
          style={{
            backgroundColor: theme.getOpacityStyle('bg', 0.04),
            borderColor: theme.borderSubtle,
            backdropFilter: 'blur(16px)',
            boxShadow: `0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px ${theme.getOpacityStyle('border', 0.08)}`,
          }}
        >
          {options.map((opt) => (
            <React.Fragment key={opt.label}>
              {opt.href ? (
                <a
                  href={opt.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium transition-colors duration-150 hover:bg-white/5"
                  style={{ color: theme.textPrimary }}
                >
                  <span style={{ color: theme.accent, opacity: 0.8 }}>{opt.icon}</span>
                  {opt.label}
                </a>
              ) : (
                <button
                  onClick={opt.onClick}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium transition-colors duration-150 hover:bg-white/5 text-left"
                  style={{ color: theme.textPrimary }}
                >
                  <span style={{ color: theme.accent, opacity: 0.8 }}>{opt.icon}</span>
                  {opt.label}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

export function getCountdownTarget(dateStr?: string, timeStr?: string): number {
  const defaultTarget = new Date('2027-03-15T19:00:00+05:00').getTime()
  if (!dateStr) return defaultTarget

  try {
    let hours = 19
    let minutes = 0
    if (timeStr) {
      const timeClean = timeStr.trim().toUpperCase()
      const isPM = timeClean.includes('PM') || timeClean.includes('شام') || timeClean.includes('دوپہر')
      const isAM = timeClean.includes('AM') || timeClean.includes('صبح')
      
      const digits = timeClean.match(/\d+/g)
      if (digits && digits.length >= 1) {
        let h = parseInt(digits[0], 10)
        let m = digits.length >= 2 ? parseInt(digits[1], 10) : 0
        if (isPM && h < 12) h += 12
        if (isAM && h === 12) h = 0
        hours = h
        minutes = m
      }
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
      const [y, m, d] = dateStr.trim().split('-').map(Number)
      const dateObj = new Date(y, m - 1, d, hours, minutes, 0, 0)
      if (!isNaN(dateObj.getTime())) {
        return dateObj.getTime()
      }
    }

    const dateObj = new Date(dateStr)
    if (!isNaN(dateObj.getTime())) {
      dateObj.setHours(hours, minutes, 0, 0)
      return dateObj.getTime()
    }
  } catch (e) {
    console.error("Error parsing countdown target date", e)
  }

  return defaultTarget
}