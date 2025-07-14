import * as React from 'react';

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

class PerformanceMonitor {
  private static metrics: PerformanceMetric[] = [];
  private static slowQueryThreshold = 2000; // 2 seconds
  private static maxMetrics = 100; // Keep only last 100 metrics

  static startTimer(operation: string): (error?: string) => void {
    const startTime = performance.now();
    
    return (error?: string) => {
      const duration = performance.now() - startTime;
      const metric: PerformanceMetric = {
        operation,
        duration,
        timestamp: Date.now(),
        success: !error,
        error
      };

      this.metrics.push(metric);
      
      // Keep only last maxMetrics
      if (this.metrics.length > this.maxMetrics) {
        this.metrics = this.metrics.slice(-this.maxMetrics);
      }

      // Log slow queries
      if (duration > this.slowQueryThreshold) {
        console.warn(`🐌 Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
        if (error) {
          console.error(`🐌 Error in slow operation: ${error}`);
        }
      }

      // Log all operations for debugging
      console.log(`⏱️ ${operation}: ${duration.toFixed(2)}ms`);
    };
  }

  static getSlowQueries(): PerformanceMetric[] {
    return this.metrics.filter(m => m.duration > this.slowQueryThreshold);
  }

  static getAverageTime(operation?: string): number {
    const relevantMetrics = operation 
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics;
    
    if (relevantMetrics.length === 0) return 0;
    
    const totalTime = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
    return totalTime / relevantMetrics.length;
  }

  static getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  static clear(): void {
    this.metrics = [];
  }

  static getSummary(): {
    totalOperations: number;
    slowOperations: number;
    averageTime: number;
    slowestOperation: PerformanceMetric | null;
  } {
    const slowQueries = this.getSlowQueries();
    const averageTime = this.getAverageTime();
    const slowestOperation = this.metrics.length > 0 
      ? this.metrics.reduce((slowest, current) => 
          current.duration > slowest.duration ? current : slowest
        )
      : null;

    return {
      totalOperations: this.metrics.length,
      slowOperations: slowQueries.length,
      averageTime,
      slowestOperation
    };
  }
}

// Wrapper for async operations
export const withPerformanceMonitoring = async <T>(
  operation: string,
  asyncFn: () => Promise<T>
): Promise<T> => {
  const endTimer = PerformanceMonitor.startTimer(operation);
  
  try {
    const result = await asyncFn();
    endTimer();
    return result;
  } catch (error) {
    endTimer(error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

// Wrapper for Supabase queries
export const monitorSupabaseQuery = async <T>(
  operation: string,
  query: Promise<{ data: T; error: Error | null }>
): Promise<{ data: T; error: Error | null }> => {
  const endTimer = PerformanceMonitor.startTimer(operation);
  
  try {
    const result = await query;
    if (result.error) {
      endTimer(result.error.message);
    } else {
      endTimer();
    }
    return result;
  } catch (error) {
    endTimer(error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

export { PerformanceMonitor };
