
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Database, 
  Activity, 
  HardDrive, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Download,
  Clock,
  FileText
} from 'lucide-react';

const DatabaseSettings: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [backupHistory, setBackupHistory] = useState([
    { id: 1, date: '2024-06-30 14:30', size: '2.4 GB', status: 'Completed', duration: '3m 45s' },
    { id: 2, date: '2024-06-29 14:30', size: '2.3 GB', status: 'Completed', duration: '3m 20s' },
    { id: 3, date: '2024-06-28 14:30', size: '2.2 GB', status: 'Completed', duration: '3m 15s' },
  ]);

  // Mock database statistics
  const dbStats = {
    totalSize: '2.4 GB',
    tableCount: 32,
    activeConnections: 12,
    queryPerformance: 'Good',
    lastBackup: '2 hours ago',
    uptime: '15 days, 3 hours',
    backupFrequency: 'Daily at 14:30'
  };

  const handleDatabaseAction = async (action: string) => {
    setIsLoading(true);
    try {
      // Simulate database operation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (action === 'backup') {
        const newBackup = {
          id: backupHistory.length + 1,
          date: new Date().toLocaleString(),
          size: '2.5 GB',
          status: 'Completed',
          duration: '3m 52s'
        };
        setBackupHistory([newBackup, ...backupHistory]);
      }
      
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

  const handleDownloadBackup = async (backupId: number) => {
    try {
      setIsLoading(true);
      
      // Generate a comprehensive backup file
      const backupData = {
        schools: await fetchTableData('schools'),
        users: await fetchTableData('profiles'),
        students: await fetchTableData('students'),
        grades: await fetchTableData('grades'),
        financial_transactions: await fetchTableData('financial_transactions'),
        timestamp: new Date().toISOString(),
        version: '1.0'
      };

      const jsonContent = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `eduFam-system-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Backup Downloaded",
        description: "System backup has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTableData = async (tableName: string) => {
    try {
      // Type-safe table queries
      if (tableName === 'schools') {
        const { data, error } = await supabase.from('schools').select('*').limit(1000);
        if (error) throw error;
        return data || [];
      } else if (tableName === 'profiles') {
        const { data, error } = await supabase.from('profiles').select('*').limit(1000);
        if (error) throw error;
        return data || [];
      } else if (tableName === 'students') {
        const { data, error } = await supabase.from('students').select('*').limit(1000);
        if (error) throw error;
        return data || [];
      } else if (tableName === 'grades') {
        const { data, error } = await supabase.from('grades').select('*').limit(1000);
        if (error) throw error;
        return data || [];
      } else if (tableName === 'financial_transactions') {
        const { data, error } = await supabase.from('financial_transactions').select('*').limit(1000);
        if (error) throw error;
        return data || [];
      }
      return [];
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Database Management</h2>
      </div>

      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          Database operations can impact system performance. Proceed with caution during peak hours.
        </AlertDescription>
      </Alert>

      {/* Database Statistics */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Database Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <HardDrive className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">{dbStats.totalSize}</div>
              <p className="text-sm text-blue-700">Total Size</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">{dbStats.tableCount}</div>
              <p className="text-sm text-green-700">Tables</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">{dbStats.activeConnections}</div>
              <p className="text-sm text-purple-700">Active Connections</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-900">{dbStats.uptime}</div>
              <p className="text-sm text-orange-700">System Uptime</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Health */}
      <Card>
        <CardHeader>
          <CardTitle>Database Health Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Query Performance</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {dbStats.queryPerformance}
              </Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Last Backup</span>
              <span className="text-sm text-gray-600">{dbStats.lastBackup}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Backup Schedule</span>
              <span className="text-sm text-gray-600">{dbStats.backupFrequency}</span>
            </div>
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
              variant="default"
              className="justify-start h-auto p-4 bg-blue-600 hover:bg-blue-700"
            >
              <div className="flex flex-col items-start text-left">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Create Backup Now
                </div>
                <span className="text-xs text-blue-100 mt-1">
                  Generate a full database backup immediately
                </span>
              </div>
            </Button>

            <Button
              onClick={() => handleDatabaseAction('optimize')}
              disabled={isLoading}
              variant="outline"
              className="justify-start h-auto p-4"
            >
              <div className="flex flex-col items-start text-left">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Optimize Database
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  Optimize database tables for better performance
                </span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Backup History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backupHistory.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell className="font-medium">{backup.date}</TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell>{backup.duration}</TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {backup.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleDownloadBackup(backup.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseSettings;
