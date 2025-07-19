import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, RefreshCw, Loader2 } from "lucide-react";
import { MaintenanceModeService } from "@/services/system/maintenanceModeService";
import { useAuth } from "@/contexts/AuthContext";

const MaintenancePage: React.FC = () => {
  const { user } = useAuth();
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>(
    "System is currently under maintenance. Please try again later."
  );
  const [estimatedDuration, setEstimatedDuration] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    loadMaintenanceInfo();
  }, []);

  const loadMaintenanceInfo = async () => {
    try {
      setIsLoading(true);

      // Get maintenance status for current user
      const status = await MaintenanceModeService.getMaintenanceStatus(
        user?.role
      );

      if (status.message) {
        setMaintenanceMessage(status.message);
      }

      if (status.estimatedDuration) {
        setEstimatedDuration(status.estimatedDuration);
      }

      setLastChecked(new Date());
    } catch (error) {
      console.error("Error loading maintenance info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadMaintenanceInfo();
  };

  const handleRetryAccess = () => {
    window.location.reload();
  };

  // If user is admin and can bypass, show different message
  const canBypass = MaintenanceModeService.canRoleAccessDuringMaintenance(
    user?.role
  );

  if (canBypass) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Maintenance Mode Active
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              The system is currently in maintenance mode. As an administrator,
              you can still access the system.
            </p>
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              className="w-full"
            >
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            System Under Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-gray-600 leading-relaxed">
                  {maintenanceMessage}
                </p>
                {estimatedDuration && (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Estimated duration: {estimatedDuration}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleRetryAccess}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Try Again
                </Button>

                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Check Status
                    </>
                  )}
                </Button>
              </div>

              <div className="text-xs text-gray-400">
                Last checked: {lastChecked.toLocaleTimeString()}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenancePage;
