
export class APIOptimizationUtils {
  private static requestQueues: Map<string, Promise<any>> = new Map();
  private static cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  /**
   * Deduplicates identical API requests by returning the same promise
   * if a request with the same key is already in progress
   */
  static deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    if (this.requestQueues.has(key)) {
      console.log('🔄 API: Deduplicating request for', key);
      return this.requestQueues.get(key)!;
    }

    const promise = requestFn().finally(() => {
      this.requestQueues.delete(key);
    });

    this.requestQueues.set(key, promise);
    return promise;
  }

  /**
   * Caches API responses with TTL support
   */
  static getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    console.log('📦 API: Using cached data for', key);
    return cached.data;
  }

  /**
   * Sets cached data with TTL
   */
  static setCachedData<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
    console.log('💾 API: Cached data for', key, 'TTL:', ttlMs + 'ms');
  }

  /**
   * Clears specific cache entries or all cache
   */
  static clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      console.log('🧹 API: Cleared all cache');
      return;
    }

    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    );
    
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log('🧹 API: Cleared cache for pattern', pattern, 'Keys:', keysToDelete.length);
  }

  /**
   * Batches multiple API calls and executes them in parallel
   */
  static async batchRequests<T>(requests: Array<() => Promise<T>>): Promise<T[]> {
    console.log('📦 API: Batching', requests.length, 'requests');
    return Promise.all(requests.map(req => req()));
  }

  /**
   * Delays execution to avoid overwhelming the API
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Gets cache statistics for debugging
   */
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
