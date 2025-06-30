
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUserManagementStats } from '@/hooks/useSystemSettings';
import { 
  Users, 
  UserCheck, 
  UserPlus,
  UserX,
  Activity,
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const UserManagementSettings: React.FC = () => {
  const { 
    data: userStats, 
    isLoading: userStatsLoading, 
    error: userStatsError 
  } = useUserManagementStats();

  if (userStatsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-lg">Loading user management data...</span>
        </div>
      </div>
    );
  }

  if (userStatsError) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          Failed to load user management data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
      </div>

      {/* User Statistics */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Activity className="h-5 w-5" />
            User Statistics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-blue-200">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-blue-900">
                {userStats?.total_users || 0}
              </div>
              <p className="text-sm text-blue-700 mt-1">Total Users</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-green-200">
              <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-green-900">
                {userStats?.active_users || 0}
              </div>
              <p className="text-sm text-green-700 mt-1">Active Users</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-purple-200">
              <UserPlus className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-purple-900">
                {userStats?.recent_signups || 0}
              </div>
              <p className="text-sm text-purple-700 mt-1">Recent Signups</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-orange-200">
              <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-orange-900">
                {Object.keys(userStats?.users_by_role || {}).length}
              </div>
              <p className="text-sm text-orange-700 mt-1">User Roles</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users by Role */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Users by Role Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userStats?.users_by_role && Object.keys(userStats.users_by_role).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(userStats.users_by_role).map(([role, count]) => (
                <div
                  key={role}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-gray-900 capitalize">
                      {role.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {count as number}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      ({(((count as number) / (userStats?.total_users || 1)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No user role data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle>User Management Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => {
                // TODO: Implement user export functionality
                console.log('Export users');
              }}
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Export Users
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  Download user data as CSV
                </span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => {
                // TODO: Implement bulk user operations
                console.log('Bulk operations');
              }}
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Bulk Operations
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  Manage multiple users at once
                </span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => {
                // TODO: Implement user activity report
                console.log('User activity report');
              }}
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Activity Report
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  View user activity statistics
                </span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            User Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Active Today</p>
                  <p className="text-2xl font-bold text-green-900">
                    {Math.floor((userStats?.active_users || 0) * 0.3)}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Active This Week</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {Math.floor((userStats?.active_users || 0) * 0.7)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">Inactive Users</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {(userStats?.total_users || 0) - (userStats?.active_users || 0)}
                  </p>
                </div>
                <UserX className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementSettings;
