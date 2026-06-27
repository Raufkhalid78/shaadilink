
'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { MapPin, Calendar, Clock, ChevronDown, Heart, Sparkles, Send, Check, X, Star, Music, Music2, User, MessageCircle, Loader2, Copy, Hotel, Car, Gift, HelpCircle, Info, ChevronLeft, ChevronRight, Maximize, Share2 } from 'lucide-react'
import type { FlowData } from '@/lib/flow-types'
import { TemplateTheme, TEMPLATE_THEMES, DEFAULT_THEME } from '../themes';
import { InvitationViewerProps, hexToRgb, getTheme, extractColors, parseGiftDetails, getCalendarDates, getGoogleCalendarLink, generateICSContent, getOutlookWebLink, formatScratchDate, formatScratchTime } from '../utils';


/* ─── Door Handle - Per-type realistic hardware ─── */
export function DoorHandle({ theme, side }: { theme: TemplateTheme; side: 'left' | 'right' }) {
  const ds = theme.doorStyle
  const a = theme.accentRgb
  const al = theme.accentLight
  const ad = theme.accentDark
  const ac = theme.accent
  const posClass = side === 'left' ? 'right-5' : 'left-5'

  switch (ds.handleType) {
    case 'none':
      return null

    case 'ring-knocker':
      return (
        <div className={`absolute ${posClass} top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-10`}>
          {/* Door knocker ring */}
          <div className="relative">
            {/* Knocker plate / backplate */}
            <div className="w-10 h-12 rounded" style={{
              background: `linear-gradient(145deg, ${al}, ${ac}, ${ad})`,
              boxShadow: `0 3px 8px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.2)`,
              border: `1px solid rgba(${a},0.6)`,
            }}>
              {/* Plate screw holes */}
              <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.25)', boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.15)' }} />
              <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.25)', boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.15)' }} />
              <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.25)', boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.15)' }} />
              <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.25)', boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.15)' }} />
            </div>
            {/* Knocker ring */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-7 h-9 rounded-full border-[3px]" style={{
              borderColor: ac,
              boxShadow: `0 2px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.25), 0 0 8px rgba(${a},0.3)`,
              background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.12), transparent)`,
            }} />
            {/* Attachment point */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full" style={{
              background: `linear-gradient(145deg, ${al}, ${ad})`,
              boxShadow: `0 1px 2px rgba(0,0,0,0.3)`,
            }} />
          </div>
          {/* Keyhole plate */}
          <div className="w-6 h-10 rounded relative" style={{
            background: `linear-gradient(145deg, ${ad}, ${ac}, ${ad})`,
            boxShadow: `0 2px 5px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.2)`,
            border: `1px solid rgba(${a},0.4)`,
          }}>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.7)', boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.1)' }} />
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-0.5 h-3" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }} />
            <div className="absolute inset-1 rounded-sm border" style={{ borderColor: `rgba(${a},0.25)` }} />
          </div>
        </div>
      )

    case 'lever':
      return (
        <div className={`absolute ${posClass} top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10`}>
          {/* Lever handle - horizontal bar */}
          <div className="relative">
            {/* Backplate */}
            <div className="w-8 h-20 rounded-lg" style={{
              background: `linear-gradient(145deg, ${al}, ${ac}, ${ad})`,
              boxShadow: `0 2px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.2)`,
              border: `1px solid rgba(${a},0.5)`,
            }}>
              {/* Screw holes */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.3)', boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.15)' }} />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.3)', boxShadow: 'inset 0 0.5px 1px rgba(255,255,255,0.15)' }} />
            </div>
            {/* Lever arm */}
            <div className="absolute top-1/2 -translate-y-1/2" style={{
              [side === 'left' ? 'right' : 'left']: '100%',
              width: '28px',
              height: '6px',
              background: `linear-gradient(180deg, ${al}, ${ac}, ${ad})`,
              borderRadius: '0 3px 3px 0',
              boxShadow: `0 2px 4px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.15)`,
            }} />
            {/* Lever tip */}
            <div className="absolute top-1/2 -translate-y-1/2" style={{
              [side === 'left' ? 'right' : 'left']: 'calc(100% + 24px)',
              width: '8px',
              height: '10px',
              background: `linear-gradient(145deg, ${al}, ${ad})`,
              borderRadius: '0 4px 4px 0',
              boxShadow: `0 1px 3px rgba(0,0,0,0.3)`,
            }} />
          </div>
          {/* Keyhole */}
          <div className="w-4 h-6 rounded relative" style={{
            background: `linear-gradient(145deg, ${ad}, ${ac})`,
            boxShadow: `0 1px 3px rgba(0,0,0,0.3)`,
            border: `1px solid rgba(${a},0.3)`,
          }}>
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} />
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-0.5 h-2" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} />
          </div>
        </div>
      )

    case 'iron-ring':
      return (
        <div className={`absolute ${posClass} top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-10`}>
          {/* Heavy iron ring handle */}
          <div className="relative">
            {/* Mounting plate */}
            <div className="w-10 h-14 rounded-sm" style={{
              background: `linear-gradient(145deg, #555, #333, #222)`,
              boxShadow: `0 3px 8px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.08)`,
              border: `1px solid rgba(${a},0.3)`,
            }}>
              {/* Rivets */}
              <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full" style={{ background: 'radial-gradient(circle at 40% 35%, #666, #222)', boxShadow: '0 1px 1px rgba(0,0,0,0.3)' }} />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'radial-gradient(circle at 40% 35%, #666, #222)', boxShadow: '0 1px 1px rgba(0,0,0,0.3)' }} />
              <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full" style={{ background: 'radial-gradient(circle at 40% 35%, #666, #222)', boxShadow: '0 1px 1px rgba(0,0,0,0.3)' }} />
              <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: 'radial-gradient(circle at 40% 35%, #666, #222)', boxShadow: '0 1px 1px rgba(0,0,0,0.3)' }} />
            </div>
            {/* Iron ring */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-10 rounded-full border-[4px]" style={{
              borderColor: '#444',
              boxShadow: `0 2px 6px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.08), 0 0 6px rgba(${a},0.15)`,
              background: `radial-gradient(circle at 40% 35%, rgba(255,255,255,0.06), transparent)`,
            }} />
            {/* Ring attachment */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full" style={{
              background: `linear-gradient(145deg, #555, #222)`,
              boxShadow: `0 1px 2px rgba(0,0,0,0.4)`,
            }} />
          </div>
        </div>
      )

    case 'crystal':
      return (
        <div className={`absolute ${posClass} top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10`}>
          {/* Crystal/delicate knob */}
          <div className="relative">
            {/* Small backplate */}
            <div className="w-6 h-6 rounded-full" style={{
              background: `linear-gradient(145deg, ${al}, ${ac})`,
              boxShadow: `0 2px 5px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)`,
              border: `1px solid rgba(${a},0.5)`,
            }} />
            {/* Crystal knob - clear/frosted look */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full" style={{
              background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35), rgba(255,255,255,0.15) 40%, rgba(${a},0.2) 70%, rgba(${a},0.1))`,
              boxShadow: `0 2px 8px rgba(0,0,0,0.3), 0 0 12px rgba(${a},0.2), inset 0 1px 3px rgba(255,255,255,0.3)`,
              border: `1.5px solid rgba(${a},0.35)`,
            }}>
              {/* Internal refraction highlight */}
              <div className="absolute top-1 left-1.5 w-2 h-2 rounded-full" style={{
                background: `radial-gradient(circle, rgba(255,255,255,0.6), transparent)`,
              }} />
            </div>
            {/* Knob stem */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-3" style={{
              background: `linear-gradient(180deg, ${al}, ${ac})`,
              borderRadius: '1px',
            }} />
          </div>
        </div>
      )

    case 'pull':
      return (
        <div className={`absolute ${posClass} top-1/2 -translate-y-1/2 z-10`}>
          {/* Modern pull handle - horizontal bar */}
          <div className="w-2 h-16 rounded-full" style={{
            background: `linear-gradient(180deg, #888, #555, #888)`,
            boxShadow: `0 2px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.15)`,
          }}>
            {/* Top mount */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-3 rounded-sm" style={{
              background: `linear-gradient(145deg, #777, #444)`,
              boxShadow: `0 1px 2px rgba(0,0,0,0.3)`,
            }}>
              <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} />
            </div>
            {/* Bottom mount */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-3 rounded-sm" style={{
              background: `linear-gradient(145deg, #777, #444)`,
              boxShadow: `0 1px 2px rgba(0,0,0,0.3)`,
            }}>
              <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} />
            </div>
          </div>
        </div>
      )

    default:
      return null
  }
}

