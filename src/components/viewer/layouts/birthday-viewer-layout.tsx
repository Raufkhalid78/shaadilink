'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import {
  Cake, Calendar, Clock, MapPin, Sparkles, Heart, Gift, Music,
  Check, X, Send, User, PartyPopper, Car, Hotel, Copy, ExternalLink, Disc, Ticket
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import type { FlowData } from '@/lib/flow-types'
import { TemplateTheme } from '../themes'
import { useInvitationState } from '../use-invitation-state'
import { CountdownTimer, AddToCalendarDropdown } from '../features/countdown-timer'
import { MusicToggle } from '../ui/music-toggle'
import { VoiceGreetingPlayer } from '../features/voice-greeting-player'
import { CrowdPhotoWallSection } from '../features/crowd-photo-wall-section'
import { DigitalGuestPassModal } from '../digital-guest-pass-modal'

const DoorOverlay = dynamic(() => import('../door/door-overlay').then(m => m.DoorOverlay), { ssr: false })
const FireworksDisplay = dynamic(() => import('../effects/fireworks').then(m => m.FireworksDisplay), { ssr: false })
const ConfettiDisplay = dynamic(() => import('../effects/confetti').then(m => m.ConfettiDisplay), { ssr: false })
const BackgroundParticles = dynamic(() => import('../effects/particles').then(m => m.BackgroundParticles), { ssr: false })

export interface LayoutViewerProps {
  templateId?: string
  flowData?: FlowData
  guestName?: string | null
  guestSlug?: string | null
  customTheme?: TemplateTheme
  isReviewMode?: boolean
}

