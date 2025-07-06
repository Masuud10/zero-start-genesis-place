import { supabase } from '@/integrations/supabase/client';

// Cache configuration
const CACHE_CONFIG = {
  // In-memory cache settings
  MEMORY_CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  MEMORY_CACHE_MAX_SIZE: 1000, // Maximum number of items in memory cache
  
  // Redis cache settings (when available)
  REDIS_CACHE_TTL: 15 * 60, // 15 minutes in seconds
  REDIS_CACHE_PREFIX: 'edufam:',
  
  // Cache keys
  CACHE_KEYS: {
    SCHOOL_STATS: 'school_stats',
    USER_PROFILE: 'user_profile',
    DASHBOARD_DATA: 'dashboard_data',
    GRADES_DATA: 'grades_data',
    ATTENDANCE_DATA: 'attendance_data',
    FINANCIAL_DATA: 'financial_data',
    ANALYTICS_DATA: 'analytics_data',
    ANNOUNCEMENTS: 'announcements',
    TIMETABLE_DATA: 'timetable_data',
    EXAMINATIONS_DATA: 'examinations_data',
  }
} as const;

// Cache entry type
interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

// In-memory cache implementation
class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;

  constructor(maxSize: number = CACHE_CONFIG.MEMORY_CACHE_MAX_SIZE) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttl: number = CACHE_CONFIG.MEMORY_CACHE_TTL): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Redis cache implementation (when Redis is available)
class RedisCache {
  private redis: unknown = null;
  private prefix: string;

  constructor(prefix: string = CACHE_CONFIG.REDIS_CACHE_PREFIX) {
    this.prefix = prefix;
    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    try {
      // Try to import Redis (will fail if not installed)
      const Redis = await import('ioredis');
      this.redis = new Redis.default({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
      });
      
      console.log('✅ Redis cache initialized successfully');
    } catch (error) {
      console.warn('⚠️ Redis not available, falling back to memory cache:', error);
      this.redis = null;
    }
  }

