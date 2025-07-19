import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface NotificationSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [settings, setSettings] = React.useState({
    email: {
      systemAlerts: true,
      userActivity: false,
      securityEvents: true,
      weeklyReports: true,
    },
    push: {
      systemAlerts: true,
      userActivity: false,
      securityEvents: true,
      maintenanceUpdates: true,
    },
    sms: {
      criticalAlerts: true,
      securityBreaches: true,
    },
  });

  const handleToggle = (
    category: keyof typeof settings,
    setting: string,
    value: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const handleSave = () => {
    // Handle saving notification settings
    console.log("Notification settings:", settings);
    onOpenChange(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "systemAlerts":
        return <AlertTriangle className="h-4 w-4" />;
      case "userActivity":
        return <CheckCircle className="h-4 w-4" />;
      case "securityEvents":
        return <AlertTriangle className="h-4 w-4" />;
      case "weeklyReports":
        return <CheckCircle className="h-4 w-4" />;
      case "maintenanceUpdates":
        return <CheckCircle className="h-4 w-4" />;
      case "criticalAlerts":
        return <AlertTriangle className="h-4 w-4" />;
      case "securityBreaches":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getDescription = (type: string) => {
    switch (type) {
      case "systemAlerts":
        return "System-wide alerts and notifications";
      case "userActivity":
        return "User login, logout, and activity events";
      case "securityEvents":
        return "Security-related events and warnings";
      case "weeklyReports":
        return "Weekly summary and analytics reports";
      case "maintenanceUpdates":
        return "System maintenance and update notifications";
      case "criticalAlerts":
        return "Critical system alerts requiring immediate attention";
      case "securityBreaches":
        return "Security breach and threat notifications";
      default:
        return "General notifications";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notification Settings</span>
          </DialogTitle>
          <DialogDescription>
            Configure how and when you receive notifications.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Notifications */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Email Notifications</h3>
              <Badge variant="outline">Primary</Badge>
            </div>
            <div className="space-y-3">
              {Object.entries(settings.email).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getIcon(key)}
                    <div>
                      <Label className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {getDescription(key)}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      handleToggle("email", key, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Push Notifications */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Push Notifications</h3>
              <Badge variant="outline">Real-time</Badge>
            </div>
            <div className="space-y-3">
              {Object.entries(settings.push).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getIcon(key)}
                    <div>
                      <Label className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {getDescription(key)}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      handleToggle("push", key, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* SMS Notifications */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold">SMS Notifications</h3>
              <Badge variant="outline">Critical Only</Badge>
            </div>
            <div className="space-y-3">
              {Object.entries(settings.sms).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getIcon(key)}
                    <div>
                      <Label className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {getDescription(key)}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      handleToggle("sms", key, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationSettingsModal;
