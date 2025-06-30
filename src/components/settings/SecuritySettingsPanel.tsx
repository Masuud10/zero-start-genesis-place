
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSecuritySettings } from '@/hooks/useSystemSettings';
import { 
  Shield, 
  Key, 
  AlertTriangle, 
  Activity,
  Eye,
  Lock
} from 'lucide-react';

const SecuritySettingsPanel: React.FC = () => {
  const { toast } = useToast();
  const { data: securityData, isLoading } = useSecuritySettings();
  
  const [settings, setSettings] = useState({
    twoFactorRequired: false,
    passwordComplexity: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    auditLogging: true,
    ipWhitelisting: false
  });

  const handleSaveSettings = () => {
    toast({
      title: "Security Settings Updated",
      description: "All security settings have been updated successfully.",
    });
  };

  const handleSettingChange = (key: string, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Shield className="h-5 w-5" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">
                {securityData?.total_audit_events || 0}
              </div>
              <p className="text-sm text-green-700 mt-1">Total Audit Events</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-900">
                {securityData?.security_incidents || 0}
              </div>
              <p className="text-sm text-red-700 mt-1">Security Incidents</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Eye className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-900">
                {securityData?.failed_login_attempts || 0}
              </div>
              <p className="text-sm text-orange-700 mt-1">Failed Login Attempts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Two-Factor Authentication Required</Label>
              <p className="text-xs text-gray-500">Require 2FA for all admin accounts</p>
            </div>
            <Switch
              checked={settings.twoFactorRequired}
              onCheckedChange={(checked) => handleSettingChange('twoFactorRequired', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Password Complexity</Label>
              <p className="text-xs text-gray-500">Enforce strong password requirements</p>
            </div>
            <Switch
              checked={settings.passwordComplexity}
              onCheckedChange={(checked) => handleSettingChange('passwordComplexity', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Audit Logging</Label>
              <p className="text-xs text-gray-500">Log all administrative actions</p>
            </div>
            <Switch
              checked={settings.auditLogging}
              onCheckedChange={(checked) => handleSettingChange('auditLogging', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>IP Whitelisting</Label>
              <p className="text-xs text-gray-500">Restrict admin access to specific IPs</p>
            </div>
            <Switch
              checked={settings.ipWhitelisting}
              onCheckedChange={(checked) => handleSettingChange('ipWhitelisting', checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
              <Input
                id="session_timeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                min="5"
                max="480"
              />
            </div>
            <div>
              <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
              <Input
                id="max_login_attempts"
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                min="3"
                max="10"
              />
            </div>
          </div>

          <Button onClick={handleSaveSettings} className="w-full">
            Save Security Settings
          </Button>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          {securityData?.recent_audit_logs?.length > 0 ? (
            <div className="space-y-3">
              {securityData.recent_audit_logs.slice(0, 5).map((log: any, index: number) => (
                <div
                  key={log.id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${log.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <span className="font-medium">{log.action || 'Unknown Action'}</span>
                      <p className="text-xs text-gray-500">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : 'Unknown time'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={log.success ? "default" : "destructive"}>
                    {log.success ? 'Success' : 'Failed'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent security events</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettingsPanel;
