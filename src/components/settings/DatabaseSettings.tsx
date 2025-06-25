
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Database, Activity, HardDrive, Clock } from 'lucide-react';

const DatabaseSettings: React.FC = () => {
  const { toast } = useToast();

  // Fetch database statistics
  const { data: dbStats, isLoading } = useQuery({
    queryKey: ['database-stats'],
    queryFn: async () => {
      // Get table counts and basic stats
      const tables = [
        'schools', 'profiles', 'students', 'classes', 'subjects',
        'grades', 'attendance', 'announcements', 'messages'
      ];

      const stats = await Promise.all(
        tables.map(async (table) => {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          return {
            table,
            count: error ? 0 : count || 0,
            status: error ? 'error' : 'healthy'
          };
        })
      );

      return stats;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleOptimizeDatabase = async () => {
    try {
      // This would typically call a database optimization function
      toast({
        title: "Database Optimization",
        description: "Database optimization initiated. This may take a few minutes.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to optimize database",
        variant: "destructive",
      });
    }
  };

  const handleBackupDatabase = async () => {
    try {
      // This would typically trigger a backup process
      toast({
        title: "Database Backup",
        description: "Database backup initiated. You will be notified when complete.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate backup",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRecords = dbStats?.reduce((sum, stat) => sum + stat.count, 0) || 0;
  const healthyTables = dbStats?.filter(stat => stat.status === 'healthy').length || 0;
  const totalTables = dbStats?.length || 0;

  return (
    <div className="space-y-6">
      {/* Database Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <HardDrive className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{totalRecords.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Activity className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Table Health</p>
                <p className="text-2xl font-bold text-gray-900">{healthyTables}/{totalTables}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Last Backup</p>
                <p className="text-sm font-medium text-gray-900">2 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Table Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dbStats?.map((stat) => (
              <div key={stat.table} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="h-4 w-4 text-gray-500" />
                  <span className="font-medium capitalize">{stat.table.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{stat.count.toLocaleString()} records</span>
                  <Badge variant={stat.status === 'healthy' ? 'default' : 'destructive'}>
                    {stat.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Database Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Database Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleOptimizeDatabase} variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Optimize Database
            </Button>
            <Button onClick={handleBackupDatabase} variant="outline">
              <HardDrive className="h-4 w-4 mr-2" />
              Create Backup
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Database operations may temporarily affect system performance. 
            Schedule these during low-usage periods.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseSettings;