export function BirthdayViewerLayout({ templateId, flowData: propFlowData, guestName, guestSlug, customTheme, isReviewMode }: LayoutViewerProps) {
  const s = useInvitationState(templateId, propFlowData, guestName, guestSlug)
  const theme = customTheme || s.theme
  const flowData = s.flowData

  const [songRequest, setSongRequest] = useState('')
  const [attendingCount, setAttendingCount] = useState('1')
  const [partyRsvpDone, setPartyRsvpDone] = useState(false)
  const [isPassModalOpen, setIsPassModalOpen] = useState(false)
  const [partyThemeRevealed, setPartyThemeRevealed] = useState(false)

  const [wishName, setWishName] = useState('')
  const [wishText, setWishText] = useState('')
  const [wishesList, setWishesList] = useState<Array<{ name: string; message: string }>>(() => {
    if (s.isDemo) {
      return [
        { name: 'Hamza Tariq', message: 'Happy Birthday bro! Can’t wait for the dance floor tonight!' },
        { name: 'Ayesha Khan', message: 'Wishing you another year of big adventures, laughter, and blessings! 🎉' },
        { name: 'Dr. Salman & Family', message: 'Happy milestone birthday! May all your dreams come true ✨' }
      ]
    }
    return []
  })

  // Sync with DB loaded wishes if present
  useEffect(() => {
    if (s.wishes && s.wishes.length > 0) {
      setWishesList(s.wishes.map(w => ({ name: w.name, message: w.message })))
    }
  }, [s.wishes])

  // Only keep party pass confirmed if a valid guest name was actually entered and RSVP accepted
  useEffect(() => {
    if (s.rsvpSubmitted && s.rsvpStatus === 'accept' && s.rsvpName?.trim()) {
      setPartyRsvpDone(true)
    } else if (!s.rsvpName?.trim()) {
      setPartyRsvpDone(false)
    }
  }, [s.rsvpSubmitted, s.rsvpStatus, s.rsvpName])

  // Birthday Celebrant & Title
  const celebrantName = flowData?.partner1Name?.trim() || (s.isDemo ? 'Zara Khan' : 'Birthday Star')
  const milestoneTitle = flowData?.partner2Name?.trim() || (s.isDemo ? 'TURNS 21 !' : 'BIRTHDAY CELEBRATION')
  const venueName = flowData?.venue?.trim() || (s.isDemo ? 'The Neon Sky Lounge' : 'Celebration Venue')
  const [venueAddress, mapsUrl] = (flowData?.venueAddress || (s.isDemo ? 'Main Boulevard, Gulberg III, Lahore|||https://maps.google.com' : '')).split('|||')

  // Party Schedule
  const partySchedule = useMemo(() => {
    if (flowData?.events && flowData.events.some(e => e.name && (e.date || e.time))) {
      return flowData.events.filter(e => e.name).map((e, idx) => ({
        id: e.id || `event-${idx}`,
        time: e.time || '07:30 PM',
        date: e.date || 'March 25, 2027',
        name: e.name,
        desc: e.venue ? `At ${e.venue}` : 'Party celebration moment.'
      }))
    }
    return [
      { id: '1', time: '07:00 PM', date: 'March 25, 2027', name: 'Red Carpet & Glowing Mocktails', desc: 'Arrive in style, grab a glowing signature mocktail, and hit the photo booth.' },
      { id: '2', time: '08:30 PM', date: 'March 25, 2027', name: 'Grand Cake Cutting & Fireworks', desc: 'The big celebration moment under a shower of confetti and fireworks.' },
      { id: '3', time: '09:00 PM', date: 'March 25, 2027', name: 'Celebration Dinner Feast', desc: 'A lavish gourmet buffet and live culinary stations.' },
      { id: '4', time: '10:00 PM', date: 'March 25, 2027', name: 'DJ Party & Dancefloor Open', desc: 'Dance until midnight with the hottest tracks and live DJ set.' },
    ]
  }, [flowData?.events])

  const firstEvent = partySchedule[0]

  const handleSendWish = async () => {
    if (!wishName.trim() || !wishText.trim()) {
      toast.error('Please enter your name and birthday wish.')
      return
    }
    const newWish = { name: wishName.trim(), message: wishText.trim() }
    setWishesList(prev => [newWish, ...prev])
    setWishName('')
    setWishText('')
    if (flowData?.invitationId) {
      try {
        await fetch(`/api/invitations/${flowData.invitationId}/wishes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderName: newWish.name, message: newWish.message })
        })
      } catch (err) {
        console.error('Failed to save birthday wish', err)
      }
    }
    toast.success('Birthday wish posted!')
  }

  const handlePartyRsvp = async (status: 'accept' | 'decline') => {
    if (!s.rsvpName?.trim()) {
      toast.error('Please enter your full name before confirming RSVP.')
      return
    }
    const success = await s.handleRSVP(status)
    if (success && status === 'accept') {
      setPartyRsvpDone(true)
      toast.success('RSVP confirmed! See you at the party!')
    }
  }

  return (
    <div
      className="relative min-h-screen font-sans selection:bg-fuchsia-500/20"
      style={{ backgroundColor: theme.bgPrimary, color: theme.textPrimary }}
    >
      <ConfettiDisplay show={s.doorsOpened} />
      <FireworksDisplay show={s.doorsOpened} />
      <BackgroundParticles accentColor={theme.accent} />

      {/* Door Reveal */}
      {s.doorOverlayVisible && !theme.openingVideoUrl && (
        <div
          className="fixed inset-0 z-50 pointer-events-none"
          style={{ perspective: ['classic-doors', 'archway', 'lantern', 'dome'].includes(theme.doorStyle.type) ? '1200px' : undefined }}
        >
          <DoorOverlay
            doorsOpened={s.doorsOpened}
            theme={theme}
            onOpen={s.handleDoorOpen}
          />
        </div>
      )}

      {/* Floating Audio Controls */}
      <div className={`fixed ${isReviewMode ? 'top-[calc(max(1rem,env(safe-area-inset-top))+6.25rem)] sm:top-[calc(max(1rem,env(safe-area-inset-top))+3.5rem)]' : 'top-[max(1rem,env(safe-area-inset-top))]'} right-[max(1rem,env(safe-area-inset-right))] z-[200] viewer-floating-controls transition-all duration-300`}>
        <MusicToggle
          isPlaying={s.musicPlaying}
          onToggle={() => s.setMusicPlaying(!s.musicPlaying)}
          theme={theme}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-md bg-background/50 sticky top-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center border font-bold"
              style={{ borderColor: `${theme.accent}40`, color: theme.accent, backgroundColor: `${theme.accent}15` }}
            >
              <Cake className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold tracking-widest uppercase" style={{ color: theme.accent }}>
                {celebrantName}&apos;s Celebration
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                VIP Birthday Party
              </p>
            </div>
          </div>

          <span
            className="px-3 py-1 rounded-full text-xs font-extrabold border"
            style={{ borderColor: `${theme.accent}30`, color: theme.accent, backgroundColor: `${theme.accent}10` }}
          >
            🎉 {milestoneTitle}
          </span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-20 space-y-16">
        
        {/* HERO */}
        <section className="text-center space-y-6 pt-6">
          <m.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-extrabold tracking-widest uppercase"
            style={{ borderColor: `${theme.accent}40`, color: theme.accent, backgroundColor: `${theme.accent}10` }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Milestone Celebration
          </m.div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-wider uppercase opacity-90">
              {celebrantName}
            </h2>
            <h1
              className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight"
              style={{ color: theme.accent }}
            >
              {milestoneTitle}
            </h1>
          </div>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {flowData?.welcomeMessage || 'We are so excited to invite you to celebrate this special milestone! Get ready for a night of incredible beats, great food, and unforgettable memories.'}
          </p>

          {/* Personal Voice Greeting */}
          {flowData?.voiceNoteUrl && (
            <VoiceGreetingPlayer
              voiceNoteUrl={flowData.voiceNoteUrl}
              voiceNoteTitle={flowData.voiceNoteTitle || 'Birthday Audio Greeting'}
              voiceNoteSender={flowData.voiceNoteSender || `From ${celebrantName}`}
              onPlayStart={() => {
                if (s.setMusicPlaying) {
                  s.setMusicPlaying(false)
                }
              }}
            />
          )}

          {/* Date, Venue Card */}
          <div className="p-4 sm:p-5 rounded-3xl border border-white/10 bg-card/60 backdrop-blur-xl max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border"
                style={{ borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}15`, color: theme.accent }}
              >
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{firstEvent?.date || 'March 25, 2027'}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {firstEvent?.time || '07:00 PM'} • {venueName}
                </p>
              </div>
            </div>

            <AddToCalendarDropdown
              event={{
                name: `${celebrantName}'s ${milestoneTitle}`,
                description: `Birthday celebration for ${celebrantName}.`,
                venue: venueAddress || venueName,
                date: firstEvent?.date || '2027-03-25',
                time: firstEvent?.time || '07:00 PM'
              }}
              partner1={celebrantName}
              partner2=""
              theme={theme}
              label="Add to Calendar"
              location={venueAddress || venueName}
            />
          </div>

          {/* Countdown */}
          <div className="pt-2">
            <p className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-3">
              Party Starts In
            </p>
            <CountdownTimer
              theme={theme}
              targetDate={firstEvent?.date || '2027-03-25'}
              targetTime={firstEvent?.time || '07:00 PM'}
            />
          </div>
        </section>

        {/* SECRET PARTY THEME REVEAL */}
        <section className="text-center space-y-4">
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: theme.accent }}>
            Secret Party Theme
          </p>
          <div className="max-w-sm mx-auto">
            <div
              onClick={() => setPartyThemeRevealed(true)}
              className="cursor-pointer relative overflow-hidden rounded-3xl border p-6 text-center transition-all duration-300 group hover:scale-[1.02]"
              style={{
                borderColor: `${theme.accent}35`,
                backgroundColor: `${theme.accent}0a`,
                boxShadow: `0 8px 30px ${theme.accent}15`
              }}
            >
              {!partyThemeRevealed ? (
                <div className="space-y-2 py-4">
                  <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center animate-bounce" style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}>
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-extrabold tracking-wide uppercase" style={{ color: theme.accent }}>
                    Tap to Reveal Secret Party Theme ✨
                  </p>
                  <p className="text-xs text-muted-foreground">Click to uncover dress code &amp; party vibe</p>
                </div>
              ) : (
                <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-2 py-2">
                  <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Dress Code &amp; Party Vibe</p>
                  <p className="text-xl font-black" style={{ color: theme.accent }}>
                    {flowData?.dressCodeWomen || 'Neon Glow / Festive Evening Cocktail'}
                  </p>
                  <p className="text-xs text-muted-foreground">Dress to impress — UV blacklights &amp; glow sticks provided!</p>
                </m.div>
              )}
            </div>
          </div>
        </section>

        {/* PARTY ITINERARY */}
        <section className="space-y-6">
          <div className="border-b border-white/10 pb-4 text-center sm:text-left">
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: theme.accent }}>
              Party Itinerary
            </p>
            <h2 className="text-2xl font-bold tracking-tight">The Night&apos;s Highlights</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {partySchedule.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-5 rounded-2xl border border-white/10 bg-card/40 backdrop-blur-md space-y-2 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold border"
                    style={{ borderColor: `${theme.accent}30`, color: theme.accent, backgroundColor: `${theme.accent}10` }}
                  >
                    {item.time}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold">Phase {idx + 1}</span>
                </div>
                <h3 className="text-base font-bold text-foreground">{item.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* VENUE & DRESS CODE */}
        <section className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl space-y-6">
          <div className="border-b border-white/10 pb-4">
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: theme.accent }}>
              Party Guide
            </p>
            <h2 className="text-2xl font-bold tracking-tight">Location &amp; Party Attire</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-4 h-4" style={{ color: theme.accent }} /> Venue Location
              </p>
              <p className="font-bold text-sm text-foreground">{venueName}</p>
              <p className="text-xs text-muted-foreground">{venueAddress}</p>
              {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs underline mt-1" style={{ color: theme.accent }}>
                  Get Driving Directions <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" style={{ color: theme.accent }} /> Party Dress Code
              </p>
              <p className="font-bold text-sm text-foreground">Dress to Impress</p>
              <p className="text-xs text-muted-foreground">
                {flowData?.dressCodeWomen || 'Neon, glow in the dark, or glamorous party formals.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Car className="w-4 h-4" style={{ color: theme.accent }} /> Parking &amp; Valet
              </p>
              <p className="font-bold text-sm text-foreground">Valet Available</p>
              <p className="text-xs text-muted-foreground">
                {flowData?.transportation || 'Complimentary valet parking available right at the club entrance.'}
              </p>
            </div>
          </div>
        </section>

        {/* LIVE CROWD PHOTO WALL */}
        {flowData?.invitationId && flowData?.showCrowdPhotoWall !== false && (
          <section className="space-y-6">
            <CrowdPhotoWallSection
              invitationId={flowData.invitationId}
              slug={flowData.slug}
              guestName={guestName || celebrantName}
              guestSeats={flowData.guestSeats}
              accentColor={theme.accent}
            />
          </section>
        )}

        {/* BIRTHDAY GIFT REGISTRY */}
        {flowData?.gifts && !flowData?.hideDigitalShagun && (
          <section className="space-y-6 max-w-xl mx-auto">
            <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl text-center space-y-4">
              <div
                className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center border"
                style={{ borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}15`, color: theme.accent }}
              >
                <Gift className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">Birthday Gift &amp; Registry Details</h2>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                {flowData.gifts}
              </p>
            </div>
          </section>
        )}

        {/* BIRTHDAY WISHES WALL */}
        <section className="space-y-6">
          <div className="border-b border-white/10 pb-4 text-center sm:text-left">
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: theme.accent }}>
              Celebration Guestbook
            </p>
            <h2 className="text-2xl font-bold tracking-tight">Birthday Wishes &amp; Greetings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {wishesList.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-white/15 text-center text-xs text-muted-foreground">
                  No birthday wishes posted yet. Be the first to leave a greeting!
                </div>
              ) : (
                wishesList.map((w, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-white/10 bg-card/30 space-y-1">
                    <p className="font-bold text-xs" style={{ color: theme.accent }}>{w.name}</p>
                    <p className="text-xs text-foreground/90 leading-relaxed">&ldquo;{w.message}&rdquo;</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-5 rounded-2xl border border-white/10 bg-card/40 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider">Leave a Birthday Wish</p>
              <Input
                value={wishName}
                onChange={(e) => setWishName(e.target.value)}
                placeholder="Your Name (e.g. Ayesha / Cousin Ali)"
                className="h-10 bg-background/80 text-xs"
              />
              <Textarea
                value={wishText}
                onChange={(e) => setWishText(e.target.value)}
                placeholder="Write your birthday wish or funny memory..."
                className="min-h-[70px] bg-background/80 text-xs resize-none"
              />
              <Button
                onClick={handleSendWish}
                className="w-full font-bold text-xs"
                style={{ backgroundColor: theme.accent, color: theme.bgPrimary }}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" /> Send Birthday Wish ✨
              </Button>
            </div>
          </div>
        </section>

        {/* PARTY RSVP WITH SONG REQUEST */}
        <section id="rsvp-section" className="scroll-mt-20">
          <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-2xl max-w-xl mx-auto space-y-6 text-center">
            <div className="space-y-2">
              <span
                className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border"
                style={{ borderColor: `${theme.accent}30`, color: theme.accent, backgroundColor: `${theme.accent}10` }}
              >
                Party Pass Confirmation
              </span>
              <h2 className="text-2xl font-bold">Are You Celebrating With Us?</h2>
              <p className="text-xs text-muted-foreground">
                Let us know you&apos;re coming so we can reserve your welcome mocktail and party favors!
              </p>
            </div>

            {partyRsvpDone ? (
              <div
                className="p-6 rounded-2xl border text-center space-y-3"
                style={{ borderColor: `${theme.accent}40`, backgroundColor: `${theme.accent}10` }}
              >
                <Check className="w-10 h-10 mx-auto" style={{ color: theme.accent }} />
                <h3 className="font-bold text-lg">You&apos;re on the Guest List! 🎉</h3>
                <p className="text-xs text-muted-foreground">
                  Reserved for <span className="font-bold text-foreground">{s.rsvpName.trim()}</span>. Can&apos;t wait to celebrate!
                </p>
                {songRequest && (
                  <p className="text-xs font-mono pt-2 border-t border-white/10 text-muted-foreground">
                    🎵 DJ Request Logged: &ldquo;{songRequest}&rdquo;
                  </p>
                )}
                <div className="space-y-2 pt-2">
                  <Button
                    onClick={() => setIsPassModalOpen(true)}
                    size="sm"
                    className="w-full h-10 font-bold text-xs gap-1.5 shadow-md"
                    style={{ backgroundColor: theme.accent, color: '#fff' }}
                  >
                    <Ticket className="w-3.5 h-3.5" /> View VIP Guest Pass
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setPartyRsvpDone(false)
                      s.setRsvpSubmitted(false)
                    }}
                    className="text-[11px] underline text-muted-foreground hover:text-foreground transition-colors cursor-pointer block mx-auto pt-1"
                  >
                    Edit RSVP or Change Name
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Your Full Name
                  </label>
                  <Input
                    value={s.rsvpName}
                    onChange={(e) => s.setRsvpName(e.target.value)}
                    placeholder="e.g. Zainab Malik"
                    className="h-11 bg-background/80"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Number of Guests Attending
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={attendingCount}
                      onChange={(e) => setAttendingCount(e.target.value)}
                      className="h-11 bg-background/80"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Disc className="w-3.5 h-3.5" style={{ color: theme.accent }} /> DJ Song Request (Optional)
                    </label>
                    <Input
                      value={songRequest}
                      onChange={(e) => setSongRequest(e.target.value)}
                      placeholder="e.g. Dua Lipa - Levitating"
                      className="h-11 bg-background/80"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => handlePartyRsvp('accept')}
                    className="flex-1 font-bold h-11 text-xs uppercase tracking-wider shadow-lg"
                    style={{ backgroundColor: theme.accent, color: theme.bgPrimary }}
                  >
                    <PartyPopper className="w-4 h-4 mr-1.5" /> I&apos;ll Be There! 🎉
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePartyRsvp('decline')}
                    className="flex-1 text-xs border-white/20 h-11"
                  >
                    <X className="w-4 h-4 mr-1.5" /> Can&apos;t Make It 😢
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-muted-foreground">
        <p>© 2027 {celebrantName}&apos;s Birthday Celebration.</p>
        <p className="mt-2 text-[11px] opacity-75">
          Made with love by{' '}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity"
            style={{ color: theme.accent }}
          >
            Smart Invites
          </a>
        </p>
      </footer>

      <DigitalGuestPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        guestName={s.translatedGuestName || s.rsvpName || 'VIP Guest'}
        guestSlug={guestSlug || undefined}
        seats={Number(attendingCount) || (flowData?.guestSeats ?? 1)}
        allowedEvents={flowData?.guestAllowedEvents || undefined}
        invitationTitle={`${flowData?.partner1Name || ''} & ${flowData?.partner2Name || ''}`}
        invitationUrl={typeof window !== 'undefined' ? window.location.href.split('?')[0] : ''}
        eventDate={flowData?.events?.[0]?.date}
        venue={flowData?.venue}
        category={flowData?.category || 'birthday'}
      />
    </div>
  )
}
