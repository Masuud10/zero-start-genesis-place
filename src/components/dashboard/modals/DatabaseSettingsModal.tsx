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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Database,
  Settings,
  Activity,
  HardDrive,
  Cpu,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DatabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DatabaseMetrics {
  connectionCount: number;
  activeQueries: number;
  cacheHitRatio: number;
  databaseSize: string;
  uptime: string;
  lastBackup: string;
  performanceScore: number;
}

interface DatabaseConfig {
  maxConnections: number;
  queryTimeout: number;
  cacheSize: number;
  backupFrequency: string;
  logLevel: string;
  enableSSL: boolean;
}

const DatabaseSettingsModal: React.FC<DatabaseSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [metrics, setMetrics] = useState<DatabaseMetrics>({
    connectionCount: 0,
    activeQueries: 0,
    cacheHitRatio: 0,
    databaseSize: "0 MB",
    uptime: "0 days",
    lastBackup: "Never",
    performanceScore: 0,
  });
  const [config, setConfig] = useState<DatabaseConfig>({
    maxConnections: 100,
    queryTimeout: 30,
    cacheSize: 256,
    backupFrequency: "daily",
    logLevel: "info",
    enableSSL: true,
  });
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customQuery, setCustomQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchDatabaseMetrics();
      fetchDatabaseConfig();
    }
  }, [isOpen]);

  const fetchDatabaseMetrics = async () => {
    try {
      setLoading(true);

      // Simulate fetching database metrics
      // In a real implementation, this would call actual database monitoring APIs
      const mockMetrics: DatabaseMetrics = {
        connectionCount: Math.floor(Math.random() * 50) + 10,
        activeQueries: Math.floor(Math.random() * 20) + 5,
        cacheHitRatio: Math.floor(Math.random() * 30) + 70,
        databaseSize: `${(Math.random() * 1000 + 100).toFixed(1)} MB`,
        uptime: `${Math.floor(Math.random() * 30) + 1} days`,
        lastBackup: new Date(
          Date.now() - Math.random() * 86400000
        ).toLocaleString(),
        performanceScore: Math.floor(Math.random() * 30) + 70,
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error("Error fetching database metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDatabaseConfig = async () => {
    try {
      // Fetch database configuration from settings
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .eq("setting_key", "database_config")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching database config:", error);
        return;
      }

      if (data && typeof data.setting_value === 'object') {
        setConfig(data.setting_value as unknown as DatabaseConfig);
      }
    } catch (error) {
      console.error("Error fetching database config:", error);
    }
  };

  const saveDatabaseConfig = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.from("system_settings").upsert({
        setting_key: "database_config",
        setting_value: config as unknown as Record<string, any>,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error saving database config:", error);
        return;
      }

      // Show success message or notification
    } catch (error) {
      console.error("Error saving database config:", error);
    } finally {
      setLoading(false);
    }
  };

  const executeCustomQuery = async () => {
    if (!customQuery.trim()) return;

    try {
      setLoading(true);

      // In a real implementation, this would execute the query safely
      console.log("Executing custom query:", customQuery);

      // For safety, we'll just log the query instead of executing it
      alert("Query execution is disabled for security reasons");
    } catch (error) {
      console.error("Error executing custom query:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4" />;
    if (score >= 70) return <AlertTriangle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Database Settings</span>
          </DialogTitle>
          <DialogDescription>
            Monitor database performance and configure database settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Performance Metrics</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchDatabaseMetrics}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  <span className="ml-2">Refresh</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Activity className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Active Connections</p>
                    <p className="text-2xl font-bold">
                      {metrics.connectionCount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Cpu className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Active Queries</p>
                    <p className="text-2xl font-bold">
                      {metrics.activeQueries}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Database className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Cache Hit Ratio</p>
                    <p className="text-2xl font-bold">
                      {metrics.cacheHitRatio}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <HardDrive className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Database Size</p>
                    <p className="text-2xl font-bold">{metrics.databaseSize}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Score */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getPerformanceIcon(metrics.performanceScore)}
                  <div>
                    <p className="text-sm font-medium">Performance Score</p>
                    <p
                      className={`text-3xl font-bold ${getPerformanceColor(
                        metrics.performanceScore
                      )}`}
                    >
                      {metrics.performanceScore}/100
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <p className="font-medium">{metrics.uptime}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Configuration</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-connections">Max Connections</Label>
                  <Input
                    id="max-connections"
                    type="number"
                    value={config.maxConnections}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        maxConnections: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="query-timeout">Query Timeout (seconds)</Label>
                  <Input
                    id="query-timeout"
                    type="number"
                    value={config.queryTimeout}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        queryTimeout: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                {showAdvanced && (
                  <>
                    <div>
                      <Label htmlFor="cache-size">Cache Size (MB)</Label>
                      <Input
                        id="cache-size"
                        type="number"
                        value={config.cacheSize}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            cacheSize: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="backup-frequency">Backup Frequency</Label>
                      <Select
                        value={config.backupFrequency}
                        onValueChange={(value) =>
                          setConfig({ ...config, backupFrequency: value })
                        }
                      >
                        <SelectTrigger id="backup-frequency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="log-level">Log Level</Label>
                      <Select
                        value={config.logLevel}
                        onValueChange={(value) =>
                          setConfig({ ...config, logLevel: value })
                        }
                      >
                        <SelectTrigger id="log-level">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="debug">Debug</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warn">Warning</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Custom Query Tool */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Query Tool</CardTitle>
              <CardDescription>
                Execute custom database queries (read-only for security)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="custom-query">SQL Query</Label>
                  <Textarea
                    id="custom-query"
                    placeholder="SELECT * FROM users LIMIT 10;"
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button
                  onClick={executeCustomQuery}
                  disabled={loading || !customQuery.trim()}
                >
                  {loading ? "Executing..." : "Execute Query"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Backup Information */}
          <Card>
            <CardHeader>
              <CardTitle>Backup Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Last Backup</p>
                  <p className="text-sm text-muted-foreground">
                    {metrics.lastBackup}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={saveDatabaseConfig} disabled={loading}>
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DatabaseSettingsModal;
