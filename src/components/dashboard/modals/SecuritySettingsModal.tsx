import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Activity,
  RefreshCw,
  Zap,
  Key,
  Fingerprint,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SecurityConfig {
  mfaRequired: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireSpecialChars: boolean;
  enableAuditLogs: boolean;
  ipWhitelist: string[];
  enableRateLimiting: boolean;
}

interface SecurityMetrics {
  failedLogins: number;
  suspiciousActivities: number;
  activeSessions: number;
  lastSecurityScan: string;
  threatLevel: "low" | "medium" | "high";
}

const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<SecurityConfig>({
    mfaRequired: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireSpecialChars: true,
    enableAuditLogs: true,
    ipWhitelist: [],
    enableRateLimiting: true,
  });
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    failedLogins: 0,
    suspiciousActivities: 0,
    activeSessions: 0,
    lastSecurityScan: "Never",
    threatLevel: "low",
  });
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSecurityConfig();
      fetchSecurityMetrics();
    }
  }, [isOpen]);

  const fetchSecurityConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .eq("setting_key", "security_config")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching security config:", error);
        return;
      }

      if (data && typeof data.setting_value === 'object') {
        setConfig(data.setting_value as unknown as SecurityConfig);
      }
    } catch (error) {
      console.error("Error fetching security config:", error);
    }
  };

  const fetchSecurityMetrics = async () => {
    try {
      setLoading(true);

      // Simulate fetching security metrics
      const mockMetrics: SecurityMetrics = {
        failedLogins: Math.floor(Math.random() * 10),
        suspiciousActivities: Math.floor(Math.random() * 5),
        activeSessions: Math.floor(Math.random() * 50) + 10,
        lastSecurityScan: new Date(
          Date.now() - Math.random() * 86400000
        ).toLocaleString(),
        threatLevel: Math.random() > 0.7 ? "medium" : "low",
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error("Error fetching security metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSecurityConfig = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.from("system_settings").upsert({
        setting_key: "security_config",
        setting_value: config as unknown as Record<string, any>,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error saving security config:", error);
        return;
      }
    } catch (error) {
      console.error("Error saving security config:", error);
    } finally {
      setLoading(false);
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getThreatLevelIcon = (level: string) => {
    switch (level) {
      case "low":
        return <CheckCircle className="h-4 w-4" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4" />;
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Settings</span>
          </DialogTitle>
          <DialogDescription>
            Configure security settings and monitor system security status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Security Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Security Status</span>
                <Badge className={getThreatLevelColor(metrics.threatLevel)}>
                  {getThreatLevelIcon(metrics.threatLevel)}
                  <span className="ml-1 capitalize">
                    {metrics.threatLevel} Threat
                  </span>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Lock className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">Failed Logins</p>
                    <p className="text-2xl font-bold">{metrics.failedLogins}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">Suspicious Activities</p>
                    <p className="text-2xl font-bold">
                      {metrics.suspiciousActivities}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Active Sessions</p>
                    <p className="text-2xl font-bold">
                      {metrics.activeSessions}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Clock className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Last Security Scan</p>
                    <p className="text-sm font-bold">
                      {metrics.lastSecurityScan}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authentication Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
              <CardDescription>
                Configure user authentication and session management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      Multi-Factor Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Require MFA for all users
                    </p>
                  </div>
                  <Switch
                    checked={config.mfaRequired}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, mfaRequired: checked })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="session-timeout">
                      Session Timeout (minutes)
                    </Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={config.sessionTimeout}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          sessionTimeout: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-login-attempts">
                      Max Login Attempts
                    </Label>
                    <Input
                      id="max-login-attempts"
                      type="number"
                      value={config.maxLoginAttempts}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          maxLoginAttempts: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
              <CardDescription>
                Configure password requirements and complexity rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password-min-length">Minimum Length</Label>
                    <Input
                      id="password-min-length"
                      type="number"
                      value={config.passwordMinLength}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          passwordMinLength: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      Require Special Characters
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Passwords must contain special characters
                    </p>
                  </div>
                  <Switch
                    checked={config.requireSpecialChars}
                    onCheckedChange={(checked) =>
                      setConfig({ ...config, requireSpecialChars: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Advanced Security</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="ml-2">
                    {showAdvanced ? "Hide" : "Show"} Advanced
                  </span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showAdvanced && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">
                        Enable Audit Logs
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Log all security-related activities
                      </p>
                    </div>
                    <Switch
                      checked={config.enableAuditLogs}
                      onCheckedChange={(checked) =>
                        setConfig({ ...config, enableAuditLogs: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">
                        Rate Limiting
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Limit API requests to prevent abuse
                      </p>
                    </div>
                    <Switch
                      checked={config.enableRateLimiting}
                      onCheckedChange={(checked) =>
                        setConfig({ ...config, enableRateLimiting: checked })
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Security Actions</CardTitle>
              <CardDescription>
                Perform security-related operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Run Security Scan</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Revoke All Sessions</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Key className="h-4 w-4" />
                  <span>Rotate API Keys</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Fingerprint className="h-4 w-4" />
                  <span>Security Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={saveSecurityConfig} disabled={loading}>
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecuritySettingsModal;
