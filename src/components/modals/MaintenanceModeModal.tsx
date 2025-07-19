import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface MaintenanceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MaintenanceModeModal: React.FC<MaintenanceModeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchMaintenanceSettings();
    }
  }, [isOpen]);

  const fetchMaintenanceSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("setting_value")
        .eq("setting_key", "maintenance_mode")
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data?.setting_value && typeof data.setting_value === 'object') {
        const settings = data.setting_value as { enabled?: boolean; message?: string };
        setMaintenanceEnabled(settings.enabled || false);
        setMessage(settings.message || "");
      }
    } catch (error) {
      console.error("Error fetching maintenance settings:", error);
      toast({
        title: "Error",
        description: "Failed to load maintenance settings",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("system_settings")
        .upsert({
          setting_key: "maintenance_mode",
          setting_value: {
            enabled: maintenanceEnabled,
            message: message || "System is currently under maintenance. Please try again later.",
          },
        });

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: "Maintenance mode settings have been updated successfully.",
      });
      onClose();
    } catch (error) {
      console.error("Error updating maintenance settings:", error);
      toast({
        title: "Error",
        description: "Failed to update maintenance settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Maintenance Mode Settings</DialogTitle>
          <DialogDescription>
            Configure system maintenance mode and display message
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="maintenance-enabled"
              checked={maintenanceEnabled}
              onCheckedChange={setMaintenanceEnabled}
            />
            <Label htmlFor="maintenance-enabled">
              Enable Maintenance Mode
            </Label>
          </div>

          <div>
            <Label htmlFor="maintenance-message">Maintenance Message</Label>
            <Textarea
              id="maintenance-message"
              placeholder="Enter the message to display during maintenance..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceModeModal;