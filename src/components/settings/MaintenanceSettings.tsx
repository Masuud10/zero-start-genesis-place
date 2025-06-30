
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useSystemMaintenance } from '@/hooks/useSystemSettings';
import { 
  Settings, 
  AlertTriangle, 
  RefreshCw, 
  Trash2, 
  Database,
  CheckCircle
} from 'lucide-react';

const MaintenanceSettings: React.FC = () => {
  const { toast } = useToast();
  const systemMaintenance = useSystemMaintenance();
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleMaintenance = (action: string) => {
    setLastAction(action);
    systemMaintenance.mutate(action);
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
              <Card key={action.id} className="p-4">
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
