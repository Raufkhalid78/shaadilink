import { describe, it, expect } from 'vitest'
import { getClientIp, contactLimiter } from '../src/lib/rate-limit'

describe('Rate Limiter and IP Extraction', () => {
  it('extracts client IP from x-real-ip header', () => {
    const req = new Request('https://www.shaadilink.com.pk/api/contact', {
      headers: {
        'x-real-ip': '203.0.113.195',
      },
    })
    expect(getClientIp(req)).toBe('203.0.113.195')
  })

  it('extracts client IP from cf-connecting-ip header', () => {
    const req = new Request('https://www.shaadilink.com.pk/api/contact', {
      headers: {
        'cf-connecting-ip': '198.51.100.42',
      },
    })
    expect(getClientIp(req)).toBe('198.51.100.42')
  })

  it('extracts client IP from leftmost entry in x-forwarded-for', () => {
    const req = new Request('https://www.shaadilink.com.pk/api/contact', {
      headers: {
        'x-forwarded-for': '192.0.2.1, 10.0.0.1, 10.0.0.2',
      },
    })
    expect(getClientIp(req)).toBe('192.0.2.1')
  })

  it('falls back to 127.0.0.1 when no IP headers are present', () => {
    const req = new Request('https://www.shaadilink.com.pk/api/contact')
    expect(getClientIp(req)).toBe('127.0.0.1')
  })

  it('enforces rate limits per identifier', async () => {
    const testId = `test_client_${Date.now()}`
    
    // First requests should succeed
    const r1 = await contactLimiter.limit(testId)
    expect(r1.success).toBe(true)
    expect(r1.remaining).toBeLessThanOrEqual(r1.limit)

    // Send rapid requests up to limit
    let blocked = false
    for (let i = 0; i < 10; i++) {
      const res = await contactLimiter.limit(testId)
      if (!res.success) {
        blocked = true
        expect(res.remaining).toBe(0)
        break
      }
    }
    expect(blocked).toBe(true)
  })
})
