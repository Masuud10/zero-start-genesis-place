import { supabase } from '@/integrations/supabase/client';
import { MaintenanceModeService } from '@/services/system/maintenanceModeService';

export const debugMaintenanceMode = async () => {
  console.log('🔍 DEBUG: Starting maintenance mode debug...');
  
  try {
    // 1. Check current maintenance settings
    console.log('🔍 DEBUG: Step 1 - Checking current maintenance settings...');
    const { data: currentSettings, error: getError } = await MaintenanceModeService.getMaintenanceModeSettings();
    
    if (getError) {
      console.error('🔍 DEBUG: Error getting current settings:', getError);
      return;
    }
    
    console.log('🔍 DEBUG: Current settings:', currentSettings);
    
    // 2. Enable maintenance mode
    console.log('🔍 DEBUG: Step 2 - Enabling maintenance mode...');
    const enableResult = await MaintenanceModeService.enableMaintenanceMode(
      'Debug test - System under maintenance',
      '1 hour'
    );
    
    console.log('🔍 DEBUG: Enable result:', enableResult);
    
    if (!enableResult.success) {
      console.error('🔍 DEBUG: Failed to enable maintenance mode:', enableResult.error);
      return;
    }
    
    // 3. Wait a moment
    console.log('🔍 DEBUG: Step 3 - Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 4. Check if maintenance mode is still enabled
    console.log('🔍 DEBUG: Step 4 - Checking if maintenance mode is still enabled...');
    const { data: settingsAfterEnable, error: checkError } = await MaintenanceModeService.getMaintenanceModeSettings();
    
    if (checkError) {
      console.error('🔍 DEBUG: Error checking settings after enable:', checkError);
      return;
    }
    
    console.log('🔍 DEBUG: Settings after enable:', settingsAfterEnable);
    
    // 5. Check maintenance status
    console.log('🔍 DEBUG: Step 5 - Checking maintenance status...');
    const status = await MaintenanceModeService.getMaintenanceStatus('edufam_admin');
    console.log('🔍 DEBUG: Maintenance status:', status);
    
    // 6. Check if there are any other processes that might be interfering
    console.log('🔍 DEBUG: Step 6 - Checking for other maintenance mode entries...');
    const { data: allSettings, error: allError } = await supabase
      .from('system_settings')
      .select('*')
      .eq('setting_key', 'maintenance_mode');
    
    if (allError) {
      console.error('🔍 DEBUG: Error checking all settings:', allError);
    } else {
      console.log('🔍 DEBUG: All maintenance mode settings:', allSettings);
    }
    
    // 7. Check audit logs
    console.log('🔍 DEBUG: Step 7 - Checking recent audit logs...');
    const { data: auditLogs, error: auditError } = await supabase
      .from('audit_logs')
      .select('*')
      .ilike('action', '%maintenance%')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (auditError) {
      console.error('🔍 DEBUG: Error checking audit logs:', auditError);
    } else {
      console.log('🔍 DEBUG: Recent maintenance audit logs:', auditLogs);
    }
    
    // 8. Disable maintenance mode
    console.log('🔍 DEBUG: Step 8 - Disabling maintenance mode...');
    const disableResult = await MaintenanceModeService.disableMaintenanceMode();
    console.log('🔍 DEBUG: Disable result:', disableResult);
    
    console.log('🔍 DEBUG: Debug completed successfully!');
    
  } catch (error) {
    console.error('🔍 DEBUG: Unexpected error during debug:', error);
  }
};

export const checkMaintenanceModeConsistency = async () => {
  console.log('🔍 DEBUG: Checking maintenance mode consistency...');
  
  try {
    // Check multiple ways of getting maintenance status
    const [settingsResult, statusResult, directQuery] = await Promise.all([
      MaintenanceModeService.getMaintenanceModeSettings(),
      MaintenanceModeService.getMaintenanceStatus('edufam_admin'),
      supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'maintenance_mode')
        .single()
    ]);
    
    console.log('🔍 DEBUG: Settings result:', settingsResult);
    console.log('🔍 DEBUG: Status result:', statusResult);
    console.log('🔍 DEBUG: Direct query result:', directQuery);
    
    // Check for consistency
    const settingsEnabled = settingsResult.data?.enabled || false;
    const statusInMaintenance = statusResult.inMaintenance;
    const directEnabled = (directQuery.data?.setting_value as Record<string, unknown>)?.enabled as boolean || false;
    
    console.log('🔍 DEBUG: Consistency check:');
    console.log('  - Settings enabled:', settingsEnabled);
    console.log('  - Status in maintenance:', statusInMaintenance);
    console.log('  - Direct query enabled:', directEnabled);
    
    const isConsistent = settingsEnabled === statusInMaintenance && settingsEnabled === directEnabled;
    console.log('🔍 DEBUG: Is consistent:', isConsistent);
    
    if (!isConsistent) {
      console.warn('🔍 DEBUG: INCONSISTENCY DETECTED!');
    }
    
  } catch (error) {
    console.error('🔍 DEBUG: Error checking consistency:', error);
  }
}; 