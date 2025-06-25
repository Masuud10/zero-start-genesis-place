
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUserManagementStats, useSecuritySettings, useSystemMaintenance } from '@/hooks/useSystemSettings';
import { 
  Settings, 
  Users, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Trash2,
  Key,
  Activity,
  UserCheck,
  Clock,
  Database
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SettingsModule = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('users');
  
  const { 
    data: userStats, 
    isLoading: userStatsLoading, 
    error: userStatsError 
  } = useUserManagementStats();

  const { 
    data: securityData, 
    isLoading: securityLoading, 
    error: securityError 
  } = useSecuritySettings();

  const systemMaintenance = useSystemMaintenance();

  const handleMaintenance = (action: string) => {
    systemMaintenance.mutate(action);
  };

  // For non-admin users, show basic settings
  if (user?.role !== 'edufam_admin') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account and system preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Basic account settings and preferences will be available here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>School Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              School-specific configuration options will be available here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sections = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'maintenance', label: 'Maintenance', icon: Settings },
  ];

  const renderUserManagement = () => (
    <div className="space-y-6">
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

  const renderSecuritySection = () => (
    <div className="space-y-6">
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
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
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
              <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">
                {securityData?.failed_login_attempts || 0}
              </div>
              <p className="text-sm text-blue-700">Failed Login Attempts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          {securityData?.recent_audit_logs?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {securityData.recent_audit_logs.slice(0, 5).map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell>{log.user_id || 'System'}</TableCell>
                    <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={log.success ? "default" : "destructive"}>
                        {log.success ? 'Success' : 'Failed'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No recent security events</p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderMaintenanceSection = () => (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>System Maintenance</AlertTitle>
        <AlertDescription>
          Use these tools to maintain system performance and clean up data.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => handleMaintenance('cleanup_audit_logs')}
              disabled={systemMaintenance.isPending}
              variant="outline"
              className="justify-start"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clean Old Audit Logs
            </Button>
            <Button
              onClick={() => handleMaintenance('reset_rate_limits')}
              disabled={systemMaintenance.isPending}
              variant="outline"
              className="justify-start"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Rate Limits
            </Button>
            <Button
              onClick={() => handleMaintenance('optimize_database')}
              disabled={systemMaintenance.isPending}
              variant="outline"
              className="justify-start"
            >
              <Database className="mr-2 h-4 w-4" />
              Optimize Database
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">
          Manage system-wide settings and configurations
        </p>
      </div>

      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "default" : "ghost"}
            onClick={() => setActiveSection(section.id)}
            className="flex items-center space-x-2"
          >
            <section.icon className="h-4 w-4" />
            <span>{section.label}</span>
          </Button>
        ))}
      </div>

      {activeSection === 'users' && renderUserManagement()}
      {activeSection === 'security' && renderSecuritySection()}
      {activeSection === 'maintenance' && renderMaintenanceSection()}
    </div>
  );
};

export default SettingsModule;
