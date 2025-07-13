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

      if (error) throw error;

      const maintenanceData = data?.setting_value as { enabled?: boolean; message?: string } | null;
      
      return {
        enabled: maintenanceData?.enabled || false,
        message: maintenanceData?.message || 'System is under maintenance. Please try again later.',
        isAdmin: user?.role === 'edufam_admin' || user?.role === 'elimisha_admin'
      };
    },
    refetchInterval: 30000, // Check every 30 seconds
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
      <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <Wrench className="w-8 h-8 text-amber-600" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-semibold">System Under Maintenance</h1>
              <p className="text-muted-foreground">
                {maintenanceStatus.message}
              </p>
            </div>

            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                We apologize for the inconvenience. Please check back later.
              </AlertDescription>
            </Alert>

            <div className="text-sm text-muted-foreground">
              If you believe this is an error, please contact your system administrator.
            </div>
          </CardContent>
        </Card>
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