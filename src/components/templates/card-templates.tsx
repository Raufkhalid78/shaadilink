import React from 'react'
import type { FlowData } from '@/lib/flow-types'

export type CardTemplateTheme = 'classic-gold' | 'emerald-royal' | 'minimalist-floral' | 'minimalist-modern' | 'luxurious-botanical'

export interface CardEvent {
  id?: string
  name: string
  date: string
  time: string
  venue?: string
}

interface PrintableCardProps {
  flowData: FlowData
  theme: CardTemplateTheme
  selectedEvents?: CardEvent[]
}

function GoldMandalaHeader({ color = '#d4af37' }: { color?: string }) {
  return (
    <div className="mb-5 opacity-90 flex items-center justify-center">
      <svg width="56" height="24" viewBox="0 0 120 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M60 0C48 15 30 25 0 25C30 25 48 35 60 50C72 35 90 25 120 25C90 25 72 15 60 0Z" fill={color} />
        <circle cx="60" cy="25" r="4" fill="#ffffff" />
      </svg>
    </div>
  )
}

function RoyalArchHeader({ color = '#d4af37' }: { color?: string }) {
  return (
    <div className="mb-4 opacity-95 flex items-center justify-center">
      <svg width="120" height="50" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 5 C65 5 35 25 10 55 L10 75 L190 75 L190 55 C165 25 135 5 100 5 Z" stroke={color} strokeWidth="1.5" fill="none"/>
        <path d="M100 14 C72 14 48 30 22 55" stroke={color} strokeWidth="1" strokeDasharray="3 3" fill="none"/>
        <path d="M100 14 C128 14 152 30 178 55" stroke={color} strokeWidth="1" strokeDasharray="3 3" fill="none"/>
        <circle cx="100" cy="30" r="5" fill={color} />
        <circle cx="100" cy="12" r="2.5" fill={color} />
        <path d="M100 20 L100 40 M90 30 L110 30" stroke={color} strokeWidth="1"/>
      </svg>
    </div>
  )
}

function RoyalCornerFlourish({ color = '#c9a84c' }: { color?: string }) {
  return (
    <svg width="45" height="45" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 90 L10 15 C10 12.2 12.2 10 15 10 L90 10" stroke={color} strokeWidth="2.5" />
      <path d="M22 90 L22 22 L90 22" stroke={color} strokeWidth="1" opacity="0.6" />
      <path d="M35 35 C35 60 60 35 85 35 C60 35 35 60 35 85" stroke={color} strokeWidth="1.5" />
      <circle cx="35" cy="35" r="4" fill={color} />
    </svg>
  )
}

function ModernLuxuryHeader({ p1 = 'A', p2 = 'F', color = '#C5A059' }: { p1?: string, p2?: string, color?: string }) {
  const init1 = p1.charAt(0).toUpperCase()
  const init2 = p2.charAt(0).toUpperCase()
  return (
    <div className="mb-4 flex flex-col items-center opacity-95">
      <svg width="75" height="55" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,5 85,35 50,65 15,35" stroke={color} strokeWidth="1.5" fill="none" />
        <polygon points="50,11 77,35 50,59 23,35" stroke={color} strokeWidth="0.75" strokeDasharray="2 2" fill="none" />
        <circle cx="50" cy="5" r="2.5" fill={color} />
        <circle cx="50" cy="65" r="2.5" fill={color} />
        <circle cx="15" cy="35" r="2.5" fill={color} />
        <circle cx="85" cy="35" r="2.5" fill={color} />
      </svg>
      <span style={{ fontFamily: "Georgia, serif", fontSize: "13px", letterSpacing: "0.25em", color: color, marginTop: "-36px", fontWeight: 600 }}>
        {init1}&amp;{init2}
      </span>
      <div className="h-4" />
    </div>
  )
}

function ModernCornerNotches({ color = '#C5A059' }: { color?: string }) {
  return (
    <>
      <div className="absolute top-6 left-6 w-5 h-5 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: color }} />
      <div className="absolute top-6 right-6 w-5 h-5 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: color }} />
      <div className="absolute bottom-6 left-6 w-5 h-5 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: color }} />
      <div className="absolute bottom-6 right-6 w-5 h-5 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: color }} />
    </>
  )
}

