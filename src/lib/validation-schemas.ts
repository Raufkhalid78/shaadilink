import { z } from 'zod'

export const paymentInitiateSchema = z.object({
  invitationId: z.string().uuid('Invalid invitation ID format'),
  plan: z.enum(['classic', 'royal']),
  guestLinksQuota: z.number().int().min(0).max(5000).optional().default(0),
  promoCode: z.string().trim().max(50).optional().nullable(),
})

export const eventItemSchema = z.object({
  name: z.string().trim().min(1, 'Event name is required').max(100),
  date: z.string().trim().max(100).optional().default(''),
  time: z.string().trim().max(100).optional().default(''),
  venue: z.string().trim().max(200).optional().default(''),
  order_index: z.number().int().min(0).max(50).optional().default(0),
})

export const invitationInputSchema = z.object({
  templateId: z.string().trim().min(1).max(100).default('emerald-noir'),
  plan: z.enum(['classic', 'royal']).default('classic'),
  partner1Name: z.string().trim().max(100).optional().default(''),
  partner2Name: z.string().trim().max(100).optional().default(''),
  venue: z.string().trim().max(200).optional().default(''),
  venueAddress: z.string().trim().max(500).optional().default(''),
  welcomeMessage: z.string().trim().max(2000).optional().default(''),
  backgroundMusic: z.string().trim().max(100).optional().default('shaadi-classic'),
  dressCodeWomen: z.string().trim().max(200).optional().default(''),
  dressCodeMen: z.string().trim().max(200).optional().default(''),
  transportation: z.string().trim().max(1000).optional().default(''),
  accommodation: z.string().trim().max(1000).optional().default(''),
  gifts: z.string().trim().max(1000).optional().default(''),
  heroImageUrl: z.string().trim().max(2000).optional().nullable(),
  slideshowImageUrls: z.array(z.string().trim().max(2000)).max(10).optional().default([]),
  youtubeVideoId: z.string().trim().max(100).optional().default(''),
  showBismillah: z.boolean().optional().default(true),
  showQuranVerse: z.boolean().optional().default(true),
  customVerseText: z.string().trim().max(1000).optional().default(''),
  customVerseSource: z.string().trim().max(200).optional().default(''),
  primaryHostFamily: z.string().trim().max(200).optional().default(''),
  secondaryHostFamily: z.string().trim().max(200).optional().default(''),
  primaryHostCity: z.string().trim().max(100).optional().default(''),
  secondaryHostCity: z.string().trim().max(100).optional().default(''),
  contactPhone: z.string().trim().max(50).optional().default(''),
  isSegregated: z.boolean().optional().default(false),
  venueDetailsSegregated: z.string().trim().max(500).optional().default(''),
  showNikahRegistration: z.boolean().optional().default(false),
  showHeadcount: z.boolean().optional().default(false),
  showDietaryPreferences: z.boolean().optional().default(false),
  showCrowdPhotoWall: z.boolean().optional().default(true),
  guestLinksQuota: z.number().int().min(0).max(5000).optional().default(10),
  slug: z.string().trim().max(100).optional().nullable(),
  title: z.string().trim().max(200).optional().default(''),
  category: z.string().trim().max(50).optional().default('wedding'),
  hideDigitalShagun: z.boolean().optional().default(false),
  customMusicUrl: z.string().trim().max(2000).optional().nullable(),
  customMusicName: z.string().trim().max(200).optional().nullable(),
  voiceNoteUrl: z.string().trim().max(2000).optional().nullable(),
  voiceNoteTitle: z.string().trim().max(200).optional().nullable(),
  voiceNoteSender: z.string().trim().max(200).optional().nullable(),
  agencyName: z.string().trim().max(200).optional().nullable(),
  agencyPhone: z.string().trim().max(50).optional().nullable(),
  whiteLabelFooter: z.string().trim().max(200).optional().nullable(),
  clientApprovalNotes: z.string().trim().max(5000).optional().nullable(),
  events: z.array(eventItemSchema).max(15).optional().default([]),
})

export const rsvpSchema = z.object({
  guestName: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  guestEmail: z.string().trim().email('Invalid email address').max(200).optional().or(z.literal('')).nullable(),
  status: z.enum(['accept', 'decline']),
  attendingCount: z.number().int().min(0).max(50).optional().default(1),
  adultsCount: z.number().int().min(0).max(50).optional().default(1),
  childrenCount: z.number().int().min(0).max(50).optional().default(0),
  dietaryNotes: z.string().trim().max(500).optional().default(''),
  attendingEvents: z.array(z.string().trim().max(100)).max(25).optional().default([]),
})

export const wishesSchema = z.object({
  senderName: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  message: z.string().trim().min(1, 'Message is required').max(1000, 'Message is too long (max 1000 chars)'),
})

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(200),
  message: z.string().trim().min(1, 'Message is required').max(2000),
})

export const newsletterSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(200),
})
