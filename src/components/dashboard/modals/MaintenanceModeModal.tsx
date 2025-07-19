import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  Users,
  Database,
  Server,
  Zap,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MaintenanceStatus {
  isEnabled: boolean;
  message: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  affectedServices: string[];
  estimatedDuration: string;
  lastUpdated: string;
  updatedBy: string;
}

const MaintenanceModeModal: React.FC<MaintenanceModeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [status, setStatus] = useState<MaintenanceStatus>({
    isEnabled: false,
    message: "",
    affectedServices: [],
    estimatedDuration: "",
    lastUpdated: "",
    updatedBy: "",
  });
  const [loading, setLoading] = useState(false);
  const [showScheduled, setShowScheduled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchMaintenanceStatus();
    }
  }, [isOpen]);

  const fetchMaintenanceStatus = async () => {
    try {
      setLoading(true);

      // Fetch maintenance status from database
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .eq("setting_key", "maintenance_mode")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching maintenance status:", error);
        return;
      }

      if (data) {
        const maintenanceData = data.setting_value as unknown as MaintenanceStatus;
        setStatus(maintenanceData);
        setMaintenanceMessage(maintenanceData.message);
        setScheduledStart(maintenanceData.scheduledStart || "");
        setScheduledEnd(maintenanceData.scheduledEnd || "");
        setEstimatedDuration(maintenanceData.estimatedDuration || "");
      }
    } catch (error) {
      console.error("Error fetching maintenance status:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMaintenanceMode = async (enabled: boolean) => {
    try {
      setLoading(true);

      const updatedStatus: MaintenanceStatus = {
        ...status,
        isEnabled: enabled,
        message: enabled ? maintenanceMessage : "",
        lastUpdated: new Date().toISOString(),
        updatedBy: "Unknown", // Removed user?.email
      };

      // Update maintenance status in database
      const { error } = await supabase.from("system_settings").upsert({
        setting_key: "maintenance_mode",
        setting_value: updatedStatus as unknown as Record<string, any>,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error updating maintenance status:", error);
        return;
      }

      setStatus(updatedStatus);
    } catch (error) {
      console.error("Error toggling maintenance mode:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveScheduledMaintenance = async () => {
    try {
      setLoading(true);

      const updatedStatus: MaintenanceStatus = {
        ...status,
        scheduledStart,
        scheduledEnd,
        estimatedDuration,
        lastUpdated: new Date().toISOString(),
        updatedBy: "Unknown", // Removed user?.email
      };

      const { error } = await supabase.from("system_settings").upsert({
        setting_key: "maintenance_mode",
        setting_value: updatedStatus as unknown as Record<string, any>,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error saving scheduled maintenance:", error);
        return;
      }

      setStatus(updatedStatus);
      setShowScheduled(false);
    } catch (error) {
      console.error("Error saving scheduled maintenance:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    return status.isEnabled
      ? "bg-red-100 text-red-800"
      : "bg-green-100 text-green-800";
  };

  const getStatusIcon = () => {
    return status.isEnabled ? (
      <AlertTriangle className="h-4 w-4" />
    ) : (
      <CheckCircle className="h-4 w-4" />
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Maintenance Mode</span>
          </DialogTitle>
          <DialogDescription>
            Control system maintenance mode and schedule maintenance windows.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Status</span>
                <Badge className={getStatusColor()}>
                  {getStatusIcon()}
                  <span className="ml-1">
                    {status.isEnabled ? "Maintenance Active" : "System Online"}
                  </span>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {status.lastUpdated
                      ? new Date(status.lastUpdated).toLocaleString()
                      : "Never"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Updated By</Label>
                  <p className="text-sm text-muted-foreground">
                    {status.updatedBy || "Unknown"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Toggle */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Enable or disable maintenance mode immediately
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    Maintenance Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {status.isEnabled
                      ? "System is currently in maintenance mode"
                      : "System is running normally"}
                  </p>
                </div>
                <Switch
                  checked={status.isEnabled}
                  onCheckedChange={toggleMaintenanceMode}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Message */}
          {status.isEnabled && (
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Message</CardTitle>
                <CardDescription>
                  Message displayed to users during maintenance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter maintenance message..."
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  rows={3}
                />
              </CardContent>
            </Card>
          )}

          {/* Scheduled Maintenance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Scheduled Maintenance</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScheduled(!showScheduled)}
                >
                  {showScheduled ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="ml-2">
                    {showScheduled ? "Hide" : "Show"} Schedule
                  </span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showScheduled ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="datetime-local"
                        value={scheduledStart}
                        onChange={(e) => setScheduledStart(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-time">End Time</Label>
                      <Input
                        id="end-time"
                        type="datetime-local"
                        value={scheduledEnd}
                        onChange={(e) => setScheduledEnd(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="duration">Estimated Duration</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 2 hours"
                      value={estimatedDuration}
                      onChange={(e) => setEstimatedDuration(e.target.value)}
                    />
                  </div>
                  <Button onClick={saveScheduledMaintenance} disabled={loading}>
                    {loading ? "Saving..." : "Save Schedule"}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to configure scheduled maintenance
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Affected Services */}
          <Card>
            <CardHeader>
              <CardTitle>Affected Services</CardTitle>
              <CardDescription>
                Services that will be affected during maintenance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    name: "User Authentication",
                    icon: <Users className="h-4 w-4" />,
                  },
                  {
                    name: "Database Operations",
                    icon: <Database className="h-4 w-4" />,
                  },
                  {
                    name: "API Services",
                    icon: <Server className="h-4 w-4" />,
                  },
                  { name: "File Storage", icon: <Zap className="h-4 w-4" /> },
                  {
                    name: "Security Services",
                    icon: <Shield className="h-4 w-4" />,
                  },
                  {
                    name: "Communication",
                    icon: <MessageSquare className="h-4 w-4" />,
                  },
                ].map((service) => (
                  <div
                    key={service.name}
                    className="flex items-center space-x-2 p-3 border rounded-lg"
                  >
                    {service.icon}
                    <span className="text-sm font-medium">{service.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Warning Alert */}
          {status.isEnabled && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Maintenance Mode Active</AlertTitle>
              <AlertDescription>
                The system is currently in maintenance mode. Users may
                experience service interruptions. Please ensure all critical
                operations are completed before enabling maintenance mode.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={fetchMaintenanceStatus} disabled={loading}>
            {loading ? "Loading..." : "Refresh Status"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceModeModal;
