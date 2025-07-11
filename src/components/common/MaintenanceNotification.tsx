import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Clock } from "lucide-react";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
import { useAuth } from "@/contexts/AuthContext";

const MaintenanceNotification: React.FC = () => {
  const { user } = useAuth();
  const { maintenanceStatus, maintenanceSettings } = useMaintenanceMode();

  // Only show notification if maintenance mode is enabled
  if (!maintenanceStatus?.inMaintenance) {
    return null;
  }

  // Don't show notification for users who are blocked (they should see the maintenance page)
  if (!maintenanceStatus.canBypass) {
    return null;
  }

  // Don't show notification for non-authenticated users
  if (!user) {
    return null;
  }

  return (
    <Alert className="border-orange-200 bg-orange-50 mb-4">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-700">
        <strong>Maintenance Mode Active:</strong> The system is currently in
        maintenance mode. As an administrator, you can still access the system.
        {maintenanceSettings?.message && (
          <div className="mt-1 text-sm">
            <strong>Message:</strong> {maintenanceSettings.message}
          </div>
        )}
        {maintenanceSettings?.estimated_duration && (
          <div className="mt-1 text-sm flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              Estimated duration: {maintenanceSettings.estimated_duration}
            </span>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default MaintenanceNotification;
