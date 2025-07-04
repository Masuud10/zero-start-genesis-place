import { supabase } from '@/integrations/supabase/client';

export interface MaintenanceModeSettings {
  enabled: boolean;
  message: string;
  updated_by?: string;
  updated_at?: string;
  estimated_duration?: string;
  allowed_roles?: string[];
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

export interface MaintenanceStatus {
  inMaintenance: boolean;
  message?: string;
  canBypass: boolean;
  estimatedDuration?: string;
}

export class MaintenanceModeService {
  static async getMaintenanceModeSettings(): Promise<{ data: MaintenanceModeSettings | null; error: unknown }> {
    try {
      console.log('🔍 MaintenanceModeService: Fetching maintenance settings...');
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('setting_key', 'maintenance_mode')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('🔍 MaintenanceModeService: Database error:', error);
        throw error;
      }

      if (!data) {
        console.log('🔍 MaintenanceModeService: No maintenance settings found, returning defaults');
        // Return default settings if no maintenance mode setting exists
        return {
          data: {
            enabled: false,
            message: 'System is under maintenance. Please try again later.',
            allowed_roles: ['edufam_admin']
          },
          error: null
        };
      }

      let parsedValue: MaintenanceModeSettings;
      try {
        parsedValue = typeof data.setting_value === 'string' 
          ? JSON.parse(data.setting_value) 
          : data.setting_value as unknown as MaintenanceModeSettings;
        
        console.log('🔍 MaintenanceModeService: Parsed settings:', parsedValue);
      } catch (parseError) {
        console.error('🔍 MaintenanceModeService: Error parsing maintenance settings:', parseError);
        return {
          data: {
            enabled: false,
            message: 'System is under maintenance. Please try again later.',
            allowed_roles: ['edufam_admin']
          },
          error: null
        };
      }

      return {
        data: parsedValue,
        error: null
      };
    } catch (error: unknown) {
      console.error('🔍 MaintenanceModeService: Error fetching maintenance mode settings:', error);
      return { data: null, error };
    }
  }

  static async updateMaintenanceMode(settings: MaintenanceModeSettings): Promise<{ success: boolean; error?: unknown }> {
    try {
      console.log('🔧 MaintenanceModeService: Updating maintenance mode with settings:', settings);
      
      // Get current user for audit trail
      const { data: { user } } = await supabase.auth.getUser();
      
      const updatedSettings = {
        ...settings,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
        allowed_roles: settings.allowed_roles || ['edufam_admin']
      };

      console.log('🔧 MaintenanceModeService: Final settings to save:', updatedSettings);

      // Use upsert to handle both insert and update
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'maintenance_mode',
          setting_value: updatedSettings,
          description: 'System maintenance mode configuration',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });

      if (error) {
        console.error('🔧 MaintenanceModeService: Database error during update:', error);
        throw error;
      }

