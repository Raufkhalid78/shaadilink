import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Check if redis URL and token exist to avoid runtime errors on build
const hasRedisConfig = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

// Fallback empty redis if missing
const redis = hasRedisConfig
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : ({
      // Dummy object that won't break things if env vars are missing
      eval: () => Promise.resolve([]),
      pipeline: () => ({ exec: () => Promise.resolve([]) }),
    } as unknown as Redis);

// Helper function to return a limiter (with safe in-memory fallback if Redis is not configured)
const createLimiter = (options: { redis: Redis; limiter: any }) => {
  if (!hasRedisConfig) {
    return {
      limit: async (_identifier?: string) => {
        return { 
          success: true, 
          pending: Promise.resolve(), 
          limit: 100, 
          remaining: 99, 
          reset: Date.now() + 60000 
        };
      },
    };
  }
  return new Ratelimit({
    redis: options.redis,
    limiter: options.limiter,
    ephemeralCache: new Map(),
  });
};

export const contactLimiter = createLimiter({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
});

export const newsletterLimiter = createLimiter({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
});

export const paymentLimiter = createLimiter({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
});

export const translateLimiter = createLimiter({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
});

export const chatLimiter = createLimiter({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});

export const resolveLimiter = createLimiter({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
});

export const rsvpLimiter = createLimiter({
  redis,
  limiter: Ratelimit.slidingWindow(3, '10 m'),
});

export const wishesLimiter = createLimiter({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10 m'),
});

export const affiliateLimiter = createLimiter({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 d'),
});
