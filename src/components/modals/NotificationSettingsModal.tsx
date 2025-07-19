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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Bell, Loader2, Mail, MessageSquare, Users } from "lucide-react";

interface NotificationSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    systemAlerts: true,
    userRegistrations: true,
    paymentNotifications: true,
    maintenanceAlerts: true,
    emailTemplate: "Welcome to EduFam! Thank you for joining our platform.",
    smsTemplate: "Welcome to EduFam! Your account has been created successfully.",
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate saving settings
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast({
        title: "Notification Settings Updated",
        description: "All notification settings have been saved successfully.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Settings</span>
          </DialogTitle>
          <DialogDescription>
            Configure system notifications and communication preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Notification Channels */}
          <div>
            <h3 className="text-lg font-medium mb-3">Notification Channels</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via email
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via SMS
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, smsNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send browser push notifications
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, pushNotifications: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Notification Types */}
          <div>
            <h3 className="text-lg font-medium mb-3">Notification Types</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>System Alerts</Label>
                <Switch
                  checked={settings.systemAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, systemAlerts: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>User Registrations</Label>
                <Switch
                  checked={settings.userRegistrations}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, userRegistrations: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Payment Notifications</Label>
                <Switch
                  checked={settings.paymentNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, paymentNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Maintenance Alerts</Label>
                <Switch
                  checked={settings.maintenanceAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, maintenanceAlerts: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Message Templates */}
          <div>
            <h3 className="text-lg font-medium mb-3">Message Templates</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email-template">Email Template</Label>
                <Textarea
                  id="email-template"
                  value={settings.emailTemplate}
                  onChange={(e) =>
                    setSettings({ ...settings, emailTemplate: e.target.value })
                  }
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="sms-template">SMS Template</Label>
                <Textarea
                  id="sms-template"
                  value={settings.smsTemplate}
                  onChange={(e) =>
                    setSettings({ ...settings, smsTemplate: e.target.value })
                  }
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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

export default NotificationSettingsModal;