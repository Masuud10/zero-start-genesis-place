
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  identifier: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

class RateLimiter {
  private static instance: RateLimiter;
  private limits = new Map<string, RateLimitEntry>();

  private constructor() {}

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  checkLimit(config: RateLimitConfig): { allowed: boolean; remainingRequests: number; resetTime: number } {
    const key = `${config.identifier}_${config.windowMs}_${config.maxRequests}`;
    const now = Date.now();
    
    let entry = this.limits.get(key);
    
    // Reset if window expired
    if (!entry || now >= entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        blocked: false
      };
    }

    // Check if blocked
    if (entry.blocked && now < entry.resetTime) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: entry.resetTime
      };
    }

    // Increment count
    entry.count++;
    
    // Block if limit exceeded
    if (entry.count > config.maxRequests) {
      entry.blocked = true;
      this.limits.set(key, entry);
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: entry.resetTime
      };
    }

    this.limits.set(key, entry);
    
    return {
      allowed: true,
      remainingRequests: config.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  // Predefined rate limit configs
  static readonly LOGIN_LIMIT: Omit<RateLimitConfig, 'identifier'> = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5
  };

  static readonly GRADE_SUBMISSION_LIMIT: Omit<RateLimitConfig, 'identifier'> = {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10
  };

  static readonly MPESA_TRANSACTION_LIMIT: Omit<RateLimitConfig, 'identifier'> = {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 3
  };

  static readonly PASSWORD_RESET_LIMIT: Omit<RateLimitConfig, 'identifier'> = {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3
  };
}

export const rateLimiter = RateLimiter.getInstance();
export { RateLimiter };
