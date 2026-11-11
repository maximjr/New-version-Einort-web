/**
 * Client & API Rate Limiting Infrastructure
 * Implements in-memory sliding window rate limiting to protect against
 * brute-force authentication, form spamming, and API resource exhaustion.
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  login: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 min
  register: { maxRequests: 3, windowMs: 15 * 60 * 1000 }, // 3 attempts per 15 min
  contact: { maxRequests: 5, windowMs: 10 * 60 * 1000 }, // 5 inquiries per 10 min
  messaging: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 messages per min
  general: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 requests per min
};

class SlidingWindowRateLimiter {
  private storage: Map<string, number[]> = new Map();

  /**
   * Evaluates if an action is permitted within its configured rate limit window.
   */
  public check(action: string, identifier: string = 'client_default'): {
    allowed: boolean;
    remaining: number;
    resetTimeMs: number;
  } {
    const config = DEFAULT_CONFIGS[action] || DEFAULT_CONFIGS.general;
    const now = Date.now();
    const key = `${action}:${identifier}`;

    const timestamps = this.storage.get(key) || [];
    const validTimestamps = timestamps.filter(ts => now - ts < config.windowMs);

    if (validTimestamps.length >= config.maxRequests) {
      const oldestValid = validTimestamps[0];
      const resetTimeMs = (oldestValid + config.windowMs) - now;
      this.storage.set(key, validTimestamps);
      return {
        allowed: false,
        remaining: 0,
        resetTimeMs: Math.max(0, resetTimeMs),
      };
    }

    validTimestamps.push(now);
    this.storage.set(key, validTimestamps);

    return {
      allowed: true,
      remaining: config.maxRequests - validTimestamps.length,
      resetTimeMs: config.windowMs,
    };
  }

  /**
   * Resets rate limiting state for a specific key (e.g. upon successful authentication).
   */
  public reset(action: string, identifier: string = 'client_default'): void {
    this.storage.delete(`${action}:${identifier}`);
  }
}

export const rateLimiter = new SlidingWindowRateLimiter();
