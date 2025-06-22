
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useHealthCheck = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['health-check', user?.id],
    queryFn: async () => {
      const checks = {
        database: { status: 'unknown', message: '', timestamp: new Date() },
        authentication: { status: 'unknown', message: '', timestamp: new Date() },
        permissions: { status: 'unknown', message: '', timestamp: new Date() },
        overall: { status: 'unknown', message: '', timestamp: new Date() }
      };

      // Database connectivity check
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (error) {
          checks.database = {
            status: 'error',
            message: `Database error: ${error.message}`,
            timestamp: new Date()
          };
        } else {
          checks.database = {
            status: 'healthy',
            message: 'Database connection successful',
            timestamp: new Date()
          };
        }
      } catch (err: any) {
        checks.database = {
          status: 'error',
          message: `Database connection failed: ${err.message}`,
          timestamp: new Date()
        };
      }

      // Authentication check
      if (!user) {
        checks.authentication = {
          status: 'error',
          message: 'User not authenticated',
          timestamp: new Date()
        };
      } else if (!user.role) {
        checks.authentication = {
          status: 'warning',
          message: 'User role not assigned',
          timestamp: new Date()
        };
      } else {
        checks.authentication = {
          status: 'healthy',
          message: `Authenticated as ${user.role}`,
          timestamp: new Date()
        };
      }

      // Permissions check
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, role, school_id')
            .eq('id', user.id)
            .single();

          if (error) {
            checks.permissions = {
              status: 'error',
              message: `Permission error: ${error.message}`,
              timestamp: new Date()
            };
          } else if (data) {
            checks.permissions = {
              status: 'healthy',
              message: 'User permissions verified',
              timestamp: new Date()
            };
          }
        } catch (err: any) {
          checks.permissions = {
            status: 'error',
            message: `Permission check failed: ${err.message}`,
            timestamp: new Date()
          };
        }
      }

      // Overall health
      const hasErrors = Object.values(checks).some(check => check.status === 'error');
      const hasWarnings = Object.values(checks).some(check => check.status === 'warning');

      if (hasErrors) {
        checks.overall = {
          status: 'error',
          message: 'System has critical issues',
          timestamp: new Date()
        };
      } else if (hasWarnings) {
        checks.overall = {
          status: 'warning',
          message: 'System has warnings',
          timestamp: new Date()
        };
      } else {
        checks.overall = {
          status: 'healthy',
          message: 'All systems operational',
          timestamp: new Date()
        };
      }

      return checks;
    },
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 15000, // Consider stale after 15 seconds
    enabled: true // Always run health checks
  });
};
