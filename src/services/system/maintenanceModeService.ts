import { supabase } from '@/integrations/supabase/client';

export interface MaintenanceModeSettings {
  enabled: boolean;
  message: string;
  updated_by?: string;
  updated_at?: string;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: Record<string, unknown>;
  description?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export class MaintenanceModeService {
  static async getMaintenanceModeSettings(): Promise<{ data: MaintenanceModeSettings | null; error: unknown }> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('setting_key', 'maintenance_mode')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      if (!data) {
        // Return default settings if no maintenance mode setting exists
        return {
          data: {
            enabled: false,
            message: 'System is under maintenance. Please try again later.'
          },
          error: null
        };
      }

      let parsedValue: MaintenanceModeSettings;
      try {
        parsedValue = typeof data.setting_value === 'string' 
          ? JSON.parse(data.setting_value) 
          : data.setting_value as unknown as MaintenanceModeSettings;
      } catch (parseError) {
        console.error('Error parsing maintenance settings:', parseError);
        return {
          data: {
            enabled: false,
            message: 'System is under maintenance. Please try again later.'
          },
          error: null
        };
      }

      return {
        data: parsedValue,
        error: null
      };
    } catch (error: unknown) {
      console.error('Error fetching maintenance mode settings:', error);
      return { data: null, error };
    }
  }

  static async updateMaintenanceMode(settings: MaintenanceModeSettings): Promise<{ success: boolean; error?: unknown }> {
    try {
      // First, try to delete existing record
      await supabase
        .from('system_settings')
        .delete()
        .eq('setting_key', 'maintenance_mode');

      // Then insert new record
      const { error } = await supabase
        .from('system_settings')
        .insert({
          setting_key: 'maintenance_mode',
          setting_value: JSON.stringify(settings),
          description: 'System maintenance mode configuration'
        });

      if (error) throw error;

      return { success: true };
    } catch (error: unknown) {
      console.error('Error updating maintenance mode:', error);
      return { success: false, error };
    }
  }

  static async isMaintenanceModeEnabled(): Promise<boolean> {
    try {
      const { data, error } = await this.getMaintenanceModeSettings();
      
      if (error || !data) {
        return false;
      }

      return data.enabled;
    } catch (error) {
      console.error('Error checking maintenance mode:', error);
      return false;
    }
  }

  static async getMaintenanceMessage(): Promise<string> {
    try {
      const { data, error } = await this.getMaintenanceModeSettings();
      
      if (error || !data) {
        return 'System is under maintenance. Please try again later.';
      }

      return data.message;
    } catch (error) {
      console.error('Error getting maintenance message:', error);
      return 'System is under maintenance. Please try again later.';
    }
  }

  static async checkUserAccess(userRole?: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const isMaintenanceEnabled = await this.isMaintenanceModeEnabled();
      
      if (!isMaintenanceEnabled) {
        return { allowed: true };
      }

      // Only edufam_admin users can access during maintenance
      if (userRole === 'edufam_admin') {
        return { allowed: true };
      }

      return { 
        allowed: false, 
        reason: 'System is currently under maintenance. Please try again later.' 
      };
    } catch (error) {
      console.error('Error checking user access:', error);
      return { allowed: false, reason: 'Unable to verify system status.' };
    }
  }
} 