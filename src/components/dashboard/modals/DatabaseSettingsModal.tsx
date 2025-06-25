
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AuthUser } from '@/types/auth';
import { SystemSettingsService } from '@/services/system/systemSettingsService';
import { Database, RefreshCw, Trash2, Loader2 } from 'lucide-react';

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
  const [isPerformingAction, setIsPerformingAction] = useState(false);

  const handleDatabaseAction = async (action: string, actionName: string) => {
    try {
      setIsPerformingAction(true);
      const result = await SystemSettingsService.performSystemMaintenance(action);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        onSuccess();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error(`Error performing ${actionName}:`, error);
      toast({
        title: "Error",
        description: `Failed to ${actionName.toLowerCase()}`,
        variant: "destructive",
      });
    } finally {
      setIsPerformingAction(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Settings
          </DialogTitle>
          <DialogDescription>
            Manage database maintenance and optimization
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              Use these tools to maintain database performance and clean up data.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button
              onClick={() => handleDatabaseAction('cleanup_audit_logs', 'Clean Old Audit Logs')}
              disabled={isPerformingAction}
              variant="outline"
              className="w-full justify-start"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clean Old Audit Logs
            </Button>
            
            <Button
              onClick={() => handleDatabaseAction('reset_rate_limits', 'Reset Rate Limits')}
              disabled={isPerformingAction}
              variant="outline"
              className="w-full justify-start"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Rate Limits
            </Button>
            
            <Button
              onClick={() => handleDatabaseAction('optimize_database', 'Optimize Database')}
              disabled={isPerformingAction}
              variant="outline"
              className="w-full justify-start"
            >
              <Database className="mr-2 h-4 w-4" />
              Optimize Database
            </Button>
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
