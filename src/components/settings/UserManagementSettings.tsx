
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useUserManagementStats } from '@/hooks/useSystemSettings';
import { Users, UserCheck, UserX, Shield, Settings } from 'lucide-react';

const UserManagementSettings: React.FC = () => {
  const { data: userStats, isLoading } = useUserManagementStats();
  const [settings, setSettings] = React.useState({
    autoDeactivateInactive: true,
    inactivityPeriod: 90,
    requireEmailVerification: true,
    allowSelfRegistration: false,
    defaultRole: 'parent'
  });

  const handleSave = () => {
    console.log('Saving user management settings:', settings);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
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
            <Users className="h-5 w-5" />
            User Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <UserCheck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">
                {userStats?.total_users || 0}
              </div>
              <p className="text-sm text-blue-700">Total Users</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">
                {userStats?.active_users || 0}
              </div>
              <p className="text-sm text-green-700">Active Users</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <UserX className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-900">
                {(userStats?.total_users || 0) - (userStats?.active_users || 0)}
              </div>
              <p className="text-sm text-orange-700">Inactive Users</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">
                {userStats?.recent_signups || 0}
              </div>
              <p className="text-sm text-purple-700">Recent Signups</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Role Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(userStats?.users_by_role || {}).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium capitalize">{role.replace('_', ' ')}</span>
                </div>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            User Management Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Inactivity Period (days)</Label>
              <Input
                type="number"
                value={settings.inactivityPeriod}
                onChange={(e) => setSettings(prev => ({ ...prev, inactivityPeriod: parseInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Default User Role</Label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={settings.defaultRole}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultRole: e.target.value }))}
              >
                <option value="parent">Parent</option>
                <option value="teacher">Teacher</option>
                <option value="principal">Principal</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-deactivate Inactive Users</Label>
                <p className="text-sm text-gray-600">Automatically deactivate users after inactivity period</p>
              </div>
              <Switch
                checked={settings.autoDeactivateInactive}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoDeactivateInactive: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Require Email Verification</Label>
                <p className="text-sm text-gray-600">Users must verify email before account activation</p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireEmailVerification: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Self-Registration</Label>
                <p className="text-sm text-gray-600">Allow users to create accounts without admin approval</p>
              </div>
              <Switch
                checked={settings.allowSelfRegistration}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowSelfRegistration: checked }))}
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            Save User Management Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementSettings;
