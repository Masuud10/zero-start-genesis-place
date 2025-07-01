
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useUserManagementStats = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-management-stats'],
    queryFn: async () => {
      if (!user || user.role !== 'edufam_admin') {
        throw new Error('Access denied');
      }

      // Get total users
      const { data: totalUsers, error: totalUsersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      if (totalUsersError) throw totalUsersError;

      // Get active users (users who have logged in recently)
      const { data: activeUsers, error: activeUsersError } = await supabase
        .from('user_login_details')
        .select('user_id', { count: 'exact' })
        .not('last_login', 'is', null)
        .gte('last_login', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (activeUsersError) throw activeUsersError;

      // Get recent signups (last 30 days)
      const { data: recentSignups, error: recentSignupsError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (recentSignupsError) throw recentSignupsError;

      // Get users by role
      const { data: usersByRole, error: usersByRoleError } = await supabase
        .from('profiles')
        .select('role');

      if (usersByRoleError) throw usersByRoleError;

      const roleCount = usersByRole?.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        total_users: totalUsers?.length || 0,
        active_users: activeUsers?.length || 0,
        recent_signups: recentSignups?.length || 0,
        users_by_role: roleCount
      };
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSecuritySettings = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['security-settings'],
    queryFn: async () => {
      if (!user || user.role !== 'edufam_admin') {
        throw new Error('Access denied');
      }

      // Get audit events count
      const { data: auditEvents, error: auditError } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (auditError) throw auditError;

      // Get failed login attempts
      const { data: failedLogins, error: failedLoginsError } = await supabase
        .from('user_login_details')
        .select('login_attempts', { count: 'exact' })
        .gt('login_attempts', 0);

      if (failedLoginsError) throw failedLoginsError;

      // Get rate limits
      const { data: rateLimits, error: rateLimitsError } = await supabase
        .from('rate_limits')
        .select('id')
        .not('blocked_until', 'is', null)
        .gt('blocked_until', new Date().toISOString());

      if (rateLimitsError) throw rateLimitsError;

      return {
        total_audit_events: auditEvents?.length || 0,
        security_incidents: 0, // This would need to be calculated based on specific criteria
        failed_login_attempts: failedLogins?.reduce((sum, user) => sum + (user.login_attempts || 0), 0) || 0,
        active_rate_limits: rateLimits || [],
        recent_audit_logs: auditEvents || []
      };
    },
    enabled: user?.role === 'edufam_admin',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSystemMaintenance = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (action: string) => {
      if (action === 'toggle_maintenance') {
        // Get current maintenance mode
        const { data: currentSetting, error: getError } = await supabase
          .from('system_settings')
          .select('setting_value')
          .eq('setting_key', 'maintenance_mode')
          .single();

        if (getError && getError.code !== 'PGRST116') throw getError;

        const currentMode = currentSetting?.setting_value && 
          typeof currentSetting.setting_value === 'object' && 
          currentSetting.setting_value !== null ?
          (currentSetting.setting_value as any).enabled || false : false;
        
        const newMode = !currentMode;

        const { error: updateError } = await supabase
          .from('system_settings')
          .upsert({
            setting_key: 'maintenance_mode',
            setting_value: { enabled: newMode, message: 'System is under maintenance. Please try again later.' },
            updated_at: new Date().toISOString(),
            updated_by: (await supabase.auth.getUser()).data.user?.id
          }, {
            onConflict: 'setting_key'
          });

        if (updateError) throw updateError;

        return { success: true, maintenance_mode: newMode };
      }
      
      throw new Error('Unknown action');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Operation failed",
        variant: "destructive"
      });
    }
  });
};
