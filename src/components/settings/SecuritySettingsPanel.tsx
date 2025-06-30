
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSecuritySettings, useSystemMaintenance } from '@/hooks/useSystemSettings';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Trash2,
  Activity,
  Clock,
  Users
} from 'lucide-react';

const SecuritySettingsPanel: React.FC = () => {
  const [lastAction, setLastAction] = useState<string | null>(null);
  
  const { 
    data: securityData, 
    isLoading: securityLoading, 
    error: securityError 
  } = useSecuritySettings();

  const systemMaintenance = useSystemMaintenance();

  const handleSecurityAction = (action: string) => {
    setLastAction(action);
    systemMaintenance.mutate(action);
  };

  if (securityLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-lg">Loading security settings...</span>
        </div>
      </div>
    );
  }

  if (securityError) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700">
          Failed to load security settings. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Security Management</h2>
      </div>

      {/* Security Overview */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">
                {securityData?.total_audit_events || 0}
              </div>
              <p className="text-sm text-green-700">Total Audit Events</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-900">
                {securityData?.security_incidents || 0}
              </div>
              <p className="text-sm text-red-700">Security Incidents</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">
                {securityData?.failed_login_attempts || 0}
              </div>
              <p className="text-sm text-blue-700">Failed Login Attempts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Security Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => handleSecurityAction('cleanup_audit_logs')}
              disabled={systemMaintenance.isPending}
              variant="outline"
              className="justify-start h-auto p-4"
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Clean Audit Logs
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  Remove old security audit logs
                </span>
              </div>
            </Button>

            <Button
              onClick={() => handleSecurityAction('reset_rate_limits')}
              disabled={systemMaintenance.isPending}
              variant="outline"
              className="justify-start h-auto p-4"
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reset Rate Limits
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  Clear all active rate limiting blocks
                </span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
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
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recent security events found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Rate Limits */}
      {securityData?.active_rate_limits && securityData.active_rate_limits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Active Rate Limits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {securityData.active_rate_limits.map((limit: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="font-medium">IP: {limit.ip_address}</span>
                  <Badge variant="destructive">Blocked until {new Date(limit.blocked_until).toLocaleString()}</Badge>
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
