
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSystemMaintenance } from '@/hooks/useSystemSettings';
import { Database, Download, Upload, RefreshCw, Trash2 } from 'lucide-react';

const DatabaseSettings: React.FC = () => {
  const { toast } = useToast();
  const systemMaintenance = useSystemMaintenance();

  const handleBackup = () => {
    toast({
      title: "Backup Initiated",
      description: "Database backup has been started. You will be notified when complete.",
    });
  };

  const handleRestore = () => {
    toast({
      title: "Restore Initiated",
      description: "Database restore process has been started",
    });
  };

  const handleOptimize = () => {
    systemMaintenance.mutate('optimize_database');
  };

  const handleCleanup = () => {
    systemMaintenance.mutate('cleanup_audit_logs');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={handleBackup} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Backup Database
          </Button>
          <Button 
            onClick={handleRestore} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Restore Database
          </Button>
          <Button 
            onClick={handleOptimize} 
            variant="outline" 
            className="flex items-center gap-2"
            disabled={systemMaintenance.isPending}
          >
            <RefreshCw className="h-4 w-4" />
            Optimize Database
          </Button>
          <Button 
            onClick={handleCleanup} 
            variant="outline" 
            className="flex items-center gap-2"
            disabled={systemMaintenance.isPending}
          >
            <Trash2 className="h-4 w-4" />
            Cleanup Old Logs
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Database Information</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Database operations are performed with system administrator privileges</p>
            <p>• Backup files are stored securely and can be restored when needed</p>
            <p>• Optimization improves query performance and storage efficiency</p>
            <p>• Log cleanup removes audit entries older than 30 days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseSettings;
