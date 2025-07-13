import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const MaintenanceModeSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    'System is under maintenance. Please try again later.'
  );

  // Fetch current maintenance mode settings
  const { data: maintenanceData, isLoading } = useQuery({
    queryKey: ['maintenance-mode'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'maintenance_mode')
        .maybeSingle();

      if (error) throw error;
      
      return data?.setting_value || { enabled: false, message: 'System is under maintenance. Please try again later.' };
    }
  });

  // Update local state when data is fetched
  useEffect(() => {
    if (maintenanceData && typeof maintenanceData === 'object' && maintenanceData !== null) {
      const data = maintenanceData as { enabled?: boolean; message?: string };
      setMaintenanceEnabled(data.enabled || false);
      setMaintenanceMessage(data.message || 'System is under maintenance. Please try again later.');
    }
  }, [maintenanceData]);

  const updateMaintenanceMode = useMutation({
    mutationFn: async ({ enabled, message }: { enabled: boolean; message: string }) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'maintenance_mode',
          setting_value: { enabled, message },
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;
      return { enabled, message };
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Maintenance mode ${data.enabled ? 'enabled' : 'disabled'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['maintenance-mode'] });
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update maintenance mode",
        variant: "destructive"
      });
    }
  });

  const handleToggleChange = (checked: boolean) => {
    setMaintenanceEnabled(checked);
    updateMaintenanceMode.mutate({ enabled: checked, message: maintenanceMessage });
  };

  const handleMessageUpdate = () => {
    updateMaintenanceMode.mutate({ enabled: maintenanceEnabled, message: maintenanceMessage });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Maintenance Mode Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle Switch */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="maintenance-toggle" className="text-base font-medium">
              Enable Maintenance Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              Lock out all users except EduFam Admins when enabled
            </p>
          </div>
          <Switch
            id="maintenance-toggle"
            checked={maintenanceEnabled}
            onCheckedChange={handleToggleChange}
            disabled={isLoading || updateMaintenanceMode.isPending}
          />
        </div>

        {/* Maintenance Message */}
        <div className="space-y-2">
          <Label htmlFor="maintenance-message">Maintenance Message</Label>
          <Textarea
            id="maintenance-message"
            value={maintenanceMessage}
            onChange={(e) => setMaintenanceMessage(e.target.value)}
            placeholder="Message to display during maintenance"
            rows={3}
            className="resize-none"
          />
          <Button 
            onClick={handleMessageUpdate}
            disabled={updateMaintenanceMode.isPending}
            size="sm"
            className="w-fit"
          >
            {updateMaintenanceMode.isPending ? "Updating..." : "Update Message"}
          </Button>
        </div>

        {/* Status Alert */}
        {maintenanceEnabled ? (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>System is in maintenance mode.</strong> All users except EduFam Admins are currently locked out.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              System is operational. All users have access to the platform.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default MaintenanceModeSection;