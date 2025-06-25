
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { SystemMaintenanceService } from '@/services/system/systemMaintenanceService';
import { Settings, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const SystemMaintenanceControl = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    'System is currently under maintenance. Please try again later.'
  );

  React.useEffect(() => {
    fetchMaintenanceStatus();
  }, []);

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
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading maintenance settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Maintenance Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Maintenance Settings'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SystemMaintenanceControl;