function BotanicalCrestWreath({ color = '#E4D5B7', accent = '#9BB8A1' }: { color?: string, accent?: string }) {
  return (
    <div className="mb-4 opacity-90 flex items-center justify-center">
      <svg width="130" height="50" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 65 C38 22 75 15 95 38" stroke={accent} strokeWidth="1.5" fill="none"/>
        <path d="M28 50 C33 40 40 40 38 47" stroke={color} strokeWidth="1.5" fill={color}/>
        <path d="M48 36 C53 26 60 26 58 33" stroke={color} strokeWidth="1.5" fill={color}/>
        <path d="M68 26 C73 16 80 16 78 23" stroke={color} strokeWidth="1.5" fill={color}/>
        
        <path d="M185 65 C162 22 125 15 105 38" stroke={accent} strokeWidth="1.5" fill="none"/>
        <path d="M172 50 C167 40 160 40 162 47" stroke={color} strokeWidth="1.5" fill={color}/>
        <path d="M152 36 C147 26 140 26 142 33" stroke={color} strokeWidth="1.5" fill={color}/>
        <path d="M132 26 C127 16 120 16 122 23" stroke={color} strokeWidth="1.5" fill={color}/>

        <polygon points="100,20 108,32 100,44 92,32" fill={color} />
        <circle cx="100" cy="32" r="2.5" fill={accent} />
      </svg>
    </div>
  )
}

function BotanicalLeafHeader({ color = '#9BB8A1' }: { color?: string }) {
  return (
    <div className="mb-5 opacity-85 flex items-center justify-center">
      <svg width="70" height="26" viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M70 20C52 8 35 12 10 2C28 18 48 18 70 20Z" fill={color} />
        <path d="M70 20C88 8 105 12 130 2C112 18 92 18 70 20Z" fill={color} />
        <circle cx="70" cy="20" r="3" fill={color} />
      </svg>
    </div>
  )
}

