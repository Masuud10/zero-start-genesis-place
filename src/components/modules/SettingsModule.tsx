
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

const SettingsModule = () => {
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
                <Badge variant="outline" className="bg-white">
                  {count as number}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Security Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {securityData?.security_incidents || 0}
            </div>
            <p className="text-xs text-red-600 mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Failed Logins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">
              {securityData?.failed_login_attempts || 0}
            </div>
            <p className="text-xs text-yellow-600 mt-1">Total attempts</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Active Rate Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {securityData?.active_rate_limits?.length || 0}
            </div>
            <p className="text-xs text-purple-600 mt-1">Currently blocked</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Audit Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {securityData?.total_audit_events || 0}
            </div>
            <p className="text-xs text-green-600 mt-1">Total logged</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!securityData?.recent_audit_logs || securityData.recent_audit_logs.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">No recent security events</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {securityData.recent_audit_logs.slice(0, 5).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium capitalize">
                      {log.action?.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="capitalize">
                      {log.resource?.replace('_', ' ')}
                    </TableCell>
                    <TableCell>
                      {log.success ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Success
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Failed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(log.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderMaintenance = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <Database className="h-5 w-5" />
            System Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Maintenance Operations</AlertTitle>
            <AlertDescription className="text-blue-700">
              These operations help maintain system performance and security. Use with caution.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-gray-200">
              <CardContent className="p-4 text-center">
                <Trash2 className="h-8 w-8 mx-auto mb-3 text-red-500" />
                <h3 className="font-semibold text-gray-900 mb-2">Clean Audit Logs</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Remove audit logs older than 30 days to free up space.
                </p>
                <Button
                  onClick={() => handleMaintenance('cleanup_audit_logs')}
                  disabled={systemMaintenance.isPending}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  size="sm"
                >
                  {systemMaintenance.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Clean Logs
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-4 text-center">
                <Key className="h-8 w-8 mx-auto mb-3 text-yellow-500" />
                <h3 className="font-semibold text-gray-900 mb-2">Reset Rate Limits</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Clear all active rate limit blocks and reset counters.
                </p>
                <Button
                  onClick={() => handleMaintenance('reset_rate_limits')}
                  disabled={systemMaintenance.isPending}
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  size="sm"
                >
                  {systemMaintenance.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Key className="h-4 w-4 mr-2" />
                  )}
                  Reset Limits
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-4 text-center">
                <Database className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                <h3 className="font-semibold text-gray-900 mb-2">Optimize Database</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Run database optimization and maintenance routines.
                </p>
                <Button
                  onClick={() => handleMaintenance('optimize_database')}
                  disabled={systemMaintenance.isPending}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  size="sm"
                >
                  {systemMaintenance.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Database className="h-4 w-4 mr-2" />
                  )}
                  Optimize
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Database Connection</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">File Storage</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Operational</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Background Jobs</span>
              </div>
              <Badge className="bg-green-100 text-green-800">Running</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (userStatsLoading || securityLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">System Settings</h2>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (userStatsError || securityError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">System Settings</h2>
        </div>
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Settings Error</AlertTitle>
          <AlertDescription className="text-red-700">
            Failed to load system settings data. Please refresh the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
          <p className="text-muted-foreground">Manage users, security, and system maintenance</p>
        </div>
      </div>

      {/* Navigation */}
      <Card>
        <CardContent className="p-2">
          <div className="flex space-x-1">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "ghost"}
                onClick={() => setActiveSection(section.id)}
                className="flex items-center gap-2"
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {activeSection === 'users' && renderUserManagement()}
      {activeSection === 'security' && renderSecurity()}
      {activeSection === 'maintenance' && renderMaintenance()}
    </div>
  );
};

export default SettingsModule;
