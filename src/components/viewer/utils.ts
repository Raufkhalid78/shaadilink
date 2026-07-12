import { TemplateTheme, TEMPLATE_THEMES, DEFAULT_THEME } from './themes';
import type { FlowData } from '@/lib/flow-types';

export function hexToRgb(hex: string): string {
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
  const isRoyal = templateId ? (['royal-imperial', 'royal-elegance', 'geometric-gold', 'dark-velvet'].includes(templateId)) : false
  
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
    isRoyal,
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
export interface InvitationViewerProps {
  templateId?: string;
  flowData?: FlowData;
  guestName?: string | null;
}

/* ─── Corner Ornament SVG (Zareqia-style) ─── */