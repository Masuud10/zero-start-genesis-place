
interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  operation: string;
}

export class PerformanceMonitor {
  private static metrics: Map<string, PerformanceMetrics> = new Map();

  static startTimer(operation: string): () => void {
    const startTime = performance.now();
    const id = `${operation}_${Date.now()}_${Math.random()}`;
    
    this.metrics.set(id, {
      startTime,
      operation
    });

    console.log(`⏱️ Performance: Starting ${operation}`);

    // Return end timer function
    return () => {
      const metric = this.metrics.get(id);
      if (metric) {
        const endTime = performance.now();
        const duration = endTime - metric.startTime;
        
        metric.endTime = endTime;
        metric.duration = duration;
        
        console.log(`⏱️ Performance: ${operation} completed in ${duration.toFixed(2)}ms`);
        
        // Log slow operations
        if (duration > 1000) {
          console.warn(`🐌 Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
        }
        
        // Clean up
        this.metrics.delete(id);
      }
    };
  }

  static measureApiCall<T>(operation: string, apiCall: () => Promise<T>): Promise<T> {
    const endTimer = this.startTimer(`API: ${operation}`);
    
    return apiCall()
      .then(result => {
        endTimer();
        return result;
      })
      .catch(error => {
        endTimer();
        console.error(`❌ API Error in ${operation}:`, error);
        throw error;
      });
  }

  static logMetrics() {
    console.table(Array.from(this.metrics.values()));
  }

  static clearMetrics() {
    this.metrics.clear();
  }
}
