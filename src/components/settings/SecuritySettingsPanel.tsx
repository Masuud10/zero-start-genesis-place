
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSecuritySettings } from '@/hooks/useSystemSettings';
import { Shield, Lock, Eye, AlertTriangle, Users, Activity } from 'lucide-react';

const SecuritySettingsPanel: React.FC = () => {
  const { data: securityData, isLoading } = useSecuritySettings();
  const [settings, setSettings] = React.useState({
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordExpiry: 90,
    auditRetention: 365,
    enforceStrongPasswords: true,
    enableAuditLogging: true
  });

  const handleSave = () => {
    // Implementation would save to backend
    console.log('Saving security settings:', settings);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Session Timeout (minutes)</Label>
              <Input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Max Login Attempts</Label>
              <Input
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Password Expiry (days)</Label>
              <Input
                type="number"
                value={settings.passwordExpiry}
                onChange={(e) => setSettings(prev => ({ ...prev, passwordExpiry: parseInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Audit Log Retention (days)</Label>
              <Input
                type="number"
                value={settings.auditRetention}
                onChange={(e) => setSettings(prev => ({ ...prev, auditRetention: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enforce Strong Passwords</Label>
                <p className="text-sm text-gray-600">Require complex passwords for all users</p>
              </div>
              <Switch
                checked={settings.enforceStrongPasswords}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enforceStrongPasswords: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Audit Logging</Label>
                <p className="text-sm text-gray-600">Log all user actions and system events</p>
              </div>
              <Switch
                checked={settings.enableAuditLogging}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableAuditLogging: checked }))}
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Security Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">
                {securityData?.failed_login_attempts || 0}
              </div>
              <p className="text-sm text-blue-700">Failed Login Attempts</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg text-center">
              <Eye className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">
                {securityData?.total_audit_events || 0}
              </div>
              <p className="text-sm text-green-700">Audit Events</p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg text-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-900">
                {securityData?.security_incidents || 0}
              </div>
              <p className="text-sm text-red-700">Security Incidents</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettingsPanel;
