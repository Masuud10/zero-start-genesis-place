
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AuthUser } from '@/types/auth';
import { Database, Trash2, RefreshCw, Loader2, CheckCircle } from 'lucide-react';
import { useSystemMaintenance } from '@/hooks/useSystemSettings';

interface DatabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: AuthUser;
}

const DatabaseSettingsModal: React.FC<DatabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser
}) => {
  const { toast } = useToast();
  const [lastAction, setLastAction] = useState<string | null>(null);
  const systemMaintenance = useSystemMaintenance();

  const handleMaintenance = (action: string) => {
    setLastAction(action);
    systemMaintenance.mutate(action, {
      onSuccess: () => {
        onSuccess();
      }
    });
  };

  const maintenanceActions = [
    {
      id: 'cleanup_audit_logs',
      label: 'Clean Audit Logs',
      description: 'Remove audit logs older than 30 days',
      icon: Trash2,
      variant: 'outline' as const
    },
    {
      id: 'reset_rate_limits',
      label: 'Reset Rate Limits',
      description: 'Clear all active rate limiting blocks',
      icon: RefreshCw,
      variant: 'outline' as const
    },
    {
      id: 'optimize_database',
      label: 'Optimize Database',
      description: 'Run database optimization routines',
      icon: Database,
      variant: 'outline' as const
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Settings
          </DialogTitle>
          <DialogDescription>
            Manage database maintenance and optimization tasks
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Database maintenance operations help keep the system running efficiently.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h4 className="font-medium">Available Maintenance Tasks</h4>
            <div className="grid gap-3">
              {maintenanceActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <action.icon className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">{action.label}</div>
                      <div className="text-sm text-gray-500">{action.description}</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleMaintenance(action.id)}
                    disabled={systemMaintenance.isPending}
                    variant={action.variant}
                    size="sm"
                  >
                    {systemMaintenance.isPending && lastAction === action.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      'Run Task'
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Database Health Status</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Connection Status:</span>
                <Badge variant="default">Connected</Badge>
              </div>
              <div className="flex justify-between">
                <span>Performance:</span>
                <Badge variant="secondary">Good</Badge>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DatabaseSettingsModal;
