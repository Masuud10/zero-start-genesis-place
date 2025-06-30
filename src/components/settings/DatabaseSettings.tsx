
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  Activity, 
  HardDrive, 
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const DatabaseSettings: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Mock database statistics
  const dbStats = {
    totalSize: '2.4 GB',
    tableCount: 32,
    activeConnections: 12,
    queryPerformance: 'Good',
    lastBackup: '2 hours ago',
    uptime: '15 days, 3 hours'
  };

  const handleDatabaseAction = async (action: string) => {
    setIsLoading(true);
    try {
      // Simulate database operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Success",
        description: `Database ${action} completed successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} database.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          Database operations can impact system performance. Proceed with caution during peak hours.
        </AlertDescription>
      </Alert>

      {/* Database Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Database Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <HardDrive className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">{dbStats.totalSize}</div>
              <p className="text-sm text-blue-700">Total Size</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">{dbStats.tableCount}</div>
              <p className="text-sm text-green-700">Tables</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">{dbStats.activeConnections}</div>
              <p className="text-sm text-purple-700">Active Connections</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Health */}
      <Card>
        <CardHeader>
          <CardTitle>Database Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Query Performance</span>
            <Badge variant="default" className="bg-green-100 text-green-800">
              {dbStats.queryPerformance}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Last Backup</span>
            <span className="text-sm text-gray-600">{dbStats.lastBackup}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>System Uptime</span>
            <span className="text-sm text-gray-600">{dbStats.uptime}</span>
          </div>
        </CardContent>
      </Card>

      {/* Database Operations */}
      <Card>
        <CardHeader>
          <CardTitle>Database Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => handleDatabaseAction('backup')}
              disabled={isLoading}
              variant="outline"
              className="justify-start h-auto p-4"
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Create Backup
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  Create a full database backup
                </span>
              </div>
            </Button>

            <Button
              onClick={() => handleDatabaseAction('optimize')}
              disabled={isLoading}
              variant="outline"
              className="justify-start h-auto p-4"
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Optimize Tables
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  Optimize database tables for better performance
                </span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseSettings;
