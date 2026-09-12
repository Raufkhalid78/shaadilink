'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, Calendar, Clock, MapPin, Award, BookOpen, User,
  Check, X, Send, Heart, ExternalLink, Ticket, Sparkles, Star, ChevronRight
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

const DoorOverlay = dynamic(() => import('../door/door-overlay').then(m => m.DoorOverlay), { ssr: false })
const ConfettiDisplay = dynamic(() => import('../effects/confetti').then(m => m.ConfettiDisplay), { ssr: false })
const BackgroundParticles = dynamic(() => import('../effects/particles').then(m => m.BackgroundParticles), { ssr: false })

export interface LayoutViewerProps {
  templateId?: string
  flowData?: FlowData
  guestName?: string | null
  guestSlug?: string | null
  customTheme?: TemplateTheme
}

export function SchoolViewerLayout({ templateId, flowData: propFlowData, guestName, guestSlug, customTheme }: LayoutViewerProps) {
  const s = useInvitationState(templateId, propFlowData, guestName, guestSlug)
  const theme = customTheme || s.theme
  const flowData = s.flowData

  const [guestSeats, setGuestSeats] = useState('2')
  const [degreeField, setDegreeField] = useState('')
  const [passConfirmed, setPassConfirmed] = useState(false)

  const [tributeName, setTributeName] = useState('')
  const [tributeMsg, setTributeMsg] = useState('')
  const [tributes, setTributes] = useState<Array<{ name: string; message: string }>>(() => {
    if (s.isDemo) {
      return [
        { name: 'Chancellor Dr. A. Khan', message: 'Congratulations Class of 2027! The world awaits your wisdom, grit, and visionary leadership.' },
        { name: 'Prof. Maryam Saeed', message: 'To my brilliant research scholars: never stop asking questions. Onward and upward!' },
        { name: 'Alumni Association', message: 'Welcome to an international network of changemakers. Proud of each one of you!' }
      ]
    }
    return []
  })

  // Sync with DB loaded wishes/tributes if present
  useEffect(() => {
    if (s.wishes && s.wishes.length > 0) {
      setTributes(s.wishes.map(w => ({ name: w.name, message: w.message })))
    }
  }, [s.wishes])

  // Only keep pass confirmed if a valid guest name was actually entered and RSVP accepted
  useEffect(() => {
    if (s.rsvpSubmitted && s.rsvpStatus === 'accept' && s.rsvpName?.trim()) {
      setPassConfirmed(true)
    } else if (!s.rsvpName?.trim()) {
      setPassConfirmed(false)
    }
  }, [s.rsvpSubmitted, s.rsvpStatus, s.rsvpName])

  // School Titles
  const schoolName = flowData?.partner1Name?.trim() || (s.isDemo ? 'Oxford Collegiate Academy' : 'Institution Name')
  const eventTitle = flowData?.partner2Name?.trim() || (s.isDemo ? 'Class of 2027 Commencement Gala' : 'Annual Convocation')
  const venueName = flowData?.venue?.trim() || (s.isDemo ? 'The Great Memorial Convocation Hall' : 'Main Auditorium')
  const [venueAddress, mapsUrl] = (flowData?.venueAddress || (s.isDemo ? 'Heritage Quadrangle, University Road|||https://maps.google.com' : '')).split('|||')

  // Faculty & Valedictorian Spotlight
  const honorsList = useMemo(() => [
    { role: 'Valedictorian', name: 'Zeeshan Tariq', achievement: 'Summa Cum Laude • Gold Medalist', quote: 'Our journey is only beginning.' },
    { role: 'Dean of Faculty', name: 'Dr. Katherine Bell', achievement: 'Faculty of Arts & Sciences', quote: 'Lead with integrity and courage.' },
    { role: 'Senior Class President', name: 'Ayesha Malik', achievement: 'Distinguished Service Award', quote: 'Here is to four years we will never forget.' }
  ], [])

  // Order of Proceedings (Academic timeline)
  const proceedings = useMemo(() => {
    if (flowData?.events && flowData.events.some(e => e.name && (e.date || e.time))) {
      return flowData.events.filter(e => e.name).map((e, idx) => ({
        id: e.id || `event-${idx}`,
        time: e.time || '05:00 PM',
        date: e.date || 'June 18, 2027',
        name: e.name,
        desc: e.venue ? `At ${e.venue}` : 'Academic ceremony proceedings.'
      }))
    }
    return [
      { id: '1', time: '04:30 PM', date: 'June 18, 2027', name: 'Academic Procession & Robing', desc: 'Faculty, deans, and graduating candidates assemble in traditional regalia.' },
      { id: '2', time: '05:30 PM', date: 'June 18, 2027', name: 'Opening Invocation & Dean Address', desc: 'Welcome address by the Chancellor and Dean of Academic Affairs.' },
      { id: '3', time: '06:15 PM', date: 'June 18, 2027', name: 'Valedictory Speech & Honors Roll', desc: 'Conferral of Chancellor Gold Medals and Academic Distinctions.' },
      { id: '4', time: '07:30 PM', date: 'June 18, 2027', name: 'Conferral of Degrees & Diplomas', desc: 'The ceremonial awarding of academic scrolls with Imperial seal.' },
      { id: '5', time: '08:45 PM', date: 'June 18, 2027', name: 'Commencement Gala Dinner & Prom Ball', desc: 'Celebratory banquet, live jazz orchestra, and class dancing.' },
    ]
  }, [flowData?.events])

  const firstEvent = proceedings[0]

  const handleSendTribute = async () => {
    if (!tributeName.trim() || !tributeMsg.trim()) {
      toast.error('Please enter your name and congratulatory message.')
      return
    }
    const newTribute = { name: tributeName.trim(), message: tributeMsg.trim() }
    setTributes(prev => [newTribute, ...prev])
    setTributeName('')
    setTributeMsg('')
    if (flowData?.invitationId) {
      try {
        await fetch(`/api/invitations/${flowData.invitationId}/wishes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderName: newTribute.name, message: newTribute.message })
        })
      } catch (err) {
        console.error('Failed to save tribute', err)
      }
    }
    toast.success('Your message has been added to the Class of 2027 guestbook!')
  }

  const handleConfirmPass = async (status: 'accept' | 'decline') => {
    if (!s.rsvpName?.trim()) {
      toast.error('Please enter your full name before reserving seats.')
      return
    }
    const success = await s.handleRSVP(status)
    if (success && status === 'accept') {
      setPassConfirmed(true)
      toast.success('Commencement guest pass reserved!')
    }
  }

  return (
    <div
      className="relative min-h-screen font-serif selection:bg-amber-500/20"
      style={{ backgroundColor: theme.bgPrimary, color: theme.textPrimary }}
    >
      <ConfettiDisplay show={s.doorsOpened} />
      <BackgroundParticles accentColor={theme.accent} />

      {/* Collegiate Doors / Crest Reveal */}
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
      <div className="fixed top-5 right-5 z-40">
        <MusicToggle
          isPlaying={s.musicPlaying}
          onToggle={() => s.setMusicPlaying(!s.musicPlaying)}
          theme={theme}
        />
      </div>

      {/* Top Academic Crest Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-md bg-background/50 sticky top-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center border font-bold"
              style={{ borderColor: `${theme.accent}40`, color: theme.accent, backgroundColor: `${theme.accent}15` }}
            >
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color: theme.accent }}>
                {schoolName}
              </p>
              <p className="text-[10px] font-sans text-muted-foreground uppercase tracking-widest">
                Official Convocation &amp; Gala
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-sans font-semibold px-3 py-1 rounded-full border border-white/10">
            <Star className="w-3.5 h-3.5" style={{ color: theme.accent }} /> Class of 2027
          </span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-20 space-y-16">
        
        {/* HERO */}
        <section className="text-center space-y-6 pt-6">
          <div className="flex justify-center">
            <div
              className="px-4 py-1.5 rounded-full border text-xs font-sans font-bold tracking-widest uppercase flex items-center gap-2"
              style={{ borderColor: `${theme.accent}40`, color: theme.accent, backgroundColor: `${theme.accent}10` }}
            >
              <Award className="w-3.5 h-3.5" />
              Veritas • Excellentia • Virtus
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-3xl mx-auto">
            {eventTitle}
          </h1>

          <p className="font-sans text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {flowData?.welcomeMessage || 'The Chancellor, Board of Trustees, and Faculty cordially invite you to celebrate the distinguished academic achievements and graduation of our class.'}
          </p>

          {/* Personal Voice Greeting / Dean's Message */}
          {flowData?.voiceNoteUrl && (
            <VoiceGreetingPlayer
              voiceNoteUrl={flowData.voiceNoteUrl}
              voiceNoteTitle={flowData.voiceNoteTitle || "Convocation Audio Address"}
              voiceNoteSender={flowData.voiceNoteSender || `Message from ${schoolName}`}
              onPlayStart={() => {
                if (s.setMusicPlaying) {
                  s.setMusicPlaying(false)
                }
              }}
            />
          )}

          {/* Date, Location & Calendar Card */}
          <div className="p-4 sm:p-5 rounded-3xl border border-white/10 bg-card/60 backdrop-blur-xl max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
            <div className="flex items-center gap-3 text-left">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border"
                style={{ borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}15`, color: theme.accent }}
              >
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{firstEvent?.date || 'June 18, 2027'}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {firstEvent?.time || '04:30 PM'} • {venueName}
                </p>
              </div>
            </div>

            <AddToCalendarDropdown
              event={{
                name: `${schoolName}: ${eventTitle}`,
                description: `Commencement ceremony for ${schoolName}.`,
                venue: venueAddress || venueName,
                date: firstEvent?.date || '2027-06-18',
                time: firstEvent?.time || '04:30 PM'
              }}
              partner1={schoolName}
              partner2=""
              theme={theme}
              label="Add to Calendar"
              location={venueAddress || venueName}
            />
          </div>

          {/* Countdown */}
          <div className="pt-2 font-sans">
            <p className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-3">
              Commencement Commences In
            </p>
            <CountdownTimer
              theme={theme}
              targetDate={firstEvent?.date || '2027-06-18'}
              targetTime={firstEvent?.time || '04:30 PM'}
            />
          </div>
        </section>

        {/* ORDER OF PROCEEDINGS */}
        <section className="space-y-6 font-sans">
          <div className="border-b border-white/10 pb-4 text-center sm:text-left">
            <p className="text-xs font-bold tracking-widest uppercase font-serif" style={{ color: theme.accent }}>
              Ceremony Schedule
            </p>
            <h2 className="text-2xl font-bold font-serif tracking-tight">Order of Academic Proceedings</h2>
          </div>

          <div className="space-y-3">
            {proceedings.map((step, idx) => (
              <div
                key={step.id || idx}
                className="p-5 rounded-2xl border border-white/10 bg-card/40 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-serif font-bold text-sm shrink-0 border"
                    style={{ borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}10`, color: theme.accent }}
                  >
                    0{idx + 1}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider" style={{ color: theme.accent }}>
                      {step.time}
                    </span>
                    <h3 className="text-base font-bold text-foreground font-serif">{step.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <span className="text-xs text-muted-foreground px-2.5 py-1 rounded-full border border-white/10 bg-white/5">
                    Stage {idx + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HONORS & LEADERSHIP SPOTLIGHT */}
        <section className="space-y-6 font-sans">
          <div className="border-b border-white/10 pb-4 text-center sm:text-left">
            <p className="text-xs font-bold tracking-widest uppercase font-serif" style={{ color: theme.accent }}>
              Class Leadership
            </p>
            <h2 className="text-2xl font-bold font-serif tracking-tight">Honors &amp; Faculty Spotlight</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {honorsList.map((honor, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-white/10 bg-card/40 backdrop-blur-md text-center space-y-3"
              >
                <div
                  className="w-14 h-14 rounded-full mx-auto flex items-center justify-center font-serif font-bold text-lg border"
                  style={{ borderColor: `${theme.accent}40`, backgroundColor: `${theme.accent}15`, color: theme.accent }}
                >
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: theme.accent }}>
                    {honor.role}
                  </span>
                  <h3 className="font-bold text-base font-serif text-foreground mt-0.5">{honor.name}</h3>
                  <p className="text-xs text-muted-foreground">{honor.achievement}</p>
                </div>
                <p className="text-xs italic text-foreground/80 font-serif pt-2 border-t border-white/5">
                  &ldquo;{honor.quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* COMMENCEMENT LOGISTICS */}
        <section className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl space-y-6 font-sans">
          <div className="border-b border-white/10 pb-4">
            <p className="text-xs font-bold tracking-widest uppercase font-serif" style={{ color: theme.accent }}>
              Campus Guide
            </p>
            <h2 className="text-2xl font-bold font-serif tracking-tight">Venue, Seating &amp; Academic Regalia</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-4 h-4" style={{ color: theme.accent }} /> Ceremony Venue
              </p>
              <p className="font-bold text-sm text-foreground">{venueName}</p>
              <p className="text-xs text-muted-foreground">{venueAddress}</p>
              {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs underline mt-1" style={{ color: theme.accent }}>
                  Campus Map Directions <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" style={{ color: theme.accent }} /> Dress Code &amp; Robing
              </p>
              <p className="font-bold text-sm text-foreground">Academic Regalia / Black Tie</p>
              <p className="text-xs text-muted-foreground">
                {flowData?.dressCodeWomen || 'Graduates must wear approved caps, gowns, and hoods. Guests are requested to wear formal cocktail or black tie attire.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Ticket className="w-4 h-4" style={{ color: theme.accent }} /> Guest Seating
              </p>
              <p className="font-bold text-sm text-foreground">Allocated Guest Passes</p>
              <p className="text-xs text-muted-foreground">
                {flowData?.transportation || 'Reserved seating tickets will be distributed upon RSVP confirmation. Campus parking permits provided.'}
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
              guestName={guestName || schoolName}
              guestSeats={flowData.guestSeats}
              accentColor={theme.accent}
            />
          </section>
        )}

        {/* SCHOLARSHIP & ENDOWMENT DETAILS */}
        {flowData?.gifts && !flowData?.hideDigitalShagun && (
          <section className="space-y-6 max-w-xl mx-auto">
            <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl text-center space-y-4">
              <div
                className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center border"
                style={{ borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}15`, color: theme.accent }}
              >
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold font-serif">Scholarship Fund &amp; Endowment Details</h2>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line font-sans">
                {flowData.gifts}
              </p>
            </div>
          </section>
        )}

        {/* TRIBUTES & GUESTBOOK */}
        <section className="space-y-6 font-sans">
          <div className="border-b border-white/10 pb-4 text-center sm:text-left">
            <p className="text-xs font-bold tracking-widest uppercase font-serif" style={{ color: theme.accent }}>
              Commemorative Guestbook
            </p>
            <h2 className="text-2xl font-bold font-serif tracking-tight">Messages to the Class of 2027</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Tribute Messages List */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {tributes.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-white/15 text-center text-xs text-muted-foreground font-serif">
                  No congratulatory messages posted yet. Be the first to leave a note!
                </div>
              ) : (
                tributes.map((t, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-white/10 bg-card/30 space-y-1">
                    <p className="font-bold text-xs font-serif" style={{ color: theme.accent }}>{t.name}</p>
                    <p className="text-xs text-foreground/90 leading-relaxed">&ldquo;{t.message}&rdquo;</p>
                  </div>
                ))
              )}
            </div>

            {/* Leave a tribute form */}
            <div className="p-5 rounded-2xl border border-white/10 bg-card/40 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider font-serif">Leave a Congratulatory Note</p>
              <Input
                value={tributeName}
                onChange={(e) => setTributeName(e.target.value)}
                placeholder="Your Name & Relation (e.g. Prof. Tariq / Proud Parent)"
                className="h-10 bg-background/80 text-xs"
              />
              <Textarea
                value={tributeMsg}
                onChange={(e) => setTributeMsg(e.target.value)}
                placeholder="Write your wishes to the graduates..."
                className="min-h-[70px] bg-background/80 text-xs resize-none"
              />
              <Button
                onClick={handleSendTribute}
                className="w-full font-bold text-xs"
                style={{ backgroundColor: theme.accent, color: theme.bgPrimary }}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" /> Post Tribute
              </Button>
            </div>
          </div>
        </section>

        {/* COMMENCEMENT RSVP */}
        <section id="rsvp-section" className="font-sans scroll-mt-20">
          <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-2xl max-w-xl mx-auto space-y-6 text-center">
            <div className="space-y-2">
              <span
                className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border font-serif"
                style={{ borderColor: `${theme.accent}30`, color: theme.accent, backgroundColor: `${theme.accent}10` }}
              >
                Guest Seating Reservation
              </span>
              <h2 className="text-2xl font-bold font-serif">Reserve Commencement Tickets</h2>
              <p className="text-xs text-muted-foreground">
                Please confirm your attendance to reserve guest seating tickets for the auditorium.
              </p>
            </div>

            {passConfirmed ? (
              <div
                className="p-6 rounded-2xl border text-center space-y-3"
                style={{ borderColor: `${theme.accent}40`, backgroundColor: `${theme.accent}10` }}
              >
                <Check className="w-10 h-10 mx-auto" style={{ color: theme.accent }} />
                <h3 className="font-serif font-bold text-lg">Commencement Pass Confirmed</h3>
                <p className="text-xs text-muted-foreground">
                  Reserved <span className="font-bold text-foreground">{guestSeats} Guest Seats</span> for <span className="font-bold text-foreground">{s.rsvpName.trim()}</span>.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPassConfirmed(false)
                      s.setRsvpSubmitted(false)
                    }}
                    className="text-[11px] underline text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Edit Reservation or Change Name
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Attendee / Graduate Full Name
                  </label>
                  <Input
                    value={s.rsvpName}
                    onChange={(e) => s.setRsvpName(e.target.value)}
                    placeholder="e.g. Sarah Qureshi"
                    className="h-11 bg-background/80"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Department / Major (Optional)
                    </label>
                    <Input
                      value={degreeField}
                      onChange={(e) => setDegreeField(e.target.value)}
                      placeholder="e.g. Computer Science '27"
                      className="h-11 bg-background/80"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Number of Guest Seats
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="6"
                      value={guestSeats}
                      onChange={(e) => setGuestSeats(e.target.value)}
                      className="h-11 bg-background/80"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => handleConfirmPass('accept')}
                    className="flex-1 font-bold h-11 text-xs uppercase tracking-wider font-serif"
                    style={{ backgroundColor: theme.accent, color: theme.bgPrimary }}
                  >
                    <Check className="w-4 h-4 mr-1.5" /> Confirm Seating
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleConfirmPass('decline')}
                    className="flex-1 text-xs border-white/20 h-11 font-serif"
                  >
                    <X className="w-4 h-4 mr-1.5" /> Unable to Attend
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-muted-foreground font-sans">
        <p>© 2027 {schoolName}. All rights reserved.</p>
        <p className="mt-2 text-[11px] opacity-75">
          Crafted with excellence by{' '}
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
    </div>
  )
}
