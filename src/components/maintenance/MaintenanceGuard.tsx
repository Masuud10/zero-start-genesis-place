import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Wrench } from 'lucide-react';
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
      const isEduFamAdmin = user?.role === 'edufam_admin' || user?.role === 'elimisha_admin';
      
      console.log('🔧 MaintenanceGuard: Status check', {
        maintenanceEnabled: isMaintenanceEnabled,
        userRole: user?.role,
        isEduFamAdmin,
        userEmail: user?.email,
        allowedRoles: maintenanceData?.allowed_roles
      });
      
      return {
        enabled: isMaintenanceEnabled,
        message: maintenanceData?.message || '🔧 EduFam is currently undergoing maintenance. Please check back later.',
        isAdmin: isEduFamAdmin
      };
    },
    refetchInterval: 15000, // Check every 15 seconds for faster updates
    enabled: !!user, // Only run when user is authenticated
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If maintenance is enabled and user is not an admin, show maintenance page
  if (maintenanceStatus?.enabled && !maintenanceStatus?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-lg w-full text-center space-y-8">
          {/* EduFam Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">EF</span>
            </div>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <Wrench className="w-8 h-8 text-amber-600" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-gray-900">🔧 EduFam is Under Maintenance</h1>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {maintenanceStatus.message}
                </p>
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  We're working hard to improve your experience. Please check back soon!
                </AlertDescription>
              </Alert>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-3">
                  Need immediate assistance?
                </p>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    📧 Email: <span className="font-medium text-primary">support@edufam.com</span>
                  </p>
                  <p className="text-gray-600">
                    📞 Phone: <span className="font-medium text-primary">+1 (555) 123-4567</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact your system administrator.
          </p>
        </div>
      </div>
    );
  }

  // Show admin maintenance banner if in maintenance mode
  if (maintenanceStatus?.enabled && maintenanceStatus?.isAdmin) {
    return (
      <div className="space-y-0">
        <Alert className="border-amber-200 bg-amber-50 rounded-none border-x-0 border-t-0">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>System is in maintenance mode.</strong> You have admin access, but other users are locked out.
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  // Normal operation - render children
  return <>{children}</>;
};

export default MaintenanceGuard;