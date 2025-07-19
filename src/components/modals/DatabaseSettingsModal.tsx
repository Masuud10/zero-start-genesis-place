import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Database, Loader2, Check, AlertTriangle } from "lucide-react";

interface DatabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DatabaseSettingsModal: React.FC<DatabaseSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const databaseStats = {
    connections: 45,
    maxConnections: 100,
    diskUsage: "2.3 GB",
    totalSize: "10 GB",
    backupStatus: "Last backup: 2 hours ago",
  };

  const handleBackupDatabase = async () => {
    setIsLoading(true);
    try {
      // Simulate backup process
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast({
        title: "Backup Started",
        description: "Database backup has been initiated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start database backup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptimizeDatabase = async () => {
    setIsLoading(true);
    try {
      // Simulate optimization process
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      toast({
        title: "Optimization Complete",
        description: "Database has been optimized successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to optimize database",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Database Settings</span>
          </DialogTitle>
          <DialogDescription>
            Monitor and manage database configuration and performance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Database Statistics */}
          <div>
            <h3 className="text-lg font-medium mb-3">Database Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground">Active Connections</div>
                <div className="text-2xl font-bold">{databaseStats.connections}</div>
                <div className="text-sm text-muted-foreground">
                  of {databaseStats.maxConnections} max
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground">Disk Usage</div>
                <div className="text-2xl font-bold">{databaseStats.diskUsage}</div>
                <div className="text-sm text-muted-foreground">
                  of {databaseStats.totalSize} total
                </div>
              </div>
            </div>
          </div>

          {/* Backup Status */}
          <div>
            <h3 className="text-lg font-medium mb-3">Backup Status</h3>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>{databaseStats.backupStatus}</span>
              </div>
              <Badge variant="outline" className="text-green-600">
                Healthy
              </Badge>
            </div>
          </div>

          {/* Database Actions */}
          <div>
            <h3 className="text-lg font-medium mb-3">Database Actions</h3>
            <div className="space-y-3">
              <Button
                onClick={handleBackupDatabase}
                disabled={isLoading}
                className="w-full justify-start"
                variant="outline"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Database className="h-4 w-4 mr-2" />
                Create Manual Backup
              </Button>
              
              <Button
                onClick={handleOptimizeDatabase}
                disabled={isLoading}
                className="w-full justify-start"
                variant="outline"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <AlertTriangle className="h-4 w-4 mr-2" />
                Optimize Database
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DatabaseSettingsModal;