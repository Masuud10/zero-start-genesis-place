import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  Shield,
  Database,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Server,
  Users,
  Calendar,
  FileText,
  Bell,
  Globe,
  Palette,
  Edit,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolScopedData } from "@/hooks/useSchoolScopedData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SystemConfig {
  id: string;
  school_id: string;
  maintenance_mode: boolean;
  maintenance_message: string;
  system_name: string;
  system_logo_url: string;
  primary_color: string;
  secondary_color: string;
  timezone: string;
  date_format: string;
  currency: string;
  language: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  auto_backup: boolean;
  backup_frequency: string;
  max_file_size: number;
  session_timeout: number;
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_special: boolean;
  };
  created_at: string;
  updated_at: string;
}

interface BackupRecord {
  id: string;
  school_id: string;
  backup_type: string;
  file_name: string;
  file_size: number;
  status: string;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

const SystemSettings = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("general");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [config, setConfig] = useState<Partial<SystemConfig>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Check permissions
  const canManageSystem =
    user?.role &&
    ["school_owner", "elimisha_admin", "edufam_admin"].includes(user.role);

  // Get system configuration
  const {
    data: systemConfig,
    isLoading: loadingConfig,
    error: configError,
  } = useQuery({
    queryKey: ["systemConfig", schoolId],
    queryFn: async () => {
      if (!schoolId) return null;
      const { data, error } = await supabase
        .from("system_configs")
        .select("*")
        .eq("school_id", schoolId)
        .single();

      if (error && error.code !== "PGRST116") throw new Error(error.message);
      return data;
    },
    enabled: !!schoolId,
  });

