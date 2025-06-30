
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMaintenanceSettings, useUpdateMaintenanceSettings } from '@/hooks/useMaintenanceSettings';
import { useSystemMaintenance } from '@/hooks/useSystemSettings';
import { 
  Settings, 
  AlertTriangle, 
  RefreshCw, 
  Trash2, 
  Database,
  CheckCircle,
  Power,
  Save
} from 'lucide-react';

const MaintenanceSettings: React.FC = () => {
  const { toast } = useToast();
  const systemMaintenance = useSystemMaintenance();
  const { data: maintenanceData, isLoading } = useMaintenanceSettings();
  const updateMaintenance = useUpdateMaintenanceSettings();
  
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(maintenanceData?.enabled || false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    maintenanceData?.message || 'System is currently under maintenance. Please try again later.'
  );

  React.useEffect(() => {
    if (maintenanceData) {
      setMaintenanceEnabled(maintenanceData.enabled);
      setMaintenanceMessage(maintenanceData.message);
    }
  }, [maintenanceData]);

  const handleMaintenance = (action: string) => {
    setLastAction(action);
    systemMaintenance.mutate(action);
  };

  const handleMaintenanceToggle = () => {
    updateMaintenance.mutate({
      enabled: !maintenanceEnabled,
      message: maintenanceMessage
    });
    setMaintenanceEnabled(!maintenanceEnabled);
  };

  const maintenanceActions = [
    {
      id: 'cleanup_audit_logs',
      title: 'Clean Audit Logs',
      description: 'Remove old audit logs older than 30 days',
      icon: Trash2,
      variant: 'outline' as const,
      color: 'text-orange-600'
    },
    {
      id: 'reset_rate_limits',
      title: 'Reset Rate Limits',
      description: 'Clear all rate limiting counters',
      icon: RefreshCw,
      variant: 'outline' as const,
      color: 'text-blue-600'
    },
    {
      id: 'optimize_database',
      title: 'Optimize Database',
      description: 'Run database optimization routines',
      icon: Database,
      variant: 'outline' as const,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">System Maintenance</h2>
      </div>

      {/* Maintenance Mode Control */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Power className="h-5 w-5 text-red-600" />
            Maintenance Mode Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <Label className="text-sm font-medium text-red-800">System Maintenance Mode</Label>
              <p className="text-xs text-red-600">Temporarily disable user access during system updates</p>
            </div>
            <Switch
              checked={maintenanceEnabled}
              onCheckedChange={handleMaintenanceToggle}
              disabled={updateMaintenance.isPending}
            />
          </div>

          {maintenanceEnabled && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="maintenance_message">Maintenance Message</Label>
                <Textarea
                  id="maintenance_message"
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  placeholder="Message to display during maintenance"
                  rows={3}
                  className="mt-2"
                />
              </div>
              <Button
                onClick={() => updateMaintenance.mutate({ enabled: maintenanceEnabled, message: maintenanceMessage })}
                disabled={updateMaintenance.isPending}
                size="sm"
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Update Message
              </Button>
            </div>
          )}
          
          {maintenanceEnabled && (
            <Alert className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                <strong>Warning:</strong> Maintenance mode is currently active. Only EduFam Administrators can access the system.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-700">
          System maintenance operations should be performed during low-traffic periods to minimize user impact.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Maintenance Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {maintenanceActions.map((action) => (
              <Card key={action.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center text-center space-y-3">
                  <action.icon className={`h-8 w-8 ${action.color}`} />
                  <div>
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                  <Button
                    onClick={() => handleMaintenance(action.id)}
                    disabled={systemMaintenance.isPending}
                    variant={action.variant}
                    className="w-full"
                  >
                    {systemMaintenance.isPending && lastAction === action.id ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      action.title
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {systemMaintenance.isSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Maintenance operation completed successfully.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MaintenanceSettings;
