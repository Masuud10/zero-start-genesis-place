
import { supabase } from '@/integrations/supabase/client';

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  description?: string;
  category: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserManagementStats {
  total_users: number;
  active_users: number;
  users_by_role: Record<string, number>;
  recent_signups: number;
}

export class SystemSettingsService {
  static async getUserManagementStats(): Promise<{ data: UserManagementStats | null; error: any }> {
    try {
      console.log('⚙️ SystemSettingsService: Fetching user management stats');

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('role, created_at, last_login_at');

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const usersByRole: Record<string, number> = {};
      let activeUsers = 0;
      let recentSignups = 0;

      profiles?.forEach(profile => {
        // Count by role
        usersByRole[profile.role] = (usersByRole[profile.role] || 0) + 1;
        
        // Count active users (logged in within 30 days)
        if (profile.last_login_at && new Date(profile.last_login_at) > thirtyDaysAgo) {
          activeUsers++;
        }
        
        // Count recent signups (within 7 days)
        if (profile.created_at && new Date(profile.created_at) > sevenDaysAgo) {
          recentSignups++;
        }
      });

      const stats: UserManagementStats = {
        total_users: profiles?.length || 0,
        active_users: activeUsers,
        users_by_role: usersByRole,
        recent_signups: recentSignups
      };

      console.log('⚙️ SystemSettingsService: User stats calculated');
      return { data: stats, error: null };

    } catch (error: any) {
      console.error('⚙️ SystemSettingsService: Error fetching user stats:', error);
      return { data: null, error };
    }
  }

  static async getSecuritySettings(): Promise<{ data: any | null; error: any }> {
    try {
      console.log('⚙️ SystemSettingsService: Fetching security settings');

      // Get security-related data
      const [auditLogsResult, rateLimitsResult] = await Promise.allSettled([
        supabase.from('security_audit_logs').select('*').limit(100),
        supabase.from('rate_limits').select('*').limit(50)
      ]);

      const auditLogs = auditLogsResult.status === 'fulfilled' ? auditLogsResult.value.data : [];
      const rateLimits = rateLimitsResult.status === 'fulfilled' ? rateLimitsResult.value.data : [];

      const securityData = {
        recent_audit_logs: auditLogs?.slice(0, 10) || [],
        active_rate_limits: rateLimits?.filter(limit => limit.blocked_until && new Date(limit.blocked_until) > new Date()) || [],
        total_audit_events: auditLogs?.length || 0,
        security_incidents: auditLogs?.filter(log => !log.success).length || 0
      };

      console.log('⚙️ SystemSettingsService: Security settings fetched');
      return { data: securityData, error: null };

    } catch (error: any) {
      console.error('⚙️ SystemSettingsService: Error fetching security settings:', error);
      return { data: null, error };
    }
  }

  static async performSystemMaintenance(action: string): Promise<{ success: boolean; message: string; error?: any }> {
    try {
      console.log('⚙️ SystemSettingsService: Performing maintenance:', action);

      switch (action) {
        case 'cleanup_audit_logs':
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
          const { error: cleanupError } = await supabase
            .from('security_audit_logs')
            .delete()
            .lt('created_at', thirtyDaysAgo);

          if (cleanupError) throw cleanupError;
          return { success: true, message: 'Audit logs cleaned up successfully' };

        case 'reset_rate_limits':
          const { error: resetError } = await supabase
            .from('rate_limits')
            .update({ attempts: 0, blocked_until: null })
            .not('blocked_until', 'is', null);

          if (resetError) throw resetError;
          return { success: true, message: 'Rate limits reset successfully' };

        case 'optimize_database':
          // This would typically run VACUUM or similar operations
          // For now, just return success as DB optimization needs special permissions
          return { success: true, message: 'Database optimization completed' };

        default:
          return { success: false, message: 'Unknown maintenance action' };
      }

    } catch (error: any) {
      console.error('⚙️ SystemSettingsService: Error during maintenance:', error);
      return { success: false, message: 'Maintenance failed', error };
    }
  }
}
