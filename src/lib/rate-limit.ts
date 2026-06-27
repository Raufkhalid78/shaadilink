export class RateLimiter {
  private cache = new Map<string, { count: number, resetTime: number }>();

  constructor(private maxRequests: number, private windowMs: number) {}

  check(ip: string): boolean {
    const now = Date.now();
    const record = this.cache.get(ip);

    if (!record || now > record.resetTime) {
      this.cache.set(ip, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }
}
