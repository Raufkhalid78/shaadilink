'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, MapPin, Building2, User, Users, Check, X,
  ExternalLink, Share2, Briefcase, Award, ShieldCheck, Download,
  ChevronRight, Car, Hotel, Compass, Globe, Ticket
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
const BackgroundParticles = dynamic(() => import('../effects/particles').then(m => m.BackgroundParticles), { ssr: false })

export interface LayoutViewerProps {
  templateId?: string
  flowData?: FlowData
  guestName?: string | null
  guestSlug?: string | null
  customTheme?: TemplateTheme
  isReviewMode?: boolean
}

export function CorporateViewerLayout({ templateId, flowData: propFlowData, guestName, guestSlug, customTheme, isReviewMode }: LayoutViewerProps) {
  const s = useInvitationState(templateId, propFlowData, guestName, guestSlug)
  const theme = customTheme || s.theme
  const flowData = s.flowData

  const [dietary, setDietary] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [delegateRegistered, setDelegateRegistered] = useState(false)
  const [isPassModalOpen, setIsPassModalOpen] = useState(false)

  // Only keep delegate pass confirmed if a valid name was actually entered and RSVP accepted
  useEffect(() => {
    if (s.rsvpSubmitted && s.rsvpStatus === 'accept' && s.rsvpName?.trim()) {
      setDelegateRegistered(true)
    } else if (!s.rsvpName?.trim()) {
      setDelegateRegistered(false)
    }
  }, [s.rsvpSubmitted, s.rsvpStatus, s.rsvpName])

  // Corporate Titles & Company
  const orgName = flowData?.partner1Name?.trim() || (s.isDemo ? 'Apex Global Enterprises' : 'Organization Name')
  const summitTitle = flowData?.partner2Name?.trim() || (s.isDemo ? 'Global Tech Leadership Keynote 2027' : 'Executive Summit')
  const venueName = flowData?.venue?.trim() || (s.isDemo ? 'The Grand Financial Center' : 'Convention Hall')
  const [venueAddress, mapsUrl] = (flowData?.venueAddress || (s.isDemo ? 'Level 42, Executive Tower, Financial District|||https://maps.google.com' : '')).split('|||')

  // Corporate Speakers (Authentic demo data)
  const keynoteSpeakers = useMemo(() => [
    { name: 'Dr. Tariq Mansoor', title: 'Chief Technology Officer', org: 'QuantumAI Labs', topic: 'The Next Compute Paradigm', avatar: 'TM' },
    { name: 'Elena Rostova', title: 'Managing Partner', org: 'Vanguard Ventures', topic: 'Global Allocations & Macro Shifts', avatar: 'ER' },
    { name: 'Kashif Mehmood', title: 'VP of Product Engineering', org: 'Apex Systems', topic: 'Autonomous Enterprise Infrastructure', avatar: 'KM' },
    { name: 'Sophia Chen', title: 'Head of Policy & Compliance', org: 'NextGen Institute', topic: 'Regulatory Frontiers in AI', avatar: 'SC' }
  ], [])

  // Agenda Tracks
  const agendaEvents = useMemo(() => {
    if (flowData?.events && flowData.events.some(e => e.name && (e.date || e.time))) {
      return flowData.events.filter(e => e.name).map((e, idx) => ({
        id: e.id || `event-${idx}`,
        time: e.time || '09:00 AM',
        date: e.date || 'November 15, 2027',
        title: e.name,
        track: idx % 2 === 0 ? 'Plenary Track' : 'Executive Breakout',
        location: e.venue || venueName
      }))
    }
    return [
      { id: '1', time: '08:30 AM', date: 'November 15, 2027', title: 'Delegate Registration & Morning Coffee', track: 'Networking', location: 'Atrium Foyer' },
      { id: '2', time: '09:30 AM', date: 'November 15, 2027', title: 'Opening Remarks & Keynote Address', track: 'Plenary Track', location: 'Grand Auditorium' },
      { id: '3', time: '11:15 AM', date: 'November 15, 2027', title: 'Panel: Next-Decade Infrastructure & Capital', track: 'Executive Panel', location: 'Hall A' },
      { id: '4', time: '01:00 PM', date: 'November 15, 2027', title: 'Curated Networking Luncheon', track: 'Private Dining', location: 'Skyline Terrace' },
      { id: '5', time: '02:30 PM', date: 'November 15, 2027', title: 'Closed-Door Founder & Allocator Sessions', track: 'Breakouts', location: 'Boardroom Suite' },
      { id: '6', time: '05:00 PM', date: 'November 15, 2027', title: 'Closing Keynote & Cocktail Reception', track: 'Evening Mixer', location: 'Penthouse Lounge' },
    ]
  }, [flowData?.events, venueName])

  const firstEvent = agendaEvents[0]

  const handleRegisterDelegate = async (status: 'accept' | 'decline') => {
    if (!s.rsvpName?.trim()) {
      toast.error('Please enter your delegate full name before registering.')
      return
    }
    const success = await s.handleRSVP(status)
    if (success && status === 'accept') {
      setDelegateRegistered(true)
      toast.success('Executive pass confirmed. See you at the summit!')
    }
  }

  return (
    <div
      className="relative min-h-screen font-sans selection:bg-primary/30"
      style={{ backgroundColor: theme.bgPrimary, color: theme.textPrimary }}
    >
      {/* Background Ambience */}
      <BackgroundParticles accentColor={theme.accent} />
      <div
        className="fixed inset-0 pointer-events-none opacity-40 z-0"
        style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${theme.accent}15 0%, transparent 80%)` }}
      />

      {/* Modern Portal / Door Reveal */}
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

      {/* Executive Header Navigation Bar */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-md sticky top-0 bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border font-bold text-sm"
              style={{ borderColor: `${theme.accent}40`, color: theme.accent, backgroundColor: `${theme.accent}15` }}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider uppercase" style={{ color: theme.accent }}>
                {orgName}
              </p>
              <p className="text-[11px] text-muted-foreground">Official Executive Invitation</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border border-white/10 bg-white/5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Verified Delegate Portal
            </span>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-20 space-y-16">
        <section className="text-center space-y-6 pt-6">
          <m.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold tracking-wider uppercase"
            style={{ borderColor: `${theme.accent}40`, color: theme.accent, backgroundColor: `${theme.accent}10` }}
          >
            <Award className="w-3.5 h-3.5" />
            Executive Leadership Forum
          </m.div>

          <m.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto"
          >
            {summitTitle}
          </m.h1>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            {flowData?.welcomeMessage || 'Gathering visionaries, founders, and industry leaders to evaluate market frontiers, breakthrough architecture, and next-generation capital allocation.'}
          </m.p>

          {/* Keynote Audio Introduction */}
          {flowData?.voiceNoteUrl && (
            <VoiceGreetingPlayer
              voiceNoteUrl={flowData.voiceNoteUrl}
              voiceNoteTitle={flowData.voiceNoteTitle || "Executive Audio Address"}
              voiceNoteSender={flowData.voiceNoteSender || "From Summit Leadership"}
              onPlayStart={() => {
                if (s.setMusicPlaying) {
                  s.setMusicPlaying(false)
                }
              }}
            />
          )}

          {/* Date, Location & Calendar Bar */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 sm:p-5 rounded-3xl border border-white/10 bg-card/60 backdrop-blur-xl max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 text-left">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border"
                style={{ borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}15`, color: theme.accent }}
              >
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold">{firstEvent?.date || 'November 15, 2027'}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {firstEvent?.time || '08:30 AM'} • {venueName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <AddToCalendarDropdown
                event={{
                  name: `${orgName}: ${summitTitle}`,
                  description: `Executive invitation to ${summitTitle} hosted by ${orgName}.`,
                  venue: venueAddress || venueName,
                  date: firstEvent?.date || '2027-11-15',
                  time: firstEvent?.time || '09:00 AM'
                }}
                partner1={orgName}
                partner2=""
                theme={theme}
                label="Add to Calendar"
                location={venueAddress || venueName}
              />
            </div>
          </m.div>

          {/* Live Countdown */}
          <div className="pt-2">
            <p className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-3">
              Summit Commences In
            </p>
            <CountdownTimer
              theme={theme}
              targetDate={firstEvent?.date || '2027-11-15'}
              targetTime={firstEvent?.time || '09:00 AM'}
            />
          </div>
        </section>

        {/* KEYNOTE SPEAKERS GRID */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color: theme.accent }}>
                Distinguished Faculty
              </p>
              <h2 className="text-2xl font-bold tracking-tight">Keynote Speakers &amp; Leaders</h2>
            </div>
            <p className="text-xs text-muted-foreground">Leading transformative discussions across industry &amp; policy</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {keynoteSpeakers.map((speaker, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl border border-white/10 bg-card/40 backdrop-blur-md hover:border-white/20 transition-all space-y-3"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-sm border"
                  style={{ backgroundColor: `${theme.accent}15`, borderColor: `${theme.accent}30`, color: theme.accent }}
                >
                  {speaker.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{speaker.name}</h3>
                  <p className="text-xs text-muted-foreground">{speaker.title}</p>
                  <p className="text-[11px] font-medium" style={{ color: theme.accent }}>{speaker.org}</p>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Focus Topic</p>
                  <p className="text-xs font-medium text-foreground/80 truncate">{speaker.topic}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AGENDA & ITINERARY */}
        <section className="space-y-6">
          <div className="border-b border-white/10 pb-4">
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: theme.accent }}>
              Program Itinerary
            </p>
            <h2 className="text-2xl font-bold tracking-tight">Conference Schedule &amp; Tracks</h2>
          </div>

          <div className="space-y-3">
            {agendaEvents.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-card/40 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="px-3 py-1.5 rounded-xl border text-xs font-mono font-bold shrink-0 text-center"
                    style={{ backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}30`, color: theme.accent }}
                  >
                    {item.time}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-white/80">
                        {item.track}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {item.location}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    Session {idx + 1} <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* VENUE & LOGISTICS */}
        <section className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl space-y-6">
          <div className="border-b border-white/10 pb-4">
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: theme.accent }}>
              Logistics &amp; Protocol
            </p>
            <h2 className="text-2xl font-bold tracking-tight">Venue &amp; Executive Accommodations</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <MapPin className="w-4 h-4" style={{ color: theme.accent }} /> Location
              </div>
              <p className="font-bold text-sm text-foreground">{venueName}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{venueAddress}</p>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold underline mt-1 hover:text-primary"
                  style={{ color: theme.accent }}
                >
                  Open in Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Car className="w-4 h-4" style={{ color: theme.accent }} /> Parking &amp; Valet
              </div>
              <p className="font-bold text-sm text-foreground">Executive Drop-Off</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {flowData?.transportation || 'Complimentary VIP valet parking available at the main entrance porte-cochère.'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Hotel className="w-4 h-4" style={{ color: theme.accent }} /> Accommodations
              </div>
              <p className="font-bold text-sm text-foreground">Corporate Room Block</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {flowData?.accommodation || 'Preferential executive suites available for delegates. Quote the summit registration code.'}
              </p>
            </div>
          </div>
        </section>

        {/* EXECUTIVE PARTNERS STRIP */}
        <section className="text-center space-y-4 pt-4">
          <p className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
            Convened In Partnership With
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 opacity-60">
            {['GLOBAL VENTURES', 'APEX ALLIANCE', 'TECH RESEARCH FORUM', 'INSTITUTIONAL CAPITAL', 'FUTURE LABS'].map((partner, i) => (
              <span key={i} className="text-xs sm:text-sm font-extrabold tracking-wider font-mono">
                {partner}
              </span>
            ))}
          </div>
        </section>

        {/* LIVE CROWD / SUMMIT PHOTO WALL */}
        {flowData?.invitationId && flowData?.showCrowdPhotoWall !== false && (
          <section className="space-y-6">
            <CrowdPhotoWallSection
              invitationId={flowData.invitationId}
              slug={flowData.slug}
              guestName={guestName || summitTitle}
              guestSeats={flowData.guestSeats}
              accentColor={theme.accent}
            />
          </section>
        )}

        {/* ORGANIZATION / HONORARIUM DETAILS */}
        {flowData?.gifts && !flowData?.hideDigitalShagun && (
          <section className="space-y-6 max-w-xl mx-auto">
            <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl text-center space-y-4">
              <div
                className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center border"
                style={{ borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}15`, color: theme.accent }}
              >
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold font-serif">Organization / Honorarium Details</h2>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line font-mono">
                {flowData.gifts}
              </p>
            </div>
          </section>
        )}

        {/* DELEGATE REGISTRATION PASS (RSVP) */}
        <section id="rsvp-section" className="scroll-mt-20">
          <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-2xl max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span
                className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border"
                style={{ borderColor: `${theme.accent}30`, color: theme.accent, backgroundColor: `${theme.accent}10` }}
              >
                Delegate Confirmation
              </span>
              <h2 className="text-2xl font-bold">Confirm Executive Attendance</h2>
              <p className="text-xs text-muted-foreground">
                Please reserve your credentialed delegate pass for security and registration badges.
              </p>
            </div>

            {delegateRegistered ? (
              <m.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl border text-center space-y-4"
                style={{ borderColor: `${theme.accent}50`, backgroundColor: `${theme.accent}10` }}
              >
                <div
                  className="w-14 h-14 rounded-full mx-auto flex items-center justify-center border font-bold"
                  style={{ borderColor: theme.accent, backgroundColor: theme.accent, color: theme.bgPrimary }}
                >
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Executive Pass Confirmed</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your credential badge has been reserved under <span className="font-bold text-foreground">{s.rsvpName.trim()}</span>.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px] text-left space-y-1">
                  <p><span className="text-muted-foreground">PASS ID:</span> EX-{Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
                  <p><span className="text-muted-foreground">ACCESS:</span> Full Plenary &amp; Executive Dining</p>
                  <p><span className="text-muted-foreground">VENUE:</span> {venueName}</p>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => setIsPassModalOpen(true)}
                    size="sm"
                    className="w-full h-10 bg-primary hover:bg-primary-light text-background font-bold text-xs gap-1.5 shadow-md"
                  >
                    <Ticket className="w-3.5 h-3.5" /> View Scannable Delegate Pass
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setDelegateRegistered(false)
                      s.setRsvpSubmitted(false)
                    }}
                    className="text-[11px] underline text-muted-foreground hover:text-foreground transition-colors cursor-pointer block mx-auto pt-1"
                  >
                    Edit Registration or Change Name
                  </button>
                </div>
              </m.div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Delegate Full Name
                  </label>
                  <Input
                    value={s.rsvpName}
                    onChange={(e) => s.setRsvpName(e.target.value)}
                    placeholder="e.g. Dr. Zeeshan Ali"
                    className="h-11 bg-background/80"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Organization / Firm
                    </label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acumen Capital"
                      className="h-11 bg-background/80"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Job Title / Role
                    </label>
                    <Input
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Chief Risk Officer"
                      className="h-11 bg-background/80"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Dietary Requirements (Optional)
                  </label>
                  <Input
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    placeholder="e.g. Halal, Vegetarian, Gluten-Free"
                    className="h-11 bg-background/80"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => handleRegisterDelegate('accept')}
                    className="flex-1 font-bold h-11 text-xs uppercase tracking-wider shadow-lg"
                    style={{ backgroundColor: theme.accent, color: theme.bgPrimary }}
                  >
                    <Check className="w-4 h-4 mr-1.5" /> Confirm Attendance
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRegisterDelegate('decline')}
                    className="flex-1 text-xs border-white/20 h-11"
                  >
                    <X className="w-4 h-4 mr-1.5" /> Decline with Regrets
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-muted-foreground">
        <p>© 2027 {orgName}. All rights reserved.</p>
        <p className="mt-2 text-[11px] opacity-75">
          Powered by{' '}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity"
            style={{ color: theme.accent }}
          >
            Smart Invites Enterprise
          </a>
        </p>
      </footer>

      <DigitalGuestPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        guestName={s.translatedGuestName || s.rsvpName || 'Honored Delegate'}
        guestSlug={guestSlug || undefined}
        seats={flowData?.guestSeats ?? 1}
        allowedEvents={flowData?.guestAllowedEvents || undefined}
        invitationTitle={`${flowData?.partner1Name || ''} & ${flowData?.partner2Name || ''}`}
        invitationUrl={typeof window !== 'undefined' ? window.location.href.split('?')[0] : ''}
        eventDate={flowData?.events?.[0]?.date}
        venue={flowData?.venue}
        category={flowData?.category || 'corporate'}
      />
    </div>
  )
}
