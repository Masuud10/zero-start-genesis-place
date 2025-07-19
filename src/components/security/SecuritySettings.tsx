
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SecuritySettings: React.FC = () => {
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    auditLogging: true,
    ipWhitelist: '',
    maintenanceMode: false
  });
  const [lastLogin, setLastLogin] = useState('2024-06-24 10:30 AM');
  const [activeSessions, setActiveSessions] = useState(2);
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Security Settings Updated",
      description: "Your security preferences have been saved successfully.",
    });
  };

  const handleTerminateAllSessions = () => {
    setActiveSessions(1);
    toast({
      title: "Sessions Terminated",
      description: "All other sessions have been terminated. You remain logged in on this device.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Security Settings</h1>
      </div>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">Password Strength</span>
              <Badge className="bg-green-100 text-green-800">Strong</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium">2FA Status</span>
              <Badge className="bg-yellow-100 text-yellow-800">Disabled</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">Security Score</span>
              <Badge className="bg-blue-100 text-blue-800">85/100</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Session Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Last Login</Label>
              <p className="text-sm text-gray-600">{lastLogin}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Active Sessions</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{activeSessions} active</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTerminateAllSessions}
                  disabled={activeSessions <= 1}
                >
                  Terminate All Others
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <Switch
                checked={settings.twoFactorEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, twoFactorEnabled: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Session Timeout (minutes)</Label>
              <Input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                className="w-32"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Password Expiry (days)</Label>
              <Input
                type="number"
                value={settings.passwordExpiry}
                onChange={(e) => setSettings(prev => ({ ...prev, passwordExpiry: parseInt(e.target.value) }))}
                className="w-32"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Audit Logging</Label>
                <p className="text-xs text-gray-500">Log all security-related activities</p>
              </div>
              <Switch
                checked={settings.auditLogging}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auditLogging: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            System Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div>
              <Label className="text-sm font-medium text-orange-800">Maintenance Mode</Label>
              <p className="text-xs text-orange-600">Temporarily disable user access for system updates</p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
            />
          </div>
          
          {settings.maintenanceMode && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium">⚠️ Maintenance mode is active</p>
              <p className="text-xs text-red-600">Only administrators can access the system</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          Save Security Settings
        </Button>
      </div>
    </div>
  );
};

export default SecuritySettings;
