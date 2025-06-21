
import { supabase } from '@/integrations/supabase/client';

export interface UserManagementStats {
  total_users: number;
  active_users: number;
  users_by_role: Record<string, number>;
  recent_signups: number;
}

export interface SecuritySettings {
  recent_audit_logs: any[];
  active_rate_limits: any[];
  total_audit_events: number;
  security_incidents: number;
  failed_login_attempts: number;
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

  static async getSecuritySettings(): Promise<{ data: SecuritySettings | null; error: any }> {
    try {
      console.log('⚙️ SystemSettingsService: Fetching security settings');

      // Get security audit logs
      const { data: auditLogs, error: auditError } = await supabase
        .from('security_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Get rate limits
      const { data: rateLimits, error: rateLimitError } = await supabase
        .from('rate_limits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Get failed login attempts from profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('failed_login_attempts')
        .gt('failed_login_attempts', 0);

      if (auditError || rateLimitError || profileError) {
        console.error('Error fetching security data:', { auditError, rateLimitError, profileError });
      }

      const failedLoginAttempts = profiles?.reduce((sum, p) => sum + (p.failed_login_attempts || 0), 0) || 0;

      const securityData: SecuritySettings = {
        recent_audit_logs: auditLogs?.slice(0, 10) || [],
        active_rate_limits: rateLimits?.filter(limit => 
          limit.blocked_until && new Date(limit.blocked_until) > new Date()
        ) || [],
        total_audit_events: auditLogs?.length || 0,
        security_incidents: auditLogs?.filter(log => !log.success).length || 0,
        failed_login_attempts: failedLoginAttempts
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
          // Log the optimization request in analytics
          const { error: logError } = await supabase
            .from('analytics_events')
            .insert({
              event_type: 'database_optimization',
              event_category: 'system_maintenance',
              metadata: { action: 'optimize_database', timestamp: new Date().toISOString() }
            });

          if (logError) console.error('Error logging optimization:', logError);
          return { success: true, message: 'Database optimization request logged' };

        default:
          return { success: false, message: 'Unknown maintenance action' };
      }

    } catch (error: any) {
      console.error('⚙️ SystemSettingsService: Error during maintenance:', error);
      return { success: false, message: 'Maintenance failed', error };
    }
  }
}