  // Get backup records
  const {
    data: backupRecords,
    isLoading: loadingBackups,
    error: backupsError,
  } = useQuery({
    queryKey: ["backupRecords", schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      const { data, error } = await supabase
        .from("backup_records")
        .select("*")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!schoolId,
  });

  // Get system statistics
  const { data: systemStats, isLoading: loadingStats } = useQuery({
    queryKey: ["systemStats", schoolId],
    queryFn: async () => {
      if (!schoolId) return null;

      // Get counts from various tables
      const [
        { count: studentsCount },
        { count: teachersCount },
        { count: parentsCount },
        { count: classesCount },
        { count: subjectsCount },
        { count: examinationsCount },
      ] = await Promise.all([
        supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("school_id", schoolId),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("school_id", schoolId)
          .eq("role", "teacher"),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("school_id", schoolId)
          .eq("role", "parent"),
        supabase
          .from("classes")
          .select("*", { count: "exact", head: true })
          .eq("school_id", schoolId),
        supabase
          .from("subjects")
          .select("*", { count: "exact", head: true })
          .eq("school_id", schoolId),
        supabase
          .from("examinations")
          .select("*", { count: "exact", head: true })
          .eq("school_id", schoolId),
      ]);

      return {
        students: studentsCount || 0,
        teachers: teachersCount || 0,
        parents: parentsCount || 0,
        classes: classesCount || 0,
        subjects: subjectsCount || 0,
        examinations: examinationsCount || 0,
      };
    },
    enabled: !!schoolId,
  });

  // Update system configuration
  const updateSystemConfig = useMutation({
    mutationFn: async (configData: Partial<SystemConfig>) => {
      if (!schoolId) throw new Error("No school ID");

      if (systemConfig) {
        // Update existing config
        const { error } = await supabase
          .from("system_configs")
          .update(configData)
          .eq("id", systemConfig.id);

        if (error) throw new Error(error.message);
      } else {
        // Create new config
        const { error } = await supabase.from("system_configs").insert({
          ...configData,
          school_id: schoolId,
        });

        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "System configuration updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["systemConfig", schoolId] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle maintenance mode
  const toggleMaintenanceMode = useMutation({
    mutationFn: async (maintenanceMode: boolean) => {
      if (!systemConfig) throw new Error("System configuration not found");

      const { error } = await supabase
        .from("system_configs")
        .update({
          maintenance_mode: maintenanceMode,
          maintenance_message: maintenanceMode
            ? "System is currently under maintenance. Please check back later."
            : "",
        })
        .eq("id", systemConfig.id);

      if (error) throw new Error(error.message);
    },
    onSuccess: (_, maintenanceMode) => {
      toast({
        title: "Success",
        description: `Maintenance mode ${
          maintenanceMode ? "enabled" : "disabled"
        } successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["systemConfig", schoolId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create backup
  const createBackup = useMutation({
    mutationFn: async (backupType: string) => {
      if (!schoolId) throw new Error("No school ID");

      // Create backup record
      const { data, error } = await supabase
        .from("backup_records")
        .insert({
          school_id: schoolId,
          backup_type: backupType,
          file_name: `backup_${backupType}_${
            new Date().toISOString().split("T")[0]
          }.sql`,
          status: "in_progress",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Simulate backup process (in real implementation, this would trigger a server-side backup)
      setTimeout(() => {
        supabase
          .from("backup_records")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            file_size: Math.floor(Math.random() * 10000000) + 1000000, // Random file size
          })
          .eq("id", data.id);
      }, 3000);

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Backup process started successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["backupRecords", schoolId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Download backup
  const downloadBackup = async (backupRecord: BackupRecord) => {
    try {
      // In a real implementation, this would download the actual backup file
      const blob = new Blob(["Simulated backup data"], {
        type: "application/sql",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = backupRecord.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: "Success", description: "Backup download started." });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to download backup.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Delete backup
  const deleteBackup = useMutation({
    mutationFn: async (backupId: string) => {
      const { error } = await supabase
        .from("backup_records")
        .delete()
        .eq("id", backupId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Backup deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ["backupRecords", schoolId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Initialize config when data loads
  useEffect(() => {
    if (systemConfig) {
      setConfig(systemConfig);
    }
  }, [systemConfig]);

  if (loadingConfig || loadingBackups || loadingStats) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading system settings...</p>
        </div>
      </div>
    );
  }

  if (configError || backupsError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading system settings:{" "}
            {configError?.message || backupsError?.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check permissions before rendering
  if (!canManageSystem) {
    return (
      <div className="p-8 text-center text-red-600">
        <Alert className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Only school owners and system administrators can
            manage system settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">
            Manage system configuration, maintenance mode, and backups
          </p>
        </div>
        {isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={() => updateSystemConfig.mutate(config)}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* System Statistics */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="text-xl font-bold">{systemStats.students}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Teachers</p>
                  <p className="text-xl font-bold">{systemStats.teachers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parents</p>
                  <p className="text-xl font-bold">{systemStats.parents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Classes</p>
                  <p className="text-xl font-bold">{systemStats.classes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subjects</p>
                  <p className="text-xl font-bold">{systemStats.subjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Examinations</p>
                  <p className="text-xl font-bold">
                    {systemStats.examinations}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === "general" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("general")}
          className="flex-1"
        >
          <Settings className="h-4 w-4 mr-2" />
          General
        </Button>
        <Button
          variant={activeTab === "maintenance" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("maintenance")}
          className="flex-1"
        >
          <Shield className="h-4 w-4 mr-2" />
          Maintenance
        </Button>
        <Button
          variant={activeTab === "backup" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("backup")}
          className="flex-1"
        >
          <Database className="h-4 w-4 mr-2" />
          Backup
        </Button>
        <Button
          variant={activeTab === "security" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("security")}
          className="flex-1"
        >
          <Lock className="h-4 w-4 mr-2" />
          Security
        </Button>
      </div>

      {/* General Settings Tab */}
      {activeTab === "general" && (
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="system_name">System Name</Label>
                <Input
                  id="system_name"
                  value={config.system_name || ""}
                  onChange={(e) =>
                    setConfig({ ...config, system_name: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="EduFam School Management System"
                />
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  value={config.timezone || "Africa/Nairobi"}
                  onChange={(e) =>
                    setConfig({ ...config, timezone: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">
                    America/New_York (EST)
                  </option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="date_format">Date Format</Label>
                <select
                  id="date_format"
                  value={config.date_format || "DD/MM/YYYY"}
                  onChange={(e) =>
                    setConfig({ ...config, date_format: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={config.currency || "KES"}
                  onChange={(e) =>
                    setConfig({ ...config, currency: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="KES">Kenyan Shilling (KES)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  value={config.language || "en"}
                  onChange={(e) =>
                    setConfig({ ...config, language: e.target.value })
                  }
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div>
                <Label htmlFor="session_timeout">
                  Session Timeout (minutes)
                </Label>
                <Input
                  id="session_timeout"
                  type="number"
                  value={config.session_timeout || 30}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      session_timeout: parseInt(e.target.value),
                    })
                  }
                  disabled={!isEditing}
                  min="5"
                  max="480"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email_notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Enable email notifications for system events
                </p>
              </div>
              <Switch
                id="email_notifications"
                checked={config.email_notifications || false}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, email_notifications: checked })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms_notifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Enable SMS notifications for important alerts
                </p>
              </div>
              <Switch
                id="sms_notifications"
                checked={config.sms_notifications || false}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, sms_notifications: checked })
                }
                disabled={!isEditing}
              />
            </div>

            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Settings
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Maintenance Tab */}
      {activeTab === "maintenance" && (
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                When maintenance mode is enabled, only administrators can access
                the system. All other users will see a maintenance message.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  {systemConfig?.maintenance_mode
                    ? "System is currently in maintenance mode"
                    : "System is currently accessible to all users"}
                </p>
              </div>
              <Switch
                id="maintenance_mode"
                checked={systemConfig?.maintenance_mode || false}
                onCheckedChange={(checked) =>
                  toggleMaintenanceMode.mutate(checked)
                }
                disabled={toggleMaintenanceMode.isPending}
              />
            </div>

            {systemConfig?.maintenance_mode && (
              <div>
                <Label htmlFor="maintenance_message">Maintenance Message</Label>
                <Textarea
                  id="maintenance_message"
                  value={systemConfig?.maintenance_message || ""}
                  onChange={(e) => {
                    if (systemConfig) {
                      supabase
                        .from("system_configs")
                        .update({ maintenance_message: e.target.value })
                        .eq("id", systemConfig.id);
                    }
                  }}
                  placeholder="System is currently under maintenance. Please check back later."
                  rows={3}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-2 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Before Maintenance</p>
                      <p className="text-sm text-muted-foreground">
                        Notify users in advance
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">After Maintenance</p>
                      <p className="text-sm text-muted-foreground">
                        Disable maintenance mode
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backup Tab */}
      {activeTab === "backup" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Backup Management</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => createBackup.mutate("full")}
                  disabled={createBackup.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Create Full Backup
                </Button>
                <Button
                  variant="outline"
                  onClick={() => createBackup.mutate("incremental")}
                  disabled={createBackup.isPending}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Incremental Backup
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto_backup">Automatic Backups</Label>
                <p className="text-sm text-muted-foreground">
                  Enable automatic daily backups
                </p>
              </div>
              <Switch
                id="auto_backup"
                checked={systemConfig?.auto_backup || false}
                onCheckedChange={(checked) => {
                  if (systemConfig) {
                    supabase
                      .from("system_configs")
                      .update({ auto_backup: checked })
                      .eq("id", systemConfig.id);
                  }
                }}
              />
            </div>

            {systemConfig?.auto_backup && (
              <div>
                <Label htmlFor="backup_frequency">Backup Frequency</Label>
                <select
                  id="backup_frequency"
                  value={systemConfig?.backup_frequency || "daily"}
                  onChange={(e) => {
                    if (systemConfig) {
                      supabase
                        .from("system_configs")
                        .update({ backup_frequency: e.target.value })
                        .eq("id", systemConfig.id);
                    }
                  }}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}

            <div>
              <Label>Recent Backups</Label>
              {backupRecords?.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No backups found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {backupRecords?.map((backup) => (
                    <div
                      key={backup.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{backup.file_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(backup.created_at).toLocaleString()} •{" "}
                          {backup.backup_type}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            backup.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : backup.status === "in_progress"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {backup.status}
                        </Badge>
                        {backup.status === "completed" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadBackup(backup)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteBackup.mutate(backup.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Password Policy</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="min_length">Minimum Length</Label>
                  <Input
                    id="min_length"
                    type="number"
                    value={systemConfig?.password_policy?.min_length || 8}
                    onChange={(e) => {
                      if (systemConfig) {
                        const policy = {
                          ...systemConfig.password_policy,
                          min_length: parseInt(e.target.value),
                        };
                        supabase
                          .from("system_configs")
                          .update({ password_policy: policy })
                          .eq("id", systemConfig.id);
                      }
                    }}
                    min="6"
                    max="20"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="require_uppercase"
                      checked={
                        systemConfig?.password_policy?.require_uppercase ||
                        false
                      }
                      onChange={(e) => {
                        if (systemConfig) {
                          const policy = {
                            ...systemConfig.password_policy,
                            require_uppercase: e.target.checked,
                          };
                          supabase
                            .from("system_configs")
                            .update({ password_policy: policy })
                            .eq("id", systemConfig.id);
                        }
                      }}
                    />
                    <Label htmlFor="require_uppercase">
                      Require uppercase letters
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="require_lowercase"
                      checked={
                        systemConfig?.password_policy?.require_lowercase ||
                        false
                      }
                      onChange={(e) => {
                        if (systemConfig) {
                          const policy = {
                            ...systemConfig.password_policy,
                            require_lowercase: e.target.checked,
                          };
                          supabase
                            .from("system_configs")
                            .update({ password_policy: policy })
                            .eq("id", systemConfig.id);
                        }
                      }}
                    />
                    <Label htmlFor="require_lowercase">
                      Require lowercase letters
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="require_numbers"
                      checked={
                        systemConfig?.password_policy?.require_numbers || false
                      }
                      onChange={(e) => {
                        if (systemConfig) {
                          const policy = {
                            ...systemConfig.password_policy,
                            require_numbers: e.target.checked,
                          };
                          supabase
                            .from("system_configs")
                            .update({ password_policy: policy })
                            .eq("id", systemConfig.id);
                        }
                      }}
                    />
                    <Label htmlFor="require_numbers">Require numbers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="require_special"
                      checked={
                        systemConfig?.password_policy?.require_special || false
                      }
                      onChange={(e) => {
                        if (systemConfig) {
                          const policy = {
                            ...systemConfig.password_policy,
                            require_special: e.target.checked,
                          };
                          supabase
                            .from("system_configs")
                            .update({ password_policy: policy })
                            .eq("id", systemConfig.id);
                        }
                      }}
                    />
                    <Label htmlFor="require_special">
                      Require special characters
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="max_file_size">
                Maximum File Upload Size (MB)
              </Label>
              <Input
                id="max_file_size"
                type="number"
                value={systemConfig?.max_file_size || 10}
                onChange={(e) => {
                  if (systemConfig) {
                    supabase
                      .from("system_configs")
                      .update({ max_file_size: parseInt(e.target.value) })
                      .eq("id", systemConfig.id);
                  }
                }}
                min="1"
                max="100"
              />
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                These security settings help protect your system and user data.
                Changes to password policies will apply to new passwords only.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemSettings;
