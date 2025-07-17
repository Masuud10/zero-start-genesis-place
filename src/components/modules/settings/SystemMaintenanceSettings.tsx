import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database, HardDrive, Download, Upload, Clock, PlayCircle, StopCircle } from 'lucide-react';
// SystemMaintenanceControl removed as part of school-specific cleanup

interface BackupRecord {
  id: string;
  type: string;
  size: string;
  status: 'completed' | 'running' | 'failed';
  createdAt: string;
  duration: string;
}

const SystemMaintenanceSettings = () => {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadSystemMetrics = async () => {
      try {
        // In a real implementation, you would fetch actual backup records
        // For now, we'll show an empty state since we removed dummy data
        setBackups([]);
        setLoading(false);
      } catch (error) {
        console.error('Error loading system metrics:', error);
        setLoading(false);
      }
    };

    loadSystemMetrics();
  }, []);

  const handleManualBackup = async (type: string) => {
    setIsBackupRunning(true);
    setBackupProgress(0);

    // Simulate backup progress
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackupRunning(false);
          
          const newBackup: BackupRecord = {
            id: Date.now().toString(),
            type: type,
            size: `${Math.floor(Math.random() * 500 + 100)} MB`,
            status: 'completed',
            createdAt: new Date().toLocaleString(),
            duration: `${Math.floor(Math.random() * 30 + 5)} minutes`
          };
          
          setBackups([newBackup, ...backups]);
          
          toast({
            title: "Success",
            description: `${type} backup completed successfully`,
          });
          
          return 0;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleMaintenanceMode = (enabled: boolean) => {
    setMaintenanceMode(enabled);
    toast({
      title: enabled ? "Maintenance Mode Enabled" : "Maintenance Mode Disabled",
      description: enabled 
        ? "System is now in maintenance mode. Users will see a maintenance page."
        : "System is back online and accessible to users.",
      variant: enabled ? "destructive" : "default",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'running': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Loading system settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Maintenance Control - Removed as part of school-specific cleanup */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Backups</p>
                <p className="text-xl font-bold">{backups.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="text-xl font-bold">-</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Backup</p>
                <p className="text-xl font-bold">
                  {backups.length > 0 ? 'Recently' : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${maintenanceMode ? 'bg-red-100' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                {maintenanceMode ? (
                  <StopCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <PlayCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">System Status</p>
                <p className="text-xl font-bold">{maintenanceMode ? 'Maintenance' : 'Online'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => handleManualBackup('Full Database')}
              disabled={isBackupRunning}
              className="h-20 flex flex-col items-center justify-center"
            >
              <Database className="w-6 h-6 mb-2" />
              Full Database Backup
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleManualBackup('Incremental')}
              disabled={isBackupRunning}
              className="h-20 flex flex-col items-center justify-center"
            >
              <Upload className="w-6 h-6 mb-2" />
              Incremental Backup
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleManualBackup('Configuration')}
              disabled={isBackupRunning}
              className="h-20 flex flex-col items-center justify-center"
            >
              <Download className="w-6 h-6 mb-2" />
              Configuration Backup
            </Button>
          </div>

          {isBackupRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Backup in progress...</span>
                <span>{backupProgress}%</span>
              </div>
              <Progress value={backupProgress} className="w-full" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Automatic Backup Settings</h4>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Automatic Backups</Label>
                  <p className="text-sm text-muted-foreground">Schedule regular backups</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div>
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Every Hour</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="backupTime">Backup Time</Label>
                <Input id="backupTime" type="time" defaultValue="02:00" />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Retention Settings</h4>
              <div>
                <Label htmlFor="retentionDays">Retention Period (days)</Label>
                <Input id="retentionDays" type="number" defaultValue="30" />
              </div>
              <div>
                <Label htmlFor="maxBackups">Maximum Backups to Keep</Label>
                <Input id="maxBackups" type="number" defaultValue="10" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Compress Backups</Label>
                  <p className="text-sm text-muted-foreground">Reduce storage usage</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No backups yet</h3>
              <p className="text-sm text-muted-foreground">
                Create your first backup using the buttons above.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell className="font-medium">{backup.type}</TableCell>
                    <TableCell>{backup.size}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(backup.status) as any}>
                        {backup.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{backup.createdAt}</TableCell>
                    <TableCell>{backup.duration}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          Restore
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    {maintenanceMode ? 'System is currently in maintenance mode' : 'Enable to block user access during maintenance'}
                  </p>
                </div>
                <Switch 
                  checked={maintenanceMode}
                  onCheckedChange={handleMaintenanceMode}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMaintenanceSettings;
