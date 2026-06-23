'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useInView } from 'framer-motion'
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

/* ─── Template Theme Configuration ─── */
export interface TemplateTheme {
  id: string
  name: string
  // Background colors
  bgPrimary: string
  bgSecondary: string
  bgDoor: string
  bgDoorGradient: string
  // Accent / gold colors
  accent: string
  accentLight: string
  accentDark: string
  accentRgb: string // for rgba usage
  // Text colors
  textPrimary: string
  textSecondary: string
  textMuted: string
  // Border / ornamental
  borderAccent: string
  borderSubtle: string
  // Scratch card
  scratchBg: string[]
  scratchAccent: string
  // Firework colors
  fireworkColors: string[]
  // Confetti colors
  confettiColors: string[]
  // Door style configuration
  doorStyle: {
    type: 'classic-doors' | 'curtains' | 'petals' | 'split-screen' | 'archway' | 'scroll' | 'geometric' | 'lotus' | 'lantern' | 'dome'
    doorMaterial: 'wood' | 'lacquer' | 'glass' | 'stone' | 'painted'
    panelLayout: '2-panel' | '4-panel' | 'arched-panel' | 'glass-grid' | 'flat' | 'carved' | 'studded'
    handleType: 'ring-knocker' | 'lever' | 'pull' | 'iron-ring' | 'crystal' | 'none'
    frameStyle: 'ornate' | 'simple' | 'arched-stone' | 'painted-rosettes' | 'modern'
    leftText: string
    rightText: string
    leftTextLang: 'ar' | 'en' | 'ur'
    rightTextLang: 'ar' | 'en' | 'ur'
    svgPattern: 'arch' | 'geometric' | 'floral' | 'minimal' | 'mandala' | 'paisley' | 'diamond' | 'star' | 'lantern' | 'dome'
    centerIcon: string
    animationClass: string
    buttonStyle: 'circle' | 'diamond' | 'shield' | 'hexagon' | 'star'
  }
  fontDisplay?: string
  fontCalligraphy?: string
  isLight?: boolean
  getOpacityStyle: (type: 'text' | 'bg' | 'border', defaultOpacity: number) => string
}

const TEMPLATE_THEMES: Record<string, Omit<TemplateTheme, 'getOpacityStyle'>> = {
  'emerald-noir': {
    id: 'emerald-noir',
    name: 'Emerald Noir',
    bgPrimary: '#0f1a16',
    bgSecondary: '#0a1210',
    bgDoor: '#152822',
    bgDoorGradient: 'linear-gradient(135deg, #152822 0%, #1f332c 50%, #141f1b 100%)',
    accent: '#d4a853',
    accentLight: '#e8c66a',
    accentDark: '#b4914d',
    accentRgb: '180,145,77',
    textPrimary: '#e0ccaa',
    textSecondary: '#c9a96e',
    textMuted: '#8f7c56',
    borderAccent: 'rgba(180,145,77,0.4)',
    borderSubtle: 'rgba(180,145,77,0.15)',
    scratchBg: ['#1a332a', '#0f2920', '#1a3530'],
    scratchAccent: '#d4a853',
    fireworkColors: ['#b4914d', '#d4a853', '#e8c66a', '#8b6d2f', '#fff4d0', '#f0d78c', '#ffd700'],
    confettiColors: ['#b4914d', '#d4a853', '#e8c66a', '#22c55e', '#f0d78c', '#fff4d0', '#e8a4b8'],
    doorStyle: {
      type: 'classic-doors',
      doorMaterial: 'wood',
      panelLayout: 'carved',
      handleType: 'ring-knocker',
      frameStyle: 'ornate',
      leftText: 'بِسْمِ اللَّهِ',
      rightText: 'الرَّحْمَنِ الرَّحِيمِ',
      leftTextLang: 'ar',
      rightTextLang: 'ar',
      svgPattern: 'arch',
      centerIcon: '✦',
      animationClass: 'door-open',
      buttonStyle: 'circle',
    },
  },
  'crimson-royale': {
    id: 'crimson-royale',
    name: 'Crimson Royale',
    bgPrimary: '#1a0a0e',
    bgSecondary: '#120810',
    bgDoor: '#2a1018',
    bgDoorGradient: 'linear-gradient(135deg, #2a1018 0%, #3d1525 50%, #1f0e16 100%)',
    accent: '#dc2626',
    accentLight: '#f87171',
    accentDark: '#991b1b',
    accentRgb: '220,38,38',
    textPrimary: '#f5c6c6',
    textSecondary: '#d4a0a0',
    textMuted: '#8b5e5e',
    borderAccent: 'rgba(220,38,38,0.4)',
    borderSubtle: 'rgba(220,38,38,0.15)',
    scratchBg: ['#2a1018', '#1f0e16', '#3d1525'],
    scratchAccent: '#dc2626',
    fireworkColors: ['#dc2626', '#f87171', '#ef4444', '#b91c1c', '#d4a853', '#ffd700', '#fca5a5'],
    confettiColors: ['#dc2626', '#f87171', '#d4a853', '#ffd700', '#ef4444', '#fca5a5', '#e8c66a'],
    doorStyle: {
      type: 'curtains',
      doorMaterial: 'painted',
      panelLayout: 'flat',
      handleType: 'none',
      frameStyle: 'painted-rosettes',
      leftText: 'نّ',
      rightText: 'و',
      leftTextLang: 'ar',
      rightTextLang: 'ar',
      svgPattern: 'floral',
      centerIcon: '👑',
      animationClass: 'door-open',
      buttonStyle: 'shield',
    },
  },
  'majestic-love': {
    id: 'majestic-love',
    name: 'Majestic Love',
    bgPrimary: '#1a1408',
    bgSecondary: '#12100a',
    bgDoor: '#2a2010',
    bgDoorGradient: 'linear-gradient(135deg, #2a2010 0%, #3d3018 50%, #1f1a0e 100%)',
    accent: '#f59e0b',
    accentLight: '#fbbf24',
    accentDark: '#d97706',
    accentRgb: '245,158,11',
    textPrimary: '#f5e6c8',
    textSecondary: '#d4b88a',
    textMuted: '#8b7650',
    borderAccent: 'rgba(245,158,11,0.4)',
    borderSubtle: 'rgba(245,158,11,0.15)',
    scratchBg: ['#2a2010', '#1f1a0e', '#3d3018'],
    scratchAccent: '#f59e0b',
    fireworkColors: ['#f59e0b', '#fbbf24', '#d97706', '#92400e', '#fff4d0', '#fde68a', '#ffd700'],
    confettiColors: ['#f59e0b', '#fbbf24', '#d97706', '#ffd700', '#fde68a', '#fff4d0', '#e8a4b8'],
    doorStyle: {
      type: 'scroll',
      doorMaterial: 'painted',
      panelLayout: 'flat',
      handleType: 'none',
      frameStyle: 'simple',
      leftText: 'ع',
      rightText: 'ش',
      leftTextLang: 'ar',
      rightTextLang: 'ar',
      svgPattern: 'paisley',
      centerIcon: '💫',
      animationClass: 'door-open',
      buttonStyle: 'diamond',
    },
  },
  'garden-romance': {
    id: 'garden-romance',
    name: 'Garden Romance',
    bgPrimary: '#1a0a14',
    bgSecondary: '#120810',
    bgDoor: '#2a1020',
    bgDoorGradient: 'linear-gradient(135deg, #2a1020 0%, #3d1830 50%, #1f0e18 100%)',
    accent: '#ec4899',
    accentLight: '#f472b6',
    accentDark: '#be185d',
    accentRgb: '236,72,153',
    textPrimary: '#f5c6e0',
    textSecondary: '#d4a0c0',
    textMuted: '#8b5e78',
    borderAccent: 'rgba(236,72,153,0.4)',
    borderSubtle: 'rgba(236,72,153,0.15)',
    scratchBg: ['#2a1020', '#1f0e18', '#3d1830'],
    scratchAccent: '#ec4899',
    fireworkColors: ['#ec4899', '#f472b6', '#db2777', '#9d174d', '#ffd700', '#fbbf24', '#fca5a5'],
    confettiColors: ['#ec4899', '#f472b6', '#db2777', '#ffd700', '#fbbf24', '#fca5a5', '#e8c66a'],
    doorStyle: {
      type: 'petals',
      doorMaterial: 'painted',
      panelLayout: 'flat',
      handleType: 'none',
      frameStyle: 'painted-rosettes',
      leftText: 'Garden',
      rightText: 'Romance',
      leftTextLang: 'en',
      rightTextLang: 'en',
      svgPattern: 'floral',
      centerIcon: '🌸',
      animationClass: 'door-open',
      buttonStyle: 'circle',
    },
  },
  'modern-minimal': {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    bgPrimary: '#0a0e1a',
    bgSecondary: '#080c14',
    bgDoor: '#101828',
    bgDoorGradient: 'linear-gradient(135deg, #101828 0%, #182038 50%, #0e1420 100%)',
    accent: '#60a5fa',
    accentLight: '#93c5fd',
    accentDark: '#3b82f6',
    accentRgb: '96,165,250',
    textPrimary: '#c8daf5',
    textSecondary: '#a0b8d4',
    textMuted: '#5e788b',
    borderAccent: 'rgba(96,165,250,0.4)',
    borderSubtle: 'rgba(96,165,250,0.15)',
    scratchBg: ['#101828', '#0e1420', '#182038'],
    scratchAccent: '#60a5fa',
    fireworkColors: ['#60a5fa', '#93c5fd', '#3b82f6', '#1d4ed8', '#ffd700', '#d4a853', '#dbeafe'],
    confettiColors: ['#60a5fa', '#93c5fd', '#3b82f6', '#ffd700', '#d4a853', '#dbeafe', '#e8c66a'],
    doorStyle: {
      type: 'split-screen',
      doorMaterial: 'glass',
      panelLayout: 'flat',
      handleType: 'none',
      frameStyle: 'modern',
      leftText: 'Save',
      rightText: 'Date',
      leftTextLang: 'en',
      rightTextLang: 'en',
      svgPattern: 'minimal',
      centerIcon: '▷',
      animationClass: 'door-open',
      buttonStyle: 'hexagon',
    },
  },
  'mughal-emerald': {
    id: 'mughal-emerald',
    name: 'Mughal Emerald',
    bgPrimary: '#0a1a18',
    bgSecondary: '#081412',
    bgDoor: '#102a25',
    bgDoorGradient: 'linear-gradient(135deg, #102a25 0%, #183d35 50%, #0e2018 100%)',
    accent: '#2dd4bf',
    accentLight: '#5eead4',
    accentDark: '#14b8a6',
    accentRgb: '45,212,191',
    textPrimary: '#c8f5ef',
    textSecondary: '#a0d4c8',
    textMuted: '#5e8b80',
    borderAccent: 'rgba(45,212,191,0.4)',
    borderSubtle: 'rgba(45,212,191,0.15)',
    scratchBg: ['#102a25', '#0e2018', '#183d35'],
    scratchAccent: '#2dd4bf',
    fireworkColors: ['#2dd4bf', '#5eead4', '#14b8a6', '#0d9488', '#ffd700', '#d4a853', '#a7f3d0'],
    confettiColors: ['#2dd4bf', '#5eead4', '#14b8a6', '#ffd700', '#d4a853', '#a7f3d0', '#e8c66a'],
    doorStyle: {
      type: 'archway',
      doorMaterial: 'stone',
      panelLayout: 'carved',
      handleType: 'iron-ring',
      frameStyle: 'arched-stone',
      leftText: 'مغل',
      rightText: 'شاهی',
      leftTextLang: 'ur',
      rightTextLang: 'ur',
      svgPattern: 'mandala',
      centerIcon: '🕌',
      animationClass: 'door-open',
      buttonStyle: 'circle',
    },
  },
  'rose-gold-blush': {
    id: 'rose-gold-blush',
    name: 'Rose Gold Blush',
    isLight: true,
    bgPrimary: '#fff1f2',
    bgSecondary: '#ffffff',
    bgDoor: '#ffe4e6',
    bgDoorGradient: 'linear-gradient(135deg, #ffe4e6 0%, #ffffff 50%, #fecdd3 100%)',
    accent: '#be185d',
    accentLight: '#db2777',
    accentDark: '#9d174d',
    accentRgb: '190,24,93',
    textPrimary: '#881337',
    textSecondary: '#9d174d',
    textMuted: '#db2777',
    borderAccent: 'rgba(190,24,93,0.2)',
    borderSubtle: 'rgba(190,24,93,0.08)',
    scratchBg: ['#fecdd3', '#fda4af', '#fff1f2'],
    scratchAccent: '#be185d',
    fireworkColors: ['#be185d', '#db2777', '#9d174d', '#fda4af', '#fecdd3', '#ffffff'],
    confettiColors: ['#be185d', '#db2777', '#9d174d', '#fda4af', '#fecdd3', '#ffffff'],
    doorStyle: {
      type: 'lotus',
      doorMaterial: 'painted',
      panelLayout: 'flat',
      handleType: 'none',
      frameStyle: 'painted-rosettes',
      leftText: 'Rose',
      rightText: 'Gold',
      leftTextLang: 'en',
      rightTextLang: 'en',
      svgPattern: 'floral',
      centerIcon: '🌹',
      animationClass: 'door-open',
      buttonStyle: 'diamond',
    },
    fontDisplay: 'font-display',
    fontCalligraphy: 'font-calligraphy',
  },
  'ivory-dream': {
    id: 'ivory-dream',
    name: 'Ivory Dream',
    isLight: true,
    bgPrimary: '#fafaf9',
    bgSecondary: '#ffffff',
    bgDoor: '#f5f5f4',
    bgDoorGradient: 'linear-gradient(135deg, #f5f5f4 0%, #ffffff 50%, #e7e5e4 100%)',
    accent: '#78350f',
    accentLight: '#b45309',
    accentDark: '#451a03',
    accentRgb: '120,53,15',
    textPrimary: '#451a03',
    textSecondary: '#78350f',
    textMuted: '#a16207',
    borderAccent: 'rgba(120,53,15,0.25)',
    borderSubtle: 'rgba(120,53,15,0.1)',
    scratchBg: ['#e7e5e4', '#d6d3d1', '#fafaf9'],
    scratchAccent: '#78350f',
    fireworkColors: ['#78350f', '#b45309', '#451a03', '#d6d3d1', '#fafaf9', '#ffffff'],
    confettiColors: ['#78350f', '#b45309', '#451a03', '#d6d3d1', '#fafaf9', '#ffffff'],
    doorStyle: {
      type: 'curtains',
      doorMaterial: 'painted',
      panelLayout: 'flat',
      handleType: 'none',
      frameStyle: 'ornate',
      leftText: 'Ivory',
      rightText: 'Dream',
      leftTextLang: 'en',
      rightTextLang: 'en',
      svgPattern: 'diamond',
      centerIcon: '◈',
      animationClass: 'door-open',
      buttonStyle: 'diamond',
    },
    fontDisplay: 'font-display',
    fontCalligraphy: 'font-calligraphy',
  },
  'royal-imperial': {
    id: 'royal-imperial',
    name: 'Royal Imperial',
    bgPrimary: '#1a100a',
    bgSecondary: '#120c08',
    bgDoor: '#2a1a10',
    bgDoorGradient: 'linear-gradient(135deg, #2a1a10 0%, #3d2818 50%, #1f140e 100%)',
    accent: '#f59e0b',
    accentLight: '#fbbf24',
    accentDark: '#d97706',
    accentRgb: '245,158,11',
    textPrimary: '#f5e6c8',
    textSecondary: '#d4b88a',
    textMuted: '#8b7650',
    borderAccent: 'rgba(245,158,11,0.5)',
    borderSubtle: 'rgba(245,158,11,0.2)',
    scratchBg: ['#2a1a10', '#1f140e', '#3d2818'],
    scratchAccent: '#f59e0b',
    fireworkColors: ['#f59e0b', '#fbbf24', '#d97706', '#92400e', '#ffd700', '#fff4d0', '#fde68a', '#e8c66a'],
    confettiColors: ['#f59e0b', '#fbbf24', '#d97706', '#ffd700', '#fde68a', '#fff4d0', '#e8a4b8', '#ec4899'],
    doorStyle: {
      type: 'dome',
      doorMaterial: 'stone',
      panelLayout: 'carved',
      handleType: 'none',
      frameStyle: 'ornate',
      leftText: 'سلطنت',
      rightText: 'شاهی',
      leftTextLang: 'ur',
      rightTextLang: 'ur',
      svgPattern: 'dome',
      centerIcon: '🏰',
      animationClass: 'door-open',
      buttonStyle: 'shield',
    },
  },
  'royal-elegance': {
    id: 'royal-elegance',
    name: 'Royal Elegance',
    bgPrimary: '#1a080e',
    bgSecondary: '#12060a',
    bgDoor: '#2a1018',
    bgDoorGradient: 'linear-gradient(135deg, #2a1018 0%, #3d1525 50%, #1f0e16 100%)',
    accent: '#f43f5e',
    accentLight: '#fb7185',
    accentDark: '#e11d48',
    accentRgb: '244,63,94',
    textPrimary: '#f5c6d0',
    textSecondary: '#d4a0b0',
    textMuted: '#8b5e6e',
    borderAccent: 'rgba(244,63,94,0.5)',
    borderSubtle: 'rgba(244,63,94,0.2)',
    scratchBg: ['#2a1018', '#1f0e16', '#3d1525'],
    scratchAccent: '#f43f5e',
    fireworkColors: ['#f43f5e', '#fb7185', '#e11d48', '#be123c', '#ffd700', '#d4a853', '#fecdd3', '#e8c66a'],
    confettiColors: ['#f43f5e', '#fb7185', '#e11d48', '#ffd700', '#d4a853', '#fecdd3', '#e8c66a', '#fbbf24'],
    doorStyle: {
      type: 'lantern',
      doorMaterial: 'glass',
      panelLayout: 'flat',
      handleType: 'none',
      frameStyle: 'ornate',
      leftText: 'Royal',
      rightText: 'Elegance',
      leftTextLang: 'en',
      rightTextLang: 'en',
      svgPattern: 'star',
      centerIcon: '✨',
      animationClass: 'door-open',
      buttonStyle: 'circle',
    },
  },
  'watercolor-peach': {
    id: 'watercolor-peach',
    name: 'Watercolor Peach',
    isLight: true,
    bgPrimary: '#fff7ed',
    bgSecondary: '#ffffff',
    bgDoor: '#ffedd5',
    bgDoorGradient: 'linear-gradient(135deg, #ffedd5 0%, #ffffff 50%, #fed7aa 100%)',
    accent: '#c2410c',
    accentLight: '#ea580c',
    accentDark: '#9a3412',
    accentRgb: '194,65,12',
    textPrimary: '#7c2d12',
    textSecondary: '#9a3412',
    textMuted: '#ea580c',
    borderAccent: 'rgba(194,65,12,0.2)',
    borderSubtle: 'rgba(194,65,12,0.08)',
    scratchBg: ['#ffedd5', '#fed7aa', '#fff7ed'],
    scratchAccent: '#c2410c',
    fireworkColors: ['#c2410c', '#ea580c', '#9a3412', '#ffedd5', '#fed7aa', '#ffffff'],
    confettiColors: ['#c2410c', '#ea580c', '#9a3412', '#ffedd5', '#fed7aa', '#ffffff'],
    doorStyle: {
      type: 'petals',
      doorMaterial: 'painted',
      panelLayout: 'flat',
      handleType: 'none',
      frameStyle: 'painted-rosettes',
      leftText: 'Watercolor',
      rightText: 'Peach',
      leftTextLang: 'en',
      rightTextLang: 'en',
      svgPattern: 'floral',
      centerIcon: '🍑',
      animationClass: 'door-open',
      buttonStyle: 'circle',
    },
    fontDisplay: 'font-display',
    fontCalligraphy: 'font-calligraphy',
  },
  'geometric-gold': {
    id: 'geometric-gold',
    name: 'Geometric Gold',
    bgPrimary: '#111827',
    bgSecondary: '#0f172a',
    bgDoor: '#1e293b',
    bgDoorGradient: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #0f172a 100%)',
    accent: '#f59e0b',
    accentLight: '#fbbf24',
    accentDark: '#b45309',
    accentRgb: '245,158,11',
    textPrimary: '#fef3c7',
    textSecondary: '#fde68a',
    textMuted: '#78716c',
    borderAccent: 'rgba(245,158,11,0.5)',
    borderSubtle: 'rgba(245,158,11,0.2)',
    scratchBg: ['#1e293b', '#0f172a', '#334155'],
    scratchAccent: '#f59e0b',
    fireworkColors: ['#f59e0b', '#fbbf24', '#b45309', '#d97706', '#ffd700', '#fff4d0', '#fde68a'],
    confettiColors: ['#f59e0b', '#fbbf24', '#b45309', '#ffd700', '#fff4d0', '#fde68a', '#e8c66a'],
    doorStyle: {
      type: 'geometric',
      doorMaterial: 'glass',
      panelLayout: 'glass-grid',
      handleType: 'none',
      frameStyle: 'modern',
      leftText: 'Geometric',
      rightText: 'Gold',
      leftTextLang: 'en',
      rightTextLang: 'en',
      svgPattern: 'geometric',
      centerIcon: '⬡',
      animationClass: 'door-open',
      buttonStyle: 'hexagon',
    },
  },
  'dark-velvet': {
    id: 'dark-velvet',
    name: 'Dark Velvet',
    bgPrimary: '#020617',
    bgSecondary: '#0f172a',
    bgDoor: '#1e293b',
    bgDoorGradient: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #020617 100%)',
    accent: '#8b5cf6',
    accentLight: '#a78bfa',
    accentDark: '#5b21b6',
    accentRgb: '139,92,246',
    textPrimary: '#ddd6fe',
    textSecondary: '#c4b5fd',
    textMuted: '#4c1d95',
    borderAccent: 'rgba(139,92,246,0.5)',
    borderSubtle: 'rgba(139,92,246,0.2)',
    scratchBg: ['#1e293b', '#0f172a', '#334155'],
    scratchAccent: '#8b5cf6',
    fireworkColors: ['#8b5cf6', '#a78bfa', '#5b21b6', '#7c3aed', '#ffd700', '#d8b4fe', '#f3e8ff'],
    confettiColors: ['#8b5cf6', '#a78bfa', '#5b21b6', '#ffd700', '#d8b4fe', '#f3e8ff', '#e8c66a'],
    doorStyle: {
      type: 'classic-doors',
      doorMaterial: 'painted',
      panelLayout: 'flat',
      handleType: 'ring-knocker',
      frameStyle: 'simple',
      leftText: 'Dark',
      rightText: 'Velvet',
      leftTextLang: 'en',
      rightTextLang: 'en',
      svgPattern: 'diamond',
      centerIcon: '✦',
      animationClass: 'door-open',
      buttonStyle: 'circle',
    },
  },
  'pastel-floral': {
    id: 'pastel-floral',
    name: 'Pastel Floral',
    isLight: true,
    bgPrimary: '#fdf2f8',
    bgSecondary: '#ffffff',
    bgDoor: '#fbcfe8',
    bgDoorGradient: 'linear-gradient(135deg, #fbcfe8 0%, #ffffff 50%, #f9a8d4 100%)',
    accent: '#be185d',
    accentLight: '#db2777',
    accentDark: '#9d174d',
    accentRgb: '190,24,93',
    textPrimary: '#831843',
    textSecondary: '#9d174d',
    textMuted: '#db2777',
    borderAccent: 'rgba(190,24,93,0.2)',
    borderSubtle: 'rgba(190,24,93,0.08)',
    scratchBg: ['#fbcfe8', '#f9a8d4', '#fdf2f8'],
    scratchAccent: '#be185d',
    fireworkColors: ['#be185d', '#db2777', '#9d174d', '#fbcfe8', '#f9a8d4', '#ffffff'],
    confettiColors: ['#be185d', '#db2777', '#9d174d', '#fbcfe8', '#f9a8d4', '#ffffff'],
    doorStyle: {
      type: 'curtains',
      doorMaterial: 'painted',
      panelLayout: 'flat',
      handleType: 'none',
      frameStyle: 'painted-rosettes',
      leftText: 'Pastel',
      rightText: 'Floral',
      leftTextLang: 'en',
      rightTextLang: 'en',
      svgPattern: 'floral',
      centerIcon: '🌸',
      animationClass: 'door-open',
      buttonStyle: 'circle',
    },
    fontDisplay: 'font-display',
    fontCalligraphy: 'font-calligraphy',
  },
  'minimal-white': {
    id: 'minimal-white',
    name: 'Minimal White',
    isLight: true,
    bgPrimary: '#f8fafc',
    bgSecondary: '#ffffff',
    bgDoor: '#f1f5f9',
    bgDoorGradient: 'linear-gradient(135deg, #e2e8f0 0%, #ffffff 50%, #cbd5e1 100%)',
    accent: '#0f172a',
    accentLight: '#475569',
    accentDark: '#020617',
    accentRgb: '15,23,42',
    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textMuted: '#64748b',
    borderAccent: 'rgba(15,23,42,0.15)',
    borderSubtle: 'rgba(15,23,42,0.06)',
    scratchBg: ['#0f172a', '#1e293b', '#334155'],
    scratchAccent: '#ffffff',
    fireworkColors: ['#0f172a', '#334155', '#475569', '#64748b', '#cbd5e1', '#ffffff'],
    confettiColors: ['#0f172a', '#334155', '#475569', '#cbd5e1', '#ffffff'],
    doorStyle: {
      type: 'split-screen',
      doorMaterial: 'glass',
      panelLayout: 'flat',
      handleType: 'none',
      frameStyle: 'modern',
      leftText: 'Save',
      rightText: 'Date',
      leftTextLang: 'en',
      rightTextLang: 'en',
      svgPattern: 'minimal',
      centerIcon: '🤍',
      animationClass: 'door-open',
      buttonStyle: 'circle',
    },
    fontDisplay: 'font-display',
    fontCalligraphy: 'font-sans',
  }
}

