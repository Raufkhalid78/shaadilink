import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { NextRequest } from 'next/server'

// Check if redis URL and token exist
const hasRedisConfig = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

// Fallback empty redis if missing
const redis = hasRedisConfig
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : ({
      eval: () => Promise.resolve([]),
      pipeline: () => ({ exec: () => Promise.resolve([]) }),
    } as unknown as Redis);

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export interface RateLimiterInstance {
  limit: (identifier?: string) => Promise<RateLimitResult>
}

/**
 * In-memory sliding window rate limiter fallback when Redis is unconfigured.
 * Maintains actual rate limiting per identifier/IP to prevent abuse.
 */
class InMemoryRateLimiter implements RateLimiterInstance {
  private hits: Map<string, number[]> = new Map()
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  async limit(identifier = 'anonymous'): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - this.windowMs

    const timestamps = (this.hits.get(identifier) || []).filter(t => t > windowStart)

    if (timestamps.length >= this.maxRequests) {
      const oldest = timestamps[0]
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: oldest + this.windowMs,
      }
    }

    timestamps.push(now)
    this.hits.set(identifier, timestamps)

    // Periodic memory cleanup if table exceeds 5,000 active keys
    if (this.hits.size > 5000) {
      for (const [key, times] of this.hits.entries()) {
        const valid = times.filter(t => t > windowStart)
        if (valid.length === 0) {
          this.hits.delete(key)
        } else {
          this.hits.set(key, valid)
        }
      }
    }

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - timestamps.length,
      reset: now + this.windowMs,
    }
  }
}

function parseWindowMs(windowStr: `${number} ms` | `${number} s` | `${number} m` | `${number} h` | `${number} d`): number {
  const [valStr, unit] = windowStr.split(' ')
  const val = parseInt(valStr, 10) || 1
  switch (unit) {
    case 'ms': return val
    case 's': return val * 1000
    case 'm': return val * 60 * 1000
    case 'h': return val * 60 * 60 * 1000
    case 'd': return val * 24 * 60 * 60 * 1000
    default: return val * 1000
  }
}

/**
 * Creates a rate limiter instance with Upstash Redis or sliding-window in-memory fallback
 */
function createLimiter(
  maxRequests: number,
  windowStr: `${number} ms` | `${number} s` | `${number} m` | `${number} h` | `${number} d`
): RateLimiterInstance {
  if (!hasRedisConfig) {
    const windowMs = parseWindowMs(windowStr)
    return new InMemoryRateLimiter(maxRequests, windowMs)
  }

  const upstashLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, windowStr),
    ephemeralCache: new Map(),
  })

  return {
    limit: async (identifier?: string) => {
      const result = await upstashLimiter.limit(identifier || 'anonymous')
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      }
    }
  }
}

/**
 * Secure client IP extraction from trusted headers
 */
export function getClientIp(request: Request | NextRequest): string {
  const headers = request.headers
  const xRealIp = headers.get('x-real-ip')
  if (xRealIp) return xRealIp.trim()

  const cfConnectingIp = headers.get('cf-connecting-ip')
  if (cfConnectingIp) return cfConnectingIp.trim()

  const xVercelIp = headers.get('x-vercel-ip')
  if (xVercelIp) return xVercelIp.trim()

  const xForwardedFor = headers.get('x-forwarded-for')
  if (xForwardedFor) {
    const clientIp = xForwardedFor.split(',')[0]?.trim()
    if (clientIp) return clientIp
  }

  return '127.0.0.1'
}

export const uploadLimiter = createLimiter(20, '1 h')
export const contactLimiter = createLimiter(5, '1 h')
export const newsletterLimiter = createLimiter(3, '1 h')
export const paymentLimiter = createLimiter(10, '1 h')
export const translateLimiter = createLimiter(30, '1 m')
export const chatLimiter = createLimiter(10, '1 m')
export const resolveLimiter = createLimiter(5, '1 m')
export const rsvpLimiter = createLimiter(5, '10 m')
export const wishesLimiter = createLimiter(5, '10 m')
export const affiliateLimiter = createLimiter(3, '1 d')
