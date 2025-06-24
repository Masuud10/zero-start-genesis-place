
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MaintenanceMiddleware } from '@/middleware/maintenanceCheck';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, Wrench } from 'lucide-react';

interface MaintenanceCheckProps {
  children: React.ReactNode;
}

const MaintenanceCheck: React.FC<MaintenanceCheckProps> = ({ children }) => {
  const { user } = useAuth();
  const [maintenanceStatus, setMaintenanceStatus] = useState({
    inMaintenance: false,
    message: '',
    canBypass: false,
    loading: true
  });

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const status = await MaintenanceMiddleware.checkMaintenanceStatus(user?.role);
        setMaintenanceStatus({
          inMaintenance: status.inMaintenance,
          message: status.message || '',
          canBypass: status.canBypass || false,
          loading: false
        });
      } catch (error) {
        console.error('Error checking maintenance status:', error);
        setMaintenanceStatus({
          inMaintenance: false,
          message: '',
          canBypass: false,
          loading: false
        });
      }
    };

    checkMaintenance();

    // Check maintenance status every 30 seconds
    const interval = setInterval(checkMaintenance, 30000);

    return () => clearInterval(interval);
  }, [user?.role]);

  if (maintenanceStatus.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If in maintenance mode and user cannot bypass, show maintenance message
  if (maintenanceStatus.inMaintenance && !maintenanceStatus.canBypass) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert className="border-orange-200 bg-orange-50">
            <Wrench className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <strong>System Maintenance</strong>
                </div>
                <p>{maintenanceStatus.message}</p>
                <p className="text-sm text-orange-600">
                  We apologize for any inconvenience. Please try again later.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // If user can bypass or system is not in maintenance, render children
  return <>{children}</>;
};

export default MaintenanceCheck;
