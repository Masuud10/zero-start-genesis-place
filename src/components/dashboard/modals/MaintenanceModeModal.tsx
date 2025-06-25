
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AuthUser } from '@/types/auth';
import { SystemMaintenanceService } from '@/services/system/systemMaintenanceService';
import { Settings, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

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
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    'System is currently under maintenance. Please try again later.'
  );

  useEffect(() => {
    if (isOpen) {
      fetchMaintenanceStatus();
    }
  }, [isOpen]);

  const fetchMaintenanceStatus = async () => {
    try {
      setLoading(true);
      const { data } = await SystemMaintenanceService.getMaintenanceStatus();
      if (data) {
        setMaintenanceEnabled(data.enabled);
        setMaintenanceMessage(data.message);
      }
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch maintenance settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { success, error } = await SystemMaintenanceService.updateMaintenanceStatus(
        maintenanceEnabled,
        maintenanceMessage
      );

      if (success) {
        toast({
          title: "Success",
          description: "Maintenance settings updated successfully",
        });
        onSuccess();
        onClose();
      } else {
        throw new Error(error?.message || 'Failed to update maintenance settings');
      }
    } catch (error: any) {
      console.error('Error updating maintenance settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update maintenance settings",
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
            Maintenance Mode Settings
          </DialogTitle>
          <DialogDescription>
            Configure system maintenance mode and message
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {maintenanceEnabled ? (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700">
                Maintenance mode is currently enabled. Users will see the maintenance message.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                System is running normally. Users have full access.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenance-toggle">Enable Maintenance Mode</Label>
              <p className="text-xs text-gray-500">
                When enabled, users will be shown a maintenance message
              </p>
            </div>
            <Switch
              id="maintenance-toggle"
              checked={maintenanceEnabled}
              onCheckedChange={setMaintenanceEnabled}
            />
          </div>

          {maintenanceEnabled && (
            <div>
              <Label htmlFor="maintenance-message">Maintenance Message</Label>
              <Textarea
                id="maintenance-message"
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="Enter the message to display to users during maintenance"
                rows={4}
              />
            </div>
          )}

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
