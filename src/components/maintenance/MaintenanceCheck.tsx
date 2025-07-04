import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MaintenancePage from "./MaintenancePage";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
import { MaintenanceModeService } from "@/services/system/maintenanceModeService";

interface MaintenanceCheckProps {
  children: React.ReactNode;
}

const MaintenanceCheck: React.FC<MaintenanceCheckProps> = ({ children }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maintenanceBlocked, setMaintenanceBlocked] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>("");
  const [estimatedDuration, setEstimatedDuration] = useState<string>("");

  const {
    maintenanceStatus,
    isLoading: isLoadingStatus,
    statusError,
    refetch: refetchStatus,
    isBlockedByMaintenance,
  } = useMaintenanceMode();

  useEffect(() => {
    const checkMaintenanceAccess = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // If user is not authenticated, allow access to login/auth pages
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Check maintenance status directly from service for more reliability
        const accessCheck = await MaintenanceModeService.checkUserAccess(
          user.role
        );

        if (!accessCheck.allowed) {
          setMaintenanceBlocked(true);
          setMaintenanceMessage(
            accessCheck.reason || "System is under maintenance"
          );

          // Get additional maintenance details
          const status = await MaintenanceModeService.getMaintenanceStatus(
            user.role
          );
          setEstimatedDuration(status.estimatedDuration || "");
        } else {
          setMaintenanceBlocked(false);
        }
      } catch (err) {
        console.error("Error checking maintenance access:", err);
        setError("Unable to verify system status. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    checkMaintenanceAccess();
  }, [user, maintenanceStatus]);

  // Handle maintenance status changes from the hook
  useEffect(() => {
    if (maintenanceStatus) {
      if (maintenanceStatus.inMaintenance && !maintenanceStatus.canBypass) {
        setMaintenanceBlocked(true);
        setMaintenanceMessage(
          maintenanceStatus.message || "System is under maintenance"
        );
        setEstimatedDuration(maintenanceStatus.estimatedDuration || "");
      } else {
        setMaintenanceBlocked(false);
      }
    }
  }, [maintenanceStatus]);

  // Handle errors from the hook
  useEffect(() => {
    if (statusError) {
      setError("Unable to verify system status");
    }
  }, [statusError]);

  const handleRetry = async () => {
    setError(null);
    setMaintenanceBlocked(false);
    await refetchStatus();

    // Re-check maintenance access
    if (user) {
      try {
        const accessCheck = await MaintenanceModeService.checkUserAccess(
          user.role
        );
        if (!accessCheck.allowed) {
          setMaintenanceBlocked(true);
          setMaintenanceMessage(
            accessCheck.reason || "System is under maintenance"
          );
        }
      } catch (err) {
        console.error("Error re-checking maintenance access:", err);
        setError("Unable to verify system status");
      }
    }
  };

  // Show loading state
  if (isLoading || isLoadingStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Checking system status...</p>
          <p className="text-sm text-gray-500 mt-2">
            Verifying maintenance mode...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              System Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleRetry}
              className="mt-4 w-full"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is blocked by maintenance mode
  if (maintenanceBlocked) {
    console.log("🚫 MaintenanceCheck: User blocked by maintenance mode", {
      userRole: user?.role,
      maintenanceMessage,
      estimatedDuration,
    });

    return (
      <MaintenancePage
        message={maintenanceMessage}
        estimatedDuration={estimatedDuration}
        onRetry={handleRetry}
      />
    );
  }

  // Log successful access for debugging
  if (user) {
    console.log("✅ MaintenanceCheck: User allowed access", {
      userRole: user.role,
      maintenanceStatus: maintenanceStatus?.inMaintenance,
      canBypass: maintenanceStatus?.canBypass,
    });
  }

  // Allow access for admin users or when maintenance mode is disabled
  return <>{children}</>;
};

export default MaintenanceCheck;
