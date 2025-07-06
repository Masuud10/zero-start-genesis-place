export class PerformanceMonitor {
  private static metrics = new Map<string, { start: number; samples: number[] }>();

  static startTimer(operation: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
    };
  }

  private static recordMetric(operation: string, duration: number): void {
    const metric = this.metrics.get(operation) || { start: Date.now(), samples: [] };
    metric.samples.push(duration);
    
    // Keep only last 100 samples
    if (metric.samples.length > 100) {
      metric.samples.shift();
    }
    
    this.metrics.set(operation, metric);
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
    }
  }

  static getMetrics(): Record<string, { avg: number; count: number; max: number }> {
    const result: Record<string, { avg: number; count: number; max: number }> = {};
    
    for (const [operation, metric] of this.metrics.entries()) {
      const samples = metric.samples;
      result[operation] = {
        avg: samples.reduce((sum, sample) => sum + sample, 0) / samples.length,
        count: samples.length,
        max: Math.max(...samples)
      };
    }
    
    return result;
  }
}

// Image optimization utility
export class ImageOptimizer {
  static async compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob!], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
}

// Cache utility for API responses
export class CacheManager {
  private static cache: Map<string, { data: unknown; timestamp: number; ttl: number }> = new Map();

  static set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  static get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  static clear(): void {
    this.cache.clear();
  }

  static has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}