      console.log('🔧 MaintenanceModeService: Successfully updated maintenance mode');
      return { success: true };
    } catch (error: unknown) {
      console.error('🔧 MaintenanceModeService: Error updating maintenance mode:', error);
      return { success: false, error };
    }
  }

  static async isMaintenanceModeEnabled(): Promise<boolean> {
    try {
      const { data, error } = await this.getMaintenanceModeSettings();
      
      if (error || !data) {
        console.log('🔍 MaintenanceModeService: isMaintenanceModeEnabled - returning false due to error or no data');
        return false;
      }

      console.log('🔍 MaintenanceModeService: isMaintenanceModeEnabled - returning:', data.enabled);
      return data.enabled;
    } catch (error) {
      console.error('🔍 MaintenanceModeService: Error checking maintenance mode:', error);
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

  static async getMaintenanceStatus(userRole?: string): Promise<MaintenanceStatus> {
    try {
      const { data, error } = await this.getMaintenanceModeSettings();
      
      if (error || !data) {
        console.log('🔍 MaintenanceModeService: getMaintenanceStatus - no data or error, returning default');
        return { inMaintenance: false, canBypass: true };
      }

      if (!data.enabled) {
        console.log('🔍 MaintenanceModeService: getMaintenanceStatus - maintenance disabled');
        return { inMaintenance: false, canBypass: true };
      }

      // Enhanced role checking - only EduFam admins can bypass maintenance mode
      const allowedRoles = data.allowed_roles || ['edufam_admin'];
      const canBypass = allowedRoles.includes(userRole || '') || false;

      console.log('🔍 MaintenanceModeService: Role check', {
        userRole,
        allowedRoles,
        canBypass,
        maintenanceEnabled: data.enabled
      });

      return {
        inMaintenance: true,
        message: data.message,
        canBypass,
        estimatedDuration: data.estimated_duration
      };
    } catch (error) {
      console.error('Error getting maintenance status:', error);
      return { inMaintenance: false, canBypass: true };
    }
  }

  static async checkUserAccess(userRole?: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const status = await this.getMaintenanceStatus(userRole);
      
      console.log('🔍 MaintenanceModeService: Access check', {
        userRole,
        inMaintenance: status.inMaintenance,
        canBypass: status.canBypass,
        allowed: !status.inMaintenance || status.canBypass
      });

      if (!status.inMaintenance) {
        return { allowed: true };
      }

      if (status.canBypass) {
        return { allowed: true };
      }

      return { 
        allowed: false, 
        reason: status.message || 'System is currently under maintenance. Please try again later.' 
      };
    } catch (error) {
      console.error('Error checking user access:', error);
      return { allowed: false, reason: 'Unable to verify system status.' };
    }
  }

  static async enableMaintenanceMode(message: string, estimatedDuration?: string): Promise<{ success: boolean; error?: unknown }> {
    try {
      const settings: MaintenanceModeSettings = {
        enabled: true,
        message,
        estimated_duration: estimatedDuration || '2-4 hours',
        allowed_roles: ['edufam_admin'], // Only EduFam admins can bypass
        updated_at: new Date().toISOString()
      };

      console.log('🔧 MaintenanceModeService: Enabling maintenance mode', {
        message,
        estimatedDuration,
        allowedRoles: settings.allowed_roles
      });

      const result = await this.updateMaintenanceMode(settings);
      
      if (result.success) {
        console.log('🔧 MaintenanceModeService: Successfully enabled maintenance mode');
      } else {
        console.error('🔧 MaintenanceModeService: Failed to enable maintenance mode:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Error enabling maintenance mode:', error);
      return { success: false, error };
    }
  }

  static async disableMaintenanceMode(): Promise<{ success: boolean; error?: unknown }> {
    try {
      const settings: MaintenanceModeSettings = {
        enabled: false,
        message: 'System is operational.',
        allowed_roles: ['edufam_admin'],
        updated_at: new Date().toISOString()
      };

      console.log('🔧 MaintenanceModeService: Disabling maintenance mode');

      const result = await this.updateMaintenanceMode(settings);
      
      if (result.success) {
        console.log('🔧 MaintenanceModeService: Successfully disabled maintenance mode');
      } else {
        console.error('🔧 MaintenanceModeService: Failed to disable maintenance mode:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Error disabling maintenance mode:', error);
      return { success: false, error };
    }
  }

  static async logMaintenanceAction(action: string, details?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Log maintenance actions for audit trail
      await supabase
        .from('audit_logs')
        .insert({
          action: `maintenance_${action}`,
          performed_by_user_id: user?.id,
          performed_by_role: 'edufam_admin',
          target_entity: 'system_maintenance',
          new_value: { message: details || `Maintenance mode ${action}` },
          metadata: { action_type: 'maintenance', details }
        });
    } catch (error) {
      console.error('Error logging maintenance action:', error);
      // Don't throw error for logging failures
    }
  }

  /**
   * Check if a specific role can access during maintenance
   */
  static canRoleAccessDuringMaintenance(userRole?: string): boolean {
    const allowedRoles = ['edufam_admin'];
    return allowedRoles.includes(userRole || '');
  }

  /**
   * Get list of roles that can access during maintenance
   */
  static getAllowedRolesDuringMaintenance(): string[] {
    return ['edufam_admin'];
  }
} 