const DEFAULT_THEME = TEMPLATE_THEMES['emerald-noir']

function hexToRgb(hex: string): string {
  const cleanHex = hex.replace('#', '')
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16)
    const g = parseInt(cleanHex[1] + cleanHex[1], 16)
    const b = parseInt(cleanHex[2] + cleanHex[2], 16)
    return `${r},${g},${b}`
  }
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  return `${r},${g},${b}`
}

export function getTheme(templateId?: string | null): TemplateTheme {
  const theme = !templateId ? DEFAULT_THEME : (TEMPLATE_THEMES[templateId] || DEFAULT_THEME)
  const isRoyal = templateId ? (templateId.includes('royal') || ['crimson-royale', 'majestic-love', 'royal-imperial', 'royal-elegance'].includes(templateId)) : false
  
  const getOpacityStyle = (type: 'text' | 'bg' | 'border', defaultOpacity: number) => {
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
  }

  return {
    ...theme,
    fontDisplay: theme.fontDisplay || (isRoyal ? 'font-royal-display' : 'font-display'),
    fontCalligraphy: theme.fontCalligraphy || (isRoyal ? 'font-royal-script' : 'font-calligraphy'),
    getOpacityStyle,
  }
}

/* ─── Premium Features Helper Functions ─── */
export function extractColors(text: string): { name: string; hex: string }[] {
  const colorMap: Record<string, string> = {
    yellow: '#eab308',
    mustard: '#ca8a04',
    green: '#22c55e',
    emerald: '#0f766e',
    mint: '#6ee7b7',
    olive: '#84cc16',
    gold: '#d4a853',
    maroon: '#7f1d1d',
    burgundy: '#881337',
    plum: '#581c87',
    red: '#ef4444',
    crimson: '#dc2626',
    pink: '#ec4899',
    magenta: '#d946ef',
    peach: '#ffedd5',
    orange: '#f97316',
    white: '#ffffff',
    black: '#000000',
    blue: '#3b82f6',
    navy: '#1e3a8a',
    turquoise: '#06b6d4',
    purple: '#a855f7',
    lavender: '#f3e8ff',
    silver: '#cbd5e1',
    grey: '#6b7280',
    gray: '#6b7280',
    ivory: '#fffff0',
    cream: '#fffdd0',
    beige: '#f5f5dc',
  };
  
  const results: { name: string; hex: string }[] = [];
  const words = text.toLowerCase().split(/[\s,/\-+&]+/);
  
  for (const word of words) {
    if (colorMap[word]) {
      if (!results.some(c => c.name.toLowerCase() === word)) {
        results.push({ name: word.charAt(0).toUpperCase() + word.slice(1), hex: colorMap[word] });
      }
    }
  }
  return results;
}

export interface ParsedGiftBank {
  bankName?: string;
  accountTitle?: string;
  accountNumber?: string;
  iban?: string;
  raastId?: string;
  easyPaisa?: string;
  jazzCash?: string;
}

export function parseGiftDetails(text?: string): ParsedGiftBank | null {
  if (!text) return null;
  
  const details: ParsedGiftBank = {};
  
  // Raast ID: e.g. Raast ID: 03001234567
  const raastMatch = text.match(/(?:Raast\s*(?:ID)?|Raast)\s*[:\-\s]+\s*([0-9+]+)/i);
  if (raastMatch) details.raastId = raastMatch[1].trim();
  
  // EasyPaisa: e.g. EasyPaisa: 03123456789
  const epMatch = text.match(/(?:EasyPaisa|Easy\s*Paisa)\s*[:\-\s]+\s*([0-9+]+)/i);
  if (epMatch) details.easyPaisa = epMatch[1].trim();
  
  // JazzCash: e.g. JazzCash: 03211234567
  const jcMatch = text.match(/(?:JazzCash|Jazz\s*Cash)\s*[:\-\s]+\s*([0-9+]+)/i);
  if (jcMatch) details.jazzCash = jcMatch[1].trim();
  
  // IBAN: e.g. PK45MEZN00028102384
  const ibanMatch = text.match(/IBAN\s*[:\-\s]+\s*([A-Z]{2}[0-9]{2}[A-Z0-9\s]{16,30})/i);
  if (ibanMatch) details.iban = ibanMatch[1].replace(/\s+/g, '').toUpperCase().trim();
  
  // Account Number: e.g. Account Number: 028102384
  const accNumMatch = text.match(/(?:Account\s*(?:Number|No\.?)|Acc\s*(?:Number|No\.?))\s*[:\-\s]+\s*([0-9\-]+)/i);
  if (accNumMatch) details.accountNumber = accNumMatch[1].trim();
  
  // Account Title: e.g. Account Title: Ahmed
  const titleMatch = text.match(/(?:Account\s*Title|Acc\s*Title|Title)\s*[:\-\s]+\s*([a-zA-Z\s.()0-9]+?)(?=(?:\s*,|\s*\n|\s*Bank|\s*Account|\s*Raast|\s*EasyPaisa|$))/i);
  if (titleMatch) details.accountTitle = titleMatch[1].trim();
  
  // Bank Name: e.g. Meezan Bank
  const bankMatch = text.match(/(?:Bank\s*(?:Name)?|Bank)\s*[:\-\s]+\s*([a-zA-Z\s.()0-9]+?)(?=(?:\s*,|\s*\n|\s*Account|\s*Title|\s*IBAN|$))/i);
  if (bankMatch) details.bankName = bankMatch[1].trim();
  
  if (Object.keys(details).length === 0) return null;
  
  return details;
}

export function getCalendarDates(event: { date: string; time: string }): { startISO: string; endISO: string } | null {
  try {
    const dateStr = event.date.replace(/,/g, '');
    const timeStr = event.time.replace(/PKT|PST/gi, '').trim();
    const parsedDate = new Date(`${dateStr} ${timeStr}`);
    if (!isNaN(parsedDate.getTime())) {
      const startISO = parsedDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const endISO = new Date(parsedDate.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      return { startISO, endISO };
    }
  } catch { /* ignore */ }
  return null;
}

export function getGoogleCalendarLink(
  event: { name: string; date: string; time: string; description: string; venue?: string },
  partner1: string, partner2: string,
  location?: string
): string {
  const title = encodeURIComponent(`${partner1} & ${partner2}'s ${event.name}`);
  const dates = getCalendarDates(event);
  const loc = location || event.venue || '';
  if (dates) {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${partner1} & ${partner2}'s ${event.name}`,
      dates: `${dates.startISO}/${dates.endISO}`,
      details: event.description,
      ...(loc ? { location: loc } : {}),
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}`;
}

export function generateICSContent(
  event: { name: string; date: string; time: string; description: string; venue?: string },
  partner1: string, partner2: string,
  location?: string
): string {
  const title = `${partner1} & ${partner2}'s ${event.name}`;
  const dates = getCalendarDates(event);
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const start = dates?.startISO || now;
  const end = dates?.endISO || now;
  const loc = location || event.venue || '';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ShaadiLink//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `DTSTAMP:${now}`,
    `UID:${start}-${event.name.replace(/\s+/g, '-')}@shaadilink`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    ...(loc ? [`LOCATION:${loc}`] : []),
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

export function getOutlookWebLink(
  event: { name: string; date: string; time: string; description: string; venue?: string },
  partner1: string, partner2: string,
  location?: string
): string {
  const title = encodeURIComponent(`${partner1} & ${partner2}'s ${event.name}`);
  const body = encodeURIComponent(event.description);
  const loc = location || event.venue || '';
  const dates = getCalendarDates(event);
  if (dates) {
    try {
      const toFullISO = (compact: string) =>
        compact.replace(
          /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
          '$1-$2-$3T$4:$5:$6.000Z'
        );
      const startParam = encodeURIComponent(toFullISO(dates.startISO));
      const endParam = encodeURIComponent(toFullISO(dates.endISO));
      const locParam = loc ? `&location=${encodeURIComponent(loc)}` : '';
      return `https://outlook.live.com/calendar/0/action/compose?subject=${title}&startdt=${startParam}&enddt=${endParam}&body=${body}${locParam}&allday=false`;
    } catch {
      /* fall through */
    }
  }
  return `https://outlook.live.com/calendar/0/action/compose?subject=${title}&body=${body}`;
}

export function formatScratchDate(dateStr: string, locale: string = 'en-US'): { date: string; day: string } {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const loc = locale === 'ur' ? 'ur-PK' : 'en-US';
      const dateFormatted = d.toLocaleDateString(loc, {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      const dayFormatted = d.toLocaleDateString(loc, { weekday: "long" });
      return { date: dateFormatted, day: dayFormatted };
    }
  } catch (e) {
    console.error("formatScratchDate error", e);
  }
  return { date: dateStr, day: "" };
}

export function formatScratchTime(timeStr: string, locale: string = 'en-US'): string {
  try {
    if (/AM|PM|شام|صبح|دوپہر/i.test(timeStr)) return timeStr;

    const parts = timeStr.split(":");
    if (parts.length >= 2) {
      let hour = parseInt(parts[0], 10);
      const minute = parts[1];
      if (locale === 'ur') {
        const period = hour >= 12 ? "شام" : "صبح";
        hour = hour % 12;
        hour = hour ? hour : 12;
        return `${period} ${hour}:${minute}`;
      } else {
        const ampm = hour >= 12 ? "PM" : "AM";
        hour = hour % 12;
        hour = hour ? hour : 12;
        return `${hour}:${minute} ${ampm}`;
      }
    }
  } catch (e) {
    console.error("formatScratchTime error", e);
  }
  return timeStr;
}

/* ─── InvitationViewer Props ─── */
interface InvitationViewerProps {
  templateId?: string
  flowData?: FlowData
}

/* ─── Corner Ornament SVG (Zareqia-style) ─── */
function CornerOrnament({ 
  position, 
  themeId,
  accentColor 
}: { 
  position: 'tl' | 'tr' | 'bl' | 'br'; 
  themeId?: string;
  accentColor?: string 
}) {
  if (themeId === 'minimal-white') {
    // Clean modern minimalism has no corner ornaments
    return null
  }
  
  const color = accentColor || 'hsl(40, 50%, 55%)'
  const transforms: Record<string, string> = {
    tl: '',
    tr: '-scale-x-100',
    bl: '-scale-y-100',
    br: '-scale-x-100 -scale-y-100',
  }
  const classes: Record<string, string> = {
    tl: 'top-4 left-4',
    tr: 'top-4 right-4',
    bl: 'bottom-4 left-4',
    br: 'bottom-4 right-4',
  }

  // Geometric style
  if (themeId === 'geometric-gold') {
    return (
      <svg
        className={`absolute ${classes[position]} w-12 h-12 sm:w-16 sm:h-16 opacity-35 z-10 ${transforms[position]}`}
        viewBox="0 0 60 60"
        fill="none"
      >
        <path d="M5 5 L5 40 L12 40 L12 12 L40 12 L40 5 Z" fill={color} opacity="0.12" />
        <path d="M5 5 L5 45 M5 5 L45 5" stroke={color} strokeWidth="1.5" />
        <path d="M10 10 L10 25 M10 10 L25 10" stroke={color} strokeWidth="0.8" opacity="0.5" />
      </svg>
    )
  }

  // Modern Minimal style
  if (themeId === 'modern-minimal') {
    return (
      <svg
        className={`absolute ${classes[position]} w-8 h-8 sm:w-10 sm:h-10 opacity-40 z-10 ${transforms[position]}`}
        viewBox="0 0 40 40"
        fill="none"
      >
        <path d="M2 2 L2 20 M2 2 L20 2" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    )
  }

  // Pastel/Watercolor/Floral style
  if (themeId === 'pastel-floral' || themeId === 'watercolor-peach' || themeId === 'garden-romance') {
    return (
      <svg
        className={`absolute ${classes[position]} w-16 h-16 sm:w-20 sm:h-20 opacity-30 z-10 ${transforms[position]}`}
        viewBox="0 0 80 80"
        fill="none"
      >
        <path d="M5 5 C 5 20, 10 30, 25 35 C 40 40, 50 35, 55 50" stroke={color} strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <path d="M5 5 C 20 5, 30 10, 35 25" stroke={color} strokeWidth="0.6" fill="none" strokeLinecap="round" opacity="0.7" />
        <path d="M15 17 Q 18 12, 22 15 Q 18 20, 15 17 Z" fill={color} opacity="0.4" />
        <path d="M28 28 Q 32 24, 35 28 Q 30 33, 28 28 Z" fill={color} opacity="0.4" />
        <circle cx="5" cy="5" r="2.5" fill={color} opacity="0.6" />
      </svg>
    )
  }

  // Default: Royal/Traditional Ornate Zareqia scroll
  return (
    <svg
      className={`absolute ${classes[position]} w-16 h-16 sm:w-20 sm:h-20 opacity-25 z-10 ${transforms[position]}`}
      viewBox="0 0 80 80"
      fill="none"
    >
      <path d="M5 5 L5 30 Q5 50 25 60 L50 70" stroke={color} strokeWidth="0.8" fill="none" />
      <path d="M8 5 L8 25 Q8 40 20 48" stroke={color} strokeWidth="0.5" fill="none" opacity="0.5" />
      <circle cx="5" cy="5" r="2" fill={color} opacity="0.4" />
    </svg>
  )
}

/* ─── Decorative Divider ─── */
function GoldDivider({ 
  className = '', 
  themeId,
  accentColor 
}: { 
  className?: string; 
  themeId?: string;
  accentColor?: string 
}) {
  const color = accentColor || 'var(--gold)'
  
  if (themeId === 'minimal-white') {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <div className="h-[1px] w-12" style={{ backgroundColor: `${color}40` }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        <div className="h-[1px] w-12" style={{ backgroundColor: `${color}40` }} />
      </div>
    )
  }
  
  if (themeId === 'modern-minimal') {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <div className="h-[1px] w-16" style={{ backgroundColor: `${color}50` }} />
      </div>
    )
  }

  if (themeId === 'geometric-gold') {
    return (
      <div className={`flex items-center justify-center gap-3 ${className}`}>
        <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${color}80, transparent)` }} />
        <div className="w-2 h-2 border transform rotate-45" style={{ borderColor: color }} />
        <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${color}80, transparent)` }} />
      </div>
    )
  }

  if (themeId === 'pastel-floral' || themeId === 'watercolor-peach' || themeId === 'garden-romance') {
    return (
      <div className={`flex items-center justify-center gap-3 ${className}`}>
        <div className="h-px flex-1 opacity-40" style={{ background: `linear-gradient(to right, transparent, ${color}, transparent)` }} />
        <span className="text-xs" style={{ color }}>✿</span>
        <div className="h-px flex-1 opacity-40" style={{ background: `linear-gradient(to right, transparent, ${color}, transparent)` }} />
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${color}80, transparent)` }} />
      <div className="w-2.5 h-2.5 rotate-45" style={{ border: `1px solid ${color}b3` }} />
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${color}80, transparent)` }} />
    </div>
  )
}

function HeartDivider({ 
  themeId,
  accentColor 
}: { 
  themeId?: string;
  accentColor?: string 
}) {
  const color = accentColor || 'var(--gold)'
  
  if (themeId === 'minimal-white') {
    return (
      <div className="flex items-center justify-center gap-2 my-5">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `${color}40` }} />
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `${color}40` }} />
      </div>
    )
  }
  
  if (themeId === 'modern-minimal') {
    return (
      <div className="flex items-center justify-center gap-2 my-5">
        <div className="w-10 h-[1px]" style={{ backgroundColor: `${color}40` }} />
        <span className="text-[10px] tracking-widest uppercase font-sans font-medium" style={{ color }}>✦</span>
        <div className="w-10 h-[1px]" style={{ backgroundColor: `${color}40` }} />
      </div>
    )
  }

  if (themeId === 'geometric-gold') {
    return (
      <div className="flex items-center justify-center gap-3 my-6">
        <div className="w-12 h-px" style={{ background: `linear-gradient(to right, transparent, ${color})` }} />
        <div className="w-2 h-2 rotate-45 border" style={{ borderColor: color, backgroundColor: `${color}20` }} />
        <div className="w-12 h-px" style={{ background: `linear-gradient(to left, transparent, ${color})` }} />
      </div>
    )
  }

  if (themeId === 'pastel-floral' || themeId === 'watercolor-peach' || themeId === 'garden-romance') {
    return (
      <div className="flex items-center justify-center gap-3 my-6">
        <div className="w-12 h-px" style={{ backgroundColor: `${color}33` }} />
        <span className="text-sm font-light select-none" style={{ color }}>🌸</span>
        <div className="w-12 h-px" style={{ backgroundColor: `${color}33` }} />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-3 my-6">
      <div className="w-16 h-px" style={{ backgroundColor: `${color}4d` }} />
      <Heart className="w-3 h-3" style={{ color, fill: `${color}33` }} />
      <div className="w-16 h-px" style={{ backgroundColor: `${color}4d` }} />
    </div>
  )
}

