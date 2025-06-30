
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useUserManagementStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-management-stats'],
    queryFn: async () => {
      console.log('🔄 Fetching user management statistics...');
      
      try {
        // Fetch user counts and stats
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('role, created_at, last_login_at, status');

        if (usersError) throw usersError;

        // Calculate statistics
        const totalUsers = users?.length || 0;
        const activeUsers = users?.filter(u => u.status === 'active').length || 0;
        const recentSignups = users?.filter(u => {
          const createdAt = new Date(u.created_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return createdAt >= thirtyDaysAgo;
        }).length || 0;

        // Group users by role
        const usersByRole = users?.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        return {
          total_users: totalUsers,
          active_users: activeUsers,
          recent_signups: recentSignups,
          users_by_role: usersByRole
        };
      } catch (error) {
        console.error('❌ Error fetching user management stats:', error);
        throw error;
      }
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
};

export const useSecuritySettings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['security-settings'],
    queryFn: async () => {
      console.log('🔄 Fetching security settings...');
      
      try {
        // Fetch security audit logs
        const { data: auditLogs, error: auditError } = await supabase
          .from('security_audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (auditError) throw auditError;

        // Calculate security metrics
        const totalAuditEvents = auditLogs?.length || 0;
        const securityIncidents = auditLogs?.filter(log => !log.success).length || 0;
        const failedLoginAttempts = auditLogs?.filter(log => 
          log.action === 'login' && !log.success
        ).length || 0;

        return {
          total_audit_events: totalAuditEvents,
          security_incidents: securityIncidents,
          failed_login_attempts: failedLoginAttempts,
          recent_audit_logs: auditLogs?.slice(0, 10) || []
        };
      } catch (error) {
        console.error('❌ Error fetching security settings:', error);
        throw error;
      }
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
};

export const useSystemMaintenance = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (action: string) => {
      console.log('🔄 Performing maintenance action:', action);
      
      try {
        // Simulate maintenance operations
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In a real implementation, this would call actual maintenance functions
        console.log('✅ Maintenance action completed:', action);
        
        return { success: true, action };
      } catch (error) {
        console.error('❌ Maintenance action failed:', error);
        throw error;
      }
    }
  });
};
