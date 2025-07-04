import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import MaintenanceModeConfirmationModal from "@/components/modals/MaintenanceModeConfirmationModal";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
import { useAuth } from "@/contexts/AuthContext";
import {
  debugMaintenanceMode,
  checkMaintenanceModeConsistency,
} from "@/utils/debugMaintenanceMode";

const SystemMaintenanceControl = () => {
  const { user } = useAuth();
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "System is currently under maintenance. Please try again later."
  );
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const {
    maintenanceSettings,
    maintenanceStatus,
    isLoading,
    enableMaintenance,
    disableMaintenance,
    updateMessage,
    isEnabling,
    isDisabling,
    isUpdatingMessage,
    refetch,
    settingsError,
  } = useMaintenanceMode();

  // Update local message when settings change
  useEffect(() => {
    if (maintenanceSettings?.message) {
      setMaintenanceMessage(maintenanceSettings.message);
    }
  }, [maintenanceSettings?.message]);

  // Check if user has permission to manage maintenance mode
  const canManageMaintenance = user?.role === "edufam_admin";

  const handleMaintenanceToggle = (enabled: boolean) => {
    if (!canManageMaintenance) {
      console.warn("User does not have permission to manage maintenance mode");
      return;
    }

    if (enabled) {
      // Show confirmation modal for enabling maintenance mode
      setShowConfirmationModal(true);
    } else {
      // Directly disable maintenance mode
      disableMaintenance();
    }
  };

  const handleEnableMaintenance = (message: string) => {
    enableMaintenance({ message });
    setShowConfirmationModal(false);
  };

  const handleSaveMessage = () => {
    if (!maintenanceSettings?.enabled) {
      console.warn("Cannot update message when maintenance mode is disabled");
      return;
    }
    updateMessage(maintenanceMessage);
  };

  // Show error state if there's an error loading settings
  if (settingsError) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load maintenance settings. Please try refreshing the
              page.
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="mt-4"
            disabled={isLoading}
          >
            <Loader2
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading maintenance settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maintenanceEnabled = maintenanceSettings?.enabled || false;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            System Maintenance Control
            {maintenanceEnabled && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="w-3 h-3 mr-1" />
                ACTIVE
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Permission Check */}
          {!canManageMaintenance && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You do not have permission to manage maintenance mode. Only
                EduFam Administrators can control this feature.
              </AlertDescription>
            </Alert>
          )}

          {/* Status Alert */}
          {maintenanceEnabled ? (
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <strong>Maintenance Mode is ACTIVE.</strong> All users except
                EduFam Administrators are blocked from accessing the platform.
                {maintenanceSettings?.estimated_duration && (
                  <div className="mt-1 text-sm">
                    Estimated duration: {maintenanceSettings.estimated_duration}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                System is running normally. All users have full access.
              </AlertDescription>
            </Alert>
          )}

          {/* Maintenance Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium">
                Enable Maintenance Mode
              </Label>
              <p className="text-sm text-gray-600">
                When enabled, only EduFam Administrators can access the platform
              </p>
            </div>
            <Switch
              checked={maintenanceEnabled}
              onCheckedChange={handleMaintenanceToggle}
              disabled={isEnabling || isDisabling || !canManageMaintenance}
            />
          </div>

          {/* Maintenance Message */}
          {maintenanceEnabled && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="maintenance-message">Maintenance Message</Label>
                <Textarea
                  id="maintenance-message"
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  placeholder="Enter the message users will see during maintenance..."
                  rows={3}
                  className="mt-2"
                  disabled={!canManageMaintenance}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be displayed to all blocked users when they
                  try to access the system.
                </p>
              </div>

              <Button
                onClick={handleSaveMessage}
                disabled={isUpdatingMessage || !canManageMaintenance}
                className="w-full"
              >
                {isUpdatingMessage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Message"
                )}
              </Button>
            </div>
          )}

          {/* Current Status Information */}
          {maintenanceStatus && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Maintenance Active:</span>
                  {maintenanceStatus.inMaintenance ? (
                    <XCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  <span
                    className={
                      maintenanceStatus.inMaintenance
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    {maintenanceStatus.inMaintenance ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Can Access:</span>
                  {maintenanceStatus.canBypass ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={
                      maintenanceStatus.canBypass
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {maintenanceStatus.canBypass ? "Yes" : "No"}
                  </span>
                </div>
                {maintenanceStatus.estimatedDuration && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Estimated Duration:</span>
                    <span className="text-gray-600">
                      {maintenanceStatus.estimatedDuration}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <Button
              variant="outline"
              onClick={refetch}
              disabled={isLoading}
              className="w-full"
            >
              <Loader2
                className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh Status
            </Button>

            {maintenanceEnabled && canManageMaintenance && (
              <Button
                variant="outline"
                onClick={() => disableMaintenance()}
                disabled={isDisabling}
                className="w-full"
              >
                {isDisabling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  "Disable Maintenance"
                )}
              </Button>
            )}
          </div>

          {/* Debug Actions (only for development) */}
          {process.env.NODE_ENV === "development" && canManageMaintenance && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={async () => {
                  console.log("🔍 Debug: Starting maintenance mode debug...");
                  await debugMaintenanceMode();
                }}
                className="w-full"
              >
                Debug Maintenance Mode
              </Button>

              <Button
                variant="outline"
                onClick={async () => {
                  console.log("🔍 Debug: Checking consistency...");
                  await checkMaintenanceModeConsistency();
                }}
                className="w-full"
              >
                Check Consistency
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <MaintenanceModeConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleEnableMaintenance}
        isLoading={isEnabling}
      />
    </>
  );
};

export default SystemMaintenanceControl;