/* ─── Add to Calendar Dropdown ─── */
function AddToCalendarDropdown({
  event, partner1, partner2, theme, label, location
}: {
  event: { name: string; date: string; time: string; description: string; venue?: string };
  partner1: string; partner2: string; theme: TemplateTheme; label: string; location?: string;
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleAppleCalendar = () => {
    const ics = generateICSContent(event, partner1, partner2, location)
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${event.name.replace(/\s+/g, '-')}-shaadilink.ics`
    a.click()
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  const options = [
    {
      label: 'Google Calendar',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <text x="12" y="19" textAnchor="middle" fontSize="7" fill="currentColor" fontWeight="bold">G</text>
        </svg>
      ),
      href: getGoogleCalendarLink(event, partner1, partner2, location),
      external: true,
    },
    {
      label: 'Apple Calendar',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 14.5 a2.5 2.5 0 1 1 0-.01z" fill="currentColor"/>
        </svg>
      ),
      onClick: handleAppleCalendar,
    },
    {
      label: 'Outlook / iCal',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <text x="12" y="19" textAnchor="middle" fontSize="6" fill="currentColor" fontWeight="bold">OL</text>
        </svg>
      ),
      href: getOutlookWebLink(event, partner1, partner2, location),
      external: true,
    },
  ]

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border transition-all duration-300 hover:scale-[1.02] ${theme.fontDisplay} hover:opacity-90`}
        style={{
          backgroundColor: theme.getOpacityStyle('bg', 0.05),
          borderColor: theme.borderSubtle,
          color: theme.accent,
        }}
      >
        <Calendar className="w-3.5 h-3.5" />
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginLeft: 1 }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div
          className="absolute bottom-full mb-1.5 left-0 z-50 rounded-xl border backdrop-blur-md shadow-2xl overflow-hidden min-w-[170px]"
          style={{
            backgroundColor: theme.getOpacityStyle('bg', 0.04),
            borderColor: theme.borderSubtle,
            backdropFilter: 'blur(16px)',
            boxShadow: `0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px ${theme.getOpacityStyle('border', 0.08)}`,
          }}
        >
          {options.map((opt) => (
            <React.Fragment key={opt.label}>
              {opt.href ? (
                <a
                  href={opt.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium transition-colors duration-150 hover:bg-white/5"
                  style={{ color: theme.textPrimary }}
                >
                  <span style={{ color: theme.accent, opacity: 0.8 }}>{opt.icon}</span>
                  {opt.label}
                </a>
              ) : (
                <button
                  onClick={opt.onClick}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium transition-colors duration-150 hover:bg-white/5 text-left"
                  style={{ color: theme.textPrimary }}
                >
                  <span style={{ color: theme.accent, opacity: 0.8 }}>{opt.icon}</span>
                  {opt.label}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Wave SVG Divider ─── */
function WaveDivider({ accentColor }: { accentColor?: string }) {
  const color = accentColor || 'var(--gold)'
  return (
    <div className="w-full py-4 flex items-center justify-center overflow-hidden">
      <svg width="100%" height="30" viewBox="0 0 800 30" preserveAspectRatio="none" fill="none">
        <path d="M0 15 Q50 0 100 15 Q150 30 200 15 Q250 0 300 15 Q350 30 400 15 Q450 0 500 15 Q550 30 600 15 Q650 0 700 15 Q750 30 800 15" stroke={color} strokeWidth="0.8" opacity="0.25" />
        <path d="M0 15 Q50 10 100 15 Q150 20 200 15 Q250 10 300 15 Q350 20 400 15 Q450 10 500 15 Q550 20 600 15 Q650 10 700 15 Q750 20 800 15" stroke={color} strokeWidth="0.5" opacity="0.15" />
      </svg>
    </div>
  )
}

/* ─── Scroll Reveal Section Wrapper ─── */
function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.9, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Background Floating Particles ─── */
interface Particle {
  left: number
  size: number
  duration: number
  delay: number
  opacity: number
  drift: number
}

/* ─── Background Floating Particles ─── */
function BackgroundParticles({ accentColor }: { accentColor?: string }) {
  const color = accentColor || '#d4a853'
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const generated = Array.from({ length: 18 }).map(() => ({
      left: Math.random() * 100,
      size: 1 + Math.random() * 2,
      duration: 15 + Math.random() * 25,
      delay: Math.random() * 20,
      opacity: 0.06 + Math.random() * 0.12,
      drift: (Math.random() - 0.5) * 50,
    }))
    setParticles(generated)
  }, [])

  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-particle"
          style={{
            backgroundColor: color,
            left: `${p.left}%`,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            '--particle-opacity': p.opacity,
            '--particle-duration': `${p.duration}s`,
            '--particle-delay': `${p.delay}s`,
            '--particle-drift': `${p.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

/* ─── Fireworks Component ─── */
function FireworksDisplay({ show, colors: propColors }: { show: boolean; colors?: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    if (!show || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    interface FParticle { x: number; y: number; color: string; size: number; angle: number; speed: number; decay: number; trail: { x: number; y: number }[] }
    const particles: FParticle[] = []
    const colors = propColors || ['#b4914d', '#d4a853', '#e8c66a', '#8b6d2f', '#fff4d0', '#f0d78c', '#ffd700', '#ffe4b5', '#f5deb3']

    function createBurst(x: number, y: number) {
      const count = 60 + Math.floor(Math.random() * 30)
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4
        particles.push({
          x, y,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 1.5 + Math.random() * 3,
          angle,
          speed: 2 + Math.random() * 6,
          decay: 0.007 + Math.random() * 0.012,
          trail: [],
        })
      }
    }

    // Initial big burst
    createBurst(canvas.width * 0.5, canvas.height * 0.25)
    const t1 = setTimeout(() => createBurst(canvas.width * 0.25, canvas.height * 0.35), 300)
    const t2 = setTimeout(() => createBurst(canvas.width * 0.75, canvas.height * 0.3), 500)
    const t3 = setTimeout(() => createBurst(canvas.width * 0.35, canvas.height * 0.2), 800)
    const t4 = setTimeout(() => createBurst(canvas.width * 0.65, canvas.height * 0.45), 1000)
    const t5 = setTimeout(() => createBurst(canvas.width * 0.15, canvas.height * 0.4), 1300)
    const t6 = setTimeout(() => createBurst(canvas.width * 0.85, canvas.height * 0.25), 1500)
    const t7 = setTimeout(() => createBurst(canvas.width * 0.5, canvas.height * 0.5), 1800)
    const t8 = setTimeout(() => createBurst(canvas.width * 0.4, canvas.height * 0.15), 2100)

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        // Store trail positions
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > 5) p.trail.shift()

        p.x += Math.cos(p.angle) * p.speed
        p.y += Math.sin(p.angle) * p.speed + 0.3
        p.speed *= 1 - p.decay
        p.size *= 0.997

        if (p.size < 0.15 || p.speed < 0.03) { particles.splice(i, 1); continue }

        const alpha = Math.min(1, p.speed / 2)

        // Draw trail
        for (let t = 0; t < p.trail.length; t++) {
          const ta = alpha * (t / p.trail.length) * 0.3
          ctx.beginPath()
          ctx.arc(p.trail[t].x, p.trail[t].y, p.size * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = ta
          ctx.fill()
        }

        // Main particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = alpha
        ctx.fill()

        // Glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = alpha * 0.1
        ctx.fill()
      }
      ctx.globalAlpha = 1
      if (particles.length > 0) animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)

    // Resize handler so canvas stays full-screen on device rotation
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', handleResize)
      ;[t1,t2,t3,t4,t5,t6,t7,t8].forEach(clearTimeout)
    }
  }, [show])

  if (!show) return null
  return <canvas ref={canvasRef} className="fixed inset-0 z-[60] pointer-events-none" style={{ width: '100vw', height: '100vh' }} />
}

interface ConfettiPiece {
  left: number
  width: number
  height: number
  color: string
  delay: number
  duration: number
  rotation: number
}

/* ─── Confetti ─── */
function ConfettiDisplay({ show, colors: propColors }: { show: boolean; colors?: string[] }) {
  const colors = propColors || ['#b4914d', '#d4a853', '#e8c66a', '#22c55e', '#f0d78c', '#fff4d0', '#e8a4b8']
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    if (show) {
      const generated = Array.from({ length: 50 }).map(() => {
        const w = 4 + Math.random() * 8
        return {
          left: Math.random() * 100,
          width: w,
          height: w * 0.6,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 0.8,
          duration: 2 + Math.random() * 2,
          rotation: Math.random() * 360,
        }
      })
      setPieces(generated)
    } else {
      setPieces([])
    }
  }, [show])

  if (!show || pieces.length === 0) return null

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none overflow-hidden">
      {pieces.map((p, i) => (
        <div
          key={i}
          className="absolute confetti-piece"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: `${p.width}px`,
            height: `${p.height}px`,
            backgroundColor: p.color,
            borderRadius: '1px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}

/* ─── Heart Path Helper ─── */
const drawHeartPath = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  ctx.beginPath()
  const topCurveHeight = h * 0.3
  ctx.moveTo(x + w / 2, y + topCurveHeight)
  // Top-left curve
  ctx.bezierCurveTo(
    x + w / 2, y,
    x, y,
    x, y + topCurveHeight + (h - topCurveHeight) * 0.15
  )
  // Bottom-left curve
  ctx.bezierCurveTo(
    x, y + topCurveHeight + (h - topCurveHeight) * 0.6,
    x + w / 2 - w * 0.05, y + h - h * 0.05,
    x + w / 2, y + h
  )
  // Bottom-right curve
  ctx.bezierCurveTo(
    x + w / 2 + w * 0.05, y + h - h * 0.05,
    x + w, y + topCurveHeight + (h - topCurveHeight) * 0.6,
    x + w, y + topCurveHeight + (h - topCurveHeight) * 0.15
  )
  // Top-right curve
  ctx.bezierCurveTo(
    x + w, y,
    x + w / 2, y,
    x + w / 2, y + topCurveHeight
  )
  ctx.closePath()
}

const getHeartSvgPath = (w: number, h: number, margin = 0) => {
  const x = margin
  const y = margin
  const width = w - margin * 2
  const height = h - margin * 2
  const topCurveHeight = height * 0.3
  
  const startX = x + width / 2
  const startY = y + topCurveHeight
  
  return `M ${startX} ${startY}
          C ${startX} ${y}, ${x} ${y}, ${x} ${startY + (height - topCurveHeight) * 0.15}
          C ${x} ${startY + (height - topCurveHeight) * 0.6}, ${startX - width * 0.05} ${y + height - height * 0.05}, ${startX} ${y + height}
          C ${startX + width * 0.05} ${y + height - height * 0.05}, ${x + width} ${startY + (height - topCurveHeight) * 0.6}, ${x + width} ${startY + (height - topCurveHeight) * 0.15}
          C ${x + width} ${y}, ${startX} ${y}, ${startX} ${startY} Z`
}

/* ─── Gold Dust Splash ─── */
interface GDParticle {
  x: number
  y: number
  vx: number
  vy: number
  swaySpeed: number
  swayOffset: number
  life: number
  maxLife: number
  size: number
  color: string
  rotation: number
  rotSpeed: number
}

function GoldDustSplash({ show, colors: propColors }: { show: boolean; colors?: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<GDParticle[]>([])
  const animRef = useRef<number>(0)
  const colors = propColors || ['#b4914d', '#d4a853', '#e8c66a', '#f0d78c', '#fff4d0']

  useEffect(() => {
    if (!show) return
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // Spawn initial burst of particles along the center seam
    const count = 60
    const w = window.innerWidth
    const h = window.innerHeight
    const particles: GDParticle[] = []
    for (let i = 0; i < count; i++) {
      const isLeft = Math.random() < 0.5
      const vx = (isLeft ? -1 : 1) * (2 + Math.random() * 10)
      const vy = (Math.random() - 0.5) * 3
      particles.push({
        x: w / 2,
        y: Math.random() * h,
        vx,
        vy,
        swaySpeed: 0.02 + Math.random() * 0.05,
        swayOffset: Math.random() * Math.PI * 2,
        life: 60 + Math.random() * 90,
        maxLife: 150,
        size: 1.5 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.08,
      })
    }
    particlesRef.current = particles

    const ctx = canvas.getContext('2d')!
    function animate() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      const current = particlesRef.current

      // Spawn a few more tailing particles for a continuous flow
      if (current.length < 80 && Math.random() < 0.6) {
        const isLeft = Math.random() < 0.5
        current.push({
          x: window.innerWidth / 2,
          y: Math.random() * window.innerHeight,
          vx: (isLeft ? -1 : 1) * (1 + Math.random() * 6),
          vy: (Math.random() - 0.5) * 2,
          swaySpeed: 0.02 + Math.random() * 0.05,
          swayOffset: Math.random() * Math.PI * 2,
          life: 40 + Math.random() * 60,
          maxLife: 100,
          size: 1.2 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.08,
        })
      }

      for (let i = current.length - 1; i >= 0; i--) {
        const p = current[i]
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotSpeed

        p.vx *= 0.96
        p.vy *= 0.97

        p.y += Math.sin(p.swayOffset) * 0.2
        p.swayOffset += p.swaySpeed
        p.y -= 0.15

        p.life--
        if (p.life <= 0) {
          current.splice(i, 1)
          continue
        }

        const alpha = p.life / p.maxLife
        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color

        const r = p.size * (0.4 + alpha * 0.6)
        
        ctx.beginPath()
        ctx.moveTo(p.x, p.y - r)
        ctx.quadraticCurveTo(p.x, p.y, p.x + r, p.y)
        ctx.quadraticCurveTo(p.x, p.y, p.x, p.y + r)
        ctx.quadraticCurveTo(p.x, p.y, p.x - r, p.y)
        ctx.quadraticCurveTo(p.x, p.y, p.x, p.y - r)
        ctx.closePath()
        ctx.fill()

        if (p.size > 2.5) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, r * 2.5, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = alpha * 0.15
          ctx.fill()
        }
      }

      ctx.globalAlpha = 1
      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [show, colors])

  if (!show) return null
  return <canvas ref={canvasRef} className="fixed inset-0 z-[49] pointer-events-none" style={{ width: '100vw', height: '100vh' }} />
}

/* ─── Scratch Card (v8 - Grid-based tracking + fixed DPR + sparkle trail) ─── */
function ScratchCard({
  revealed,
  onReveal,
  theme,
  language,
  translations,
  scratchDateInfo,
  scratchTimeFormatted,
}: {
  revealed: boolean;
  onReveal: () => void;
  theme: TemplateTheme;
  language: 'en' | 'ur';
  translations: Record<string, string>;
  scratchDateInfo: { date: string; day: string };
  scratchTimeFormatted: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const revealedRef = useRef(false)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)
  const onRevealRef = useRef(onReveal)
  const [canvasFading, setCanvasFading] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const celebrationSparkles = useMemo(() => {
    if (!showCelebration) return []
    return Array.from({ length: 24 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 24
      const dist = 30 + Math.random() * 50
      const size = 4 + Math.random() * 6
      return { angle, dist, size }
    })
  }, [showCelebration])
  const [scratchPercent, setScratchPercent] = useState(0)
  const sparkleCanvasRef = useRef<HTMLCanvasElement>(null)
  const sparklesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string }>>([])
  const sparkleAnimRef = useRef<number>(0)

  const isRoyal = theme.id.includes('royal')
  // Responsive width: never exceed viewport width minus padding (fixes overflow on iPhone SE)
  const maxWidth = typeof window !== 'undefined' ? window.innerWidth - 32 : 340
  const CARD_W = isRoyal ? Math.min(320, maxWidth) : Math.min(340, maxWidth)
  const CARD_H = isRoyal ? 300 : 220

  // Grid-based scratch tracking (reliable, no getImageData needed)
  const GRID_COLS = isRoyal ? 15 : 17
  const GRID_ROWS = isRoyal ? 15 : 11
  const REVEAL_THRESHOLD = isRoyal ? 40 : 60
  const gridRef = useRef<Set<string>>(new Set())

  // Keep onReveal ref always current
  useEffect(() => {
    onRevealRef.current = onReveal
  }, [onReveal])

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || revealed) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = CARD_W * dpr
    canvas.height = CARD_H * dpr
    canvas.style.width = `${CARD_W}px`
    canvas.style.height = `${CARD_H}px`
    const ctx = canvas.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    if (isRoyal) {
      drawHeartPath(ctx, 0, 0, CARD_W, CARD_H)
      ctx.clip()
    }

    // Rich dark gradient surface (theme-aware)
    const grad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
    grad.addColorStop(0, theme.scratchBg[0])
    grad.addColorStop(0.2, theme.scratchBg[1])
    grad.addColorStop(0.5, theme.scratchBg[2])
    grad.addColorStop(0.8, theme.scratchBg[1])
    grad.addColorStop(1, theme.scratchBg[0])
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, CARD_W, CARD_H)

    // Metallic sheen overlay (theme-aware)
    const sheenGrad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H * 0.5)
    sheenGrad.addColorStop(0, theme.getOpacityStyle('border', 0.15))
    sheenGrad.addColorStop(0.5, theme.getOpacityStyle('border', 0.22))
    sheenGrad.addColorStop(1, theme.getOpacityStyle('border', 0.15))
    ctx.fillStyle = sheenGrad
    ctx.fillRect(0, 0, CARD_W, CARD_H)

    // Geometric mandala pattern
    ctx.globalAlpha = 0.07
    const cx = CARD_W / 2, cy = CARD_H / 2
    for (let r = 15; r < 80; r += 10) {
      ctx.beginPath()
      const sides = r < 40 ? 8 : 12
      for (let i = 0; i < sides; i++) {
        const a = (Math.PI * 2 * i) / sides - Math.PI / sides
        const px = cx + Math.cos(a) * r
        const py = cy + Math.sin(a) * r
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.strokeStyle = theme.scratchAccent
      ctx.lineWidth = 0.8
      ctx.stroke()
    }
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI * 2 * i) / 12
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a) * 12, cy + Math.sin(a) * 12)
      ctx.lineTo(cx + Math.cos(a) * 80, cy + Math.sin(a) * 80)
      ctx.strokeStyle = theme.scratchAccent
      ctx.lineWidth = 0.4
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    // Double border (theme-aware)
    if (isRoyal) {
      ctx.strokeStyle = theme.getOpacityStyle('text', 0.6)
      ctx.lineWidth = 2.5
      drawHeartPath(ctx, 4, 4, CARD_W - 8, CARD_H - 8)
      ctx.stroke()

      ctx.strokeStyle = theme.getOpacityStyle('border', 0.25)
      ctx.lineWidth = 1
      drawHeartPath(ctx, 10, 10, CARD_W - 20, CARD_H - 20)
      ctx.stroke()
    } else {
      ctx.strokeStyle = theme.getOpacityStyle('text', 0.6)
      ctx.lineWidth = 2.5
      ctx.strokeRect(4, 4, CARD_W - 8, CARD_H - 8)
      ctx.strokeStyle = theme.getOpacityStyle('border', 0.25)
      ctx.lineWidth = 1
      ctx.strokeRect(10, 10, CARD_W - 20, CARD_H - 20)

      // Corner decorations
      const cornerSize = 20
      const cornerOffset = 14
      ctx.strokeStyle = theme.getOpacityStyle('text', 0.5)
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(cornerOffset, cornerOffset + cornerSize)
      ctx.lineTo(cornerOffset, cornerOffset)
      ctx.lineTo(cornerOffset + cornerSize, cornerOffset)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(CARD_W - cornerOffset - cornerSize, cornerOffset)
      ctx.lineTo(CARD_W - cornerOffset, cornerOffset)
      ctx.lineTo(CARD_W - cornerOffset, cornerOffset + cornerSize)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cornerOffset, CARD_H - cornerOffset - cornerSize)
      ctx.lineTo(cornerOffset, CARD_H - cornerOffset)
      ctx.lineTo(cornerOffset + cornerSize, CARD_H - cornerOffset)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(CARD_W - cornerOffset - cornerSize, CARD_H - cornerOffset)
      ctx.lineTo(CARD_W - cornerOffset, CARD_H - cornerOffset)
      ctx.lineTo(CARD_W - cornerOffset, CARD_H - cornerOffset - cornerSize)
      ctx.stroke()
    }

    // "Scratch Here" text with glow (theme-aware)
    ctx.shadowColor = theme.getOpacityStyle('text', 0.5)
    ctx.shadowBlur = 12
    ctx.fillStyle = theme.getOpacityStyle('text', 0.85)
    ctx.font = language === 'ur' ? 'bold 18px Noto Nastaliq Urdu, serif' : 'bold 18px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const cyOffset = isRoyal ? -12 : 0
    ctx.fillText(language === 'ur' ? (translations.scratchHere || '✦  یہاں کھرچیں  ✦') : '✦  Scratch Here  ✦', cx, cy + cyOffset - 8)
    ctx.shadowBlur = 0
    ctx.fillStyle = theme.getOpacityStyle('text', 0.5)
    ctx.font = language === 'ur' ? '11px Noto Nastaliq Urdu, serif' : '11px serif'
    ctx.fillText(language === 'ur' ? (translations.toReveal || 'دعوت نامہ دیکھنے کے لیے') : 'to reveal your invitation', cx, cy + cyOffset + 14)

    // Finger icon hint
    ctx.fillStyle = theme.getOpacityStyle('border', 0.25)
    ctx.font = '22px serif'
    ctx.fillText('👆', cx, cy + cyOffset + 42)

    // Reset grid and percent
    gridRef.current = new Set()
    setScratchPercent(0)
    revealedRef.current = false
  }, [revealed, theme, language, translations, CARD_W, CARD_H, isRoyal])

  // Sparkle trail animation loop
  useEffect(() => {
    const sparkleCanvas = sparkleCanvasRef.current
    if (!sparkleCanvas || revealed) return
    const dpr = window.devicePixelRatio || 1
    sparkleCanvas.width = CARD_W * dpr
    sparkleCanvas.height = CARD_H * dpr
    sparkleCanvas.style.width = `${CARD_W}px`
    sparkleCanvas.style.height = `${CARD_H}px`
    const sCtx = sparkleCanvas.getContext('2d')!
    sCtx.setTransform(dpr, 0, 0, dpr, 0, 0)

    function animateSparkles() {
      sCtx.clearRect(0, 0, CARD_W, CARD_H)
      const sparkles = sparklesRef.current
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i]
        s.x += s.vx
        s.y += s.vy
        s.vy += 0.08
        s.life--
        if (s.life <= 0) { sparkles.splice(i, 1); continue }
        const alpha = s.life / s.maxLife
        sCtx.globalAlpha = alpha
        sCtx.fillStyle = s.color
        sCtx.beginPath()
        const r = s.size * alpha
        sCtx.save()
        sCtx.translate(s.x, s.y)
        for (let j = 0; j < 4; j++) {
          sCtx.rotate(Math.PI / 4)
          sCtx.fillRect(-r * 0.15, -r, r * 0.3, r * 2)
        }
        sCtx.restore()
        sCtx.beginPath()
        sCtx.arc(s.x, s.y, r * 2, 0, Math.PI * 2)
        sCtx.fillStyle = s.color
        sCtx.globalAlpha = alpha * 0.15
        sCtx.fill()
      }
      sCtx.globalAlpha = 1
      sparkleAnimRef.current = requestAnimationFrame(animateSparkles)
    }
    sparkleAnimRef.current = requestAnimationFrame(animateSparkles)
    return () => cancelAnimationFrame(sparkleAnimRef.current)
  }, [revealed, CARD_W, CARD_H])

  // Celebration effect on reveal
  useEffect(() => {
    if (!revealed) return
    setShowCelebration(true)
    const t = setTimeout(() => setShowCelebration(false), 3000)
    return () => clearTimeout(t)
  }, [revealed])

  // Trigger reveal
  const doReveal = useCallback(() => {
    if (revealedRef.current) return
    revealedRef.current = true
    setCanvasFading(true)
    setTimeout(() => onRevealRef.current(), 400)
  }, [])

  // Mark grid cells around a scratch point
  const markGrid = useCallback((x: number, y: number) => {
    const cellW = CARD_W / GRID_COLS
    const cellH = CARD_H / GRID_ROWS
    const col = Math.floor(x / cellW)
    const row = Math.floor(y / cellH)
    const grid = gridRef.current
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = row + dr
        const c = col + dc
        if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
          grid.add(`${r}-${c}`)
        }
      }
    }
    const totalCells = GRID_ROWS * GRID_COLS
    const pct = Math.round((grid.size / totalCells) * 100)
    setScratchPercent(pct)
    if (pct >= REVEAL_THRESHOLD && !revealedRef.current) {
      doReveal()
    }
  }, [doReveal, CARD_W, CARD_H, GRID_COLS, GRID_ROWS, REVEAL_THRESHOLD])

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }, [])

  const scratch = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas || revealedRef.current) return
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    if (isRoyal) {
      drawHeartPath(ctx, 0, 0, CARD_W, CARD_H)
      if (!ctx.isPointInPath(x, y)) {
        return
      }
    }

    ctx.globalCompositeOperation = 'destination-out'

    const last = lastPosRef.current
    if (last) {
      const dx = x - last.x
      const dy = y - last.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const steps = Math.max(1, Math.floor(dist / 4))
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const ix = last.x + dx * t
        const iy = last.y + dy * t
        ctx.beginPath()
        ctx.arc(ix, iy, 24, 0, Math.PI * 2)
        ctx.fill()
      }
      if (dist > 3) {
        const sparkColors = [theme.accentLight, theme.accent, theme.scratchAccent, '#fff4d0']
        for (let i = 0; i < Math.min(3, Math.floor(dist / 8)); i++) {
          sparklesRef.current.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 3 - 1,
            life: 20 + Math.random() * 20,
            maxLife: 40,
            size: 1.5 + Math.random() * 2.5,
            color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
          })
        }
      }
    } else {
      ctx.beginPath()
      ctx.arc(x, y, 24, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.globalCompositeOperation = 'source-over'
    lastPosRef.current = { x, y }
    markGrid(x, y)
  }, [markGrid, isRoyal, CARD_W, CARD_H, theme.accentLight, theme.accent, theme.scratchAccent])

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    isDrawing.current = true
    lastPosRef.current = null
    const pos = getPos(e)
    scratch(pos.x, pos.y)
  }, [getPos, scratch])

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing.current) return
    const pos = getPos(e)
    scratch(pos.x, pos.y)
  }, [getPos, scratch])

  const handleEnd = useCallback(() => {
    isDrawing.current = false
    lastPosRef.current = null
  }, [])

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`${theme.fontCalligraphy} text-3xl sm:text-4xl`}
        style={{ color: theme.accent }}
      >
        {language === 'ur' ? (translations.scratchReveal || 'دعوت نامہ دیکھنے کے لیے') : 'Scratch to Reveal'}
      </motion.h2>
      <HeartDivider themeId={theme.id} accentColor={theme.accent} />
      {!revealed && scratchPercent > 5 && (
        <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.getOpacityStyle('bg', 0.1) }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${theme.accentDark}, ${theme.accentLight})` }}
            animate={{ width: `${Math.min(scratchPercent, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
      <div
        className={`relative ${isRoyal ? '' : 'rounded-2xl'} overflow-hidden`}
        style={{
          width: CARD_W,
          height: CARD_H,
          boxShadow: revealed
            ? `0 0 50px ${theme.getOpacityStyle('text', 0.5)}, 0 0 100px ${theme.getOpacityStyle('border', 0.2)}, rgba(0,0,0,0.3) 0px 4px 12px`
            : `${theme.getOpacityStyle('text', 0.3)} 0px 8px 40px, rgba(0,0,0,0.3) 0px 4px 12px`,
          clipPath: isRoyal ? 'url(#heart-clip)' : undefined,
        }}
      >
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center ${isRoyal ? '' : 'rounded-2xl'} transition-all duration-1000 ${revealed ? 'gold-border-pulse' : ''}`}
          style={{
            background: `linear-gradient(135deg, ${theme.scratchBg[1]} 0%, ${theme.bgDoor} 30%, ${theme.scratchBg[2]} 50%, ${theme.bgDoor} 70%, ${theme.scratchBg[1]} 100%)`,
            border: isRoyal 
              ? 'none' 
              : revealed ? `2px solid ${theme.getOpacityStyle('text', 0.8)}` : `2px solid ${theme.getOpacityStyle('text', 0.4)}`,
            boxShadow: revealed
              ? `0 0 40px ${theme.getOpacityStyle('text', 0.5)}, 0 0 80px ${theme.getOpacityStyle('border', 0.2)}, inset 0 0 40px ${theme.getOpacityStyle('border', 0.12)}`
              : `inset 0 0 30px ${theme.getOpacityStyle('bg', 0.05)}`,
          }}
        >
          {isRoyal ? (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${CARD_W} ${CARD_H}`} fill="none">
              <path d={getHeartSvgPath(CARD_W, CARD_H, 4)} stroke={theme.getOpacityStyle('text', 0.8)} strokeWidth="2.5" />
              <path d={getHeartSvgPath(CARD_W, CARD_H, 10)} stroke={theme.scratchAccent} strokeWidth="1" opacity="0.5" />
            </svg>
          ) : (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${CARD_W} ${CARD_H}`} fill="none">
              <path d="M20 4 L4 4 L4 20" stroke={theme.scratchAccent} strokeWidth="1.5" opacity="0.5" />
              <path d={`M${CARD_W - 20} 4 L${CARD_W - 4} 4 L${CARD_W - 4} 20`} stroke={theme.scratchAccent} strokeWidth="1.5" opacity="0.5" />
              <path d={`M4 ${CARD_H - 20} L4 ${CARD_H - 4} L20 ${CARD_H - 4}`} stroke={theme.scratchAccent} strokeWidth="1.5" opacity="0.5" />
              <path d={`M${CARD_W - 4} ${CARD_H - 20} L${CARD_W - 4} ${CARD_H - 4} L${CARD_W - 20} ${CARD_H - 4}`} stroke={theme.scratchAccent} strokeWidth="1.5" opacity="0.5" />
            </svg>
          )}

          <AnimatePresence mode="wait">
            {revealed ? (
              <motion.div
                key="revealed"
                initial={{ scale: 0.5, opacity: 0, filter: 'blur(10px)' }}
                animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                className={`flex flex-col items-center gap-2 z-10 ${isRoyal ? '-translate-y-3' : ''}`}
              >
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Sparkles className="w-6 h-6 mx-auto mb-1" style={{ color: theme.accentLight }} />
                </motion.div>
                <motion.p
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className={`${theme.fontCalligraphy} text-2xl sm:text-3xl font-bold`}
                  style={{ color: theme.accentLight, textShadow: `0 0 25px ${theme.getOpacityStyle('text', 0.4)}, 0 0 50px ${theme.getOpacityStyle('text', 0.2)}` }}
                >
                  {language === 'ur' ? (translations.youreInvited || 'آپ مدعو ہیں!') : "You're Invited!"}
                </motion.p>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="h-px w-24"
                  style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }}
                />
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className={`${theme.fontDisplay} text-2xl sm:text-3xl font-bold`}
                  style={{ color: theme.textSecondary, textShadow: `0 0 15px ${theme.getOpacityStyle('text', 0.3)}` }}
                >
                  {scratchDateInfo.date}
                </motion.p>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className={`${theme.fontCalligraphy} text-lg`}
                  style={{ color: theme.accent }}
                >
                  {scratchDateInfo.day}
                </motion.p>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="text-sm"
                  style={{ color: theme.accentLight }}
                >
                  {scratchTimeFormatted} <span style={{ color: theme.accentLight, fontWeight: 600 }}>{language === 'ur' ? 'پاکستانی وقت' : 'PKT'}</span>
                </motion.p>
              </motion.div>
            ) : (
              <motion.div
                key="hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex flex-col items-center gap-2 z-10 ${isRoyal ? '-translate-y-3' : ''}`}
              >
                <Sparkles className="w-5 h-5 mx-auto mb-0.5" style={{ color: theme.accent }} />
                <p
                  className={`${theme.fontCalligraphy} text-2xl sm:text-3xl font-bold`}
                  style={{ color: theme.accentLight, textShadow: `0 0 15px ${theme.getOpacityStyle('text', 0.25)}` }}
                >
                  {language === 'ur' ? (translations.youreInvited || 'آپ مدعو ہیں!') : "You're Invited!"}
                </p>
                <div
                  className="h-px w-20"
                  style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }}
                />
                <p
                  className={`${theme.fontDisplay} text-2xl sm:text-3xl font-bold`}
                  style={{ color: theme.textSecondary, textShadow: `0 0 10px ${theme.getOpacityStyle('text', 0.15)}` }}
                >
                  {scratchDateInfo.date}
                </p>
                <p
                  className={`${theme.fontCalligraphy} text-lg`}
                  style={{ color: theme.accentLight }}
                >
                  {scratchDateInfo.day}
                </p>
                <p
                  className="text-sm"
                  style={{ color: theme.accent }}
                >
                  {scratchTimeFormatted} <span style={{ color: theme.accentLight, fontWeight: 600 }}>{language === 'ur' ? 'پاکستانی وقت' : 'PKT'}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Celebration sparkles overlay */}
        <AnimatePresence>
          {showCelebration && celebrationSparkles.map((sparkle, i) => {
            return (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                  x: Math.cos(sparkle.angle) * sparkle.dist,
                  y: Math.sin(sparkle.angle) * sparkle.dist,
                }}
                transition={{ duration: 1.5, delay: i * 0.04, ease: 'easeOut' }}
                className="absolute z-30 pointer-events-none"
                style={{
                  width: sparkle.size,
                  height: sparkle.size,
                  left: '50%',
                  top: '50%',
                  borderRadius: '50%',
                  background: [theme.accentLight, theme.accent, theme.scratchAccent, '#fff4d0'][i % 4],
                  boxShadow: `0 0 8px ${[theme.accentLight, theme.accent, theme.scratchAccent, '#fff4d0'][i % 4]}`,
                }}
              />
            )
          })}
        </AnimatePresence>

        {/* Sparkle trail canvas */}
        {!revealed && (
          <canvas
            ref={sparkleCanvasRef}
            className={`absolute inset-0 ${isRoyal ? '' : 'rounded-2xl'} pointer-events-none z-40`}
            style={{ width: CARD_W, height: CARD_H }}
          />
        )}

        {/* Canvas overlay (scratch surface) */}
        {!revealed && (
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 ${isRoyal ? '' : 'rounded-2xl'} cursor-pointer touch-none z-30 transition-opacity duration-400 ${canvasFading ? 'opacity-0' : 'opacity-100'}`}
            style={{ width: CARD_W, height: CARD_H, touchAction: 'none' }}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />
        )}
      </div>
    </div>
  )
}


function getCountdownTarget(dateStr?: string, timeStr?: string): number {
  const defaultTarget = new Date('2027-03-15T19:00:00+05:00').getTime()
  if (!dateStr) return defaultTarget

  try {
    let hours = 19
    let minutes = 0
    if (timeStr) {
      const timeClean = timeStr.trim().toUpperCase()
      const isPM = timeClean.includes('PM') || timeClean.includes('شام') || timeClean.includes('دوپہر')
      const isAM = timeClean.includes('AM') || timeClean.includes('صبح')
      
      const digits = timeClean.match(/\d+/g)
      if (digits && digits.length >= 1) {
        let h = parseInt(digits[0], 10)
        let m = digits.length >= 2 ? parseInt(digits[1], 10) : 0
        if (isPM && h < 12) h += 12
        if (isAM && h === 12) h = 0
        hours = h
        minutes = m
      }
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
      const [y, m, d] = dateStr.trim().split('-').map(Number)
      const dateObj = new Date(y, m - 1, d, hours, minutes, 0, 0)
      if (!isNaN(dateObj.getTime())) {
        return dateObj.getTime()
      }
    }

    const dateObj = new Date(dateStr)
    if (!isNaN(dateObj.getTime())) {
      dateObj.setHours(hours, minutes, 0, 0)
      return dateObj.getTime()
    }
  } catch (e) {
    console.error("Error parsing countdown target date", e)
  }

  return defaultTarget
}

function CountdownTimer({
  theme,
  translations,
  targetDate,
  targetTime,
}: {
  theme: TemplateTheme
  translations?: Record<string, string>
  targetDate?: string
  targetTime?: string
}) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  const countdownTarget = useMemo(() => {
    return getCountdownTarget(targetDate, targetTime)
  }, [targetDate, targetTime])

  useEffect(() => {
    function update() {
      const diff = Math.max(0, countdownTarget - Date.now())
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [countdownTarget])

  const t = (key: string, fallback: string) => translations?.[key] || fallback

  const units = [
    { value: timeLeft.days, label: t('days', 'Days') },
    { value: timeLeft.hours, label: t('hours', 'Hours') },
    { value: timeLeft.minutes, label: t('minutes', 'Minutes') },
    { value: timeLeft.seconds, label: t('seconds', 'Seconds') },
  ]

  return (
    <div className="flex gap-3 sm:gap-4 items-center justify-center">
      {units.map((unit, idx) => (
        <React.Fragment key={unit.label}>
          <div className="flex flex-col items-center">
            <div className="rounded-lg backdrop-blur-sm w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center countdown-pulse relative overflow-hidden" style={{ border: `1px solid ${theme.getOpacityStyle('border', 0.25)}`, backgroundColor: theme.getOpacityStyle('border', 0.08) }}>
              <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${theme.getOpacityStyle('text', 0.05)}, transparent)` }} />
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={unit.value}
                  initial={{ y: -15, opacity: 0, rotateX: -90 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  exit={{ y: 15, opacity: 0, rotateX: 90 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className={`${theme.fontDisplay} text-2xl sm:text-3xl font-bold relative z-10`}
                  style={{ color: theme.accent }}
                >
                  {String(unit.value).padStart(2, '0')}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest mt-2" style={{ color: theme.accent }}>{unit.label}</span>
          </div>
          {idx < units.length - 1 && (
            <div className="text-2xl font-light pb-6" style={{ color: theme.getOpacityStyle('text', 0.3) }}>:</div>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

function PhotoGallery({ theme, images: propImages }: { theme: TemplateTheme; images?: string[] }) {
  const defaultImages = [
    { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=500&fit=crop', alt: 'Wedding couple' },
    { src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=500&fit=crop', alt: 'Wedding rings' },
    { src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=500&fit=crop', alt: 'Wedding celebration' },
    { src: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&h=500&fit=crop', alt: 'Wedding decorations' },
  ]
  const images = propImages && propImages.length > 0
    ? propImages.map((src, idx) => ({ src, alt: `Wedding gallery photo ${idx + 1}` }))
    : defaultImages

  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setActiveIndex(0)
  }, [images.length])

  useEffect(() => {
    if (lightboxOpen) return;
    const interval = setInterval(() => setActiveIndex((p) => (p + 1) % images.length), 4000)
    return () => clearInterval(interval)
  }, [images.length, lightboxOpen])

  return (
    <>
      <div className="w-full max-w-3xl mx-auto">
        <div 
          className="relative overflow-hidden rounded-xl aspect-[16/9] sm:aspect-[2/1] group shadow-lg cursor-pointer" 
          onClick={() => setLightboxOpen(true)}
          style={{ border: `1px solid ${theme.getOpacityStyle('border', 0.2)}`, boxShadow: `0 10px 15px -3px ${theme.getOpacityStyle('border', 0.05)}` }}
        >
          {images.map((img, idx) => (
            <motion.img
              key={idx}
              src={img.src}
              alt={img.alt}
              initial={false}
              animate={{ opacity: idx === activeIndex ? 1 : 0, scale: idx === activeIndex ? 1.05 : 1 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 h-1/4" style={{ background: `linear-gradient(to top, ${theme.bgPrimary}cc, transparent)` }} />
          <div className="absolute inset-0 rounded-xl transition-all duration-500 group-hover:bg-black/20" style={{ boxShadow: `inset 0 0 0 1px ${theme.getOpacityStyle('border', 0.1)}` }} />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white">
              <Maximize className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`rounded-full transition-all duration-500 ${idx === activeIndex ? 'w-7 h-2.5' : 'w-2.5 h-2.5'}`}
              style={idx === activeIndex 
                ? { backgroundColor: theme.accent, boxShadow: `0 0 8px ${theme.getOpacityStyle('border', 0.4)}` } 
                : { backgroundColor: theme.getOpacityStyle('bg', 0.25) }
              }
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {lightboxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md"
            >
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-[10000]"
              >
                <X className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); setActiveIndex((p) => (p - 1 + images.length) % images.length); }}
                className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-[10000]"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="relative w-full max-w-5xl px-4 sm:px-16 aspect-[16/9] sm:aspect-auto sm:h-[80vh] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <motion.img
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  src={images[activeIndex].src}
                  alt={images[activeIndex].alt}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
                <p className="mt-4 text-white/70 text-sm tracking-widest uppercase font-display">
                  {activeIndex + 1} / {images.length}
                </p>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); setActiveIndex((p) => (p + 1) % images.length); }}
                className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-[10000]"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

/* ─── Music Toggle ─── */
function MusicToggle({ isPlaying, onToggle, theme }: { isPlaying: boolean; onToggle: () => void; theme: TemplateTheme }) {
  return (
    <button
      onClick={onToggle}
      className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${isPlaying ? 'music-pulse' : ''}`}
      style={{ border: `1px solid ${theme.getOpacityStyle('border', 0.3)}`, backgroundColor: `${theme.bgPrimary}cc` }}
      aria-label={isPlaying ? 'Mute music' : 'Play music'}
    >
      {isPlaying ? <Music2 className="w-4 h-4" style={{ color: theme.accent }} /> : <Music className="w-4 h-4" style={{ color: theme.getOpacityStyle('text', 0.5) }} />}
    </button>
  )
}

/* ─── Realistic Door Surface Material ─── */
function DoorSurface({ theme, side }: { theme: TemplateTheme; side: 'left' | 'right' }) {
  const ds = theme.doorStyle
  const a = theme.accentRgb

  const escapedAccent = theme.accent.replace('#', '%23')
  const boardSeamsPattern = `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='0'%3E%3Cstop offset='0' stop-color='${escapedAccent}' stop-opacity='0.03'/%3E%3Cstop offset='0.5' stop-color='${escapedAccent}' stop-opacity='0.06'/%3E%3Cstop offset='1' stop-color='${escapedAccent}' stop-opacity='0.02'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='200' height='200'/%3E%3Cpath d='M25 0v200M55 0v200M85 0v200M115 0v200M145 0v200M175 0v200' stroke='${escapedAccent}' stroke-width='0.4' opacity='0.25'/%3E%3C/svg%3E")`

  // Material-specific CSS background textures
  const materialStyles: Record<string, React.CSSProperties> = {
    wood: {
      backgroundImage: `
        ${boardSeamsPattern},
        repeating-linear-gradient(90deg, transparent 0px, rgba(${a},0.02) 1px, transparent 2px, transparent 8px),
        repeating-linear-gradient(180deg, rgba(${a},0.015) 0px, transparent 2px, transparent 20px),
        linear-gradient(160deg, ${theme.bgDoor} 0%, ${(theme.id === 'emerald-noir' || theme.id === 'mughal-emerald') ? '#183d35' : '#3d2614'} 35%, ${theme.bgDoor} 60%, ${theme.bgSecondary} 100%)
      `,
    },
    lacquer: {
      backgroundImage: `
        linear-gradient(155deg, rgba(255,255,255,0.12) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.06) 100%),
        linear-gradient(180deg, ${theme.bgDoor}, ${theme.bgSecondary})
      `,
      boxShadow: `inset 0 1px 3px rgba(255,255,255,0.15), inset 0 -1px 2px rgba(0,0,0,0.2)`,
    },
    glass: {
      background: `linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%)`,
      backgroundColor: theme.isLight ? 'rgba(248, 250, 252, 0.65)' : 'rgba(10, 14, 26, 0.65)',
      backdropFilter: 'blur(16px) saturate(120%)',
      border: `1.5px solid rgba(${a}, 0.35)`,
      boxShadow: `inset 0 1px 2px rgba(255,255,255,0.2), inset 0 0 15px rgba(${a}, 0.1), 0 8px 32px 0 rgba(0, 0, 0, 0.35)`,
    },
    stone: {
      backgroundImage: `
        repeating-linear-gradient(180deg, transparent 0px, rgba(0,0,0,0.15) 1px, transparent 2px, transparent 90px),
        repeating-linear-gradient(90deg, transparent 0px, rgba(0,0,0,0.15) 1px, transparent 2px, transparent 110px),
        radial-gradient(ellipse at 30% 20%, rgba(${a},0.08), transparent 50%),
        radial-gradient(ellipse at 70% 80%, rgba(${a},0.06), transparent 50%),
        linear-gradient(180deg, ${theme.bgDoor}, ${theme.bgSecondary})
      `,
    },
    painted: {
      backgroundImage: `
        ${boardSeamsPattern},
        repeating-linear-gradient(90deg, rgba(0,0,0,0.03) 0px, transparent 1px, transparent 20px, rgba(255,255,255,0.02) 21px, transparent 40px),
        linear-gradient(180deg, ${theme.bgDoor}, ${theme.bgSecondary})
      `,
    },
  }

  // Ornamental inlay overlay (carved/studded patterns)
  const renderInlay = () => {
    if (ds.panelLayout === 'carved') {
      return (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
          {/* Central ornamental inlay - Mughal-inspired carved pattern */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] h-[30%]" style={{
            border: `2px solid rgba(${a},0.3)`,
            borderRadius: '8px 8px 4px 4px',
            boxShadow: `inset 0 0 12px rgba(${a},0.1), 0 0 8px rgba(${a},0.08)`,
          }}>
            <div className="absolute inset-2" style={{
              border: `1px solid rgba(${a},0.2)`,
              borderRadius: '4px',
            }} />
            {/* Central motif */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full" style={{
              border: `2px solid rgba(${a},0.35)`,
              boxShadow: `inset 0 0 6px rgba(${a},0.15), 0 0 4px rgba(${a},0.1)`,
            }}>
              <div className="absolute inset-1.5 rounded-full" style={{ border: `1px solid rgba(${a},0.2)` }} />
            </div>
          </div>
          {/* Top decorative arch carving */}
          <svg className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[50%] h-[15%] opacity-40" viewBox="0 0 120 50" fill="none">
            <path d="M10 50 Q10 10 60 5 Q110 10 110 50" stroke={`rgba(${a},0.5)`} strokeWidth="1.2" fill="none" />
            <path d="M18 50 Q18 18 60 13 Q102 18 102 50" stroke={`rgba(${a},0.3)`} strokeWidth="0.8" fill="none" />
          </svg>
          {/* Bottom decorative carving */}
          <svg className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[50%] h-[10%] opacity-30" viewBox="0 0 120 30" fill="none">
            <path d="M10 0 Q30 25 60 28 Q90 25 110 0" stroke={`rgba(${a},0.5)`} strokeWidth="1" fill="none" />
          </svg>
        </div>
      )
    }
    if (ds.panelLayout === 'studded') {
      // Brass stud pattern
      return (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
          {/* Stud pattern grid */}
          {Array.from({ length: 5 }).map((_, row) =>
            Array.from({ length: 3 }).map((_, col) => (
              <div
                key={`stud-${row}-${col}`}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  top: `${15 + row * 17}%`,
                  left: `${20 + col * 25}%`,
                  background: `radial-gradient(circle at 35% 35%, ${theme.accentLight}, ${theme.accent}, ${theme.accentDark})`,
                  boxShadow: `0 1px 3px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.3)`,
                  border: `0.5px solid rgba(${a},0.6)`,
                }}
              />
            ))
          )}
          {/* Stud border rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`top-stud-${i}`}
              className="absolute w-2.5 h-2.5 rounded-full"
              style={{
                top: '5%',
                left: `${10 + i * 11}%`,
                background: `radial-gradient(circle at 35% 35%, ${theme.accentLight}, ${theme.accentDark})`,
                boxShadow: `0 1px 2px rgba(0,0,0,0.4)`,
              }}
            />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`bot-stud-${i}`}
              className="absolute w-2.5 h-2.5 rounded-full"
              style={{
                bottom: '5%',
                left: `${10 + i * 11}%`,
                background: `radial-gradient(circle at 35% 35%, ${theme.accentLight}, ${theme.accentDark})`,
                boxShadow: `0 1px 2px rgba(0,0,0,0.4)`,
              }}
            />
          ))}
        </div>
      )
    }
    return null
  }

  // Glass pane grid for French door style
  const renderGlassGrid = () => {
    if (ds.panelLayout !== 'glass-grid') return null
    const rows = 4
    const cols = 2
    return (
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2, padding: '8%' }}>
        <div className="w-full h-full grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: '4px' }}>
          {Array.from({ length: rows * cols }).map((_, i) => (
            <div key={`glass-${i}`} style={{
              background: `linear-gradient(155deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 40%, rgba(255,255,255,0.04) 100%)`,
              border: `2px solid rgba(${a},0.25)`,
              borderRadius: '2px',
              boxShadow: `inset 0 0 8px rgba(255,255,255,0.03), 0 1px 2px rgba(0,0,0,0.15)`,
            }}>
              {/* Glass reflection highlight */}
              <div className="w-full h-full" style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)`,
                borderRadius: '1px',
              }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderMughalEmeraldDetails = () => {
    if (theme.id !== 'mughal-emerald') return null
    const isLeft = side === 'left'
    const gold = '#dfba73'
    const goldLight = '#fbeaa8'
    const rosettesY = [16, 46, 76, 106, 136, 166]

    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
        <svg className="absolute inset-0 w-full h-full opacity-90" viewBox="0 0 100 200" preserveAspectRatio="none">
          {/* Side Border Area (Hinge side) */}
          <line 
            x1={isLeft ? '14' : '86'} 
            y1='0' 
            x2={isLeft ? '14' : '86'} 
            y2='200' 
            stroke={gold} 
            strokeWidth='0.8' 
          />
          
          {/* Scalloped Medallions in Side Border */}
          {rosettesY.map((y, i) => {
            const rx = isLeft ? 7 : 93
            return (
              <g key={i}>
                {/* Scalloped Frame */}
                <path 
                  d={`
                    M ${rx} ${y - 9} 
                    Q ${rx + 5} ${y - 9} ${rx + 5} ${y - 5}
                    Q ${rx + 5} ${y} ${rx + 5} ${y + 5}
                    Q ${rx + 5} ${y + 9} ${rx} ${y + 9}
                    Q ${rx - 5} ${y + 9} ${rx - 5} ${y + 5}
                    Q ${rx - 5} ${y} ${rx - 5} ${y - 5}
                    Q ${rx - 5} ${y - 9} ${rx} ${y - 9}
                  `} 
                  fill="none" 
                  stroke={gold} 
                  strokeWidth="0.6" 
                />
                {/* Inner rosette flower */}
                <circle cx={rx} cy={y} r="1.5" fill={goldLight} />
                {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
                  const rad = (deg * Math.PI) / 180
                  const x2 = rx + Math.cos(rad) * 4
                  const y2 = y + Math.sin(rad) * 4
                  return (
                    <line key={deg} x1={rx} y1={y} x2={x2} y2={y2} stroke={gold} strokeWidth="0.4" />
                  )
                })}
              </g>
            )
          })}

          {/* Climbing Wavy Vine Border */}
          <path 
            d={isLeft 
              ? "M 19 0 Q 16 16 19 32 Q 22 48 19 64 Q 16 80 19 96 Q 22 112 19 128 Q 16 144 19 160 Q 22 176 19 192 L 19 200" 
              : "M 81 0 Q 78 16 81 32 Q 84 48 81 64 Q 78 80 81 96 Q 84 112 81 128 Q 78 144 81 160 Q 84 176 81 192 L 81 200"}
            fill="none" 
            stroke={gold} 
            strokeWidth="0.5" 
          />
          {/* Leaves along the vine */}
          {[10, 30, 50, 70, 90, 110, 130, 150, 170, 190].map(y => {
            const vx = isLeft ? 19 : 81
            const dir = y % 20 === 0 ? 1.5 : -1.5
            return (
              <circle key={y} cx={vx + dir} cy={y} r="0.8" fill={goldLight} />
            )
          })}

          {/* Central Panel Layout (Spanning from side-border to center seam) */}
          
          {/* 1. Upper Arched Panel (Y = 8 to Y = 32) */}
          <path 
            d={isLeft 
              ? "M 24 32 L 24 24 Q 24 16 35 14 Q 45 12 55 10 L 100 10 L 100 32 Z" 
              : "M 76 32 L 76 24 Q 76 16 65 14 Q 55 12 45 10 L 0 10 L 0 32 Z"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.8" 
          />
          {/* Inner details for upper arched panel */}
          <path 
            d={isLeft 
              ? "M 27 30 L 27 25 Q 27 18 36 16 Q 46 14 56 12 L 100 12" 
              : "M 73 30 L 73 25 Q 73 18 64 16 Q 54 14 44 12 L 0 12"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.4" 
            strokeDasharray="1.5,1.5" 
          />
          {/* Branching bouquet inside upper arched panel */}
          <path 
            d={isLeft 
              ? "M 100 32 Q 85 28 85 22 Q 85 16 93 14" 
              : "M 0 32 Q 15 28 15 22 Q 15 16 7 14"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.6" 
          />
          <path 
            d={isLeft 
              ? "M 100 28 Q 78 26 75 18" 
              : "M 0 28 Q 22 26 25 18"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.5" 
          />
          <circle cx={isLeft ? 85 : 15} cy="22" r="1.5" fill={goldLight} />
          <circle cx={isLeft ? 75 : 25} cy="18" r="1.5" fill={goldLight} />
          <circle cx={isLeft ? 93 : 7} cy="14" r="1" fill={goldLight} />

          {/* 2. Middle Panel (Y = 35 to Y = 135) */}
          <rect 
            x={isLeft ? '24' : '0'} 
            y='35' 
            width='76' 
            height='100' 
            fill='none' 
            stroke={gold} 
            strokeWidth='0.8' 
          />
          <rect 
            x={isLeft ? '26' : '2'} 
            y='37' 
            width='72' 
            height='96' 
            fill='none' 
            stroke={gold} 
            strokeWidth='0.4' 
            strokeDasharray="2,2" 
          />

          {/* Oval Medallion inside Middle Panel */}
          <path 
            d={isLeft 
              ? "M 100 45 C 55 45 38 65 38 85 C 38 105 55 125 100 125" 
              : "M 0 45 C 45 45 62 65 62 85 C 62 105 45 125 0 125"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="1.2" 
          />
          {/* Inner bead border of Oval */}
          <path 
            d={isLeft 
              ? "M 100 48 C 58 48 41 67 41 85 C 41 103 58 122 100 122" 
              : "M 0 48 C 42 48 59 67 59 85 C 59 103 42 122 0 122"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.4" 
            strokeDasharray="1,2" 
          />

          {/* Tree of Life Inside Oval */}
          {/* Main trunk along center seam */}
          <line 
            x1={isLeft ? '100' : '0'} 
            y1='122' 
            x2={isLeft ? '100' : '0'} 
            y2='50' 
            stroke={gold} 
            strokeWidth='2' 
          />
          
          {/* Branches curving out from trunk */}
          {/* Lower branch */}
          <path 
            d={isLeft 
              ? "M 100 110 Q 75 108 65 95 C 55 82 72 75 75 88" 
              : "M 0 110 Q 25 108 35 95 C 45 82 28 75 25 88"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.8" 
          />
          <circle cx={isLeft ? 75 : 25} cy="88" r="2.2" fill={goldLight} />
          
          {/* Middle branch */}
          <path 
            d={isLeft 
              ? "M 100 90 Q 70 85 58 72 C 48 60 62 55 64 65" 
              : "M 0 90 Q 30 85 42 72 C 52 60 38 55 36 65"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.8" 
          />
          <circle cx={isLeft ? 64 : 36} cy="65" r="2" fill={goldLight} />

          {/* Upper branch */}
          <path 
            d={isLeft 
              ? "M 100 70 Q 78 65 70 54 C 65 45 74 42 76 50" 
              : "M 0 70 Q 22 65 30 54 C 35 45 26 42 24 50"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.6" 
          />
          <circle cx={isLeft ? 76 : 24} cy="50" r="1.8" fill={goldLight} />

          {/* Top branching shoots */}
          <path 
            d={isLeft 
              ? "M 100 58 Q 88 52 86 44" 
              : "M 0 58 Q 12 52 14 44"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.5" 
          />
          <circle cx={isLeft ? 86 : 14} cy="44" r="1" fill={goldLight} />

          {/* Corner Scrolls (Outside Oval, inside middle panel) */}
          {/* Top Corner Scroll */}
          <path 
            d={isLeft 
              ? "M 28 40 Q 38 40 38 48 C 38 54 30 54 33 46" 
              : "M 72 40 Q 62 40 62 48 C 62 54 70 54 67 46"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.5" 
          />
          <circle cx={isLeft ? 33 : 67} cy="46" r="1" fill={goldLight} />
          {/* Bottom Corner Scroll */}
          <path 
            d={isLeft 
              ? "M 28 130 Q 38 130 38 122 C 38 116 30 116 33 124" 
              : "M 72 130 Q 62 130 62 122 C 62 116 70 116 67 124"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.5" 
          />
          <circle cx={isLeft ? 33 : 67} cy="124" r="1" fill={goldLight} />


          {/* 3. Bottom Panel (Y = 138 to Y = 192) */}
          <rect 
            x={isLeft ? '24' : '0'} 
            y='138' 
            width='76' 
            height='54' 
            fill='none' 
            stroke={gold} 
            strokeWidth='0.8' 
          />
          <rect 
            x={isLeft ? '26' : '2'} 
            y='140' 
            width='72' 
            height='50' 
            fill='none' 
            stroke={gold} 
            strokeWidth='0.4' 
            strokeDasharray="2,2" 
          />

          {/* Bottom Horizontal Oval Medallion */}
          <path 
            d={isLeft 
              ? "M 100 148 C 50 148 34 154 34 165 C 34 176 50 182 100 182" 
              : "M 0 148 C 50 148 66 154 66 165 C 66 176 50 182 0 182"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="1" 
          />
          {/* Flowering branch inside Bottom Oval */}
          <path 
            d={isLeft 
              ? "M 100 165 Q 65 160 55 165 C 45 170 58 178 66 174" 
              : "M 0 165 Q 35 160 45 165 C 55 170 42 178 34 174"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.6" 
          />
          <circle cx={isLeft ? 66 : 34} cy="174" r="1.8" fill={goldLight} />
          <path 
            d={isLeft 
              ? "M 85 163 Q 75 152 78 156" 
              : "M 15 163 Q 25 152 22 156"} 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.5" 
          />
          <circle cx={isLeft ? 78 : 22} cy="156" r="1.2" fill={goldLight} />
        </svg>
      </div>
    )
  }

  let baseStyle = materialStyles[ds.doorMaterial] || materialStyles.wood;

  if (ds.type === 'curtains') {
    baseStyle = {
      backgroundImage: `
        linear-gradient(90deg, 
          rgba(0,0,0,0.45) 0%, 
          rgba(255,255,255,0.06) 8%, 
          rgba(0,0,0,0.15) 16%, 
          rgba(255,255,255,0.04) 24%, 
          rgba(0,0,0,0.35) 32%, 
          rgba(255,255,255,0.08) 40%, 
          rgba(0,0,0,0.2) 48%, 
          rgba(255,255,255,0.06) 56%, 
          rgba(0,0,0,0.35) 64%, 
          rgba(255,255,255,0.08) 72%, 
          rgba(0,0,0,0.2) 80%, 
          rgba(255,255,255,0.06) 88%, 
          rgba(0,0,0,0.5) 100%
        ),
        linear-gradient(180deg, ${theme.bgDoor}, ${theme.bgSecondary})
      `,
      boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.6)',
    };
  } else if (ds.type === 'scroll') {
    baseStyle = {
      backgroundImage: `
        linear-gradient(0deg, rgba(0,0,0,0.25) 0%, transparent 6%, transparent 94%, rgba(0,0,0,0.25) 100%),
        repeating-linear-gradient(0deg, transparent 0px, rgba(${a}, 0.015) 2px, transparent 4px),
        linear-gradient(90deg, rgba(${a}, 0.08) 0%, transparent 8%, transparent 92%, rgba(${a}, 0.08) 100%),
        linear-gradient(180deg, ${theme.bgDoor}, ${theme.bgSecondary})
      `,
      boxShadow: 'inset 0 0 15px rgba(0,0,0,0.35)',
    };
  } else if (ds.type === 'petals' || ds.type === 'lotus') {
    baseStyle = {
      backgroundImage: `
        radial-gradient(circle at 100% 50%, rgba(${a},0.06) 0%, transparent 65%),
        radial-gradient(circle at 0% 50%, rgba(${a},0.06) 0%, transparent 65%),
        linear-gradient(180deg, ${theme.bgDoor}, ${theme.bgSecondary})
      `,
    };
  } else if (ds.type === 'archway') {
    baseStyle = {
      backgroundImage: `
        repeating-linear-gradient(90deg, transparent 0px, rgba(0,0,0,0.12) 30px, transparent 31px),
        repeating-linear-gradient(0deg, transparent 0px, rgba(0,0,0,0.12) 15px, transparent 16px),
        radial-gradient(circle at 50% 50%, transparent 20%, rgba(0,0,0,0.35) 100%),
        linear-gradient(180deg, ${theme.bgDoor}, ${theme.bgSecondary})
      `,
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)',
    };
  } else if (ds.type === 'lantern') {
    baseStyle = {
      backgroundImage: `
        radial-gradient(circle at 50% 50%, rgba(255, 244, 200, 0.22) 0%, transparent 70%),
        linear-gradient(180deg, ${theme.bgDoor}, ${theme.bgSecondary})
      `,
      boxShadow: `inset 0 0 25px rgba(${a}, 0.15), 0 0 10px rgba(${a}, 0.05)`,
    };
  } else if (ds.type === 'dome') {
    baseStyle = {
      backgroundImage: `
        radial-gradient(circle at 50% 10%, rgba(${a}, 0.08) 0%, transparent 60%),
        linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(0,0,0,0.25) 100%),
        linear-gradient(180deg, ${theme.bgDoor}, ${theme.bgSecondary})
      `,
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.35)',
    };
  }

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      {/* Material base texture */}
      <div className="absolute inset-0" style={baseStyle} />
      {/* Glass-specific frosted overlay & sheen reflection */}
      {ds.doorMaterial === 'glass' && (
        <>
          <div className="absolute inset-0" style={{
            background: `radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.06), transparent 60%)`,
          }} />
          <div 
            className="absolute inset-y-0 w-1/2 opacity-20" 
            style={{
              background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4) 50%, transparent)`,
              animation: 'doorShimmerComposited 6s ease-in-out infinite',
            }} 
          />
          <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.18)]" />
        </>
      )}
      {/* Stone marble veining */}
      {ds.doorMaterial === 'stone' && (
        <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 200 400" fill="none">
          <path d="M30 50 Q80 80 60 150 Q40 220 90 280 Q120 320 80 400" stroke={`rgba(${a},0.4)`} strokeWidth="0.6" fill="none" />
          <path d="M170 30 Q130 70 150 130 Q170 190 120 250 Q100 290 140 380" stroke={`rgba(${a},0.3)`} strokeWidth="0.4" fill="none" />
          <path d="M100 0 Q90 60 110 120 Q130 180 100 240" stroke={`rgba(${a},0.2)`} strokeWidth="0.3" fill="none" />
        </svg>
      )}
      {/* Lacquer gloss highlight */}
      {ds.doorMaterial === 'lacquer' && (
        <div className="absolute inset-0" style={{
          background: `linear-gradient(160deg, rgba(255,255,255,0.1) 0%, transparent 25%, transparent 75%, rgba(255,255,255,0.04) 100%)`,
        }} />
      )}
      {/* Panel inlay/carving overlay */}
      {renderInlay()}
      {/* Glass grid panes */}
      {renderGlassGrid()}
      {/* Mughal Emerald custom ornaments */}
      {renderMughalEmeraldDetails()}
    </div>
  )
}

