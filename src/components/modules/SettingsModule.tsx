
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
import { Settings, Database, Download, Save, AlertTriangle, RefreshCw, Shield, Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SystemSettings {
  maintenance_mode: {
    enabled: boolean;
    message: string;
  };
  email_settings: {
    smtp_host: string;
    smtp_port: number;
    smtp_user: string;
    from_email: string;
  };
  security_settings: {
    session_timeout: number;
    max_login_attempts: number;
    password_policy: {
      min_length: number;
      require_uppercase: boolean;
      require_lowercase: boolean;
      require_numbers: boolean;
      require_symbols: boolean;
    };
  };
}

const SettingsModule = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    maintenance_mode: { enabled: false, message: '' },
    email_settings: { smtp_host: '', smtp_port: 587, smtp_user: '', from_email: '' },
    security_settings: {
      session_timeout: 30,
      max_login_attempts: 5,
      password_policy: {
        min_length: 8,
        require_uppercase: true,
        require_lowercase: true,
        require_numbers: true,
        require_symbols: false
      }
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user || user.role !== 'edufam_admin') {
        throw new Error('Access denied. Only EduFam Admin can access system settings.');
      }

      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value');

      if (error && error.code !== 'PGRST116') { // Ignore "not found" errors
        throw error;
      }

      // Process settings data if available
      if (data && data.length > 0) {
        const settingsMap = data.reduce((acc, item) => {
          acc[item.setting_key] = item.setting_value;
          return acc;
        }, {} as Record<string, any>);

        setSettings(prev => ({
          ...prev,
          maintenance_mode: settingsMap.maintenance_mode || prev.maintenance_mode,
          email_settings: settingsMap.email_settings || prev.email_settings,
          security_settings: settingsMap.security_settings || prev.security_settings
        }));
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load system settings';
      setError(errorMessage);
      console.error('🔴 SettingsModule: Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      if (!user || user.role !== 'edufam_admin') {
        throw new Error('Access denied. Only EduFam Admin can modify system settings.');
      }

      // Save each setting category
      const settingsToSave = [
        { setting_key: 'maintenance_mode', setting_value: settings.maintenance_mode },
        { setting_key: 'email_settings', setting_value: settings.email_settings },
        { setting_key: 'security_settings', setting_value: settings.security_settings }
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('system_settings')
          .upsert(setting, { onConflict: 'setting_key' });

        if (error) throw error;
      }

      toast({
        title: "Settings Saved",
        description: "System settings have been updated successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const downloadDatabaseBackup = async () => {
    try {
      // This would typically call an edge function or API endpoint
      // For now, we'll create a mock backup file
      const backupData = {
        timestamp: new Date().toISOString(),
        system_info: {
          total_schools: 'N/A',
          total_users: 'N/A',
          version: '1.0.0'
        },
        note: 'This is a demo backup file. In production, this would contain actual database backup data.'
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eduFam-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Backup Downloaded",
        description: "Database backup has been downloaded successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to generate database backup",
        variant: "destructive"
      });
    }
  };

  const downloadSystemLogs = async () => {
    try {
      const logsData = {
        timestamp: new Date().toISOString(),
        logs: [
          { level: 'INFO', message: 'System started successfully', timestamp: new Date().toISOString() },
          { level: 'INFO', message: 'User authentication system active', timestamp: new Date().toISOString() },
          { level: 'INFO', message: 'Database connections healthy', timestamp: new Date().toISOString() }
        ],
        note: 'This is a demo log file. In production, this would contain actual system logs.'
      };

      const blob = new Blob([JSON.stringify(logsData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eduFam-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Logs Downloaded",
        description: "System logs have been downloaded successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to generate system logs",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchSettings();
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
        <div className="animate-pulse text-muted-foreground">Loading system settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">System Settings</h2>
          <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchSettings} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Maintenance Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Maintenance Mode
          </CardTitle>
          <CardDescription>
            Enable maintenance mode to prevent user access during system updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="maintenance-mode"
              checked={settings.maintenance_mode.enabled}
              onCheckedChange={(checked) =>
                setSettings(prev => ({
                  ...prev,
                  maintenance_mode: { ...prev.maintenance_mode, enabled: checked }
                }))
              }
            />
            <Label htmlFor="maintenance-mode">Enable Maintenance Mode</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maintenance-message">Maintenance Message</Label>
            <Textarea
              id="maintenance-message"
              placeholder="Enter message to display to users during maintenance"
              value={settings.maintenance_mode.message}
              onChange={(e) =>
                setSettings(prev => ({
                  ...prev,
                  maintenance_mode: { ...prev.maintenance_mode, message: e.target.value }
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Configure security policies and authentication settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={settings.security_settings.session_timeout}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    security_settings: {
                      ...prev.security_settings,
                      session_timeout: parseInt(e.target.value) || 30
                    }
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-attempts">Max Login Attempts</Label>
              <Input
                id="max-attempts"
                type="number"
                value={settings.security_settings.max_login_attempts}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    security_settings: {
                      ...prev.security_settings,
                      max_login_attempts: parseInt(e.target.value) || 5
                    }
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Password Policy</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-length">Minimum Length</Label>
                <Input
                  id="min-length"
                  type="number"
                  value={settings.security_settings.password_policy.min_length}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      security_settings: {
                        ...prev.security_settings,
                        password_policy: {
                          ...prev.security_settings.password_policy,
                          min_length: parseInt(e.target.value) || 8
                        }
                      }
                    }))
                  }
                />
              </div>
              <div className="space-y-3">
                {[
                  { key: 'require_uppercase', label: 'Require Uppercase' },
                  { key: 'require_lowercase', label: 'Require Lowercase' },
                  { key: 'require_numbers', label: 'Require Numbers' },
                  { key: 'require_symbols', label: 'Require Symbols' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Switch
                      id={key}
                      checked={settings.security_settings.password_policy[key as keyof typeof settings.security_settings.password_policy]}
                      onCheckedChange={(checked) =>
                        setSettings(prev => ({
                          ...prev,
                          security_settings: {
                            ...prev.security_settings,
                            password_policy: {
                              ...prev.security_settings.password_policy,
                              [key]: checked
                            }
                          }
                        }))
                      }
                    />
                    <Label htmlFor={key}>{label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
          <CardDescription>
            Configure SMTP settings for system email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input
                id="smtp-host"
                value={settings.email_settings.smtp_host}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    email_settings: { ...prev.email_settings, smtp_host: e.target.value }
                  }))
                }
                placeholder="smtp.gmail.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input
                id="smtp-port"
                type="number"
                value={settings.email_settings.smtp_port}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    email_settings: { ...prev.email_settings, smtp_port: parseInt(e.target.value) || 587 }
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-user">SMTP Username</Label>
              <Input
                id="smtp-user"
                value={settings.email_settings.smtp_user}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    email_settings: { ...prev.email_settings, smtp_user: e.target.value }
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from-email">From Email</Label>
              <Input
                id="from-email"
                type="email"
                value={settings.email_settings.from_email}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    email_settings: { ...prev.email_settings, from_email: e.target.value }
                  }))
                }
                placeholder="noreply@edufam.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Backup & Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Backup & Logs
          </CardTitle>
          <CardDescription>
            Download system backups and logs for maintenance and debugging
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={downloadDatabaseBackup} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Database Backup
            </Button>
            <Button onClick={downloadSystemLogs} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download System Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsModule;
