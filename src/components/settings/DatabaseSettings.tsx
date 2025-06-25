
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSystemMaintenance } from '@/hooks/useSystemSettings';
import { Database, HardDrive, Shield, Download, Upload, AlertCircle } from 'lucide-react';

const DatabaseSettings: React.FC = () => {
  const systemMaintenance = useSystemMaintenance();
  const [dbStats, setDbStats] = React.useState({
    totalStorage: 100,
    usedStorage: 45,
    connections: 12,
    maxConnections: 100,
    lastBackup: '2024-01-15T10:30:00Z'
  });

  const handleMaintenance = (action: string) => {
    systemMaintenance.mutate(action);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Storage Usage</span>
              </div>
              <Progress value={dbStats.usedStorage} className="mb-2" />
              <p className="text-xs text-gray-600">
                {dbStats.usedStorage}% of {dbStats.totalStorage}GB used
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Active Connections</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {dbStats.connections}/{dbStats.maxConnections}
              </div>
              <p className="text-xs text-gray-600">Current/Maximum</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Backup & Recovery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Last backup: {new Date(dbStats.lastBackup).toLocaleString()}
            </AlertDescription>
          </Alert>

          <div className="flex space-x-2">
            <Button
              onClick={() => handleMaintenance('create_backup')}
              disabled={systemMaintenance.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Create Backup
            </Button>
            <Button
              onClick={() => handleMaintenance('optimize_database')}
              disabled={systemMaintenance.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Optimize Database
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Maintenance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => handleMaintenance('cleanup_audit_logs')}
              disabled={systemMaintenance.isPending}
              variant="outline"
              className="justify-start"
            >
              Clean Old Audit Logs
            </Button>
            <Button
              onClick={() => handleMaintenance('reset_rate_limits')}
              disabled={systemMaintenance.isPending}
              variant="outline"
              className="justify-start"
            >
              Reset Rate Limits
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseSettings;