/* ─── Door Panel Content ─── */
function DoorPanelContent({ theme, text, textLang }: { theme: TemplateTheme; text: string; textLang: string }) {
  const isRtl = textLang === 'ar' || textLang === 'ur'
  const ds = theme.doorStyle
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        {/* Central ornament - varies by svgPattern */}
        <svg className="w-20 h-20 opacity-30" viewBox="0 0 100 100" fill="none">
          {ds.svgPattern === 'arch' && (
            <>
              <circle cx="50" cy="50" r="40" stroke={theme.accent} strokeWidth="0.5" opacity="0.4" />
              <circle cx="50" cy="50" r="30" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
                <line key={a} x1="50" y1="10" x2="50" y2="90" stroke={theme.accent} strokeWidth="0.3" opacity="0.15" transform={`rotate(${a} 50 50)`} />
              ))}
            </>
          )}
          {ds.svgPattern === 'floral' && (
            <>
              <circle cx="50" cy="50" r="25" stroke={theme.accent} strokeWidth="0.5" opacity="0.4" />
              {[0, 72, 144, 216, 288].map(a => (
                <ellipse key={a} cx="50" cy="25" rx="6" ry="14" stroke={theme.accent} strokeWidth="0.4" opacity="0.3" transform={`rotate(${a} 50 50)`} />
              ))}
            </>
          )}
          {ds.svgPattern === 'minimal' && (
            <>
              <line x1="20" y1="50" x2="80" y2="50" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" />
              <line x1="50" y1="20" x2="50" y2="80" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" />
              <circle cx="50" cy="50" r="2" fill={theme.accent} opacity="0.4" />
            </>
          )}
          {ds.svgPattern === 'mandala' && (
            <>
              <circle cx="50" cy="50" r="35" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" />
              <circle cx="50" cy="50" r="22" stroke={theme.accent} strokeWidth="0.4" opacity="0.25" />
              <circle cx="50" cy="50" r="10" stroke={theme.accent} strokeWidth="0.3" opacity="0.2" />
              {Array.from({ length: 12 }).map((_, i) => (
                <line key={i} x1="50" y1="15" x2="50" y2="85" stroke={theme.accent} strokeWidth="0.2" opacity="0.15" transform={`rotate(${i * 30} 50 50)`} />
              ))}
            </>
          )}
          {ds.svgPattern === 'paisley' && (
            <>
              <path d="M50 20 Q70 35 65 55 Q60 70 45 65 Q30 55 35 40 Q40 25 50 20Z" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" fill="none" />
              <path d="M50 25 Q60 35 55 50 Q50 60 42 55" stroke={theme.accent} strokeWidth="0.3" opacity="0.2" fill="none" />
            </>
          )}
          {ds.svgPattern === 'diamond' && (
            <>
              <polygon points="50,15 85,50 50,85 15,50" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" fill="none" />
              <polygon points="50,30 70,50 50,70 30,50" stroke={theme.accent} strokeWidth="0.4" opacity="0.25" fill="none" />
            </>
          )}
          {ds.svgPattern === 'dome' && (
            <>
              <path d="M20 60 Q20 25 50 15 Q80 25 80 60" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" fill="none" />
              <line x1="50" y1="15" x2="50" y2="8" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" />
              <circle cx="50" cy="6" r="3" stroke={theme.accent} strokeWidth="0.4" opacity="0.25" fill="none" />
            </>
          )}
          {ds.svgPattern === 'star' && (
            <>
              <polygon points="50,15 57,38 80,38 62,52 68,75 50,62 32,75 38,52 20,38 43,38" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" fill="none" />
              <polygon points="50,25 54,38 65,38 56,46 59,58 50,52 41,58 44,46 35,38 46,38" stroke={theme.accent} strokeWidth="0.3" opacity="0.2" fill="none" />
            </>
          )}
          {ds.svgPattern === 'lantern' && (
            <>
              <path d="M35 40 Q35 25 50 20 Q65 25 65 40" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" fill="none" />
              <rect x="37" y="40" width="26" height="30" stroke={theme.accent} strokeWidth="0.4" opacity="0.25" fill="none" rx="2" />
              <path d="M37 70 Q37 80 50 85 Q63 80 65 70" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" fill="none" />
            </>
          )}
          {ds.svgPattern === 'geometric' && (
            <>
              <polygon points="50,20 70,35 70,60 50,75 30,60 30,35" stroke={theme.accent} strokeWidth="0.5" opacity="0.3" fill="none" />
              <polygon points="50,30 60,38 60,55 50,63 40,55 40,38" stroke={theme.accent} strokeWidth="0.3" opacity="0.2" fill="none" />
            </>
          )}
        </svg>
        <span
          className={`${theme.fontCalligraphy} text-3xl sm:text-4xl leading-relaxed`}
          dir={isRtl ? 'rtl' : 'ltr'}
          style={{ color: theme.getOpacityStyle('text', 0.8) }}
        >
          {text}
        </span>
        <div className="w-12 h-px" style={{ backgroundColor: theme.getOpacityStyle('bg', 0.3) }} />
      </div>
    </div>
  )
}

