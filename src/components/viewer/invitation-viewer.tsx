'use client'

import dynamic from 'next/dynamic'
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { m, AnimatePresence, useInView } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  MapPin,
  Calendar,
  Clock,
  ChevronDown,
  Heart,
  Sparkles,
  Send,
  Check,
  X,
  Star,
  Music,
  Music2,
  User,
  MessageCircle,
  Loader2,
  Copy,
  Hotel,
  Car,
  Gift,
  HelpCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Share2,
} from 'lucide-react'
import type { FlowData } from '@/lib/flow-types'

import { TemplateTheme, TEMPLATE_THEMES, DEFAULT_THEME } from './themes';

import { InvitationViewerProps, hexToRgb, getTheme, extractColors, parseGiftDetails, getCalendarDates, getGoogleCalendarLink, generateICSContent, getOutlookWebLink, formatScratchDate, formatScratchTime } from './utils';

const ScratchCard = dynamic(() => import('./features/scratch-card').then(mod => mod.ScratchCard), { ssr: false });

/* ─── Decorative Divider ─── */
/* ─── Add to Calendar Dropdown ─── */
/* ─── Wave SVG Divider ─── */
/* ─── Scroll Reveal Section Wrapper ─── */
/* ─── Background Floating Particles ─── */


/* ─── Background Floating Particles ─── */
/* ─── Fireworks Component ─── */



/* ─── Confetti ─── */
/* ─── Heart Path Helper ─── */
/* ─── Gold Dust Splash ─── */


/* ─── Scratch Card (v8 - Grid-based tracking + fixed DPR + sparkle trail) ─── */
/* ─── Music Toggle ─── */
/* ─── Realistic Door Surface Material ─── */
/* ─── Door Panel Content ─── */
/* ─── Door Handle - Per-type realistic hardware ─── */
/* ─── Center Button Styles ─── */
/* ─── Door Decorative Elements ─── */
/* ─── 3D Door Panel Inset (Raised Panel) - Multi-Layout ─── */
/* ─── Door Panel Layout Renderer ─── */
/* ─── Door Hinges ─── */
/* ─── Door Frame - Per-style frame rendering ─── */
/* ─── Light Leak Effect ─── */
/* ─── Door SVG Pattern Component ─── */
/* ─── Door Overlay Component ─── */

const RoyalImperialViewer = dynamic(() => import('./royal-viewers/royal-imperial-viewer'), { ssr: false })
const RoyalEleganceViewer = dynamic(() => import('./royal-viewers/royal-elegance-viewer'), { ssr: false })
const GeometricGoldViewer = dynamic(() => import('./royal-viewers/geometric-gold-viewer'), { ssr: false })
const DarkVelvetViewer = dynamic(() => import('./royal-viewers/dark-velvet-viewer'), { ssr: false })

/* ─── Royal Template Router ─── */
const ROYAL_TEMPLATE_MAP: Record<string, React.ComponentType<{ templateId?: string; flowData?: FlowData; guestName?: string | null; guestSlug?: string | null }>> = {
  'royal-imperial': RoyalImperialViewer,
  'royal-elegance': RoyalEleganceViewer,
  'geometric-gold': GeometricGoldViewer,
  'dark-velvet': DarkVelvetViewer,
}

