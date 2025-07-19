import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MaintenanceStatus {
  isLoading: boolean;
  isMaintenanceMode: boolean;
  isAdmin: boolean;
}

export const useMaintenanceStatus = (): MaintenanceStatus => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch the setting directly from the database.
        const { data, error } = await supabase
          .from('system_settings')
          .select('setting_value')
          .eq('setting_key', 'maintenance_mode')
          .maybeSingle();

        if (error) {
          console.error('Error fetching maintenance status:', error);
          setIsMaintenanceMode(false); // Default to OFF on error for safety
        } else {
          const maintenanceData = data?.setting_value as { enabled?: boolean } | null;
          setIsMaintenanceMode(maintenanceData?.enabled === true);
        }
      } catch (err) {
        console.error('Critical error in fetchSettings:', err);
        setIsMaintenanceMode(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const isAdmin = false; // No user context, so isAdmin is always false

  return { isLoading, isMaintenanceMode, isAdmin };
};