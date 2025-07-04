// Console debug script for maintenance mode issues
// Run this in the browser console to debug maintenance mode problems

export const maintenanceDebugConsole = {
  async checkCurrentStatus() {
    console.log('🔍 Console Debug: Checking current maintenance status...');
    
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // Check current settings
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('setting_key', 'maintenance_mode')
        .single();
      
      if (error) {
        console.error('🔍 Console Debug: Error fetching settings:', error);
        return;
      }
      
      console.log('🔍 Console Debug: Current maintenance settings:', data);
      console.log('🔍 Console Debug: Parsed value:', data.setting_value);
      console.log('🔍 Console Debug: Enabled:', data.setting_value?.enabled);
      
      return data;
    } catch (error) {
      console.error('🔍 Console Debug: Unexpected error:', error);
    }
  },

  async enableMaintenanceMode() {
    console.log('🔍 Console Debug: Enabling maintenance mode...');
    
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'maintenance_mode',
          setting_value: {
            enabled: true,
            message: 'Console debug test - System under maintenance',
            updated_at: new Date().toISOString(),
            allowed_roles: ['edufam_admin']
          },
          description: 'System maintenance mode configuration',
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        }, {
          onConflict: 'setting_key'
        });
      
      if (error) {
        console.error('🔍 Console Debug: Error enabling maintenance mode:', error);
        return false;
      }
      
      console.log('🔍 Console Debug: Successfully enabled maintenance mode');
      return true;
    } catch (error) {
      console.error('🔍 Console Debug: Unexpected error:', error);
      return false;
    }
  },

  async disableMaintenanceMode() {
    console.log('🔍 Console Debug: Disabling maintenance mode...');
    
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'maintenance_mode',
          setting_value: {
            enabled: false,
            message: 'System is operational.',
            updated_at: new Date().toISOString(),
            allowed_roles: ['edufam_admin']
          },
          description: 'System maintenance mode configuration',
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        }, {
          onConflict: 'setting_key'
        });
      
      if (error) {
        console.error('🔍 Console Debug: Error disabling maintenance mode:', error);
        return false;
      }
      
      console.log('🔍 Console Debug: Successfully disabled maintenance mode');
      return true;
    } catch (error) {
      console.error('🔍 Console Debug: Unexpected error:', error);
      return false;
    }
  },

  async monitorMaintenanceMode(duration = 10000) {
    console.log(`🔍 Console Debug: Monitoring maintenance mode for ${duration}ms...`);
    
    const startTime = Date.now();
    const interval = setInterval(async () => {
      const elapsed = Date.now() - startTime;
      console.log(`🔍 Console Debug: [${elapsed}ms] Checking maintenance status...`);
      
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data, error } = await supabase
          .from('system_settings')
          .select('setting_value')
          .eq('setting_key', 'maintenance_mode')
          .single();
        
        if (error) {
          console.error(`🔍 Console Debug: [${elapsed}ms] Error:`, error);
        } else {
          const enabled = data.setting_value?.enabled;
          console.log(`🔍 Console Debug: [${elapsed}ms] Maintenance enabled:`, enabled);
        }
      } catch (error) {
        console.error(`🔍 Console Debug: [${elapsed}ms] Unexpected error:`, error);
      }
      
      if (elapsed >= duration) {
        clearInterval(interval);
        console.log('🔍 Console Debug: Monitoring completed');
      }
    }, 1000);
  },

  async fullTest() {
    console.log('🔍 Console Debug: Starting full maintenance mode test...');
    
    // 1. Check initial status
    console.log('Step 1: Checking initial status...');
    await this.checkCurrentStatus();
    
    // 2. Enable maintenance mode
    console.log('Step 2: Enabling maintenance mode...');
    const enableResult = await this.enableMaintenanceMode();
    
    if (!enableResult) {
      console.error('🔍 Console Debug: Failed to enable maintenance mode');
      return;
    }
    
    // 3. Wait and check status
    console.log('Step 3: Waiting 3 seconds and checking status...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    await this.checkCurrentStatus();
    
    // 4. Monitor for changes
    console.log('Step 4: Monitoring for 10 seconds...');
    await this.monitorMaintenanceMode(10000);
    
    // 5. Disable maintenance mode
    console.log('Step 5: Disabling maintenance mode...');
    await this.disableMaintenanceMode();
    
    console.log('🔍 Console Debug: Full test completed');
  }
};

// Make it available globally for console access
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).maintenanceDebug = maintenanceDebugConsole;
  console.log('🔍 Console Debug: Maintenance debug tools available as window.maintenanceDebug');
  console.log('🔍 Console Debug: Available methods:');
  console.log('  - window.maintenanceDebug.checkCurrentStatus()');
  console.log('  - window.maintenanceDebug.enableMaintenanceMode()');
  console.log('  - window.maintenanceDebug.disableMaintenanceMode()');
  console.log('  - window.maintenanceDebug.monitorMaintenanceMode(duration)');
  console.log('  - window.maintenanceDebug.fullTest()');
} 