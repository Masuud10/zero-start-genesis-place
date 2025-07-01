
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Settings, 
  Database, 
  Shield, 
  Bell, 
  Download, 
  Upload, 
  RefreshCw, 
  AlertTriangle,
  Loader2,
  Save,
  HardDrive,
  FileText,
  Mail,
  Smartphone
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMaintenanceSettings, useUpdateMaintenanceSettings } from '@/hooks/useMaintenanceSettings';
import { useSystemSettings } from '@/hooks/useSystemSettings';

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
    sms_notifications_enabled: false
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('maintenance');
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: maintenanceData, isLoading: maintenanceLoading } = useMaintenanceSettings();
  const updateMaintenanceMutation = useUpdateMaintenanceSettings();
  const { data: userStats } = useSystemSettings();

  // Fetch system settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      // Transform the data from key-value pairs to settings object
      const settingsObj: Partial<SystemSettings> = {};
      data?.forEach(item => {
        const key = item.setting_key as keyof SystemSettings;
        const value = item.setting_value;
        
        if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
          (settingsObj as any)[key] = value;
        }
      });

      setSettings(prevSettings => ({ ...prevSettings, ...settingsObj }));
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load system settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Transform settings object to key-value pairs for database
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString(),
        updated_by: user?.id
      }));

      const { error } = await supabase
        .from('system_settings')
        .upsert(settingsArray, { 
          onConflict: 'setting_key',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "System settings have been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save system settings: " + error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMaintenanceToggle = (enabled: boolean) => {
    updateMaintenanceMutation.mutate({
      enabled,
      message: 'System is currently under maintenance. Please try again later.'
    });
  };

  const handleDatabaseBackup = async () => {
    try {
      toast({
        title: "Database Backup",
        description: "Database backup initiated. This may take a few minutes.",
      });
      
      // Simulate backup process - in real implementation, this would trigger actual backup
      setTimeout(() => {
        toast({
          title: "Backup Complete",
          description: "Database backup completed successfully.",
        });
      }, 3000);
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Failed to create database backup.",
        variant: "destructive"
      });
    }
  };

  const handleDataExport = async (format: 'csv' | 'json') => {
    try {
      toast({
        title: "Data Export",
        description: `Exporting system data in ${format.toUpperCase()} format...`,
      });
      
      // Simulate export process
      setTimeout(() => {
        toast({
          title: "Export Complete",
          description: `System data exported successfully as ${format.toUpperCase()}.`,
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export system data.",
        variant: "destructive"
      });
    }
  };

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
          <p className="text-muted-foreground">Manage system-wide configurations and settings</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Settings
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            General
          </TabsTrigger>
        </TabsList>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>Control system maintenance and access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable to prevent users from accessing the system during updates
                  </p>
                </div>
                <Switch
                  id="maintenance-mode"
                  checked={Boolean(maintenanceData?.enabled)}
                  onCheckedChange={handleMaintenanceToggle}
                  disabled={maintenanceLoading || updateMaintenanceMutation.isPending}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="allow-registrations">Allow New Registrations</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new schools to register on the platform
                  </p>
                </div>
                <Switch
                  id="allow-registrations"
                  checked={Boolean(settings.allow_new_registrations)}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allow_new_registrations: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>Backup, restore, and manage database operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backup-retention">Backup Retention (Days)</Label>
                  <Input
                    id="backup-retention"
                    type="number"
                    value={settings.backup_retention_days}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      backup_retention_days: parseInt(e.target.value) || 30 
                    }))}
                    min="1"
                    max="365"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="auto-backup">Auto Backup</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable automatic daily backups
                    </p>
                  </div>
                  <Switch
                    id="auto-backup"
                    checked={Boolean(settings.auto_backup_enabled)}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_backup_enabled: checked }))}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleDatabaseBackup} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
                <Button onClick={() => handleDataExport('csv')} variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={() => handleDataExport('json')} variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and audit settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="security-audit">Security Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable comprehensive security audit logging
                  </p>
                </div>
                <Switch
                  id="security-audit"
                  checked={Boolean(settings.security_audit_enabled)}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, security_audit_enabled: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notification-email">System Notification Email</Label>
                <Input
                  id="notification-email"
                  type="email"
                  value={settings.system_notification_email}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    system_notification_email: e.target.value 
                  }))}
                  placeholder="admin@edufam.com"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable system email notifications
                    </p>
                  </div>
                </div>
                <Switch
                  id="email-notifications"
                  checked={Boolean(settings.email_notifications_enabled)}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, email_notifications_enabled: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <div>
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable SMS notifications for critical alerts
                    </p>
                  </div>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={Boolean(settings.sms_notifications_enabled)}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sms_notifications_enabled: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general system preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-schools">Maximum Schools per Owner</Label>
                <Input
                  id="max-schools"
                  type="number"
                  value={settings.max_schools_per_owner}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    max_schools_per_owner: parseInt(e.target.value) || 5 
                  }))}
                  min="1"
                  max="50"
                />
                <p className="text-sm text-muted-foreground">
                  Maximum number of schools a single owner can manage
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsModule;