/* ─── Door Handle - Per-type realistic hardware ─── */
function DoorHandle({ theme, side }: { theme: TemplateTheme; side: 'left' | 'right' }) {
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

/* ─── Center Button Styles ─── */
function CenterButton({ theme, onClick }: { theme: TemplateTheme; onClick: () => void }) {
  const ds = theme.doorStyle

  // Organic wax seal colors matching each theme's vibe
  const sealColor = theme.id === 'emerald-noir' || theme.id === 'mughal-emerald'
    ? '#09251c'
    : theme.id === 'crimson-royale' || theme.id === 'royal-elegance'
    ? '#420d14'
    : theme.id === 'rose-gold-blush' || theme.id === 'rose-gold-blush-royal'
    ? '#5c222e'
    : theme.id === 'majestic-love'
    ? '#3b250d'
    : '#1e1a14' // woody/slate brown default

  const sealHighlight = theme.id === 'emerald-noir' || theme.id === 'mughal-emerald'
    ? '#184b3b'
    : theme.id === 'crimson-royale' || theme.id === 'royal-elegance'
    ? '#7c1c27'
    : theme.id === 'rose-gold-blush' || theme.id === 'rose-gold-blush-royal'
    ? '#993f51'
    : theme.id === 'majestic-love'
    ? '#6b4822'
    : '#483f36'

  const accent = theme.accent

  return (
    <motion.button
      onClick={onClick}
      className="relative w-28 h-28 md:w-36 md:h-36 cursor-pointer focus:outline-none select-none z-30"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      animate={{ y: [0, -6, 0] }}
      transition={{ y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } }}
      aria-label="Open invitation"
    >
      {/* Outer irregular melted wax overflow */}
      <div 
        className="absolute inset-0 shadow-2xl transition-all duration-300"
        style={{
          borderRadius: '48% 52% 51% 49% / 51% 48% 52% 49%',
          background: `radial-gradient(circle at 35% 35%, ${sealHighlight}, ${sealColor})`,
          boxShadow: '0 10px 30px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.18), inset 0 -3px 8px rgba(0,0,0,0.45)',
          border: `1px solid ${theme.getOpacityStyle('border', 0.12)}`
        }}
      />
      {/* Inner wax stamp stamp-recess */}
      <div 
        className="absolute inset-2.5"
        style={{
          borderRadius: '50% 50% 48% 52% / 48% 52% 50% 50%',
          background: `radial-gradient(circle at 40% 30%, ${sealHighlight}, ${sealColor})`,
          boxShadow: 'inset 2px 3px 6px rgba(0,0,0,0.45), inset -2px -2px 4px rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.2)',
          border: `0.5px solid ${theme.getOpacityStyle('border', 0.08)}`
        }}
      />
      {/* Gold monogram circle border inside seal */}
      <div 
        className="absolute inset-5 opacity-30 border border-dashed"
        style={{ 
          borderColor: accent,
          borderRadius: '50% 48% 51% 49% / 51% 49% 50% 50%',
        }} 
      />
      {/* Embossed symbol / letter in the center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span 
          className={`text-3xl md:text-4xl font-semibold select-none filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.55)] ${theme.fontDisplay}`} 
          style={{ 
            color: accent,
          }}
        >
          {ds.centerIcon || '❦'}
        </span>
        <span 
          className={`text-[7px] md:text-[9px] tracking-[0.25em] uppercase mt-0.5 select-none opacity-70 ${theme.fontDisplay}`} 
          style={{ 
            color: accent,
            textShadow: '0 1px 2px rgba(0,0,0,0.4)'
          }}
        >
          open
        </span>
      </div>
      {/* Melty wax outer ripple shadow ring */}
      <div 
        className="absolute inset-[-6px] border animate-ping opacity-15" 
        style={{ 
          borderColor: theme.accent, 
          borderRadius: '50%' 
        }} 
      />
    </motion.button>
  )
}

/* ─── Door Decorative Elements ─── */
function CurtainEdge({ side, accentRgb }: { side: 'left' | 'right'; accentRgb: string }) {
  return (
    <>
      {/* Fabric tassel bottom edge */}
      <svg className={`absolute bottom-0 ${side === 'left' ? 'right-0' : 'left-0'} w-full h-28 opacity-30`} viewBox="0 0 200 70" preserveAspectRatio="none" fill="none">
        <path
          d="M0 0 Q25 15 50 5 Q75 20 100 8 Q125 18 150 5 Q175 15 200 0 L200 50 L0 50Z"
          fill={`rgba(${accentRgb},0.15)`}
        />
        {/* Tassels */}
        {[20, 50, 80, 120, 150, 180].map(x => (
          <g key={x}>
            <line x1={x} y1="48" x2={x} y2="65" stroke={`rgba(${accentRgb},0.3)`} strokeWidth="1" />
            <circle cx={x} cy="67" r="2" fill={`rgba(${accentRgb},0.25)`} />
          </g>
        ))}
      </svg>
      {/* Curtain rod top */}
      <div className={`absolute top-0 ${side === 'left' ? 'right-0' : 'left-0'} w-full h-3 opacity-40`} style={{
        background: `linear-gradient(180deg, rgba(${accentRgb},0.4), rgba(${accentRgb},0.1))`,
        borderRadius: '0 0 2px 2px',
      }} />
    </>
  )
}

function DomeCap({ accent }: { accent: string }) {
  return (
    <svg className="absolute top-0 left-0 w-full h-1/3 opacity-20" viewBox="0 0 400 150" preserveAspectRatio="none" fill="none">
      {/* Main dome */}
      <path d="M0 150 Q0 30 200 0 Q400 30 400 150" stroke={accent} strokeWidth="1.5" fill="none" />
      <path d="M20 150 Q20 50 200 20 Q380 50 380 150" stroke={accent} strokeWidth="0.8" fill="none" />
      {/* Finial */}
      <circle cx="200" cy="10" r="8" stroke={accent} strokeWidth="0.6" fill="none" />
      <line x1="200" y1="0" x2="200" y2="18" stroke={accent} strokeWidth="0.8" />
      {/* Crescent moon atop finial */}
      <path d="M196 4 Q200 0 204 4" stroke={accent} strokeWidth="0.5" fill="none" />
      {/* Minarets */}
      <rect x="10" y="120" width="8" height="30" stroke={accent} strokeWidth="0.4" fill="none" />
      <path d="M10 120 Q14 112 18 120" stroke={accent} strokeWidth="0.4" fill="none" />
      <rect x="382" y="120" width="8" height="30" stroke={accent} strokeWidth="0.4" fill="none" />
      <path d="M382 120 Q386 112 390 120" stroke={accent} strokeWidth="0.4" fill="none" />
      {/* Decorative bands */}
      <line x1="0" y1="130" x2="400" y2="130" stroke={accent} strokeWidth="0.4" />
      <line x1="0" y1="140" x2="400" y2="140" stroke={accent} strokeWidth="0.3" />
    </svg>
  )
}

function ArchwayCap({ accent }: { accent: string }) {
  return (
    <svg className="absolute top-0 left-0 w-full h-1/4 opacity-15" viewBox="0 0 400 120" preserveAspectRatio="none" fill="none">
      {/* Main arch */}
      <path d="M0 120 L0 60 Q0 0 200 0 Q400 0 400 60 L400 120" stroke={accent} strokeWidth="1.5" fill="none" />
      <path d="M20 120 L20 65 Q20 15 200 15 Q380 15 380 65 L380 120" stroke={accent} strokeWidth="0.8" fill="none" />
      {/* Keystone at top */}
      <path d="M190 0 L200 -8 L210 0" stroke={accent} strokeWidth="0.6" fill="none" />
      {/* Decorative voussoirs (arch segments) */}
      {[30, 60, 90, 120, 150, 200, 250, 280, 310, 340, 370].map(x => (
        <line key={x} x1={x} y1="0" x2={x} y2="30" stroke={accent} strokeWidth="0.2" opacity="0.3" />
      ))}
    </svg>
  )
}

