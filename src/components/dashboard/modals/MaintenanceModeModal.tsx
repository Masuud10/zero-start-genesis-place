
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AuthUser } from '@/types/auth';
import { SystemMaintenanceService } from '@/services/system/systemMaintenanceService';
import { Settings, AlertTriangle, Loader2 } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    enabled: false,
    message: 'System is currently under maintenance. Please try again later.'
  });

  useEffect(() => {
    if (isOpen) {
      fetchMaintenanceSettings();
    }
  }, [isOpen]);

  const fetchMaintenanceSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await SystemMaintenanceService.getMaintenanceStatus();
      
      if (error) {
        console.error('Error fetching maintenance settings:', error);
        toast({
          title: "Error",
          description: "Failed to load maintenance settings",
          variant: "destructive",
        });
      } else if (data) {
        setSettings({
          enabled: data.enabled,
          message: data.message
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { success, error } = await SystemMaintenanceService.updateMaintenanceStatus(
        settings.enabled,
        settings.message
      );
      
      if (success) {
        toast({
          title: "Success",
          description: "Maintenance settings updated successfully",
        });
        onSuccess();
        onClose();
      } else {
        toast({
          title: "Error",
          description: "Failed to update maintenance settings",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error updating maintenance settings:', error);
      toast({
        title: "Error",
        description: "Failed to update maintenance settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading maintenance settings...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
        
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Enabling maintenance mode will prevent all users except admins from accessing the system.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenance-enabled">Enable Maintenance Mode</Label>
              <p className="text-xs text-gray-500 mt-1">Block non-admin user access</p>
            </div>
            <Switch
              id="maintenance-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          <div>
            <Label htmlFor="maintenance-message">Maintenance Message</Label>
            <Input
              id="maintenance-message"
              value={settings.message}
              onChange={(e) => 
                setSettings(prev => ({ ...prev, message: e.target.value }))
              }
              placeholder="Enter maintenance message for users"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              This message will be displayed to users when they try to access the system.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceModeModal;
