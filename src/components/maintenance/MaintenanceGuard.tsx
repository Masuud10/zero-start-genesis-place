import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

const MaintenanceGuard: React.FC<MaintenanceGuardProps> = ({ children }) => {
  const { user } = useAuth();

  const { data: maintenanceStatus, isLoading } = useQuery({
    queryKey: ['maintenance-lockout'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'maintenance_mode')
        .maybeSingle();

      if (error) {
        console.error('🔧 MaintenanceGuard: Error fetching maintenance status:', error);
        throw error;
      }

      const maintenanceData = data?.setting_value as { enabled?: boolean; message?: string; allowed_roles?: string[] } | null;
      const isMaintenanceEnabled = maintenanceData?.enabled || false;
      
      // Only EduFam Admin can bypass maintenance mode
      const isEduFamAdmin = user?.role === 'edufam_admin';
      
      console.log('🔧 MaintenanceGuard: Status check', {
        maintenanceEnabled: isMaintenanceEnabled,
        userRole: user?.role,
        isEduFamAdmin,
        userEmail: user?.email
      });
      
      return {
        enabled: isMaintenanceEnabled,
        message: maintenanceData?.message || '🛠️ Edufam is currently undergoing scheduled maintenance. Please check back later. If you need urgent support, contact admin@edufam.io',
        isAdmin: isEduFamAdmin
      };
    },
    refetchInterval: 5000, // Check every 5 seconds for real-time updates
    enabled: !!user // Only run when user is authenticated
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If maintenance is enabled and user is NOT an admin, show clean maintenance page
  if (maintenanceStatus?.enabled && !maintenanceStatus?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-8">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Simple Edufam Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">EF</span>
            </div>
          </div>

          {/* Clean maintenance message */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold text-gray-900">
                System Under Maintenance
              </h1>
              <p className="text-gray-600 leading-relaxed">
                {maintenanceStatus.message}
              </p>
            </div>

            {/* Simple footer */}
            <div className="pt-8 border-t border-gray-200">
              <p className="text-xs text-gray-400">
                Powered by Edufam
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For EduFam Admins: NO maintenance notifications/banners - just normal access
  // Normal operation - render children without any maintenance notifications
  return <>{children}</>;
};

export default MaintenanceGuard;