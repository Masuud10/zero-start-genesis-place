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
        return {
          enabled: false,
          message: '',
          isAdmin: true
        };
      }

      const maintenanceData = data?.setting_value as { enabled?: boolean; message?: string; allowed_roles?: string[] } | null;
      const isMaintenanceEnabled = maintenanceData?.enabled || false;
      
      // Only EduFam Admin can bypass maintenance mode
      const isEduFamAdmin = user?.role === 'edufam_admin';
      
      console.log('🔧 MaintenanceGuard: Status check', {
        maintenanceEnabled: isMaintenanceEnabled,
        userRole: user?.role,
        isEduFamAdmin,
        userEmail: user?.email,
        shouldBlock: isMaintenanceEnabled && !isEduFamAdmin
      });
      
      return {
        enabled: isMaintenanceEnabled,
        message: maintenanceData?.message || '🛠️ Edufam is currently undergoing scheduled maintenance. Please check back later. If you need urgent support, contact admin@edufam.io',
        isAdmin: isEduFamAdmin
      };
    },
    refetchInterval: 2000, // Check every 2 seconds for faster updates
    enabled: !!user // Only run when user is authenticated
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // CRITICAL: If maintenance is enabled and user is NOT an EduFam admin, show maintenance page
  if (maintenanceStatus?.enabled && !maintenanceStatus?.isAdmin) {
    console.log('🚫 MaintenanceGuard: Blocking user access - showing maintenance page for role:', user?.role);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Edufam Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-2xl font-bold text-primary-foreground">EF</span>
            </div>
          </div>

          {/* Maintenance message */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-foreground">
                🛠️ System Under Maintenance
              </h1>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {maintenanceStatus.message}
              </p>
            </div>

            {/* Contact info */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Need urgent support? Contact us at{' '}
                <a href="mailto:admin@edufam.io" className="text-primary font-medium hover:underline">
                  admin@edufam.io
                </a>
              </p>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Powered by Edufam
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For EduFam Admins: Normal access without any maintenance notifications
  console.log('✅ MaintenanceGuard: Allowing access for role:', user?.role);
  return <>{children}</>;
};

export default MaintenanceGuard;