/* ─── Main Invitation Viewer ─── */
function ClassicViewer({ templateId, flowData, guestName, guestSlug }: InvitationViewerProps) {

  const theme = useMemo(() => getTheme(templateId), [templateId])

  const getOpacityStyle = useCallback((type: 'text' | 'bg' | 'border', defaultOpacity: number) => {
    if (!theme.isLight) {
      return `rgba(${theme.accentRgb},${defaultOpacity})`
    }
    if (type === 'text') {
      const textRgb = hexToRgb(theme.textPrimary)
      if (defaultOpacity <= 0.3) return `rgba(${textRgb},0.65)`
      if (defaultOpacity <= 0.5) return `rgba(${textRgb},0.82)`
      if (defaultOpacity <= 0.7) return `rgba(${textRgb},0.95)`
      return `rgba(${textRgb},1)`
    }
    if (type === 'bg') {
      if (defaultOpacity <= 0.03) return `rgba(${theme.accentRgb},0.07)`
      if (defaultOpacity <= 0.05) return `rgba(${theme.accentRgb},0.1)`
      if (defaultOpacity <= 0.1) return `rgba(${theme.accentRgb},0.15)`
      return `rgba(${theme.accentRgb},${defaultOpacity * 1.5})`
    }
    if (defaultOpacity <= 0.1) return `rgba(${theme.accentRgb},0.25)`
    if (defaultOpacity <= 0.25) return `rgba(${theme.accentRgb},0.45)`
    return `rgba(${theme.accentRgb},0.55)`
  }, [theme.accentRgb, theme.isLight])

  // Use flowData for dynamic content, fall back to demo defaults
  const partner1 = flowData?.partner1Name?.trim() || 'Ahmed'
  const partner2 = flowData?.partner2Name?.trim() || 'Fatima'
  const venueName = flowData?.venue?.trim() || 'The Grand Pearl Hall'
  const rawVenueAddress = flowData?.venueAddress?.trim() || 'Main Boulevard, Gulberg, Lahore'
  const [venueAddress, googleMapsUrl] = rawVenueAddress.includes('|||')
    ? rawVenueAddress.split('|||')
    : [rawVenueAddress, '']
  const [mapQuery, setMapQuery] = useState(getMapEmbedQuery(googleMapsUrl, venueAddress, venueName))

  useEffect(() => {
    let active = true;
    const baseQuery = getMapEmbedQuery(googleMapsUrl, venueAddress, venueName);

    if (!googleMapsUrl || (!googleMapsUrl.includes('goo.gl') && !googleMapsUrl.includes('maps.app.goo.gl'))) {
      if (active) setMapQuery(baseQuery);
      return;
    }

    // Resolve shortened URL
    fetch(`/api/resolve-url?url=${encodeURIComponent(googleMapsUrl)}`)
      .then(res => res.json())
      .then(data => {
        if (data.resolvedUrl && active) {
          setMapQuery(getMapEmbedQuery(data.resolvedUrl, venueAddress, venueName));
        } else if (active) {
          setMapQuery(baseQuery);
        }
      })
      .catch(() => {
        if (active) setMapQuery(baseQuery);
      });

    return () => { active = false; };
  }, [googleMapsUrl, venueAddress, venueName]);
  const welcomeMsg = flowData?.welcomeMessage?.trim() || "With hearts full of love and joy, we warmly invite you to share in the celebration of our union. Your presence would mean the world to us as we begin this beautiful journey together."

  const [language, setLanguage] = useState<'en' | 'ur'>('en')
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isTranslating, setIsTranslating] = useState(false)

  const isDemo = !flowData?.invitationId && !flowData?.partner1Name

  const [guestNameFromUrl, setGuestNameFromUrl] = useState('')

  // Track page view and handle guest URL param
  useEffect(() => {
    if (flowData?.invitationId && !isDemo) {
      // Small delay to ensure we only track real views, not quick bounces
      const timer = setTimeout(() => {
        fetch(`/api/invitations/${flowData.invitationId}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestSlug: guestSlug || undefined })
        }).catch(() => {});
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [flowData?.invitationId, isDemo]);

  const dressCodeWomen = flowData?.dressCodeWomen?.trim() || (isDemo ? "Yellow / Green traditional" : "")
  const dressCodeMen = flowData?.dressCodeMen?.trim() || (isDemo ? "Gold / Maroon formal" : "")
  const accommodation = flowData?.accommodation?.trim() || (isDemo ? "Rooms blocked at Leela Palace & Pearl Continental. Mention 'Ahmed & Fatima' for discounts." : "")
  const transportation = flowData?.transportation?.trim() || (isDemo ? "Shuttle service will run from Pearl Continental to the venue every 30 minutes starting at 6:30 PM." : "")
  const gifts = flowData?.gifts?.trim() || (isDemo ? "Your prayers are our greatest gift. For Shagun, you may transfer to Meezan Bank, Title: Ahmed Khan, Account Number: 028102384, IBAN: PK45MEZN00028102384, Raast ID: 03001234567, EasyPaisa: 03123456789" : "")
  const youtubeVideoId = flowData?.youtubeVideoId?.trim() || (isDemo ? "dQw4w9WgXcQ" : "")

  const dynamicEvents = useMemo(() => {
    let evs;
    if (flowData?.events && flowData.events.some(e => e.date || e.time)) {
      const seen = new Set<string>()
      evs = flowData.events
        .filter(e => {
          if (!e.name) return false
          const key = `${e.name.toLowerCase().trim()}|${(e.date || '').trim()}|${(e.time || '').trim()}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        .map((e, idx) => ({
          id: e.id || `event-${idx}`,
          name: e.name,
          time: e.time || 'TBD',
          date: e.date || 'TBD',
          description: e.venue ? `At ${e.venue}` : `Join us for the ${e.name} celebration.`,
        }))
    } else {
      // Default demo events
      evs = [
        { name: 'Mehndi', time: '6:00 PM', date: 'March 14, 2027', description: 'A night of colors, henna, and celebration with traditional music and dance.' },
        { name: 'Baraat', time: '7:00 PM', date: 'March 15, 2027', description: 'The grand wedding procession — dhol beats, dancing, and joyful arrival.' },
        { name: 'Nikkah', time: '7:30 PM', date: 'March 15, 2027', description: 'The sacred Islamic marriage ceremony — the signing of the Nikkah Nama.' },
        { name: 'Walima', time: '8:00 PM', date: 'March 16, 2027', description: 'The wedding reception hosted by the groom — feast, blessings, and joy.' },
      ]
    }
    // Filter events for guest-specific links
    const allowed = flowData?.guestAllowedEvents;
    if (allowed && allowed.length > 0 && guestName) {
      evs = evs.filter(e =>
        allowed.includes(e.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
      );
    }
    return evs;
  }, [flowData?.events, flowData?.guestAllowedEvents, guestName])

  const firstEvent = useMemo(() => {
    if (!dynamicEvents.length) {
      return { date: 'March 15, 2027', time: '7:00 PM', name: 'Wedding' }
    }
    const mainNames = ['baraat', 'nikkah', 'wedding', 'shaadi', 'ruksati']
    const found = dynamicEvents.find(e => 
      mainNames.some(name => e.name.toLowerCase().includes(name))
    )
    return found || dynamicEvents[0]
  }, [dynamicEvents])

  const scratchDateInfo = useMemo(() => {
    return formatScratchDate(firstEvent.date, language)
  }, [firstEvent.date, language])

  const scratchTimeFormatted = useMemo(() => {
    return formatScratchTime(firstEvent.time, language)
  }, [firstEvent.time, language])

  const [doorsOpened, setDoorsOpened] = useState(false)
  const [scratchRevealed, setScratchRevealed] = useState(false)
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)
  const [doorOverlayVisible, setDoorOverlayVisible] = useState(true)
  const [rsvpName, setRsvpName] = useState('')
  const [rsvpEmail, setRsvpEmail] = useState('')
  const [rsvpStatus, setRsvpStatus] = useState<'accept' | 'decline' | null>(null)
  
  useEffect(() => {
    if (guestName) {
      setGuestNameFromUrl(guestName)
      if (!rsvpName) setRsvpName(guestName)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestName])
  const [wishName, setWishName] = useState('')
  const [wishMessage, setWishMessage] = useState('')
  const [musicPlaying, setMusicPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Check if user already RSVP'd in this browser
  useEffect(() => {
    if (typeof window !== 'undefined' && flowData?.invitationId) {
      const savedStatus = localStorage.getItem(`shaadilink_rsvp_${flowData.invitationId}`)
      if (savedStatus) {
        setRsvpSubmitted(true)
        setRsvpStatus(savedStatus as 'accept' | 'decline')
      }
    }
  }, [flowData?.invitationId])

  // Preload and warm up audio track
  useEffect(() => {
    if (typeof window === 'undefined') return

    const musicTrack = flowData?.backgroundMusic || (isDemo ? 'tabla-beats' : null)
    if (!musicTrack || musicTrack === 'no-music') {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      return
    }

    const trackSrc = `/music/${musicTrack}.mp3`
    const absoluteSrc = window.location.origin + trackSrc
    if (!audioRef.current || audioRef.current.src !== absoluteSrc) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(trackSrc)
      audio.loop = true
      audio.preload = 'auto'
      audioRef.current = audio
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [flowData?.backgroundMusic, isDemo])

  // Play/pause control
  const playPromiseRef = useRef<Promise<void> | null>(null)

  useEffect(() => {
    if (!audioRef.current) return

    if (doorsOpened && musicPlaying) {
      const p = audioRef.current.play()
      playPromiseRef.current = p
      if (p !== undefined) {
        p.catch(err => {
          if (err?.name !== 'AbortError') {
            console.warn('Audio play failed (waiting for user interaction):', err)
            setMusicPlaying(false)
          }
        })
      }
    } else {
      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => {
            if (!musicPlaying && audioRef.current) {
              audioRef.current.pause()
            }
          })
          .catch(() => {})
      } else {
        audioRef.current.pause()
      }
    }
  }, [doorsOpened, musicPlaying])


  const [showConfetti, setShowConfetti] = useState(false)
  const [rsvpHearts, setRsvpHearts] = useState<number[]>([])
  const [heroVisible, setHeroVisible] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success(`${fieldName} copied to clipboard!`)
    setTimeout(() => {
      setCopiedField(null)
    }, 2000)
  }
  const [showGoldDust, setShowGoldDust] = useState(false)
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({})
  const [wishes, setWishes] = useState<
    Array<{ name: string; message: string; translatedName?: string; translatedMessage?: string }>
  >(() => {
    if (flowData?.invitationId) return []
    return [
      { name: 'Ayesha Khan', message: 'May Allah bless your union with endless love and happiness! 🤲' },
      { name: 'Omar Farooq', message: 'Wishing you a lifetime of joy and togetherness! 💒' },
      { name: 'Zainab Malik', message: 'MashaAllah! May your journey be filled with blessings! ✨' },
    ]
  })
  // Keep a ref to the current wishes so the translation callback can read them without re-creating
  const wishesRef = useRef(wishes)
  wishesRef.current = wishes

  const handleDoorOpen = useCallback((instant?: boolean) => {
    if (doorsOpened) return
    setDoorsOpened(true)
    
    const delayFactor = instant ? 0 : 1;
    
    // Delay fireworks until the doors are almost open (1.5s delay)
    // This frees up main thread/GPU cycles for the door swing animation.
    setTimeout(() => {
      setShowFireworks(true)
    }, 1500 * delayFactor)
    setTimeout(() => setShowFireworks(false), 6500 * delayFactor)

    if (theme.id.includes('royal')) {
      setShowGoldDust(true)
      setTimeout(() => setShowGoldDust(false), 4500 * delayFactor)
    }
    const musicTrack = flowData?.backgroundMusic || (isDemo ? 'tabla-beats' : null)
    if (musicTrack && musicTrack !== 'no-music') {
      setMusicPlaying(true)
    }
    setTimeout(() => setDoorOverlayVisible(false), 2800 * delayFactor)
    setTimeout(() => setHeroVisible(true), 2400 * delayFactor)
  }, [doorsOpened, theme.id, flowData?.backgroundMusic, isDemo])

  const handleRSVP = useCallback(async (status: 'accept' | 'decline') => {
    if (!rsvpName.trim()) { toast.error('Please enter your name'); return }
    
    if (flowData?.invitationId) {
      try {
        const response = await fetch(`/api/invitations/${flowData.invitationId}/rsvp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guestName: rsvpName.trim(),
            guestEmail: rsvpEmail.trim() || undefined,
            status,
          }),
        })
        if (!response.ok) {
          const errData = await response.json()
          toast.error(errData.error || 'Failed to submit RSVP. Please try again.')
          return
        }

        // Save to local storage to prevent duplicate submissions
        if (typeof window !== 'undefined') {
          localStorage.setItem(`shaadilink_rsvp_${flowData.invitationId}`, status)
        }
      } catch (err) {
        console.error('RSVP submit error:', err)
        toast.error('Network error. Please try again.')
        return
      }
    }

    setRsvpStatus(status)
    setRsvpSubmitted(true)
    if (status === 'accept') {
      toast.success(`Joyfully accepted! We can't wait to see you, ${rsvpName}! 🎉`)
      setShowConfetti(true)
      setRsvpHearts([1, 2, 3, 4, 5])
      setTimeout(() => setRsvpHearts([]), 3000)
      setTimeout(() => setShowConfetti(false), 4000)
    } else {
      toast.success(`Thank you for letting us know, ${rsvpName}. You'll be missed! 💌`)
    }
  }, [rsvpName, rsvpEmail, flowData?.invitationId])

  const handleSendWish = useCallback(async () => {
    if (!wishName.trim()) { toast.error('Please enter your name'); return }
    if (!wishMessage.trim()) { toast.error('Please write a blessing or wish'); return }
    const newWish = { name: wishName.trim(), message: wishMessage.trim() }
    setWishName('')
    setWishMessage('')

    if (flowData?.invitationId) {
      try {
        const response = await fetch(`/api/invitations/${flowData.invitationId}/wishes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderName: newWish.name,
            message: newWish.message,
          }),
        })
        if (!response.ok) {
          const errData = await response.json()
          toast.error(errData.error || 'Failed to submit wish. Please try again.')
          return
        }
      } catch (err) {
        console.error('Wish submit error:', err)
        toast.error('Network error. Please try again.')
        return
      }
    }

    toast.success(language === 'ur' ? 'آپ کی دعا بھیج دی گئی! 💝' : 'Your blessing has been sent! 💝')

    // If in Urdu mode, translate the new wish via AI before adding
    if (language === 'ur') {
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: { wishName: newWish.name, wishMessage: newWish.message } }),
        })
        if (response.ok) {
          const data = await response.json()
          const t = data.translations as Record<string, string>
          setWishes((prev) => [{ ...newWish, translatedName: t.wishName || newWish.name, translatedMessage: t.wishMessage || newWish.message }, ...prev])
          return
        }
      } catch {
        // Fallback: add without translation
      }
    }
    setWishes((prev) => [newWish, ...prev])
  }, [wishName, wishMessage, language, flowData?.invitationId])

  const handleScratchReveal = useCallback(() => {
    setScratchRevealed(true)
    setShowFireworks(true)
    setTimeout(() => setShowFireworks(false), 5000)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 4500)
  }, [])

  const events = dynamicEvents

  // Static Urdu translations for known strings (instant, reliable)
  const URDU_DICT: Record<string, string> = {
    gettingMarried: 'ہم شادی کر رہے ہیں',
    requestHonour: 'آپ کی موجودگی کی عزت کی درخواست ہے',
    scratchReveal: 'دعوت نامہ دیکھنے کے لیے',
    ourMoments: 'ہماری یادگاریں',
    'Our Story': '????? ?????',
    countingDown: 'ہمیشہ کی طرف گنتی',
    days: 'دن',
    hours: 'گھنٹے',
    minutes: 'منٹ',
    seconds: 'سیکنڈ',
    programTimeline: 'پروگرام کی ٹائم لائن',
    venue: 'مقام',
    viewOnMaps: 'گوگل میپ پر دیکھیں',
    willYouAttend: 'کیا آپ تشریف لائیں گے؟',
    yourName: 'آپ کا نام',
    enterName: 'اپنا پورا نام لکھیں',
    email: 'ای میل',
    emailOptional: '(اختیاری)',
    willYouBeAttending: 'کیا آپ شرکت کریں گے؟',
    selectOption: 'منتخب کریں...',
    acceptYes: 'جی ہاں، میں آ رہا ہوں! 🎉',
    declineSorry: 'معذرت، میں نہیں آ سکتا 💌',
    joyfullyAccept: 'خوشی سے قبول',
    respectfullyDecline: 'باادب معذرت',
    joyfullyAccepted: 'خوشی سے قبول کر لیا!',
    thankYou: 'شکریہ!',
    blessingsWishes: 'دعائیں اور آرزوئیں',
    writeBlessing: 'اپنی دعا یا آرزو لکھیں...',
    yourNameSender: 'آپ کا نام (تاکہ وہ جان سکیں کہ کس نے بھیجا)',
    madeWithLove: 'شادی لنک کی طرف سے محبت سے بنایا گیا',
    scroll: 'سکرول',
    tapToOpen: 'کھولنے کے لیے ٹچ کریں',
    mehndiDesc: 'رنگوں، مہندی اور روایتی موسیقی و رقص کی شام',
    baraatDesc: 'شادی کا شان دار جلوس — ڈھول کی تھاپ، رقص اور خوش آمدید',
    nikkahDesc: 'مقدس اسلامی شادی کی تقریب — نکاح نامہ کی دستخط',
    walimaDesc: 'دولہا کی طرف سے ولیمہ — ضیافت، دعائیں اور خوشیاں',
    at: 'پر',
    joinUs: 'میں شامل ہوں',
    celebration: 'تقریب',
    scratchHere: '✦  یہاں کھرچیں  ✦',
    toReveal: 'دعوت نامہ دیکھنے کے لیے',
    youreInvited: 'آپ مدعو ہیں!',
    march15: '15 مارچ 2027',
    sunday: 'اتوار',
    time7pm: 'شام 7 بجے',
    pkt: 'پاکستانی وقت',
    dressCode: 'ڈریس کوڈ',
    ladies: 'خواتین',
    gentlemen: 'حضرات',
    recommendedColors: 'تجویز کردہ رنگ',
    travelAccommodations: 'سفر اور رہائش',
    hotelBlocks: 'ہوٹل بلاکس',
    coordinator: 'کوآرڈینیٹر',
    transportationInfo: 'ٹرانسپورٹ کی معلومات',
    giftsShagun: 'شگون اور گفٹ رجسٹری',
    shagunDetails: 'شگون کی تفصیلات',
    copied: 'کاپی ہو گیا!',
    copy: 'کاپی کریں',
    faq: 'اکثر پوچھے گئے سوالات',
    addToCalendar: 'کیلنڈر میں شامل کریں',
  }

  // Translation function - uses static dictionary first, then AI for dynamic content
  const translateToUrdu = useCallback(async () => {
    if (language !== 'ur' || Object.keys(translations).length > 0) return

    // Immediately set static translations (instant)
    setTranslations(URDU_DICT)
    setIsTranslating(true)

    try {
      // Build texts object for AI translation with ALL dynamic content
      const dynamicTexts: Record<string, string> = {}
      if (partner1) dynamicTexts.partner1 = partner1
      if (partner2) dynamicTexts.partner2 = partner2
      if (flowData?.hostGroomFamily) dynamicTexts.hostGroomFamily = flowData.hostGroomFamily
      if (flowData?.hostBrideFamily) dynamicTexts.hostBrideFamily = flowData.hostBrideFamily
      if (flowData?.hostGroomCity) dynamicTexts.hostGroomCity = flowData.hostGroomCity.replace(/^from\s+/i, '')
      if (flowData?.hostBrideCity) dynamicTexts.hostBrideCity = flowData.hostBrideCity.replace(/^from\s+/i, '')
      if (venueName) dynamicTexts.venueName = venueName
      if (venueAddress) dynamicTexts.venueAddress = venueAddress
      if (welcomeMsg) dynamicTexts.welcomeMsg = welcomeMsg
      if (dressCodeWomen) dynamicTexts.dressCodeWomen = dressCodeWomen
      if (dressCodeMen) dynamicTexts.dressCodeMen = dressCodeMen
      if (transportation) dynamicTexts.transportation = transportation
      if (accommodation) dynamicTexts.accommodation = accommodation
      if (gifts) dynamicTexts.gifts = gifts
      if (guestNameFromUrl) dynamicTexts.guestName = guestNameFromUrl

      dynamicTexts.scratchHere = '✦  Scratch Here  ✦'
      dynamicTexts.toReveal = 'to reveal your invitation'
      dynamicTexts.youreInvited = "You're Invited!"
      dynamicTexts.march15 = 'March 15, 2027'
      dynamicTexts.sunday = 'Sunday'
      dynamicTexts.time7pm = '7:00 PM'
      dynamicTexts.pkt = 'PKT'
      dynamicTexts.scratchReveal = 'Scratch to Reveal'

      // Add each event
      events.forEach((event, idx) => {
        dynamicTexts[`event${idx}_name`] = event.name
        dynamicTexts[`event${idx}_date`] = event.date
        dynamicTexts[`event${idx}_time`] = event.time
        dynamicTexts[`event${idx}_desc`] = event.description
      })

      // Add each wish message for AI translation
      wishesRef.current.forEach((wish, idx) => {
        dynamicTexts[`wish${idx}_name`] = wish.name
        dynamicTexts[`wish${idx}_message`] = wish.message
      })

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: dynamicTexts }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.translations) {
          // Static URDU_DICT takes priority over AI translations for known keys
          // (our hand-crafted translations are higher quality for common strings)
          setTranslations(prev => {
            const aiOnly: Record<string, string> = {}
            for (const [key, value] of Object.entries(data.translations as Record<string, string>)) {
              // Only use AI translation if we don't have a static one
              if (!prev[key] || prev[key] === key) {
                aiOnly[key] = value
              }
            }
            return { ...aiOnly, ...prev }
          })

          // Update wishes with AI-translated names and messages
          const aiTranslations = data.translations as Record<string, string>
          setWishes(prev => prev.map((wish, idx) => ({
            ...wish,
            translatedName: aiTranslations[`wish${idx}_name`] || wish.name,
            translatedMessage: aiTranslations[`wish${idx}_message`] || wish.message,
          })))
        }
      }
    } catch (error) {
      console.error('AI translation failed:', error)
      // Static translations are already set, so the page still works
    } finally {
      setIsTranslating(false)
    }
  }, [language, partner1, partner2, venueName, venueAddress, welcomeMsg, dressCodeWomen, dressCodeMen, transportation, accommodation, gifts, events, translations, flowData?.hostBrideFamily, flowData?.hostGroomFamily, flowData?.hostBrideCity, flowData?.hostGroomCity])

  // Update html element lang/dir attributes when language changes
  useEffect(() => {
    document.documentElement.lang = language === 'ur' ? 'ur' : 'en'
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr'
    return () => {
      document.documentElement.lang = 'en'
      document.documentElement.dir = 'ltr'
    }
  }, [language])

  // Trigger translation when language switches to Urdu
  useEffect(() => {
    if (language === 'ur' && Object.keys(translations).length === 0) {
      translateToUrdu()
    }
  }, [language, translations, translateToUrdu])

  // Load wishes from database on mount if invitationId is present
  useEffect(() => {
    if (!flowData?.invitationId) return

    const loadDbWishes = async () => {
      try {
        const response = await fetch(`/api/invitations/${flowData.invitationId}/wishes`)
        if (response.ok) {
          const data = await response.json()
          if (data.wishes && Array.isArray(data.wishes)) {
            const mapped = data.wishes.map((w: any) => ({
              name: w.sender_name ?? '',
              message: w.message ?? '',
            }))
            setWishes(mapped)
          }
        }
      } catch (error) {
        console.error('Failed to load wishes from database:', error)
      }
    }

    loadDbWishes()
  }, [flowData?.invitationId])

  // Translate wishes on the fly if language switches to Urdu
  useEffect(() => {
    if (language !== 'ur' || wishes.length === 0) return
    
    // Check if there are any wishes that need translation
    const needsTranslation = wishes.some(w => !w.translatedName || !w.translatedMessage)
    if (!needsTranslation) return

    const translateWishes = async () => {
      try {
        const wishesToTranslate: Record<string, string> = {}
        wishes.forEach((wish, idx) => {
          if (!wish.translatedName || !wish.translatedMessage) {
            wishesToTranslate[`wish${idx}_name`] = wish.name
            wishesToTranslate[`wish${idx}_message`] = wish.message
          }
        })
        
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: wishesToTranslate }), // Send the subset
        })
        if (response.ok) {
          const data = await response.json()
          if (data.translations) {
            const tMap = data.translations
            setWishes(prev => prev.map((w, idx) => {
              if (!w.translatedName || !w.translatedMessage) {
                return {
                  ...w,
                  translatedName: tMap[`wish${idx}_name`] || w.name,
                  translatedMessage: tMap[`wish${idx}_message`] || w.message,
                }
              }
              return w
            }))
          }
        }
      } catch (err) {
        console.error('Failed to translate wishes on the fly:', err)
      }
    }
    
    translateWishes()
  }, [language, wishes])

  // Helper to get translated text
  const t = useCallback((key: string, fallback: string): string => {
    if (language === 'en') return fallback
    return translations[key] || fallback
  }, [language, translations])

  const copyToClipboard = useCallback((text: string) => {
    try {
      navigator.clipboard.writeText(text)
      toast.success(t('linkCopied', 'Invitation link copied to clipboard!'))
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      toast.success(t('linkCopied', 'Invitation link copied to clipboard!'))
    }
  }, [t])

  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') return
    const shareUrl = window.location.href
    const names = `${partner1} & ${partner2}`
    const shareTitle = `${names}'s Wedding Invitation`
    const shareText = `You are warmly invited to the wedding celebration of ${names}. Click to view details:`

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(shareUrl)
        }
      }
    } else {
      copyToClipboard(shareUrl)
    }
  }, [partner1, partner2, copyToClipboard])

  // Get translated event description
  const getEventDescription = useCallback((eventName: string, originalDesc: string): string => {
    if (language === 'en') return originalDesc
    const keyMap: Record<string, string> = {
      'Mehndi': 'mehndiDesc',
      'Baraat': 'baraatDesc',
      'Nikkah': 'nikkahDesc',
      'Walima': 'walimaDesc',
    }
    const key = keyMap[eventName]
    if (key && translations[key]) return translations[key]
    return originalDesc
  }, [language, translations])

  // Get translated welcome message
  const translatedWelcomeMsg = language === 'ur' && translations.welcomeMsg ? translations.welcomeMsg : welcomeMsg
  const translatedDressCodeWomen = language === 'ur' && translations.dressCodeWomen ? translations.dressCodeWomen : dressCodeWomen
  const translatedDressCodeMen = language === 'ur' && translations.dressCodeMen ? translations.dressCodeMen : dressCodeMen
  const translatedAccommodation = language === 'ur' && translations.accommodation ? translations.accommodation : accommodation
  const translatedTransportation = language === 'ur' && translations.transportation ? translations.transportation : transportation
  const translatedGifts = language === 'ur' && translations.gifts ? translations.gifts : gifts
  const translatedGuestName = language === 'ur' && translations.guestName ? translations.guestName : guestNameFromUrl

  // Translated dynamic content
  const translatedPartner1 = language === 'ur' && translations.partner1 ? translations.partner1 : partner1
  const translatedPartner2 = language === 'ur' && translations.partner2 ? translations.partner2 : partner2
  const translatedVenueName = language === 'ur' && translations.venueName ? translations.venueName : venueName
  const translatedVenueAddress = language === 'ur' && translations.venueAddress ? translations.venueAddress : venueAddress

  // Get translated event info
  const getTranslatedEvent = useCallback((event: { name: string; date: string; time: string; description: string }, index: number) => {
    if (language === 'en') return event
    return {
      name: translations[`event${index}_name`] || event.name,
      date: translations[`event${index}_date`] || event.date,
      time: translations[`event${index}_time`] || event.time,
      description: translations[`event${index}_desc`] || getEventDescription(event.name, event.description),
    }
  }, [language, translations, getEventDescription])

  return (
    <div className={`relative min-h-screen overflow-x-hidden`} dir={language === 'ur' ? 'rtl' : 'ltr'} style={{ backgroundColor: theme.bgPrimary, color: theme.textPrimary }}>
      <BackgroundParticles accentColor={theme.accent} />

      {/* ═══ Door Opening Overlay ═══ */}
      {/* Note: no Framer opacity animation on this wrapper — it would create a new stacking context and flatten 3D transforms */}
      {doorOverlayVisible && !theme.openingVideoUrl && (
        <div
          className="fixed inset-0 z-50"
          style={{ perspective: ['classic-doors', 'archway', 'lantern'].includes(theme.doorStyle.type) ? '1200px' : undefined }}
        >
          <DoorOverlay theme={theme} doorsOpened={doorsOpened} onOpen={handleDoorOpen} />
        </div>
      )}

      {/* Fireworks */}
      <FireworksDisplay show={showFireworks} colors={theme.fireworkColors} />
      <ConfettiDisplay show={showConfetti} colors={theme.confettiColors} />

      {/* Gold Dust Splash (Royal exclusive) */}
      <GoldDustSplash show={showGoldDust} colors={theme.fireworkColors} />

      {/* Music toggle */}
      <div className="fixed top-4 right-4 z-[200] flex items-center gap-2">
        <button
          onClick={() => {
            const newLang = language === 'en' ? 'ur' : 'en'
            setLanguage(newLang)
          }}
          className="w-10 h-10 rounded-full border backdrop-blur-sm flex items-center justify-center transition-all duration-300 text-xs font-bold relative"
          style={{ backgroundColor: theme.bgPrimary + 'cc', borderColor: theme.borderSubtle, color: getOpacityStyle('text', 0.7) }}
          aria-label="Toggle language"
          disabled={isTranslating}
        >
          {isTranslating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            language === 'en' ? 'اردو' : 'EN'
          )}
        </button>
        {/* Floating Share Button */}
        <button
          onClick={handleShare}
          className="w-10 h-10 rounded-full border backdrop-blur-sm flex items-center justify-center transition-all duration-300 relative hover:scale-105 active:scale-95"
          style={{ backgroundColor: theme.bgPrimary + 'cc', borderColor: theme.borderSubtle }}
          aria-label="Share Invitation"
          title="Share Invitation"
        >
          <Share2 className="w-4 h-4" style={{ color: theme.accent }} />
        </button>
        <MusicToggle isPlaying={musicPlaying} onToggle={() => setMusicPlaying(!musicPlaying)} theme={theme} />
      </div>

      {/* ─── Bismillah Banner (shown only if enabled) ─── */}
      {flowData?.showBismillah !== false && (
        <m.div
          initial={{ borderColor: 'rgba(0,0,0,0)' }}
          animate={doorsOpened ? { borderColor: getOpacityStyle('border', 0.15) } : { borderColor: 'rgba(0,0,0,0)' }}
          transition={{ delay: 2.2, duration: 1.0 }}
          className="relative flex flex-col items-center justify-center py-10 px-6 overflow-hidden border-b"
        >
          {/* Ambient background glow */}
          <m.div 
            initial={{ opacity: 0 }}
            animate={doorsOpened ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 2.2, duration: 1.0 }}
            className="absolute inset-0 pointer-events-none" 
            style={{
              background: `radial-gradient(ellipse at 50% 50%, ${getOpacityStyle('bg', 0.07)} 0%, transparent 70%)`
            }} 
          />
          {/* Top ornamental line */}
          <m.div
            initial={{ opacity: 0 }}
            animate={doorsOpened ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 2.2, duration: 1.0 }}
            className="flex items-center gap-4 w-full max-w-sm mb-5"
          >
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${getOpacityStyle('text', 0.5)})` }} />
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <polygon points="11,1 13.5,8.5 21,8.5 15,13.5 17,21 11,16.5 5,21 7,13.5 1,8.5 8.5,8.5" 
                stroke={theme.accent} strokeWidth="0.8" fill="none" opacity="0.7" />
            </svg>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${getOpacityStyle('text', 0.5)})` }} />
          </m.div>

          {/* Calligraphy & Translation Wrapper */}
          <m.div
            initial={{ opacity: 0, y: '38vh', scale: 1.2 }}
            animate={doorsOpened ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: '38vh', scale: 1.2 }}
            transition={{
              opacity: { duration: 1.0, delay: 0.2 },
              y: { duration: 1.5, delay: 1.2, ease: [0.25, 1, 0.5, 1] },
              scale: { duration: 1.5, delay: 1.2, ease: [0.25, 1, 0.5, 1] },
            }}
            className="flex flex-col items-center justify-center z-10"
          >
            {/* Bismillah calligraphy */}
            <p className="font-arabic bismillah-glow text-3xl sm:text-4xl md:text-5xl text-center leading-loose"
              dir="rtl"
              style={{ color: theme.accent }}
            >
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </p>

            {/* Translation */}
            <p className="mt-3 text-xs sm:text-sm tracking-[0.25em] uppercase text-center"
              style={{ color: getOpacityStyle('text', 0.45) }}
            >
              In the name of Allah, the Most Gracious, the Most Merciful
            </p>
          </m.div>

          {/* Bottom ornamental line */}
          <m.div
            initial={{ opacity: 0 }}
            animate={doorsOpened ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 2.2, duration: 1.0 }}
            className="flex items-center gap-4 w-full max-w-sm mt-5"
          >
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${getOpacityStyle('text', 0.5)})` }} />
            <div className="w-2 h-2 rotate-45" style={{ border: `1px solid ${getOpacityStyle('border', 0.6)}` }} />
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${getOpacityStyle('text', 0.5)})` }} />
          </m.div>
        </m.div>
      )}

      {/* ═══ Main Content ═══ */}
      <m.div
        initial={{ opacity: 0, scale: theme.id.includes('royal') ? 0.94 : 1, filter: theme.id.includes('royal') ? 'blur(6px)' : 'blur(0px)', y: theme.id.includes('royal') ? 20 : 0 }}
        animate={{
          opacity: heroVisible ? 1 : 0,
          scale: heroVisible ? 1 : (theme.id.includes('royal') ? 0.94 : 1),
          filter: heroVisible ? 'blur(0px)' : (theme.id.includes('royal') ? 'blur(6px)' : 'blur(0px)'),
          y: heroVisible ? 0 : (theme.id.includes('royal') ? 20 : 0),
        }}
        transition={{
          duration: theme.id.includes('royal') ? 2.2 : 1.5,
          ease: theme.id.includes('royal') ? [0.16, 1, 0.3, 1] : 'easeOut',
        }}
      >

        {/* ─── Hero Section ─── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0" style={{ backgroundColor: theme.bgPrimary }}>
            <div className="absolute inset-0" style={{ background: `radial-gradient(at 50% 40%, ${getOpacityStyle('bg', 0.06)}, transparent 60%)` }} />
          </div>
          {/* Corner ornaments */}
          <CornerOrnament position="tl" themeId={theme.id} accentColor={theme.accent} />
          <CornerOrnament position="tr" themeId={theme.id} accentColor={theme.accent} />
          <CornerOrnament position="bl" themeId={theme.id} accentColor={theme.accent} />
          <CornerOrnament position="br" themeId={theme.id} accentColor={theme.accent} />
          {/* Top gold line */}
          <div className="absolute top-16 md:top-20 left-1/2 -translate-x-1/2 w-64 md:w-80 z-10">
            {!(flowData?.hostBrideFamily || flowData?.hostGroomFamily) && (
              <GoldDivider themeId={theme.id} accentColor={theme.accent} />
            )}
          </div>

          <div className="relative z-10 max-w-4xl w-full px-4 text-center flex flex-col items-center justify-center">
            {/* Host Families / Parents (Optional Pakistani Feature) */}
            {(flowData?.hostBrideFamily || flowData?.hostGroomFamily) ? (
              <div
                className="ss-animate-in mb-8 flex flex-col items-center gap-1 w-full"
                style={{ animationDelay: '0.3s' }}
              >
                <div className="w-64 md:w-80 mb-6">
                  <GoldDivider themeId={theme.id} accentColor={theme.accent} />
                </div>
                {flowData.hostBrideFamily && (
                  <p className={`${theme.fontCalligraphy} text-lg sm:text-xl`} style={{ color: theme.textSecondary }}>
                    {translations.hostBrideFamily || flowData.hostBrideFamily} <span className="text-xs opacity-75">{flowData.hostBrideCity ? `(${language === 'ur' ? '' : 'from '}${translations.hostBrideCity || flowData.hostBrideCity.replace(/^from\s+/i, '')}${language === 'ur' ? '  ' : ''})` : ''}</span>
                  </p>
                )}
                {flowData.hostBrideFamily && flowData.hostGroomFamily && (
                  <span className="text-sm my-1" style={{ color: getOpacityStyle('text', 0.5) }}>&amp;</span>
                )}
                {flowData.hostGroomFamily && (
                  <p className={`${theme.fontCalligraphy} text-lg sm:text-xl`} style={{ color: theme.textSecondary }}>
                    {translations.hostGroomFamily || flowData.hostGroomFamily} <span className="text-xs opacity-75">{flowData.hostGroomCity ? `(${language === 'ur' ? '' : 'from '}${translations.hostGroomCity || flowData.hostGroomCity.replace(/^from\s+/i, '')}${language === 'ur' ? '  ' : ''})` : ''}</span>
                  </p>
                )}
                <p className={`mt-4 text-xs tracking-[0.2em] uppercase`} style={{ color: getOpacityStyle('text', 0.6) }}>
                  {language === 'ur' ? 'کی جانب سے شادی کی دعوت' : 'request the honour of your presence at the marriage of their children'}
                </p>
              </div>
            ) : (
              <p
                className={`ss-animate-in ${theme.fontCalligraphy} text-sm sm:text-base tracking-[0.4em] uppercase mb-8`}
                style={{ color: theme.textSecondary, animationDelay: '0.3s' }}
              >
                {t('gettingMarried', "We're getting married")}
              </p>
            )}

            <h1 className="sr-only">
              {translatedPartner1} and {translatedPartner2} Wedding Invitation
            </h1>

            <div
              role="heading"
              aria-level={2}
              className={`ss-animate-in ${theme.fontDisplay} text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-[0.08em] mb-2`}
              style={{ color: theme.textPrimary, animationDelay: '0.5s' }}
            >
              {translatedPartner1}
            </div>

            <div
              className="ss-scale-in-x flex items-center justify-center gap-6 my-5"
              style={{ animationDelay: '0.7s' }}
            >
              <div className="w-20 h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.accentDark})` }} />
              <div className="w-3 h-3 rotate-45 border" style={{ borderColor: theme.accentDark }} />
              <div className="w-20 h-px" style={{ background: `linear-gradient(270deg, transparent, ${theme.accentDark})` }} />
            </div>

            <div
              role="heading"
              aria-level={2}
              className={`ss-animate-in ${theme.fontDisplay} text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-[0.08em] mb-8`}
              style={{ color: theme.textPrimary, animationDelay: '0.9s' }}
            >
              {translatedPartner2}
            </div>

            <div
              className="ss-animate-in flex items-center justify-center gap-3 mb-6"
              style={{ animationDelay: '1.2s' }}
            >
              <div className="w-8 h-px" style={{ background: theme.textMuted }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accentDark }} />
              <div className="w-8 h-px" style={{ background: theme.textMuted }} />
            </div>

            <p
              className={`ss-animate-in ${theme.fontCalligraphy} text-base sm:text-lg tracking-[0.15em]`}
              style={{ color: theme.textSecondary, animationDelay: '1.4s' }}
            >
              {!(flowData?.hostBrideFamily || flowData?.hostGroomFamily) && t('requestHonour', 'Request the honour of your presence')}
            </p>
          </div>

          {/* Bottom gold line */}
          <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 w-64 md:w-80 z-10">
            <GoldDivider themeId={theme.id} accentColor={theme.accent} />
          </div>

          {/* Scroll indicator */}
          <div className="ss-animate-in absolute bottom-8 flex flex-col items-center gap-2" style={{ animationDelay: '2.5s' }}>
            <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>{t('scroll', 'Scroll')}</span>
            <div className="animate-bounce">
              <ChevronDown className="w-4 h-4" style={{ color: theme.textMuted }} />
            </div>
          </div>
        </section>

        {/* ─── Message / Quote Section ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="max-w-lg mx-auto text-center">
              {guestNameFromUrl && (
                <m.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col items-center gap-4 mb-8">
                  <h3 className={`${theme.fontDisplay} text-3xl md:text-4xl capitalize`} style={{ color: theme.accent }}>
                    {language === 'ur' ? 'محترم' : 'Dear'} {translatedGuestName},
                  </h3>
                  {flowData?.guestSeats != null && (
                    <m.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.15 }}
                      className="flex items-center gap-2 px-5 py-2 rounded-full border"
                      style={{ borderColor: getOpacityStyle('border', 0.3), backgroundColor: getOpacityStyle('bg', 0.1) }}
                    >
                      <User className="w-4 h-4 shrink-0" style={{ color: theme.accent }} />
                      <span className={`${theme.fontDisplay} text-sm font-semibold tracking-wide`} style={{ color: theme.accentLight }}>
                        {flowData.guestSeats === 0
                          ? (language === 'ur' ? 'پوری فیملی مدعو' : 'Whole Family Invited')
                          : flowData.guestSeats === 1
                          ? (language === 'ur' ? '۱ مہمان مدعو' : '1 Person Invited')
                          : (language === 'ur' ? `${flowData.guestSeats} مہمان مدعو` : `${flowData.guestSeats} Persons Invited`)}
                      </span>
                    </m.div>
                  )}
                </m.div>
              )}
              <WaveDivider accentColor={theme.accent} />
              <p className={`${theme.fontCalligraphy} text-xl md:text-2xl leading-relaxed italic whitespace-pre-wrap break-words my-8`} style={{ color: theme.accentLight, textShadow: `0 0 15px ${getOpacityStyle('text', 0.2)}` }}>
                {translatedWelcomeMsg}
              </p>
              <WaveDivider accentColor={theme.accent} />
            </div>
          </section>
        </RevealSection>

        {/* ─── Scratch to Reveal ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <ScratchCard
              revealed={scratchRevealed}
              onReveal={handleScratchReveal}
              theme={theme}
              language={language}
              translations={translations}
              scratchDateInfo={scratchDateInfo}
              scratchTimeFormatted={scratchTimeFormatted}
            />
          </section>
        </RevealSection>

        {/* ─── Quranic / Custom Verse ─── */}
        {flowData?.showQuranVerse && (
          <RevealSection>
            <section className="py-16 md:py-20 px-6">
              <div 
                className="max-w-2xl mx-auto text-center space-y-6 md:space-y-8 py-10 px-6 md:px-10 rounded-2xl border relative overflow-hidden transition-all duration-500 shadow-xl"
                style={{ 
                  borderColor: getOpacityStyle('border', 0.15), 
                  backgroundColor: getOpacityStyle('bg', 0.3) || 'rgba(0,0,0,0.15)',
                  boxShadow: `0 10px 30px -10px ${getOpacityStyle('border', 0.1)}`
                }}
              >
                {/* Decorative flourish */}
                <div className="flex justify-center items-center gap-4 mb-2">
                  <div className="w-8 h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent})` }} />
                  {flowData?.showBismillah !== false && (!flowData?.customVerseText || /quran|surah|ayah|ayat|القرآن|سورة/i.test(flowData?.customVerseSource || '') || /[\u0600-\u06FF]/.test(flowData?.customVerseText || '')) ? (
                    <span className="text-gold opacity-80 text-2xl font-arabic">﷽</span>
                  ) : (
                    <span className="text-gold opacity-80 text-base tracking-widest font-serif">✦</span>
                  )}
                  <div className="w-8 h-px" style={{ background: `linear-gradient(-90deg, transparent, ${theme.accent})` }} />
                </div>

                {flowData?.customVerseText ? (
                  /* Custom verse entered by the user */
                  <>
                    <p 
                      className="text-xl md:text-2xl leading-loose px-2 font-medium"
                      dir="auto"
                      style={{ color: theme.accentLight || '#d4af37' }}
                    >
                      {flowData.customVerseText}
                    </p>

                    <div className="flex justify-center items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getOpacityStyle('border', 0.3) }} />
                      <div className="w-16 h-px" style={{ backgroundColor: getOpacityStyle('border', 0.2) }} />
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getOpacityStyle('border', 0.3) }} />
                    </div>

                    {flowData.customVerseSource && (
                      <p 
                        className="text-sm md:text-base italic leading-relaxed max-w-xl mx-auto px-4"
                        style={{ color: theme.textSecondary || 'rgba(255,255,255,0.8)' }}
                      >
                        <span className="block text-xs font-semibold not-italic" style={{ color: theme.accent }}>— {flowData.customVerseSource}</span>
                      </p>
                    )}
                  </>
                ) : (
                  /* Default Quran verse — Surah Ar-Rum 30:21 */
                  <>
                    <p 
                      className="font-arabic text-2xl md:text-3xl leading-loose text-gold px-2" 
                      dir="rtl"
                      style={{ color: theme.accentLight || '#d4af37' }}
                    >
                      وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً
                    </p>

                    <div className="flex justify-center items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getOpacityStyle('border', 0.3) }} />
                      <div className="w-16 h-px" style={{ backgroundColor: getOpacityStyle('border', 0.2) }} />
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getOpacityStyle('border', 0.3) }} />
                    </div>

                    <p 
                      className="text-sm md:text-base italic leading-relaxed max-w-xl mx-auto px-4"
                      style={{ color: theme.textSecondary || 'rgba(255,255,255,0.8)' }}
                    >
                      &ldquo;And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy.&rdquo;
                      <span className="block text-xs mt-2 font-semibold not-italic" style={{ color: theme.accent }}>— Surah Ar-Rum [30:21]</span>
                    </p>

                    <div className="flex justify-center items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getOpacityStyle('border', 0.3) }} />
                      <div className="w-16 h-px" style={{ backgroundColor: getOpacityStyle('border', 0.2) }} />
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getOpacityStyle('border', 0.3) }} />
                    </div>

                    <p 
                      className="font-arabic text-lg md:text-xl leading-loose max-w-xl mx-auto px-4" 
                      dir="rtl"
                      style={{ color: theme.textPrimary || '#ffffff' }}
                    >
                      &ldquo;اور اس کی نشانیوں میں سے ہے کہ اس نے تمہارے لیے تمہاری ہی جنس سے جوڑے پیدا کیے تاکہ تم ان سے آرام پاؤ اور اس نے تمہارے درمیان محبت اور رحمت پیدا کر دی&rdquo;
                      <span className="block text-xs mt-2 font-sans not-italic opacity-85" style={{ color: theme.accent }}>— سورہ روم [30:21]</span>
                    </p>
                  </>
                )}
              </div>
            </section>
          </RevealSection>
        )}

        {/* ─── Photo Gallery ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-6">
              <h2 className={`${theme.fontCalligraphy} text-3xl sm:text-4xl text-center`} style={{ color: theme.accent }}>{t('ourMoments', 'Our Moments')}</h2>
              <HeartDivider themeId={theme.id} accentColor={theme.accent} />
              <PhotoGallery theme={theme} images={flowData?.slideshowImages} />
            </div>
          </section>
        </RevealSection>

          {/* 🎥 Video Section (Royal Plan / Video Feature) 🎥 */}
          {youtubeVideoId && (flowData?.selectedPlan === 'royal' || theme.id.includes('royal') || theme.id === 'geometric-gold' || theme.id === 'dark-velvet') && (
            <RevealSection>
              <section className="py-16 md:py-20 px-6">
                <div className="flex flex-col items-center gap-6">
                  <h2 className={`${theme.fontCalligraphy} text-3xl sm:text-4xl text-center`} style={{ color: theme.accent }}>{t('Our Story', 'Our Story')}</h2>
                  <HeartDivider themeId={theme.id} accentColor={theme.accent} />
                  <div className="w-full max-w-3xl mx-auto">
                    <div 
                      className="relative overflow-hidden rounded-xl aspect-video shadow-lg"
                      style={{ border: `1px solid ${getOpacityStyle('border', 0.2)}`, boxShadow: `0 10px 15px -3px ${getOpacityStyle('border', 0.05)}` }}
                    >
                      <iframe 
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`} 
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                </div>
              </section>
            </RevealSection>
          )}


        {/* ─── Countdown Timer ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-8">
              <h2 className={`${theme.fontCalligraphy} text-3xl sm:text-4xl text-center`} style={{ color: theme.accent }}>{t('countingDown', 'Counting Down to Forever')}</h2>
              <HeartDivider themeId={theme.id} accentColor={theme.accent} />
              <CountdownTimer 
                theme={theme} 
                translations={language === 'ur' ? translations : undefined} 
                targetDate={firstEvent?.date}
                targetTime={firstEvent?.time}
              />
            </div>
          </section>
        </RevealSection>

        {/* ─── Event Timeline ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
              <h2 className={`${theme.fontCalligraphy} text-3xl sm:text-4xl text-center`} style={{ color: theme.accent }}>{t('programTimeline', 'Program Timeline')}</h2>
              <HeartDivider themeId={theme.id} accentColor={theme.accent} />

              <div className="relative w-full">
                <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: `linear-gradient(to bottom, ${getOpacityStyle('text', 0.4)}, ${getOpacityStyle('text', 0.2)}, ${getOpacityStyle('text', 0.4)})` }} />
                <div className="flex flex-col gap-8">
                  {events.map((event, idx) => {
                    const te = getTranslatedEvent(event, idx)
                    return (
                    <RevealSection key={event.id || `${event.name}-${idx}`} delay={idx * 0.12}>
                      <div className="flex gap-5 items-start">
                        <div className="relative z-10 flex-shrink-0">
                          <div className="w-[10px] h-[10px] rounded-full mt-1.5" style={{ backgroundColor: theme.accent, boxShadow: `0 0 8px ${getOpacityStyle('border', 0.5)}` }} />
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-3.5 h-3.5" style={{ color: getOpacityStyle('text', 0.5) }} />
                            <span className="text-xs" style={{ color: getOpacityStyle('text', 0.5) }}>{te.date}</span>
                            <Clock className="w-3.5 h-3.5 ml-2" style={{ color: getOpacityStyle('text', 0.5) }} />
                            <span className="text-xs" style={{ color: getOpacityStyle('text', 0.5) }}>{te.time}</span>
                          </div>
                          <h3 className={`${theme.fontDisplay} text-xl font-semibold mb-1`} style={{ color: theme.accent }}>{te.name}</h3>
                          <p className="text-sm leading-relaxed mb-3" style={{ color: getOpacityStyle('text', 0.5) }}>{te.description}</p>
                          
                          {/* Nikah Registration Note (Optional Pakistani Feature) */}
                          {flowData?.showNikahRegistration && (event.name.toLowerCase().includes('nikkah') || event.name.toLowerCase().includes('nikah') || te.name.includes('نکاح')) && (
                            <div className="mb-4 flex w-fit items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm" style={{ backgroundColor: getOpacityStyle('bg', 0.08), borderColor: theme.accent }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: theme.accent }}><path d="M20 19.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L18 5.5"/><path d="m15 5 3 3"/><path d="m19 9-8 8-4 1 1-4 8-8Z"/></svg>
                              <span className="text-xs font-semibold tracking-wide" style={{ color: theme.accent }}>{language === 'ur' ? 'نکاح کی باقاعدہ رجسٹریشن کی جائے گی' : 'Nikah will be formally registered'}</span>
                            </div>
                          )}

                          <AddToCalendarDropdown
                            event={event}
                            partner1={partner1}
                            partner2={partner2}
                            theme={theme}
                            label={t('addToCalendar', 'Add to Calendar')}
                            location={[(event as {venue?: string}).venue, venueName, rawVenueAddress].filter(Boolean).join(', ')}
                          />
                        </div>
                      </div>
                    </RevealSection>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ─── Dress Code Section ─── */}
        {(dressCodeWomen || dressCodeMen) && (flowData?.selectedPlan === 'royal' || theme.isRoyal) && (
          <RevealSection>
            <section className="py-16 md:py-20 px-6">
              <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
                <h2 className={`${theme.fontCalligraphy} text-3xl sm:text-4xl text-center`} style={{ color: theme.accent }}>{t('dressCode', 'Dress Code')}</h2>
                <HeartDivider themeId={theme.id} accentColor={theme.accent} />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                  {/* Women's Dress Code */}
                  {dressCodeWomen && (
                    <div className="flex flex-col items-center p-5 rounded-xl border text-center backdrop-blur-sm" style={{ backgroundColor: getOpacityStyle('text', 0.03), borderColor: theme.borderSubtle }}>
                      <span className={`text-xs tracking-wider uppercase mb-1 ${theme.fontDisplay}`} style={{ color: getOpacityStyle('text', 0.5) }}>{t('ladies', 'Ladies')}</span>
                      <p className="text-sm font-semibold mb-4 leading-relaxed" style={{ color: theme.textPrimary }}>{translatedDressCodeWomen}</p>
                      
                      {extractColors(dressCodeWomen).length > 0 && (
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-[10px] uppercase tracking-wider" style={{ color: getOpacityStyle('text', 0.4) }}>{t('recommendedColors', 'Themes')}</span>
                          <div className="flex gap-2.5 justify-center flex-wrap">
                            {extractColors(dressCodeWomen).map((color, i) => (
                              <div key={i} className="flex flex-col items-center gap-1">
                                <div 
                                  className="w-6 h-6 rounded-full border shadow-sm cursor-help hover:scale-105 transition-transform" 
                                  style={{ backgroundColor: color.hex, borderColor: getOpacityStyle('border', 0.3) }} 
                                  title={color.name}
                                />
                                <span className="text-[9px]" style={{ color: getOpacityStyle('text', 0.45) }}>{color.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Men's Dress Code */}
                  {dressCodeMen && (
                    <div className="flex flex-col items-center p-5 rounded-xl border text-center backdrop-blur-sm" style={{ backgroundColor: getOpacityStyle('text', 0.03), borderColor: theme.borderSubtle }}>
                      <span className={`text-xs tracking-wider uppercase mb-1 ${theme.fontDisplay}`} style={{ color: getOpacityStyle('text', 0.5) }}>{t('gentlemen', 'Gentlemen')}</span>
                      <p className="text-sm font-semibold mb-4 leading-relaxed" style={{ color: theme.textPrimary }}>{translatedDressCodeMen}</p>
                      
                      {extractColors(dressCodeMen).length > 0 && (
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-[10px] uppercase tracking-wider" style={{ color: getOpacityStyle('text', 0.4) }}>{t('recommendedColors', 'Themes')}</span>
                          <div className="flex gap-2.5 justify-center flex-wrap">
                            {extractColors(dressCodeMen).map((color, i) => (
                              <div key={i} className="flex flex-col items-center gap-1">
                                <div 
                                  className="w-6 h-6 rounded-full border shadow-sm cursor-help hover:scale-105 transition-transform" 
                                  style={{ backgroundColor: color.hex, borderColor: getOpacityStyle('border', 0.3) }} 
                                  title={color.name}
                                />
                                <span className="text-[9px]" style={{ color: getOpacityStyle('text', 0.45) }}>{color.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </RevealSection>
        )}

        {/* ─── Travel & Accommodations Section ─── */}
        {(accommodation || transportation) && (flowData?.selectedPlan === 'royal' || theme.isRoyal) && (
          <RevealSection>
            <section className="py-16 md:py-20 px-6">
              <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
                <h2 className={`${theme.fontCalligraphy} text-3xl sm:text-4xl text-center`} style={{ color: theme.accent }}>{t('travelAccommodations', 'Travel & Accommodations')}</h2>
                <HeartDivider themeId={theme.id} accentColor={theme.accent} />
                
                <div className="flex flex-col gap-5 w-full">
                  {/* Hotel Blocks / Accommodation */}
                  {accommodation && (
                    <Card className="backdrop-blur-sm w-full" style={{ backgroundColor: getOpacityStyle('bg', 0.03), borderColor: theme.borderSubtle }}>
                      <CardContent className="flex gap-4 p-5 items-start">
                        <div className="w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0" style={{ backgroundColor: getOpacityStyle('bg', 0.05), borderColor: theme.borderSubtle }}>
                          <Hotel className="w-5 h-5" style={{ color: theme.accent }} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`${theme.fontDisplay} text-base font-semibold mb-1`} style={{ color: theme.accent }}>{t('hotelBlocks', 'Hotel Accommodations')}</h3>
                          <p className="text-sm leading-relaxed" style={{ color: getOpacityStyle('text', 0.75) }}>{translatedAccommodation}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Travel / Transportation */}
                  {transportation && (
                    <Card className="backdrop-blur-sm w-full" style={{ backgroundColor: getOpacityStyle('bg', 0.03), borderColor: theme.borderSubtle }}>
                      <CardContent className="flex gap-4 p-5 items-start">
                        <div className="w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0" style={{ backgroundColor: getOpacityStyle('bg', 0.05), borderColor: theme.borderSubtle }}>
                          <Car className="w-5 h-5" style={{ color: theme.accent }} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`${theme.fontDisplay} text-base font-semibold mb-1`} style={{ color: theme.accent }}>{t('transportationInfo', 'Transportation Info')}</h3>
                          <p className="text-sm leading-relaxed" style={{ color: getOpacityStyle('text', 0.75) }}>{translatedTransportation}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </section>
          </RevealSection>
        )}

        {/* ─── Venue ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
              <h2 className={`${theme.fontCalligraphy} text-3xl sm:text-4xl text-center flex items-center gap-3`} style={{ color: theme.accent }}>
                <MapPin className="w-7 h-7" style={{ color: getOpacityStyle('text', 0.7) }} />
                {t('venue', 'Venue')}
              </h2>
              <HeartDivider themeId={theme.id} accentColor={theme.accent} />

              <div className="text-center space-y-2">
                <h3 className={`${theme.fontDisplay} text-2xl`} style={{ color: theme.accent }}>{translatedVenueName}</h3>
                <p className="text-sm" style={{ color: getOpacityStyle('text', 0.6) }}>{translatedVenueAddress}</p>
                
                {/* Purdah / Segregation Note (Optional Pakistani Feature) */}
                {flowData?.isSegregated && (
                  <div className="mt-4 p-3 rounded-lg border mx-auto max-w-sm" style={{ backgroundColor: getOpacityStyle('bg', 0.05), borderColor: theme.borderSubtle }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: theme.accent }}>
                      {language === 'ur' ? 'خواتین اور حضرات کے لیے پردے کا الگ انتظام ہے' : 'Strict Purdah / Separate setup for Ladies and Gents'}
                    </p>
                    {flowData.venueDetailsSegregated && (
                      <p className="text-xs" style={{ color: getOpacityStyle('text', 0.7) }}>
                        {flowData.venueDetailsSegregated}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Real Map Embed */}
              <div 
                className="w-full rounded-2xl overflow-hidden shadow-lg border mt-2 mb-4 transition-all duration-300"
                style={{ 
                  borderColor: theme.borderSubtle,
                  boxShadow: `0 10px 25px -5px rgba(${theme.accentRgb}, 0.1), 0 8px 10px -6px rgba(${theme.accentRgb}, 0.1)`
                }}
              >
                <iframe
                  title="Venue Location Map"
                  width="100%"
                  height="220"
                  style={{ border: 0, filter: theme.isLight ? 'none' : 'invert(90%) hue-rotate(180deg) grayscale(10%)' }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <Button
                asChild
                className={`border rounded-lg px-6 py-2.5 h-auto ${theme.fontDisplay} transition-all duration-300`}
                style={{ backgroundColor: getOpacityStyle('bg', 0.1), borderColor: theme.borderSubtle, color: theme.accent }}
                variant="outline"
              >
                <a href={googleMapsUrl ? googleMapsUrl : `https://maps.google.com/?q=${encodeURIComponent(venueAddress)}`} target="_blank" rel="noopener noreferrer">
                  <MapPin className="w-4 h-4 mr-2" />
                  {t('viewOnMaps', 'View on Google Maps')}
                </a>
              </Button>
            </div>
          </section>
        </RevealSection>

        {/* ─── Gift Registry & Shagun Section ─── */}
        {gifts && !flowData?.hideDigitalShagun && (flowData?.selectedPlan === 'royal' || theme.isRoyal) && (
          <RevealSection>
            <section className="py-16 md:py-20 px-6">
              <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
                <h2 className={`${theme.fontCalligraphy} text-3xl sm:text-4xl text-center`} style={{ color: theme.accent }}>{t('giftsShagun', 'Digital Shagun & Registry')}</h2>
                <HeartDivider themeId={theme.id} accentColor={theme.accent} />
                
                <div className="w-full flex flex-col gap-6">
                  {/* General message */}
                  <div className="text-center p-4 border rounded-xl backdrop-blur-sm" style={{ backgroundColor: getOpacityStyle('bg', 0.02), borderColor: theme.borderSubtle }}>
                    <Gift className="w-6 h-6 mx-auto mb-2" style={{ color: theme.accent }} />
                    <p className="text-sm leading-relaxed" style={{ color: getOpacityStyle('text', 0.8) }}>{translatedGifts}</p>
                  </div>

                  {/* Parsed Banking Cards */}
                  {(() => {
                    const parsed = parseGiftDetails(gifts);
                    if (!parsed) return null;

                    return (
                      <div className="flex flex-col gap-4">
                        <span className={`text-xs uppercase tracking-wider text-center ${theme.fontDisplay}`} style={{ color: getOpacityStyle('text', 0.5) }}>{t('shagunDetails', 'Quick Copy details')}</span>
                        
                        {/* Bank Card */}
                        {(parsed.accountNumber || parsed.iban) && (
                          <div className="relative p-5 rounded-2xl border backdrop-blur-md overflow-hidden" style={{ 
                            background: `linear-gradient(135deg, ${getOpacityStyle('bg', 0.06)} 0%, ${getOpacityStyle('bg', 0.02)} 100%)`, 
                            borderColor: theme.borderSubtle,
                            boxShadow: `0 8px 32px 0 rgba(0,0,0,0.37)`
                          }}>
                            {/* Chip & Logo Decoration */}
                            <div className="flex justify-between items-start mb-6">
                              {/* Sim card chip */}
                              <div className="w-9 h-7 rounded bg-amber-500/20 border border-amber-500/30 relative">
                                <div className="absolute inset-x-2.5 top-0 bottom-0 border-l border-r border-amber-500/30" />
                                <div className="absolute inset-y-2.5 left-0 right-0 border-t border-b border-amber-500/30" />
                              </div>
                              <span className="text-xs font-bold tracking-widest" style={{ color: theme.accent }}>{parsed.bankName || 'BANK'}</span>
                            </div>

                            <div className="space-y-4">
                              {/* Account Title */}
                              {parsed.accountTitle && (
                                <div>
                                  <span className="text-[10px] uppercase tracking-wider block" style={{ color: getOpacityStyle('text', 0.45) }}>Account Title</span>
                                  <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>{parsed.accountTitle}</span>
                                </div>
                              )}

                              {/* Account Number */}
                              {parsed.accountNumber && (
                                <div className="flex justify-between items-center">
                                  <div>
                                    <span className="text-[10px] uppercase tracking-wider block" style={{ color: getOpacityStyle('text', 0.45) }}>Account Number</span>
                                    <span className="text-base font-mono tracking-wider" style={{ color: theme.textPrimary }}>{parsed.accountNumber}</span>
                                  </div>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleCopy(parsed.accountNumber!, 'Account Number')}
                                    className="h-8 w-8 hover:bg-white/5"
                                    style={{ color: theme.accent }}
                                  >
                                    {copiedField === 'Account Number' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                  </Button>
                                </div>
                              )}

                              {/* IBAN */}
                              {parsed.iban && (
                                <div className="flex justify-between items-center border-t pt-3" style={{ borderColor: getOpacityStyle('border', 0.1) }}>
                                  <div className="min-w-0 flex-1">
                                    <span className="text-[10px] uppercase tracking-wider block" style={{ color: getOpacityStyle('text', 0.45) }}>IBAN</span>
                                    <span className="text-xs font-mono tracking-wider block truncate" style={{ color: theme.textPrimary }}>{parsed.iban}</span>
                                  </div>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleCopy(parsed.iban!, 'IBAN')}
                                    className="h-8 w-8 hover:bg-white/5 ml-2"
                                    style={{ color: theme.accent }}
                                  >
                                    {copiedField === 'IBAN' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Raast / EasyPaisa / JazzCash Mobile Wallets */}
                        {(parsed.raastId || parsed.easyPaisa || parsed.jazzCash) && (
                          <div className="grid grid-cols-1 gap-3">
                            {/* Raast ID Card */}
                            {parsed.raastId && (
                              <div className="flex justify-between items-center p-4 rounded-xl border backdrop-blur-sm" style={{ backgroundColor: getOpacityStyle('bg', 0.03), borderColor: theme.borderSubtle }}>
                                <div className="flex gap-3 items-center">
                                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center font-bold text-xs" style={{ color: '#f97316' }}>R</div>
                                  <div>
                                    <span className="text-[9px] uppercase tracking-wider block" style={{ color: getOpacityStyle('text', 0.45) }}>Raast ID</span>
                                    <span className="text-sm font-mono" style={{ color: theme.textPrimary }}>{parsed.raastId}</span>
                                  </div>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleCopy(parsed.raastId!, 'Raast ID')}
                                  className="h-8 w-8 hover:bg-white/5"
                                  style={{ color: theme.accent }}
                                >
                                  {copiedField === 'Raast ID' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                              </div>
                            )}

                            {/* EasyPaisa Card */}
                            {parsed.easyPaisa && (
                              <div className="flex justify-between items-center p-4 rounded-xl border backdrop-blur-sm" style={{ backgroundColor: getOpacityStyle('bg', 0.03), borderColor: theme.borderSubtle }}>
                                <div className="flex gap-3 items-center">
                                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center font-bold text-xs" style={{ color: '#22c55e' }}>EP</div>
                                  <div>
                                    <span className="text-[9px] uppercase tracking-wider block" style={{ color: getOpacityStyle('text', 0.45) }}>EasyPaisa</span>
                                    <span className="text-sm font-mono" style={{ color: theme.textPrimary }}>{parsed.easyPaisa}</span>
                                  </div>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleCopy(parsed.easyPaisa!, 'EasyPaisa')}
                                  className="h-8 w-8 hover:bg-white/5"
                                  style={{ color: theme.accent }}
                                >
                                  {copiedField === 'EasyPaisa' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                              </div>
                            )}

                            {/* JazzCash Card */}
                            {parsed.jazzCash && (
                              <div className="flex justify-between items-center p-4 rounded-xl border backdrop-blur-sm" style={{ backgroundColor: getOpacityStyle('bg', 0.03), borderColor: theme.borderSubtle }}>
                                <div className="flex gap-3 items-center">
                                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center font-bold text-xs" style={{ color: '#eab308' }}>JC</div>
                                  <div>
                                    <span className="text-[9px] uppercase tracking-wider block" style={{ color: getOpacityStyle('text', 0.45) }}>JazzCash</span>
                                    <span className="text-sm font-mono" style={{ color: theme.textPrimary }}>{parsed.jazzCash}</span>
                                  </div>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleCopy(parsed.jazzCash!, 'JazzCash')}
                                  className="h-8 w-8 hover:bg-white/5"
                                  style={{ color: theme.accent }}
                                >
                                  {copiedField === 'JazzCash' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </section>
          </RevealSection>
        )}

        {/* ─── Frequently Asked Questions Section ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
              <h2 className={`${theme.fontCalligraphy} text-3xl sm:text-4xl text-center`} style={{ color: theme.accent }}>{t('faq', 'Frequently Asked Questions')}</h2>
              <HeartDivider themeId={theme.id} accentColor={theme.accent} />
              
              <div className="w-full flex flex-col gap-4">
                {[
                  {
                    q_en: 'Can I bring my family?',
                    q_ur: 'کیا میں اپنے گھر والوں کو بھی ساتھ لا سکتا ہوں؟',
                    a_en: 'Please refer to your invitation card or contact the hosts directly. Seating is specifically reserved.',
                    a_ur: 'مہربانی فرما کر اپنے دعوتی کارڈ پر دیکھیں یا میزبانوں سے رابطہ کریں۔ نشستیں مخصوص کی گئی ہیں۔',
                  },
                  {
                    q_en: 'What time should I arrive?',
                    q_ur: 'مجھے کس وقت پہنچنا چاہیے؟',
                    a_en: 'We suggest arriving 15-30 minutes before the scheduled event time to settle in comfortably.',
                    a_ur: 'ہم مشورہ دیتے ہیں کہ تقریب شروع ہونے سے 15-30 منٹ پہلے پہنچیں تاکہ آسانی سے بیٹھ سکیں۔',
                  },
                  {
                    q_en: 'Is parking available at the venue?',
                    q_ur: 'کیا ہال پر پارکنگ کی سہولت دستیاب ہے؟',
                    a_en: 'Yes, valet parking is available at the venue for all guests.',
                    a_ur: 'جی ہاں، تمام مہمانوں کے لیے ہال پر ویلے پارکنگ کی سہولت دستیاب ہے۔',
                  },
                  {
                    q_en: 'Who can I contact for queries?',
                    q_ur: 'کسی بھی سوال کے لیے میں کس سے رابطہ کروں؟',
                    a_en: flowData?.contactPhone ? `Please contact the hosts at ${flowData.contactPhone}.` : 'Please refer to the Travel Coordinator details listed in the Travel section or contact the hosts.',
                    a_ur: flowData?.contactPhone ? `برائے مہربانی میزبانوں سے اس نمبر پر رابطہ کریں: ${flowData.contactPhone}` : 'برائے مہربانی سفر کے سیکشن میں درج کوآرڈینیٹر کی تفصیلات دیکھیں یا میزبانوں سے رابطہ کریں۔',
                  }
                ].map((item, idx) => {
                  const isExpanded = !!faqOpen[idx];
                  const question = language === 'ur' ? item.q_ur : item.q_en;
                  const answer = language === 'ur' ? item.a_ur : item.a_en;
                  
                  return (
                    <div 
                      key={idx}
                      className="border rounded-xl overflow-hidden transition-all duration-300"
                      style={{ backgroundColor: getOpacityStyle('bg', 0.02), borderColor: theme.borderSubtle }}
                    >
                      <button
                        onClick={() => setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }))}
                        className={`w-full flex justify-between items-center p-4 text-left ${theme.fontDisplay} text-sm font-semibold transition-all duration-300`}
                        style={{ color: theme.accent, textAlign: language === 'ur' ? 'right' : 'left' }}
                      >
                        <span className="flex-1 pr-4">{question}</span>
                        <ChevronDown 
                          className="w-4 h-4 flex-shrink-0 transition-transform duration-300" 
                          style={{ 
                            color: getOpacityStyle('text', 0.5),
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                          }} 
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <m.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="p-4 pt-0 border-t text-sm leading-relaxed" style={{ borderColor: getOpacityStyle('text', 0.1), color: getOpacityStyle('text', 0.8) }}>
                              {answer}
                            </div>
                          </m.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ─── RSVP ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
              <h2 className={`${theme.fontCalligraphy} text-3xl sm:text-4xl text-center`} style={{ color: theme.accent }}>{t('willYouAttend', 'Will You Attend?')}</h2>
              <HeartDivider themeId={theme.id} accentColor={theme.accent} />

              {/* Guest seat count badge */}
              {guestNameFromUrl && flowData?.guestSeats != null && (
                <m.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border"
                  style={{ borderColor: getOpacityStyle('border', 0.25), backgroundColor: getOpacityStyle('bg', 0.07) }}
                >
                  <User className="w-4 h-4" style={{ color: theme.accent }} />
                  <span className={`${theme.fontDisplay} text-sm font-medium`} style={{ color: theme.accentLight }}>
                    {flowData.guestSeats === 0
                      ? (language === 'ur' ? `${translatedGuestName} — پوری فیملی مدعو` : `${translatedGuestName} — Whole Family Invited`)
                      : flowData.guestSeats === 1
                      ? `${translatedGuestName} — 1 Person Invited`
                      : `${translatedGuestName} — ${flowData.guestSeats} ${flowData.guestSeats === 1 ? 'Person' : 'Persons'} Invited`}
                  </span>
                </m.div>
              )}

              <div className="relative w-full">
                {/* Decorative corner borders */}
                <div className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: theme.borderSubtle }} />
                <div className="absolute -top-3 -right-3 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: theme.borderSubtle }} />
                <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: theme.borderSubtle }} />
                <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: theme.borderSubtle }} />

                {/* Floating hearts on RSVP accept */}
                {rsvpHearts.map((h, hIdx) => (<div key={`heart-${h}-${hIdx}`} className="absolute heart-float pointer-events-none" style={{ left: `${20 + ((h * 13) % 61)}%`, top: '40%', animationDelay: `${h * 0.15}s` }}>
                    <Heart className="w-5 h-5" style={{ color: theme.accent, fill: getOpacityStyle('text', 0.4) }} />
                  </div>
                ))}

                {!rsvpSubmitted ? (
                  <Card className="w-full backdrop-blur-sm" style={{ backgroundColor: theme.bgPrimary + 'cc', borderColor: theme.borderSubtle }}>
                    <CardContent className="flex flex-col gap-5 pt-6">
                      <div className="space-y-2">
                        <label className={`text-sm ${theme.fontDisplay}`} style={{ color: getOpacityStyle('text', 0.7) }}>{t('yourName', 'Your Name')}</label>
                        <Input
                          value={rsvpName}
                          onChange={(e) => setRsvpName(e.target.value)}
                          placeholder={t('enterName', 'Enter your full name')}
                          className="border transition-all duration-300"
                          style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle, color: theme.textPrimary }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={`text-sm ${theme.fontDisplay}`} style={{ color: getOpacityStyle('text', 0.7) }}>{t('email', 'Email')} <span style={{ color: getOpacityStyle('text', 0.3) }}>{t('emailOptional', '(optional)')}</span></label>
                        <Input
                          type="email"
                          value={rsvpEmail}
                          onChange={(e) => setRsvpEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="border transition-all duration-300"
                          style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle, color: theme.textPrimary }}
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button 
                          onClick={() => handleRSVP('accept')} 
                          className={`flex-1 text-white border rounded-lg h-11 ${theme.fontDisplay} green-glow transition-all duration-300 hover:scale-[1.02]`}
                          style={{ backgroundColor: theme.accent, borderColor: theme.accent }}
                        >
                          <Check className="w-4 h-4 mr-1.5" />
                          {t('joyfullyAccept', 'Joyfully Accept')}
                        </Button>
                        <Button 
                          onClick={() => handleRSVP('decline')} 
                          className={`flex-1 border rounded-lg h-11 ${theme.fontDisplay} transition-all duration-300`} 
                          style={{ backgroundColor: 'transparent', borderColor: theme.borderSubtle, color: getOpacityStyle('text', 0.7) }}
                          variant="outline"
                        >
                          <X className="w-4 h-4 mr-1.5" />
                          {t('respectfullyDecline', 'Respectfully Decline')}
                        </Button>
                      </div>
                      <p className="text-[10px] text-center mt-3" style={{ color: getOpacityStyle('text', 0.4) }}>
                        Your response is shared only with the host. See our <a href="/privacy" className="underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <m.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="text-center py-10">
                    <m.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 300 }} className="mb-4">
                      {rsvpStatus === 'accept' ? (
                        <div className="w-16 h-16 rounded-full border flex items-center justify-center mx-auto" style={{ backgroundColor: getOpacityStyle('border', 0.2), borderColor: getOpacityStyle('border', 0.4) }}>
                          <Check className="w-8 h-8" style={{ color: theme.accent }} />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full border flex items-center justify-center mx-auto" style={{ backgroundColor: getOpacityStyle('border', 0.1), borderColor: theme.borderSubtle }}>
                          <Heart className="w-8 h-8" style={{ color: theme.accent }} />
                        </div>
                      )}
                    </m.div>
                    <h3 className={`${theme.fontDisplay} text-xl mb-2`} style={{ color: theme.accent }}>
                      {rsvpStatus === 'accept' ? t('joyfullyAccepted', 'Joyfully Accepted!') : t('thankYou', 'Thank You!')}
                    </h3>
                    <p className="text-sm" style={{ color: getOpacityStyle('text', 0.6) }}>
                      {rsvpStatus === 'accept'
                        ? `We can't wait to celebrate with you, ${rsvpName}! 🎉`
                        : `We'll miss you, ${rsvpName}. You'll be in our hearts! 💌`}
                    </p>
                  </m.div>
                )}
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ─── Blessings & Wishes ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
              <h2 className={`${theme.fontCalligraphy} text-3xl sm:text-4xl text-center`} style={{ color: theme.accent }}>{t('blessingsWishes', 'Blessings & Wishes')}</h2>
              <HeartDivider themeId={theme.id} accentColor={theme.accent} />

              <div className="w-full space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {wishes.length === 0 ? (
                  <div className="text-center py-8 text-sm border border-dashed rounded-lg" style={{ backgroundColor: getOpacityStyle('bg', 0.02), borderColor: getOpacityStyle('border', 0.15), color: getOpacityStyle('text', 0.5) }}>
                    {language === 'ur' ? 'ابھی تک کوئی دعا نہیں بھیجی گئی، پہلا پیغام لکھیں!' : 'No blessings yet. Write the first blessing!'}
                  </div>
                ) : (
                  wishes.map((wish, idx) => {
                    const displayName = language === 'ur' && wish.translatedName ? wish.translatedName : wish.name
                    const displayMessage = language === 'ur' && wish.translatedMessage ? wish.translatedMessage : wish.message
                    return (
                      <m.div
                        key={`${wish.name}-${idx}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="border rounded-lg p-4"
                        style={{ backgroundColor: getOpacityStyle('bg', 0.05), borderColor: getOpacityStyle('border', 0.15) }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `linear-gradient(to bottom right, ${getOpacityStyle('bg', 0.1)}, ${getOpacityStyle('bg', 0.03)})`, borderColor: theme.borderSubtle }}>
                            <span className="text-xs font-bold" style={{ color: theme.accent }}>{displayName.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs ${theme.fontDisplay} mb-1`} style={{ color: getOpacityStyle('text', 0.7) }}>{displayName}</p>
                            <p className="text-sm leading-relaxed" style={{ color: getOpacityStyle('text', 0.8) }}>{displayMessage}</p>
                          </div>
                        </div>
                      </m.div>
                    )
                  })
                )}
              </div>

              <div className="w-full space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0" style={{ backgroundColor: getOpacityStyle('bg', 0.1), borderColor: theme.borderSubtle }}>
                    <User className="w-3.5 h-3.5" style={{ color: getOpacityStyle('text', 0.5) }} />
                  </div>
                  <Input
                    value={wishName}
                    onChange={(e) => setWishName(e.target.value)}
                    placeholder={t('yourNameSender', 'Your name (so they know who sent this)')}
                    className="border h-10 transition-all duration-300 flex-1"
                    style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle, color: theme.textPrimary }}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Textarea
                      value={wishMessage}
                      onChange={(e) => setWishMessage(e.target.value)}
                      placeholder={t('writeBlessing', 'Write your blessing or wish...')}
                      className="border min-h-[44px] resize-none transition-all duration-300 w-full"
                      style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle, color: theme.textPrimary }}
                      rows={2}
                    />
                  </div>
                  <Button onClick={handleSendWish} className={`border h-auto px-4 rounded-lg ${theme.fontDisplay} transition-all duration-300 flex-shrink-0 self-end`} style={{ backgroundColor: getOpacityStyle('bg', 0.2), borderColor: theme.borderSubtle, color: theme.accent }}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ─── Footer ─── */}
        <div className="py-10 text-center border-t" style={{ borderColor: getOpacityStyle('border', 0.1) }}>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-px" style={{ backgroundColor: getOpacityStyle('bg', 0.2) }} />
            <Heart className="w-3 h-3" style={{ color: getOpacityStyle('text', 0.3) }} />
            <div className="w-8 h-px" style={{ backgroundColor: getOpacityStyle('bg', 0.2) }} />
          </div>
          <p className="text-xs tracking-wider" style={{ color: getOpacityStyle('text', 0.4) }}>
            {t('madeWithLove', 'Made with love by ShaadiLink').split(/(ShaadiLink|شادی لنک)/i).map((part, i) => 
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

      {/* ═══ Inline SVG ClipPaths ─── */}
    </div>
  )
}


