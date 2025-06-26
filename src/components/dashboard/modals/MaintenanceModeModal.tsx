
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthUser } from '@/types/auth';
import { Settings, AlertTriangle } from 'lucide-react';

interface MaintenanceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: AuthUser;
}

const MaintenanceModeModal: React.FC<MaintenanceModeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('System is under maintenance. Please try again later.');

  const updateMaintenanceMode = useMutation({
    mutationFn: async ({ enabled, message }: { enabled: boolean; message: string }) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'maintenance_mode',
          setting_value: {
            enabled,
            message,
            updated_by: currentUser.id,
            updated_at: new Date().toISOString()
          }
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Maintenance mode ${maintenanceEnabled ? 'enabled' : 'disabled'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update maintenance mode",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMaintenanceMode.mutate({
      enabled: maintenanceEnabled,
      message: maintenanceMessage
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Maintenance Mode
          </DialogTitle>
          <DialogDescription>
            Control system-wide maintenance mode settings
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenance_mode">Enable Maintenance Mode</Label>
              <p className="text-xs text-gray-500">Prevent user access to the system</p>
            </div>
            <Switch
              id="maintenance_mode"
              checked={maintenanceEnabled}
              onCheckedChange={setMaintenanceEnabled}
            />
          </div>

          {maintenanceEnabled && (
            <div>
              <Label htmlFor="maintenance_message">Maintenance Message</Label>
              <Textarea
                id="maintenance_message"
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="Message to display during maintenance"
                rows={3}
              />
            </div>
          )}

          {maintenanceEnabled && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium">Warning</p>
                  <p>Enabling maintenance mode will prevent all users from accessing the system.</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateMaintenanceMode.isPending}
              className="flex-1"
            >
              {updateMaintenanceMode.isPending ? 'Updating...' : 'Update Settings'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceModeModal;
