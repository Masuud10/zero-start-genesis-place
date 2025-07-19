import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Wrench,
  AlertTriangle,
  Clock,
  Download,
  Database,
  Shield,
} from "lucide-react";

interface MaintenanceSettings {
  enabled: boolean;
  message: string;
  scheduled_start?: string;
  scheduled_end?: string;
  allowed_roles: string[];
}

const MaintenanceSettings: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<MaintenanceSettings>({
    enabled: false,
    message: "System is currently under maintenance. Please try again later.",
    allowed_roles: ["edufam_admin"],
  });

  useEffect(() => {
    loadMaintenanceSettings();
  }, []);

  const loadMaintenanceSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("setting_value")
        .eq("setting_key", "maintenance_mode")
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data?.setting_value) {
        const parsedSettings =
          data.setting_value as unknown as MaintenanceSettings;
        setSettings(parsedSettings);
      }
    } catch (error: unknown) {
      console.error("Error loading maintenance settings:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load maintenance settings.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveMaintenanceSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("system_settings").upsert({
        setting_key: "maintenance_mode",
        setting_value: JSON.parse(JSON.stringify(settings)),
        description: "System maintenance mode configuration",
      });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Maintenance settings have been updated successfully.",
      });
    } catch (error: unknown) {
      console.error("Error saving maintenance settings:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save maintenance settings.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMaintenanceMode = async (enabled: boolean) => {
    const updatedSettings = { ...settings, enabled };
    setSettings(updatedSettings);

    // Auto-save when toggling maintenance mode
    setSaving(true);
    try {
      const { error } = await supabase.from("system_settings").upsert({
        setting_key: "maintenance_mode",
        setting_value: JSON.parse(JSON.stringify(updatedSettings)),
        description: "System maintenance mode configuration",
      });

      if (error) throw error;

      toast({
        title: enabled
          ? "Maintenance Mode Enabled"
          : "Maintenance Mode Disabled",
        description: enabled
          ? "System is now in maintenance mode. Only EduFam Admins can access the platform."
          : "System is now accessible to all users.",
        variant: enabled ? "destructive" : "default",
      });

      // Force a page refresh to ensure the gatekeeper picks up the change immediately
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: unknown) {
      console.error("Error toggling maintenance mode:", error);
      // Revert the change if save failed
      setSettings(settings);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to toggle maintenance mode.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const downloadBackup = async () => {
    try {
      const timestamp = new Date().toISOString().split("T")[0];

      // Create a comprehensive backup object
      const backupData = {
        exported_at: new Date().toISOString(),
        version: "1.0",
        system_settings: settings,
        metadata: {
          total_tables: "Available in full backup",
          export_type: "lite_backup",
        },
      };

      // Convert to JSON and create download
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `edufam_backup_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup Downloaded",
        description: "System backup has been downloaded successfully.",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create system backup.";
      toast({
        title: "Backup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Maintenance Settings
          </h2>
          <p className="text-gray-600">
            Manage system maintenance mode and backup operations
          </p>
        </div>
        {settings.enabled && (
          <Badge variant="destructive" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Maintenance Active
          </Badge>
        )}
      </div>

      {/* Maintenance Mode Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Maintenance Mode Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium">
                Enable Maintenance Mode
              </Label>
              <p className="text-sm text-gray-600">
                When enabled, only EduFam Admins can access the platform
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={handleToggleMaintenanceMode}
              disabled={saving}
            />
          </div>

          {settings.enabled && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Maintenance Mode is currently ACTIVE.</strong>
                <br />
                All users except EduFam Admins are blocked from accessing the
                platform.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="maintenance-message">Maintenance Message</Label>
            <Textarea
              id="maintenance-message"
              value={settings.message}
              onChange={(e) =>
                setSettings({ ...settings, message: e.target.value })
              }
              placeholder="Enter the message users will see during maintenance..."
              rows={3}
            />
            <p className="text-xs text-gray-500">
              This message will be displayed to users when maintenance mode is
              active.
            </p>
          </div>

          <Button onClick={saveMaintenanceSettings} disabled={saving}>
            {saving ? "Saving..." : "Save Message"}
          </Button>
        </CardContent>
      </Card>

      {/* Backup Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Backup Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Create and download system backups to ensure data safety and
            recovery capabilities.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 border-2 border-dashed border-gray-300">
              <div className="text-center space-y-3">
                <Download className="w-8 h-8 mx-auto text-gray-500" />
                <div>
                  <h3 className="font-medium">Lite Backup</h3>
                  <p className="text-sm text-gray-600">
                    Download system settings and configuration
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadBackup}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Backup
                </Button>
              </div>
            </Card>

            <Card className="p-4 border-2 border-dashed border-blue-300 bg-blue-50">
              <div className="text-center space-y-3">
                <Shield className="w-8 h-8 mx-auto text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">
                    Full Database Backup
                  </h3>
                  <p className="text-sm text-blue-700">
                    Complete database backup (Enterprise feature)
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled className="w-full">
                  <Database className="w-4 h-4 mr-2" />
                  Coming Soon
                </Button>
              </div>
            </Card>
          </div>

          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Backup Schedule:</strong> Automated backups are performed
              daily at 2:00 AM UTC. Manual backups can be triggered anytime
              using the buttons above.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceSettings;