function ScrollCap({ side, accent, accentRgb }: { side: 'top' | 'bottom'; accent: string; accentRgb: string }) {
  return (
    <svg className={`absolute ${side === 'top' ? 'top-0' : 'bottom-0'} left-0 w-full h-10 opacity-30`} viewBox="0 0 400 28" preserveAspectRatio="none" fill="none">
      {/* Scroll rod */}
      <rect x="0" y={side === 'top' ? '0' : '14'} width="400" height="14" rx="7" fill={`rgba(${accentRgb},0.2)`} stroke={accent} strokeWidth="0.5" />
      {/* Scroll rolled edge highlight */}
      <rect x="2" y={side === 'top' ? '2' : '16'} width="396" height="4" rx="2" fill={`rgba(${accentRgb},0.1)`} />
      {/* End caps */}
      <circle cx="10" cy={side === 'top' ? '7' : '21'} r="5" stroke={accent} strokeWidth="0.5" fill={`rgba(${accentRgb},0.15)`} />
      <circle cx="390" cy={side === 'top' ? '7' : '21'} r="5" stroke={accent} strokeWidth="0.5" fill={`rgba(${accentRgb},0.15)`} />
    </svg>
  )
}

/* ─── 3D Door Panel Inset (Raised Panel) - Multi-Layout ─── */
function DoorPanelInset({ x, y, w, h, accent, accentRgb, arched }: { x: string; y: string; w: string; h: string; accent: string; accentRgb: string; arched?: boolean }) {
  return (
    <div className="absolute" style={{
      left: x, top: y, width: w, height: h,
      background: `linear-gradient(145deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.4) 100%)`,
      border: `1.5px solid rgba(${accentRgb},0.35)`,
      borderTopColor: `rgba(${accentRgb},0.55)`,
      borderLeftColor: `rgba(${accentRgb},0.45)`,
      borderBottomColor: `rgba(${accentRgb},0.15)`,
      borderRightColor: `rgba(${accentRgb},0.15)`,
      borderRadius: arched ? '8px 8px 3px 3px' : '3px',
      boxShadow: `inset 3px 3px 8px rgba(0,0,0,0.65), inset -3px -3px 8px rgba(255,255,255,0.06), 0 2px 4px rgba(0,0,0,0.35)`,
    }}>
      {/* Inner recess border - gives raised panel effect */}
      <div className="absolute" style={{
        left: '5px', top: '5px', right: '5px', bottom: '5px',
        border: `1px solid rgba(${accentRgb},0.12)`,
        borderRadius: arched ? '6px 6px 2px 2px' : '2px',
        boxShadow: `inset 0 1px 2px rgba(0,0,0,0.12), 0 0.5px 1px rgba(${accentRgb},0.08)`,
      }} />
      {/* Subtle inner highlight - simulates light catching the panel edge */}
      <div className="absolute" style={{
        left: '1px', top: '1px', right: '60%', bottom: '85%',
        background: `linear-gradient(135deg, rgba(${accentRgb},0.2), transparent)`,
        borderRadius: arched ? '6px 0 0 0' : '2px 0 0 0',
      }} />
      {/* Arched top detail */}
      {arched && (
        <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[30%] opacity-30" viewBox="0 0 100 30" fill="none">
          <path d="M5 30 Q5 5 50 2 Q95 5 95 30" stroke={`rgba(${accentRgb},0.5)`} strokeWidth="0.8" fill="none" />
        </svg>
      )}
    </div>
  )
}

/* ─── Door Panel Layout Renderer ─── */
function DoorPanelLayout({ theme, side }: { theme: TemplateTheme; side: 'left' | 'right' }) {
  const ds = theme.doorStyle
  const a = theme.accentRgb
  const ac = theme.accent
  // Panel inset position depends on handle side - offset panels away from handle
  const panelLeft = side === 'left' ? '12%' : '8%'
  const panelW = '55%'

  switch (ds.panelLayout) {
    case '2-panel':
      return (
        <>
          <DoorPanelInset x={panelLeft} y="10%" w={panelW} h="32%" accent={ac} accentRgb={a} />
          <DoorPanelInset x={panelLeft} y="56%" w={panelW} h="32%" accent={ac} accentRgb={a} />
        </>
      )
    case '4-panel':
      return (
        <>
          <DoorPanelInset x={panelLeft} y="6%" w={panelW} h="20%" accent={ac} accentRgb={a} />
          <DoorPanelInset x={panelLeft} y="30%" w={panelW} h="20%" accent={ac} accentRgb={a} />
          <DoorPanelInset x={panelLeft} y="56%" w={panelW} h="18%" accent={ac} accentRgb={a} />
          <DoorPanelInset x={panelLeft} y="78%" w={panelW} h="16%" accent={ac} accentRgb={a} />
        </>
      )
    case 'arched-panel':
      return (
        <>
          <DoorPanelInset x={panelLeft} y="8%" w={panelW} h="38%" accent={ac} accentRgb={a} arched />
          <DoorPanelInset x={panelLeft} y="56%" w={panelW} h="32%" accent={ac} accentRgb={a} />
        </>
      )
    case 'carved':
      // Carved doors have subtle recessed outlines instead of raised panels
      return (
        <>
          <div className="absolute" style={{
            left: panelLeft, top: '10%', width: panelW, height: '80%',
            border: `1px solid rgba(${a},0.15)`,
            borderRadius: '4px',
            boxShadow: `inset 0 0 10px rgba(0,0,0,0.15)`,
          }}>
            <div className="absolute" style={{
              left: '6px', top: '6px', right: '6px', bottom: '6px',
              border: `1px solid rgba(${a},0.1)`,
              borderRadius: '2px',
            }} />
          </div>
        </>
      )
    case 'studded':
      // Studded doors have a border outline but no raised panels
      return (
        <>
          <div className="absolute" style={{
            left: '10%', top: '10%', width: '70%', height: '80%',
            border: `2px solid rgba(${a},0.2)`,
            borderRadius: '3px',
            boxShadow: `inset 0 0 8px rgba(0,0,0,0.1)`,
          }} />
        </>
      )
    case 'glass-grid':
      // French door - glass grid is handled by DoorSurface, just add a subtle outer border
      return (
        <>
          <div className="absolute" style={{
            left: '6%', top: '6%', width: '88%', height: '88%',
            border: `2px solid rgba(${a},0.2)`,
            borderRadius: '3px',
          }} />
        </>
      )
    case 'flat':
    default:
      // Flat / modern - no panels, just a subtle border
      return null
  }
}

/* ─── Door Hinges ─── */
function DoorHinges({ side, accent, accentRgb }: { side: 'left' | 'right'; accent: string; accentRgb: string }) {
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

/* ─── Door Frame - Per-style frame rendering ─── */
function DoorFrame({ theme }: { theme: TemplateTheme }) {
  const ds = theme.doorStyle
  const fc = theme.bgDoor
  const a = theme.accentRgb
  const ac = theme.accent

  const renderCornerAccents = () => (
    <>
      {[
        { top: '0', left: '0' },
        { top: '0', right: '0' },
        { bottom: '0', left: '0' },
        { bottom: '0', right: '0' },
      ].map((pos, i) => (
        <div key={i} className="absolute w-8 h-8" style={{ ...pos, background: `radial-gradient(circle at center, rgba(${a},0.25), transparent)` }} />
      ))}
    </>
  )

  switch (ds.frameStyle) {
    case 'modern':
      // Sleek minimal steel frame
      return (
        <div className="absolute inset-0 pointer-events-none z-[1]">
          {/* Top - thin steel bar */}
          <div className="absolute top-0 left-0 right-0 h-4" style={{
            background: `linear-gradient(180deg, #444, #333)`,
            borderBottom: `1px solid rgba(255,255,255,0.1)`,
          }} />
          {/* Bottom threshold - thin */}
          <div className="absolute bottom-0 left-0 right-0 h-3" style={{
            background: `linear-gradient(0deg, #444, #333)`,
            borderTop: `1px solid rgba(255,255,255,0.08)`,
          }} />
          {/* Left pillar - thin steel */}
          <div className="absolute top-4 left-0 w-3 bottom-3" style={{
            background: `linear-gradient(90deg, #444, #3a3a3a)`,
            borderRight: `1px solid rgba(255,255,255,0.08)`,
          }} />
          {/* Right pillar */}
          <div className="absolute top-4 right-0 w-3 bottom-3" style={{
            background: `linear-gradient(270deg, #444, #3a3a3a)`,
            borderLeft: `1px solid rgba(255,255,255,0.08)`,
          }} />
        </div>
      )

    case 'simple':
      // Clean simple molding
      return (
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute top-0 left-0 right-0 h-5" style={{
            background: `linear-gradient(180deg, ${fc}, ${fc}cc)`,
            borderBottom: `1px solid rgba(${a},0.2)`,
          }} />
          <div className="absolute bottom-0 left-0 right-0 h-4" style={{
            background: `linear-gradient(0deg, ${fc}, ${fc}bb)`,
            borderTop: `1px solid rgba(${a},0.2)`,
          }} />
          <div className="absolute top-5 left-0 w-5 bottom-4" style={{
            background: `linear-gradient(90deg, ${fc}, ${fc}99)`,
            borderRight: `1px solid rgba(${a},0.15)`,
          }} />
          <div className="absolute top-5 right-0 w-5 bottom-4" style={{
            background: `linear-gradient(270deg, ${fc}, ${fc}99)`,
            borderLeft: `1px solid rgba(${a},0.15)`,
          }} />
        </div>
      )

    case 'arched-stone':
      // Grand stone/marble Mughal archway frame
      return (
        <div className="absolute inset-0 pointer-events-none z-[1]">
          {/* Arch shape at top */}
          <svg className="absolute top-0 left-0 w-full h-[35%]" viewBox="0 0 400 150" preserveAspectRatio="none" fill="none">
            {/* Outer arch spandrel frame (hollow archway) */}
            <path d="M 0 150 L 0 0 L 400 0 L 400 150 L 400 80 Q 400 0 200 0 Q 0 0 0 80 Z" fill={fc} stroke={`rgba(${a},0.4)`} strokeWidth="2" />
            {/* Inner arch outline */}
            <path d="M15 150 L15 85 Q15 15 200 15 Q385 15 385 85 L385 150" fill="none" stroke={`rgba(${a},0.25)`} strokeWidth="1.5" />
            {/* Keystone */}
            <path d="M190 0 L200 -10 L210 0" stroke={`rgba(${a},0.5)`} strokeWidth="1.5" fill="none" />
            {/* Voussoirs (arch segment lines) */}
            {[40, 80, 120, 160, 200, 240, 280, 320, 360].map(x => (
              <line key={x} x1={x} y1="0" x2={x} y2="40" stroke={`rgba(${a},0.15)`} strokeWidth="0.5" />
            ))}
            {/* Decorative jali pattern in arch spandrels */}
            <circle cx="60" cy="70" r="12" stroke={`rgba(${a},0.2)`} strokeWidth="0.5" fill="none" />
            <circle cx="340" cy="70" r="12" stroke={`rgba(${a},0.2)`} strokeWidth="0.5" fill="none" />
          </svg>
          {/* Left pillar - thick stone */}
          <div className="absolute top-[30%] left-0 w-8 bottom-0" style={{
            background: `linear-gradient(90deg, ${fc}, ${fc}88)`,
            borderRight: `3px solid rgba(${a},0.2)`,
            boxShadow: `6px 0 16px rgba(0,0,0,0.3)`,
          }}>
            {/* Stone carving lines */}
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-3 h-[80%]" style={{ borderLeft: `1.5px solid rgba(${a},0.2)`, borderRight: `1.5px solid rgba(${a},0.2)` }} />
            {/* Jali lattice pattern */}
            <svg className="absolute top-[25%] left-0 w-full h-[50%] opacity-20" viewBox="0 0 30 100" fill="none">
              {Array.from({ length: 3 }).map((_, i) => (
                <polygon key={i} points={`15,${15 + i * 30} 25,${25 + i * 30} 15,${35 + i * 30} 5,${25 + i * 30}`} stroke={`rgba(${a},0.5)`} strokeWidth="0.5" fill="none" />
              ))}
            </svg>
          </div>
          {/* Right pillar */}
          <div className="absolute top-[30%] right-0 w-8 bottom-0" style={{
            background: `linear-gradient(270deg, ${fc}, ${fc}88)`,
            borderLeft: `3px solid rgba(${a},0.2)`,
            boxShadow: `-6px 0 16px rgba(0,0,0,0.3)`,
          }}>
            <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-3 h-[80%]" style={{ borderLeft: `1.5px solid rgba(${a},0.2)`, borderRight: `1.5px solid rgba(${a},0.2)` }} />
            <svg className="absolute top-[25%] left-0 w-full h-[50%] opacity-20" viewBox="0 0 30 100" fill="none">
              {Array.from({ length: 3 }).map((_, i) => (
                <polygon key={i} points={`15,${15 + i * 30} 25,${25 + i * 30} 15,${35 + i * 30} 5,${25 + i * 30}`} stroke={`rgba(${a},0.5)`} strokeWidth="0.5" fill="none" />
              ))}
            </svg>
          </div>
          {/* Bottom step */}
          <div className="absolute bottom-0 left-0 right-0 h-5" style={{
            background: `linear-gradient(0deg, ${fc}, ${fc}aa)`,
            borderTop: `2px solid rgba(${a},0.25)`,
          }} />
          {renderCornerAccents()}
        </div>
      )

    case 'painted-rosettes':
      // Painted frame with rosette corner blocks
      return (
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute top-0 left-0 right-0 h-6" style={{
            background: `linear-gradient(180deg, ${fc}, ${fc}cc)`,
            borderBottom: `2px solid rgba(${a},0.3)`,
            boxShadow: `0 3px 10px rgba(0,0,0,0.3), inset 0 -1px 3px rgba(${a},0.1)`,
          }}>
            {/* Top molding profile */}
            <div className="absolute bottom-0 left-0 right-0 h-2" style={{
              background: `linear-gradient(180deg, rgba(${a},0.08), transparent)`,
            }} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-5" style={{
            background: `linear-gradient(0deg, ${fc}, ${fc}bb)`,
            borderTop: `2px solid rgba(${a},0.3)`,
          }} />
          <div className="absolute top-6 left-0 w-6 bottom-5" style={{
            background: `linear-gradient(90deg, ${fc}, ${fc}99)`,
            borderRight: `2px solid rgba(${a},0.2)`,
            boxShadow: `3px 0 10px rgba(0,0,0,0.25)`,
          }}>
            {/* Simple molding */}
            <div className="absolute top-[20%] left-1 right-1 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
            <div className="absolute top-[50%] left-1 right-1 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
            <div className="absolute top-[80%] left-1 right-1 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
          </div>
          <div className="absolute top-6 right-0 w-6 bottom-5" style={{
            background: `linear-gradient(270deg, ${fc}, ${fc}99)`,
            borderLeft: `2px solid rgba(${a},0.2)`,
            boxShadow: `-3px 0 10px rgba(0,0,0,0.25)`,
          }}>
            <div className="absolute top-[20%] left-1 right-1 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
            <div className="absolute top-[50%] left-1 right-1 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
            <div className="absolute top-[80%] left-1 right-1 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
          </div>
          {/* Rosette corner blocks */}
          {[
            { top: '0', left: '0' },
            { top: '0', right: '0' },
            { bottom: '0', left: '0' },
            { bottom: '0', right: '0' },
          ].map((pos, i) => (
            <div key={i} className="absolute w-8 h-8 flex items-center justify-center" style={{ ...pos }}>
              {/* Rosette flower */}
              <div className="w-5 h-5 rounded-full" style={{
                border: `1.5px solid rgba(${a},0.35)`,
                boxShadow: `inset 0 0 4px rgba(${a},0.15)`,
              }}>
                <div className="w-full h-full rounded-full" style={{
                  background: `radial-gradient(circle, rgba(${a},0.2), transparent 60%)`,
                }} />
              </div>
            </div>
          ))}
        </div>
      )

    case 'ornate':
    default:
      // Ornate carved frame (original enhanced)
      return (
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute top-0 left-0 right-0 h-8" style={{
            background: `linear-gradient(180deg, ${fc}, ${fc}cc)`,
            borderBottom: `2px solid rgba(${a},0.3)`,
            boxShadow: `0 4px 12px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(${a},0.12)`,
          }}>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1/3 h-px" style={{ backgroundColor: `rgba(${a},0.25)` }} />
            <div className="absolute bottom-0 left-0 right-0 h-1" style={{
              background: `linear-gradient(180deg, rgba(${a},0.08), transparent)`,
            }} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-7" style={{
            background: `linear-gradient(0deg, ${fc}, ${fc}bb)`,
            borderTop: `2px solid rgba(${a},0.3)`,
            boxShadow: `0 -3px 10px rgba(0,0,0,0.3), inset 0 2px 4px rgba(${a},0.1)`,
          }}>
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1/4 h-px" style={{ backgroundColor: `rgba(${a},0.2)` }} />
          </div>
          <div className="absolute top-8 left-0 w-7 bottom-7" style={{
            background: `linear-gradient(90deg, ${fc}, ${fc}99)`,
            borderRight: `2px solid rgba(${a},0.25)`,
            boxShadow: `4px 0 12px rgba(0,0,0,0.3), inset -2px 0 4px rgba(${a},0.08)`,
          }}>
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-2 h-[70%]" style={{
              borderLeft: `1.5px solid rgba(${a},0.25)`,
              borderRight: `1.5px solid rgba(${a},0.25)`,
            }} />
            <div className="absolute top-[20%] left-1 w-5 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
            <div className="absolute top-[50%] left-1 w-5 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
            <div className="absolute top-[80%] left-1 w-5 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
          </div>
          <div className="absolute top-8 right-0 w-7 bottom-7" style={{
            background: `linear-gradient(270deg, ${fc}, ${fc}99)`,
            borderLeft: `2px solid rgba(${a},0.25)`,
            boxShadow: `-4px 0 12px rgba(0,0,0,0.3), inset 2px 0 4px rgba(${a},0.08)`,
          }}>
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-2 h-[70%]" style={{
              borderLeft: `1.5px solid rgba(${a},0.25)`,
              borderRight: `1.5px solid rgba(${a},0.25)`,
            }} />
            <div className="absolute top-[20%] right-1 w-5 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
            <div className="absolute top-[50%] right-1 w-5 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
            <div className="absolute top-[80%] right-1 w-5 h-px" style={{ backgroundColor: `rgba(${a},0.15)` }} />
          </div>
          {renderCornerAccents()}
          {/* Keystone at top center */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-8" style={{
            background: `linear-gradient(180deg, ${fc}, ${fc}aa)`,
            borderBottom: `2px solid rgba(${a},0.3)`,
            clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',
          }}>
            <div className="absolute inset-x-2 top-2 bottom-2 border" style={{ borderColor: `rgba(${a},0.2)`, borderRadius: '1px' }} />
          </div>
        </div>
      )
  }
}

/* ─── Light Leak Effect ─── */
function LightLeak({ accentRgb, doorsOpened }: { accentRgb: string; doorsOpened: boolean }) {
  if (!doorsOpened) return null
  return (
    <div className="absolute inset-0 pointer-events-none z-[2] flex items-center justify-center">
      {/* Central vertical light beam */}
      <div className="door-light-leak" style={{
        width: '40px',
        height: '100%',
        background: `linear-gradient(90deg,
          transparent 0%,
          rgba(${accentRgb},0.02) 15%,
          rgba(${accentRgb},0.08) 30%,
          rgba(255,245,200,0.12) 45%,
          rgba(255,250,220,0.18) 50%,
          rgba(255,245,200,0.12) 55%,
          rgba(${accentRgb},0.08) 70%,
          rgba(${accentRgb},0.02) 85%,
          transparent 100%
        )`,
      }} />
      {/* Wide ambient glow */}
      <div className="absolute inset-0 door-light-leak" style={{
        background: `radial-gradient(ellipse at center, rgba(${accentRgb},0.06) 0%, rgba(${accentRgb},0.02) 30%, transparent 60%)`,
        animationDelay: '0.3s',
      }} />
      {/* Light rays */}
      <div className="absolute inset-0 overflow-hidden">
        {[-30, -15, 0, 15, 30].map((angle, i) => (
          <div key={i} className="absolute door-light-leak" style={{
            left: '50%',
            top: '30%',
            width: '2px',
            height: '60%',
            background: `linear-gradient(180deg, rgba(255,250,220,0.15), transparent)`,
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transformOrigin: 'top center',
            animationDelay: `${0.2 + i * 0.1}s`,
          }} />
        ))}
      </div>
    </div>
  )
}

/* ─── Door SVG Pattern Component ─── */
function DoorSvgPattern({ pattern, accent, accentRgb }: { pattern: string; accent: string; accentRgb: string }) {
  const color = accent
  const faintColor = `rgba(${accentRgb}, 0.12)`
  const midColor = `rgba(${accentRgb}, 0.2)`

  if (pattern === 'arch') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 200 400" fill="none" preserveAspectRatio="none">
        <path d="M100 40 Q160 40 160 120 L160 360 M100 40 Q40 40 40 120 L40 360" stroke={color} strokeWidth="0.5" fill="none" />
        <path d="M100 60 Q140 60 140 120 L140 340 M100 60 Q60 60 60 120 L60 340" stroke={color} strokeWidth="0.3" fill="none" opacity="0.5" />
        <circle cx="100" cy="80" r="20" stroke={color} strokeWidth="0.5" fill="none" opacity="0.3" />
      </svg>
    )
  }

  if (pattern === 'floral') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 200 400" fill="none" preserveAspectRatio="none">
        <circle cx="100" cy="100" r="30" stroke={color} strokeWidth="0.5" fill="none" />
        <circle cx="100" cy="100" r="15" stroke={color} strokeWidth="0.3" fill={faintColor} />
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse key={angle} cx="100" cy="60" rx="8" ry="20" stroke={color} strokeWidth="0.4" fill="none" transform={`rotate(${angle} 100 100)`} />
        ))}
        <circle cx="100" cy="300" r="25" stroke={color} strokeWidth="0.5" fill="none" />
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={angle} cx="100" cy="270" rx="6" ry="16" stroke={color} strokeWidth="0.3" fill="none" transform={`rotate(${angle} 100 300)`} />
        ))}
      </svg>
    )
  }

  if (pattern === 'mandala') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 200 400" fill="none" preserveAspectRatio="none">
        {[20, 40, 60].map((r) => (
          <circle key={r} cx="100" cy="150" r={r} stroke={color} strokeWidth="0.4" fill="none" />
        ))}
        {[0, 30, 60, 90, 120, 150].map((angle) => (
          <line key={angle} x1="100" y1="150" x2={100 + 60 * Math.cos((angle * Math.PI) / 180)} y2={150 + 60 * Math.sin((angle * Math.PI) / 180)} stroke={color} strokeWidth="0.3" />
        ))}
        {[20, 40, 60].map((r) => (
          <circle key={`b${r}`} cx="100" cy="280" r={r} stroke={color} strokeWidth="0.4" fill="none" />
        ))}
      </svg>
    )
  }

  if (pattern === 'paisley') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 200 400" fill="none" preserveAspectRatio="none">
        <path d="M80 80 Q60 140 80 200 Q100 260 80 320" stroke={color} strokeWidth="0.5" fill="none" />
        <path d="M120 80 Q140 140 120 200 Q100 260 120 320" stroke={color} strokeWidth="0.5" fill="none" />
        <circle cx="80" cy="80" r="15" stroke={color} strokeWidth="0.4" fill={faintColor} />
        <circle cx="120" cy="80" r="15" stroke={color} strokeWidth="0.4" fill={faintColor} />
      </svg>
    )
  }

  if (pattern === 'minimal') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-15" viewBox="0 0 200 400" fill="none" preserveAspectRatio="none">
        <line x1="60" y1="80" x2="140" y2="80" stroke={color} strokeWidth="0.5" />
        <line x1="60" y1="320" x2="140" y2="320" stroke={color} strokeWidth="0.5" />
        <rect x="80" y="160" width="40" height="80" rx="2" stroke={color} strokeWidth="0.4" fill="none" />
      </svg>
    )
  }

  if (pattern === 'diamond') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 200 400" fill="none" preserveAspectRatio="none">
        <rect x="70" y="100" width="60" height="60" transform="rotate(45 100 130)" stroke={color} strokeWidth="0.5" fill="none" />
        <rect x="80" y="230" width="40" height="40" transform="rotate(45 100 250)" stroke={color} strokeWidth="0.4" fill={faintColor} />
        <line x1="100" y1="70" x2="100" y2="330" stroke={color} strokeWidth="0.2" opacity="0.5" />
      </svg>
    )
  }

  if (pattern === 'star') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 200 400" fill="none" preserveAspectRatio="none">
        <polygon points="100,70 115,120 170,120 125,150 140,200 100,170 60,200 75,150 30,120 85,120" stroke={color} strokeWidth="0.5" fill="none" />
        <polygon points="100,230 112,265 150,265 120,285 132,320 100,298 68,320 80,285 50,265 88,265" stroke={color} strokeWidth="0.4" fill={faintColor} />
      </svg>
    )
  }

  if (pattern === 'dome') {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 200 400" fill="none" preserveAspectRatio="none">
        <path d="M40 200 Q100 60 160 200" stroke={color} strokeWidth="0.6" fill="none" />
        <path d="M50 200 Q100 80 150 200" stroke={color} strokeWidth="0.3" fill={faintColor} />
        <line x1="100" y1="60" x2="100" y2="30" stroke={color} strokeWidth="0.5" />
        <circle cx="100" cy="25" r="5" stroke={color} strokeWidth="0.5" fill={midColor} />
      </svg>
    )
  }

  // Default: geometric/lantern
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 200 400" fill="none" preserveAspectRatio="none">
      <polygon points="100,80 130,120 130,180 100,200 70,180 70,120" stroke={color} strokeWidth="0.5" fill="none" />
      <polygon points="100,220 120,250 120,300 100,320 80,300 80,250" stroke={color} strokeWidth="0.4" fill={faintColor} />
    </svg>
  )
}

