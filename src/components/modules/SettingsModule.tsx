
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUserManagementStats, useSecuritySettings, useSystemMaintenance } from '@/hooks/useSystemSettings';
import { Settings, Users, Shield, Database, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';

const SettingsModule = () => {
  const [activeTab, setActiveTab] = useState('user-management');

  const { 
    data: userStats, 
    isLoading: userStatsLoading, 
    error: userStatsError,
    refetch: refetchUserStats 
  } = useUserManagementStats();

  const { 
    data: securityData, 
    isLoading: securityLoading, 
    error: securityError,
    refetch: refetchSecurity 
  } = useSecuritySettings();

  const maintenanceMutation = useSystemMaintenance();

  const handleRefresh = () => {
    refetchUserStats();
    refetchSecurity();
  };

  const handleMaintenance = (action: string) => {
    maintenanceMutation.mutate(action);
  };

  if (userStatsError || securityError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            System Configuration
          </h1>
          <p className="text-muted-foreground">Configure system settings and preferences</p>
        </div>

        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Settings Data Error</AlertTitle>
          <AlertDescription className="text-red-700 mb-4">
            Failed to load system settings data. Please try again.
          </AlertDescription>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            System Configuration
          </h1>
          <p className="text-muted-foreground">Configure system settings and preferences</p>
        </div>
        <Button onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">System Status</p>
                <p className="text-2xl font-bold">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">
                  {userStatsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : userStats?.total_users || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Security Events</p>
                <p className="text-2xl font-bold">
                  {securityLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : securityData?.total_audit_events || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">
                  {userStatsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : userStats?.active_users || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="user-management" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security Settings
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                System Maintenance
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="user-management" className="mt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">User Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {userStatsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span>Total Users:</span>
                            <span className="font-semibold">{userStats?.total_users || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Active Users:</span>
                            <span className="font-semibold">{userStats?.active_users || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Recent Signups:</span>
                            <span className="font-semibold">{userStats?.recent_signups || 0}</span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Users by Role</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {userStatsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      ) : (
                        Object.entries(userStats?.users_by_role || {}).map(([role, count]) => (
                          <div key={role} className="flex justify-between">
                            <span className="capitalize">{role.replace('_', ' ')}:</span>
                            <span className="font-semibold">{count}</span>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="mt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Security Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {securityLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span>Total Audit Events:</span>
                            <span className="font-semibold">{securityData?.total_audit_events || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Security Incidents:</span>
                            <span className="font-semibold text-red-600">{securityData?.security_incidents || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Active Rate Limits:</span>
                            <span className="font-semibold">{securityData?.active_rate_limits?.length || 0}</span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Security Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {securityLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      ) : securityData?.recent_audit_logs?.length ? (
                        <div className="space-y-2">
                          {securityData.recent_audit_logs.slice(0, 5).map((log: any) => (
                            <div key={log.id} className="text-sm border-b pb-2">
                              <div className="flex justify-between">
                                <span className={log.success ? 'text-green-600' : 'text-red-600'}>
                                  {log.action}
                                </span>
                                <span className="text-muted-foreground">
                                  {new Date(log.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-4">No recent events</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="maintenance" className="mt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">System Maintenance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        onClick={() => handleMaintenance('cleanup_audit_logs')}
                        disabled={maintenanceMutation.isPending}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2"
                      >
                        {maintenanceMutation.isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Database className="w-5 h-5" />
                        )}
                        <span>Clean Audit Logs</span>
                        <span className="text-xs text-muted-foreground">Remove old logs</span>
                      </Button>

                      <Button
                        onClick={() => handleMaintenance('reset_rate_limits')}
                        disabled={maintenanceMutation.isPending}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2"
                      >
                        {maintenanceMutation.isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Shield className="w-5 h-5" />
                        )}
                        <span>Reset Rate Limits</span>
                        <span className="text-xs text-muted-foreground">Clear blocked IPs</span>
                      </Button>

                      <Button
                        onClick={() => handleMaintenance('optimize_database')}
                        disabled={maintenanceMutation.isPending}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2"
                      >
                        {maintenanceMutation.isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Settings className="w-5 h-5" />
                        )}
                        <span>Optimize Database</span>
                        <span className="text-xs text-muted-foreground">Improve performance</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsModule;