function CardBranding({ color = '#999999' }: { color?: string }) {
  return (
    <div className="absolute bottom-10 left-0 right-0 z-20 flex items-center justify-center gap-1.5 opacity-70 pointer-events-none" style={{ color }}>
      <span style={{ fontFamily: 'sans-serif', fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', fontWeight: 500 }}>
        Created with ShaadiLink
      </span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    </div>
  )
}

export function PrintableCard({ flowData, theme, selectedEvents }: PrintableCardProps) {
  const partner1 = flowData.partner1Name?.trim() || 'Ahmed'
  const partner2 = flowData.partner2Name?.trim() || 'Fatima'
  const defaultVenue = flowData.venue?.trim() || 'The Grand Pearl Hall'
  
  // Determine events to render
  let eventsToRender: CardEvent[] = []
  if (selectedEvents && selectedEvents.length > 0) {
    eventsToRender = selectedEvents
  } else if (flowData.events && flowData.events.length > 0) {
    eventsToRender = flowData.events
  } else {
    eventsToRender = [{ name: 'Wedding Ceremony', date: 'March 15, 2027', time: '7:00 PM', venue: defaultVenue }]
  }

  const isMultiEvent = eventsToRender.length > 1

  // --- Theme: Classic Gold ---
  if (theme === 'classic-gold') {
    return (
      <div id="printable-card-node" className="relative w-[595px] h-[842px] mx-auto overflow-hidden flex flex-col items-center justify-center p-12 text-center"
        style={{ backgroundColor: '#ffffff', fontFamily: "'Cinzel Decorative', serif", color: '#1a1a1a', border: '1px solid #e5e5e5' }}>
        
        {/* Double Gold Border Frames */}
        <div className="absolute inset-5 border-[2px] opacity-85 pointer-events-none" style={{ borderColor: '#d4af37' }} />
        <div className="absolute inset-[26px] border opacity-45 pointer-events-none" style={{ borderColor: '#d4af37' }} />
        
        {/* Corner Accents */}
        <div className="absolute top-7 left-7 w-4 h-4 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: '#d4af37' }} />
        <div className="absolute top-7 right-7 w-4 h-4 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: '#d4af37' }} />
        <div className="absolute bottom-7 left-7 w-4 h-4 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: '#d4af37' }} />
        <div className="absolute bottom-7 right-7 w-4 h-4 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: '#d4af37' }} />

        <div className="relative z-10 w-full flex flex-col items-center px-4">
          <GoldMandalaHeader color="#d4af37" />
          
          <p className="tracking-[0.3em] uppercase text-xs mb-6" style={{ fontFamily: 'sans-serif', color: '#666666' }}>Request the honour of your presence</p>
          <h1 className="text-5xl font-bold mb-2 tracking-wider" style={{ color: '#d4af37' }}>{partner1}</h1>
          <span className="text-3xl mb-2 italic" style={{ fontFamily: "'Great Vibes', cursive", color: '#999999' }}>&amp;</span>
          <h1 className="text-5xl font-bold mb-6 tracking-wider" style={{ color: '#d4af37' }}>{partner2}</h1>
          
          <div className="w-16 h-px mb-6" style={{ backgroundColor: '#d4af37' }} />

          {isMultiEvent ? (
            <div className="flex flex-col gap-3.5 w-full max-w-[85%] my-2">
              {eventsToRender.map((ev, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-xs font-bold tracking-[0.25em] uppercase" style={{ fontFamily: 'sans-serif', color: '#d4af37' }}>{ev.name}</span>
                  <span className="text-sm font-semibold tracking-wide mt-0.5" style={{ color: '#1a1a1a' }}>{ev.date} {ev.time && `· ${ev.time}`}</span>
                  {ev.venue && <span className="text-[11px] uppercase tracking-wider" style={{ fontFamily: 'sans-serif', color: '#555555' }}>{ev.venue}</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center mb-4">
              <p className="text-xs font-bold tracking-[0.25em] uppercase mb-1" style={{ fontFamily: 'sans-serif', color: '#d4af37' }}>{eventsToRender[0].name}</p>
              <p className="text-xl mb-1 font-semibold tracking-wide" style={{ color: '#1a1a1a' }}>{eventsToRender[0].date}</p>
              <p className="text-base mb-4" style={{ color: '#555555' }}>at {eventsToRender[0].time}</p>
              <p className="text-lg tracking-wide uppercase font-medium" style={{ color: '#333333' }}>{eventsToRender[0].venue || defaultVenue}</p>
            </div>
          )}

          {flowData.venueAddress && !isMultiEvent && (
            <p className="text-xs mt-2 max-w-[80%] mx-auto" style={{ fontFamily: 'sans-serif', color: '#666666' }}>{flowData.venueAddress.split('|||')[0]}</p>
          )}
        </div>
        <CardBranding color="#999999" />
      </div>
    )
  }

  // --- Theme: Emerald Royal ---
  if (theme === 'emerald-royal') {
    return (
      <div id="printable-card-node" className="relative w-[595px] h-[842px] mx-auto overflow-hidden flex flex-col items-center justify-center p-12 text-center"
        style={{ backgroundColor: '#04150c', backgroundImage: 'radial-gradient(ellipse at center, #092818 0%, #030d07 100%)', fontFamily: "'Cinzel Decorative', serif", color: '#ffffff' }}>
        
        {/* Dual Royal Gold Borders */}
        <div className="absolute inset-5 border-[2px] rounded-3xl opacity-90 pointer-events-none" style={{ borderColor: '#d4af37' }} />
        <div className="absolute inset-9 border rounded-2xl opacity-40 pointer-events-none" style={{ borderColor: '#d4af37' }} />
        
        {/* Royal Corner Flourishes */}
        <div className="absolute top-7 left-7 pointer-events-none opacity-90">
          <RoyalCornerFlourish color="#d4af37" />
        </div>
        <div className="absolute top-7 right-7 pointer-events-none opacity-90 transform rotate-90">
          <RoyalCornerFlourish color="#d4af37" />
        </div>
        <div className="absolute bottom-7 left-7 pointer-events-none opacity-90 transform -rotate-90">
          <RoyalCornerFlourish color="#d4af37" />
        </div>
        <div className="absolute bottom-7 right-7 pointer-events-none opacity-90 transform rotate-180">
          <RoyalCornerFlourish color="#d4af37" />
        </div>

        <div className="relative z-10 w-full flex flex-col items-center px-4">
          <RoyalArchHeader color="#d4af37" />

          <p className="tracking-[0.35em] uppercase text-xs mb-5 opacity-90" style={{ fontFamily: 'sans-serif', color: '#e5ca78' }}>We invite you to celebrate the wedding of</p>
          
          <h1 className="text-5xl font-bold mb-1 tracking-widest drop-shadow-lg" style={{ color: '#f3e5ab' }}>{partner1}</h1>
          <span className="text-3xl mb-1 italic" style={{ fontFamily: "'Great Vibes', cursive", color: '#ffffff' }}>&amp;</span>
          <h1 className="text-5xl font-bold mb-5 tracking-widest drop-shadow-lg" style={{ color: '#f3e5ab' }}>{partner2}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-px opacity-70" style={{ backgroundColor: '#d4af37' }} />
            <span className="text-xl" style={{ color: '#f3e5ab' }}>✦</span>
            <div className="w-14 h-px opacity-70" style={{ backgroundColor: '#d4af37' }} />
          </div>

          {isMultiEvent ? (
            <div className="flex flex-col gap-3.5 w-full max-w-[85%] my-2">
              {eventsToRender.map((ev, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-xs font-bold tracking-[0.25em] uppercase" style={{ fontFamily: 'sans-serif', color: '#f3e5ab' }}>{ev.name}</span>
                  <span className="text-base tracking-wider mt-0.5 font-semibold" style={{ color: '#ffffff' }}>{ev.date} {ev.time && `· ${ev.time}`}</span>
                  {ev.venue && <span className="text-[11px] uppercase tracking-wider opacity-85" style={{ fontFamily: 'sans-serif', color: '#e5ca78' }}>{ev.venue}</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center mb-4">
              <p className="text-xs font-bold tracking-[0.25em] uppercase mb-1" style={{ fontFamily: 'sans-serif', color: '#e5ca78' }}>{eventsToRender[0].name}</p>
              <p className="text-2xl mb-1 tracking-wider font-semibold" style={{ color: '#ffffff' }}>{eventsToRender[0].date}</p>
              <p className="text-base mb-4 tracking-widest" style={{ color: '#f3e5ab' }}>{eventsToRender[0].time}</p>
              <p className="text-lg tracking-wider uppercase font-semibold" style={{ color: '#ffffff' }}>{eventsToRender[0].venue || defaultVenue}</p>
            </div>
          )}

          {flowData.venueAddress && !isMultiEvent && (
            <p className="text-xs mt-2 max-w-[70%] mx-auto leading-relaxed" style={{ fontFamily: 'sans-serif', color: 'rgba(255,255,255,0.8)' }}>{flowData.venueAddress.split('|||')[0]}</p>
          )}
        </div>
        <CardBranding color="#e5ca78" />
      </div>
    )
  }

  // --- Theme: Minimalist Modern (ROYAL PLAN) ---
  if (theme === 'minimalist-modern') {
    return (
      <div id="printable-card-node" className="relative w-[595px] h-[842px] mx-auto overflow-hidden flex flex-col items-center justify-center p-12 text-center"
        style={{ backgroundColor: '#FAF8F5', fontFamily: "Georgia, 'Playfair Display', serif", color: '#111111', border: '1px solid #EAE5DC' }}>
        
        {/* Double Champagne Gold Frame */}
        <div className="absolute inset-5 border-[1.5px] pointer-events-none opacity-85" style={{ borderColor: '#C5A059' }} />
        <div className="absolute inset-7 border pointer-events-none opacity-40" style={{ borderColor: '#C5A059' }} />

        {/* Modern Corner Architectural Notches */}
        <ModernCornerNotches color="#C5A059" />

        <div className="relative z-10 w-full flex flex-col items-center px-6">
          <ModernLuxuryHeader p1={partner1} p2={partner2} color="#C5A059" />

          <p className="tracking-[0.35em] uppercase text-[10px] mb-5 font-sans font-medium" style={{ color: '#777777' }}>
            Please join us for the wedding of
          </p>

          <h1 className="text-5xl font-normal mb-2 tracking-[0.18em] uppercase" style={{ color: '#111111' }}>
            {partner1}
          </h1>

          <div className="flex items-center gap-4 my-2 opacity-75">
            <div className="w-10 h-px" style={{ backgroundColor: '#C5A059' }} />
            <span className="text-sm font-sans italic" style={{ color: '#C5A059' }}>and</span>
            <div className="w-10 h-px" style={{ backgroundColor: '#C5A059' }} />
          </div>

          <h1 className="text-5xl font-normal mt-2 mb-5 tracking-[0.18em] uppercase" style={{ color: '#111111' }}>
            {partner2}
          </h1>

          <div className="w-16 h-px mb-5" style={{ backgroundColor: '#C5A059', opacity: 0.4 }} />

          {isMultiEvent ? (
            <div className="flex flex-col gap-3.5 w-full max-w-[85%] my-1 font-sans">
              {eventsToRender.map((ev, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-xs font-bold tracking-[0.25em] uppercase" style={{ color: '#B8860B' }}>{ev.name}</span>
                  <span className="text-xs tracking-[0.15em] uppercase mt-0.5 font-medium" style={{ color: '#333333' }}>{ev.date} {ev.time && `at ${ev.time}`}</span>
                  {ev.venue && <span className="text-[10px] tracking-wider uppercase opacity-75 mt-0.5" style={{ color: '#666666' }}>{ev.venue}</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center mb-4">
              <p className="text-xs font-bold tracking-[0.25em] uppercase mb-1 font-sans" style={{ color: '#B8860B' }}>{eventsToRender[0].name}</p>
              <div className="flex flex-col items-center gap-0.5 mb-4 text-xs tracking-[0.2em] uppercase font-sans" style={{ color: '#444444' }}>
                <p className="font-semibold text-sm" style={{ color: '#111111' }}>{eventsToRender[0].date}</p>
                <p>At {eventsToRender[0].time}</p>
              </div>
              <p className="text-base tracking-[0.18em] uppercase font-medium" style={{ color: '#111111' }}>{eventsToRender[0].venue || defaultVenue}</p>
            </div>
          )}

          {flowData.venueAddress && !isMultiEvent && (
            <p className="text-[11px] mt-2 max-w-[75%] mx-auto tracking-wider uppercase font-sans" style={{ color: '#777777' }}>
              {flowData.venueAddress.split('|||')[0]}
            </p>
          )}
        </div>

        <CardBranding color="#999999" />
      </div>
    )
  }

  // --- Theme: Luxurious Botanical ---
  if (theme === 'luxurious-botanical') {
    return (
      <div id="printable-card-node" className="relative w-[595px] h-[842px] mx-auto overflow-hidden flex flex-col items-center justify-center p-12 text-center"
        style={{ backgroundColor: '#051810', backgroundImage: 'radial-gradient(ellipse at center, #0e3020 0%, #03100a 100%)', fontFamily: "'Great Vibes', cursive", color: '#E4D5B7' }}>
        
        {/* Soft Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-52 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top left, #1A4D34, transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-full h-52 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(ellipse at bottom right, #1A4D34, transparent 70%)' }} />
        <div className="absolute inset-6 border border-dashed opacity-50 rounded-lg pointer-events-none" style={{ borderColor: '#E4D5B7' }} />
        <div className="absolute inset-8 border opacity-25 rounded-md pointer-events-none" style={{ borderColor: '#E4D5B7' }} />
        
        <div className="relative z-10 w-full flex flex-col items-center px-4">
          <BotanicalCrestWreath color="#E4D5B7" accent="#9BB8A1" />

          <p className="tracking-[0.2em] uppercase text-xs mb-4 font-sans" style={{ color: '#9BB8A1' }}>Celebrating the Union Of</p>
          
          <h1 className="text-6xl mb-1 drop-shadow-lg" style={{ color: '#F5E6C8' }}>{partner1}</h1>
          <span className="text-2xl mb-1 font-sans" style={{ color: '#9BB8A1' }}>&amp;</span>
          <h1 className="text-6xl mb-5 drop-shadow-lg" style={{ color: '#F5E6C8' }}>{partner2}</h1>
          
          <div className="w-20 h-px mb-5" style={{ backgroundColor: '#E4D5B7', opacity: 0.35 }} />
          
          {isMultiEvent ? (
            <div className="flex flex-col gap-3.5 w-full max-w-[85%] my-1 font-sans">
              {eventsToRender.map((ev, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: '#F5E6C8' }}>{ev.name}</span>
                  <span className="text-xs tracking-widest uppercase mt-0.5 font-semibold" style={{ color: '#9BB8A1' }}>{ev.date} {ev.time && `· ${ev.time}`}</span>
                  {ev.venue && <span className="text-[10px] tracking-wider uppercase opacity-85 mt-0.5" style={{ color: '#9BB8A1' }}>{ev.venue}</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center mb-4">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-1 font-sans" style={{ color: '#F5E6C8' }}>{eventsToRender[0].name}</p>
              <div className="text-xs tracking-widest uppercase mb-4 font-sans" style={{ color: '#9BB8A1', lineHeight: '1.8' }}>
                <p className="font-semibold text-sm" style={{ color: '#F5E6C8' }}>{eventsToRender[0].date}</p>
                <p>{eventsToRender[0].time}</p>
              </div>
              <p className="text-xl mb-1 font-serif" style={{ color: '#F5E6C8' }}>{eventsToRender[0].venue || defaultVenue}</p>
            </div>
          )}

          {flowData.venueAddress && !isMultiEvent && (
            <p className="text-[11px] max-w-[65%] mx-auto uppercase tracking-wide opacity-85 font-sans" style={{ color: '#9BB8A1' }}>{flowData.venueAddress.split('|||')[0]}</p>
          )}
        </div>
        <CardBranding color="#9BB8A1" />
      </div>
    )
  }

  // --- Theme: Minimalist Floral ---
  return (
    <div id="printable-card-node" className="relative w-[595px] h-[842px] mx-auto overflow-hidden flex flex-col items-center justify-center p-12 text-center"
      style={{ backgroundColor: '#FAF7F2', fontFamily: "'Great Vibes', cursive", color: '#2D4030' }}>
      
      <div className="absolute inset-6 border opacity-35 rounded-md pointer-events-none" style={{ borderColor: '#84A088' }} />

      <div className="relative z-10 w-full flex flex-col items-center px-4">
        <BotanicalLeafHeader color="#84A088" />

        <p className="tracking-[0.2em] uppercase text-xs mb-8 font-sans" style={{ color: '#5B7A60' }}>Together with their families</p>
        <h1 className="text-6xl font-normal mb-2" style={{ color: '#2D4030' }}>{partner1}</h1>
        <span className="text-2xl mb-2 font-sans" style={{ color: '#84A088' }}>&amp;</span>
        <h1 className="text-6xl font-normal mb-8" style={{ color: '#2D4030' }}>{partner2}</h1>
        
        {isMultiEvent ? (
          <div className="flex flex-col gap-3.5 w-full max-w-[85%] my-1 font-sans">
            {eventsToRender.map((ev, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: '#2D4030' }}>{ev.name}</span>
                <span className="text-xs tracking-widest uppercase mt-0.5" style={{ color: '#5B7A60' }}>{ev.date} {ev.time && `· ${ev.time}`}</span>
                {ev.venue && <span className="text-[10px] tracking-wider uppercase opacity-80 mt-0.5" style={{ color: '#5B7A60' }}>{ev.venue}</span>}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center mb-4">
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-1 font-sans" style={{ color: '#2D4030' }}>{eventsToRender[0].name}</p>
            <div className="text-xs tracking-widest uppercase mb-5 font-sans" style={{ color: '#5B7A60', lineHeight: '1.8' }}>
              <p className="font-semibold text-sm" style={{ color: '#2D4030' }}>{eventsToRender[0].date}</p>
              <p>At {eventsToRender[0].time}</p>
            </div>
            <p className="text-xl mb-1 font-sans" style={{ color: '#2D4030' }}>{eventsToRender[0].venue || defaultVenue}</p>
          </div>
        )}

        {flowData.venueAddress && !isMultiEvent && (
          <p className="text-xs max-w-[60%] mx-auto uppercase tracking-wide font-sans" style={{ color: '#5B7A60' }}>{flowData.venueAddress.split('|||')[0]}</p>
        )}
      </div>
      <CardBranding color="#84A088" />
    </div>
  )
}
