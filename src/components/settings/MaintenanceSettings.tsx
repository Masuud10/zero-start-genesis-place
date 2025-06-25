
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMaintenanceSettings, useUpdateMaintenanceSettings } from '@/hooks/useMaintenanceSettings';
import { Settings, AlertTriangle, CheckCircle } from 'lucide-react';

const MaintenanceSettings: React.FC = () => {
  const { data: settings, isLoading } = useMaintenanceSettings();
  const updateSettings = useUpdateMaintenanceSettings();
  const [localEnabled, setLocalEnabled] = React.useState(false);
  const [localMessage, setLocalMessage] = React.useState('');

  React.useEffect(() => {
    if (settings) {
      setLocalEnabled(settings.enabled);
      setLocalMessage(settings.message);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      enabled: localEnabled,
      message: localMessage
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Maintenance Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {localEnabled && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <strong>Warning:</strong> Maintenance mode is currently active. Only administrators can access the system.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Maintenance Mode</h3>
              <p className="text-sm text-gray-600">
                Enable maintenance mode to temporarily disable user access during system updates
              </p>
            </div>
            <Switch
              checked={localEnabled}
              onCheckedChange={setLocalEnabled}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Maintenance Message</label>
            <Textarea
              value={localMessage}
              onChange={(e) => setLocalMessage(e.target.value)}
              placeholder="Enter a message to display to users during maintenance..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              onClick={handleSave}
              disabled={updateSettings.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">
                System Status: {localEnabled ? 'Under Maintenance' : 'Operational'}
              </p>
              <p className="text-sm text-gray-600">
                Last updated: {settings?.updated_at ? new Date(settings.updated_at).toLocaleString() : 'Never'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${localEnabled ? 'bg-red-500' : 'bg-green-500'}`}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceSettings;
