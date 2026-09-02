import { describe, it, expect } from 'vitest'
import {
  paymentInitiateSchema,
  invitationInputSchema,
  rsvpSchema,
  wishesSchema,
  contactSchema,
  newsletterSchema,
} from '../src/lib/validation-schemas'

describe('Zod Validation Schemas', () => {
  describe('paymentInitiateSchema', () => {
    it('accepts valid payment initiation payload', () => {
      const valid = {
        invitationId: '123e4567-e89b-12d3-a456-426614174000',
        plan: 'royal',
        guestLinksQuota: 50,
        promoCode: 'WEDDING2026',
      }
      const res = paymentInitiateSchema.safeParse(valid)
      expect(res.success).toBe(true)
    })

    it('rejects invalid plan names', () => {
      const invalid = {
        invitationId: '123e4567-e89b-12d3-a456-426614174000',
        plan: 'unlimited_enterprise',
      }
      const res = paymentInitiateSchema.safeParse(invalid)
      expect(res.success).toBe(false)
    })

    it('rejects invalid invitation UUIDs', () => {
      const invalid = {
        invitationId: 'not-a-uuid',
        plan: 'classic',
      }
      const res = paymentInitiateSchema.safeParse(invalid)
      expect(res.success).toBe(false)
    })
  })

  describe('rsvpSchema', () => {
    it('accepts valid RSVP submission', () => {
      const valid = {
        guestName: 'Zainab Tariq',
        guestEmail: 'zainab@example.com',
        status: 'accept',
        attendingCount: 2,
      }
      const res = rsvpSchema.safeParse(valid)
      expect(res.success).toBe(true)
    })

    it('rejects empty guest name', () => {
      const invalid = {
        guestName: '   ',
        status: 'accept',
      }
      const res = rsvpSchema.safeParse(invalid)
      expect(res.success).toBe(false)
    })

    it('rejects invalid status', () => {
      const invalid = {
        guestName: 'Hamza',
        status: 'maybe_coming',
      }
      const res = rsvpSchema.safeParse(invalid)
      expect(res.success).toBe(false)
    })
  })

  describe('wishesSchema', () => {
    it('accepts valid wish message', () => {
      const valid = {
        senderName: 'Uncle Tariq',
        message: 'Wishing both of you a lifetime of joy, barakah, and happiness!',
      }
      const res = wishesSchema.safeParse(valid)
      expect(res.success).toBe(true)
    })

    it('rejects empty message', () => {
      const invalid = {
        senderName: 'Uncle Tariq',
        message: '',
      }
      const res = wishesSchema.safeParse(invalid)
      expect(res.success).toBe(false)
    })
  })

  describe('contactSchema and newsletterSchema', () => {
    it('validates contact email and message', () => {
      const res = contactSchema.safeParse({
        name: 'Usman',
        email: 'usman@shaadilink.pk',
        message: 'Need help with template customization',
      })
      expect(res.success).toBe(true)
    })

    it('rejects malformed newsletter email', () => {
      const res = newsletterSchema.safeParse({
        email: 'not-an-email',
      })
      expect(res.success).toBe(false)
    })
  })
})
