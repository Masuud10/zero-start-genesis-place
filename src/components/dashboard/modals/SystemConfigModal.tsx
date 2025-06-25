
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AuthUser } from '@/types/auth';

interface SystemConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: AuthUser;
}

const SystemConfigModal: React.FC<SystemConfigModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser
}) => {
  const { toast } = useToast();
  const [configData, setConfigData] = useState({
    maintenance_mode: false,
    maintenance_message: 'System is under maintenance. Please try again later.',
    max_schools_per_admin: 10,
    session_timeout_minutes: 30,
    backup_frequency_hours: 24
  });

  // Fetch current system configuration
  const { data: systemConfig } = useQuery({
    queryKey: ['system-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      const config: Record<string, any> = {};
      data?.forEach(item => {
        config[item.setting_key] = item.setting_value;
      });

      return config;
    },
    enabled: isOpen
  });

  React.useEffect(() => {
    if (systemConfig) {
      setConfigData(prev => ({
        ...prev,
        maintenance_mode: systemConfig.maintenance_mode?.enabled || false,
        maintenance_message: systemConfig.maintenance_mode?.message || prev.maintenance_message,
        max_schools_per_admin: systemConfig.max_schools_per_admin?.value || prev.max_schools_per_admin,
        session_timeout_minutes: systemConfig.session_timeout?.minutes || prev.session_timeout_minutes,
        backup_frequency_hours: systemConfig.backup_frequency?.hours || prev.backup_frequency_hours
      }));
    }
  }, [systemConfig]);

  const updateConfigMutation = useMutation({
    mutationFn: async (config: typeof configData) => {
      const updates = [
        {
          setting_key: 'maintenance_mode',
          setting_value: {
            enabled: config.maintenance_mode,
            message: config.maintenance_message
          }
        },
        {
          setting_key: 'max_schools_per_admin',
          setting_value: { value: config.max_schools_per_admin }
        },
        {
          setting_key: 'session_timeout',
          setting_value: { minutes: config.session_timeout_minutes }
        },
        {
          setting_key: 'backup_frequency',
          setting_value: { hours: config.backup_frequency_hours }
        }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .upsert(update);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "System configuration updated successfully",
      });
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      console.error('Error updating system config:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update system configuration",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfigMutation.mutate(configData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>System Configuration</DialogTitle>
          <DialogDescription>
            Configure system-wide settings and maintenance options.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
              <p className="text-xs text-gray-500">Enable to prevent user access</p>
            </div>
            <Switch
              id="maintenance_mode"
              checked={configData.maintenance_mode}
              onCheckedChange={(checked) => 
                setConfigData(prev => ({ ...prev, maintenance_mode: checked }))
              }
            />
          </div>

          {configData.maintenance_mode && (
            <div>
              <Label htmlFor="maintenance_message">Maintenance Message</Label>
              <Textarea
                id="maintenance_message"
                value={configData.maintenance_message}
                onChange={(e) => 
                  setConfigData(prev => ({ ...prev, maintenance_message: e.target.value }))
                }
                placeholder="Message to display during maintenance"
                rows={3}
              />
            </div>
          )}

          <div>
            <Label htmlFor="max_schools">Max Schools per Admin</Label>
            <Input
              id="max_schools"
              type="number"
              value={configData.max_schools_per_admin}
              onChange={(e) => 
                setConfigData(prev => ({ ...prev, max_schools_per_admin: parseInt(e.target.value) }))
              }
              min="1"
              max="100"
            />
          </div>

          <div>
            <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
            <Input
              id="session_timeout"
              type="number"
              value={configData.session_timeout_minutes}
              onChange={(e) => 
                setConfigData(prev => ({ ...prev, session_timeout_minutes: parseInt(e.target.value) }))
              }
              min="5"
              max="480"
            />
          </div>

          <div>
            <Label htmlFor="backup_frequency">Backup Frequency (hours)</Label>
            <Input
              id="backup_frequency"
              type="number"
              value={configData.backup_frequency_hours}
              onChange={(e) => 
                setConfigData(prev => ({ ...prev, backup_frequency_hours: parseInt(e.target.value) }))
              }
              min="1"
              max="168"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateConfigMutation.isPending}
              className="flex-1"
            >
              {updateConfigMutation.isPending ? 'Updating...' : 'Update Config'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SystemConfigModal;
