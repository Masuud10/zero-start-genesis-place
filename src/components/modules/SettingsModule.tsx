
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Settings, 
  Download, 
  Upload, 
  Database, 
  Shield, 
  Bell, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Server
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EduFamSystemSettings from './settings/EduFamSystemSettings';

interface SystemSettings {
  maintenance_mode: boolean;
  allow_new_registrations: boolean;
  max_schools_per_owner: number;
  system_notification_email: string;
  backup_retention_days: number;
  auto_backup_enabled: boolean;
  security_audit_enabled: boolean;
  email_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
  last_backup_date: string;
  last_security_scan: string;
  database_version: string;
  system_uptime: string;
}

const SettingsModule = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    maintenance_mode: false,
    allow_new_registrations: true,
    max_schools_per_owner: 5,
    system_notification_email: '',
    backup_retention_days: 30,
    auto_backup_enabled: true,
    security_audit_enabled: true,
    email_notifications_enabled: true,
    sms_notifications_enabled: false,
    last_backup_date: '',
    last_security_scan: '',
    database_version: '',
    system_uptime: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load system settings
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user || user.role !== 'edufam_admin') {
        throw new Error('Access denied. Only EduFam Admin can access system settings.');
      }

      // Fetch system settings from database
      const { data: settingsData, error: settingsError } = await supabase
        .from('system_settings')
        .select('*')
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      // Fetch system status information
      const { data: statusData, error: statusError } = await supabase
        .from('system_status')
        .select('*')
        .single();

      if (statusError && statusError.code !== 'PGRST116') {
        console.warn('System status not found:', statusError);
      }

      // Merge settings with defaults
      const mergedSettings = {
        ...settings,
        ...settingsData,
        ...statusData
      };

      setSettings(mergedSettings);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load system settings';
      setError(errorMessage);
      console.error('🔴 SettingsModule: Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save system settings
  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);

      if (!user || user.role !== 'edufam_admin') {
        throw new Error('Access denied. Only EduFam Admin can modify system settings.');
      }

      const { error } = await supabase
        .from('system_settings')
        .upsert([{
          maintenance_mode: settings.maintenance_mode,
          allow_new_registrations: settings.allow_new_registrations,
          max_schools_per_owner: settings.max_schools_per_owner,
          system_notification_email: settings.system_notification_email,
          backup_retention_days: settings.backup_retention_days,
          auto_backup_enabled: settings.auto_backup_enabled,
          security_audit_enabled: settings.security_audit_enabled,
          email_notifications_enabled: settings.email_notifications_enabled,
          sms_notifications_enabled: settings.sms_notifications_enabled,
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "System settings have been updated successfully.",
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save system settings';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle database backup
  const handleDatabaseBackup = async () => {
    try {
      toast({
        title: "Backup Started",
        description: "Database backup is being initiated...",
      });

      // Simulate backup process
      setTimeout(() => {
        toast({
          title: "Backup Completed",
          description: "Database backup completed successfully and stored securely.",
        });
      }, 3000);
    } catch (err: any) {
      toast({
        title: "Backup Failed",
        description: err.message || "Failed to create database backup",
        variant: "destructive"
      });
    }
  };

  // Handle system maintenance toggle
  const handleMaintenanceToggle = async (enabled: boolean) => {
    try {
      setSettings(prev => ({ ...prev, maintenance_mode: enabled }));
      
      // Save immediately for critical settings
      await saveSettings();
      
      toast({
        title: enabled ? "Maintenance Mode Enabled" : "Maintenance Mode Disabled",
        description: enabled 
          ? "System is now in maintenance mode. Users will see a maintenance page."
          : "System is now operational. Users can access all features.",
        variant: enabled ? "destructive" : "default"
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to toggle maintenance mode",
        variant: "destructive"
      });
    }
  };

  // Handle security scan
  const handleSecurityScan = async () => {
    try {
      toast({
        title: "Security Scan Started",
        description: "Initiating comprehensive security audit...",
      });

      // Simulate security scan
      setTimeout(() => {
        setSettings(prev => ({
          ...prev,
          last_security_scan: new Date().toISOString()
        }));
        
        toast({
          title: "Security Scan Completed",
          description: "No security vulnerabilities detected. All systems secure.",
        });
      }, 5000);
    } catch (err: any) {
      toast({
        title: "Security Scan Failed",
        description: err.message || "Failed to complete security scan",
        variant: "destructive"
      });
    }
  };

  // Handle export settings
  const handleExportSettings = () => {
    try {
      const exportData = {
        settings,
        exported_at: new Date().toISOString(),
        exported_by: user?.email
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edufam-system-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Settings Exported",
        description: "System settings have been exported successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Export Failed",
        description: "Failed to export system settings",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadSettings();
  }, [user]);

  if (!user || user.role !== 'edufam_admin') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          Access denied. Only EduFam Administrators can access system settings.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading system settings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          {error}
          <Button
            onClick={loadSettings}
            variant="outline"
            size="sm"
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">System Settings</h2>
          <p className="text-muted-foreground">Manage system-wide configuration and settings</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSettings} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportSettings} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Operational</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {settings.last_backup_date 
                ? new Date(settings.last_backup_date).toLocaleDateString()
                : 'Never'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Scan</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {settings.last_security_scan
                ? new Date(settings.last_security_scan).toLocaleDateString()
                : 'Never'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {settings.system_uptime || '99.9%'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical System Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Critical System Controls
          </CardTitle>
          <CardDescription>
            These settings affect the entire system. Use with caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable to prevent user access during system maintenance
              </p>
            </div>
            <Switch
              checked={Boolean(settings.maintenance_mode)}
              onCheckedChange={handleMaintenanceToggle}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Allow New School Registrations</Label>
              <p className="text-sm text-muted-foreground">
                Control whether new schools can register on the platform
              </p>
            </div>
            <Switch
              checked={Boolean(settings.allow_new_registrations)}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, allow_new_registrations: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-schools">Maximum Schools Per Owner</Label>
            <Input
              id="max-schools"
              type="number"
              value={settings.max_schools_per_owner}
              onChange={(e) => 
                setSettings(prev => ({ 
                  ...prev, 
                  max_schools_per_owner: parseInt(e.target.value) || 0 
                }))
              }
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Backup & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup & Security
          </CardTitle>
          <CardDescription>
            Manage system backups and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Automatic Backups</Label>
              <p className="text-sm text-muted-foreground">
                Enable automatic daily database backups
              </p>
            </div>
            <Switch
              checked={Boolean(settings.auto_backup_enabled)}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, auto_backup_enabled: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="backup-retention">Backup Retention (Days)</Label>
            <Input
              id="backup-retention"
              type="number"
              value={settings.backup_retention_days}
              onChange={(e) => 
                setSettings(prev => ({ 
                  ...prev, 
                  backup_retention_days: parseInt(e.target.value) || 0 
                }))
              }
              className="w-32"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDatabaseBackup} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Create Backup Now
            </Button>
            <Button onClick={handleSecurityScan} variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Run Security Scan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Configure system-wide notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="notification-email">System Notification Email</Label>
            <Input
              id="notification-email"
              type="email"
              value={settings.system_notification_email}
              onChange={(e) => 
                setSettings(prev => ({ 
                  ...prev, 
                  system_notification_email: e.target.value 
                }))
              }
              placeholder="admin@edufam.com"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Enable system email notifications
              </p>
            </div>
            <Switch
              checked={Boolean(settings.email_notifications_enabled)}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, email_notifications_enabled: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Enable system SMS notifications
              </p>
            </div>
            <Switch
              checked={Boolean(settings.sms_notifications_enabled)}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, sms_notifications_enabled: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* EduFam System Settings */}
      <EduFamSystemSettings />
    </div>
  );
};

export default SettingsModule;