export function getMapEmbedQuery(googleMapsUrl?: string, address?: string, fallback?: string): string {
  if (!googleMapsUrl) {
    return address || fallback || 'Pakistan';
  }

  try {
    // 1. Check for coordinates in URL path: e.g. /@31.5204,74.3587,17z
    const coordMatch = googleMapsUrl.match(/@(-?[0-9\.]+),(-?[0-9\.]+)/);
    if (coordMatch) {
      return `${coordMatch[1]},${coordMatch[2]}`;
    }

    // 2. Check for standard query parameters (q or query)
    const urlObj = new URL(googleMapsUrl);
    const qParam = urlObj.searchParams.get('q') || urlObj.searchParams.get('query');
    if (qParam) {
      return qParam;
    }

    // 3. Check for place name in path: e.g. /place/Grand+Palace/
    const placeMatch = googleMapsUrl.match(/\/place\/([^/]+)/);
    if (placeMatch) {
      return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    }
  } catch (e) {
    // Fail-safe: if URL parser fails, fallback to regex or address
  }

  // Fallback to text address
  return address || fallback || 'Pakistan';
}

/* ─── Door Overlay Component ─── */
function DoorOverlay({ theme, doorsOpened, onOpen }: { theme: TemplateTheme; doorsOpened: boolean; onOpen: () => void }) {
  const ds = theme.doorStyle
  const a = theme.accentRgb

  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Pre-generate star positions deterministically
  const stars = [
    { left: 8, top: 12, size: 1.5, opacity: 0.6, delay: 0 },
    { left: 22, top: 8, size: 1, opacity: 0.4, delay: 0.3 },
    { left: 35, top: 18, size: 2, opacity: 0.5, delay: 0.8 },
    { left: 72, top: 6, size: 1.5, opacity: 0.55, delay: 0.2 },
    { left: 85, top: 15, size: 1, opacity: 0.45, delay: 0.6 },
    { left: 92, top: 9, size: 2, opacity: 0.4, delay: 1.1 },
    { left: 12, top: 85, size: 1.5, opacity: 0.35, delay: 0.7 },
    { left: 88, top: 82, size: 1, opacity: 0.4, delay: 0.4 },
    { left: 48, top: 4, size: 1.2, opacity: 0.5, delay: 0.9 },
    { left: 60, top: 88, size: 1.8, opacity: 0.3, delay: 1.4 },
    { left: 25, top: 90, size: 1.2, opacity: 0.35, delay: 0.5 },
    { left: 75, top: 92, size: 1, opacity: 0.3, delay: 1.0 },
  ]

  // Canvas particle simulation (ambient floating stars & opening explosion)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      color: string
      alpha: number
      decay: number
      gravity: number
      spin: number
      spinSpeed: number
    }

    let particles: Particle[] = []

    // Ambient floating dust particles
    const createAmbientParticle = () => {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.5,
        radius: Math.random() * 1.5 + 0.5,
        color: `rgba(${a}, ${Math.random() * 0.4 + 0.2})`,
        alpha: Math.random() * 0.6 + 0.2,
        decay: 0.001 + Math.random() * 0.002,
        gravity: 0,
        spin: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.02,
      }
    }

    // Populate ambient particles
    for (let i = 0; i < 25; i++) {
      particles.push(createAmbientParticle())
    }

    let burstTriggered = false

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // Maintain ambient particle count
      if (particles.filter(p => p.gravity === 0).length < 25 && Math.random() < 0.1) {
        particles.push(createAmbientParticle())
      }

      // Trigger gold dust explosion when doors part
      if (doorsOpened && !burstTriggered) {
        burstTriggered = true
        const centerX = width / 2
        const centerY = height / 2
        for (let i = 0; i < 60; i++) {
          const angle = Math.random() * Math.PI * 2
          const speed = Math.random() * 6 + 2
          particles.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1, // upward bias
            radius: Math.random() * 3 + 1,
            color: Math.random() > 0.35 ? 'rgba(212, 168, 83, 1)' : 'rgba(255, 244, 208, 1)',
            alpha: 1,
            decay: 0.015 + Math.random() * 0.02,
            gravity: 0.08, // drop down
            spin: Math.random() * Math.PI * 2,
            spinSpeed: (Math.random() - 0.5) * 0.1,
          })
        }
      }

      // Render loop
      particles = particles.filter(p => {
        p.x += p.vx
        p.y += p.vy
        p.vy += p.gravity
        p.alpha -= p.decay
        p.spin += p.spinSpeed

        if (p.alpha <= 0) return false

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.spin)
        ctx.globalAlpha = p.alpha

        ctx.fillStyle = p.color
        ctx.beginPath()
        if (p.gravity > 0) {
          // Sparkle four-point star shape for burst particles
          ctx.moveTo(0, -p.radius * 2)
          ctx.lineTo(p.radius * 0.5, -p.radius * 0.5)
          ctx.lineTo(p.radius * 2, 0)
          ctx.lineTo(p.radius * 0.5, p.radius * 0.5)
          ctx.lineTo(0, p.radius * 2)
          ctx.lineTo(-p.radius * 0.5, p.radius * 0.5)
          ctx.lineTo(-p.radius * 2, 0)
          ctx.lineTo(-p.radius * 0.5, -p.radius * 0.5)
        } else {
          // Soft ambient circular drift
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2)
        }
        ctx.closePath()
        ctx.fill()
        ctx.restore()

        return true
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [doorsOpened, a])

  const getAnimClasses = () => {
    if (!doorsOpened) return { left: '', right: '' }
    switch (ds.type) {
      case 'curtains':
        return { left: 'curtain-open-left', right: 'curtain-open-right' }
      case 'petals':
      case 'lotus':
        return { left: 'petal-open-left', right: 'petal-open-right' }
      case 'split-screen':
      case 'geometric':
        return { left: 'split-open-left', right: 'split-open-right' }
      case 'archway':
        return { left: 'arch-open-left', right: 'arch-open-right' }
      case 'scroll':
        return { left: 'scroll-unfurl-left', right: 'scroll-unfurl-right' }
      case 'dome':
        return { left: 'dome-lift-up', right: 'dome-lift-up' }
      case 'lantern':
        return { left: 'lantern-open-left', right: 'lantern-open-right' }
      case 'classic-doors':
      default:
        return { left: 'door-open-left', right: 'door-open-right' }
    }
  }
  const anim = getAnimClasses()

  const getIdleClass = () => {
    switch (ds.type) {
      case 'curtains':
        return 'curtain-drape-idle'
      case 'petals':
      case 'lotus':
        return 'petal-sway-idle'
      case 'scroll':
        return 'scroll-shimmer-idle'
      case 'split-screen':
      case 'geometric':
        return 'split-shimmer-idle'
      case 'dome':
        return 'dome-float-idle'
      case 'lantern':
        return 'lantern-glow-idle'
      case 'archway':
        return 'arch-breathe-idle'
      case 'classic-doors':
      default:
        return 'door-breathe-idle'
    }
  }
  const idleClass = getIdleClass()

  // Get panel gradient based on material
  const getPanelGradient = (isLeft: boolean): string => {
    if (ds.doorMaterial === 'glass') {
      return isLeft
        ? `linear-gradient(90deg, rgba(${theme.accentRgb}, 0.12) 0%, rgba(${theme.accentRgb}, 0.03) 100%)`
        : `linear-gradient(270deg, rgba(${theme.accentRgb}, 0.12) 0%, rgba(${theme.accentRgb}, 0.03) 100%)`
    }
    if (ds.doorMaterial === 'stone') {
      return `linear-gradient(180deg, ${theme.bgDoor} 0%, ${theme.bgSecondary} 60%, ${theme.bgDoor} 100%)`
    }
    return isLeft ? theme.bgDoorGradient : theme.bgDoorGradient.replace('135deg', '225deg')
  }

  // Edge color for 3D door thickness
  const edgeColor = ds.doorMaterial === 'stone' ? theme.bgSecondary : theme.accentDark
  const edgeWidth = 18

  // Render 3D edge face (door thickness)
  const renderEdgeFace = (side: 'left' | 'right') => {
    if (!['classic-doors', 'archway', 'dome'].includes(ds.type)) return null

    const edgeStyle: React.CSSProperties = side === 'left'
      ? {
          position: 'absolute',
          top: 0,
          right: `-${edgeWidth}px`,
          width: `${edgeWidth}px`,
          height: '100%',
          background: `linear-gradient(90deg, ${edgeColor}, ${theme.bgDoor}aa)`,
          transform: 'rotateY(90deg)',
          transformOrigin: 'left center',
          boxShadow: `3px 0 8px rgba(0,0,0,0.4), inset 0 0 3px rgba(0,0,0,0.15)`,
          borderLeft: `1px solid ${theme.getOpacityStyle('border', 0.15)}`,
          borderRight: `1px solid rgba(0,0,0,0.2)`,
        }
      : {
          position: 'absolute',
          top: 0,
          left: `-${edgeWidth}px`,
          width: `${edgeWidth}px`,
          height: '100%',
          background: `linear-gradient(270deg, ${edgeColor}, ${theme.bgDoor}aa)`,
          transform: 'rotateY(-90deg)',
          transformOrigin: 'right center',
          boxShadow: `-3px 0 8px rgba(0,0,0,0.4), inset 0 0 3px rgba(0,0,0,0.15)`,
          borderRight: `1px solid ${theme.getOpacityStyle('border', 0.15)}`,
          borderLeft: `1px solid rgba(0,0,0,0.2)`,
        }
    return (
      <div style={edgeStyle}>
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 12px, ${theme.getOpacityStyle('text', 0.08)} 12px, ${theme.getOpacityStyle('text', 0.08)} 13px)`,
        }} />
        <div className="absolute inset-0" style={{
          background: `linear-gradient(${side === 'left' ? '270deg' : '90deg'}, ${theme.getOpacityStyle('text', 0.12)}, transparent 60%)`,
        }} />
      </div>
    )
  }

  const renderDoorTypeOverlays = (side: 'left' | 'right') => {
    if (ds.type === 'curtains') {
      return (
        <div className="absolute inset-0 pointer-events-none shadow-inner" style={{ zIndex: 3 }}>
          {/* Real curtain fabric pleats/folds */}
          <div 
            className="absolute inset-0 opacity-45" 
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, 
                rgba(0,0,0,0.35) 0px, 
                rgba(0,0,0,0.15) 15px, 
                transparent 35px, 
                rgba(255,255,255,0.06) 55px, 
                transparent 75px, 
                rgba(0,0,0,0.15) 95px, 
                rgba(0,0,0,0.35) 110px
              )`,
              backgroundSize: '120px 100%',
            }} 
          />
          <div className="absolute top-0 left-0 w-full h-3.5 bg-gradient-to-b from-gold via-gold-light to-amber-700/80 border-b border-gold/40" />
          <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-gold via-gold-light to-amber-700/80 border-t border-gold/40" style={{
            backgroundImage: `repeating-linear-gradient(90deg, ${theme.accent} 0px, ${theme.accent} 3px, transparent 3px, transparent 6px)`
          }} />
          <div className="absolute inset-0" style={{
            background: `linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.35) 100%)`
          }} />
        </div>
      )
    }
    if (ds.type === 'scroll') {
      return (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 4 }}>
          {/* Roller tube representing wood bar */}
          <div 
            className={`absolute top-0 w-6 h-full bg-gradient-to-r from-amber-950 via-amber-700 to-amber-950 border-amber-950 shadow-md ${
              doorsOpened 
                ? (side === 'left' ? 'scroll-roll-left-cylinder' : 'scroll-roll-right-cylinder') 
                : ''
            }`}
            style={{
              left: side === 'left' ? 'auto' : '-12px',
              right: side === 'left' ? '-12px' : 'auto',
              boxShadow: side === 'left' ? '-3px 0 8px rgba(0,0,0,0.5)' : '3px 0 8px rgba(0,0,0,0.5)'
            }}
          >
             {/* Gold Caps for Cylinders */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3.5 rounded-sm bg-gradient-to-r from-gold-light via-gold to-amber-700 border border-gold/40" />
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-3.5 rounded-sm bg-gradient-to-r from-gold-light via-gold to-amber-700 border border-gold/40" />
          </div>
          <div className="absolute top-0 bottom-0 w-0.5 bg-gold/40" style={{
            left: side === 'left' ? 'auto' : '15px',
            right: side === 'left' ? '15px' : 'auto',
          }} />
        </div>
      )
    }
    if (ds.type === 'petals' || ds.type === 'lotus') {
      return (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
          <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path 
              d={side === 'left' 
                ? "M0,10 C40,20 60,45 100,50 M0,50 C40,48 70,68 100,90 M0,90 C30,80 50,95 100,100" 
                : "M100,10 C60,20 40,45 0,50 M100,50 C60,48 30,68 0,90 M100,90 C70,80 50,95 0,100"} 
              stroke={theme.accent} 
              strokeWidth="0.5" 
              fill="none" 
            />
            <path 
              d={side === 'left' 
                ? "M0,30 Q50,40 100,35 M0,70 Q50,60 100,75" 
                : "M100,30 Q50,40 0,35 M100,70 Q50,60 0,75"} 
              stroke={theme.getOpacityStyle('text', 0.4)} 
              strokeWidth="0.3" 
              fill="none" 
            />
          </svg>
          <div className="absolute w-24 h-24 rounded-full bg-pink-500/5 blur-xl top-1/2 -translate-y-1/2" style={{
            left: side === 'left' ? 'auto' : '-48px',
            right: side === 'right' ? 'auto' : '-48px',
          }} />
        </div>
      )
    }
    if (ds.type === 'archway') {
      return (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
          <svg className="absolute top-0 left-0 w-full h-full opacity-60" viewBox="0 0 100 200" preserveAspectRatio="none">
            {/* Main elegant arch outline */}
            <path 
              d={side === 'left' 
                ? "M 7.5 70 L 7.5 45 Q 7.5 38 12 35 Q 15 28 25 25 Q 32 19 45 17 Q 55 13 70 11 Q 82 8 100 7" 
                : "M 92.5 70 L 92.5 45 Q 92.5 38 88 35 Q 85 28 75 25 Q 68 19 55 17 Q 45 13 30 11 Q 18 8 0 7"} 
              fill="none" 
              stroke={theme.accent} 
              strokeWidth="1.2" 
              filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.5))"
            />
            {/* Parallel inner detail line */}
            <path 
              d={side === 'left' 
                ? "M 11.5 70 L 11.5 45 Q 11.5 39 16 38 Q 19 31.5 28.5 29 Q 35 23 48 21 Q 57.5 17 72 15 Q 83.5 12 100 11" 
                : "M 88.5 70 L 88.5 45 Q 88.5 39 84 38 Q 81 31.5 71.5 29 Q 65 23 52 21 Q 42.5 17 28 15 Q 16.5 12 0 11"} 
              fill="none" 
              stroke={theme.getOpacityStyle('text', 0.45)} 
              strokeWidth="0.6" 
            />
          </svg>
        </div>
      )
    }
    if (ds.type === 'lantern') {
      return (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
          <div className="absolute inset-3 border border-gold/30 rounded-sm">
            <div className="absolute inset-1 border border-gold/15" />
          </div>
          <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="0" y1="0" x2="100" y2="100" stroke={theme.accent} strokeWidth="0.4" />
            <line x1="0" y1="100" x2="100" y2="0" stroke={theme.accent} strokeWidth="0.4" />
            <line x1="50" y1="0" x2="50" y2="100" stroke={theme.accent} strokeWidth="0.5" />
            <line x1="0" y1="50" x2="100" y2="50" stroke={theme.accent} strokeWidth="0.5" />
          </svg>
        </div>
      )
    }
    if (ds.type === 'dome') {
      return (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
          <svg className="absolute top-0 left-0 w-full h-full opacity-40" viewBox="0 0 100 200" preserveAspectRatio="none">
            <path 
              d={side === 'left' 
                ? "M 0 0 L 100 0 L 100 30 Q 95 38 85 45 Q 65 52 50 65 L 50 200 L 0 200 Z" 
                : "M 100 0 L 0 0 L 0 30 Q 5 38 15 45 Q 35 52 50 65 L 50 200 L 100 200 Z"} 
              fill="none" 
              stroke={theme.accent} 
              strokeWidth="0.8" 
            />
          </svg>
        </div>
      )
    }
    return null
  }

  // Render splitting wax seal half
  const renderWaxSealHalf = (side: 'left' | 'right') => {
    const sealColor = theme.id === 'emerald-noir' || theme.id === 'mughal-emerald'
      ? '#09251c'
      : theme.id === 'crimson-royale' || theme.id === 'royal-elegance'
      ? '#420d14'
      : theme.id === 'rose-gold-blush' || theme.id === 'rose-gold-blush-royal'
      ? '#5c222e'
      : theme.id === 'majestic-love'
      ? '#3b250d'
      : '#1e1a14'

    const sealHighlight = theme.id === 'emerald-noir' || theme.id === 'mughal-emerald'
      ? '#184b3b'
      : theme.id === 'crimson-royale' || theme.id === 'royal-elegance'
      ? '#7c1c27'
      : theme.id === 'rose-gold-blush' || theme.id === 'rose-gold-blush-royal'
      ? '#993f51'
      : theme.id === 'majestic-love'
      ? '#6b4822'
      : '#483f36'

    const accent = theme.accent

    return (
      <div 
        className={`absolute top-1/2 -translate-y-1/2 w-14 h-28 md:w-18 md:h-36 overflow-hidden pointer-events-none z-30 transition-transform duration-300 ${
          side === 'left' ? 'right-0 origin-right' : 'left-0 origin-left'
        }`}
        style={{
          transform: isPressed ? 'translateY(-50%) scale(0.95)' : isHovered ? 'translateY(-50%) scale(1.08)' : 'translateY(-50%) scale(1)',
        }}
      >
        {/* Full wax seal container shifted so only one half is visible */}
        <div 
          className={`absolute top-0 w-28 h-28 md:w-36 md:h-36 ${
            side === 'left' ? 'left-0' : 'left-[-3.5rem] md:left-[-4.5rem]'
          }`}
        >
          {/* Outer irregular melted wax overflow */}
          <div 
            className="absolute inset-0 shadow-2xl transition-all duration-300"
            style={{
              borderRadius: '48% 52% 51% 49% / 51% 48% 52% 49%',
              background: `radial-gradient(circle at 35% 35%, ${sealHighlight}, ${sealColor})`,
              boxShadow: '0 10px 30px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.18), inset 0 -3px 8px rgba(0,0,0,0.45)',
              border: `1px solid ${theme.getOpacityStyle('border', 0.12)}`
            }}
          />
          {/* Inner wax stamp stamp-recess */}
          <div 
            className="absolute inset-2.5"
            style={{
              borderRadius: '50% 50% 48% 52% / 48% 52% 50% 50%',
              background: `radial-gradient(circle at 40% 30%, ${sealHighlight}, ${sealColor})`,
              boxShadow: 'inset 2px 3px 6px rgba(0,0,0,0.45), inset -2px -2px 4px rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.2)',
              border: `0.5px solid ${theme.getOpacityStyle('border', 0.08)}`
            }}
          />
          {/* Gold monogram circle border inside seal */}
          <div 
            className="absolute inset-5 opacity-30 border border-dashed"
            style={{ 
              borderColor: accent,
              borderRadius: '50% 48% 51% 49% / 51% 49% 50% 50%',
            }} 
          />
          {/* Embossed symbol / letter in the center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span 
              className={`text-3xl md:text-4xl font-semibold select-none filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.55)] ${theme.fontDisplay}`} 
              style={{ 
                color: accent,
              }}
            >
              {ds.centerIcon || '❦'}
            </span>
            <span 
              className={`text-[7px] md:text-[9px] tracking-[0.25em] uppercase mt-0.5 select-none opacity-70 ${theme.fontDisplay}`} 
              style={{ 
                color: accent,
                textShadow: '0 1px 2px rgba(0,0,0,0.4)'
              }}
            >
              open
            </span>
          </div>
          {/* Melty wax outer ripple shadow ring - only render on the left side to prevent double animation */}
          {side === 'left' && (
            <div 
              className="absolute inset-[-6px] border animate-ping opacity-15" 
              style={{ 
                borderColor: theme.accent, 
                borderRadius: '50%' 
              }} 
            />
          )}
        </div>
      </div>
    )
  }

  const shouldRenderHingesAndHandle = ['classic-doors', 'archway', 'dome'].includes(ds.type);

  return (
    <>
      {/* ─── ENHANCED CINEMATIC BACKGROUND ─── */}
      <div className="absolute inset-0" style={{ backgroundColor: theme.bgSecondary }}>
        {/* Deep radial sky glow */}
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse at 50% 40%, rgba(${a},0.18) 0%, rgba(${a},0.06) 30%, transparent 65%)`
        }} />
        {/* Starfield */}
        {stars.map((star, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, star.opacity, star.opacity * 0.6, star.opacity], scale: 1 }}
            transition={{ delay: star.delay, duration: 1.5, repeat: Infinity, repeatType: 'reverse', repeatDelay: 2 + star.delay }}
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: theme.accent,
              boxShadow: `0 0 ${star.size * 3}px ${theme.accent}`,
            }}
          />
        ))}
        {/* Crescent moon & star motif in top-right */}
        <svg className="absolute top-6 right-8 opacity-20" width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M32 8 Q22 14 22 24 Q22 34 32 40 Q18 40 12 30 Q6 20 12 12 Q18 4 32 8Z" stroke={theme.accent} strokeWidth="1" fill="none" />
          <polygon points="38,8 40,14 46,14 41,18 43,24 38,20 33,24 35,18 30,14 36,14" stroke={theme.accent} strokeWidth="0.5" fill="none" opacity="0.8" />
        </svg>

        {/* Door glow animation background */}
        {!doorsOpened && (
          <div className="absolute inset-0 animate-door-glow">
            <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, rgba(${a},0.12) 0%, rgba(${a},0.04) 40%, transparent 70%)` }} />
          </div>
        )}
        {doorsOpened && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }} className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, rgba(${a},0.22) 0%, rgba(${a},0.08) 40%, transparent 70%)` }} />
        )}
      </div>

      {/* Light leak effect - between doors */}
      <LightLeak accentRgb={theme.accentRgb} doorsOpened={doorsOpened} />

      {/* Door Frame - visible behind the doors */}
      <div className={doorsOpened ? 'door-frame-shadow' : ''} style={doorsOpened ? { transition: 'opacity 2s ease-out' } : {}}>
        <DoorFrame theme={theme} />
      </div>

      {/* Left Panel */}
      <div
        className={`absolute top-0 left-0 w-1/2 h-full ${anim.left} ${!doorsOpened ? idleClass : ''}`}
        style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        {/* Front face of door */}
        <div className="relative w-full h-full border-r overflow-hidden"
          style={{
            background: getPanelGradient(true),
            borderColor: theme.borderSubtle,
            backfaceVisibility: 'hidden',
          }}
        >
          <DoorSurface theme={theme} side="left" />
          {renderDoorTypeOverlays('left')}
          <div className="absolute inset-0 door-shimmer" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to right, transparent, ${theme.getOpacityStyle('text', 0.05)})` }} />
          {/* Vignette shadow overlay - fades out as door opens */}
          <div 
            className="absolute inset-0 transition-opacity duration-[3200ms] pointer-events-none z-10"
            style={{
              background: `linear-gradient(to left, rgba(0,0,0,0.55), transparent)`,
              opacity: doorsOpened ? 0 : 0.85,
            }}
          />
          {/* Panel layout */}
          <DoorPanelLayout theme={theme} side="left" />
          <DoorPanelContent theme={theme} text={ds.leftText} textLang={ds.leftTextLang} />
          {shouldRenderHingesAndHandle && <DoorHandle theme={theme} side="left" />}
          {/* Center seam vertical golden divider */}
          <div className="absolute right-0 top-0 bottom-0 w-[3px] z-20" style={{
            background: `linear-gradient(to bottom, ${theme.getOpacityStyle('text', 0.1)}, ${theme.getOpacityStyle('text', 0.6)}, ${theme.getOpacityStyle('text', 0.1)})`
          }} />
          {/* Hinges on hinge side (left) */}
          {shouldRenderHingesAndHandle && <DoorHinges side="left" accent={theme.accent} accentRgb={theme.accentRgb} />}
          {/* Left half of breaking wax seal */}
          {renderWaxSealHalf('left')}
        </div>
        {/* 3D Edge face (door thickness) */}
        {renderEdgeFace('left')}
      </div>

      {/* Right Panel */}
      <div
        className={`absolute top-0 right-0 w-1/2 h-full ${anim.right} ${!doorsOpened ? idleClass : ''}`}
        style={{ transformOrigin: 'right center', transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        {/* Front face of door */}
        <div className="relative w-full h-full border-l overflow-hidden"
          style={{
            background: getPanelGradient(false),
            borderColor: theme.borderSubtle,
            backfaceVisibility: 'hidden',
          }}
        >
          <DoorSurface theme={theme} side="right" />
          {renderDoorTypeOverlays('right')}
          <div className="absolute inset-0 door-shimmer" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to left, transparent, ${theme.getOpacityStyle('text', 0.05)})` }} />
          {/* Vignette shadow overlay - fades out as door opens */}
          <div 
            className="absolute inset-0 transition-opacity duration-[3200ms] pointer-events-none z-10"
            style={{
              background: `linear-gradient(to right, rgba(0,0,0,0.55), transparent)`,
              opacity: doorsOpened ? 0 : 0.85,
            }}
          />
          {/* Panel layout */}
          <DoorPanelLayout theme={theme} side="right" />
          <DoorPanelContent theme={theme} text={ds.rightText} textLang={ds.rightTextLang} />
          {shouldRenderHingesAndHandle && <DoorHandle theme={theme} side="right" />}
          {/* Center seam vertical golden divider */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] z-20" style={{
            background: `linear-gradient(to bottom, ${theme.getOpacityStyle('text', 0.1)}, ${theme.getOpacityStyle('text', 0.6)}, ${theme.getOpacityStyle('text', 0.1)})`
          }} />
          {/* Hinges on hinge side (right) */}
          {shouldRenderHingesAndHandle && <DoorHinges side="right" accent={theme.accent} accentRgb={theme.accentRgb} />}
          {/* Right half of breaking wax seal */}
          {renderWaxSealHalf('right')}
        </div>
        {/* 3D Edge face (door thickness) */}
        {renderEdgeFace('right')}
      </div>

      {/* Center tap-to-open button (invisible click target) */}
      {!doorsOpened && (
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
          <button
            onClick={onOpen}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
              setIsHovered(false)
              setIsPressed(false)
            }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => {
              setIsPressed(false)
              setIsHovered(false)
            }}
            className="w-28 h-28 md:w-36 md:h-36 cursor-pointer rounded-full focus:outline-none select-none pointer-events-auto bg-transparent border-none"
            aria-label="Open invitation"
          />
        </div>
      )}

      {/* Particle Canvas Emitter */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-50" />
    </>
  )
}

/* ─── Main Invitation Viewer ─── */
export default function InvitationViewer({ templateId, flowData }: InvitationViewerProps) {
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
        fetch(`/api/invitations/${flowData.invitationId}/view`, { method: 'POST' }).catch(() => {});
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [flowData?.invitationId, isDemo]);

  const dressCodeWomen = flowData?.dressCodeWomen?.trim() || (isDemo ? "Yellow / Green traditional" : "")
  const dressCodeMen = flowData?.dressCodeMen?.trim() || (isDemo ? "Gold / Maroon formal" : "")
  const accommodation = flowData?.accommodation?.trim() || (isDemo ? "Rooms blocked at Leela Palace & Pearl Continental. Mention 'Ahmed & Fatima' for discounts." : "")
  const transportation = flowData?.transportation?.trim() || (isDemo ? "Shuttle service will run from Pearl Continental to the venue every 30 minutes starting at 6:30 PM." : "")
  const gifts = flowData?.gifts?.trim() || (isDemo ? "Your prayers are our greatest gift. For Shagun, you may transfer to Meezan Bank, Title: Ahmed Khan, Account Number: 028102384, IBAN: PK45MEZN00028102384, Raast ID: 03001234567, EasyPaisa: 03123456789" : "")

  const dynamicEvents = useMemo(() => {
    if (flowData?.events && flowData.events.some(e => e.date || e.time)) {
      return flowData.events.filter(e => e.name).map(e => ({
        name: e.name,
        time: e.time || 'TBD',
        date: e.date || 'TBD',
        description: e.venue ? `At ${e.venue}` : `Join us for the ${e.name} celebration.`,
      }))
    }
    // Default demo events
    return [
      { name: 'Mehndi', time: '6:00 PM', date: 'March 14, 2027', description: 'A night of colors, henna, and celebration with traditional music and dance.' },
      { name: 'Baraat', time: '7:00 PM', date: 'March 15, 2027', description: 'The grand wedding procession — dhol beats, dancing, and joyful arrival.' },
      { name: 'Nikkah', time: '7:30 PM', date: 'March 15, 2027', description: 'The sacred Islamic marriage ceremony — the signing of the Nikkah Nama.' },
      { name: 'Walima', time: '8:00 PM', date: 'March 16, 2027', description: 'The wedding reception hosted by the groom — feast, blessings, and joy.' },
    ]
  }, [flowData?.events])

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
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const guestParam = params.get('guest')
      if (guestParam) {
        // e.g. "ahmed-family" -> "Ahmed Family"
        const formatted = guestParam.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        setGuestNameFromUrl(formatted)
        if (!rsvpName) setRsvpName(formatted)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
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

    const musicTrack = flowData?.backgroundMusic
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
  }, [flowData?.backgroundMusic])

  // Play/pause control
  useEffect(() => {
    if (!audioRef.current) return

    if (doorsOpened && musicPlaying) {
      audioRef.current.play().catch(err => {
        console.warn('Audio play failed (waiting for user interaction):', err)
        setMusicPlaying(false)
      })
    } else {
      audioRef.current.pause()
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

  const handleDoorOpen = useCallback(() => {
    if (doorsOpened) return
    setDoorsOpened(true)
    
    // Delay fireworks until the doors are almost open (1.5s delay)
    // This frees up main thread/GPU cycles for the door swing animation.
    setTimeout(() => {
      setShowFireworks(true)
    }, 1500)
    setTimeout(() => setShowFireworks(false), 6500)

    if (theme.id.includes('royal')) {
      setShowGoldDust(true)
      setTimeout(() => setShowGoldDust(false), 4500)
    }
    if (flowData?.backgroundMusic && flowData.backgroundMusic !== 'no-music') {
      setMusicPlaying(true)
    }
    setTimeout(() => setDoorOverlayVisible(false), 2800)
    setTimeout(() => setHeroVisible(true), 2400)
  }, [doorsOpened, theme.id, flowData?.backgroundMusic])

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
      if (venueName) dynamicTexts.venueName = venueName
      if (venueAddress) dynamicTexts.venueAddress = venueAddress
      if (welcomeMsg) dynamicTexts.welcomeMsg = welcomeMsg
      if (dressCodeWomen) dynamicTexts.dressCodeWomen = dressCodeWomen
      if (dressCodeMen) dynamicTexts.dressCodeMen = dressCodeMen
      if (transportation) dynamicTexts.transportation = transportation
      if (accommodation) dynamicTexts.accommodation = accommodation
      if (gifts) dynamicTexts.gifts = gifts

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
  }, [language, partner1, partner2, venueName, venueAddress, welcomeMsg, dressCodeWomen, dressCodeMen, transportation, accommodation, gifts, events, translations])

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
    <div className="relative min-h-screen overflow-x-hidden" dir={language === 'ur' ? 'rtl' : 'ltr'} style={{ backgroundColor: theme.bgPrimary, color: theme.textPrimary }}>
      <BackgroundParticles accentColor={theme.accent} />

      {/* ═══ Door Opening Overlay ═══ */}
      <AnimatePresence>
        {doorOverlayVisible && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="fixed inset-0 z-50"
            style={{ perspective: ['classic-doors', 'archway', 'lantern'].includes(theme.doorStyle.type) ? '1200px' : undefined }}
          >
            <DoorOverlay theme={theme} doorsOpened={doorsOpened} onOpen={handleDoorOpen} />
          </motion.div>
        )}
      </AnimatePresence>

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
        <motion.div
          initial={{ borderColor: 'transparent' }}
          animate={doorsOpened ? { borderColor: getOpacityStyle('border', 0.15) } : { borderColor: 'transparent' }}
          transition={{ delay: 2.2, duration: 1.0 }}
          className="relative flex flex-col items-center justify-center py-10 px-6 overflow-hidden border-b"
        >
          {/* Ambient background glow */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={doorsOpened ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 2.2, duration: 1.0 }}
            className="absolute inset-0 pointer-events-none" 
            style={{
              background: `radial-gradient(ellipse at 50% 50%, ${getOpacityStyle('bg', 0.07)} 0%, transparent 70%)`
            }} 
          />
          {/* Top ornamental line */}
          <motion.div
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
          </motion.div>

          {/* Calligraphy & Translation Wrapper */}
          <motion.div
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
          </motion.div>

          {/* Bottom ornamental line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={doorsOpened ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 2.2, duration: 1.0 }}
            className="flex items-center gap-4 w-full max-w-sm mt-5"
          >
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${getOpacityStyle('text', 0.5)})` }} />
            <div className="w-2 h-2 rotate-45" style={{ border: `1px solid ${getOpacityStyle('border', 0.6)}` }} />
            <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${getOpacityStyle('text', 0.5)})` }} />
          </motion.div>
        </motion.div>
      )}

      {/* ═══ Main Content ═══ */}
      <motion.div
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
            <GoldDivider themeId={theme.id} accentColor={theme.accent} />
          </div>

          <div className="relative z-10 max-w-lg text-center">
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={`${theme.fontCalligraphy} text-sm sm:text-base tracking-[0.4em] uppercase mb-8`}
              style={{ color: theme.textSecondary }}
            >
              {t('gettingMarried', "We're getting married")}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`${theme.fontDisplay} text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-[0.08em] mb-2`}
              style={{ color: theme.textPrimary }}
            >
              {translatedPartner1}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex items-center justify-center gap-6 my-5"
            >
              <div className="w-20 h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.accentDark})` }} />
              <div className="w-3 h-3 rotate-45 border" style={{ borderColor: theme.accentDark }} />
              <div className="w-20 h-px" style={{ background: `linear-gradient(270deg, transparent, ${theme.accentDark})` }} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
              className={`${theme.fontDisplay} text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-[0.08em] mb-8`}
              style={{ color: theme.textPrimary }}
            >
              {translatedPartner2}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="w-8 h-px" style={{ background: theme.textMuted }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accentDark }} />
              <div className="w-8 h-px" style={{ background: theme.textMuted }} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className={`${theme.fontCalligraphy} text-base sm:text-lg tracking-[0.15em]`}
              style={{ color: theme.textSecondary }}
            >
              {t('requestHonour', 'Request the honour of your presence')}
            </motion.p>
          </div>

          {/* Bottom gold line */}
          <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 w-64 md:w-80 z-10">
            <GoldDivider themeId={theme.id} accentColor={theme.accent} />
          </div>

          {/* Scroll indicator */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="absolute bottom-8 flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: theme.textMuted }}>{t('scroll', 'Scroll')}</span>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
              <ChevronDown className="w-4 h-4" style={{ color: theme.textMuted }} />
            </motion.div>
          </motion.div>
        </section>

        {/* ─── Message / Quote Section ─── */}
        <RevealSection>
          <section className="py-16 md:py-20 px-6">
            <div className="max-w-lg mx-auto text-center">
              {guestNameFromUrl && (
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <h3 className={`${theme.fontDisplay} text-3xl md:text-4xl capitalize mb-8`} style={{ color: theme.accent }}>
                    {language === 'ur' ? 'محترم' : 'Dear'} {guestNameFromUrl},
                  </h3>
                </motion.div>
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

        {/* ─── Quranic Verse ─── */}
        {flowData?.showQuranVerse && (
          <RevealSection>
            <section className="py-16 md:py-20 px-6">
              <div 
                className="max-w-2xl mx-auto text-center space-y-6 md:space-y-8 py-10 px-6 md:px-10 rounded-2xl border backdrop-blur-md relative overflow-hidden transition-all duration-500 shadow-xl"
                style={{ 
                  borderColor: getOpacityStyle('border', 0.15), 
                  backgroundColor: getOpacityStyle('bg', 0.3) || 'rgba(0,0,0,0.15)',
                  boxShadow: `0 10px 30px -10px ${getOpacityStyle('border', 0.1)}`
                }}
              >
                {/* Subtle elegant Islamic geometric / design flourish */}
                <div className="flex justify-center items-center gap-4 mb-2">
                  <div className="w-8 h-px" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent})` }} />
                  <span className="text-gold opacity-80 text-2xl font-arabic">﷽</span>
                  <div className="w-8 h-px" style={{ background: `linear-gradient(-90deg, transparent, ${theme.accent})` }} />
                </div>

                {/* Arabic Calligraphy Verse */}
                <p 
                  className="font-arabic text-2xl md:text-3xl leading-loose text-gold px-2 bismillah-glow" 
                  dir="rtl"
                  style={{ color: theme.accentLight || '#d4af37', textShadow: `0 0 15px ${getOpacityStyle('text', 0.2)}` }}
                >
                  وَمِنْ ءَايَـٰتِهِۦٓ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَٰجًا لِّتَسْکُنُوٓا۟ إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِى ذَٰلِكَ لَـَٔايَـٰتٍ لِّقَوْمٍ يَتَفَكَّرُونَ
                </p>

                <div className="flex justify-center items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getOpacityStyle('border', 0.3) }} />
                  <div className="w-16 h-px" style={{ backgroundColor: getOpacityStyle('border', 0.2) }} />
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getOpacityStyle('border', 0.3) }} />
                </div>

                {/* English Translation */}
                <p 
                  className="text-sm md:text-base italic leading-relaxed max-w-xl mx-auto px-4"
                  style={{ color: theme.textSecondary || 'rgba(255,255,255,0.8)' }}
                >
                  &ldquo;And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy. Indeed in that are signs for a people who give thought.&rdquo;
                  <span className="block text-xs mt-2 font-semibold not-italic" style={{ color: theme.accent }}>— Surah Ar-Rum [30:21]</span>
                </p>

                <div className="flex justify-center items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getOpacityStyle('border', 0.3) }} />
                  <div className="w-16 h-px" style={{ backgroundColor: getOpacityStyle('border', 0.2) }} />
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getOpacityStyle('border', 0.3) }} />
                </div>

                {/* Urdu Translation */}
                <p 
                  className="font-arabic text-lg md:text-xl leading-loose max-w-xl mx-auto px-4" 
                  dir="rtl"
                  style={{ color: theme.textPrimary || '#ffffff' }}
                >
                  &ldquo;اور اس کی نشانیوں میں سے ہے کہ اس نے تمہارے لیے تمہاری ہی جنس سے جوڑے پیدا کیے تاکہ تم ان سے آرام پاؤ اور اس نے تمہارے درمیان محبت اور رحمت پیدا کر دی، یقیناً اس میں غور و فکر کرنے والوں کے لیے نشانیاں ہیں۔&rdquo;
                  <span className="block text-xs mt-2 font-sans not-italic opacity-85" style={{ color: theme.accent }}>— سورہ روم [30:21]</span>
                </p>
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
          {flowData?.youtubeVideoId && (flowData.selectedPlan === 'royal' || theme.id.includes('royal') || ['crimson-royale', 'majestic-love', 'royal-imperial', 'royal-elegance'].includes(theme.id)) && (
            <RevealSection>
              <section className="py-16 md:py-20 px-6">
                <div className="flex flex-col items-center gap-6">
                  <h2 className={`${theme.fontCalligraphy} text-3xl sm:text-4xl text-center`} style={{ color: theme.accent }}>Our Story</h2>
                  <HeartDivider themeId={theme.id} accentColor={theme.accent} />
                  <div className="w-full max-w-3xl mx-auto">
                    <div 
                      className="relative overflow-hidden rounded-xl aspect-video shadow-lg"
                      style={{ border: `1px solid ${getOpacityStyle('border', 0.2)}`, boxShadow: `0 10px 15px -3px ${getOpacityStyle('border', 0.05)}` }}
                    >
                      <iframe 
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${flowData.youtubeVideoId}?rel=0&modestbranding=1`} 
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
                    <RevealSection key={event.name} delay={idx * 0.12}>
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
        {(dressCodeWomen || dressCodeMen) && (
          <RevealSection>
            <section className="py-16 md:py-20 px-6">
              <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
                <h2 className={`${theme.fontCalligraphy} text-3xl sm:text-4xl text-center`} style={{ color: theme.accent }}>{t('dressCode', 'Dress Code')}</h2>
                <HeartDivider themeId={theme.id} accentColor={theme.accent} />
                
                <div className="grid grid-cols-2 gap-6 w-full">
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
        {(accommodation || transportation) && (
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
        {gifts && (
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
                    q_en: 'Can I bring a plus one?',
                    q_ur: 'کیا میں اپنے ساتھ کسی اور کو لا سکتا ہوں؟',
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
                    q_en: 'Who can I contact for travel queries?',
                    q_ur: 'سفر اور رہائش کے حوالے سے میں کس سے رابطہ کروں؟',
                    a_en: 'Please refer to the Travel Coordinator details listed in the Travel section or contact the hosts.',
                    a_ur: 'برائے مہربانی سفر کے سیکشن میں درج کوآرڈینیٹر کی تفصیلات دیکھیں یا میزبانوں سے رابطہ کریں۔',
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
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="p-4 pt-0 border-t text-sm leading-relaxed" style={{ borderColor: getOpacityStyle('text', 0.1), color: getOpacityStyle('text', 0.8) }}>
                              {answer}
                            </div>
                          </motion.div>
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

              <div className="relative w-full">
                {/* Decorative corner borders */}
                <div className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 rounded-tl-lg" style={{ borderColor: theme.borderSubtle }} />
                <div className="absolute -top-3 -right-3 w-8 h-8 border-t-2 border-r-2 rounded-tr-lg" style={{ borderColor: theme.borderSubtle }} />
                <div className="absolute -bottom-3 -left-3 w-8 h-8 border-b-2 border-l-2 rounded-bl-lg" style={{ borderColor: theme.borderSubtle }} />
                <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 rounded-br-lg" style={{ borderColor: theme.borderSubtle }} />

                {/* Floating hearts on RSVP accept */}
                {rsvpHearts.map((h) => (
                  <div key={h} className="absolute heart-float pointer-events-none" style={{ left: `${20 + ((h * 13) % 61)}%`, top: '40%', animationDelay: `${h * 0.15}s` }}>
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
                      <div className="space-y-2">
                        <label className={`text-sm ${theme.fontDisplay}`} style={{ color: getOpacityStyle('text', 0.7) }}>{t('willYouBeAttending', 'Will you be attending?')}</label>
                        <select
                          value={rsvpStatus || ''}
                          onChange={(e) => setRsvpStatus(e.target.value as 'accept' | 'decline' | null || null)}
                          className="w-full h-11 rounded-lg border text-sm px-3 focus:outline-none transition-all duration-300 appearance-none cursor-pointer"
                          style={{ backgroundColor: theme.bgSecondary, borderColor: theme.borderSubtle, color: theme.textPrimary, backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='${encodeURIComponent(theme.accentDark)}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                        >
                          <option value="" style={{ backgroundColor: theme.bgSecondary }}>{t('selectOption', 'Select...')}</option>
                          <option value="accept" style={{ backgroundColor: theme.bgSecondary, color: theme.textPrimary }}>{t('acceptYes', "Yes, I'll be there! 🎉")}</option>
                          <option value="decline" style={{ backgroundColor: theme.bgSecondary, color: theme.textPrimary }}>{t('declineSorry', "Sorry, I can't make it 💌")}</option>
                        </select>
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
                    </CardContent>
                  </Card>
                ) : (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="text-center py-10">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 300 }} className="mb-4">
                      {rsvpStatus === 'accept' ? (
                        <div className="w-16 h-16 rounded-full border flex items-center justify-center mx-auto" style={{ backgroundColor: getOpacityStyle('border', 0.2), borderColor: getOpacityStyle('border', 0.4) }}>
                          <Check className="w-8 h-8" style={{ color: theme.accent }} />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full border flex items-center justify-center mx-auto" style={{ backgroundColor: getOpacityStyle('border', 0.1), borderColor: theme.borderSubtle }}>
                          <Heart className="w-8 h-8" style={{ color: theme.accent }} />
                        </div>
                      )}
                    </motion.div>
                    <h3 className={`${theme.fontDisplay} text-xl mb-2`} style={{ color: theme.accent }}>
                      {rsvpStatus === 'accept' ? t('joyfullyAccepted', 'Joyfully Accepted!') : t('thankYou', 'Thank You!')}
                    </h3>
                    <p className="text-sm" style={{ color: getOpacityStyle('text', 0.6) }}>
                      {rsvpStatus === 'accept'
                        ? `We can't wait to celebrate with you, ${rsvpName}! 🎉`
                        : `We'll miss you, ${rsvpName}. You'll be in our hearts! 💌`}
                    </p>
                  </motion.div>
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
                      <motion.div
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
                      </motion.div>
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
          <p className="text-xs tracking-wider" style={{ color: getOpacityStyle('text', 0.3) }}>{t('madeWithLove', 'Made with love by ShaadiLink')}</p>
        </div>
      </motion.div>

      {/* ═══ Inline SVG ClipPaths ─── */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <clipPath id="heart-clip" clipPathUnits="userSpaceOnUse">
            <path d={getHeartSvgPath(320, 300)} />
          </clipPath>
        </defs>
      </svg>
    </div>
  )
}
