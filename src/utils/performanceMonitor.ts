import * as React from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  context?: Record<string, unknown>;
}

interface PerformanceThreshold {
  name: string;
  warning: number;
  critical: number;
  unit: string;
}

interface QueryPerformanceMetric extends PerformanceMetric {
  queryType: 'select' | 'insert' | 'update' | 'delete' | 'rpc';
  table?: string;
  rowCount?: number;
}

interface ComponentPerformanceMetric extends PerformanceMetric {
  componentName: string;
  renderCount: number;
  propsSize?: number;
}

interface UserInteractionMetric extends PerformanceMetric {
  interactionType: 'click' | 'input' | 'navigation' | 'form_submit';
  elementId?: string;
  success?: boolean;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private thresholds: Map<string, PerformanceThreshold> = new Map();
  private observers: Set<(metric: PerformanceMetric) => void> = new Set();
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeThresholds();
    this.startMonitoring();
  }

  private initializeThresholds(): void {
    // Page load performance thresholds
    this.thresholds.set('pageLoadTime', {
      name: 'Page Load Time',
      warning: 2000, // 2 seconds
      critical: 5000, // 5 seconds
      unit: 'ms'
    });

    // API response time thresholds
    this.thresholds.set('apiResponseTime', {
      name: 'API Response Time',
      warning: 1000, // 1 second
      critical: 3000, // 3 seconds
      unit: 'ms'
    });

    // Memory usage thresholds
    this.thresholds.set('memoryUsage', {
      name: 'Memory Usage',
      warning: 50 * 1024 * 1024, // 50MB
      critical: 100 * 1024 * 1024, // 100MB
      unit: 'bytes'
    });

    // Bundle size thresholds
    this.thresholds.set('bundleSize', {
      name: 'Bundle Size',
      warning: 2 * 1024 * 1024, // 2MB
      critical: 5 * 1024 * 1024, // 5MB
      unit: 'bytes'
    });

    // Cache hit rate thresholds
    this.thresholds.set('cacheHitRate', {
      name: 'Cache Hit Rate',
      warning: 0.7, // 70%
      critical: 0.5, // 50%
      unit: 'percentage'
    });
  }

  // Start monitoring
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('🚀 Performance monitoring started');

    // Monitor page load times
    this.monitorPageLoadTimes();

    // Monitor API performance
    this.monitorAPIPerformance();

    // Monitor memory usage
    this.monitorMemoryUsage();

    // Monitor bundle performance
    this.monitorBundlePerformance();

    // Monitor cache performance
    this.monitorCachePerformance();

    // Monitor user interactions
    this.monitorUserInteractions();

    // Monitor errors
    this.monitorErrors();
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('🛑 Performance monitoring stopped');
  }

  // Monitor page load times
  private monitorPageLoadTimes(): void {
    if (typeof window === 'undefined') return;

    // Monitor initial page load
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      this.recordMetric('pageLoadTime', loadTime, 'ms', {
        type: 'initial',
        url: window.location.href
      });
    });

    // Monitor navigation timing
    if ('navigation' in performance) {
      const navigation = (performance as any).navigation;
      if (navigation) {
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        this.recordMetric('domContentLoaded', domContentLoaded, 'ms');
      }
    }
  }

  // Monitor API performance
  private monitorAPIPerformance(): void {
    if (typeof window === 'undefined') return;

    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        this.recordMetric('apiResponseTime', duration, 'ms', {
          url,
          method: args[1]?.method || 'GET',
          status: response.status,
          success: response.ok
        });

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        this.recordMetric('apiResponseTime', duration, 'ms', {
          url,
          method: args[1]?.method || 'GET',
          error: true,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });

        throw error;
      }
    };
  }

  // Monitor memory usage
  private monitorMemoryUsage(): void {
    if (typeof window === 'undefined' || !('memory' in performance)) return;

    this.monitoringInterval = setInterval(() => {
      const memory = (performance as any).memory;
      if (memory) {
        this.recordMetric('memoryUsage', memory.usedJSHeapSize, 'bytes', {
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        });
      }
    }, 30000); // Every 30 seconds
  }

  // Monitor bundle performance
  private monitorBundlePerformance(): void {
    if (typeof window === 'undefined') return;

    // Monitor script loading times
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src) {
        const startTime = performance.now();
        script.addEventListener('load', () => {
          const endTime = performance.now();
          const duration = endTime - startTime;
          this.recordMetric('scriptLoadTime', duration, 'ms', { src });
        });
      }
    });
  }

  // Monitor cache performance
  private monitorCachePerformance(): void {
    // This would integrate with the cache manager
    // For now, we'll create a placeholder
    setInterval(() => {
      // Simulate cache hit rate monitoring
      const hitRate = Math.random() * 0.3 + 0.7; // 70-100%
      this.recordMetric('cacheHitRate', hitRate, 'percentage');
    }, 60000); // Every minute
  }

  // Monitor user interactions
  private monitorUserInteractions(): void {
    if (typeof window === 'undefined') return;

    let interactionCount = 0;
    const interactionEvents = ['click', 'input', 'scroll', 'keydown'];

    interactionEvents.forEach(eventType => {
      window.addEventListener(eventType, () => {
        interactionCount++;
        this.recordMetric('userInteractions', interactionCount, 'count', {
          eventType,
          timestamp: Date.now()
        });
      }, { passive: true });
    });
  }

  // Monitor errors
  private monitorErrors(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.recordMetric('errorCount', 1, 'count', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordMetric('unhandledRejectionCount', 1, 'count', {
        reason: event.reason,
        promise: event.promise
      });
    });
  }

  // Record a performance metric
  recordMetric(
    name: string,
    value: number,
    unit: string,
    context?: Record<string, unknown>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      context
    };

    this.metrics.push(metric);

    // Check thresholds
    this.checkThresholds(metric);

    // Notify observers
    this.observers.forEach(observer => observer(metric));

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance Metric: ${name} = ${value}${unit}`, context);
    }
  }

  // Check if metric exceeds thresholds
  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds.get(metric.name);
    if (!threshold) return;

    if (metric.value >= threshold.critical) {
      console.error(`🚨 CRITICAL: ${threshold.name} exceeded critical threshold: ${metric.value}${metric.unit} (threshold: ${threshold.critical}${threshold.unit})`);
      this.notifyThresholdExceeded(metric, 'critical', threshold);
    } else if (metric.value >= threshold.warning) {
      console.warn(`⚠️ WARNING: ${threshold.name} exceeded warning threshold: ${metric.value}${metric.unit} (threshold: ${threshold.warning}${threshold.unit})`);
      this.notifyThresholdExceeded(metric, 'warning', threshold);
    }
  }

  // Notify when threshold is exceeded
  private notifyThresholdExceeded(
    metric: PerformanceMetric,
    level: 'warning' | 'critical',
    threshold: PerformanceThreshold
  ): void {
    // Send to monitoring service (e.g., Sentry, LogRocket, etc.)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_threshold_exceeded', {
        metric_name: metric.name,
        metric_value: metric.value,
        threshold_level: level,
        threshold_value: level === 'warning' ? threshold.warning : threshold.critical
      });
    }
  }

  // Get metrics for a specific time range
  getMetrics(
    name?: string,
    startTime?: number,
    endTime?: number
  ): PerformanceMetric[] {
    let filtered = this.metrics;

    if (name) {
      filtered = filtered.filter(m => m.name === name);
    }

    if (startTime) {
      filtered = filtered.filter(m => m.timestamp >= startTime);
    }

    if (endTime) {
      filtered = filtered.filter(m => m.timestamp <= endTime);
    }

    return filtered;
  }

  // Get average metric value
  getAverageMetric(name: string, timeRange?: number): number {
    const now = Date.now();
    const startTime = timeRange ? now - timeRange : 0;
    const metrics = this.getMetrics(name, startTime, now);

    if (metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  // Subscribe to metric updates
  subscribe(observer: (metric: PerformanceMetric) => void): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  // Get performance report
  getPerformanceReport(): Record<string, unknown> {
    const now = Date.now();
    const lastHour = now - 60 * 60 * 1000;
    const lastDay = now - 24 * 60 * 60 * 1000;

    return {
      timestamp: now,
      metrics: {
        pageLoadTime: {
          current: this.getAverageMetric('pageLoadTime', 60000), // Last minute
          lastHour: this.getAverageMetric('pageLoadTime', lastHour),
          lastDay: this.getAverageMetric('pageLoadTime', lastDay)
        },
        apiResponseTime: {
          current: this.getAverageMetric('apiResponseTime', 60000),
          lastHour: this.getAverageMetric('apiResponseTime', lastHour),
          lastDay: this.getAverageMetric('apiResponseTime', lastDay)
        },
        memoryUsage: {
          current: this.getAverageMetric('memoryUsage', 60000),
          lastHour: this.getAverageMetric('memoryUsage', lastHour),
          lastDay: this.getAverageMetric('memoryUsage', lastDay)
        },
        errorCount: {
          lastHour: this.getMetrics('errorCount', lastHour).length,
          lastDay: this.getMetrics('errorCount', lastDay).length
        },
        userInteractions: {
          lastHour: this.getMetrics('userInteractions', lastHour).length,
          lastDay: this.getMetrics('userInteractions', lastDay).length
        }
      },
      thresholds: Object.fromEntries(this.thresholds),
      totalMetrics: this.metrics.length
    };
  }

  // Export metrics for external monitoring
  exportMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = [];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export types
export type { PerformanceMetric, PerformanceThreshold };

// Export utility functions
export const performanceUtils = {
  // Measure function execution time
  async measureExecutionTime<T>(
    name: string,
    fn: () => Promise<T> | T
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await fn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      performanceMonitor.recordMetric('functionExecutionTime', duration, 'ms', {
        functionName: name,
        success: true
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      performanceMonitor.recordMetric('functionExecutionTime', duration, 'ms', {
        functionName: name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  },

  // Measure component render time
  measureRenderTime(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      performanceMonitor.recordMetric('componentRenderTime', duration, 'ms', {
        componentName
      });
    };
  },

  // Get performance insights
  getInsights(): Record<string, unknown> {
    const report = performanceMonitor.getPerformanceReport();
    
    return {
      isHealthy: true, // This would be calculated based on thresholds
      recommendations: [
        // This would be generated based on performance patterns
        'Consider implementing code splitting for better initial load times',
        'Monitor API response times during peak usage',
        'Implement caching strategies for frequently accessed data'
      ],
      report
    };
  }
};

/**
 * React Hook for measuring component performance
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCount = React.useRef(0);
  const startTime = React.useRef(performance.now());

  React.useEffect(() => {
    renderCount.current += 1;
    const duration = performance.now() - startTime.current;
    
    performanceMonitor.recordMetric('componentRenderTime', duration, 'ms', {
      componentName
    });
    
    startTime.current = performance.now();
  });

  return {
    recordInteraction: (type: UserInteractionMetric['interactionType'], elementId: string, success?: boolean) => {
      const duration = performance.now() - startTime.current;
      performanceMonitor.recordMetric('userInteractions', 1, 'count', {
        eventType: type,
        elementId,
        timestamp: Date.now()
      });
    }
  };
}

/**
 * Higher-order component for automatic performance monitoring
 */
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const PerformanceWrappedComponent: React.FC<P> = (props) => {
    const { recordInteraction } = usePerformanceMonitor(displayName);
    // Monitor prop changes
    const prevProps = React.useRef<P>();
    React.useEffect(() => {
      if (prevProps.current) {
        const propsSize = JSON.stringify(props).length;
        performanceMonitor.recordMetric('componentRenderTime', 0, 'ms', {
          componentName: displayName,
          propsSize
        });
      }
      prevProps.current = props;
    });
    return React.createElement(WrappedComponent, props);
  };

  PerformanceWrappedComponent.displayName = `withPerformanceMonitoring(${displayName})`;
  return PerformanceWrappedComponent;
}

/**
 * Query performance wrapper
 */
export function withQueryPerformance<T extends unknown[], R>(
  queryFn: (...args: T) => Promise<R>,
  queryName: string,
  table?: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();
    
    try {
      const result = await queryFn(...args);
      const duration = performance.now() - startTime;
      
      performanceMonitor.recordMetric('apiResponseTime', duration, 'ms', {
        url: table || 'unknown',
        method: 'GET',
        status: 200,
        success: true
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      performanceMonitor.recordMetric('apiResponseTime', duration, 'ms', {
        url: table || 'unknown',
        method: 'GET',
        status: 500,
        error: true,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  };
}

/**
 * API call performance wrapper
 */
export function withApiPerformance<T extends unknown[], R>(
  apiCall: (...args: T) => Promise<R>,
  apiName: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall(...args);
      const duration = performance.now() - startTime;
      
      performanceMonitor.recordMetric('apiResponseTime', duration, 'ms', {
        url: 'API Call',
        method: 'GET',
        status: 200,
        success: true
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      performanceMonitor.recordMetric('apiResponseTime', duration, 'ms', {
        url: 'API Call',
        method: 'GET',
        status: 500,
        error: true,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  };
}
