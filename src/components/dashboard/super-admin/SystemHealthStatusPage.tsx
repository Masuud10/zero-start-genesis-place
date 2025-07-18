import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { SystemHealthService } from "@/services/mockAdvancedFeaturesService";
import { SystemHealthStatus } from "@/types/advanced-features";
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Database,
  Shield,
  Globe,
  Server,
  Wifi,
  Clock,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const SystemHealthStatusPage: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealthStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case "database":
        return <Database className="h-5 w-5" />;
      case "auth_api":
        return <Shield className="h-5 w-5" />;
      case "file_storage":
        return <Server className="h-5 w-5" />;
      case "web_server":
        return <Globe className="h-5 w-5" />;
      case "network":
        return <Wifi className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "down":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "healthy":
        return "default" as const;
      case "degraded":
        return "secondary" as const;
      case "down":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.9) return "text-green-600";
    if (uptime >= 99.0) return "text-yellow-600";
    return "text-red-600";
  };

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime < 100) return "text-green-600";
    if (responseTime < 500) return "text-yellow-600";
    return "text-red-600";
  };

  const fetchSystemHealth = async () => {
    try {
      setLoading(true);
      const response = await SystemHealthService.getSystemHealthStatus();

      if (response.success) {
        setSystemHealth(response.data);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to fetch system health",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching system health:", error);
      toast({
        title: "Error",
        description: "Failed to fetch system health",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshHealth = async () => {
    setRefreshing(true);
    await fetchSystemHealth();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "System health status updated",
    });
  };

  useEffect(() => {
    fetchSystemHealth();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const overallHealth =
    systemHealth.length > 0
      ? systemHealth.every((service) => service.current_status === "healthy")
        ? "healthy"
        : systemHealth.some((service) => service.current_status === "down")
        ? "down"
        : "degraded"
      : "unknown";

  const averageUptime =
    systemHealth.length > 0
      ? systemHealth.reduce(
          (sum, service) => sum + service.uptime_percentage,
          0
        ) / systemHealth.length
      : 0;

  const averageResponseTime =
    systemHealth.length > 0
      ? systemHealth.reduce(
          (sum, service) => sum + service.average_response_time,
          0
        ) / systemHealth.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            System Health Status
          </h1>
          <p className="text-muted-foreground">
            Real-time operational status of core services
          </p>
        </div>
        <Button
          onClick={refreshHealth}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Overall Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Status
            </CardTitle>
            {getStatusIcon(overallHealth)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge
                variant={getStatusBadgeVariant(overallHealth)}
                className="text-lg"
              >
                {overallHealth.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {systemHealth.length} services monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Uptime
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getUptimeColor(averageUptime)}`}
            >
              {averageUptime.toFixed(2)}%
            </div>
            <Progress value={averageUptime} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Response Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getResponseTimeColor(
                averageResponseTime
              )}`}
            >
              {averageResponseTime.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground">Across all services</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Health Details */}
      <Card>
        <CardHeader>
          <CardTitle>Service Health Details</CardTitle>
          <CardDescription>
            Individual service status and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">
                  Loading system health...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {systemHealth.map((service) => (
                <div
                  key={service.service_name}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getServiceIcon(service.service_name)}
                      <div>
                        <h3 className="font-medium">
                          {service.service_name
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Last checked:{" "}
                          {new Date(service.last_check).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(service.current_status)}
                        <Badge
                          variant={getStatusBadgeVariant(
                            service.current_status
                          )}
                        >
                          {service.current_status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-center">
                      <div
                        className={`text-sm font-medium ${getUptimeColor(
                          service.uptime_percentage
                        )}`}
                      >
                        {service.uptime_percentage.toFixed(2)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Uptime
                      </div>
                    </div>

                    <div className="text-center">
                      <div
                        className={`text-sm font-medium ${getResponseTimeColor(
                          service.average_response_time
                        )}`}
                      >
                        {service.average_response_time.toFixed(0)}ms
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Avg Response
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {systemHealth.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No system health data available
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health History Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Health History</CardTitle>
          <CardDescription>
            System health trends over the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Health history chart coming soon</p>
              <p className="text-sm text-gray-400">
                Will show uptime trends and performance metrics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthStatusPage;
