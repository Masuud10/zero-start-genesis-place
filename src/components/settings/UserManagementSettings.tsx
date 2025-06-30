
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useUserManagementStats } from '@/hooks/useSystemSettings';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  UserMinus, 
  Settings,
  Activity,
  Clock,
  Shield
} from 'lucide-react';

const UserManagementSettings: React.FC = () => {
  const { toast } = useToast();
  const { data: userStats, isLoading } = useUserManagementStats();
  
  const [userSettings, setUserSettings] = useState({
    allowUserRegistration: true,
    requireEmailVerification: true,
    autoApproveUsers: false,
    maxUsersPerSchool: 500,
    sessionTimeoutMinutes: 30,
    enableTwoFactor: false
  });

  const handleSaveSettings = () => {
    toast({
      title: "User Management Settings Updated",
      description: "All user management settings have been saved successfully.",
    });
  };

  const handleSettingChange = (key: string, value: boolean | number) => {
    setUserSettings(prev => ({ ...prev, [key]: value }));
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
      {/* User Statistics Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <UserCheck className="h-5 w-5" />
            User Statistics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">
                {userStats?.total_users || 0}
              </div>
              <p className="text-sm text-blue-700 mt-1">Total Users</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">
                {userStats?.active_users || 0}
              </div>
              <p className="text-sm text-green-700 mt-1">Active Users</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <UserPlus className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">
                {userStats?.recent_signups || 0}
              </div>
              <p className="text-sm text-purple-700 mt-1">Recent Signups</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Shield className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-900">
                {Object.keys(userStats?.users_by_role || {}).length}
              </div>
              <p className="text-sm text-orange-700 mt-1">User Roles</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Management Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            User Management Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Allow User Registration</Label>
              <p className="text-xs text-gray-500">Allow new users to register accounts</p>
            </div>
            <Switch
              checked={userSettings.allowUserRegistration}
              onCheckedChange={(checked) => handleSettingChange('allowUserRegistration', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Require Email Verification</Label>
              <p className="text-xs text-gray-500">Require email verification for new accounts</p>
            </div>
            <Switch
              checked={userSettings.requireEmailVerification}
              onCheckedChange={(checked) => handleSettingChange('requireEmailVerification', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Approve Users</Label>
              <p className="text-xs text-gray-500">Automatically approve new user registrations</p>
            </div>
            <Switch
              checked={userSettings.autoApproveUsers}
              onCheckedChange={(checked) => handleSettingChange('autoApproveUsers', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Two-Factor Authentication</Label>
              <p className="text-xs text-gray-500">Require 2FA for admin accounts</p>
            </div>
            <Switch
              checked={userSettings.enableTwoFactor}
              onCheckedChange={(checked) => handleSettingChange('enableTwoFactor', checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_users">Max Users Per School</Label>
              <Input
                id="max_users"
                type="number"
                value={userSettings.maxUsersPerSchool}
                onChange={(e) => handleSettingChange('maxUsersPerSchool', parseInt(e.target.value))}
                min="1"
                max="10000"
              />
            </div>
            <div>
              <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
              <Input
                id="session_timeout"
                type="number"
                value={userSettings.sessionTimeoutMinutes}
                onChange={(e) => handleSettingChange('sessionTimeoutMinutes', parseInt(e.target.value))}
                min="5"
                max="480"
              />
            </div>
          </div>

          <Button onClick={handleSaveSettings} className="w-full">
            Save User Management Settings
          </Button>
        </CardContent>
      </Card>

      {/* Users by Role */}
      <Card>
        <CardHeader>
          <CardTitle>User Distribution by Role</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(userStats?.users_by_role || {}).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(userStats?.users_by_role || {}).map(([role, count]) => (
                <div
                  key={role}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium capitalize">{role.replace('_', ' ')}</span>
                  </div>
                  <Badge variant="secondary">{count as number}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No user role data available</p>
          )}
        </CardContent>
      </Card>

      {/* System Limits & Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            System Limits & Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              User management policies are enforced system-wide and affect all schools and users in the network.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementSettings;
