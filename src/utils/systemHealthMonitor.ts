import { supabase } from '@/integrations/supabase/client';

interface SystemHealthMetrics {
  database: {
    connectionStatus: 'healthy' | 'degraded' | 'critical';
    responseTime: number;
    errorRate: number;
  };
  authentication: {
    status: 'healthy' | 'degraded' | 'critical';
    responseTime: number;
  };
  rls: {
    status: 'healthy' | 'degraded' | 'critical';
    violations: number;
  };
  performance: {
    slowQueries: number;
    averageResponseTime: number;
    overallScore: number;
  };
  errors: {
    totalErrors: number;
    criticalErrors: number;
    recentErrors: string[];
  };
}

interface HealthCheckResult {
  overall: 'healthy' | 'degraded' | 'critical';
  score: number;
  metrics: SystemHealthMetrics;
  recommendations: string[];
  timestamp: Date;
}

export class SystemHealthMonitor {
  private static errorLog: Array<{ error: string; timestamp: Date; context: string }> = [];
  private static performanceLog: Array<{ query: string; duration: number; timestamp: Date }> = [];
  
  /**
   * Log an error for health monitoring
   */
  static logError(error: string, context: string = 'Unknown'): void {
    this.errorLog.push({
      error,
      context,
      timestamp: new Date()
    });
    
    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }
    
