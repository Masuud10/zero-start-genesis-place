
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMaintenanceSettings, useUpdateMaintenanceSettings } from '@/hooks/useMaintenanceSettings';
import { Settings, AlertTriangle, CheckCircle } from 'lucide-react';

const MaintenanceSettings: React.FC = () => {
  const { data: maintenanceSettings, isLoading } = useMaintenanceSettings();
  const updateMaintenance = useUpdateMaintenanceSettings();
  
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState('System is currently under maintenance. Please try again later.');

  React.useEffect(() => {
    if (maintenanceSettings) {
      setEnabled(maintenanceSettings.enabled);
      setMessage(maintenanceSettings.message);
    }
  }, [maintenanceSettings]);

  const handleSave = () => {
    updateMaintenance.mutate({ enabled, message });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
          Maintenance Mode Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {enabled && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              Maintenance mode is currently enabled. Users will see the maintenance message.
            </AlertDescription>
          </Alert>
        )}

        {!enabled && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              System is running normally. Users have full access.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="maintenance-mode">Enable Maintenance Mode</Label>
            <p className="text-xs text-gray-500">
              When enabled, users will be shown a maintenance message
            </p>
          </div>
          <Switch
            id="maintenance-mode"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        {enabled && (
          <div>
            <Label htmlFor="maintenance-message">Maintenance Message</Label>
            <Textarea
              id="maintenance-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the message to display to users during maintenance"
              rows={4}
            />
          </div>
        )}

        <Button 
          onClick={handleSave} 
          disabled={updateMaintenance.isPending}
          className="w-full"
        >
          {updateMaintenance.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MaintenanceSettings;
