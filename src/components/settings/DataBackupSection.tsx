import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Database, Calendar, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const DataBackupSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);

  // Fetch backup settings
  const { data: backupSettings } = useQuery({
    queryKey: ['backup-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'auto_backup')
        .maybeSingle();

      if (error) throw error;
      return data?.setting_value || { enabled: false, frequency: 'weekly' };
    }
  });

  React.useEffect(() => {
    if (backupSettings && typeof backupSettings === 'object' && backupSettings !== null) {
      const data = backupSettings as { enabled?: boolean; frequency?: string };
      setAutoBackupEnabled(data.enabled || false);
    }
  }, [backupSettings]);

  const downloadBackup = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Call the edge function to generate backup
      const response = await fetch(`https://lmqyizrnuahkmwauonqr.supabase.co/functions/v1/generate-backup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          tables: ['schools', 'students', 'classes', 'grades', 'attendance', 'fees', 'profiles']
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to generate backup');
      }

      // Get the blob and create download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `edufam-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "System backup generated and downloaded successfully",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate backup",
        variant: "destructive"
      });
    }
  });

  const updateAutoBackup = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'auto_backup',
          setting_value: { enabled, frequency: 'weekly' },
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;
      return enabled;
    },
    onSuccess: (enabled) => {
      toast({
        title: "Success",
        description: `Automatic backup ${enabled ? 'enabled' : 'disabled'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['backup-settings'] });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update backup settings",
        variant: "destructive"
      });
    }
  });

  const handleAutoBackupChange = (checked: boolean) => {
    setAutoBackupEnabled(checked);
    updateAutoBackup.mutate(checked);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Data Backup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Manual Backup */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Manual Backup</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Download a complete backup of all critical system data including schools, students, classes, grades, reports, attendance, and financial records.
            </p>
            <Button 
              onClick={() => downloadBackup.mutate()}
              disabled={downloadBackup.isPending}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {downloadBackup.isPending ? "Generating Backup..." : "Download Backup"}
            </Button>
          </div>
        </div>

        <div className="border-t pt-6">
          {/* Auto Backup Settings */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="auto-backup" className="text-base font-medium">
                Automatic Weekly Backup
              </Label>
              <p className="text-sm text-muted-foreground">
                Generate automatic backups every Sunday at 2:00 AM
              </p>
            </div>
            <Switch
              id="auto-backup"
              checked={autoBackupEnabled}
              onCheckedChange={handleAutoBackupChange}
              disabled={updateAutoBackup.isPending}
            />
          </div>
        </div>

        {/* Backup Info */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Backup includes:</strong> Schools, Students, Classes, Grades, Reports, Attendance Records, Financial Data, User Profiles, and System Settings. Sensitive authentication data is excluded for security.
          </AlertDescription>
        </Alert>

        {autoBackupEnabled && (
          <Alert className="border-blue-200 bg-blue-50">
            <Calendar className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Automatic backups are scheduled every Sunday at 2:00 AM. The last 4 backups are retained automatically.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DataBackupSection;