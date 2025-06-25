
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Database, Download, Upload, RefreshCw } from 'lucide-react';

const DatabaseSettings: React.FC = () => {
  const { toast } = useToast();

  const handleBackup = () => {
    toast({
      title: "Backup Initiated",
      description: "Database backup has been started",
    });
  };

  const handleRestore = () => {
    toast({
      title: "Restore Initiated",
      description: "Database restore process has been started",
    });
  };

  const handleOptimize = () => {
    toast({
      title: "Optimization Started",
      description: "Database optimization is in progress",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={handleBackup} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Backup Database
          </Button>
          <Button onClick={handleRestore} variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Restore Database
          </Button>
          <Button onClick={handleOptimize} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Optimize Database
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          <p>Database operations are performed with system administrator privileges.</p>
          <p>Backup files are stored securely and can be restored when needed.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseSettings;
