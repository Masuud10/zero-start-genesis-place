
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSecuritySettings, useSystemMaintenance } from '@/hooks/useSystemSettings';
import { Shield, Key, Lock, AlertTriangle, Activity } from 'lucide-react';

const SecuritySettingsPanel: React.FC = () => {
  const { toast } = useToast();
  const { data: securityData, isLoading } = useSecuritySettings();
  const systemMaintenance = useSystemMaintenance();
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordComplexity, setPasswordComplexity] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);

  const handleUpdateSecurity = () => {
    toast({
      title: "Security Updated",
      description: "Security settings have been updated successfully",
    });
  };

  const handleResetRateLimits = () => {
    systemMaintenance.mutate('reset_rate_limits');
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">
                {securityData?.total_audit_events || 0}
              </div>
              <p className="text-sm text-green-700">Total Audit Events</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-900">
                {securityData?.security_incidents || 0}
              </div>
              <p className="text-sm text-red-700">Security Incidents</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Lock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">
                {securityData?.failed_login_attempts || 0}
              </div>
              <p className="text-sm text-blue-700">Failed Login Attempts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Security Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Two-Factor Authentication</Label>
              <p className="text-xs text-gray-500">Require 2FA for admin accounts</p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Password Complexity</Label>
              <p className="text-xs text-gray-500">Enforce strong password requirements</p>
            </div>
            <Switch 
              checked={passwordComplexity}
              onCheckedChange={setPasswordComplexity}
            />
          </div>

          <div>
            <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
            <Input
              id="session_timeout"
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
              min="5"
              max="480"
            />
          </div>

          <div>
            <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
            <Input
              id="max_login_attempts"
              type="number"
              value={maxLoginAttempts}
              onChange={(e) => setMaxLoginAttempts(parseInt(e.target.value))}
              min="3"
              max="10"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleUpdateSecurity} className="flex-1">
              Update Security Settings
            </Button>
            <Button 
              onClick={handleResetRateLimits}
              variant="outline"
              disabled={systemMaintenance.isPending}
            >
              Reset Rate Limits
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Rate Limits */}
      {securityData?.active_rate_limits && securityData.active_rate_limits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Rate Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {securityData.active_rate_limits.map((limit: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{limit.identifier}</span>
                  <Badge variant="destructive">Blocked</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SecuritySettingsPanel;
