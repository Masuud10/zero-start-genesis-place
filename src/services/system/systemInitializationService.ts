
import { supabase } from '@/integrations/supabase/client';

export class SystemInitializationService {
  static async initializeSystemSettings() {
    try {
      // Check if maintenance_mode setting exists
      const { data: existingSettings } = await supabase
        .from('system_settings')
        .select('*')
        .eq('setting_key', 'maintenance_mode')
        .single();

      if (!existingSettings) {
        // Create default maintenance_mode setting
        const { error } = await supabase
          .from('system_settings')
          .insert({
            setting_key: 'maintenance_mode',
            setting_value: {
              enabled: false,
              message: 'System is currently under maintenance. Please try again later.',
              updated_at: new Date().toISOString()
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error creating default maintenance setting:', error);
        } else {
          console.log('Default maintenance setting created successfully');
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error initializing system settings:', error);
      return { success: false, error };
    }
  }
}
