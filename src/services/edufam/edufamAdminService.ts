import { supabase } from '@/integrations/supabase/client';

export interface EduFamAdminStats {
  totalSchools: number;
  totalUsers: number;
  activeUsers: number;
  systemHealth: {
    uptime: number;
    performance: number;
    errors: number;
  };
}

export class EduFamAdminService {
  /**
   * Get comprehensive EduFam admin dashboard statistics
   */
  static async getDashboardStats(): Promise<EduFamAdminStats> {
    try {
      console.log('📊 EduFamAdminService: Fetching dashboard stats...');

      // Call the database functions in parallel for better performance
      const [analyticsResult, healthResult] = await Promise.all([
        supabase.rpc('get_system_analytics'),
        supabase.rpc('get_system_health')
      ]);

      if (analyticsResult.error) {
        console.error('❌ Analytics error:', analyticsResult.error);
        throw analyticsResult.error;
      }

      if (healthResult.error) {
        console.error('❌ Health check error:', healthResult.error);
        throw healthResult.error;
      }

      const analytics = analyticsResult.data as {
        total_schools?: number;
        total_users?: number;
        active_users?: number;
      };
      
      const health = healthResult.data as {
        uptime_percentage?: number;
        performance_score?: number;
        recent_errors?: number;
      };

      return {
        totalSchools: analytics.total_schools || 0,
        totalUsers: analytics.total_users || 0,
        activeUsers: analytics.active_users || 0,
        systemHealth: {
          uptime: health.uptime_percentage || 99.9,
          performance: health.performance_score || 95.5,
          errors: health.recent_errors || 0
        }
      };
    } catch (error) {
      console.error('❌ EduFamAdminService: Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Update user status (activate/deactivate)
   */
  static async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<boolean> {
    try {
      console.log(`🔄 EduFamAdminService: Updating user ${userId} status to ${status}`);

      const { data, error } = await supabase.rpc('admin_update_user_status', {
        target_user_id: userId,
        new_status: status
      });

      if (error) {
        console.error('❌ Error updating user status:', error);
        throw error;
      }

      const response = data as { success?: boolean };
      console.log('✅ User status updated successfully:', response);
      return response.success || false;
    } catch (error) {
      console.error('❌ EduFamAdminService: Error updating user status:', error);
      throw error;
    }
  }

  /**
   * Get system health metrics
   */
  static async getSystemHealth() {
    try {
      console.log('🏥 EduFamAdminService: Fetching system health...');

      const { data, error } = await supabase.rpc('get_system_health');

      if (error) {
        console.error('❌ Error fetching system health:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ EduFamAdminService: Error fetching system health:', error);
      throw error;
    }
  }

  /**
   * Validate EduFam admin permissions
   */
  static async validateAdminPermissions(): Promise<boolean> {
    try {
      console.log('🔐 EduFamAdminService: Validating admin permissions...');

      const { data, error } = await supabase.rpc('is_edufam_admin');

      if (error) {
        console.error('❌ Error validating admin permissions:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('❌ EduFamAdminService: Error validating permissions:', error);
      return false;
    }
  }
}