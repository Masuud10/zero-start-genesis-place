
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Settings, AlertTriangle } from 'lucide-react';

interface MaintenanceConfig {
  enabled: boolean;
  message: string;
  estimated_duration: string;
  affected_services: string;
}

const MaintenanceSettings: React.FC = () => {
  const { toast } = useToast();
  const [maintenanceData, setMaintenanceData] = useState({
    maintenance_mode: false,
    maintenance_message: 'System is under maintenance. Please try again later.',
    estimated_duration: '',
    affected_services: 'All services'
  });

  // Fetch current maintenance settings
  const { data: maintenanceConfig } = useQuery({
    queryKey: ['maintenance-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .eq('setting_key', 'maintenance_mode');

      if (error) throw error;
      return data?.[0]?.setting_value as MaintenanceConfig || {};
    }
  });

  React.useEffect(() => {
    if (maintenanceConfig) {
      const config = maintenanceConfig as MaintenanceConfig;
      setMaintenanceData(prev => ({
        ...prev,
        maintenance_mode: config.enabled || false,
        maintenance_message: config.message || prev.maintenance_message,
        estimated_duration: config.estimated_duration || '',
        affected_services: config.affected_services || 'All services'
      }));
    }
  }, [maintenanceConfig]);

  const updateMaintenanceMutation = useMutation({
    mutationFn: async (config: typeof maintenanceData) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'maintenance_mode',
          setting_value: {
            enabled: config.maintenance_mode,
            message: config.maintenance_message,
            estimated_duration: config.estimated_duration,
            affected_services: config.affected_services,
            updated_at: new Date().toISOString()
          }
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Maintenance settings updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error updating maintenance settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update maintenance settings",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMaintenanceMutation.mutate(maintenanceData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Maintenance Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenance_mode">Enable Maintenance Mode</Label>
              <p className="text-xs text-gray-500">Prevent user access to the system</p>
            </div>
            <Switch
              id="maintenance_mode"
              checked={maintenanceData.maintenance_mode}
              onCheckedChange={(checked) => 
                setMaintenanceData(prev => ({ ...prev, maintenance_mode: checked }))
              }
            />
          </div>

          {maintenanceData.maintenance_mode && (
            <>
              <div>
                <Label htmlFor="maintenance_message">Maintenance Message</Label>
                <Textarea
                  id="maintenance_message"
                  value={maintenanceData.maintenance_message}
                  onChange={(e) => 
                    setMaintenanceData(prev => ({ ...prev, maintenance_message: e.target.value }))
                  }
                  placeholder="Message to display during maintenance"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="estimated_duration">Estimated Duration</Label>
                <Input
                  id="estimated_duration"
                  value={maintenanceData.estimated_duration}
                  onChange={(e) => 
                    setMaintenanceData(prev => ({ ...prev, estimated_duration: e.target.value }))
                  }
                  placeholder="e.g., 2 hours"
                />
              </div>

              <div>
                <Label htmlFor="affected_services">Affected Services</Label>
                <Input
                  id="affected_services"
                  value={maintenanceData.affected_services}
                  onChange={(e) => 
                    setMaintenanceData(prev => ({ ...prev, affected_services: e.target.value }))
                  }
                  placeholder="All services"
                />
              </div>
            </>
          )}

          <Button 
            type="submit" 
            disabled={updateMaintenanceMutation.isPending}
            className="w-full"
          >
            {updateMaintenanceMutation.isPending ? 'Updating...' : 'Update Maintenance Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MaintenanceSettings;
