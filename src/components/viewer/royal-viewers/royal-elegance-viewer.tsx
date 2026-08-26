'use client'

import React, { useMemo } from 'react'
import { Cinzel_Decorative, Great_Vibes } from 'next/font/google'
import { m, AnimatePresence } from 'framer-motion'
import { MapPin, Calendar, Clock, ChevronDown, Heart, Send, Check, X, User, Hotel, Car, Gift, Copy, Loader2, Share2 } from 'lucide-react'
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
import { RevealSection } from '../ui/reveal-section'
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

/* ─── Floating Rose Petals (Pure CSS) ─── */
function RosePetalsBg({ accent }: { accent: string }) {
  const petals = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    left: `${8 + i * 9}%`,
    delay: `${i * 0.8}s`,
    duration: `${6 + (i % 4) * 2}s`,
    size: 10 + (i % 4) * 6,
    rotate: i * 37,
  })), [])

  return (
    <>
      <style>{`
        @keyframes petalFloat {
          0%   { transform: translateY(110vh) rotate(0deg) scale(1); opacity: 0; }
          10%  { opacity: 0.18; }
          90%  { opacity: 0.1; }
          100% { transform: translateY(-10vh) rotate(360deg) scale(0.8); opacity: 0; }
        }
        @keyframes petalSway { 0%,100% { margin-left: 0; } 50% { margin-left: 20px; } }
      `}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {petals.map((p, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: p.left,
              bottom: '-5%',
              animationName: 'petalFloat, petalSway',
              animationDuration: `${p.duration}, ${parseFloat(p.duration) * 0.6}s`,
              animationTimingFunction: 'linear, ease-in-out',
              animationIterationCount: 'infinite',
              animationDelay: p.delay,
            }}
          >
            {/* Simple SVG rose petal */}
            <svg width={p.size} height={p.size} viewBox="0 0 40 40" fill="none" style={{ transform: `rotate(${p.rotate}deg)` }}>
              <ellipse cx="20" cy="25" rx="10" ry="15" fill={accent} fillOpacity="0.6" />
              <ellipse cx="20" cy="15" rx="8" ry="12" fill={accent} fillOpacity="0.4" transform="rotate(-20 20 20)" />
            </svg>
          </div>
        ))}
        {/* Vignette */}
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 80%, rgba(232,48,90,0.07) 0%, transparent 60%)` }} />
      </div>
    </>
  )
}

/* ─── Rose Divider ─── */
function RoseDivider({ accent }: { accent: string }) {
  return (
    <div className="flex items-center justify-center gap-3 w-full max-w-xs mx-auto my-2">
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${accent}80)` }} />
      <span className="text-xl" style={{ color: accent }}>🌹</span>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${accent}80)` }} />
    </div>
  )
}

/* ─── Film Ticket Event Card ─── */
function FilmTicketCard({ children, accent, bg, border }: { children: React.ReactNode; accent: string; bg: string; border: string }) {
  return (
    <div className="relative flex overflow-hidden rounded-lg border" style={{ backgroundColor: bg, borderColor: border }}>
      {/* Left accent strip */}
      <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: accent }} />
      {/* Perforated edge - left */}
      <div className="flex flex-col justify-around py-2 px-1.5 border-r border-dashed flex-shrink-0" style={{ borderColor: border }}>
        {[0, 1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: accent + '30' }} />)}
      </div>
      {/* Content */}
      <div className="flex-1 p-4">{children}</div>
      {/* Perforated edge - right */}
      <div className="flex flex-col justify-around py-2 px-1.5 border-l border-dashed flex-shrink-0" style={{ borderColor: border }}>
        {[0, 1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: accent + '30' }} />)}
      </div>
    </div>
  )
}

/* ─── Film Strip Countdown ─── */
function FilmStripCountdown({ theme }: { theme: ReturnType<typeof useInvitationState>['theme'] }) {
  return (
    <div className="w-full overflow-hidden">
      <CountdownTimer theme={theme} />
    </div>
  )
}

/* ─── Theatre RSVP Card ─── */
function TheatreRSVPCard({ children, accent, bg, border }: { children: React.ReactNode; accent: string; bg: string; border: string }) {
  return (
    <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: border, backgroundColor: bg }}>
      {/* Curtain-like top decoration */}
      <div className="h-3 relative overflow-hidden">
        <div className="absolute inset-0 flex">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex-1 rounded-b-full" style={{ backgroundColor: accent, opacity: 0.6 + (i % 2) * 0.2 }} />
          ))}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function RoyalEleganceViewer({ templateId, flowData, guestName, guestSlug }: RoyalViewerProps) {
  const s = useInvitationState(templateId || 'royal-elegance', flowData, guestName, guestSlug)
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
  const parsedGifts = useMemo(() => s.gifts ? s.parseGiftDetails(s.gifts) : null, [s.gifts])

  const groomParents = flowData?.hostGroomFamily?.trim() || (s.isDemo ? 'Mr. & Mrs. Tariq Mahmood' : '')
  const brideParents = flowData?.hostBrideFamily?.trim() || (s.isDemo ? 'Mr. & Mrs. Aslam Khan' : '')
  const groomCity = flowData?.hostGroomCity?.trim() || (s.isDemo ? 'Lahore' : '')
  const brideCity = flowData?.hostBrideCity?.trim() || (s.isDemo ? 'Islamabad' : '')

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden ${cinzelDec.variable} ${greatVibes.variable}`}
      dir={s.language === 'ur' ? 'rtl' : 'ltr'}
      style={{ backgroundColor: (isVideoEnvelope && !s.doorsOpened) ? 'transparent' : theme.bgPrimary, color: theme.textPrimary }}
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
              src={`${theme.openingVideoUrl}#t=0.001`}
              poster={theme.openingVideoPosterUrl}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="auto"
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

      {(!isVideoEnvelope || s.doorsOpened) && <RosePetalsBg accent={theme.accent} />}
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
        <button onClick={() => s.setLanguage(s.language === 'en' ? 'ur' : 'en')} className="w-10 h-10 rounded-full border backdrop-blur-sm flex items-center justify-center text-xs font-bold" style={{ backgroundColor: theme.bgPrimary + 'cc', borderColor: theme.borderSubtle, color: getOpacityStyle('text', 0.7) }} disabled={s.isTranslating}>
          {s.isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : (s.language === 'en' ? 'اردو' : 'EN')}
        </button>
        <button onClick={s.handleShare} className="w-10 h-10 rounded-full border backdrop-blur-sm flex items-center justify-center hover:scale-105 transition-transform" style={{ backgroundColor: theme.bgPrimary + 'cc', borderColor: theme.borderSubtle }}>
          <Share2 className="w-4 h-4" style={{ color: theme.accent }} />
        </button>
        <MusicToggle isPlaying={s.musicPlaying} onToggle={() => s.setMusicPlaying(!s.musicPlaying)} theme={theme} />
      </div>

      {/* ─── BISMILLAH OVERLAY (centered, white, 2s→5s during door video) ─── */}
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
              <span className="text-xl">🌹</span>
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
              <Heart className="w-4 h-4 text-white/60" />
              <div className="flex-1 h-px bg-white/40" />
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* ─── BISMILLAH on invitation page (non-video templates only) ─── */}
      {!isVideoEnvelope && flowData?.showBismillah !== false && (
        <m.div initial={{ opacity: 0 }} animate={s.doorsOpened ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 0.5, duration: 1.0 }}
          className="relative flex flex-col items-center justify-center py-12 px-6 border-b overflow-hidden" style={{ borderColor: getOpacityStyle('border', 0.15) }}>
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 50%, ${getOpacityStyle('bg', 0.07)} 0%, transparent 70%)` }} />
          <div className="flex items-center gap-4 w-full max-w-sm mb-4">
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${theme.accent})` }} />
            <span className="text-xl" style={{ color: theme.accent }}>🌹</span>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${theme.accent})` }} />
          </div>
          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={s.doorsOpened ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 1.0, duration: 1.0 }}
            className="font-arabic text-3xl sm:text-4xl md:text-5xl text-center leading-loose bismillah-glow" dir="rtl" style={{ color: theme.accent }}>
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </m.p>
          <p className="mt-3 text-xs tracking-[0.25em] uppercase text-center" style={{ color: getOpacityStyle('text', 0.45) }}>In the name of Allah, the Most Gracious, the Most Merciful</p>
          <div className="flex items-center gap-4 w-full max-w-sm mt-4">
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${theme.accent})` }} />
            <Heart className="w-4 h-4" style={{ color: theme.accent, fill: theme.accent + '60' }} />
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${theme.accent})` }} />
          </div>
        </m.div>
      )}

      {/* ─── HERO (seamless transition directly into hero video) ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
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
          <div className="absolute inset-0 z-0" style={{ background: `radial-gradient(ellipse at 50% 60%, rgba(232,48,90,0.08) 0%, transparent 60%)`, backgroundColor: theme.bgPrimary }} />
        )}

        {/* ── NAMES & DETAILS ──
            At z-30 (above door video z-20).
            Names fade in at 5.5s during door video.
            When door video fades out, names NEVER move or disappear.
            "Request honour" and scroll indicator fade in as door video finishes. */}
        <div className="relative z-30 w-full max-w-2xl text-center px-4">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: (!isVideoEnvelope || showNamesOverlay || doorVideoEnding || s.doorsOpened) ? 1 : 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <p className="text-center text-xs tracking-[0.5em] uppercase mb-8" style={{ color: theme.textSecondary }}>
              {s.t('gettingMarried', "We're getting married")}
            </p>

            {/* Split hero: name & ornate ampersand with parents below each */}
            <div className="flex items-center justify-center gap-2 sm:gap-6 flex-wrap">
              <div className="flex-1 min-w-[140px] flex flex-col items-end text-right">
                <h1
                  className="text-4xl sm:text-5xl md:text-6xl font-bold font-[var(--font-great-vibes)]"
                  style={{ color: theme.textPrimary, textShadow: `0 0 20px ${theme.accent}44` }}
                >
                  {s.translatedPartner1}
                </h1>
                {groomParents && (
                  <div className="flex flex-col items-end mt-1">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-medium" style={{ color: `${theme.accentLight}dd` }}>
                      {s.language === 'ur' ? 'فرزند' : 'Son of'}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold tracking-wide mt-0.5" style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 15px rgba(232,48,90,0.5)' }}>
                      {groomParents}
                    </span>
                    {groomCity && (
                      <span className="text-[9px] tracking-wider uppercase opacity-75" style={{ color: theme.accentLight }}>
                        ({groomCity})
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div
                className="flex-shrink-0 text-6xl sm:text-8xl font-[var(--font-great-vibes)] px-1 self-start sm:self-center"
                style={{ color: theme.accent, textShadow: `0 0 30px ${theme.accent}88` }}
              >
                &
              </div>

              <div className="flex-1 min-w-[140px] flex flex-col items-start text-left">
                <h1
                  className="text-4xl sm:text-5xl md:text-6xl font-bold font-[var(--font-great-vibes)]"
                  style={{ color: theme.textPrimary, textShadow: `0 0 20px ${theme.accent}44` }}
                >
                  {s.translatedPartner2}
                </h1>
                {brideParents && (
                  <div className="flex flex-col items-start mt-1">
                    <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-medium" style={{ color: `${theme.accentLight}dd` }}>
                      {s.language === 'ur' ? 'دختر' : 'Daughter of'}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold tracking-wide mt-0.5" style={{ color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 15px rgba(232,48,90,0.5)' }}>
                      {brideParents}
                    </span>
                    {brideCity && (
                      <span className="text-[9px] tracking-wider uppercase opacity-75" style={{ color: theme.accentLight }}>
                        ({brideCity})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 my-6">
              <div className="w-20 h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent})` }} />
              <Heart className="w-4 h-4" style={{ color: theme.accent, fill: theme.accent }} />
              <div className="w-20 h-px" style={{ background: `linear-gradient(270deg, transparent, ${theme.accent})` }} />
            </div>
          </m.div>

          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: (!isVideoEnvelope || doorVideoEnding || s.doorsOpened) ? 1 : 0 }}
            transition={{ delay: 0.3, duration: 1.0 }}
            className="text-center text-base tracking-[0.15em] font-[var(--font-great-vibes)]"
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
        {/* ─── WELCOME ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6" style={{ background: `linear-gradient(180deg, ${theme.bgPrimary} 0%, ${theme.bgSecondary}88 50%, ${theme.bgPrimary} 100%)` }}>
            <div className="max-w-lg mx-auto text-center">
              {s.guestNameFromUrl && (
                <m.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col items-center gap-4 mb-8">
                  <h3 className="text-3xl md:text-4xl capitalize font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>{s.language === 'ur' ? 'محترم' : 'Dear'} {s.translatedGuestName},</h3>
                  {s.flowData?.guestSeats != null && (
                    <m.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
                      className="flex items-center gap-2 px-5 py-2 rounded-full border"
                      style={{ borderColor: `rgba(${theme.accentRgb},0.3)`, backgroundColor: `rgba(${theme.accentRgb},0.1)` }}>
                      <User className="w-4 h-4 shrink-0" style={{ color: theme.accent }} />
                      <span className="text-sm font-semibold tracking-wide font-[var(--font-great-vibes)]" style={{ color: theme.accentLight }}>
                        {s.flowData.guestSeats === 0 ? (s.language === 'ur' ? 'پوری فیملی مدعو' : 'Whole Family Invited') : s.flowData.guestSeats === 1 ? (s.language === 'ur' ? '۱ مہمان مدعو' : '1 Person Invited') : (s.language === 'ur' ? `${s.flowData.guestSeats} مہمان مدعو` : `${s.flowData.guestSeats} Persons Invited`)}
                      </span>
                    </m.div>
                  )}
                </m.div>
              )}
              <RoseDivider accent={theme.accent} />
              <p className="text-xl md:text-2xl leading-relaxed italic my-8 font-[var(--font-great-vibes)] whitespace-pre-wrap break-words" style={{ color: theme.accentLight, textShadow: `0 0 15px ${getOpacityStyle('text', 0.2)}` }}>{s.translatedWelcomeMsg}</p>
              
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

              <RoseDivider accent={theme.accent} />
            </div>
          </section>
        </RevealSection>

        {/* ─── SCRATCH CARD ─── */}
        <RevealSection><section className="py-16 md:py-20 px-6"><ScratchCard revealed={s.scratchRevealed} onReveal={s.handleScratchReveal} theme={theme} language={s.language} translations={s.translations} scratchDateInfo={s.scratchDateInfo} scratchTimeFormatted={s.scratchTimeFormatted} /></section></RevealSection>

        {/* ─── QURANIC VERSE ─── */}
        {flowData?.showQuranVerse && (
          <RevealSection>
            <section className="py-16 md:py-20 px-6">
              <div className="max-w-2xl mx-auto text-center space-y-6 py-10 px-6 rounded-2xl border" style={{ borderColor: getOpacityStyle('border', 0.15), backgroundColor: getOpacityStyle('bg', 0.3) }}>
                <div className="flex justify-center items-center gap-4 mb-2"><div className="w-8 h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent})` }} /><span className="text-gold opacity-80 text-2xl font-arabic">﷽</span><div className="w-8 h-px" style={{ background: `linear-gradient(-90deg, transparent, ${theme.accent})` }} /></div>
                <p className="font-arabic text-2xl md:text-3xl leading-loose" dir="rtl" style={{ color: theme.accentLight }}>وَمِنْ ءَايَـٰتِهِۦٓ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَٰجًا لِّتَسْکُنُوٓا۟ إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً</p>
                <p className="text-sm md:text-base italic leading-relaxed" style={{ color: theme.textSecondary }}>&ldquo;And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy.&rdquo;<span className="block text-xs mt-2 font-semibold not-italic" style={{ color: theme.accent }}>— Surah Ar-Rum [30:21]</span></p>
                <div className="flex justify-center items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getOpacityStyle('border', 0.3) }} /><div className="w-16 h-px" style={{ backgroundColor: getOpacityStyle('border', 0.2) }} /><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getOpacityStyle('border', 0.3) }} /></div>
                <p className="font-arabic text-lg md:text-xl leading-loose max-w-xl mx-auto px-4" dir="rtl" style={{ color: theme.textPrimary || '#ffffff' }}>&ldquo;اور اس کی نشانیوں میں سے ہے کہ اس نے تمہارے لیے تمہاری ہی جنس سے جوڑے پیدا کیے تاکہ تم ان سے آرام پاؤ اور اس نے تمہارے درمیان محبت اور رحمت پیدا کر دی، یقیناً اس میں غور و فکر کرنے والوں کے لیے نشانیاں ہیں۔&rdquo;<span className="block text-xs mt-2 font-sans not-italic opacity-85" style={{ color: theme.accent }}>— سورہ روم [30:21]</span></p>
              </div>
            </section>
          </RevealSection>
        )}

        {/* ─── PHOTO GALLERY ─── */}
        <RevealSection><section className="py-16 md:py-20 px-6"><div className="flex flex-col items-center gap-6"><h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>{s.t('ourMoments', 'Our Moments')}</h2><RoseDivider accent={theme.accent} /><PhotoGallery theme={theme} images={flowData?.slideshowImages} /></div></section></RevealSection>

        {/* ─── VIDEO ─── */}
        {s.youtubeVideoId && (<RevealSection><section className="py-16 md:py-20 px-6"><div className="flex flex-col items-center gap-6"><h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>{s.t('Our Story')}</h2><RoseDivider accent={theme.accent} /><div className="w-full max-w-3xl mx-auto rounded-xl overflow-hidden border" style={{ borderColor: getOpacityStyle('border', 0.2) }}><div className="aspect-video"><iframe className="w-full h-full" src={`https://www.youtube.com/embed/${s.youtubeVideoId}?rel=0&modestbranding=1`} title={s.t('Our Story')} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div></div></div></section></RevealSection>)}

        {/* ─── COUNTDOWN — Film Strip Style ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6" style={{ background: `linear-gradient(180deg, ${theme.bgPrimary} 0%, ${theme.bgSecondary}88 100%)` }}>
            <div className="flex flex-col items-center gap-8">
              <h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>{s.t('countingDown', 'Counting Down to Forever')}</h2>
              <RoseDivider accent={theme.accent} />
              {/* Film strip wrapper */}
              <div className="w-full max-w-md">
                <div className="flex gap-1 justify-center mb-1">{[...Array(20)].map((_, i) => <div key={i} className="w-3 h-2 rounded-sm" style={{ backgroundColor: theme.accent + '30' }} />)}</div>
                <CountdownTimer theme={theme} translations={s.language === 'ur' ? s.translations : undefined} targetDate={s.firstEvent?.date} targetTime={s.firstEvent?.time} />
                <div className="flex gap-1 justify-center mt-1">{[...Array(20)].map((_, i) => <div key={i} className="w-3 h-2 rounded-sm" style={{ backgroundColor: theme.accent + '30' }} />)}</div>
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ─── EVENT TIMELINE — Film Ticket Cards ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
              <h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>{s.t('programTimeline', 'Program Timeline')}</h2>
              <RoseDivider accent={theme.accent} />
              <div className="w-full flex flex-col gap-4">
                {s.dynamicEvents.map((event, idx) => {
                  const te = s.getTranslatedEvent(event, idx)
                  return (
                    <RevealSection key={event.name} delay={idx * 0.1}>
                      <FilmTicketCard accent={theme.accent} bg={getOpacityStyle('bg', 0.04)} border={theme.borderSubtle}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold tracking-wider uppercase text-sm" style={{ color: theme.accent }}>{te.name}</h3>
                          <span className="text-[10px] font-mono opacity-50" style={{ color: theme.accent }}>#{String(idx + 1).padStart(2, '0')}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs mb-2" style={{ color: getOpacityStyle('text', 0.5) }}>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {te.date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {te.time}</span>
                        </div>
                        <p className="text-sm leading-relaxed mb-3" style={{ color: getOpacityStyle('text', 0.6) }}>{te.description}</p>
                        
                        {/* Nikah Registration Note (Optional Pakistani Feature) */}
                        {flowData?.showNikahRegistration && (event.name.toLowerCase().includes('nikkah') || event.name.toLowerCase().includes('nikah') || te.name.includes('نکاح')) && (
                          <div className="mb-4 flex w-fit items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm" style={{ backgroundColor: getOpacityStyle('bg', 0.08), borderColor: theme.accent }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: theme.accent }}><path d="M20 19.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L18 5.5"/><path d="m15 5 3 3"/><path d="m19 9-8 8-4 1 1-4 8-8Z"/></svg>
                            <span className="text-xs font-semibold tracking-wide" style={{ color: theme.accent }}>{s.language === 'ur' ? 'نکاح کی باقاعدہ رجسٹریشن کی جائے گی' : 'Nikah will be formally registered'}</span>
                          </div>
                        )}

                        <AddToCalendarDropdown event={event} partner1={s.partner1} partner2={s.partner2} theme={theme} label={s.t('addToCalendar', 'Add to Calendar')} location={[s.venueName, s.rawVenueAddress].filter(Boolean).join(', ')} />
                      </FilmTicketCard>
                    </RevealSection>
                  )
                })}
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ─── DRESS CODE ─── */}
        {(s.dressCodeWomen || s.dressCodeMen) && (<RevealSection><section className="py-16 md:py-20 px-6"><div className="flex flex-col items-center gap-8 max-w-md mx-auto"><h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>{s.t('dressCode', 'Dress Code')}</h2><RoseDivider accent={theme.accent} /><div className="grid grid-cols-2 gap-6 w-full">{s.dressCodeWomen && (<div className="flex flex-col items-center p-5 rounded-xl border text-center" style={{ backgroundColor: getOpacityStyle('bg', 0.03), borderColor: theme.borderSubtle }}><span className="text-xs tracking-wider uppercase mb-2" style={{ color: getOpacityStyle('text', 0.5) }}>{s.t('ladies', 'Ladies')}</span><p className="text-sm font-semibold leading-relaxed" style={{ color: theme.textPrimary }}>{s.translatedDressCodeWomen}</p><div className="flex gap-2 mt-3 flex-wrap justify-center">{s.extractColors(s.dressCodeWomen).map((c, i) => (<div key={i} className="w-5 h-5 rounded-full border" style={{ backgroundColor: c.hex, borderColor: getOpacityStyle('border', 0.3) }} title={c.name} />))}</div></div>)}{s.dressCodeMen && (<div className="flex flex-col items-center p-5 rounded-xl border text-center" style={{ backgroundColor: getOpacityStyle('bg', 0.03), borderColor: theme.borderSubtle }}><span className="text-xs tracking-wider uppercase mb-2" style={{ color: getOpacityStyle('text', 0.5) }}>{s.t('gentlemen', 'Gentlemen')}</span><p className="text-sm font-semibold leading-relaxed" style={{ color: theme.textPrimary }}>{s.translatedDressCodeMen}</p><div className="flex gap-2 mt-3 flex-wrap justify-center">{s.extractColors(s.dressCodeMen).map((c, i) => (<div key={i} className="w-5 h-5 rounded-full border" style={{ backgroundColor: c.hex, borderColor: getOpacityStyle('border', 0.3) }} title={c.name} />))}</div></div>)}</div></div></section></RevealSection>)}

        {/* ─── TRAVEL ─── */}
        {(s.accommodation || s.transportation) && (<RevealSection><section className="py-16 md:py-20 px-6"><div className="flex flex-col items-center gap-8 max-w-md mx-auto"><h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>{s.t('travelAccommodations', 'Travel & Accommodations')}</h2><RoseDivider accent={theme.accent} /><div className="flex flex-col gap-5 w-full">{s.accommodation && (<Card className="backdrop-blur-sm w-full" style={{ backgroundColor: getOpacityStyle('bg', 0.03), borderColor: theme.borderSubtle }}><CardContent className="flex gap-4 p-5 items-start"><div className="w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0" style={{ borderColor: theme.borderSubtle }}><Hotel className="w-5 h-5" style={{ color: theme.accent }} /></div><div><h3 className="text-base font-semibold mb-1" style={{ color: theme.accent }}>{s.t('hotelBlocks', 'Hotel Accommodations')}</h3><p className="text-sm leading-relaxed" style={{ color: getOpacityStyle('text', 0.75) }}>{s.translatedAccommodation}</p></div></CardContent></Card>)}{s.transportation && (<Card className="backdrop-blur-sm w-full" style={{ backgroundColor: getOpacityStyle('bg', 0.03), borderColor: theme.borderSubtle }}><CardContent className="flex gap-4 p-5 items-start"><div className="w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0" style={{ borderColor: theme.borderSubtle }}><Car className="w-5 h-5" style={{ color: theme.accent }} /></div><div><h3 className="text-base font-semibold mb-1" style={{ color: theme.accent }}>{s.t('transportationInfo', 'Transportation Info')}</h3><p className="text-sm leading-relaxed" style={{ color: getOpacityStyle('text', 0.75) }}>{s.translatedTransportation}</p></div></CardContent></Card>)}</div></div></section></RevealSection>)}

        {/* ─── VENUE ─── */}
        <RevealSection><section className="py-16 md:py-20 px-6"><div className="flex flex-col items-center gap-6 max-w-md mx-auto"><h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)] flex items-center gap-3" style={{ color: theme.accent }}><MapPin className="w-7 h-7" style={{ color: getOpacityStyle('text', 0.7) }} />{s.t('venue', 'Venue')}</h2><RoseDivider accent={theme.accent} />
          
          <div className="text-center space-y-2"><h3 className="text-2xl font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>{s.translatedVenueName}</h3><p className="text-sm" style={{ color: getOpacityStyle('text', 0.6) }}>{s.translatedVenueAddress}</p></div>
          
          {flowData?.isSegregated && (
            <div className="w-full text-center p-4 border rounded-xl" style={{ backgroundColor: getOpacityStyle('bg', 0.05), borderColor: theme.borderSubtle }}>
              <p className="text-sm font-semibold mb-1" style={{ color: theme.accent }}>{s.language === 'ur' ? 'خواتین اور حضرات کا پردے کے ساتھ الگ انتظام ہے' : 'Separate setup for Ladies & Gents'}</p>
              {flowData.venueDetailsSegregated && <p className="text-xs" style={{ color: getOpacityStyle('text', 0.7) }}>{flowData.venueDetailsSegregated}</p>}
            </div>
          )}

          <div className="w-full rounded-2xl overflow-hidden border" style={{ borderColor: theme.borderSubtle }}><iframe title="Venue Location Map" width="100%" height="220" style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) grayscale(10%)' }} src={`https://maps.google.com/maps?q=${encodeURIComponent(s.mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div><Button asChild className="border rounded-lg px-6 py-2.5 h-auto" style={{ backgroundColor: getOpacityStyle('bg', 0.1), borderColor: theme.borderSubtle, color: theme.accent }} variant="outline"><a href={s.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(s.venueAddress)}`} target="_blank" rel="noopener noreferrer"><MapPin className="w-4 h-4 mr-2" />{s.t('viewOnMaps', 'View on Google Maps')}</a></Button></div></section></RevealSection>

        {/* ─── GIFTS ─── */}
        {s.gifts && !s.flowData?.hideDigitalShagun && (<RevealSection><section className="py-16 md:py-20 px-6"><div className="flex flex-col items-center gap-8 max-w-md mx-auto"><h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>{s.t('giftsShagun', 'Digital Shagun & Registry')}</h2><RoseDivider accent={theme.accent} /><div className="w-full flex flex-col gap-6"><div className="text-center p-4 border rounded-xl" style={{ backgroundColor: getOpacityStyle('bg', 0.02), borderColor: theme.borderSubtle }}><Gift className="w-6 h-6 mx-auto mb-2" style={{ color: theme.accent }} /><p className="text-sm leading-relaxed" style={{ color: getOpacityStyle('text', 0.8) }}>{s.translatedGifts}</p></div>{parsedGifts && (parsedGifts.accountNumber || parsedGifts.iban) && (<div className="relative p-5 rounded-2xl border backdrop-blur-md overflow-hidden" style={{ background: `linear-gradient(135deg, ${getOpacityStyle('bg', 0.06)} 0%, ${getOpacityStyle('bg', 0.02)} 100%)`, borderColor: theme.borderSubtle }}><div className="flex justify-between items-start mb-6"><div className="w-9 h-7 rounded bg-amber-500/20 border border-amber-500/30 relative"><div className="absolute inset-x-2.5 top-0 bottom-0 border-l border-r border-amber-500/30" /><div className="absolute inset-y-2.5 left-0 right-0 border-t border-b border-amber-500/30" /></div><span className="text-xs font-bold tracking-widest" style={{ color: theme.accent }}>{parsedGifts.bankName || 'BANK'}</span></div>{parsedGifts.accountTitle && <div className="mb-3"><span className="text-[10px] uppercase tracking-wider block" style={{ color: getOpacityStyle('text', 0.45) }}>Account Title</span><span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>{parsedGifts.accountTitle}</span></div>}{parsedGifts.accountNumber && <div className="flex justify-between items-center mb-3"><div><span className="text-[10px] uppercase tracking-wider block" style={{ color: getOpacityStyle('text', 0.45) }}>Account Number</span><span className="text-base font-mono tracking-wider" style={{ color: theme.textPrimary }}>{parsedGifts.accountNumber}</span></div><Button size="icon" variant="ghost" onClick={() => s.handleCopy(parsedGifts.accountNumber!, 'Account Number')} className="h-8 w-8" style={{ color: theme.accent }}>{s.copiedField === 'Account Number' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button></div>}{parsedGifts.iban && <div className="flex justify-between items-center border-t pt-3" style={{ borderColor: getOpacityStyle('border', 0.1) }}><div><span className="text-[10px] uppercase tracking-wider block" style={{ color: getOpacityStyle('text', 0.45) }}>IBAN</span><span className="text-xs font-mono tracking-wider block truncate" style={{ color: theme.textPrimary }}>{parsedGifts.iban}</span></div><Button size="icon" variant="ghost" onClick={() => s.handleCopy(parsedGifts.iban!, 'IBAN')} className="h-8 w-8 ml-2" style={{ color: theme.accent }}>{s.copiedField === 'IBAN' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button></div>}</div>)}</div></div></section></RevealSection>)}

        {/* ─── FAQ ─── */}
        <RevealSection><section className="py-16 md:py-20 px-6"><div className="flex flex-col items-center gap-8 max-w-md mx-auto"><h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>{s.t('faq', 'Frequently Asked Questions')}</h2><RoseDivider accent={theme.accent} /><div className="w-full flex flex-col gap-4">{[{ q_en: 'Can I bring a plus one?', q_ur: 'کیا میں اپنے ساتھ کسی اور کو لا سکتا ہوں؟', a_en: 'Please refer to your invitation card or contact the hosts.', a_ur: 'مہربانی فرما کر اپنے دعوتی کارڈ پر دیکھیں۔' }, { q_en: 'What time should I arrive?', q_ur: 'مجھے کس وقت پہنچنا چاہیے؟', a_en: 'We suggest arriving 15-30 minutes early.', a_ur: '15-30 منٹ پہلے پہنچیں۔' }, { q_en: 'Is parking available?', q_ur: 'پارکنگ دستیاب ہے؟', a_en: 'Yes, valet parking is available for all guests.', a_ur: 'جی ہاں، ویلے پارکنگ دستیاب ہے۔' }, { q_en: 'Who do I contact for queries?', q_ur: 'سوالات کے لیے؟', a_en: flowData?.contactPhone ? `Please contact the hosts at ${flowData.contactPhone}.` : 'Please contact the hosts directly.', a_ur: flowData?.contactPhone ? `میزبانوں سے ${flowData.contactPhone} پر رابطہ کریں۔` : 'میزبانوں سے رابطہ کریں۔' }].map((item, idx) => { const isExpanded = !!s.faqOpen[idx]; return (<div key={idx} className="border rounded-xl overflow-hidden" style={{ backgroundColor: getOpacityStyle('bg', 0.02), borderColor: theme.borderSubtle }}><button onClick={() => s.setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }))} className="w-full flex justify-between items-center p-4 text-left text-sm font-semibold" style={{ color: theme.accent }}><span className="flex-1 pr-4">{s.language === 'ur' ? item.q_ur : item.q_en}</span><ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', color: getOpacityStyle('text', 0.5) }} /></button><AnimatePresence initial={false}>{isExpanded && (<m.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}><div className="p-4 pt-0 border-t text-sm leading-relaxed" style={{ borderColor: getOpacityStyle('text', 0.1), color: getOpacityStyle('text', 0.8) }}>{s.language === 'ur' ? item.a_ur : item.a_en}</div></m.div>)}</AnimatePresence></div>) })}</div></div></section></RevealSection>

        {/* ─── RSVP — Theatre Style ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
              <h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>{s.t('willYouAttend', 'Will You Attend?')}</h2>
              <RoseDivider accent={theme.accent} />
              <div className="relative w-full">
                {s.rsvpHearts.map((h) => (<div key={h} className="absolute heart-float pointer-events-none" style={{ left: `${20 + ((h * 13) % 61)}%`, top: '40%', animationDelay: `${h * 0.15}s` }}><Heart className="w-5 h-5" style={{ color: theme.accent, fill: getOpacityStyle('text', 0.4) }} /></div>))}
                {!s.rsvpSubmitted ? (
                  <TheatreRSVPCard accent={theme.accent} bg={theme.bgSecondary} border={theme.borderSubtle}>
                    <p className="text-center text-xs tracking-widest uppercase mb-4 font-[var(--font-cinzel-dec)]" style={{ color: theme.accent }}>— Reserve Your Seat —</p>
                    <div className="space-y-4">
                      <div className="space-y-2"><label className="text-sm" style={{ color: getOpacityStyle('text', 0.7) }}>{s.t('yourName', 'Your Name')}</label><Input value={s.rsvpName} onChange={e => s.setRsvpName(e.target.value)} placeholder={s.t('enterName', 'Enter your full name')} className="border" style={{ backgroundColor: theme.bgPrimary, borderColor: theme.borderSubtle, color: theme.textPrimary }} /></div>
                      <div className="space-y-2"><label className="text-sm" style={{ color: getOpacityStyle('text', 0.7) }}>{s.t('email', 'Email')} <span style={{ color: getOpacityStyle('text', 0.3) }}>{s.t('emailOptional', '(optional)')}</span></label><Input type="email" value={s.rsvpEmail} onChange={e => s.setRsvpEmail(e.target.value)} placeholder="your@email.com" className="border" style={{ backgroundColor: theme.bgPrimary, borderColor: theme.borderSubtle, color: theme.textPrimary }} /></div>
                      <div className="flex gap-3 pt-2">
                        <Button onClick={() => s.handleRSVP('accept')} className="flex-1 h-11" style={{ backgroundColor: theme.accent, borderColor: theme.accent, color: '#fff' }}><Check className="w-4 h-4 mr-1.5" />Reserve My Seat</Button>
                        <Button onClick={() => s.handleRSVP('decline')} className="flex-1 border h-11" style={{ backgroundColor: 'transparent', borderColor: theme.borderSubtle, color: getOpacityStyle('text', 0.7) }} variant="outline"><X className="w-4 h-4 mr-1.5" />Send Regrets</Button>
                      </div>
                      <p className="text-[10px] text-center mt-3" style={{ color: getOpacityStyle('text', 0.4) }}>Your response is shared only with the host. See our <a href="/privacy" className="underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</p>
                    </div>
                  </TheatreRSVPCard>
                ) : (
                  <m.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="text-center py-10">
                    <div className="w-16 h-16 rounded-full border flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: getOpacityStyle('border', 0.2), borderColor: getOpacityStyle('border', 0.4) }}>{s.rsvpStatus === 'accept' ? <Check className="w-8 h-8" style={{ color: theme.accent }} /> : <Heart className="w-8 h-8" style={{ color: theme.accent }} />}</div>
                    <h3 className="text-xl mb-2 font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>{s.rsvpStatus === 'accept' ? s.t('joyfullyAccepted', 'Joyfully Accepted!') : s.t('thankYou', 'Thank You!')}</h3>
                    <p className="text-sm" style={{ color: getOpacityStyle('text', 0.6) }}>{s.rsvpStatus === 'accept' ? `We can't wait to celebrate with you, ${s.rsvpName}! 🎉` : `We'll miss you, ${s.rsvpName}. 💌`}</p>
                  </m.div>
                )}
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ─── WISHES ─── */}
        <RevealSection><section className="py-16 md:py-20 px-6"><div className="flex flex-col items-center gap-8 max-w-md mx-auto"><h2 className="text-3xl sm:text-4xl text-center font-[var(--font-great-vibes)]" style={{ color: theme.accent }}>{s.t('blessingsWishes', 'Blessings & Wishes')}</h2><RoseDivider accent={theme.accent} /><div className="w-full space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">{s.wishes.length === 0 ? <div className="text-center py-8 text-sm border border-dashed rounded-lg" style={{ backgroundColor: getOpacityStyle('bg', 0.02), borderColor: getOpacityStyle('border', 0.15), color: getOpacityStyle('text', 0.5) }}>{s.language === 'ur' ? 'ابھی تک کوئی دعا نہیں' : 'No blessings yet. Write the first!'}</div> : s.wishes.map((wish, idx) => { const dn = s.language === 'ur' && wish.translatedName ? wish.translatedName : wish.name; const dm = s.language === 'ur' && wish.translatedMessage ? wish.translatedMessage : wish.message; return (<m.div key={`${wish.name}-${idx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}><div className="border rounded-lg p-4" style={{ backgroundColor: getOpacityStyle('bg', 0.05), borderColor: getOpacityStyle('border', 0.15), borderLeft: `3px solid ${theme.accent}` }}><div className="flex items-start gap-3"><div className="w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0" style={{ backgroundColor: getOpacityStyle('bg', 0.1), borderColor: theme.borderSubtle }}><span className="text-xs font-bold" style={{ color: theme.accent }}>{dn.charAt(0).toUpperCase()}</span></div><div className="flex-1 min-w-0"><p className="text-xs font-semibold mb-1" style={{ color: getOpacityStyle('text', 0.7) }}>{dn}</p><p className="text-sm leading-relaxed" style={{ color: getOpacityStyle('text', 0.8) }}>{dm}</p></div></div></div></m.div>) })}</div><div className="w-full space-y-3"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0" style={{ backgroundColor: getOpacityStyle('bg', 0.1), borderColor: theme.borderSubtle }}><User className="w-3.5 h-3.5" style={{ color: getOpacityStyle('text', 0.5) }} /></div><Input value={s.wishName} onChange={e => s.setWishName(e.target.value)} placeholder={s.t('yourNameSender', 'Your name')} className="border h-10 flex-1" style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle, color: theme.textPrimary }} /></div><div className="flex gap-2"><Textarea value={s.wishMessage} onChange={e => s.setWishMessage(e.target.value)} placeholder={s.t('writeBlessing', 'Write your blessing...')} className="border resize-none flex-1" style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle, color: theme.textPrimary }} rows={2} /><Button onClick={s.handleSendWish} className="border h-auto px-4 rounded-lg flex-shrink-0 self-end" style={{ backgroundColor: getOpacityStyle('bg', 0.2), borderColor: theme.borderSubtle, color: theme.accent }}><Send className="w-4 h-4" /></Button></div></div></div></section></RevealSection>

        {/* ─── FOOTER ─── */}
        <div className="py-10 text-center border-t" style={{ borderColor: getOpacityStyle('border', 0.1) }}>
          <div className="flex items-center justify-center gap-3 mb-3"><div className="w-8 h-px" style={{ backgroundColor: getOpacityStyle('bg', 0.2) }} /><Heart className="w-3 h-3" style={{ color: getOpacityStyle('text', 0.3) }} /><div className="w-8 h-px" style={{ backgroundColor: getOpacityStyle('bg', 0.2) }} /></div>
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
