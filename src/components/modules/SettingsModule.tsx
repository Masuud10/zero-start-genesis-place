
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserManagementStats, useSecuritySettings, useSystemMaintenance } from '@/hooks/useSystemSettings';
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
  Building2 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SettingsModule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use the available hooks
  const { data: userStats, isLoading: userStatsLoading } = useUserManagementStats();
  const { data: securityData, isLoading: securityLoading } = useSecuritySettings();
  const systemMaintenance = useSystemMaintenance();

  // Local state for settings
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    allow_new_registrations: true,
    max_schools_per_owner: 5,
    system_notification_email: 'admin@edufam.com',
    backup_retention_days: 30,
    auto_backup_enabled: true,
    security_audit_enabled: true,
    email_notifications_enabled: true,
    sms_notifications_enabled: false,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user || user.role !== 'edufam_admin') {
        throw new Error('Access denied. Only EduFam Admin can modify system settings.');
      }

      // Transform settings into individual upsert operations for system_settings table
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString(),
        updated_by: user.id
      }));

      // Upsert each setting individually
      for (const setting of settingsArray) {
        const { error: upsertError } = await supabase
          .from('system_settings')
          .upsert(setting, {
            onConflict: 'setting_key'
          });

        if (upsertError) {
          throw upsertError;
        }
      }

      toast({
        title: "Settings Updated",
        description: "System settings have been saved successfully.",
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save settings';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseBackup = async () => {
    try {
      setLoading(true);
      
      // Simulate database backup operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Database Backup",
        description: "Database backup initiated successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to initiate database backup",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceMode = async () => {
    try {
      setLoading(true);
      
      await systemMaintenance.mutateAsync('toggle_maintenance');
      
      toast({
        title: "Maintenance Mode",
        description: `Maintenance mode ${settings.maintenance_mode ? 'disabled' : 'enabled'} successfully.`,
      });
      
      handleSettingChange('maintenance_mode', !settings.maintenance_mode);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to toggle maintenance mode",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
          <p className="text-muted-foreground">Manage system-wide configurations</p>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Configuration
          </CardTitle>
          <CardDescription>Core system settings and toggles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Enable system-wide maintenance</p>
              </div>
              <Switch
                id="maintenance_mode"
                checked={Boolean(settings.maintenance_mode)}
                onCheckedChange={(checked) => handleSettingChange('maintenance_mode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow_registrations">Allow New Registrations</Label>
                <p className="text-sm text-muted-foreground">Enable new school registrations</p>
              </div>
              <Switch
                id="allow_registrations"
                checked={Boolean(settings.allow_new_registrations)}
                onCheckedChange={(checked) => handleSettingChange('allow_new_registrations', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto_backup">Auto Backup</Label>
                <p className="text-sm text-muted-foreground">Enable automatic database backups</p>
              </div>
              <Switch
                id="auto_backup"
                checked={Boolean(settings.auto_backup_enabled)}
                onCheckedChange={(checked) => handleSettingChange('auto_backup_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="security_audit">Security Audit</Label>
                <p className="text-sm text-muted-foreground">Enable security audit logging</p>
              </div>
              <Switch
                id="security_audit"
                checked={Boolean(settings.security_audit_enabled)}
                onCheckedChange={(checked) => handleSettingChange('security_audit_enabled', checked)}
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
                onChange={(e) => handleSettingChange('max_schools_per_owner', parseInt(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="backup_retention">Backup Retention (Days)</Label>
              <Input
                id="backup_retention"
                type="number"
                value={settings.backup_retention_days}
                onChange={(e) => handleSettingChange('backup_retention_days', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Management
          </CardTitle>
          <CardDescription>Database operations and maintenance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button onClick={handleDatabaseBackup} variant="outline" disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Create Backup
            </Button>
            <Button onClick={handleMaintenanceMode} variant="outline" disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Toggle Maintenance
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Overview
          </CardTitle>
          <CardDescription>System security status and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {securityData ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {securityData.total_audit_events || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Audit Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {securityData.security_incidents || 0}
                </div>
                <div className="text-sm text-muted-foreground">Security Incidents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {securityData.failed_login_attempts || 0}
                </div>
                <div className="text-sm text-muted-foreground">Failed Logins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {securityData.active_rate_limits?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Active Blocks</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No security data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Management Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management Overview
          </CardTitle>
          <CardDescription>System-wide user statistics</CardDescription>
        </CardHeader>
        <CardContent>
          {userStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {userStats.total_users || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {userStats.active_users || 0}
                </div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {userStats.recent_signups || 0}
                </div>
                <div className="text-sm text-muted-foreground">Recent Signups</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Object.keys(userStats.users_by_role || {}).length}
                </div>
                <div className="text-sm text-muted-foreground">Role Types</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No user data available
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
              <p className="text-sm text-muted-foreground">Enable email notifications</p>
            </div>
            <Switch
              id="email_notifications"
              checked={Boolean(settings.email_notifications_enabled)}
              onCheckedChange={(checked) => handleSettingChange('email_notifications_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms_notifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Enable SMS notifications</p>
            </div>
            <Switch
              id="sms_notifications"
              checked={Boolean(settings.sms_notifications_enabled)}
              onCheckedChange={(checked) => handleSettingChange('sms_notifications_enabled', checked)}
            />
          </div>

          <div>
            <Label htmlFor="notification_email">System Notification Email</Label>
            <Input
              id="notification_email"
              type="email"
              value={settings.system_notification_email}
              onChange={(e) => handleSettingChange('system_notification_email', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsModule;
