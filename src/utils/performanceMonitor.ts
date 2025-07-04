import * as React from 'react';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  context?: string;
  metadata?: Record<string, unknown>;
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
  private static metrics: PerformanceMetric[] = [];
  private static isEnabled = process.env.NODE_ENV === 'development';
  private static slowQueryThreshold = 1000; // 1 second
  private static slowRenderThreshold = 100; // 100ms

  /**
   * Start timing a performance metric
   */
  static startTimer(name: string, context?: string): (metadata?: Record<string, unknown>) => void {
    if (!this.isEnabled) return () => {};

    const startTime = performance.now();
    const startTimestamp = Date.now();

    return (metadata?: Record<string, unknown>) => {
      const duration = performance.now() - startTime;
      this.recordMetric({
        name,
        duration,
        timestamp: startTimestamp,
        context,
        metadata
      });
    };
  }

  /**
   * Record a query performance metric
   */
  static recordQuery(
    queryType: QueryPerformanceMetric['queryType'],
    table: string,
    duration: number,
    rowCount?: number,
    context?: string
  ): void {
    if (!this.isEnabled) return;

    const metric: QueryPerformanceMetric = {
      name: `${queryType}_${table}`,
      duration,
      timestamp: Date.now(),
      context,
      queryType,
      table,
      rowCount
    };

    this.recordMetric(metric);

    // Log slow queries
    if (duration > this.slowQueryThreshold) {
      console.warn(`🐌 Slow query detected: ${queryType} on ${table} took ${duration.toFixed(2)}ms`, {
        rowCount,
        context
      });
    }
  }

  /**
   * Record a component render performance metric
   */
  static recordComponentRender(
    componentName: string,
    duration: number,
    renderCount: number,
    propsSize?: number
  ): void {
    if (!this.isEnabled) return;

    const metric: ComponentPerformanceMetric = {
      name: `render_${componentName}`,
      duration,
      timestamp: Date.now(),
      componentName,
      renderCount,
      propsSize
    };

    this.recordMetric(metric);

    // Log slow renders
    if (duration > this.slowRenderThreshold) {
      console.warn(`🐌 Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`, {
        renderCount,
        propsSize
      });
    }
  }

  /**
   * Record a user interaction performance metric
   */
  static recordUserInteraction(
    interactionType: UserInteractionMetric['interactionType'],
    elementId: string,
    duration: number,
    success?: boolean
  ): void {
    if (!this.isEnabled) return;

    const metric: UserInteractionMetric = {
      name: `interaction_${interactionType}_${elementId}`,
      duration,
      timestamp: Date.now(),
      interactionType,
      elementId,
      success
    };

    this.recordMetric(metric);
  }

  /**
   * Record a generic performance metric
   */
  static recordMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;

    this.metrics.push(metric);

    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance: ${metric.name} took ${metric.duration.toFixed(2)}ms`, {
        context: metric.context,
        metadata: metric.metadata
      });
    }
  }

  /**
   * Get performance statistics
   */
  static getStats(): {
    totalMetrics: number;
    averageQueryTime: number;
    averageRenderTime: number;
    slowQueries: QueryPerformanceMetric[];
    slowRenders: ComponentPerformanceMetric[];
    recentMetrics: PerformanceMetric[];
  } {
    const queryMetrics = this.metrics.filter(
      (m): m is QueryPerformanceMetric => 'queryType' in m
    );
    const renderMetrics = this.metrics.filter(
      (m): m is ComponentPerformanceMetric => 'componentName' in m
    );

    const averageQueryTime = queryMetrics.length > 0
      ? queryMetrics.reduce((sum, m) => sum + m.duration, 0) / queryMetrics.length
      : 0;

    const averageRenderTime = renderMetrics.length > 0
      ? renderMetrics.reduce((sum, m) => sum + m.duration, 0) / renderMetrics.length
      : 0;

    const slowQueries = queryMetrics.filter(m => m.duration > this.slowQueryThreshold);
    const slowRenders = renderMetrics.filter(m => m.duration > this.slowRenderThreshold);

    return {
      totalMetrics: this.metrics.length,
      averageQueryTime,
      averageRenderTime,
      slowQueries,
      slowRenders,
      recentMetrics: this.metrics.slice(-50) // Last 50 metrics
    };
  }

  /**
   * Clear all metrics
   */
  static clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Export metrics for analysis
   */
  static exportMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Enable/disable performance monitoring
   */
  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Set thresholds for slow operations
   */
  static setThresholds(slowQuery: number, slowRender: number): void {
    this.slowQueryThreshold = slowQuery;
    this.slowRenderThreshold = slowRender;
  }
}

/**
 * React Hook for measuring component performance
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCount = React.useRef(0);
  const startTime = React.useRef(performance.now());

  React.useEffect(() => {
    renderCount.current += 1;
    const duration = performance.now() - startTime.current;
    
    PerformanceMonitor.recordComponentRender(
      componentName,
      duration,
      renderCount.current
    );
    
    startTime.current = performance.now();
  });

  return {
    recordInteraction: (type: UserInteractionMetric['interactionType'], elementId: string, success?: boolean) => {
      const duration = performance.now() - startTime.current;
      PerformanceMonitor.recordUserInteraction(type, elementId, duration, success);
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
        PerformanceMonitor.recordComponentRender(displayName, 0, 0, propsSize);
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
      
      PerformanceMonitor.recordQuery(
        'select', // Default to select, can be overridden
        table || 'unknown',
        duration,
        Array.isArray(result) ? result.length : undefined,
        queryName
      );
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      PerformanceMonitor.recordQuery(
        'select',
        table || 'unknown',
        duration,
        undefined,
        `${queryName}_error`
      );
      
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
    const endTimer = PerformanceMonitor.startTimer(`api_${apiName}`, 'API Call');
    try {
      const result = await apiCall(...args);
      endTimer({ success: true } as Record<string, unknown>);
      return result;
    } catch (error) {
      endTimer({ success: false, error: error instanceof Error ? error.message : 'Unknown error' } as Record<string, unknown>);
      throw error;
    }
  };
}

export { PerformanceMonitor };
export default PerformanceMonitor;