import { GoldDivider, HeartDivider, WaveDivider } from './ui/dividers';
import { CornerOrnament } from './ui/ornaments';
import { CenterButton } from './ui/buttons';
import { MusicToggle } from './ui/music-toggle';
import { BackgroundParticles } from './effects/particles';
import { FireworksDisplay } from './effects/fireworks';
import { ConfettiDisplay } from './effects/confetti';
import { GoldDustSplash } from './effects/gold-dust';
import { DoorOverlay } from './door/door-overlay';
import { DoorFrame, CurtainEdge, DomeCap, ArchwayCap, ScrollCap, LightLeak } from './door/door-frame';
import { DoorPanelLayout, DoorPanelInset, DoorPanelContent, DoorSurface } from './door/door-panels';
import { DoorHandle, DoorHinges } from './door/door-hardware';
import { DoorSvgPattern } from './door/door-patterns';

import { CountdownTimer, AddToCalendarDropdown, getCountdownTarget } from './features/countdown-timer';
import { PhotoGallery } from './features/photo-gallery';
import { drawHeartPath, getHeartSvgPath } from './ui/shapes';
import { RevealSection, getMapEmbedQuery } from './ui/reveal-section';

export default function InvitationViewer(props: InvitationViewerProps) {
  const isDemo = !props.flowData?.invitationId && !props.flowData?.partner1Name
  const [showDemoBanner, setShowDemoBanner] = useState(isDemo)

  useEffect(() => {
    if (isDemo) {
      const timer = setTimeout(() => setShowDemoBanner(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isDemo])
  
  const renderViewer = () => {
    const RoyalViewer = props.templateId ? ROYAL_TEMPLATE_MAP[props.templateId] : null
    if (RoyalViewer) {
      return <RoyalViewer {...props} />
    }
    return <ClassicViewer {...props} />
  }

  return (
    <>
      <AnimatePresence>
        {showDemoBanner && (
          <m.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 bg-red-600/90 text-white text-xs text-center py-1.5 z-[99999] font-medium tracking-wide pointer-events-none shadow-sm backdrop-blur-sm uppercase"
          >
            Fictional Demo Content - Not a Real Invitation
          </m.div>
        )}
      </AnimatePresence>
      {renderViewer()}
    </>
  )
}


