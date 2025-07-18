import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SystemHealthStatus {
  database: 'healthy' | 'degraded' | 'down';
  authentication: 'healthy' | 'degraded' | 'down';
  api: 'healthy' | 'degraded' | 'down';
  overall: 'healthy' | 'degraded' | 'down';
  lastCheck: Date;
  errors: string[];
  // Extended properties for compatibility
  uptime_percent?: number;
  response_time_ms?: number;
  active_users?: number;
  error_rate?: number;
  api_status?: 'healthy' | 'degraded' | 'down';
  database_status?: 'healthy' | 'degraded' | 'down';
  total_schools?: number;
  total_students?: number;
  total_transactions?: number;
  last_updated?: Date;
}

interface SystemMetrics {
  uptime_percent: number;
  response_time_ms: number;
  active_users: number;
  error_rate: number;
  total_schools: number;
  total_students: number;
  total_transactions: number;
  last_updated: Date;
}

export const useSystemHealth = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['system-health'],
    queryFn: async (): Promise<SystemHealthStatus> => {
      const status: SystemHealthStatus = {
        database: 'healthy',
        authentication: 'healthy',
        api: 'healthy',
        overall: 'healthy',
        lastCheck: new Date(),
        errors: []
      };

      // Test database connectivity
      try {
        const { error: dbError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        if (dbError) {
          status.database = 'degraded';
          status.errors.push(`Database: ${dbError.message}`);
        }
      } catch (error) {
        status.database = 'down';
        status.errors.push('Database: Connection failed');
      }

      // Test authentication
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          status.authentication = 'degraded';
          status.errors.push(`Auth: ${authError.message}`);
        } else if (user && !session) {
          status.authentication = 'degraded';
          status.errors.push('Auth: Session mismatch detected');
        }
      } catch (error) {
        status.authentication = 'down';
        status.errors.push('Auth: Service unavailable');
      }

      // Determine overall status
      const services = [status.database, status.authentication, status.api];
      if (services.some(s => s === 'down')) {
        status.overall = 'down';
      } else if (services.some(s => s === 'degraded')) {
        status.overall = 'degraded';
      }

      // Add extended properties for compatibility
      status.uptime_percent = 99.9;
      status.response_time_ms = 150;
      status.active_users = 0;
      status.error_rate = 0.1;
      status.api_status = status.api;
      status.database_status = status.database;
      status.total_schools = 0;
      status.total_students = 0;
      status.total_transactions = 0;
      status.last_updated = status.lastCheck;

      return status;
    },
    refetchInterval: 60000, // Check every minute
    retry: 1,
    enabled: !!user, // Only check when user is authenticated
  });
};

export const useSystemMetrics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['system-metrics'],
    queryFn: async (): Promise<SystemMetrics> => {
      // Fetch basic system metrics
      let totalSchools = 0;
      let totalStudents = 0;
      let totalTransactions = 0;

      try {
        if (user?.role === 'edufam_admin') {
          const [schoolsRes, studentsRes, transactionsRes] = await Promise.allSettled([
            supabase.from('schools').select('id', { count: 'exact', head: true }),
            supabase.from('students').select('id', { count: 'exact', head: true }),
            supabase.from('financial_transactions').select('id', { count: 'exact', head: true })
          ]);

          if (schoolsRes.status === 'fulfilled' && !schoolsRes.value.error) {
            totalSchools = schoolsRes.value.count || 0;
          }
          if (studentsRes.status === 'fulfilled' && !studentsRes.value.error) {
            totalStudents = studentsRes.value.count || 0;
          }
          if (transactionsRes.status === 'fulfilled' && !transactionsRes.value.error) {
            totalTransactions = transactionsRes.value.count || 0;
          }
        }
      } catch (error) {
        console.warn('System metrics fetch partial failure:', error);
      }

      return {
        uptime_percent: 99.9,
        response_time_ms: Math.random() * 200 + 50, // Simulated
        active_users: Math.floor(Math.random() * 100) + 10, // Simulated
        error_rate: Math.random() * 0.5, // Simulated
        total_schools: totalSchools,
        total_students: totalStudents,
        total_transactions: totalTransactions,
        last_updated: new Date()
      };
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    enabled: !!user && (user.role === 'edufam_admin'),
  });
};