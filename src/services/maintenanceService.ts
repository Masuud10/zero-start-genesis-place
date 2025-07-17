import { supabase } from '@/integrations/supabase/client';

export interface MaintenanceSettings {
  enabled: boolean;
  message: string;
  updated_at: string;
}

export class MaintenanceService {
  static async getMaintenanceStatus(): Promise<{ data: MaintenanceSettings | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'maintenance_mode')
        .maybeSingle();

      if (error) throw error;

      const maintenanceSettings = data?.setting_value as unknown as MaintenanceSettings;

      return { 
        data: maintenanceSettings || null, 
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
        .upsert({
          setting_key: 'maintenance_mode',
          setting_value: {
            enabled,
            message: currentMessage,
            updated_at: new Date().toISOString()
          }
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error updating maintenance status:', error);
      return { success: false, error };
    }
  }
}