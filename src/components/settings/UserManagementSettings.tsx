
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUserManagementStats } from '@/hooks/useSystemSettings';
import { Users, UserPlus, UserCheck, Clock } from 'lucide-react';

const UserManagementSettings: React.FC = () => {
  const { toast } = useToast();
  const { data: userStats, isLoading } = useUserManagementStats();
  
  const [autoActivation, setAutoActivation] = useState(false);
  const [emailVerification, setEmailVerification] = useState(true);
  const [defaultRole, setDefaultRole] = useState('parent');
  const [maxUsersPerSchool, setMaxUsersPerSchool] = useState(500);

  const handleUpdateUserSettings = () => {
    toast({
      title: "User Settings Updated",
      description: "User management settings have been updated successfully",
    });
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
      {/* User Statistics */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <UserCheck className="h-5 w-5" />
            User Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-900">
                {userStats?.total_users || 0}
              </div>
              <p className="text-sm text-blue-700 mt-1">Total Users</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-green-900">
                {userStats?.active_users || 0}
              </div>
              <p className="text-sm text-green-700 mt-1">Active Users</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-purple-900">
                {userStats?.recent_signups || 0}
              </div>
              <p className="text-sm text-purple-700 mt-1">Recent Signups</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-orange-900">
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
            <Users className="h-5 w-5" />
            User Management Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto User Activation</Label>
              <p className="text-xs text-gray-500">Automatically activate new users</p>
            </div>
            <Switch
              checked={autoActivation}
              onCheckedChange={setAutoActivation}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Email Verification Required</Label>
              <p className="text-xs text-gray-500">Require email verification for new users</p>
            </div>
            <Switch 
              checked={emailVerification}
              onCheckedChange={setEmailVerification}
            />
          </div>

          <div>
            <Label htmlFor="default_role">Default User Role</Label>
            <Input
              id="default_role"
              value={defaultRole}
              onChange={(e) => setDefaultRole(e.target.value)}
              placeholder="Default role for new users"
            />
          </div>

          <div>
            <Label htmlFor="max_users_per_school">Max Users per School</Label>
            <Input
              id="max_users_per_school"
              type="number"
              value={maxUsersPerSchool}
              onChange={(e) => setMaxUsersPerSchool(parseInt(e.target.value))}
              min="10"
              max="10000"
            />
          </div>

          <Button onClick={handleUpdateUserSettings} className="w-full">
            Update User Management Settings
          </Button>
        </CardContent>
      </Card>

      {/* Users by Role */}
      <Card>
        <CardHeader>
          <CardTitle>Users by Role</CardTitle>
        </CardHeader>
        <CardContent>
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
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementSettings;
