
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wrench, AlertTriangle, CheckCircle } from 'lucide-react';

interface MaintenanceMode {
  enabled: boolean;
  message: string;
}

const MaintenanceSettings: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');

  // Fetch maintenance mode status
  const { data: maintenanceStatus, isLoading } = useQuery({
    queryKey: ['maintenance-mode'],
    queryFn: async (): Promise<MaintenanceMode> => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'maintenance_mode')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data?.setting_value) {
        return { enabled: false, message: '' };
      }

      // Type-safe parsing of JSON data
      const settingValue = data.setting_value as any;
      return {
        enabled: Boolean(settingValue?.enabled || false),
        message: String(settingValue?.message || '')
      };
    },
  });

  // Toggle maintenance mode mutation
  const toggleMaintenanceMutation = useMutation({
    mutationFn: async ({ enabled, message }: { enabled: boolean; message: string }) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'maintenance_mode',
          setting_value: { enabled, message }
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-mode'] });
      toast({
        title: "Success",
        description: "Maintenance mode settings updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update maintenance mode",
        variant: "destructive",
      });
    },
  });

  const handleToggleMaintenance = () => {
    const isEnabled = maintenanceStatus?.enabled || false;
    toggleMaintenanceMutation.mutate({
      enabled: !isEnabled,
      message: message || maintenanceStatus?.message || 'System is under maintenance. Please try again later.'
    });
  };

  const handleUpdateMessage = () => {
    const isEnabled = maintenanceStatus?.enabled || false;
    toggleMaintenanceMutation.mutate({
      enabled: isEnabled,
      message: message
    });
  };

  React.useEffect(() => {
    if (maintenanceStatus?.message) {
      setMessage(maintenanceStatus.message);
    }
  }, [maintenanceStatus]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isMaintenanceEnabled = maintenanceStatus?.enabled || false;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            System Maintenance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className={isMaintenanceEnabled ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            {isMaintenanceEnabled ? (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            <AlertDescription className={isMaintenanceEnabled ? 'text-red-700' : 'text-green-700'}>
              {isMaintenanceEnabled 
                ? 'System is currently in maintenance mode. New users cannot access the system.'
                : 'System is operational. All users can access the system normally.'
              }
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Maintenance Mode</h3>
              <p className="text-sm text-gray-600">
                When enabled, prevents new user access while displaying a maintenance message
              </p>
            </div>
            <Switch
              checked={isMaintenanceEnabled}
              onCheckedChange={handleToggleMaintenance}
              disabled={toggleMaintenanceMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="maintenance-message" className="text-sm font-medium">
              Maintenance Message
            </label>
            <Textarea
              id="maintenance-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the message users will see during maintenance"
              rows={3}
            />
            <Button 
              onClick={handleUpdateMessage}
              disabled={toggleMaintenanceMutation.isPending}
              variant="outline"
              size="sm"
            >
              Update Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceSettings;
