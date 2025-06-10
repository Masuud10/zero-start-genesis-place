
import React, { useState } from 'react';
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
import { Database, HardDrive, Download, Upload, Clock, PlayCircle, StopCircle } from 'lucide-react';

interface BackupRecord {
  id: string;
  type: string;
  size: string;
  status: 'completed' | 'running' | 'failed';
  createdAt: string;
  duration: string;
}

const SystemMaintenanceSettings = () => {
  const [backups, setBackups] = useState<BackupRecord[]>([
    {
      id: '1',
      type: 'Full Database',
      size: '2.4 GB',
      status: 'completed',
      createdAt: '2024-01-15 02:00:00',
      duration: '45 minutes'
    },
    {
      id: '2',
      type: 'Incremental',
      size: '156 MB',
      status: 'completed',
      createdAt: '2024-01-15 06:00:00',
      duration: '8 minutes'
    },
    {
      id: '3',
      type: 'Configuration',
      size: '2.1 MB',
      status: 'completed',
      createdAt: '2024-01-15 12:00:00',
      duration: '2 minutes'
    }
  ]);

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const { toast } = useToast();

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

  return (
    <div className="space-y-6">
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
                <p className="text-xl font-bold">8.2 GB</p>
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
                <p className="text-xl font-bold">2h ago</p>
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
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Database Optimization</Label>
                  <p className="text-sm text-muted-foreground">Optimize database performance weekly</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Log Cleanup</Label>
                  <p className="text-sm text-muted-foreground">Auto-delete old logs after 90 days</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="space-y-4">
              <Button className="w-full" variant="outline">
                <Database className="w-4 h-4 mr-2" />
                Optimize Database
              </Button>
              <Button className="w-full" variant="outline">
                <HardDrive className="w-4 h-4 mr-2" />
                Clear Cache
              </Button>
              <Button className="w-full" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export System Logs
              </Button>
              <Button className="w-full">
                Save Maintenance Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemMaintenanceSettings;
