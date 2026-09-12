'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { getTheme, hexToRgb, extractColors, parseGiftDetails, getCalendarDates, getGoogleCalendarLink, generateICSContent, getOutlookWebLink, formatScratchDate, formatScratchTime } from './utils'
import { getMapEmbedQuery } from './ui/reveal-section'
import type { FlowData } from '@/lib/flow-types'


export function useInvitationState(templateId: string | undefined, flowData: FlowData | undefined, guestName: string | null | undefined, guestSlug?: string | null) {
  const theme = useMemo(() => getTheme(templateId), [templateId])

  const getOpacityStyle = useCallback((type: 'text' | 'bg' | 'border' | 'accent', defaultOpacity: number) => {
    if (!theme.isLight) return `rgba(${theme.accentRgb},${defaultOpacity})`
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
  }, [theme.accentRgb, theme.isLight, theme.textPrimary])

  // ─── Content Fields & Category Context ───
  const rawCat = (flowData?.category || '').toLowerCase().trim();
  const category = rawCat === 'school' ? 'school' :
    rawCat === 'birthday' ? 'birthday' :
    rawCat === 'meeting' || rawCat === 'corporate' ? 'corporate' :
    templateId && ['academic-excellence', 'future-innovators', 'campus-memories', 'grand-gala', 'valedictorian-prestige'].includes(templateId) ? 'school' :
    templateId && ['pastel-paradise', 'boho-chic', 'vintage-milestones', 'lumina-celebration', 'golden-jubilee'].includes(templateId) ? 'birthday' :
    templateId && ['executive-summit', 'creative-startup', 'global-connect', 'the-boardroom', 'visionary-keynote'].includes(templateId) ? 'corporate' : 'wedding';

  const defaultPartner1 = category === 'school' ? 'Oxford Collegiate Academy' :
    category === 'corporate' ? 'Global Tech Summit' :
    category === 'birthday' ? 'Zara' : 'Ahmed';

  const defaultPartner2 = category === 'school' ? 'Commencement 2026' :
    category === 'corporate' ? 'Executive Keynote' :
    category === 'birthday' ? '21st Celebration' : 'Fatima';

  const partner1 = flowData?.partner1Name?.trim() || defaultPartner1;
  const partner2 = flowData?.partner2Name?.trim() || defaultPartner2;
  const venueName = flowData?.venue?.trim() || (category === 'school' ? 'The Great Memorial Hall' : category === 'corporate' ? 'Grand Convention Center' : 'The Grand Pearl Hall');
  const rawVenueAddress = flowData?.venueAddress?.trim() || 'Main Boulevard, Gulberg, Lahore';
  const [venueAddress, googleMapsUrl] = rawVenueAddress.includes('|||')
    ? rawVenueAddress.split('|||')
    : [rawVenueAddress, ''];
  const [mapQuery, setMapQuery] = useState(getMapEmbedQuery(googleMapsUrl, venueAddress, venueName));
  const isDemo = !flowData?.invitationId && !flowData?.partner1Name;

  const defaultWelcomeMsg = category === 'school'
    ? "We warmly invite faculty, distinguished guests, alumni, and families to commemorate academic excellence and degree conferral."
    : category === 'corporate'
    ? "You are cordially invited to join industry leaders, visionaries, and executives for keynote addresses and collaborative summits."
    : category === 'birthday'
    ? "Join us for an unforgettable evening of music, laughter, and celebration as we mark this special milestone!"
    : "With hearts full of love and joy, we warmly invite you to share in the celebration of our union. Your presence would mean the world to us as we begin this beautiful journey together.";

  const welcomeMsg = flowData?.welcomeMessage?.trim() || defaultWelcomeMsg;

  const dressCodeWomen = flowData?.dressCodeWomen?.trim() || (isDemo ? (category === 'school' ? 'Academic regalia / formal' : category === 'corporate' ? 'Business professional' : category === 'birthday' ? 'Chic cocktail' : 'Yellow / Green traditional') : '');
  const dressCodeMen = flowData?.dressCodeMen?.trim() || (isDemo ? (category === 'school' ? 'Academic gown / dark suit' : category === 'corporate' ? 'Executive formal' : category === 'birthday' ? 'Smart evening attire' : 'Gold / Maroon formal') : '');

  const defaultAccommodation = category === 'school'
    ? "Campus guest suites and partner hotel rooms reserved under 'Convocation 2026'."
    : category === 'corporate'
    ? "Partner hotel suites reserved at Serena Hotel & Pearl Continental. Corporate rate code: 'SUMMIT2026'."
    : category === 'birthday'
    ? "Out-of-town guests may book partner suites at Grand Luxury Hotel under 'Birthday VIP'."
    : "Rooms blocked at Leela Palace & Pearl Continental. Mention 'Ahmed & Fatima' for discounts.";

  const accommodation = flowData?.accommodation?.trim() || (isDemo ? defaultAccommodation : '');
  const transportation = flowData?.transportation?.trim() || (isDemo ? "Shuttle service will run from Pearl Continental to the venue every 30 minutes starting at 6:30 PM." : "");
  const gifts = flowData?.gifts?.trim() || (isDemo && category === 'wedding' ? "Your prayers are our greatest gift. For Shagun, you may transfer to Meezan Bank, Title: Ahmed Khan, Account Number: 028102384, IBAN: PK45MEZN00028102384, Raast ID: 03001234567, EasyPaisa: 03123456789" : "");
  const youtubeVideoId = flowData?.youtubeVideoId?.trim() || (isDemo ? "dQw4w9WgXcQ" : "");


  useEffect(() => {
    let active = true
    const baseQuery = getMapEmbedQuery(googleMapsUrl, venueAddress, venueName)
    if (!googleMapsUrl || (!googleMapsUrl.includes('goo.gl') && !googleMapsUrl.includes('maps.app.goo.gl'))) {
      if (active) setMapQuery(baseQuery)
      return
    }
    fetch(`/api/resolve-url?url=${encodeURIComponent(googleMapsUrl)}`)
      .then(res => res.json())
      .then(data => { if (data.resolvedUrl && active) setMapQuery(getMapEmbedQuery(data.resolvedUrl, venueAddress, venueName)); else if (active) setMapQuery(baseQuery) })
      .catch(() => { if (active) setMapQuery(baseQuery) })
    return () => { active = false }
  }, [googleMapsUrl, venueAddress, venueName])

  // ─── Events ───
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
          name: e.name, time: e.time || 'TBD', date: e.date || 'TBD',
          description: e.venue ? `At ${e.venue}` : `Join us for the ${e.name} celebration.`,
        }))
    } else {
      evs = category === 'school' ? [
        { name: 'Academic Procession', time: '04:30 PM', date: 'June 18, 2027', description: 'Faculty, deans, and graduating candidates assemble in traditional regalia.' },
        { name: 'Commencement Ceremony', time: '05:30 PM', date: 'June 18, 2027', description: 'Welcome address, keynote speech, and conferral of degrees.' },
        { name: 'Valedictorian Address', time: '06:45 PM', date: 'June 18, 2027', description: 'Distinguished student address and academic honors presentation.' },
        { name: 'Alumni Dinner & Gala', time: '08:00 PM', date: 'June 18, 2027', description: 'Celebratory banquet with faculty, families, and graduates.' },
      ] : category === 'corporate' ? [
        { name: 'Delegate Registration', time: '08:30 AM', date: 'November 15, 2027', description: 'Registration, badge collection, and networking breakfast.' },
        { name: 'Opening Keynote Address', time: '09:30 AM', date: 'November 15, 2027', description: 'Visionary leadership and future market insights.' },
        { name: 'Executive Panel Session', time: '11:15 AM', date: 'November 15, 2027', description: 'C-suite dialogue on innovation, capital, and technology.' },
        { name: 'Networking Luncheon', time: '01:00 PM', date: 'November 15, 2027', description: 'Curated executive networking at the Skyline Terrace.' },
      ] : category === 'birthday' ? [
        { name: 'Red Carpet & Mocktails', time: '07:00 PM', date: 'March 25, 2027', description: 'Arrive in style, signature mocktails, and photo booth moments.' },
        { name: 'Cake Cutting Ceremony', time: '08:30 PM', date: 'March 25, 2027', description: 'The grand celebration moment under fireworks and confetti.' },
        { name: 'Celebration Dinner Feast', time: '09:00 PM', date: 'March 25, 2027', description: 'Lavish gourmet buffet and live culinary stations.' },
        { name: 'DJ & Dancefloor Open', time: '10:00 PM', date: 'March 25, 2027', description: 'Celebrate and dance until midnight with the live DJ.' },
      ] : [
        { name: 'Qawali Night', time: '5:00 PM', date: 'March 11, 2027', description: 'A mystical evening of sufi music, devotion, and celebration.' },
        { name: 'Dholki', time: '8:00 PM', date: 'March 12, 2027', description: 'An intimate evening of traditional folk songs, dhol beats, and family bonding.' },
        { name: 'Mayoon', time: '6:00 PM', date: 'March 13, 2027', description: 'The traditional ubtan ceremony marking the bride\'s formal preparation.' },
        { name: 'Mehndi', time: '7:00 PM', date: 'March 14, 2027', description: 'A night of colors, henna, and celebration with traditional music and dance.' },
        { name: 'Baraat & Nikkah', time: '7:00 PM', date: 'March 15, 2027', description: 'The grand wedding procession followed by the sacred Islamic marriage ceremony.' },
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
  }, [flowData?.events, flowData?.guestAllowedEvents, guestName, category])

  const firstEvent = useMemo(() => {
    if (!dynamicEvents.length) return { date: 'March 15, 2027', time: '7:00 PM', name: category === 'school' ? 'Convocation' : category === 'corporate' ? 'Summit' : category === 'birthday' ? 'Celebration' : 'Wedding' }
    const mainNames = ['baraat', 'nikkah', 'wedding', 'shaadi', 'ruksati', 'commencement', 'keynote', 'cake']
    return dynamicEvents.find(e => mainNames.some(n => e.name.toLowerCase().includes(n))) || dynamicEvents[0]
  }, [dynamicEvents, category])

  // ─── UI State ───
  const [doorsOpened, setDoorsOpened] = useState(false)
  const [scratchRevealed, setScratchRevealed] = useState(false)
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)
  const [doorOverlayVisible, setDoorOverlayVisible] = useState(true)
  const [rsvpName, setRsvpName] = useState('')
  const [rsvpEmail, setRsvpEmail] = useState('')
  const [rsvpStatus, setRsvpStatus] = useState<'accept' | 'decline' | null>(null)
  const [adultsCount, setAdultsCount] = useState(1)
  const [childrenCount, setChildrenCount] = useState(0)
  const [dietaryNotes, setDietaryNotes] = useState('')
  const [selectedDietaryChip, setSelectedDietaryChip] = useState('none')
  const [attendingEvents, setAttendingEvents] = useState<string[]>([])
  const [wishName, setWishName] = useState('')
  const [wishMessage, setWishMessage] = useState('')
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [rsvpHearts, setRsvpHearts] = useState<number[]>([])
  const [heroVisible, setHeroVisible] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showGoldDust, setShowGoldDust] = useState(false)
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({})
  const [language, setLanguage] = useState<'en' | 'ur'>('en')
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isTranslating, setIsTranslating] = useState(false)
  const [guestNameFromUrl, setGuestNameFromUrl] = useState('')

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const wishesRef = useRef<Array<{ name: string; message: string; translatedName?: string; translatedMessage?: string }>>([])

  const [wishes, setWishes] = useState<Array<{ name: string; message: string; translatedName?: string; translatedMessage?: string }>>(() => {
    if (isDemo) {
      return [
        { name: 'Ayesha Khan', message: 'May Allah bless your union with endless love and happiness! 🤲' },
        { name: 'Omar Farooq', message: 'Wishing you a lifetime of joy and togetherness! 💒' },
        { name: 'Zainab Malik', message: 'MashaAllah! May your journey be filled with blessings! ✨' },
      ]
    }
    return []
  })
  wishesRef.current = wishes

  const scratchDateInfo = useMemo(() => formatScratchDate(firstEvent.date, language), [firstEvent.date, language])
  const scratchTimeFormatted = useMemo(() => formatScratchTime(firstEvent.time, language), [firstEvent.time, language])

  // ─── Effects ───
  useEffect(() => {
    if (guestName) {
      setGuestNameFromUrl(guestName)
      if (!rsvpName) setRsvpName(guestName)
    }
  }, [guestName])

  useEffect(() => {
    if (flowData?.invitationId) {
      const timer = setTimeout(() => {
        fetch(`/api/invitations/${flowData.invitationId}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestSlug: guestSlug || undefined })
        }).catch(() => {})
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [flowData?.invitationId, isDemo, guestSlug])

  useEffect(() => {
    if (typeof window !== 'undefined' && flowData?.invitationId) {
      const savedStatus = localStorage.getItem(`smartinvites_rsvp_${flowData.invitationId}`)
      if (savedStatus) { setRsvpSubmitted(true); setRsvpStatus(savedStatus as 'accept' | 'decline') }
    }
  }, [flowData?.invitationId])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const musicTrack = flowData?.backgroundMusic || (isDemo ? 'shehnai' : null)
    if (!musicTrack || musicTrack === 'no-music') { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }; return }
    const trackSrc = musicTrack.startsWith('http') || musicTrack.startsWith('/') ? musicTrack : `/music/${musicTrack}.mp3`
    const absoluteSrc = trackSrc.startsWith('http') ? trackSrc : (window.location.origin + trackSrc)
    if (!audioRef.current || audioRef.current.src !== absoluteSrc) {
      if (audioRef.current) audioRef.current.pause()
      const audio = new Audio(trackSrc); audio.loop = true; audio.preload = 'auto'; audioRef.current = audio
    }
    return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null } }
  }, [flowData?.backgroundMusic, isDemo])

  const playPromiseRef = useRef<Promise<void> | null>(null)
  const userMutedRef = useRef(false)

  // Explicit toggle function for user click on MusicToggle
  const toggleMusic = useCallback(() => {
    setMusicPlaying(prev => {
      const next = !prev
      userMutedRef.current = !next
      if (next && audioRef.current) {
        const p = audioRef.current.play()
        playPromiseRef.current = p
        if (p !== undefined) {
          p.catch((err) => {
            if (err?.name !== 'AbortError') {
              console.warn('Audio play prevented:', err)
              setMusicPlaying(false)
            }
          })
        }
      }
      return next
    })
  }, [])

  // Wrapped setMusicPlaying so any direct toggle (e.g. s.setMusicPlaying(!s.musicPlaying)) updates userMutedRef
  const setMusicPlayingWithIntent = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setMusicPlaying(prev => {
      const next = typeof value === 'function' ? value(prev) : value
      userMutedRef.current = !next
      return next
    })
  }, [])

  const playMusic = useCallback((force: boolean = false) => {
    // If the user has intentionally muted, do NOT auto-start music unless explicitly forced
    if (userMutedRef.current && !force) {
      return
    }
    userMutedRef.current = false
    setMusicPlaying(true)
    const audio = audioRef.current
    if (audio) {
      const p = audio.play()
      playPromiseRef.current = p
      if (p !== undefined) {
        p.catch((err) => {
          if (err?.name !== 'AbortError') {
            console.warn('Audio play prevented:', err)
            setMusicPlaying(false)
          }
        })
      }
    }
  }, [])

  useEffect(() => {
    if (!audioRef.current) return

    if (doorsOpened && musicPlaying) {
      if (audioRef.current.paused) {
        const p = audioRef.current.play()
        playPromiseRef.current = p
        if (p !== undefined) {
          p.catch((err) => {
            if (err?.name !== 'AbortError') {
              console.warn('Audio play prevented:', err)
              setMusicPlaying(false)
            }
          })
        }
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

  // Audio ducking: pause background music when host voice greeting is played, resume when it ends
  useEffect(() => {
    if (typeof window === 'undefined') return
    let wasPlayingBeforeVoice = false
    const handleVoiceStart = () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause()
        setMusicPlaying(false)
        wasPlayingBeforeVoice = true
      }
    }
    const handleVoiceEnd = () => {
      if (wasPlayingBeforeVoice && doorsOpened) {
        setMusicPlaying(true)
        audioRef.current?.play().catch(() => {})
        wasPlayingBeforeVoice = false
      }
    }
    window.addEventListener('shaadi_voice_started', handleVoiceStart)
    window.addEventListener('shaadi_voice_ended', handleVoiceEnd)
    return () => {
      window.removeEventListener('shaadi_voice_started', handleVoiceStart)
      window.removeEventListener('shaadi_voice_ended', handleVoiceEnd)
    }
  }, [doorsOpened])

  // Phase 2: Passive engagement metrics tracking
  const doorMetricSent = useRef(false)
  useEffect(() => {
    if (doorsOpened && !doorMetricSent.current && flowData?.invitationId) {
      doorMetricSent.current = true
      fetch(`/api/invitations/${flowData.invitationId}/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'door_opened' }),
      }).catch(() => {})
    }
  }, [doorsOpened, flowData?.invitationId])

  const musicMetricSent = useRef(false)
  useEffect(() => {
    if (musicPlaying && !musicMetricSent.current && flowData?.invitationId) {
      musicMetricSent.current = true
      fetch(`/api/invitations/${flowData.invitationId}/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'music_played' }),
      }).catch(() => {})
    }
  }, [musicPlaying, flowData?.invitationId])

  useEffect(() => {
    if (!flowData?.invitationId) return
    fetch(`/api/invitations/${flowData.invitationId}/wishes`).then(res => {
      if (res.ok) res.json().then(data => {
        if (data.wishes && Array.isArray(data.wishes)) {
          setWishes(data.wishes.map((w: { sender_name?: string; message?: string }) => ({ name: w.sender_name ?? '', message: w.message ?? '' })))
        }
      })
    }).catch(console.error)
  }, [flowData?.invitationId])

  // ─── Static Urdu Dictionary ───
  const URDU_DICT: Record<string, string> = {
    gettingMarried: 'ہم شادی کر رہے ہیں', requestHonour: 'آپ کی موجودگی کی عزت کی درخواست ہے',
    ourMoments: 'ہماری یادگاریں', countingDown: 'ہمیشہ کی طرف گنتی',
    days: 'دن', hours: 'گھنٹے', minutes: 'منٹ', seconds: 'سیکنڈ',
    programTimeline: 'پروگرام کی ٹائم لائن', venue: 'مقام', viewOnMaps: 'گوگل میپ پر دیکھیں',
    willYouAttend: 'کیا آپ تشریف لائیں گے؟', yourName: 'آپ کا نام', enterName: 'اپنا پورا نام لکھیں',
    email: 'ای میل', emailOptional: '(اختیاری)', willYouBeAttending: 'کیا آپ شرکت کریں گے؟',
    selectOption: 'منتخب کریں...', acceptYes: 'جی ہاں، میں آ رہا ہوں! 🎉', declineSorry: 'معذرت، میں نہیں آ سکتا 💌',
    joyfullyAccept: 'خوشی سے قبول', respectfullyDecline: 'باادب معذرت',
    joyfullyAccepted: 'خوشی سے قبول کر لیا!', thankYou: 'شکریہ!',
    blessingsWishes: 'دعائیں اور آرزوئیں', writeBlessing: 'اپنی دعا یا آرزو لکھیں...',
    yourNameSender: 'آپ کا نام', madeWithLove: 'اسمارٹ انوائٹس کی طرف سے محبت سے بنایا گیا',
    scroll: 'سکرول', tapToOpen: 'کھولنے کے لیے ٹچ کریں',
    dressCode: 'ڈریس کوڈ', ladies: 'خواتین', gentlemen: 'حضرات', recommendedColors: 'تجویز کردہ رنگ',
    travelAccommodations: 'سفر اور رہائش', hotelBlocks: 'ہوٹل بلاکس', transportationInfo: 'ٹرانسپورٹ کی معلومات',
    giftsShagun: 'شگون اور گفٹ رجسٹری', shagunDetails: 'شگون کی تفصیلات',
    copied: 'کاپی ہو گیا!', copy: 'کاپی کریں', faq: 'اکثر پوچھے گئے سوالات',
    addToCalendar: 'کیلنڈر میں شامل کریں',
    mehndiDesc: 'رنگوں، مہندی اور روایتی موسیقی و رقص کی شام',
    baraatDesc: 'شادی کا شان دار جلوس — ڈھول کی تھاپ، رقص اور خوش آمدید',
    nikkahDesc: 'مقدس اسلامی شادی کی تقریب — نکاح نامہ کی دستخط',
    walimaDesc: 'دولہا کی طرف سے ولیمہ — ضیافت، دعائیں اور خوشیاں',
    at: 'پر', joinUs: 'میں شامل ہوں', celebration: 'تقریب',
    'Our Story': 'ہماری کہانی',
  }

  const translateToUrdu = useCallback(async () => {
    if (language !== 'ur' || Object.keys(translations).length > 0) return
    setTranslations(URDU_DICT)
    setIsTranslating(true)
    try {
      const dynamicTexts: Record<string, string> = {}
      if (partner1) dynamicTexts.partner1 = partner1
      if (partner2) dynamicTexts.partner2 = partner2
      if (venueName) dynamicTexts.venueName = venueName
      if (venueAddress) dynamicTexts.venueAddress = venueAddress
      if (welcomeMsg) dynamicTexts.welcomeMsg = welcomeMsg
      if (dressCodeWomen) dynamicTexts.dressCodeWomen = dressCodeWomen
      if (dressCodeMen) dynamicTexts.dressCodeMen = dressCodeMen
      if (transportation) dynamicTexts.transportation = transportation
      if (accommodation) dynamicTexts.accommodation = accommodation
      if (gifts) dynamicTexts.gifts = gifts
      if (guestNameFromUrl) dynamicTexts.guestName = guestNameFromUrl
      if (flowData?.primaryHostFamily) dynamicTexts.primaryHostFamily = flowData.primaryHostFamily
      if (flowData?.secondaryHostFamily) dynamicTexts.secondaryHostFamily = flowData.secondaryHostFamily
      if (flowData?.primaryHostCity) dynamicTexts.primaryHostCity = flowData.primaryHostCity
      if (flowData?.secondaryHostCity) dynamicTexts.secondaryHostCity = flowData.secondaryHostCity
      
      dynamicEvents.forEach((event, idx) => {
        dynamicTexts[`event${idx}_name`] = event.name
        dynamicTexts[`event${idx}_date`] = event.date
        dynamicTexts[`event${idx}_time`] = event.time
        dynamicTexts[`event${idx}_desc`] = event.description
      })
      wishesRef.current.forEach((wish, idx) => {
        dynamicTexts[`wish${idx}_name`] = wish.name
        dynamicTexts[`wish${idx}_message`] = wish.message
      })
      const response = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texts: dynamicTexts }) })
      if (response.ok) {
        const data = await response.json()
        if (data.translations) {
          setTranslations(prev => {
            const aiOnly: Record<string, string> = {}
            for (const [key, value] of Object.entries(data.translations as Record<string, string>)) {
              if (!prev[key] || prev[key] === key) aiOnly[key] = value
            }
            return { ...aiOnly, ...prev }
          })
          const aiT = data.translations as Record<string, string>
          setWishes(prev => prev.map((wish, idx) => ({ ...wish, translatedName: aiT[`wish${idx}_name`] || wish.name, translatedMessage: aiT[`wish${idx}_message`] || wish.message })))
        }
      }
    } catch { /* static translations already set */ } finally { setIsTranslating(false) }
  }, [language, partner1, partner2, venueName, venueAddress, welcomeMsg, dressCodeWomen, dressCodeMen, transportation, accommodation, gifts, dynamicEvents, translations])

  useEffect(() => { document.documentElement.lang = language === 'ur' ? 'ur' : 'en'; document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr'; return () => { document.documentElement.lang = 'en'; document.documentElement.dir = 'ltr' } }, [language])
  useEffect(() => { if (language === 'ur' && Object.keys(translations).length === 0) translateToUrdu() }, [language, translations, translateToUrdu])

  const t = useCallback((key: string, fallback: string): string => {
    if (language === 'en') return fallback
    return translations[key] || fallback
  }, [language, translations])

  // ─── Action Handlers ───
  const handleDoorOpen = useCallback((instant?: boolean) => {
    if (doorsOpened) return
    setDoorsOpened(true)
    const delayFactor = instant ? 0.8 : 1;
    setTimeout(() => setShowFireworks(true), 1500 * delayFactor)
    setTimeout(() => setShowFireworks(false), 6500 * delayFactor)
    if (theme.id.includes('royal') || theme.id === 'geometric-gold' || theme.id === 'dark-velvet') {
      setShowGoldDust(true)
      setTimeout(() => setShowGoldDust(false), 4500 * delayFactor)
    }
    const musicTrack = flowData?.backgroundMusic || (isDemo ? 'shehnai' : null)
    if (musicTrack && musicTrack !== 'no-music' && !userMutedRef.current) {
      playMusic()
    }
    setTimeout(() => setDoorOverlayVisible(false), 2800 * delayFactor)
    setTimeout(() => setHeroVisible(true), 2400 * delayFactor)
  }, [doorsOpened, theme.id, flowData?.backgroundMusic, isDemo, playMusic])

  useEffect(() => {
    if (dynamicEvents.length > 0) {
      setAttendingEvents(prev => prev.length === 0 ? dynamicEvents.map(e => e.name) : prev)
    }
  }, [dynamicEvents])

  const handleRSVP = useCallback(async (status: 'accept' | 'decline'): Promise<boolean> => {
    if (!rsvpName.trim()) { toast.error('Please enter your name'); return false }
    if (flowData?.invitationId) {
      try {
        const computedDietary = selectedDietaryChip !== 'none'
          ? (dietaryNotes.trim() ? `${selectedDietaryChip}: ${dietaryNotes.trim()}` : selectedDietaryChip)
          : dietaryNotes.trim()

        const payload = {
          guestName: rsvpName.trim(),
          guestEmail: rsvpEmail.trim() || undefined,
          status,
          adultsCount: status === 'accept' ? adultsCount : 0,
          childrenCount: status === 'accept' ? childrenCount : 0,
          dietaryNotes: status === 'accept' ? computedDietary : '',
          attendingEvents: status === 'accept' ? attendingEvents : [],
        }

        const response = await fetch(`/api/invitations/${flowData.invitationId}/rsvp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!response.ok) { const errData = await response.json(); toast.error(errData.error || 'Failed to submit RSVP.'); return false }
        if (typeof window !== 'undefined') localStorage.setItem(`smartinvites_rsvp_${flowData.invitationId}`, status)
      } catch { toast.error('Network error. Please try again.'); return false }
    }
    setRsvpStatus(status); setRsvpSubmitted(true)
    if (status === 'accept') { toast.success(`Joyfully accepted! We can't wait to see you, ${rsvpName}! 🎉`); setShowConfetti(true); setRsvpHearts([1, 2, 3, 4, 5]); setTimeout(() => setRsvpHearts([]), 3000); setTimeout(() => setShowConfetti(false), 4000) }
    else toast.success(`Thank you for letting us know, ${rsvpName}. You'll be missed! 💌`)
    return true
  }, [rsvpName, rsvpEmail, adultsCount, childrenCount, dietaryNotes, selectedDietaryChip, attendingEvents, flowData?.invitationId])

  const handleSendWish = useCallback(async () => {
    if (!wishName.trim()) { toast.error('Please enter your name'); return }
    if (!wishMessage.trim()) { toast.error('Please write a blessing or wish'); return }
    const newWish = { name: wishName.trim(), message: wishMessage.trim() }
    setWishName(''); setWishMessage('')
    if (flowData?.invitationId) {
      try {
        const response = await fetch(`/api/invitations/${flowData.invitationId}/wishes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senderName: newWish.name, message: newWish.message }) })
        if (!response.ok) { const errData = await response.json(); toast.error(errData.error || 'Failed to submit wish.'); return }
      } catch { toast.error('Network error. Please try again.'); return }
    }
    toast.success(language === 'ur' ? 'آپ کی دعا بھیج دی گئی! 💝' : 'Your blessing has been sent! 💝')
    setWishes(prev => [newWish, ...prev])
  }, [wishName, wishMessage, language, flowData?.invitationId])

  const handleScratchReveal = useCallback(() => {
    setScratchRevealed(true); setShowFireworks(true); setTimeout(() => setShowFireworks(false), 5000); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 4500)
  }, [])

  const handleCopy = useCallback((text: string, fieldName: string) => {
    navigator.clipboard.writeText(text); setCopiedField(fieldName); toast.success(`${fieldName} copied!`); setTimeout(() => setCopiedField(null), 2000)
  }, [])

  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') return
    const shareUrl = window.location.href
    const shareTitle = `${partner1} & ${partner2}'s Wedding Invitation`
    const shareText = `You are warmly invited to the wedding celebration of ${partner1} & ${partner2}.`
    if (navigator.share) { try { await navigator.share({ title: shareTitle, text: shareText, url: shareUrl }) } catch (err) { if ((err as Error).name !== 'AbortError') navigator.clipboard.writeText(shareUrl) } }
    else { navigator.clipboard.writeText(shareUrl); toast.success('Link copied!') }
  }, [partner1, partner2])

  const getTranslatedEvent = useCallback((event: { name: string; date: string; time: string; description: string }, index: number) => {
    if (language === 'en') return event
    const keyMap: Record<string, string> = { 'Mehndi': 'mehndiDesc', 'Baraat': 'baraatDesc', 'Nikkah': 'nikkahDesc', 'Walima': 'walimaDesc' }
    const key = keyMap[event.name]
    return {
      name: translations[`event${index}_name`] || event.name,
      date: translations[`event${index}_date`] || event.date,
      time: translations[`event${index}_time`] || event.time,
      description: (key && translations[key]) ? translations[key] : (translations[`event${index}_desc`] || event.description),
    }
  }, [language, translations])

  // ─── Translated Fields ───
  const translatedPartner1 = language === 'ur' && translations.partner1 ? translations.partner1 : partner1
  const translatedPartner2 = language === 'ur' && translations.partner2 ? translations.partner2 : partner2
  const translatedVenueName = language === 'ur' && translations.venueName ? translations.venueName : venueName
  const translatedVenueAddress = language === 'ur' && translations.venueAddress ? translations.venueAddress : venueAddress
  const translatedWelcomeMsg = language === 'ur' && translations.welcomeMsg ? translations.welcomeMsg : welcomeMsg
  const translatedDressCodeWomen = language === 'ur' && translations.dressCodeWomen ? translations.dressCodeWomen : dressCodeWomen
  const translatedDressCodeMen = language === 'ur' && translations.dressCodeMen ? translations.dressCodeMen : dressCodeMen
  const translatedAccommodation = language === 'ur' && translations.accommodation ? translations.accommodation : accommodation
  const translatedTransportation = language === 'ur' && translations.transportation ? translations.transportation : transportation
  const translatedGifts = language === 'ur' && translations.gifts ? translations.gifts : gifts
  const translatedGuestName = language === 'ur' && translations.guestName ? translations.guestName : guestNameFromUrl
  const translatedHostBrideFamily = language === 'ur' && translations.primaryHostFamily ? translations.primaryHostFamily : flowData?.primaryHostFamily
  const translatedHostGroomFamily = language === 'ur' && translations.secondaryHostFamily ? translations.secondaryHostFamily : flowData?.secondaryHostFamily
  const translatedHostBrideCity = language === 'ur' && translations.primaryHostCity ? translations.primaryHostCity : flowData?.primaryHostCity
  const translatedHostGroomCity = language === 'ur' && translations.secondaryHostCity ? translations.secondaryHostCity : flowData?.secondaryHostCity

  return {
    theme, getOpacityStyle,
    // Content
    partner1, partner2, venueName, venueAddress, rawVenueAddress, googleMapsUrl, mapQuery,
    welcomeMsg, dressCodeWomen, dressCodeMen, accommodation, transportation, gifts, youtubeVideoId,
    isDemo,
    // Events
    dynamicEvents, firstEvent, scratchDateInfo, scratchTimeFormatted,
    // UI State
    doorsOpened, scratchRevealed, rsvpSubmitted, setRsvpSubmitted, showFireworks, doorOverlayVisible,
    rsvpName, setRsvpName, rsvpEmail, setRsvpEmail, rsvpStatus, setRsvpStatus,
    adultsCount, setAdultsCount, childrenCount, setChildrenCount,
    dietaryNotes, setDietaryNotes, selectedDietaryChip, setSelectedDietaryChip,
    attendingEvents, setAttendingEvents,
    wishName, setWishName, wishMessage, setWishMessage,
    musicPlaying, setMusicPlaying: setMusicPlayingWithIntent, toggleMusic, userMuted: userMutedRef.current, showConfetti, rsvpHearts, heroVisible,
    copiedField, showGoldDust, faqOpen, setFaqOpen,
    language, setLanguage, translations, isTranslating,
    guestNameFromUrl, wishes,
    // Handlers
    handleDoorOpen, playMusic, handleRSVP, handleSendWish, handleScratchReveal, handleCopy, handleShare, getTranslatedEvent, t,
    // Translated content
    translatedPartner1, translatedPartner2, translatedVenueName, translatedVenueAddress,
    translatedWelcomeMsg, translatedDressCodeWomen, translatedDressCodeMen,
    translatedAccommodation, translatedTransportation, translatedGifts, translatedGuestName,
    translatedHostBrideFamily, translatedHostGroomFamily, translatedHostBrideCity, translatedHostGroomCity,
    // Helpers
    extractColors, parseGiftDetails, getGoogleCalendarLink, generateICSContent, getOutlookWebLink,
    // flowData pass-through
    flowData,
  }
}
