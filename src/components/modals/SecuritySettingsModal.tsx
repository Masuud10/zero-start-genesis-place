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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Loader2, Lock, Key, AlertTriangle } from "lucide-react";

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    twoFactorEnabled: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordExpiry: 90,
    requireStrongPasswords: true,
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate saving settings
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast({
        title: "Security Settings Updated",
        description: "All security settings have been saved successfully.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update security settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const securityStatus = [
    { name: "SSL/TLS Encryption", status: "Active", color: "green" },
    { name: "Database Encryption", status: "Active", color: "green" },
    { name: "API Rate Limiting", status: "Active", color: "green" },
    { name: "Audit Logging", status: "Active", color: "green" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Settings</span>
          </DialogTitle>
          <DialogDescription>
            Configure security policies and authentication settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Security Status */}
          <div>
            <h3 className="text-lg font-medium mb-3">Security Status</h3>
            <div className="grid grid-cols-2 gap-3">
              {securityStatus.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">{item.name}</span>
                  <Badge variant="outline" className="text-green-600">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Authentication Settings */}
          <div>
            <h3 className="text-lg font-medium mb-3">Authentication Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for admin accounts
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactorEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, twoFactorEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Strong Password Policy</Label>
                  <p className="text-sm text-muted-foreground">
                    Enforce complex password requirements
                  </p>
                </div>
                <Switch
                  checked={settings.requireStrongPasswords}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, requireStrongPasswords: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Session Settings */}
          <div>
            <h3 className="text-lg font-medium mb-3">Session Settings</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      sessionTimeout: parseInt(e.target.value),
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="login-attempts">Max Failed Login Attempts</Label>
                <Input
                  id="login-attempts"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxLoginAttempts: parseInt(e.target.value),
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                <Input
                  id="password-expiry"
                  type="number"
                  value={settings.passwordExpiry}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      passwordExpiry: parseInt(e.target.value),
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>
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

export default SecuritySettingsModal;