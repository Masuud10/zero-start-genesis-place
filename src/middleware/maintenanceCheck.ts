
import { supabase } from '@/integrations/supabase/client';

export interface MaintenanceStatus {
  inMaintenance: boolean;
  message?: string;
  canBypass?: boolean;
}

export class MaintenanceMiddleware {
  static async checkMaintenanceStatus(userRole?: string): Promise<MaintenanceStatus> {
    try {
      // Check if system is in maintenance mode
      const { data: maintenanceData } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'maintenance_mode')
        .single();

      if (!maintenanceData?.setting_value) {
        return { inMaintenance: false };
      }

      const maintenanceSettings = maintenanceData.setting_value as {
        enabled: boolean;
        message: string;
      };

      if (!maintenanceSettings.enabled) {
        return { inMaintenance: false };
      }

      // EduFam admins can bypass maintenance mode
      const canBypass = userRole === 'edufam_admin' || userRole === 'elimisha_admin';

      return {
        inMaintenance: true,
        message: maintenanceSettings.message || 'System is currently under maintenance. Please try again later.',
        canBypass
      };
    } catch (error) {
      console.error('Error checking maintenance status:', error);
      return { inMaintenance: false };
    }
  }

  static async updateMaintenanceMode(enabled: boolean, message: string) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('system_settings')
        .update({
          setting_value: {
            enabled,
            message,
            updated_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString(),
          updated_by: userData.user?.id
        })
        .eq('setting_key', 'maintenance_mode');

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error updating maintenance mode:', error);
      return { success: false, error: error.message };
    }
  }
}