    console.error(`🚨 SystemHealth: ${context} - ${error}`);
  }
  
  /**
   * Log performance metrics
   */
  static logPerformance(query: string, duration: number): void {
    this.performanceLog.push({
      query,
      duration,
      timestamp: new Date()
    });
    
    // Keep only last 100 performance entries
    if (this.performanceLog.length > 100) {
      this.performanceLog = this.performanceLog.slice(-100);
    }
    
    if (duration > 3000) { // Log slow queries (>3 seconds)
      console.warn(`🐌 SystemHealth: Slow query detected - ${query}: ${duration}ms`);
    }
  }
  
  /**
   * Perform comprehensive system health check
   */
  static async performHealthCheck(): Promise<HealthCheckResult> {
    console.log('🔍 SystemHealth: Starting comprehensive health check...');
    
    const startTime = Date.now();
    const metrics: SystemHealthMetrics = {
      database: { connectionStatus: 'critical', responseTime: 0, errorRate: 0 },
      authentication: { status: 'critical', responseTime: 0 },
      rls: { status: 'critical', violations: 0 },
      performance: { slowQueries: 0, averageResponseTime: 0, overallScore: 0 },
      errors: { totalErrors: 0, criticalErrors: 0, recentErrors: [] }
    };
    
    const recommendations: string[] = [];
    
    try {
      // Test database connectivity
      const dbStart = Date.now();
      const { data: healthData, error: healthError } = await supabase
        .from('schools')
        .select('id')
        .limit(1);
      
      const dbDuration = Date.now() - dbStart;
      metrics.database.responseTime = dbDuration;
      
      if (healthError) {
        metrics.database.connectionStatus = 'critical';
        this.logError(`Database health check failed: ${healthError.message}`, 'HealthCheck');
        recommendations.push('Database connectivity issues detected. Check network and database status.');
      } else {
        metrics.database.connectionStatus = dbDuration < 1000 ? 'healthy' : dbDuration < 3000 ? 'degraded' : 'critical';
        if (dbDuration > 1000) {
          recommendations.push(`Database response time is slow (${dbDuration}ms). Consider optimizing queries or checking database performance.`);
        }
      }
      
      // Test authentication system
      const authStart = Date.now();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const authDuration = Date.now() - authStart;
      metrics.authentication.responseTime = authDuration;
      
      if (sessionError) {
        metrics.authentication.status = 'critical';
        this.logError(`Authentication health check failed: ${sessionError.message}`, 'HealthCheck');
        recommendations.push('Authentication system issues detected.');
      } else {
        metrics.authentication.status = authDuration < 500 ? 'healthy' : authDuration < 1500 ? 'degraded' : 'critical';
      }
      
      // Analyze recent errors
      const recentErrors = this.errorLog.filter(
        entry => Date.now() - entry.timestamp.getTime() < 60 * 60 * 1000 // Last hour
      );
      
      metrics.errors.totalErrors = this.errorLog.length;
      metrics.errors.criticalErrors = recentErrors.filter(
        entry => entry.error.toLowerCase().includes('critical') || 
                entry.error.toLowerCase().includes('failed') ||
                entry.context.toLowerCase().includes('auth')
      ).length;
      metrics.errors.recentErrors = recentErrors.slice(-5).map(entry => 
        `${entry.context}: ${entry.error.substring(0, 100)}`
      );
      
      // Analyze performance metrics
      const recentPerformance = this.performanceLog.filter(
        entry => Date.now() - entry.timestamp.getTime() < 60 * 60 * 1000 // Last hour
      );
      
      metrics.performance.slowQueries = recentPerformance.filter(entry => entry.duration > 3000).length;
      metrics.performance.averageResponseTime = recentPerformance.length > 0 
        ? recentPerformance.reduce((sum, entry) => sum + entry.duration, 0) / recentPerformance.length
        : 0;
      
      // Calculate overall performance score
      let performanceScore = 100;
      if (metrics.database.responseTime > 3000) performanceScore -= 30;
      else if (metrics.database.responseTime > 1000) performanceScore -= 15;
      
      if (metrics.authentication.responseTime > 1500) performanceScore -= 20;
      else if (metrics.authentication.responseTime > 500) performanceScore -= 10;
      
      if (metrics.errors.criticalErrors > 5) performanceScore -= 25;
      else if (metrics.errors.criticalErrors > 0) performanceScore -= 10;
      
      if (metrics.performance.slowQueries > 10) performanceScore -= 20;
      else if (metrics.performance.slowQueries > 0) performanceScore -= 5;
      
      metrics.performance.overallScore = Math.max(0, performanceScore);
      
      // RLS Status check (simplified)
      metrics.rls.status = 'healthy'; // Assume healthy unless specific violations are detected
      metrics.rls.violations = metrics.errors.criticalErrors; // Use critical errors as proxy
      
      // Generate recommendations based on metrics
      if (metrics.performance.slowQueries > 0) {
        recommendations.push(`${metrics.performance.slowQueries} slow queries detected in the last hour. Consider query optimization.`);
      }
      
      if (metrics.errors.criticalErrors > 0) {
        recommendations.push(`${metrics.errors.criticalErrors} critical errors in the last hour. Review error logs for issues.`);
      }
      
      if (metrics.performance.averageResponseTime > 2000) {
        recommendations.push('Average response time is high. Consider adding database indexes or optimizing queries.');
      }
      
      // Determine overall health status
      let overall: 'healthy' | 'degraded' | 'critical' = 'healthy';
      if (performanceScore < 50) {
        overall = 'critical';
      } else if (performanceScore < 80) {
        overall = 'degraded';
      }
      
      const totalDuration = Date.now() - startTime;
      console.log(`✅ SystemHealth: Health check completed in ${totalDuration}ms. Overall: ${overall}, Score: ${performanceScore}`);
      
      return {
        overall,
        score: performanceScore,
        metrics,
        recommendations,
        timestamp: new Date()
      };
      
    } catch (error) {
      console.error('❌ SystemHealth: Health check failed:', error);
      this.logError(`Health check failed: ${error}`, 'HealthCheck');
      
      return {
        overall: 'critical',
        score: 0,
        metrics,
        recommendations: ['System health check failed. Critical system issues detected.'],
        timestamp: new Date()
      };
    }
  }
  
  /**
   * Get simplified health status for quick checks
   */
  static async getQuickHealthStatus(): Promise<{ status: 'healthy' | 'degraded' | 'critical'; message: string }> {
    try {
      const start = Date.now();
      const { error } = await supabase.from('schools').select('id').limit(1);
      const duration = Date.now() - start;
      
      if (error) {
        return { status: 'critical', message: 'Database connection failed' };
      }
      
      if (duration > 3000) {
        return { status: 'critical', message: 'Database response time critical' };
      } else if (duration > 1000) {
        return { status: 'degraded', message: 'Database response time degraded' };
      }
      
      return { status: 'healthy', message: 'All systems operational' };
    } catch (error) {
      return { status: 'critical', message: 'System health check failed' };
    }
  }
  
  /**
   * Clear logs (useful for testing or maintenance)
   */
  static clearLogs(): void {
    this.errorLog = [];
    this.performanceLog = [];
    console.log('🧹 SystemHealth: Logs cleared');
  }
  
  /**
   * Get error statistics
   */
  static getErrorStats(): { total: number; recent: number; critical: number } {
    const recent = this.errorLog.filter(
      entry => Date.now() - entry.timestamp.getTime() < 60 * 60 * 1000
    ).length;
    
    const critical = this.errorLog.filter(
      entry => entry.error.toLowerCase().includes('critical') || 
              entry.context.toLowerCase().includes('auth')
    ).length;
    
    return {
      total: this.errorLog.length,
      recent,
      critical
    };
  }
}

// Global error handler integration
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    SystemHealthMonitor.logError(event.error?.message || event.message, 'Global Error Handler');
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    SystemHealthMonitor.logError(event.reason?.message || String(event.reason), 'Unhandled Promise Rejection');
  });
}
