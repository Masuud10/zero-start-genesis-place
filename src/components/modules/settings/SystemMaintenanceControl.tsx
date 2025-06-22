
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMaintenanceSettings, useUpdateMaintenanceSettings } from '@/hooks/useMaintenanceSettings';
import { Settings, AlertTriangle, CheckCircle } from 'lucide-react';

const SystemMaintenanceControl = () => {
  const { data: maintenanceSettings, isLoading } = useMaintenanceSettings();
  const updateMaintenance = useUpdateMaintenanceSettings();
  
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState('');

  React.useEffect(() => {
    if (maintenanceSettings) {
      setEnabled(maintenanceSettings.enabled);
      setMessage(maintenanceSettings.message);
    }
  }, [maintenanceSettings]);

  const handleToggleChange = (checked: boolean) => {
    setEnabled(checked);
  };

  const handleSaveSettings = () => {
    updateMaintenance.mutate({ enabled, message });
  };

  const hasChanges = maintenanceSettings && (
    enabled !== maintenanceSettings.enabled || 
    message !== maintenanceSettings.message
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Maintenance Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          System Maintenance Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className={enabled ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
          {enabled ? (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className={enabled ? "text-red-700" : "text-green-700"}>
            <strong>System Status:</strong> {enabled ? 'Maintenance Mode - Active' : 'Available - Normal Operations'}
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="maintenance-toggle" className="text-base font-medium">
                Maintenance Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                When enabled, non-admin users will see a maintenance message and cannot access the system
              </p>
            </div>
            <Switch
              id="maintenance-toggle"
              checked={enabled}
              onCheckedChange={handleToggleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenance-message">Maintenance Message</Label>
            <Textarea
              id="maintenance-message"
              placeholder="Enter the message users will see during maintenance..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This message will be displayed to all non-admin users when maintenance mode is active
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleSaveSettings}
              disabled={!hasChanges || updateMaintenance.isPending}
              className={enabled ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
            >
              {updateMaintenance.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                `${enabled ? 'Enable' : 'Disable'} Maintenance Mode`
              )}
            </Button>
            
            {hasChanges && (
              <p className="text-sm text-amber-600">
                You have unsaved changes
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemMaintenanceControl;
