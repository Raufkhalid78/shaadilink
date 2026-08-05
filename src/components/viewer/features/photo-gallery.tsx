
'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { m, AnimatePresence, useInView } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

const MotionImage = m.create(Image)
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { MapPin, Calendar, Clock, ChevronDown, Heart, Sparkles, Send, Check, X, Star, Music, Music2, User, MessageCircle, Loader2, Copy, Hotel, Car, Gift, HelpCircle, Info, ChevronLeft, ChevronRight, Maximize, Share2 } from 'lucide-react'
import type { FlowData } from '@/lib/flow-types'
import { TemplateTheme, TEMPLATE_THEMES, DEFAULT_THEME } from '../themes';
import { InvitationViewerProps, hexToRgb, getTheme, extractColors, parseGiftDetails, getCalendarDates, getGoogleCalendarLink, generateICSContent, getOutlookWebLink, formatScratchDate, formatScratchTime } from '../utils';


export function PhotoGallery({ theme, images: propImages }: { theme: TemplateTheme; images?: string[] }) {
  const defaultImages = [
    { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=500&fit=crop', alt: 'Wedding couple' },
    { src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=500&fit=crop', alt: 'Wedding rings' },
    { src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=500&fit=crop', alt: 'Wedding celebration' },
    { src: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&h=500&fit=crop', alt: 'Wedding decorations' },
  ]
  const images = propImages && propImages.length > 0
    ? propImages.map((src, idx) => ({ src, alt: `Wedding gallery photo ${idx + 1}` }))
    : defaultImages

  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setActiveIndex(0)
  }, [images.length])

  useEffect(() => {
    if (lightboxOpen) return;
    const interval = setInterval(() => setActiveIndex((p) => (p + 1) % images.length), 4000)
    return () => clearInterval(interval)
  }, [images.length, lightboxOpen])

  return (
    <>
      <div className="w-full max-w-3xl mx-auto">
        <div 
          className="relative overflow-hidden rounded-xl aspect-[16/9] sm:aspect-[2/1] group shadow-lg cursor-pointer" 
          onClick={() => setLightboxOpen(true)}
          style={{ border: `1px solid ${theme.getOpacityStyle('border', 0.2)}`, boxShadow: `0 10px 15px -3px ${theme.getOpacityStyle('border', 0.05)}` }}
        >
          <AnimatePresence>
            <MotionImage
              key={activeIndex}
              src={images[activeIndex].src}
              alt={images[activeIndex].alt}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="object-cover"
              priority={activeIndex === 0}
            />
          </AnimatePresence>
          <div className="absolute inset-x-0 bottom-0 h-1/4" style={{ background: `linear-gradient(to top, ${theme.bgPrimary}cc, transparent)` }} />
          <div className="absolute inset-0 rounded-xl transition-all duration-500 group-hover:bg-black/20" style={{ boxShadow: `inset 0 0 0 1px ${theme.getOpacityStyle('border', 0.1)}` }} />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white">
              <Maximize className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`rounded-full transition-all duration-500 ${idx === activeIndex ? 'w-7 h-2.5' : 'w-2.5 h-2.5'}`}
              style={idx === activeIndex 
                ? { backgroundColor: theme.accent, boxShadow: `0 0 8px ${theme.getOpacityStyle('border', 0.4)}` } 
                : { backgroundColor: theme.getOpacityStyle('bg', 0.25) }
              }
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {lightboxOpen && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md"
            >
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-[10000]"
              >
                <X className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); setActiveIndex((p) => (p - 1 + images.length) % images.length); }}
                className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-[10000]"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="relative w-full max-w-5xl px-4 sm:px-16 aspect-[16/9] sm:aspect-auto sm:h-[80vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <MotionImage
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  src={images[activeIndex].src}
                  alt={images[activeIndex].alt}
                  fill
                  sizes="100vw"
                  className="object-contain rounded-lg p-4 sm:p-8"
                />
                <p className="mt-4 text-white/70 text-sm tracking-widest uppercase font-display">
                  {activeIndex + 1} / {images.length}
                </p>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); setActiveIndex((p) => (p + 1) % images.length); }}
                className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-[10000]"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </m.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
