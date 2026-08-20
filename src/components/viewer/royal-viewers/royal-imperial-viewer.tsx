'use client'

import React, { useMemo } from 'react'
import { Cinzel_Decorative, Great_Vibes } from 'next/font/google'
import { m, AnimatePresence } from 'framer-motion'
import { MapPin, Calendar, Clock, ChevronDown, Heart, Sparkles, Send, Check, X, User, Hotel, Car, Gift, Copy, Loader2, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { useInvitationState } from '../use-invitation-state'
import dynamic from 'next/dynamic'
const DoorOverlay = dynamic(() => import('../door/door-overlay').then(m => m.DoorOverlay), { ssr: false })
const FireworksDisplay = dynamic(() => import('../effects/fireworks').then(m => m.FireworksDisplay), { ssr: false })
const ConfettiDisplay = dynamic(() => import('../effects/confetti').then(m => m.ConfettiDisplay), { ssr: false })
const GoldDustSplash = dynamic(() => import('../effects/gold-dust').then(m => m.GoldDustSplash), { ssr: false })
const BackgroundParticles = dynamic(() => import('../effects/particles').then(m => m.BackgroundParticles), { ssr: false })
import { MusicToggle } from '../ui/music-toggle'
import { RevealSection, getMapEmbedQuery } from '../ui/reveal-section'
const ScratchCard = dynamic(() => import('../features/scratch-card').then(m => m.ScratchCard), { ssr: false })
import { CountdownTimer, AddToCalendarDropdown } from '../features/countdown-timer'
import { PhotoGallery } from '../features/photo-gallery'
import { getHeartSvgPath } from '../ui/shapes'
import type { FlowData } from '@/lib/flow-types'

const cinzelDec = Cinzel_Decorative({ variable: '--font-cinzel-dec', subsets: ['latin'], weight: ['400', '700'], display: 'swap' })
const greatVibes = Great_Vibes({ variable: '--font-great-vibes', subsets: ['latin'], weight: ['400'], display: 'swap' })

interface RoyalViewerProps {
  templateId?: string
  flowData?: FlowData
  guestName?: string | null
  guestSlug?: string | null
}

/* ─── Mughal Islamic Tile Background ─── */
function MughalTileBg({ accent }: { accent: string }) {
  return (
    <>
      <style>{`
        @keyframes mughalRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .mughal-tile-wrap { animation: mughalRotate 180s linear infinite; transform-origin: center; }
      `}</style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mughal-tile" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <g stroke={accent} strokeWidth="0.6" fill="none">
                {/* 8-pointed Islamic star */}
                <path d="M40 10 L45 30 L65 25 L50 40 L65 55 L45 50 L40 70 L35 50 L15 55 L30 40 L15 25 L35 30 Z" />
                <circle cx="40" cy="40" r="12" />
                <path d="M40 5 L40 15 M40 65 L40 75 M5 40 L15 40 M65 40 L75 40" strokeWidth="0.4" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mughal-tile)" />
        </svg>
        {/* Radial glow */}
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 65%)` }} />
      </div>
    </>
  )
}

/* ─── Mughal Arch Border around names ─── */
function MughalArchBorder({ accent }: { accent: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <svg viewBox="0 0 340 480" width="340" height="480" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-20">
        <path d="M20 470 L20 200 Q20 20 170 20 Q320 20 320 200 L320 470" stroke={accent} strokeWidth="1.2" />
        <path d="M40 470 L40 210 Q40 50 170 50 Q300 50 300 210 L300 470" stroke={accent} strokeWidth="0.5" />
        {/* Dome top ornaments */}
        <circle cx="170" cy="18" r="6" stroke={accent} strokeWidth="1" />
        <path d="M160 18 L140 0 M180 18 L200 0" stroke={accent} strokeWidth="0.8" />
        {/* Corner jali patterns */}
        <path d="M20 200 L5 185 M20 220 L5 220 M320 200 L335 185 M320 220 L335 220" stroke={accent} strokeWidth="0.6" />
        {/* Bottom ornament strip */}
        <path d="M20 460 Q95 450 170 455 Q245 450 320 460" stroke={accent} strokeWidth="0.8" />
        <path d="M50 470 L50 465 M110 470 L110 465 M170 470 L170 465 M230 470 L230 465 M290 470 L290 465" stroke={accent} strokeWidth="0.6" />
      </svg>
    </div>
  )
}

/* ─── Imperial Section Divider ─── */
function ImperialDivider({ accent }: { accent: string }) {
  return (
    <div className="flex items-center justify-center gap-3 w-full max-w-xs mx-auto my-2">
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${accent})` }} />
      <span className="text-lg" style={{ color: accent }}>✦ ✦ ✦</span>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${accent})` }} />
    </div>
  )
}

/* ─── Stone Arch Countdown Unit ─── */
function ArchCountUnit({ value, label, accent, textPrimary }: { value: string; label: string; accent: string; textPrimary: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative w-16 h-20 flex items-center justify-center"
        style={{
          background: `linear-gradient(180deg, rgba(201,168,76,0.15) 0%, rgba(201,168,76,0.05) 100%)`,
          clipPath: 'polygon(15% 100%, 0% 60%, 0% 30%, 50% 0%, 100% 30%, 100% 60%, 85% 100%)',
          border: `1px solid ${accent}44`,
        }}
      >
        <span className="font-mono text-2xl font-bold" style={{ color: accent, textShadow: `0 0 12px ${accent}66` }}>{value}</span>
      </div>
      <span className="text-[9px] tracking-[0.2em] uppercase" style={{ color: `${accent}99` }}>{label}</span>
    </div>
  )
}

/* ─── Parchment RSVP Card ─── */
function ParchmentRSVP({ children, accent, bgSecondary }: { children: React.ReactNode; accent: string; bgSecondary: string }) {
  return (
    <div className="relative w-full" style={{ backgroundColor: bgSecondary }}>
      {/* Torn top edge */}
      <svg viewBox="0 0 400 20" className="w-full" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', marginBottom: -1 }}>
        <path d="M0 20 Q25 5 50 15 Q75 25 100 10 Q125 0 150 12 Q175 22 200 8 Q225 0 250 15 Q275 25 300 10 Q325 0 350 14 Q375 22 400 8 L400 20 Z" fill={bgSecondary} />
      </svg>
      <div className="px-5 pb-6 pt-2" style={{ backgroundColor: bgSecondary, borderLeft: `3px solid ${accent}`, borderRight: `3px solid ${accent}` }}>
        {children}
      </div>
      {/* Torn bottom edge */}
      <svg viewBox="0 0 400 20" className="w-full" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', marginTop: -1 }}>
        <path d="M0 0 Q25 15 50 5 Q75 -5 100 10 Q125 20 150 8 Q175 -2 200 12 Q225 22 250 5 Q275 -5 300 10 Q325 20 350 6 Q375 -2 400 12 L400 0 Z" fill={bgSecondary} />
      </svg>
    </div>
  )
}

/* ─── Scroll Wish Card ─── */
function ScrollWishCard({ name, message, accent, bg, border }: { name: string; message: string; accent: string; bg: string; border: string }) {
  return (
    <div className="relative rounded-full-ends flex gap-3 items-start p-4 border" style={{ backgroundColor: bg, borderColor: border, borderRadius: '2rem 0.5rem 0.5rem 2rem' }}>
      <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: accent, backgroundColor: `${accent}22` }}>
        <span className="text-xs font-bold" style={{ color: accent }}>{name.charAt(0).toUpperCase()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold mb-1" style={{ color: accent }}>{name}</p>
        <p className="text-sm leading-relaxed" style={{ color: `${accent}cc` }}>{message}</p>
      </div>
    </div>
  )
}

export default function RoyalImperialViewer({ templateId, flowData, guestName, guestSlug }: RoyalViewerProps) {
  const s = useInvitationState(templateId || 'royal-imperial', flowData, guestName, guestSlug)
  const { theme, getOpacityStyle } = s

  // ─── Video Envelope State ───
  const [envelopeStarted, setEnvelopeStarted] = React.useState(false)
  const [videoTime, setVideoTime] = React.useState(0)
  const [doorVideoEnding, setDoorVideoEnding] = React.useState(false)
  const isVideoEnvelope = !!theme.openingVideoUrl

  const handleScreenTap = () => {
    if (isVideoEnvelope && !envelopeStarted) {
      setEnvelopeStarted(true)
      const v = document.getElementById('hero-door-video') as HTMLVideoElement
      if (v) {
        const p = v.play()
        if (p !== undefined) {
          p.catch(() => {})
        }
        const tick = () => { setVideoTime(v.currentTime); if (!v.paused && !v.ended) requestAnimationFrame(tick) }
        requestAnimationFrame(tick)
      }
    }
  }

  const handleDoorVideoEnd = () => {
    // Crossfade: door video at z-20 dissolves directly into hero media at z-0
    setDoorVideoEnding(true)
    setTimeout(() => s.handleDoorOpen(true), 1200)
  }

  // Timing: Bismillah at 2s for 3s (ends at 5s), names appear at 5.5s and stay continuously
  const showBismillahOverlay = isVideoEnvelope && envelopeStarted && !s.doorsOpened && videoTime >= 2.0 && videoTime < 5.0
  const showNamesOverlay = isVideoEnvelope && envelopeStarted && videoTime >= 5.5
  const countdownUnits = [
    { key: 'days', label: s.t('days', 'Days') },
    { key: 'hours', label: s.t('hours', 'Hours') },
    { key: 'minutes', label: s.t('minutes', 'Mins') },
    { key: 'seconds', label: s.t('seconds', 'Secs') },
  ]

  const parsedGifts = useMemo(() => s.gifts ? s.parseGiftDetails(s.gifts) : null, [s.gifts])

  const groomParents = flowData?.hostGroomFamily?.trim() || (s.isDemo ? 'Mr. & Mrs. Tariq Mahmood' : '')
  const brideParents = flowData?.hostBrideFamily?.trim() || (s.isDemo ? 'Mr. & Mrs. Aslam Khan' : '')
  const groomCity = flowData?.hostGroomCity?.trim() || (s.isDemo ? 'Lahore' : '')
  const brideCity = flowData?.hostBrideCity?.trim() || (s.isDemo ? 'Islamabad' : '')

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden ${cinzelDec.variable} ${greatVibes.variable}`}
      dir={s.language === 'ur' ? 'rtl' : 'ltr'}
      style={{ backgroundColor: isVideoEnvelope && !s.doorsOpened ? 'transparent' : theme.bgPrimary, color: theme.textPrimary }}
      onClick={handleScreenTap}
    >
      {/* ─── VIDEO DOOR (only before doors open) ─── */}
      {isVideoEnvelope && !s.doorsOpened && (
        <div className="fixed inset-0 z-20 pointer-events-auto">
          {/* Door video fades out when ending — revealing the hero section directly */}
          <m.div
            className="absolute inset-0 bg-black"
            animate={{ opacity: doorVideoEnding ? 0 : 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            <video
              id="hero-door-video"
              src={theme.openingVideoUrl}
              className="w-full h-full object-cover"
              muted
              playsInline
              onEnded={handleDoorVideoEnd}
            />
          </m.div>
          {/* Tap hint */}
          <AnimatePresence>
            {!envelopeStarted && (
              <m.div
                key="tap-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute inset-0 flex items-end justify-center pb-16 pointer-events-none"
              >
                <div className="px-8 py-3 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white/90 text-sm uppercase tracking-widest animate-pulse">
                  Tap anywhere to open
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {(!isVideoEnvelope || s.doorsOpened) && <MughalTileBg accent={theme.accent} />}
      {(!isVideoEnvelope || s.doorsOpened) && <BackgroundParticles accentColor={theme.accent} />}

      {/* Door Overlay — only for non-video templates */}
      {s.doorOverlayVisible && !isVideoEnvelope && (
        <div
          className="fixed inset-0 z-50"
          style={{ perspective: ['classic-doors', 'archway', 'lantern'].includes(theme.doorStyle.type) ? '1200px' : undefined }}
        >
          <DoorOverlay theme={theme} doorsOpened={s.doorsOpened} onOpen={s.handleDoorOpen} />
        </div>
      )}

      <FireworksDisplay show={s.showFireworks} colors={theme.fireworkColors} />
      <ConfettiDisplay show={s.showConfetti} colors={theme.confettiColors} />
      <GoldDustSplash show={s.showGoldDust} colors={theme.fireworkColors} />

      {/* Controls */}
      <div className="fixed top-4 right-4 z-[200] flex items-center gap-2">
        <button
          onClick={() => s.setLanguage(s.language === 'en' ? 'ur' : 'en')}
          className="w-10 h-10 rounded-full border backdrop-blur-sm flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: theme.bgPrimary + 'cc', borderColor: theme.borderSubtle, color: getOpacityStyle('text', 0.7) }}
          disabled={s.isTranslating}
        >
          {s.isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : (s.language === 'en' ? 'اردو' : 'EN')}
        </button>
        <button onClick={s.handleShare} className="w-10 h-10 rounded-full border backdrop-blur-sm flex items-center justify-center hover:scale-105 transition-transform" style={{ backgroundColor: theme.bgPrimary + 'cc', borderColor: theme.borderSubtle }} aria-label="Share">
          <Share2 className="w-4 h-4" style={{ color: theme.accent }} />
        </button>
        <MusicToggle isPlaying={s.musicPlaying} onToggle={() => s.setMusicPlaying(!s.musicPlaying)} theme={theme} />
      </div>

      {/* ─── BISMILLAH OVERLAY (centered, white, 2s→4s during door video) ─── */}
      <AnimatePresence>
        {showBismillahOverlay && (
          <m.div
            key="bismillah-overlay"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.9 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none px-8"
          >
            <div className="flex items-center gap-4 w-full max-w-xs mb-4">
              <div className="flex-1 h-px bg-white/40" />
              <svg width="16" height="16" viewBox="0 0 22 22" fill="none"><polygon points="11,1 13.5,8.5 21,8.5 15,13.5 17,21 11,16.5 5,21 7,13.5 1,8.5 8.5,8.5" stroke="white" strokeWidth="0.8" fill="none" opacity="0.6" /></svg>
              <div className="flex-1 h-px bg-white/40" />
            </div>
            <p
              className="font-arabic text-4xl sm:text-5xl md:text-6xl text-center leading-loose"
              dir="rtl"
              style={{ color: 'white', textShadow: '0 0 60px rgba(255,255,255,0.6), 0 0 120px rgba(255,255,255,0.3)' }}
            >
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </p>
            <p className="mt-3 text-xs tracking-[0.25em] uppercase text-center text-white/55">
              In the name of Allah, the Most Gracious, the Most Merciful
            </p>
            <div className="flex items-center gap-4 w-full max-w-xs mt-4">
              <div className="flex-1 h-px bg-white/40" />
              <div className="w-2 h-2 rotate-45 border border-white/50" />
              <div className="flex-1 h-px bg-white/40" />
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Names are rendered once inside the hero section with layout-based positioning */}

      {/* ─── BISMILLAH on invitation page (non-video templates only) ─── */}
      {!isVideoEnvelope && flowData?.showBismillah !== false && (
        <m.div
          initial={{ opacity: 0 }} animate={s.doorsOpened ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.5, duration: 1.0 }}
          className="relative flex flex-col items-center justify-center py-12 px-6 overflow-hidden border-b"
          style={{ borderColor: getOpacityStyle('border', 0.15) }}
        >
          <div className="flex items-center gap-4 w-full max-w-sm mb-4">
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${theme.accent})` }} />
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><polygon points="11,1 13.5,8.5 21,8.5 15,13.5 17,21 11,16.5 5,21 7,13.5 1,8.5 8.5,8.5" stroke={theme.accent} strokeWidth="0.8" fill="none" opacity="0.7" /></svg>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${theme.accent})` }} />
          </div>
          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={s.doorsOpened ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 1.0, duration: 1.0 }}
            className="font-arabic text-3xl sm:text-4xl md:text-5xl text-center leading-loose bismillah-glow"
            dir="rtl" style={{ color: theme.accent }}
          >
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </m.p>
          <p className="mt-3 text-xs tracking-[0.25em] uppercase text-center" style={{ color: getOpacityStyle('text', 0.45) }}>In the name of Allah, the Most Gracious, the Most Merciful</p>
          <div className="flex items-center gap-4 w-full max-w-sm mt-4">
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${theme.accent})` }} />
            <div className="w-2 h-2 rotate-45" style={{ border: `1px solid ${getOpacityStyle('border', 0.6)}` }} />
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${theme.accent})` }} />
          </div>
        </m.div>
      )}

      {/* ─── HERO (always rendered — seamless transition directly into hero video) ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
        {/* Hero media background — always active in hero section behind the video door */}
        {theme.heroMediaUrl ? (
          <div className="absolute inset-0 pointer-events-none z-0">
            {/\.(mp4|webm|mov)$/i.test(theme.heroMediaUrl) ? (
              <video src={theme.heroMediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            ) : (
              <img src={theme.heroMediaUrl} alt="Hero background" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 55%, ${theme.bgPrimary} 100%)` }} />
          </div>
        ) : (
          <div className="absolute inset-0 z-0" style={{ backgroundColor: theme.bgPrimary }}>
            <div className="absolute inset-0" style={{ background: `radial-gradient(at 50% 40%, ${getOpacityStyle('bg', 0.08)}, transparent 60%)` }} />
          </div>
        )}

        {/* Mughal Arch — fades in smoothly during crossfade */}
        <m.div
          className="absolute inset-0 pointer-events-none z-[25]"
          initial={{ opacity: 0 }}
          animate={{ opacity: (!isVideoEnvelope || doorVideoEnding || s.doorsOpened) ? 1 : 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <MughalArchBorder accent={theme.accent} />
        </m.div>

        {/* ── NAMES & DETAILS ──
            At z-30 (above door video z-20).
            Names fade in at 5.5s during door video.
            When door video fades out, names NEVER move or disappear.
            "Request honour" and scroll indicator fade in as door video finishes. */}
        <div className="relative z-30 max-w-lg text-center px-6">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: (!isVideoEnvelope || showNamesOverlay || doorVideoEnding || s.doorsOpened) ? 1 : 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <p
              className="text-sm sm:text-base tracking-[0.4em] uppercase mb-8 font-[var(--font-great-vibes)]"
              style={{ color: theme.textSecondary }}
            >
              {s.t('gettingMarried', "We're getting married")}
            </p>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-[0.06em] mb-1 font-[var(--font-cinzel-dec)]"
              style={{ color: theme.textPrimary, textShadow: `0 0 30px ${theme.accent}66` }}
            >
              {s.translatedPartner1}
            </h1>

            {groomParents && (
              <div className="flex flex-col items-center mb-3">
                <span className="text-[11px] uppercase tracking-[0.25em] font-serif font-medium" style={{ color: `${theme.accentLight}dd` }}>
                  {s.language === 'ur' ? 'فرزند' : 'Son of'}
                </span>
                <span className="text-sm sm:text-base font-semibold tracking-wide mt-0.5" style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 20px rgba(201,168,76,0.4)' }}>
                  {groomParents}
                </span>
                {groomCity && (
                  <span className="text-[10px] tracking-wider uppercase opacity-75 mt-0.5" style={{ color: theme.accentLight }}>
                    ({groomCity})
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-4 my-4">
              <div className="w-16 h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent})` }} />
              <span className="text-2xl" style={{ color: theme.accent }}>✦</span>
              <div className="w-16 h-px" style={{ background: `linear-gradient(270deg, transparent, ${theme.accent})` }} />
            </div>

            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-[0.06em] mb-1 font-[var(--font-cinzel-dec)]"
              style={{ color: theme.textPrimary, textShadow: `0 0 30px ${theme.accent}66` }}
            >
              {s.translatedPartner2}
            </h1>

            {brideParents && (
              <div className="flex flex-col items-center mb-6">
                <span className="text-[11px] uppercase tracking-[0.25em] font-serif font-medium" style={{ color: `${theme.accentLight}dd` }}>
                  {s.language === 'ur' ? 'دختر' : 'Daughter of'}
                </span>
                <span className="text-sm sm:text-base font-semibold tracking-wide mt-0.5" style={{ color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 20px rgba(201,168,76,0.4)' }}>
                  {brideParents}
                </span>
                {brideCity && (
                  <span className="text-[10px] tracking-wider uppercase opacity-75 mt-0.5" style={{ color: theme.accentLight }}>
                    ({brideCity})
                  </span>
                )}
              </div>
            )}
          </m.div>

          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: (!isVideoEnvelope || doorVideoEnding || s.doorsOpened) ? 1 : 0 }}
            transition={{ delay: 0.3, duration: 1.0 }}
            className="text-base sm:text-lg tracking-[0.15em] font-[var(--font-great-vibes)]"
            style={{ color: theme.textSecondary }}
          >
            {s.t('requestHonour', 'Request the honour of your presence')}
          </m.p>
        </div>

        {(!isVideoEnvelope || s.doorsOpened) && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0 }} className="absolute bottom-8 z-30 flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>{s.t('scroll', 'Scroll')}</span>
            <div className="animate-bounce"><ChevronDown className="w-4 h-4" style={{ color: theme.textMuted }} /></div>
          </m.div>
        )}
      </section>

      {/* ─── MAIN CONTENT (all sections BELOW hero — fades in after door opens) ─── */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: s.doorsOpened ? 1 : 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >

        {/* ─── WELCOME MESSAGE ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6" style={{ background: `linear-gradient(180deg, ${theme.bgPrimary} 0%, ${theme.bgSecondary} 50%, ${theme.bgPrimary} 100%)` }}>
            <div className="max-w-lg mx-auto text-center">
              {s.guestNameFromUrl && (
                <m.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col items-center gap-4 mb-8">
                  <h3 className="text-3xl md:text-4xl capitalize font-[var(--font-cinzel-dec)]" style={{ color: theme.accent }}>
                    {s.language === 'ur' ? 'محترم' : 'Dear'} {s.guestNameFromUrl},
                  </h3>
                  {s.flowData?.guestSeats != null && (
                    <m.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
                      className="flex items-center gap-2 px-5 py-2 rounded-full border"
                      style={{ borderColor: `rgba(${theme.accentRgb},0.3)`, backgroundColor: `rgba(${theme.accentRgb},0.1)` }}>
                      <User className="w-4 h-4 shrink-0" style={{ color: theme.accent }} />
                      <span className="text-sm font-semibold tracking-wide font-[var(--font-cinzel-dec)]" style={{ color: theme.accentLight }}>
                        {s.flowData.guestSeats === 0 ? (s.language === 'ur' ? 'پوری فیملی مدعو' : 'Whole Family Invited') : s.flowData.guestSeats === 1 ? (s.language === 'ur' ? '۱ مہمان مدعو' : '1 Person Invited') : (s.language === 'ur' ? `${s.flowData.guestSeats} مہمان مدعو` : `${s.flowData.guestSeats} Persons Invited`)}
                      </span>
                    </m.div>
                  )}
                </m.div>
              )}
              <ImperialDivider accent={theme.accent} />
              <p className="text-xl md:text-2xl leading-relaxed italic my-8 font-[var(--font-great-vibes)] whitespace-pre-wrap break-words"
                style={{ color: theme.accentLight, textShadow: `0 0 15px ${getOpacityStyle('text', 0.2)}` }}>
                {s.translatedWelcomeMsg}
              </p>
              
              {/* Host Families */}
              {(flowData?.hostBrideFamily || flowData?.hostGroomFamily) && (
                <div className="flex flex-col gap-6 my-8">
                  {flowData?.hostBrideFamily && (
                    <m.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex flex-col items-center">
                      <span className="text-[10px] tracking-widest uppercase mb-1" style={{ color: theme.textMuted }}>{s.language === 'ur' ? 'دلہن کے اہل خانہ' : 'Host (Bride)'}</span>
                      <span className="text-lg font-semibold" style={{ color: theme.textPrimary }}>{flowData.hostBrideFamily}</span>
                      {flowData.hostBrideCity && <span className="text-xs mt-1" style={{ color: getOpacityStyle('text', 0.6) }}>{flowData.hostBrideCity}</span>}
                    </m.div>
                  )}
                  {flowData?.hostGroomFamily && (
                    <m.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex flex-col items-center">
                      <span className="text-[10px] tracking-widest uppercase mb-1" style={{ color: theme.textMuted }}>{s.language === 'ur' ? 'دلہے کے اہل خانہ' : 'Host (Groom)'}</span>
                      <span className="text-lg font-semibold" style={{ color: theme.textPrimary }}>{flowData.hostGroomFamily}</span>
                      {flowData.hostGroomCity && <span className="text-xs mt-1" style={{ color: getOpacityStyle('text', 0.6) }}>{flowData.hostGroomCity}</span>}
                    </m.div>
                  )}
                </div>
              )}

              <ImperialDivider accent={theme.accent} />
            </div>
          </section>
        </RevealSection>

        {/* ─── SCRATCH CARD ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <ScratchCard revealed={s.scratchRevealed} onReveal={s.handleScratchReveal} theme={theme} language={s.language} translations={s.translations} scratchDateInfo={s.scratchDateInfo} scratchTimeFormatted={s.scratchTimeFormatted} />
          </section>
        </RevealSection>

        {/* ─── QURANIC VERSE ─── */}
        {flowData?.showQuranVerse && (
          <RevealSection>
            <section className="py-16 md:py-20 px-6">
              <div className="max-w-2xl mx-auto text-center space-y-6 py-10 px-6 rounded-2xl border"
                style={{ borderColor: getOpacityStyle('border', 0.15), backgroundColor: getOpacityStyle('bg', 0.3) }}>
                <div className="flex justify-center items-center gap-4 mb-2">
                  <div className="w-8 h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent})` }} />
                  <span className="text-gold opacity-80 text-2xl font-arabic">﷽</span>
                  <div className="w-8 h-px" style={{ background: `linear-gradient(-90deg, transparent, ${theme.accent})` }} />
                </div>
                <p className="font-arabic text-2xl md:text-3xl leading-loose" dir="rtl" style={{ color: theme.accentLight }}>
                  وَمِنْ ءَايَـٰتِهِۦٓ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَٰجًا لِّتَسْکُنُوٓا۟ إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً
                </p>
                <p className="text-sm md:text-base italic leading-relaxed" style={{ color: theme.textSecondary }}>
                  &ldquo;And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy.&rdquo;
                  <span className="block text-xs mt-2 font-semibold not-italic" style={{ color: theme.accent }}>— Surah Ar-Rum [30:21]</span>
                </p>
                <div className="flex justify-center items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getOpacityStyle('border', 0.3) }} /><div className="w-16 h-px" style={{ backgroundColor: getOpacityStyle('border', 0.2) }} /><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getOpacityStyle('border', 0.3) }} /></div>
                <p className="font-arabic text-lg md:text-xl leading-loose max-w-xl mx-auto px-4" dir="rtl" style={{ color: theme.textPrimary || '#ffffff' }}>&ldquo;اور اس کی نشانیوں میں سے ہے کہ اس نے تمہارے لیے تمہاری ہی جنس سے جوڑے پیدا کیے تاکہ تم ان سے آرام پاؤ اور اس نے تمہارے درمیان محبت اور رحمت پیدا کر دی، یقیناً اس میں غور و فکر کرنے والوں کے لیے نشانیاں ہیں۔&rdquo;<span className="block text-xs mt-2 font-sans not-italic opacity-85" style={{ color: theme.accent }}>— سورہ روم [30:21]</span></p>
              </div>
            </section>
          </RevealSection>
        )}

        {/* ─── PHOTO GALLERY ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-6">
              <h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>{s.t('ourMoments', 'Our Moments')}</h2>
              <ImperialDivider accent={theme.accent} />
              <PhotoGallery theme={theme} images={flowData?.slideshowImages} />
            </div>
          </section>
        </RevealSection>

        {/* ─── VIDEO ─── */}
        {s.youtubeVideoId && (
          <RevealSection>
            <section className="py-16 md:py-20 px-6">
              <div className="flex flex-col items-center gap-6">
                <h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>Our Story</h2>
                <ImperialDivider accent={theme.accent} />
                <div className="w-full max-w-3xl mx-auto rounded-xl overflow-hidden border" style={{ borderColor: getOpacityStyle('border', 0.2) }}>
                  <div className="aspect-video"><iframe className="w-full h-full" src={`https://www.youtube.com/embed/${s.youtubeVideoId}?rel=0&modestbranding=1`} title="Our Story" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
                </div>
              </div>
            </section>
          </RevealSection>
        )}

        {/* ─── COUNTDOWN — Stone Arch Style ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6" style={{ background: `linear-gradient(180deg, ${theme.bgPrimary} 0%, ${theme.bgSecondary} 100%)` }}>
            <div className="flex flex-col items-center gap-8">
              <h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>{s.t('countingDown', 'Counting Down to Forever')}</h2>
              <ImperialDivider accent={theme.accent} />
              <CountdownTimer theme={theme} translations={s.language === 'ur' ? s.translations : undefined} targetDate={s.firstEvent?.date} targetTime={s.firstEvent?.time} />
            </div>
          </section>
        </RevealSection>

        {/* ─── EVENT TIMELINE — Crowned Cards ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
              <h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>{s.t('programTimeline', 'Program Timeline')}</h2>
              <ImperialDivider accent={theme.accent} />
              <div className="w-full flex flex-col gap-5">
                {s.dynamicEvents.map((event, idx) => {
                  const te = s.getTranslatedEvent(event, idx)
                  return (
                    <RevealSection key={event.name} delay={idx * 0.1}>
                      <div className="border rounded-xl overflow-hidden" style={{ borderColor: theme.borderSubtle, backgroundColor: getOpacityStyle('bg', 0.04), borderLeftWidth: 4, borderLeftColor: theme.accent }}>
                        <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: theme.borderSubtle, backgroundColor: getOpacityStyle('bg', 0.06) }}>
                          <span className="text-sm" style={{ color: theme.accent }}>♛</span>
                          <h3 className="font-bold tracking-wider uppercase text-sm font-[var(--font-cinzel-dec)]" style={{ color: theme.accent }}>{te.name}</h3>
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex items-center gap-4 text-xs" style={{ color: getOpacityStyle('text', 0.5) }}>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {te.date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {te.time}</span>
                          </div>
                          <p className="text-sm leading-relaxed" style={{ color: getOpacityStyle('text', 0.6) }}>{te.description}</p>
                          
                          {/* Nikah Registration Note (Optional Pakistani Feature) */}
                          {flowData?.showNikahRegistration && (event.name.toLowerCase().includes('nikkah') || event.name.toLowerCase().includes('nikah') || te.name.includes('نکاح')) && (
                            <div className="mb-4 flex w-fit items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm" style={{ backgroundColor: getOpacityStyle('bg', 0.08), borderColor: theme.accent }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: theme.accent }}><path d="M20 19.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L18 5.5"/><path d="m15 5 3 3"/><path d="m19 9-8 8-4 1 1-4 8-8Z"/></svg>
                              <span className="text-xs font-semibold tracking-wide" style={{ color: theme.accent }}>{s.language === 'ur' ? 'نکاح کی باقاعدہ رجسٹریشن کی جائے گی' : 'Nikah will be formally registered'}</span>
                            </div>
                          )}

                          <div className="pt-2">
                            <AddToCalendarDropdown event={event} partner1={s.partner1} partner2={s.partner2} theme={theme} label={s.t('addToCalendar', 'Add to Calendar')} location={[s.venueName, s.rawVenueAddress].filter(Boolean).join(', ')} />
                          </div>
                        </div>
                      </div>
                    </RevealSection>
                  )
                })}
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ─── DRESS CODE ─── */}
        {(s.dressCodeWomen || s.dressCodeMen) && (
          <RevealSection>
            <section className="py-16 md:py-20 px-6">
              <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
                <h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>{s.t('dressCode', 'Dress Code')}</h2>
                <ImperialDivider accent={theme.accent} />
                <div className="grid grid-cols-2 gap-6 w-full">
                  {s.dressCodeWomen && (
                    <div className="flex flex-col items-center p-5 rounded-xl border text-center" style={{ backgroundColor: getOpacityStyle('bg', 0.03), borderColor: theme.borderSubtle }}>
                      <span className="text-xs tracking-wider uppercase mb-2" style={{ color: getOpacityStyle('text', 0.5) }}>{s.t('ladies', 'Ladies')}</span>
                      <p className="text-sm font-semibold leading-relaxed" style={{ color: theme.textPrimary }}>{s.translatedDressCodeWomen}</p>
                      <div className="flex gap-2 mt-3 flex-wrap justify-center">{s.extractColors(s.dressCodeWomen).map((c, i) => (<div key={i} className="w-5 h-5 rounded-full border" style={{ backgroundColor: c.hex, borderColor: getOpacityStyle('border', 0.3) }} title={c.name} />))}</div>
                    </div>
                  )}
                  {s.dressCodeMen && (
                    <div className="flex flex-col items-center p-5 rounded-xl border text-center" style={{ backgroundColor: getOpacityStyle('bg', 0.03), borderColor: theme.borderSubtle }}>
                      <span className="text-xs tracking-wider uppercase mb-2" style={{ color: getOpacityStyle('text', 0.5) }}>{s.t('gentlemen', 'Gentlemen')}</span>
                      <p className="text-sm font-semibold leading-relaxed" style={{ color: theme.textPrimary }}>{s.translatedDressCodeMen}</p>
                      <div className="flex gap-2 mt-3 flex-wrap justify-center">{s.extractColors(s.dressCodeMen).map((c, i) => (<div key={i} className="w-5 h-5 rounded-full border" style={{ backgroundColor: c.hex, borderColor: getOpacityStyle('border', 0.3) }} title={c.name} />))}</div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </RevealSection>
        )}

        {/* ─── TRAVEL & ACCOMMODATIONS ─── */}
        {(s.accommodation || s.transportation) && (
          <RevealSection>
            <section className="py-16 md:py-20 px-6">
              <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
                <h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>{s.t('travelAccommodations', 'Travel & Accommodations')}</h2>
                <ImperialDivider accent={theme.accent} />
                <div className="flex flex-col gap-5 w-full">
                  {s.accommodation && (<Card className="backdrop-blur-sm w-full" style={{ backgroundColor: getOpacityStyle('bg', 0.03), borderColor: theme.borderSubtle }}><CardContent className="flex gap-4 p-5 items-start"><div className="w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0" style={{ borderColor: theme.borderSubtle }}><Hotel className="w-5 h-5" style={{ color: theme.accent }} /></div><div><h3 className="text-base font-semibold mb-1" style={{ color: theme.accent }}>{s.t('hotelBlocks', 'Hotel Accommodations')}</h3><p className="text-sm leading-relaxed" style={{ color: getOpacityStyle('text', 0.75) }}>{s.translatedAccommodation}</p></div></CardContent></Card>)}
                  {s.transportation && (<Card className="backdrop-blur-sm w-full" style={{ backgroundColor: getOpacityStyle('bg', 0.03), borderColor: theme.borderSubtle }}><CardContent className="flex gap-4 p-5 items-start"><div className="w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0" style={{ borderColor: theme.borderSubtle }}><Car className="w-5 h-5" style={{ color: theme.accent }} /></div><div><h3 className="text-base font-semibold mb-1" style={{ color: theme.accent }}>{s.t('transportationInfo', 'Transportation Info')}</h3><p className="text-sm leading-relaxed" style={{ color: getOpacityStyle('text', 0.75) }}>{s.translatedTransportation}</p></div></CardContent></Card>)}
                </div>
              </div>
            </section>
          </RevealSection>
        )}

        {/* ─── VENUE ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
              <h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)] flex items-center gap-3" style={{ color: theme.accent }}>
                <MapPin className="w-7 h-7" style={{ color: getOpacityStyle('text', 0.7) }} />{s.t('venue', 'Venue')}
              </h2>
              <ImperialDivider accent={theme.accent} />
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-[var(--font-cinzel-dec)]" style={{ color: theme.accent }}>{s.translatedVenueName}</h3>
                <p className="text-sm" style={{ color: getOpacityStyle('text', 0.6) }}>{s.translatedVenueAddress}</p>
              </div>

              {flowData?.isSegregated && (
                <div className="w-full text-center p-4 border rounded-xl" style={{ backgroundColor: getOpacityStyle('bg', 0.05), borderColor: theme.borderSubtle }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: theme.accent }}>{s.language === 'ur' ? 'خواتین اور حضرات کا پردے کے ساتھ الگ انتظام ہے' : 'Separate setup for Ladies & Gents'}</p>
                  {flowData.venueDetailsSegregated && <p className="text-xs" style={{ color: getOpacityStyle('text', 0.7) }}>{flowData.venueDetailsSegregated}</p>}
                </div>
              )}
              <div className="w-full rounded-2xl overflow-hidden border" style={{ borderColor: theme.borderSubtle }}>
                <iframe title="Venue Location Map" width="100%" height="220" style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) grayscale(10%)' }} src={`https://maps.google.com/maps?q=${encodeURIComponent(s.mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
              <Button asChild className="border rounded-lg px-6 py-2.5 h-auto" style={{ backgroundColor: getOpacityStyle('bg', 0.1), borderColor: theme.borderSubtle, color: theme.accent }} variant="outline">
                <a href={s.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(s.venueAddress)}`} target="_blank" rel="noopener noreferrer">
                  <MapPin className="w-4 h-4 mr-2" />{s.t('viewOnMaps', 'View on Google Maps')}
                </a>
              </Button>
            </div>
          </section>
        </RevealSection>

        {/* ─── GIFTS ─── */}
        {s.gifts && !s.flowData?.hideDigitalShagun && (
          <RevealSection>
            <section className="py-16 md:py-20 px-6">
              <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
                <h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>{s.t('giftsShagun', 'Digital Shagun & Registry')}</h2>
                <ImperialDivider accent={theme.accent} />
                <div className="w-full flex flex-col gap-6">
                  <div className="text-center p-4 border rounded-xl" style={{ backgroundColor: getOpacityStyle('bg', 0.02), borderColor: theme.borderSubtle }}>
                    <Gift className="w-6 h-6 mx-auto mb-2" style={{ color: theme.accent }} />
                    <p className="text-sm leading-relaxed" style={{ color: getOpacityStyle('text', 0.8) }}>{s.translatedGifts}</p>
                  </div>
                  {parsedGifts && (parsedGifts.accountNumber || parsedGifts.iban) && (
                    <div className="relative p-5 rounded-2xl border backdrop-blur-md overflow-hidden" style={{ background: `linear-gradient(135deg, ${getOpacityStyle('bg', 0.06)} 0%, ${getOpacityStyle('bg', 0.02)} 100%)`, borderColor: theme.borderSubtle }}>
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-9 h-7 rounded bg-amber-500/20 border border-amber-500/30 relative"><div className="absolute inset-x-2.5 top-0 bottom-0 border-l border-r border-amber-500/30" /><div className="absolute inset-y-2.5 left-0 right-0 border-t border-b border-amber-500/30" /></div>
                        <span className="text-xs font-bold tracking-widest" style={{ color: theme.accent }}>{parsedGifts.bankName || 'BANK'}</span>
                      </div>
                      {parsedGifts.accountTitle && <div className="mb-3"><span className="text-[10px] uppercase tracking-wider block" style={{ color: getOpacityStyle('text', 0.45) }}>Account Title</span><span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>{parsedGifts.accountTitle}</span></div>}
                      {parsedGifts.accountNumber && <div className="flex justify-between items-center mb-3"><div><span className="text-[10px] uppercase tracking-wider block" style={{ color: getOpacityStyle('text', 0.45) }}>Account Number</span><span className="text-base font-mono tracking-wider" style={{ color: theme.textPrimary }}>{parsedGifts.accountNumber}</span></div><Button size="icon" variant="ghost" onClick={() => s.handleCopy(parsedGifts.accountNumber!, 'Account Number')} className="h-8 w-8" style={{ color: theme.accent }}>{s.copiedField === 'Account Number' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button></div>}
                      {parsedGifts.iban && <div className="flex justify-between items-center border-t pt-3" style={{ borderColor: getOpacityStyle('border', 0.1) }}><div><span className="text-[10px] uppercase tracking-wider block" style={{ color: getOpacityStyle('text', 0.45) }}>IBAN</span><span className="text-xs font-mono tracking-wider block truncate" style={{ color: theme.textPrimary }}>{parsedGifts.iban}</span></div><Button size="icon" variant="ghost" onClick={() => s.handleCopy(parsedGifts.iban!, 'IBAN')} className="h-8 w-8 ml-2" style={{ color: theme.accent }}>{s.copiedField === 'IBAN' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button></div>}
                    </div>
                  )}
                  {parsedGifts && (parsedGifts.raastId || parsedGifts.easyPaisa || parsedGifts.jazzCash) && (
                    <div className="grid gap-3">
                      {parsedGifts.raastId && <div className="flex justify-between items-center p-4 rounded-xl border" style={{ backgroundColor: getOpacityStyle('bg', 0.03), borderColor: theme.borderSubtle }}><div className="flex gap-3 items-center"><div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center font-bold text-xs" style={{ color: '#f97316' }}>R</div><div><span className="text-[9px] uppercase tracking-wider block" style={{ color: getOpacityStyle('text', 0.45) }}>Raast ID</span><span className="text-sm font-mono" style={{ color: theme.textPrimary }}>{parsedGifts.raastId}</span></div></div><Button size="icon" variant="ghost" onClick={() => s.handleCopy(parsedGifts.raastId!, 'Raast ID')} className="h-8 w-8" style={{ color: theme.accent }}>{s.copiedField === 'Raast ID' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button></div>}
                      {parsedGifts.easyPaisa && <div className="flex justify-between items-center p-4 rounded-xl border" style={{ backgroundColor: getOpacityStyle('bg', 0.03), borderColor: theme.borderSubtle }}><div className="flex gap-3 items-center"><div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center font-bold text-xs" style={{ color: '#22c55e' }}>EP</div><div><span className="text-[9px] uppercase tracking-wider block" style={{ color: getOpacityStyle('text', 0.45) }}>EasyPaisa</span><span className="text-sm font-mono" style={{ color: theme.textPrimary }}>{parsedGifts.easyPaisa}</span></div></div><Button size="icon" variant="ghost" onClick={() => s.handleCopy(parsedGifts.easyPaisa!, 'EasyPaisa')} className="h-8 w-8" style={{ color: theme.accent }}>{s.copiedField === 'EasyPaisa' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button></div>}
                      {parsedGifts.jazzCash && <div className="flex justify-between items-center p-4 rounded-xl border" style={{ backgroundColor: getOpacityStyle('bg', 0.03), borderColor: theme.borderSubtle }}><div className="flex gap-3 items-center"><div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center font-bold text-xs" style={{ color: '#eab308' }}>JC</div><div><span className="text-[9px] uppercase tracking-wider block" style={{ color: getOpacityStyle('text', 0.45) }}>JazzCash</span><span className="text-sm font-mono" style={{ color: theme.textPrimary }}>{parsedGifts.jazzCash}</span></div></div><Button size="icon" variant="ghost" onClick={() => s.handleCopy(parsedGifts.jazzCash!, 'JazzCash')} className="h-8 w-8" style={{ color: theme.accent }}>{s.copiedField === 'JazzCash' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button></div>}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </RevealSection>
        )}

        {/* ─── FAQ ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
              <h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>{s.t('faq', 'Frequently Asked Questions')}</h2>
              <ImperialDivider accent={theme.accent} />
              <div className="w-full flex flex-col gap-4">
                {[{ q_en: 'Can I bring a plus one?', q_ur: 'کیا میں اپنے ساتھ کسی اور کو لا سکتا ہوں؟', a_en: 'Please refer to your invitation card or contact the hosts directly.', a_ur: 'مہربانی فرما کر اپنے دعوتی کارڈ پر دیکھیں یا میزبانوں سے رابطہ کریں۔' }, { q_en: 'What time should I arrive?', q_ur: 'مجھے کس وقت پہنچنا چاہیے؟', a_en: 'We suggest arriving 15-30 minutes before the scheduled event time.', a_ur: 'ہم مشورہ دیتے ہیں کہ تقریب شروع ہونے سے 15-30 منٹ پہلے پہنچیں۔' }, { q_en: 'Is parking available?', q_ur: 'کیا پارکنگ کی سہولت دستیاب ہے؟', a_en: 'Yes, valet parking is available for all guests.', a_ur: 'جی ہاں، تمام مہمانوں کے لیے ویلے پارکنگ دستیاب ہے۔' }, { q_en: 'Who do I contact for queries?', q_ur: 'سوالات کے لیے کس سے رابطہ کریں؟', a_en: flowData?.contactPhone ? `Please contact the hosts at ${flowData.contactPhone}.` : 'Please refer to the Travel section or contact the hosts.', a_ur: flowData?.contactPhone ? `میزبانوں سے ${flowData.contactPhone} پر رابطہ کریں۔` : 'برائے مہربانی سفر کے سیکشن میں دیکھیں یا میزبانوں سے رابطہ کریں۔' }].map((item, idx) => {
                  const isExpanded = !!s.faqOpen[idx]
                  return (
                    <div key={idx} className="border rounded-xl overflow-hidden" style={{ backgroundColor: getOpacityStyle('bg', 0.02), borderColor: theme.borderSubtle }}>
                      <button onClick={() => s.setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }))} className="w-full flex justify-between items-center p-4 text-left text-sm font-semibold" style={{ color: theme.accent }}>
                        <span className="flex-1 pr-4">{s.language === 'ur' ? item.q_ur : item.q_en}</span>
                        <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', color: getOpacityStyle('text', 0.5) }} />
                      </button>
                      <AnimatePresence initial={false}>
                        {isExpanded && (<m.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}><div className="p-4 pt-0 border-t text-sm leading-relaxed" style={{ borderColor: getOpacityStyle('text', 0.1), color: getOpacityStyle('text', 0.8) }}>{s.language === 'ur' ? item.a_ur : item.a_en}</div></m.div>)}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ─── RSVP — Royal Parchment ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
              <h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>Your Royal Response</h2>
              <ImperialDivider accent={theme.accent} />
              <div className="relative w-full">
                {s.rsvpHearts.map((h) => (<div key={h} className="absolute heart-float pointer-events-none" style={{ left: `${20 + ((h * 13) % 61)}%`, top: '40%', animationDelay: `${h * 0.15}s` }}><Heart className="w-5 h-5" style={{ color: theme.accent, fill: getOpacityStyle('text', 0.4) }} /></div>))}
                {!s.rsvpSubmitted ? (
                  <ParchmentRSVP accent={theme.accent} bgSecondary={theme.bgSecondary}>
                    <p className="text-center text-xs tracking-widest uppercase mb-4 font-[var(--font-cinzel-dec)]" style={{ color: theme.accent }}>— Royal Decree —</p>
                    <div className="space-y-4">
                      <div className="space-y-2"><label className="text-sm" style={{ color: getOpacityStyle('text', 0.7) }}>{s.t('yourName', 'Your Name')}</label><Input value={s.rsvpName} onChange={e => s.setRsvpName(e.target.value)} placeholder={s.t('enterName', 'Enter your full name')} className="border" style={{ backgroundColor: theme.bgPrimary, borderColor: theme.borderSubtle, color: theme.textPrimary }} /></div>
                      <div className="space-y-2"><label className="text-sm" style={{ color: getOpacityStyle('text', 0.7) }}>{s.t('email', 'Email')} <span style={{ color: getOpacityStyle('text', 0.3) }}>{s.t('emailOptional', '(optional)')}</span></label><Input type="email" value={s.rsvpEmail} onChange={e => s.setRsvpEmail(e.target.value)} placeholder="your@email.com" className="border" style={{ backgroundColor: theme.bgPrimary, borderColor: theme.borderSubtle, color: theme.textPrimary }} /></div>
                      <div className="flex gap-3 pt-2">
                        <Button onClick={() => s.handleRSVP('accept')} className="flex-1 h-11 font-[var(--font-cinzel-dec)] text-xs tracking-wider" style={{ backgroundColor: theme.accent, borderColor: theme.accent, color: theme.bgPrimary }}><Check className="w-4 h-4 mr-1.5" />Accept with Honour</Button>
                        <Button onClick={() => s.handleRSVP('decline')} className="flex-1 border h-11 font-[var(--font-cinzel-dec)] text-xs tracking-wider" style={{ backgroundColor: 'transparent', borderColor: theme.borderSubtle, color: getOpacityStyle('text', 0.7) }} variant="outline"><X className="w-4 h-4 mr-1.5" />Send Regrets</Button>
                      </div>
                      <p className="text-[10px] text-center mt-3" style={{ color: getOpacityStyle('text', 0.4) }}>Your response is shared only with the host. See our <a href="/privacy" className="underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</p>
                    </div>
                  </ParchmentRSVP>
                ) : (
                  <m.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="text-center py-10">
                    <div className="w-16 h-16 rounded-full border flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: getOpacityStyle('border', 0.2), borderColor: getOpacityStyle('border', 0.4) }}>
                      {s.rsvpStatus === 'accept' ? <Check className="w-8 h-8" style={{ color: theme.accent }} /> : <Heart className="w-8 h-8" style={{ color: theme.accent }} />}
                    </div>
                    <h3 className="text-xl mb-2 font-[var(--font-cinzel-dec)]" style={{ color: theme.accent }}>{s.rsvpStatus === 'accept' ? s.t('joyfullyAccepted', 'Joyfully Accepted!') : s.t('thankYou', 'Thank You!')}</h3>
                    <p className="text-sm" style={{ color: getOpacityStyle('text', 0.6) }}>{s.rsvpStatus === 'accept' ? `We can't wait to celebrate with you, ${s.rsvpName}! 🎉` : `We'll miss you, ${s.rsvpName}. You'll be in our hearts! 💌`}</p>
                  </m.div>
                )}
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ─── WISHES — Scroll Cards ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
              <h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>{s.t('blessingsWishes', 'Blessings & Wishes')}</h2>
              <ImperialDivider accent={theme.accent} />
              <div className="w-full space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {s.wishes.length === 0 ? (
                  <div className="text-center py-8 text-sm border border-dashed rounded-lg" style={{ backgroundColor: getOpacityStyle('bg', 0.02), borderColor: getOpacityStyle('border', 0.15), color: getOpacityStyle('text', 0.5) }}>
                    {s.language === 'ur' ? 'ابھی تک کوئی دعا نہیں بھیجی گئی' : 'No blessings yet. Write the first blessing!'}
                  </div>
                ) : (
                  s.wishes.map((wish, idx) => {
                    const displayName = s.language === 'ur' && wish.translatedName ? wish.translatedName : wish.name
                    const displayMessage = s.language === 'ur' && wish.translatedMessage ? wish.translatedMessage : wish.message
                    return (
                      <m.div key={`${wish.name}-${idx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                        <ScrollWishCard name={displayName} message={displayMessage} accent={theme.accent} bg={getOpacityStyle('bg', 0.05)} border={getOpacityStyle('border', 0.15)} />
                      </m.div>
                    )
                  })
                )}
              </div>
              <div className="w-full space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0" style={{ backgroundColor: getOpacityStyle('bg', 0.1), borderColor: theme.borderSubtle }}><User className="w-3.5 h-3.5" style={{ color: getOpacityStyle('text', 0.5) }} /></div>
                  <Input value={s.wishName} onChange={e => s.setWishName(e.target.value)} placeholder={s.t('yourNameSender', 'Your name')} className="border h-10 flex-1" style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle, color: theme.textPrimary }} />
                </div>
                <div className="flex gap-2">
                  <Textarea value={s.wishMessage} onChange={e => s.setWishMessage(e.target.value)} placeholder={s.t('writeBlessing', 'Write your blessing...')} className="border resize-none flex-1" style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle, color: theme.textPrimary }} rows={2} />
                  <Button onClick={s.handleSendWish} className="border h-auto px-4 rounded-lg flex-shrink-0 self-end" style={{ backgroundColor: getOpacityStyle('bg', 0.2), borderColor: theme.borderSubtle, color: theme.accent }}><Send className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ─── FOOTER ─── */}
        <div className="py-10 text-center border-t" style={{ borderColor: getOpacityStyle('border', 0.1) }}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-px" style={{ backgroundColor: getOpacityStyle('bg', 0.2) }} />
            <span style={{ color: theme.accent }}>✦</span>
            <div className="w-8 h-px" style={{ backgroundColor: getOpacityStyle('bg', 0.2) }} />
          </div>
          <p className="text-xs tracking-wider" style={{ color: getOpacityStyle('text', 0.4) }}>
            {s.t('madeWithLove', 'Made with love by ShaadiLink').split(/(ShaadiLink|شادی لنک)/i).map((part, i) => 
              part.toLowerCase() === 'shaadilink' || part === 'شادی لنک' ? (
                <a key={i} href="https://www.shaadilink.com.pk/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                  {part}
                </a>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </p>
        </div>

      </m.div>

    </div>
  )
}
