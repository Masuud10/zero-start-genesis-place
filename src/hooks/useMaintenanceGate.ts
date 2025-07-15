// src/hooks/useMaintenanceGate.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useMaintenanceGate() {
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        console.log('🔍 useMaintenanceGate: Starting maintenance check...');
        
        // Fetch maintenance settings and user session
        const [settingsRes, sessionRes] = await Promise.all([
          supabase.from('system_settings').select('setting_value').eq('setting_key', 'maintenance_mode').limit(1).maybeSingle(),
          supabase.auth.getSession()
        ]);

        console.log('🔍 useMaintenanceGate: Settings result:', settingsRes);
        console.log('🔍 useMaintenanceGate: Session result:', sessionRes);

        const maintenanceModeOn = (settingsRes.data?.setting_value as { enabled?: boolean })?.enabled === true;
        
        // Get user role from profiles table (not user_metadata)
        let userRole: string | null = null;
        let isAdmin = false;
        
        if (sessionRes.data.session?.user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', sessionRes.data.session.user.id)
            .maybeSingle();
          
          userRole = profile?.role || null;
          isAdmin = userRole === 'edufam_admin';
          
          console.log('🔍 useMaintenanceGate: Profile lookup result:', { profile, userRole, isAdmin });
        }

        console.log('🔍 useMaintenanceGate: Analysis:', {
          maintenanceModeOn,
          userRole,
          isAdmin,
          shouldBlock: maintenanceModeOn && !isAdmin
        });

        if (maintenanceModeOn && !isAdmin) {
          console.log('🚫 useMaintenanceGate: User blocked by maintenance mode');
          setIsBlocked(true);
        } else {
          console.log('✅ useMaintenanceGate: User allowed access');
          setIsBlocked(false);
        }
      } catch (error) {
        console.error('🔍 useMaintenanceGate: Error during maintenance check:', error);
        // On error, allow access to prevent blocking legitimate users
        setIsBlocked(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();

    // Set up periodic checking every 10 seconds for more responsive updates
    const interval = setInterval(checkStatus, 10000);
    
    // Set up real-time subscription for immediate updates
    const channel = supabase
      .channel('maintenance-mode-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings',
          filter: 'setting_key=eq.maintenance_mode'
        },
        () => {
          console.log('🔍 useMaintenanceGate: Real-time update detected, rechecking...');
          checkStatus();
        }
      )
      .subscribe();
    
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const refreshStatus = useCallback(async () => {
    console.log('🔍 useMaintenanceGate: Manual refresh requested');
    setIsLoading(true);
    
    try {
      const [settingsRes, sessionRes] = await Promise.all([
        supabase.from('system_settings').select('setting_value').eq('setting_key', 'maintenance_mode').limit(1).maybeSingle(),
        supabase.auth.getSession()
      ]);

      const maintenanceModeOn = (settingsRes.data?.setting_value as { enabled?: boolean })?.enabled === true;
      
      let userRole: string | null = null;
      let isAdmin = false;
      
      if (sessionRes.data.session?.user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', sessionRes.data.session.user.id)
          .maybeSingle();
        
        userRole = profile?.role || null;
        isAdmin = userRole === 'edufam_admin';
      }

      if (maintenanceModeOn && !isAdmin) {
        setIsBlocked(true);
      } else {
        setIsBlocked(false);
      }
    } catch (error) {
      console.error('🔍 useMaintenanceGate: Error during manual refresh:', error);
      setIsBlocked(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, isBlocked, refreshStatus };
} 