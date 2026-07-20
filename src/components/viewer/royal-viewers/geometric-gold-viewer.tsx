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
import { DoorOverlay } from '../door/door-overlay'
import { FireworksDisplay } from '../effects/fireworks'
import { ConfettiDisplay } from '../effects/confetti'
import { GoldDustSplash } from '../effects/gold-dust'
import { BackgroundParticles } from '../effects/particles'
import { MusicToggle } from '../ui/music-toggle'
import { RevealSection } from '../ui/reveal-section'
import { ScratchCard } from '../features/scratch-card'
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
}

/* ─── Hex Grid Background (pure SVG + CSS pan) ─── */
function HexGridBg({ accent }: { accent: string }) {
  return (
    <>
      <style>{`
        @keyframes hexPan { 0% { transform: translate(0, 0); } 100% { transform: translate(60px, 104px); } }
        .hex-grid-svg { animation: hexPan 12s linear infinite; }
      `}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <svg className="absolute -inset-32 w-[calc(100%+128px)] h-[calc(100%+128px)]" xmlns="http://www.w3.org/2000/svg" opacity="0.04">
          <defs>
            <pattern id="hex-pattern" x="0" y="0" width="60" height="104" patternUnits="userSpaceOnUse">
              <path d="M30 2 L58 17 L58 47 L30 62 L2 47 L2 17 Z" stroke={accent} strokeWidth="0.8" fill="none" />
              <path d="M30 62 L58 77 L58 107 L30 122 L2 107 L2 77 Z" stroke={accent} strokeWidth="0.8" fill="none" />
              <path d="M60 32 L88 17 L88 47 L60 62 L32 47 L32 17 Z" stroke={accent} strokeWidth="0.8" fill="none" />
            </pattern>
          </defs>
          <g className="hex-grid-svg">
            <rect width="200%" height="200%" fill="url(#hex-pattern)" />
          </g>
        </svg>
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(245,200,66,0.06) 0%, transparent 60%)` }} />
      </div>
    </>
  )
}

/* ─── Self-drawing gold line divider ─── */
function GoldLineDivider({ accent, label }: { accent: string; label?: string }) {
  return (
    <div className="flex items-center justify-center gap-4 w-full max-w-sm mx-auto my-3">
      <m.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }} style={{ transformOrigin: 'right', flex: 1, height: 1, backgroundColor: accent + '60' }} />
      {label ? <span className="text-[10px] tracking-[0.25em] uppercase font-mono" style={{ color: accent + 'aa' }}>{label}</span> : <div className="w-2 h-2 rotate-45" style={{ backgroundColor: accent }} />}
      <m.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }} style={{ transformOrigin: 'left', flex: 1, height: 1, backgroundColor: accent + '60' }} />
    </div>
  )
}

/* ─── Art Deco event card ─── */
function ArtDecoEventCard({ children, accent, bg, border }: { children: React.ReactNode; accent: string; bg: string; border: string }) {
  return (
    <div className="relative" style={{ backgroundColor: bg, borderColor: border, border: `1px solid ${border}` }}>
      {/* Corner ticks */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: accent }} />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: accent }} />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: accent }} />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: accent }} />
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function GeometricGoldViewer({ templateId, flowData, guestName }: RoyalViewerProps) {
  const s = useInvitationState(templateId || 'geometric-gold', flowData, guestName)
  const { theme, getOpacityStyle } = s
  const parsedGifts = useMemo(() => s.gifts ? s.parseGiftDetails(s.gifts) : null, [s.gifts])

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden ${cinzelDec.variable} ${greatVibes.variable}`}
      dir={s.language === 'ur' ? 'rtl' : 'ltr'}
      style={{ backgroundColor: theme.bgPrimary, color: theme.textPrimary }}
    >
      <HexGridBg accent={theme.accent} />
      <BackgroundParticles accentColor={theme.accent} />

      {/* Door Overlay — no Framer opacity on this wrapper (would flatten 3D transform context) */}
      {/* Door Overlay */}
      {s.doorOverlayVisible && (
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
        <button onClick={() => s.setLanguage(s.language === 'en' ? 'ur' : 'en')} className="w-10 h-10 border backdrop-blur-sm flex items-center justify-center text-xs font-bold" style={{ backgroundColor: theme.bgPrimary + 'cc', borderColor: theme.borderSubtle, color: getOpacityStyle('text', 0.7) }} disabled={s.isTranslating}>
          {s.isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : (s.language === 'en' ? 'اردو' : 'EN')}
        </button>
        <button onClick={s.handleShare} className="w-10 h-10 border backdrop-blur-sm flex items-center justify-center hover:scale-105 transition-transform" style={{ backgroundColor: theme.bgPrimary + 'cc', borderColor: theme.borderSubtle }}>
          <Share2 className="w-4 h-4" style={{ color: theme.accent }} />
        </button>
        <MusicToggle isPlaying={s.musicPlaying} onToggle={() => s.setMusicPlaying(!s.musicPlaying)} theme={theme} />
      </div>

      {/* ─── BISMILLAH ─── */}
      {flowData?.showBismillah !== false && (
        <m.div initial={{ opacity: 0 }} animate={s.doorsOpened ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 2.2, duration: 1.0 }}
          className="relative flex flex-col items-center justify-center py-12 px-6 border-b overflow-hidden" style={{ borderColor: getOpacityStyle('border', 0.15) }}>
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 50%, ${getOpacityStyle('bg', 0.07)} 0%, transparent 70%)` }} />
          <div className="flex items-center gap-4 w-full max-w-sm mb-4">
            <m.div initial={{ scaleX: 0 }} animate={s.doorsOpened ? { scaleX: 1 } : { scaleX: 0 }} transition={{ delay: 2.5, duration: 0.6 }} style={{ transformOrigin: 'right', flex: 1, height: 1, backgroundColor: theme.accent + '60' }} />
            <span className="text-sm font-mono" style={{ color: theme.accent }}>◆</span>
            <m.div initial={{ scaleX: 0 }} animate={s.doorsOpened ? { scaleX: 1 } : { scaleX: 0 }} transition={{ delay: 2.5, duration: 0.6 }} style={{ transformOrigin: 'left', flex: 1, height: 1, backgroundColor: theme.accent + '60' }} />
          </div>
          <m.p initial={{ opacity: 0, y: '30vh' }} animate={s.doorsOpened ? { opacity: 1, y: 0 } : { opacity: 0, y: '30vh' }} transition={{ duration: 1.5, delay: 1.2, ease: [0.25, 1, 0.5, 1] }}
            className="font-arabic text-3xl sm:text-4xl md:text-5xl text-center leading-loose bismillah-glow" dir="rtl" style={{ color: theme.accent }}>
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </m.p>
          <p className="mt-3 text-xs tracking-[0.25em] uppercase text-center font-mono" style={{ color: getOpacityStyle('text', 0.45) }}>In the name of Allah, the Most Gracious, the Most Merciful</p>
          <div className="flex items-center gap-4 w-full max-w-sm mt-4">
            <m.div initial={{ scaleX: 0 }} animate={s.doorsOpened ? { scaleX: 1 } : { scaleX: 0 }} transition={{ delay: 2.5, duration: 0.6 }} style={{ transformOrigin: 'right', flex: 1, height: 1, backgroundColor: theme.accent + '60' }} />
            <span className="text-sm font-mono" style={{ color: theme.accent }}>◆</span>
            <m.div initial={{ scaleX: 0 }} animate={s.doorsOpened ? { scaleX: 1 } : { scaleX: 0 }} transition={{ delay: 2.5, duration: 0.6 }} style={{ transformOrigin: 'left', flex: 1, height: 1, backgroundColor: theme.accent + '60' }} />
          </div>
        </m.div>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <m.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: s.heroVisible ? 1 : 0, scale: s.heroVisible ? 1 : 0.96 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
      >

        {/* ─── HERO — Minimal, self-drawing underline ─── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundColor: theme.bgPrimary, background: `radial-gradient(at 50% 40%, rgba(245,200,66,0.05) 0%, transparent 60%)` }} />
          <div className="relative z-10 w-full max-w-2xl text-center">
            <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-xs tracking-[0.5em] uppercase mb-10 font-mono" style={{ color: theme.textSecondary }}>
              {s.t('gettingMarried', "We're getting married")}
            </m.p>

            {/* Partner 1 */}
            <div className="mb-4">
              <m.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
                className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-[0.12em] uppercase font-[var(--font-cinzel-dec)]"
                style={{ color: theme.textPrimary }}>
                {s.translatedPartner1}
              </m.h1>
              <m.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.9, duration: 0.9 }}
                style={{ transformOrigin: 'left', height: 2, backgroundColor: theme.accent, marginTop: 4, boxShadow: `0 0 8px ${theme.accent}88` }} />
            </div>

            {/* Separator */}
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }} className="flex items-center justify-center gap-4 my-5">
              <div className="w-12 h-px" style={{ backgroundColor: theme.accent + '60' }} />
              <div className="w-3 h-3 rotate-45" style={{ backgroundColor: theme.accent, boxShadow: `0 0 8px ${theme.accent}` }} />
              <div className="w-12 h-px" style={{ backgroundColor: theme.accent + '60' }} />
            </m.div>

            {/* Partner 2 */}
            <div className="mb-10">
              <m.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }}
                className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-[0.12em] uppercase font-[var(--font-cinzel-dec)]"
                style={{ color: theme.textPrimary }}>
                {s.translatedPartner2}
              </m.h1>
              <m.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.1, duration: 0.9 }}
                style={{ transformOrigin: 'right', height: 2, backgroundColor: theme.accent, marginTop: 4, boxShadow: `0 0 8px ${theme.accent}88` }} />
            </div>

            <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="text-base sm:text-lg tracking-[0.2em] uppercase font-mono" style={{ color: theme.textSecondary }}>
              {s.t('requestHonour', 'Request the honour of your presence')}
            </m.p>
          </div>

          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="absolute bottom-8 flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-mono" style={{ color: theme.textMuted }}>{s.t('scroll', 'Scroll')}</span>
            <div className="animate-bounce"><ChevronDown className="w-4 h-4" style={{ color: theme.textMuted }} /></div>
          </m.div>
        </section>

        {/* ─── WELCOME ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="max-w-lg mx-auto text-center">
              {s.guestNameFromUrl && (
                <m.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col items-center gap-4 mb-8">
                  <h3 className="text-3xl md:text-4xl capitalize font-[var(--font-cinzel-dec)]" style={{ color: theme.accent }}>{s.language === 'ur' ? 'محترم' : 'Dear'} {s.guestNameFromUrl},</h3>
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
              <GoldLineDivider accent={theme.accent} />
              <p className="text-xl md:text-2xl leading-relaxed italic my-8 font-[var(--font-great-vibes)] whitespace-pre-wrap break-words" style={{ color: theme.accentLight }}>{s.translatedWelcomeMsg}</p>
              
              {/* Host Families */}
              {(flowData?.hostBrideFamily || flowData?.hostGroomFamily) && (
                <div className="flex flex-col gap-6 my-8">
                  {flowData?.hostBrideFamily && (
                    <m.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex flex-col items-center">
                      <span className="text-[10px] tracking-widest uppercase mb-1 font-mono" style={{ color: theme.textMuted }}>{s.language === 'ur' ? 'دلہن کے اہل خانہ' : 'Host (Bride)'}</span>
                      <span className="text-lg font-semibold" style={{ color: theme.textPrimary }}>{flowData.hostBrideFamily}</span>
                      {flowData.hostBrideCity && <span className="text-xs mt-1 font-mono" style={{ color: getOpacityStyle('text', 0.6) }}>{flowData.hostBrideCity}</span>}
                    </m.div>
                  )}
                  {flowData?.hostGroomFamily && (
                    <m.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex flex-col items-center">
                      <span className="text-[10px] tracking-widest uppercase mb-1 font-mono" style={{ color: theme.textMuted }}>{s.language === 'ur' ? 'دلہے کے اہل خانہ' : 'Host (Groom)'}</span>
                      <span className="text-lg font-semibold" style={{ color: theme.textPrimary }}>{flowData.hostGroomFamily}</span>
                      {flowData.hostGroomCity && <span className="text-xs mt-1 font-mono" style={{ color: getOpacityStyle('text', 0.6) }}>{flowData.hostGroomCity}</span>}
                    </m.div>
                  )}
                </div>
              )}

              <GoldLineDivider accent={theme.accent} />
            </div>
          </section>
        </RevealSection>

        {/* ─── SCRATCH CARD ─── */}
        <RevealSection><section className="py-16 md:py-20 px-6"><ScratchCard revealed={s.scratchRevealed} onReveal={s.handleScratchReveal} theme={theme} language={s.language} translations={s.translations} scratchDateInfo={s.scratchDateInfo} scratchTimeFormatted={s.scratchTimeFormatted} /></section></RevealSection>

        {/* ─── QURANIC VERSE ─── */}
        {flowData?.showQuranVerse && (<RevealSection><section className="py-16 md:py-20 px-6"><div className="max-w-2xl mx-auto text-center space-y-6 py-10 px-6 border backdrop-blur-md" style={{ borderColor: getOpacityStyle('border', 0.15), backgroundColor: getOpacityStyle('bg', 0.3) }}><div className="flex justify-center items-center gap-4 mb-2"><div className="w-8 h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent})` }} /><span className="text-gold opacity-80 text-2xl font-arabic">﷽</span><div className="w-8 h-px" style={{ background: `linear-gradient(-90deg, transparent, ${theme.accent})` }} /></div><p className="font-arabic text-2xl md:text-3xl leading-loose bismillah-glow" dir="rtl" style={{ color: theme.accentLight }}>وَمِنْ ءَايَـٰتِهِۦٓ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَٰجًا لِّتَسْکُنُوٓا۟ إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً</p><p className="text-sm md:text-base italic leading-relaxed" style={{ color: theme.textSecondary }}>&ldquo;And of His signs is that He created for you from yourselves mates that you may find tranquility in them.&rdquo;<span className="block text-xs mt-2 font-semibold not-italic" style={{ color: theme.accent }}>— Surah Ar-Rum [30:21]</span></p></div></section></RevealSection>)}

        {/* ─── PHOTO GALLERY ─── */}
        <RevealSection><section className="py-16 md:py-20 px-6"><div className="flex flex-col items-center gap-6"><h2 className="text-3xl sm:text-4xl text-center font-[var(--font-cinzel-dec)] uppercase tracking-wider" style={{ color: theme.accent }}>{s.t('ourMoments', 'Our Moments')}</h2><GoldLineDivider accent={theme.accent} /><PhotoGallery theme={theme} images={flowData?.slideshowImages} /></div></section></RevealSection>

        {/* ─── VIDEO ─── */}
        {s.youtubeVideoId && (<RevealSection><section className="py-16 md:py-20 px-6"><div className="flex flex-col items-center gap-6"><h2 className="text-3xl sm:text-4xl text-center font-[var(--font-cinzel-dec)] uppercase tracking-wider" style={{ color: theme.accent }}>Our Story</h2><GoldLineDivider accent={theme.accent} /><div className="w-full max-w-3xl mx-auto border" style={{ borderColor: getOpacityStyle('border', 0.2) }}><div className="aspect-video"><iframe className="w-full h-full" src={`https://www.youtube.com/embed/${s.youtubeVideoId}?rel=0&modestbranding=1`} title="Our Story" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div></div></div></section></RevealSection>)}

        {/* ─── COUNTDOWN — LCD Digital Style ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6" style={{ background: `linear-gradient(180deg, ${theme.bgPrimary} 0%, ${theme.bgSecondary} 100%)` }}>
            <div className="flex flex-col items-center gap-8">
              <h2 className="text-3xl sm:text-4xl text-center font-[var(--font-cinzel-dec)] uppercase tracking-wider" style={{ color: theme.accent }}>{s.t('countingDown', 'Counting Down')}</h2>
              <GoldLineDivider accent={theme.accent} />
              <CountdownTimer theme={theme} translations={s.language === 'ur' ? s.translations : undefined} targetDate={s.firstEvent?.date} targetTime={s.firstEvent?.time} />
            </div>
          </section>
        </RevealSection>

        {/* ─── EVENT TIMELINE — Art Deco Cards ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
              <h2 className="text-3xl sm:text-4xl text-center font-[var(--font-cinzel-dec)] uppercase tracking-wider" style={{ color: theme.accent }}>{s.t('programTimeline', 'Program')}</h2>
              <GoldLineDivider accent={theme.accent} />
              <div className="w-full flex flex-col gap-5">
                {s.dynamicEvents.map((event, idx) => {
                  const te = s.getTranslatedEvent(event, idx)
                  return (
                    <RevealSection key={event.name} delay={idx * 0.1}>
                      <ArtDecoEventCard accent={theme.accent} bg={getOpacityStyle('bg', 0.04)} border={theme.borderSubtle}>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-mono" style={{ color: theme.accent }}>◆</span>
                          <h3 className="font-bold tracking-widest uppercase text-sm font-mono" style={{ color: theme.accent }}>{te.name}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs mb-2 font-mono" style={{ color: getOpacityStyle('text', 0.5) }}>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {te.date}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {te.time}</span>
                        </div>
                        <p className="text-sm leading-relaxed mb-3" style={{ color: getOpacityStyle('text', 0.6) }}>{te.description}</p>
                        
                        {/* Nikah Registration Note (Optional Pakistani Feature) */}
                        {flowData?.showNikahRegistration && (event.name.toLowerCase().includes('nikkah') || event.name.toLowerCase().includes('nikah') || te.name.includes('نکاح')) && (
                          <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 rounded border" style={{ backgroundColor: getOpacityStyle('bg', 0.1), borderColor: theme.accent }}>
                            <span className="text-[10px] font-semibold font-mono tracking-wider uppercase" style={{ color: theme.accent }}>{s.language === 'ur' ? 'نکاح کی باقاعدہ رجسٹریشن کی جائے گی' : 'Nikah will be formally registered'}</span>
                          </div>
                        )}

                        <AddToCalendarDropdown event={event} partner1={s.partner1} partner2={s.partner2} theme={theme} label={s.t('addToCalendar', 'Add to Calendar')} location={[s.venueName, s.rawVenueAddress].filter(Boolean).join(', ')} />
                      </ArtDecoEventCard>
                    </RevealSection>
                  )
                })}
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ─── DRESS CODE ─── */}
        {(s.dressCodeWomen || s.dressCodeMen) && (<RevealSection><section className="py-16 md:py-20 px-6"><div className="flex flex-col items-center gap-8 max-w-md mx-auto"><h2 className="text-3xl sm:text-4xl text-center font-[var(--font-cinzel-dec)] uppercase tracking-wider" style={{ color: theme.accent }}>{s.t('dressCode', 'Dress Code')}</h2><GoldLineDivider accent={theme.accent} /><div className="grid grid-cols-2 gap-6 w-full">{s.dressCodeWomen && (<div className="flex flex-col items-center p-5 border text-center" style={{ backgroundColor: getOpacityStyle('bg', 0.03), borderColor: theme.borderSubtle }}><span className="text-xs tracking-wider uppercase mb-2 font-mono" style={{ color: getOpacityStyle('text', 0.5) }}>{s.t('ladies', 'Ladies')}</span><p className="text-sm font-semibold leading-relaxed" style={{ color: theme.textPrimary }}>{s.translatedDressCodeWomen}</p><div className="flex gap-2 mt-3 flex-wrap justify-center">{s.extractColors(s.dressCodeWomen).map((c, i) => (<div key={i} className="w-5 h-5 border" style={{ backgroundColor: c.hex, borderColor: getOpacityStyle('border', 0.3) }} title={c.name} />))}</div></div>)}{s.dressCodeMen && (<div className="flex flex-col items-center p-5 border text-center" style={{ backgroundColor: getOpacityStyle('bg', 0.03), borderColor: theme.borderSubtle }}><span className="text-xs tracking-wider uppercase mb-2 font-mono" style={{ color: getOpacityStyle('text', 0.5) }}>{s.t('gentlemen', 'Gentlemen')}</span><p className="text-sm font-semibold leading-relaxed" style={{ color: theme.textPrimary }}>{s.translatedDressCodeMen}</p><div className="flex gap-2 mt-3 flex-wrap justify-center">{s.extractColors(s.dressCodeMen).map((c, i) => (<div key={i} className="w-5 h-5 border" style={{ backgroundColor: c.hex, borderColor: getOpacityStyle('border', 0.3) }} title={c.name} />))}</div></div>)}</div></div></section></RevealSection>)}

        {/* ─── TRAVEL ─── */}
        {(s.accommodation || s.transportation) && (<RevealSection><section className="py-16 md:py-20 px-6"><div className="flex flex-col items-center gap-8 max-w-md mx-auto"><h2 className="text-3xl sm:text-4xl text-center font-[var(--font-cinzel-dec)] uppercase tracking-wider" style={{ color: theme.accent }}>{s.t('travelAccommodations', 'Travel')}</h2><GoldLineDivider accent={theme.accent} /><div className="flex flex-col gap-5 w-full">{s.accommodation && (<Card className="backdrop-blur-sm w-full" style={{ backgroundColor: getOpacityStyle('bg', 0.03), borderColor: theme.borderSubtle }}><CardContent className="flex gap-4 p-5 items-start"><div className="w-10 h-10 border flex items-center justify-center flex-shrink-0" style={{ borderColor: theme.borderSubtle }}><Hotel className="w-5 h-5" style={{ color: theme.accent }} /></div><div><h3 className="text-base font-semibold mb-1 font-mono uppercase tracking-wider" style={{ color: theme.accent }}>{s.t('hotelBlocks', 'Accommodations')}</h3><p className="text-sm leading-relaxed" style={{ color: getOpacityStyle('text', 0.75) }}>{s.translatedAccommodation}</p></div></CardContent></Card>)}{s.transportation && (<Card className="backdrop-blur-sm w-full" style={{ backgroundColor: getOpacityStyle('bg', 0.03), borderColor: theme.borderSubtle }}><CardContent className="flex gap-4 p-5 items-start"><div className="w-10 h-10 border flex items-center justify-center flex-shrink-0" style={{ borderColor: theme.borderSubtle }}><Car className="w-5 h-5" style={{ color: theme.accent }} /></div><div><h3 className="text-base font-semibold mb-1 font-mono uppercase tracking-wider" style={{ color: theme.accent }}>{s.t('transportationInfo', 'Transportation')}</h3><p className="text-sm leading-relaxed" style={{ color: getOpacityStyle('text', 0.75) }}>{s.translatedTransportation}</p></div></CardContent></Card>)}</div></div></section></RevealSection>)}

        {/* ─── VENUE ─── */}
        <RevealSection><section className="py-16 md:py-20 px-6"><div className="flex flex-col items-center gap-6 max-w-md mx-auto"><h2 className="text-3xl sm:text-4xl text-center font-[var(--font-cinzel-dec)] uppercase tracking-wider flex items-center gap-3" style={{ color: theme.accent }}><MapPin className="w-7 h-7" style={{ color: getOpacityStyle('text', 0.7) }} />{s.t('venue', 'Venue')}</h2><GoldLineDivider accent={theme.accent} />
          
          <div className="text-center space-y-2"><h3 className="text-2xl font-[var(--font-cinzel-dec)] uppercase tracking-wider" style={{ color: theme.accent }}>{s.translatedVenueName}</h3><p className="text-sm font-mono" style={{ color: getOpacityStyle('text', 0.6) }}>{s.translatedVenueAddress}</p></div>
          
          {flowData?.isSegregated && (
            <div className="w-full text-center p-4 border" style={{ backgroundColor: getOpacityStyle('bg', 0.05), borderColor: theme.borderSubtle }}>
              <p className="text-sm font-semibold mb-1" style={{ color: theme.accent }}>{s.language === 'ur' ? 'خواتین اور حضرات کا پردے کے ساتھ الگ انتظام ہے' : 'Separate setup for Ladies & Gents'}</p>
              {flowData.venueDetailsSegregated && <p className="text-xs font-mono" style={{ color: getOpacityStyle('text', 0.7) }}>{flowData.venueDetailsSegregated}</p>}
            </div>
          )}

          <div className="w-full border" style={{ borderColor: theme.borderSubtle }}><iframe title="Venue Location Map" width="100%" height="220" style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) grayscale(10%)' }} src={`https://maps.google.com/maps?q=${encodeURIComponent(s.mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div><Button asChild className="border px-6 py-2.5 h-auto font-mono uppercase tracking-wider" style={{ backgroundColor: getOpacityStyle('bg', 0.1), borderColor: theme.borderSubtle, color: theme.accent }} variant="outline"><a href={s.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(s.venueAddress)}`} target="_blank" rel="noopener noreferrer"><MapPin className="w-4 h-4 mr-2" />{s.t('viewOnMaps', 'View on Maps')}</a></Button></div></section></RevealSection>

        {/* ─── GIFTS ─── */}
        {s.gifts && (<RevealSection><section className="py-16 md:py-20 px-6"><div className="flex flex-col items-center gap-8 max-w-md mx-auto"><h2 className="text-3xl sm:text-4xl text-center font-[var(--font-cinzel-dec)] uppercase tracking-wider" style={{ color: theme.accent }}>{s.t('giftsShagun', 'Shagun')}</h2><GoldLineDivider accent={theme.accent} /><div className="w-full flex flex-col gap-6"><div className="text-center p-4 border" style={{ backgroundColor: getOpacityStyle('bg', 0.02), borderColor: theme.borderSubtle }}><Gift className="w-6 h-6 mx-auto mb-2" style={{ color: theme.accent }} /><p className="text-sm leading-relaxed" style={{ color: getOpacityStyle('text', 0.8) }}>{s.translatedGifts}</p></div>{parsedGifts && (parsedGifts.accountNumber || parsedGifts.iban) && (<div className="relative p-5 border backdrop-blur-md overflow-hidden" style={{ background: `linear-gradient(135deg, ${getOpacityStyle('bg', 0.06)} 0%, ${getOpacityStyle('bg', 0.02)} 100%)`, borderColor: theme.borderSubtle }}><div className="flex justify-between items-start mb-6"><div className="w-9 h-7 rounded bg-amber-500/20 border border-amber-500/30 relative"><div className="absolute inset-x-2.5 top-0 bottom-0 border-l border-r border-amber-500/30" /><div className="absolute inset-y-2.5 left-0 right-0 border-t border-b border-amber-500/30" /></div><span className="text-xs font-bold tracking-widest font-mono" style={{ color: theme.accent }}>{parsedGifts.bankName || 'BANK'}</span></div>{parsedGifts.accountTitle && <div className="mb-3"><span className="text-[10px] uppercase tracking-wider block font-mono" style={{ color: getOpacityStyle('text', 0.45) }}>Account Title</span><span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>{parsedGifts.accountTitle}</span></div>}{parsedGifts.accountNumber && <div className="flex justify-between items-center mb-3"><div><span className="text-[10px] uppercase tracking-wider block font-mono" style={{ color: getOpacityStyle('text', 0.45) }}>Account Number</span><span className="text-base font-mono tracking-wider" style={{ color: theme.textPrimary, textShadow: `0 0 8px ${theme.accent}44` }}>{parsedGifts.accountNumber}</span></div><Button size="icon" variant="ghost" onClick={() => s.handleCopy(parsedGifts.accountNumber!, 'Account Number')} className="h-8 w-8" style={{ color: theme.accent }}>{s.copiedField === 'Account Number' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button></div>}{parsedGifts.iban && <div className="flex justify-between items-center border-t pt-3" style={{ borderColor: getOpacityStyle('border', 0.1) }}><div><span className="text-[10px] uppercase tracking-wider block font-mono" style={{ color: getOpacityStyle('text', 0.45) }}>IBAN</span><span className="text-xs font-mono tracking-wider block truncate" style={{ color: theme.textPrimary }}>{parsedGifts.iban}</span></div><Button size="icon" variant="ghost" onClick={() => s.handleCopy(parsedGifts.iban!, 'IBAN')} className="h-8 w-8 ml-2" style={{ color: theme.accent }}>{s.copiedField === 'IBAN' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button></div>}</div>)}</div></div></section></RevealSection>)}

        {/* ─── FAQ ─── */}
        <RevealSection><section className="py-16 md:py-20 px-6"><div className="flex flex-col items-center gap-8 max-w-md mx-auto"><h2 className="text-3xl sm:text-4xl text-center font-[var(--font-cinzel-dec)] uppercase tracking-wider" style={{ color: theme.accent }}>{s.t('faq', 'FAQ')}</h2><GoldLineDivider accent={theme.accent} /><div className="w-full flex flex-col gap-4">{[{ q_en: 'Can I bring a plus one?', q_ur: 'کیا میں اپنے ساتھ کسی اور کو لا سکتا ہوں؟', a_en: 'Please refer to your invitation card or contact the hosts directly.', a_ur: 'مہربانی فرما کر اپنے دعوتی کارڈ پر دیکھیں۔' }, { q_en: 'What time should I arrive?', q_ur: 'کس وقت پہنچنا چاہیے؟', a_en: 'We suggest arriving 15-30 minutes early.', a_ur: '15-30 منٹ پہلے پہنچیں۔' }, { q_en: 'Is parking available?', q_ur: 'پارکنگ دستیاب ہے؟', a_en: 'Yes, valet parking is available.', a_ur: 'جی ہاں، پارکنگ دستیاب ہے۔' }, { q_en: 'Who do I contact?', q_ur: 'کس سے رابطہ کریں؟', a_en: flowData?.contactPhone ? `Please contact the hosts at ${flowData.contactPhone}.` : 'Please contact the hosts directly.', a_ur: flowData?.contactPhone ? `میزبانوں سے ${flowData.contactPhone} پر رابطہ کریں۔` : 'میزبانوں سے رابطہ کریں۔' }].map((item, idx) => { const isExpanded = !!s.faqOpen[idx]; return (<div key={idx} className="border overflow-hidden" style={{ backgroundColor: getOpacityStyle('bg', 0.02), borderColor: theme.borderSubtle }}><button onClick={() => s.setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }))} className="w-full flex justify-between items-center p-4 text-left text-sm font-semibold font-mono" style={{ color: theme.accent }}><span className="flex-1 pr-4 uppercase tracking-wider text-xs">{s.language === 'ur' ? item.q_ur : item.q_en}</span><ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', color: getOpacityStyle('text', 0.5) }} /></button><AnimatePresence initial={false}>{isExpanded && (<m.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}><div className="p-4 pt-0 border-t text-sm leading-relaxed" style={{ borderColor: getOpacityStyle('text', 0.1), color: getOpacityStyle('text', 0.8) }}>{s.language === 'ur' ? item.a_ur : item.a_en}</div></m.div>)}</AnimatePresence></div>) })}</div></div></section></RevealSection>

        {/* ─── RSVP — Minimal Corporate ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
              <h2 className="text-3xl sm:text-4xl text-center font-[var(--font-cinzel-dec)] uppercase tracking-wider" style={{ color: theme.accent }}>Confirm Attendance</h2>
              <GoldLineDivider accent={theme.accent} />
              <div className="relative w-full">
                {s.rsvpHearts.map((h) => (<div key={h} className="absolute heart-float pointer-events-none" style={{ left: `${20 + ((h * 13) % 61)}%`, top: '40%', animationDelay: `${h * 0.15}s` }}><Heart className="w-5 h-5" style={{ color: theme.accent, fill: getOpacityStyle('text', 0.4) }} /></div>))}
                {!s.rsvpSubmitted ? (
                  <div className="w-full border p-6" style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle }}>
                    <div className="space-y-4">
                      <div className="space-y-2"><label className="text-xs font-mono uppercase tracking-widest" style={{ color: getOpacityStyle('text', 0.7) }}>{s.t('yourName', 'Your Name')}</label><Input value={s.rsvpName} onChange={e => s.setRsvpName(e.target.value)} placeholder={s.t('enterName', 'Full name')} className="border-0 border-b font-mono" style={{ backgroundColor: 'transparent', borderColor: theme.accent + '60', color: theme.textPrimary, borderRadius: 0 }} /></div>
                      <div className="space-y-2"><label className="text-xs font-mono uppercase tracking-widest" style={{ color: getOpacityStyle('text', 0.7) }}>{s.t('email', 'Email')} <span style={{ color: getOpacityStyle('text', 0.3) }}>{s.t('emailOptional', '(optional)')}</span></label><Input type="email" value={s.rsvpEmail} onChange={e => s.setRsvpEmail(e.target.value)} placeholder="your@email.com" className="border-0 border-b font-mono" style={{ backgroundColor: 'transparent', borderColor: theme.accent + '60', color: theme.textPrimary, borderRadius: 0 }} /></div>
                      <div className="flex gap-3 pt-4">
                        <Button onClick={() => s.handleRSVP('accept')} className="flex-1 h-11 font-mono uppercase tracking-widest text-xs" style={{ backgroundColor: theme.accent, borderColor: theme.accent, color: theme.bgPrimary, borderRadius: 0 }}><Check className="w-4 h-4 mr-1.5" />Confirm</Button>
                        <Button onClick={() => s.handleRSVP('decline')} className="flex-1 border h-11 font-mono uppercase tracking-widest text-xs" style={{ backgroundColor: 'transparent', borderColor: theme.borderSubtle, color: getOpacityStyle('text', 0.7), borderRadius: 0 }} variant="outline"><X className="w-4 h-4 mr-1.5" />Decline</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <m.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="text-center py-10">
                    <div className="w-16 h-16 border flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: getOpacityStyle('border', 0.2), borderColor: getOpacityStyle('border', 0.4) }}>{s.rsvpStatus === 'accept' ? <Check className="w-8 h-8" style={{ color: theme.accent }} /> : <Heart className="w-8 h-8" style={{ color: theme.accent }} />}</div>
                    <h3 className="text-xl mb-2 font-mono uppercase tracking-widest" style={{ color: theme.accent }}>{s.rsvpStatus === 'accept' ? 'Confirmed' : 'Noted'}</h3>
                    <p className="text-sm" style={{ color: getOpacityStyle('text', 0.6) }}>{s.rsvpStatus === 'accept' ? `We look forward to seeing you, ${s.rsvpName}!` : `Thank you for letting us know, ${s.rsvpName}.`}</p>
                  </m.div>
                )}
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ─── WISHES ─── */}
        <RevealSection><section className="py-16 md:py-20 px-6"><div className="flex flex-col items-center gap-8 max-w-md mx-auto"><h2 className="text-3xl sm:text-4xl text-center font-[var(--font-cinzel-dec)] uppercase tracking-wider" style={{ color: theme.accent }}>{s.t('blessingsWishes', 'Blessings')}</h2><GoldLineDivider accent={theme.accent} /><div className="w-full space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">{s.wishes.length === 0 ? <div className="text-center py-8 text-sm border border-dashed" style={{ backgroundColor: getOpacityStyle('bg', 0.02), borderColor: getOpacityStyle('border', 0.15), color: getOpacityStyle('text', 0.5) }}>{s.language === 'ur' ? 'ابھی تک کوئی دعا نہیں' : 'No messages yet.'}</div> : s.wishes.map((wish, idx) => { const dn = s.language === 'ur' && wish.translatedName ? wish.translatedName : wish.name; const dm = s.language === 'ur' && wish.translatedMessage ? wish.translatedMessage : wish.message; return (<m.div key={`${wish.name}-${idx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}><div className="border p-4" style={{ backgroundColor: getOpacityStyle('bg', 0.05), borderColor: getOpacityStyle('border', 0.15), borderLeft: `3px solid ${theme.accent}` }}><p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: getOpacityStyle('text', 0.7) }}>{dn}</p><p className="text-sm leading-relaxed" style={{ color: getOpacityStyle('text', 0.8) }}>{dm}</p></div></m.div>) })}</div><div className="w-full space-y-3"><div className="flex items-center gap-2"><div className="w-8 h-8 border flex items-center justify-center flex-shrink-0" style={{ backgroundColor: getOpacityStyle('bg', 0.1), borderColor: theme.borderSubtle }}><User className="w-3.5 h-3.5" style={{ color: getOpacityStyle('text', 0.5) }} /></div><Input value={s.wishName} onChange={e => s.setWishName(e.target.value)} placeholder={s.t('yourNameSender', 'Your name')} className="border h-10 flex-1 font-mono" style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle, color: theme.textPrimary }} /></div><div className="flex gap-2"><Textarea value={s.wishMessage} onChange={e => s.setWishMessage(e.target.value)} placeholder={s.t('writeBlessing', 'Write your message...')} className="border resize-none flex-1" style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle, color: theme.textPrimary }} rows={2} /><Button onClick={s.handleSendWish} className="border h-auto px-4 flex-shrink-0 self-end" style={{ backgroundColor: getOpacityStyle('bg', 0.2), borderColor: theme.borderSubtle, color: theme.accent, borderRadius: 0 }}><Send className="w-4 h-4" /></Button></div></div></div></section></RevealSection>

        {/* ─── FOOTER ─── */}
        <div className="py-10 text-center border-t" style={{ borderColor: getOpacityStyle('border', 0.1) }}>
          <div className="flex items-center justify-center gap-3 mb-3"><div className="w-8 h-px" style={{ backgroundColor: theme.accent + '40' }} /><div className="w-2 h-2 rotate-45" style={{ backgroundColor: theme.accent + '60' }} /><div className="w-8 h-px" style={{ backgroundColor: theme.accent + '40' }} /></div>
          <p className="text-xs tracking-widest font-mono uppercase" style={{ color: getOpacityStyle('text', 0.3) }}>{s.t('madeWithLove', 'Made with love by ShaadiLink')}</p>
        </div>
      </m.div>
    </div>
  )
}
