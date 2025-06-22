
import { supabase } from '@/integrations/supabase/client';

export interface MaintenanceSettings {
  enabled: boolean;
  message: string;
  updated_at: string;
}

export class SystemMaintenanceService {
  static async getMaintenanceStatus(): Promise<{ data: MaintenanceSettings | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'maintenance_mode')
        .single();

      if (error) throw error;

      return { 
        data: data?.setting_value as MaintenanceSettings || null, 
        error: null 
      };
    } catch (error: any) {
      console.error('Error fetching maintenance status:', error);
      return { data: null, error };
    }
  }

  static async updateMaintenanceStatus(enabled: boolean, message?: string): Promise<{ success: boolean; error?: any }> {
    try {
      const currentMessage = message || 'System is currently under maintenance. Please try again later.';
      
      const { error } = await supabase
        .from('system_settings')
        .update({
          setting_value: {
            enabled,
            message: currentMessage,
            updated_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('setting_key', 'maintenance_mode');

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error updating maintenance status:', error);
      return { success: false, error };
    }
  }

  static async checkSystemStatus(): Promise<{ inMaintenance: boolean; message?: string }> {
    try {
      const { data } = await this.getMaintenanceStatus();
      
      if (!data) {
        return { inMaintenance: false };
      }

      return {
        inMaintenance: data.enabled,
        message: data.message
      };
    } catch (error) {
      console.error('Error checking system status:', error);
      return { inMaintenance: false };
    }
  }
}
