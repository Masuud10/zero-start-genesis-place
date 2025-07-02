import { supabase } from '@/integrations/supabase/client';

export class DatabasePerformance {
  private static queryTimes = new Map<string, number[]>();
  private static slowQueryThreshold = 2000; // 2 seconds

  static startTimer(queryName: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Track query performance
      if (!this.queryTimes.has(queryName)) {
        this.queryTimes.set(queryName, []);
      }
      
      const times = this.queryTimes.get(queryName)!;
      times.push(duration);
      
      // Keep only last 10 executions
      if (times.length > 10) {
        times.shift();
      }
      
      // Log slow queries
      if (duration > this.slowQueryThreshold) {
        console.warn(`🐌 Slow Query Detected: ${queryName} took ${duration}ms`);
        this.logSlowQuery(queryName, duration);
      }
      
      console.log(`⚡ Query Performance: ${queryName} - ${duration}ms`);
    };
  }

  static async logSlowQuery(queryName: string, duration: number) {
    try {
      // Don't block the main thread with logging
      setTimeout(async () => {
        const { error } = await supabase
          .from('security_audit_logs')
          .insert({
            action: 'slow_query',
            resource: 'database',
            success: true,
            metadata: {
              query_name: queryName,
              duration_ms: duration,
              threshold_ms: this.slowQueryThreshold
            }
          });
        
        if (error) {
          console.warn('Failed to log slow query:', error);
        }
      }, 0);
    } catch (err) {
      console.warn('Failed to log slow query:', err);
    }
  }

  static getAverageTime(queryName: string): number {
    const times = this.queryTimes.get(queryName);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  static getSlowQueries(): Array<{ name: string; avgTime: number; executions: number }> {
    const slowQueries: Array<{ name: string; avgTime: number; executions: number }> = [];
    
    this.queryTimes.forEach((times, name) => {
      const avgTime = this.getAverageTime(name);
      if (avgTime > this.slowQueryThreshold / 2) { // Half threshold for reporting
        slowQueries.push({
          name,
          avgTime,
          executions: times.length
        });
      }
    });
    
    return slowQueries.sort((a, b) => b.avgTime - a.avgTime);
  }

  // Optimize common queries with proper indexes
  static async optimizeCommonQueries() {
    try {
      // This would typically be handled in migrations, but we can suggest optimizations
      const optimizations = [
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_grades_student_school ON grades(student_id, school_id);',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fees_student_status ON fees(student_id, status);',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_school_role ON profiles(school_id, role);',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_school_active ON students(school_id, is_active);'
      ];
      
      console.log('📊 Database Performance: Suggested optimizations:', optimizations);
      return optimizations;
    } catch (error) {
      console.error('Failed to suggest optimizations:', error);
      return [];
    }
  }
}

// Helper function to wrap queries with performance monitoring
export function withPerformanceMonitoring<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const endTimer = DatabasePerformance.startTimer(queryName);
  
  return queryFn()
    .finally(endTimer)
    .catch(error => {
      console.error(`❌ Query Failed: ${queryName}`, error);
      throw error;
    });
}
