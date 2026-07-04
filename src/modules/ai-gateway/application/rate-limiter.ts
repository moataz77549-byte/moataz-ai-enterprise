interface RateLimitRule {
  limit: number; // Max requests allowed
  windowMs: number; // Time window in milliseconds
}

class SlidingWindowRateLimiter {
  private requests: Map<string, number[]> = new Map();

  /**
   * Checks if a request exceeds the configured limits.
   */
  public isRateLimited(key: string, rule: RateLimitRule = { limit: 100, windowMs: 60 * 1000 }): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    
    // Filter out timestamps older than the current window
    const cutoff = now - rule.windowMs;
    const activeTimestamps = timestamps.filter((t) => t > cutoff);

    if (activeTimestamps.length >= rule.limit) {
      return true;
    }

    activeTimestamps.push(now);
    this.requests.set(key, activeTimestamps);
    return false;
  }
}

export const RateLimiter = new SlidingWindowRateLimiter();
export type { RateLimitRule };
