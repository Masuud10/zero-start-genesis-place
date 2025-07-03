import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MaintenanceModeService } from "@/services/system/maintenanceModeService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MaintenanceCheckProps {
  children: React.ReactNode;
}

const MaintenanceCheck: React.FC<MaintenanceCheckProps> = ({ children }) => {
  const { user } = useAuth();
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkMaintenanceMode();
  }, []);

  const checkMaintenanceMode = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const isEnabled = await MaintenanceModeService.isMaintenanceModeEnabled();
      setIsMaintenanceMode(isEnabled);

      if (isEnabled) {
        const message = await MaintenanceModeService.getMaintenanceMessage();
        setMaintenanceMessage(message);
      }
    } catch (err) {
      console.error("Error checking maintenance mode:", err);
      setError("Unable to verify system status");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Checking system status...</p>
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
              onClick={checkMaintenanceMode}
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

  // Check if maintenance mode is enabled and user is not admin
  if (isMaintenanceMode && user?.role !== "edufam_admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Settings className="h-5 w-5" />
              System Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700">
                {maintenanceMessage ||
                  "System is currently under maintenance. Please try again later."}
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-4">
                We're performing scheduled maintenance to improve your
                experience.
              </p>
              <Button
                onClick={checkMaintenanceMode}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Allow access for admin users or when maintenance mode is disabled
  return <>{children}</>;
};

export default MaintenanceCheck;
