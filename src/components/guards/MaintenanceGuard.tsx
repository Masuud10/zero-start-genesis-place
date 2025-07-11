import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MaintenanceModeService } from "@/services/system/maintenanceModeService";
import MaintenancePage from "@/components/maintenance/MaintenancePage";
import { Loader2 } from "lucide-react";

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

const MaintenanceGuard: React.FC<MaintenanceGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [maintenanceStatus, setMaintenanceStatus] = useState<{
    inMaintenance: boolean;
    canAccess: boolean;
    message?: string;
  } | null>(null);

  useEffect(() => {
    checkMaintenanceStatus();
  }, [user]);

  const checkMaintenanceStatus = async () => {
    try {
      setIsChecking(true);
      console.log(
        "🔍 MaintenanceGuard: Checking maintenance status for user:",
        user?.id,
        "role:",
        user?.role
      );

      const status = await MaintenanceModeService.getMaintenanceStatus(
        user?.role
      );

      console.log("🔍 MaintenanceGuard: Maintenance status:", status);

      setMaintenanceStatus({
        inMaintenance: status.inMaintenance,
        canAccess: status.canBypass,
        message: status.message,
      });

      // Additional debug logging
      console.log("🔍 MaintenanceGuard: Final decision:", {
        inMaintenance: status.inMaintenance,
        canBypass: status.canBypass,
        userRole: user?.role,
        shouldBlock: status.inMaintenance && !status.canBypass,
        shouldShowWarning: status.inMaintenance && status.canBypass,
        shouldAllow: !status.inMaintenance || status.canBypass,
      });
    } catch (error) {
      console.error(
        "🔍 MaintenanceGuard: Error checking maintenance status:",
        error
      );
      // On error, allow access to prevent blocking legitimate users
      setMaintenanceStatus({
        inMaintenance: false,
        canAccess: true,
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Checking system status...</p>
        </div>
      </div>
    );
  }

  // If in maintenance mode and user cannot access, show maintenance page
  if (maintenanceStatus?.inMaintenance && !maintenanceStatus?.canAccess) {
    console.log(
      "🚫 MaintenanceGuard: Blocking user access - showing maintenance page"
    );
    return <MaintenancePage />;
  }

  // If user can access during maintenance, show warning but allow access
  if (maintenanceStatus?.inMaintenance && maintenanceStatus?.canAccess) {
    console.log(
      "⚠️ MaintenanceGuard: User can bypass maintenance - showing warning"
    );
    return (
      <div>
        {/* Maintenance warning banner for admins */}
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-orange-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-orange-700">
                <strong>Maintenance Mode Active:</strong> The system is
                currently in maintenance mode. As an administrator, you can
                still access the system.
              </p>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Normal access
  console.log("✅ MaintenanceGuard: Allowing normal access");
  return <>{children}</>;
};

export default MaintenanceGuard;
