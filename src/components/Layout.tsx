
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Sidebar from './Sidebar';
import Header from './Header';
import MaintenanceBanner from './ui/MaintenanceBanner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();

  const { data: maintenanceStatus, isLoading } = useQuery({
    queryKey: ['maintenance-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'maintenance_mode')
        .maybeSingle();

      if (error) {
        console.error('Error fetching maintenance status:', error);
        return { enabled: false };
      }

      const maintenanceData = data?.setting_value as { enabled?: boolean } | null;
      return {
        enabled: maintenanceData?.enabled || false
      };
    },
    refetchInterval: 2000,
    enabled: !!user
  });

  const isMaintenanceMode = maintenanceStatus?.enabled === true;

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        {!isLoading && isMaintenanceMode && <MaintenanceBanner />}
        <main className="flex-1 overflow-auto p-3 md:p-6 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
