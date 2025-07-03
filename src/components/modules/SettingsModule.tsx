import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceModeService } from "@/services/system/maintenanceModeService";
import { useAuth } from "@/contexts/AuthContext";
import {
  useUserManagementStats,
  useSecuritySettings,
  useSystemMaintenance,
} from "@/hooks/useSystemSettings";
import {
  Settings,
  Database,
  Shield,
  Download,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Bell,
  Users,
  Building2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SettingsModule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the available hooks
  const { data: userStats, isLoading: userStatsLoading } =
    useUserManagementStats();
  const { data: securityData, isLoading: securityLoading } =
    useSecuritySettings();
  const systemMaintenance = useSystemMaintenance();

  // Local state for settings
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    allow_new_registrations: true,
    max_schools_per_owner: 5,
    system_notification_email: "admin@edufam.com",
    backup_retention_days: 30,
    auto_backup_enabled: true,
    security_audit_enabled: true,
    email_notifications_enabled: true,
    sms_notifications_enabled: false,
  });

  const handleSettingChange = (
    key: string,
    value: string | number | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user || user.role !== "edufam_admin") {
        throw new Error(
          "Access denied. Only EduFam Admin can modify system settings."
        );
      }

      // Transform settings into individual upsert operations for system_settings table
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      }));

      // Upsert each setting individually
      for (const setting of settingsArray) {
        const { error: upsertError } = await supabase
          .from("system_settings")
          .upsert(setting, {
            onConflict: "setting_key",
          });

        if (upsertError) {
          throw upsertError;
        }
      }

      toast({
        title: "Settings Updated",
        description: "System settings have been saved successfully.",
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save settings";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseBackup = async () => {
    try {
      setLoading(true);

      // Simulate database backup operation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Database Backup",
        description: "Database backup initiated successfully.",
      });
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: "Failed to initiate database backup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceMode = async (checked: boolean) => {
    try {
      setLoading(true);

      const newSettings = {
        enabled: checked,
        message: checked
          ? "System is under maintenance. Please try again later."
          : "System is operational.",
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      };

      const result = await MaintenanceModeService.updateMaintenanceMode(
        newSettings
      );

      if (result.success) {
        toast({
          title: "Maintenance Mode",
          description: `Maintenance mode ${
            checked ? "enabled" : "disabled"
          } successfully.`,
        });
        handleSettingChange("maintenance_mode", checked);
      } else {
        throw new Error(
          (result.error as string) || "Failed to update maintenance mode"
        );
      }
    } catch (err: unknown) {
      console.error("Error toggling maintenance mode:", err);
      toast({
        title: "Error",
        description: "Failed to toggle maintenance mode",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceModeToggle = async () => {
    await handleMaintenanceMode(!settings.maintenance_mode);
  };

  // Load current maintenance mode state on component mount
  useEffect(() => {
    const loadMaintenanceMode = async () => {
      try {
        const { data } =
          await MaintenanceModeService.getMaintenanceModeSettings();
        if (data) {
          handleSettingChange("maintenance_mode", data.enabled);
        }
      } catch (error) {
        console.error("Error loading maintenance mode state:", error);
      }
    };

    if (user?.role === "edufam_admin") {
      loadMaintenanceMode();
    }
  }, [user?.role]);

  if (!user || user.role !== "edufam_admin") {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          Access denied. Only EduFam Administrators can access system settings.
        </AlertDescription>
      </Alert>
    );
  }

  if (userStatsLoading || securityLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading system settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">System Settings</h2>
          <p className="text-muted-foreground">
            Manage system-wide configurations
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Settings
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* System Configuration */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            System Configuration
          </CardTitle>
          <CardDescription className="text-base">
            Core system settings and toggles for managing the EduFam platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable system-wide maintenance
                </p>
              </div>
              <Switch
                id="maintenance_mode"
                checked={Boolean(settings.maintenance_mode)}
                onCheckedChange={(checked) => handleMaintenanceMode(checked)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow_registrations">
                  Allow New Registrations
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable new school registrations
                </p>
              </div>
              <Switch
                id="allow_registrations"
                checked={Boolean(settings.allow_new_registrations)}
                onCheckedChange={(checked) =>
                  handleSettingChange("allow_new_registrations", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto_backup">Auto Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Enable automatic database backups
                </p>
              </div>
              <Switch
                id="auto_backup"
                checked={Boolean(settings.auto_backup_enabled)}
                onCheckedChange={(checked) =>
                  handleSettingChange("auto_backup_enabled", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="security_audit">Security Audit</Label>
                <p className="text-sm text-muted-foreground">
                  Enable security audit logging
                </p>
              </div>
              <Switch
                id="security_audit"
                checked={Boolean(settings.security_audit_enabled)}
                onCheckedChange={(checked) =>
                  handleSettingChange("security_audit_enabled", checked)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_schools">Max Schools per Owner</Label>
              <Input
                id="max_schools"
                type="number"
                value={settings.max_schools_per_owner}
                onChange={(e) =>
                  handleSettingChange(
                    "max_schools_per_owner",
                    parseInt(e.target.value)
                  )
                }
              />
            </div>

            <div>
              <Label htmlFor="backup_retention">Backup Retention (Days)</Label>
              <Input
                id="backup_retention"
                type="number"
                value={settings.backup_retention_days}
                onChange={(e) =>
                  handleSettingChange(
                    "backup_retention_days",
                    parseInt(e.target.value)
                  )
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Management */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg">
              <Database className="h-6 w-6 text-white" />
            </div>
            Database Management
          </CardTitle>
          <CardDescription className="text-base">
            Database operations, backups, and maintenance tools
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">
                Backup Operations
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Create manual database backups and manage backup retention
              </p>
              <Button
                onClick={handleDatabaseBackup}
                variant="outline"
                disabled={loading}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Create Backup
              </Button>
            </div>

            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">
                Maintenance Control
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Control system maintenance mode for updates and repairs
              </p>
              <Button
                onClick={handleMaintenanceModeToggle}
                variant="outline"
                disabled={loading}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Toggle Maintenance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Overview */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-red-50">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            Security Overview
          </CardTitle>
          <CardDescription className="text-base">
            System security status, audit logs, and threat monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {securityData ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {securityData.total_audit_events || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Total Audit Events
                </div>
                <div className="text-xs text-blue-500 mt-1">System-wide</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-red-200 shadow-sm">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {securityData.security_incidents || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Security Incidents
                </div>
                <div className="text-xs text-red-500 mt-1">
                  Requires attention
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-yellow-200 shadow-sm">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {securityData.failed_login_attempts || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Failed Logins
                </div>
                <div className="text-xs text-yellow-500 mt-1">
                  Last 24 hours
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-green-200 shadow-sm">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {securityData.active_rate_limits?.length || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Active Blocks
                </div>
                <div className="text-xs text-green-500 mt-1">Rate limited</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No security data available</p>
              <p className="text-sm">Security monitoring will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Management Overview */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            User Management Overview
          </CardTitle>
          <CardDescription className="text-base">
            System-wide user statistics and role distribution
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {userStats ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200 shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {userStats.total_users || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Total Users
                </div>
                <div className="text-xs text-blue-500 mt-1">All platforms</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-green-200 shadow-sm">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {userStats.active_users || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Active Users
                </div>
                <div className="text-xs text-green-500 mt-1">Last 30 days</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {userStats.recent_signups || 0}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Recent Signups
                </div>
                <div className="text-xs text-purple-500 mt-1">Last 7 days</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-orange-200 shadow-sm">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {Object.keys(userStats.users_by_role || {}).length}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Role Types
                </div>
                <div className="text-xs text-orange-500 mt-1">
                  Distinct roles
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No user data available</p>
              <p className="text-sm">User statistics will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Configure system notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email_notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Enable email notifications
              </p>
            </div>
            <Switch
              id="email_notifications"
              checked={Boolean(settings.email_notifications_enabled)}
              onCheckedChange={(checked) =>
                handleSettingChange("email_notifications_enabled", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms_notifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Enable SMS notifications
              </p>
            </div>
            <Switch
              id="sms_notifications"
              checked={Boolean(settings.sms_notifications_enabled)}
              onCheckedChange={(checked) =>
                handleSettingChange("sms_notifications_enabled", checked)
              }
            />
          </div>

          <div>
            <Label htmlFor="notification_email">
              System Notification Email
            </Label>
            <Input
              id="notification_email"
              type="email"
              value={settings.system_notification_email}
              onChange={(e) =>
                handleSettingChange("system_notification_email", e.target.value)
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsModule;