/* ─── Door Hinges ─── */
export function DoorHinges({ side, accent, accentRgb }: { side: 'left' | 'right'; accent: string; accentRgb: string }) {
  const hingePositions = ['15%', '45%', '75%']
  const posClass = side === 'left' ? 'left-1 -translate-x-1/3' : 'right-1 translate-x-1/3'
  return (
    <>
      {hingePositions.map((top, i) => (
        <div key={i} className={`absolute ${posClass}`} style={{ top, zIndex: 5 }}>
          {/* Hinge body - wider and taller */}
          <div className="w-4 h-14 rounded-sm" style={{
            background: `linear-gradient(${side === 'left' ? '90deg' : '270deg'}, ${accent}, ${accent}aa)`,
            boxShadow: `0 2px 5px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.2)`,
            border: `1px solid rgba(${accentRgb},0.6)`,
          }}>
            {/* Hinge pin dots - larger */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.4)', boxShadow: 'inset 0 0.5px 0.5px rgba(255,255,255,0.2)' }} />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.4)', boxShadow: 'inset 0 0.5px 0.5px rgba(255,255,255,0.2)' }} />
            {/* Center screw */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} />
          </div>
          {/* Hinge plate (mortise) - wider */}
          <div className={`absolute ${side === 'left' ? '-left-1' : '-right-1'} top-0 w-6 h-14 rounded-sm`} style={{
            background: `rgba(${accentRgb},0.2)`,
            border: `1px solid rgba(${accentRgb},0.25)`,
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)',
          }}>
            {/* Mortise screw holes */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} />
          </div>
        </div>
      ))}
    </>
  )
}