  private getFullKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async set<T>(key: string, data: T, ttl: number = CACHE_CONFIG.REDIS_CACHE_TTL): Promise<void> {
    if (!this.redis) return;

    try {
      const fullKey = this.getFullKey(key);
      await (this.redis as any).setex(fullKey, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null;

    try {
      const fullKey = this.getFullKey(key);
      const data = await (this.redis as any).get(fullKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.redis) return false;

    try {
      const fullKey = this.getFullKey(key);
      const result = await (this.redis as any).del(fullKey);
      return result > 0;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  async clear(): Promise<void> {
    if (!this.redis) return;

    try {
      const keys = await (this.redis as any).keys(`${this.prefix}*`);
      if (keys.length > 0) {
        await (this.redis as any).del(...keys);
      }
    } catch (error) {
      console.error('Redis clear error:', error);
    }
  }
}

// Main cache manager
class CacheManager {
  private memoryCache: MemoryCache;
  private redisCache: RedisCache;
  private isRedisAvailable: boolean = false;

  constructor() {
    this.memoryCache = new MemoryCache();
    this.redisCache = new RedisCache();
    
    // Check Redis availability
    this.checkRedisAvailability();
    
    // Clean up memory cache periodically
    setInterval(() => {
      this.memoryCache.cleanup();
    }, 60000); // Every minute
  }

  private async checkRedisAvailability(): Promise<void> {
    try {
      const testData = await this.redisCache.get('test');
      this.isRedisAvailable = true;
    } catch (error) {
      this.isRedisAvailable = false;
    }
  }

  async set(key: string, data: any, ttl?: number): Promise<void> {
    // Always set in memory cache
    this.memoryCache.set(key, data, ttl);

    // Also set in Redis if available
    if (this.isRedisAvailable) {
      await this.redisCache.set(key, data, ttl);
    }
  }

  async get(key: string): Promise<any | null> {
    // Try memory cache first (faster)
    const memoryData = this.memoryCache.get(key);
    if (memoryData !== null) {
      return memoryData;
    }

    // Try Redis cache if available
    if (this.isRedisAvailable) {
      const redisData = await this.redisCache.get(key);
      if (redisData !== null) {
        // Store in memory cache for faster subsequent access
        this.memoryCache.set(key, redisData);
        return redisData;
      }
    }

    return null;
  }

  async delete(key: string): Promise<boolean> {
    const memoryResult = this.memoryCache.delete(key);
    const redisResult = await this.redisCache.delete(key);
    return memoryResult || redisResult;
  }

  async clear(): Promise<void> {
    this.memoryCache.clear();
    await this.redisCache.clear();
  }

  // Cache key generators
  static getSchoolStatsKey(schoolId: string): string {
    return `${CACHE_CONFIG.CACHE_KEYS.SCHOOL_STATS}:${schoolId}`;
  }

  static getUserProfileKey(userId: string): string {
    return `${CACHE_CONFIG.CACHE_KEYS.USER_PROFILE}:${userId}`;
  }

  static getDashboardDataKey(userId: string, role: string): string {
    return `${CACHE_CONFIG.CACHE_KEYS.DASHBOARD_DATA}:${userId}:${role}`;
  }

  static getGradesDataKey(schoolId: string, filters?: string): string {
    return `${CACHE_CONFIG.CACHE_KEYS.GRADES_DATA}:${schoolId}:${filters || 'all'}`;
  }

  static getAttendanceDataKey(schoolId: string, date?: string): string {
    return `${CACHE_CONFIG.CACHE_KEYS.ATTENDANCE_DATA}:${schoolId}:${date || 'all'}`;
  }

  static getFinancialDataKey(schoolId: string, period?: string): string {
    return `${CACHE_CONFIG.CACHE_KEYS.FINANCIAL_DATA}:${schoolId}:${period || 'all'}`;
  }

  static getAnalyticsDataKey(schoolId: string, type: string): string {
    return `${CACHE_CONFIG.CACHE_KEYS.ANALYTICS_DATA}:${schoolId}:${type}`;
  }

  static getAnnouncementsKey(schoolId: string): string {
    return `${CACHE_CONFIG.CACHE_KEYS.ANNOUNCEMENTS}:${schoolId}`;
  }

  static getTimetableDataKey(schoolId: string, classId?: string): string {
    return `${CACHE_CONFIG.CACHE_KEYS.TIMETABLE_DATA}:${schoolId}:${classId || 'all'}`;
  }

  static getExaminationsDataKey(schoolId: string): string {
    return `${CACHE_CONFIG.CACHE_KEYS.EXAMINATIONS_DATA}:${schoolId}`;
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Export cache configuration
export { CACHE_CONFIG };

// Export cache key generators
export const cacheKeys = {
  getSchoolStatsKey: CacheManager.getSchoolStatsKey,
  getUserProfileKey: CacheManager.getUserProfileKey,
  getDashboardDataKey: CacheManager.getDashboardDataKey,
  getGradesDataKey: CacheManager.getGradesDataKey,
  getAttendanceDataKey: CacheManager.getAttendanceDataKey,
  getFinancialDataKey: CacheManager.getFinancialDataKey,
  getAnalyticsDataKey: CacheManager.getAnalyticsDataKey,
  getAnnouncementsKey: CacheManager.getAnnouncementsKey,
  getTimetableDataKey: CacheManager.getTimetableDataKey,
  getExaminationsDataKey: CacheManager.getExaminationsDataKey,
};

// Utility functions for common caching patterns
export const cacheUtils = {
  // Cache with automatic invalidation
  async cacheWithInvalidation<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = await cacheManager.get(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetcher();
    
    // Cache the result
    await cacheManager.set(key, data, ttl);
    
    return data;
  },

  // Cache with background refresh
  async cacheWithBackgroundRefresh<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await cacheManager.get(key);
    
    if (cached !== null) {
      // Refresh in background if cache is getting stale
      setTimeout(async () => {
        try {
          const freshData = await fetcher();
          await cacheManager.set(key, freshData, ttl);
        } catch (error) {
          console.error('Background cache refresh failed:', error);
        }
      }, 1000);
      
      return cached;
    }

    const data = await fetcher();
    await cacheManager.set(key, data, ttl);
    return data;
  },

  // Invalidate related caches
  async invalidateRelatedCaches(schoolId: string): Promise<void> {
    const keys = [
      cacheKeys.getSchoolStatsKey(schoolId),
      cacheKeys.getDashboardDataKey('*', '*'),
      cacheKeys.getGradesDataKey(schoolId),
      cacheKeys.getAttendanceDataKey(schoolId),
      cacheKeys.getFinancialDataKey(schoolId),
      cacheKeys.getAnalyticsDataKey(schoolId, '*'),
      cacheKeys.getAnnouncementsKey(schoolId),
      cacheKeys.getTimetableDataKey(schoolId),
      cacheKeys.getExaminationsDataKey(schoolId),
    ];

    await Promise.all(keys.map(key => cacheManager.delete(key)));
  }
}; 