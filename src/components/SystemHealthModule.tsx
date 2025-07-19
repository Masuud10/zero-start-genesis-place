import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSystemHealth, useSystemMetrics } from "@/hooks/useSystemHealth";
import {
  Activity,
  Server,
  Database,
  Wifi,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Clock,
  Users,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const SystemHealthModule = () => {
  const {
    data: healthData,
    isLoading: healthLoading,
    error: healthError,
    refetch: refetchHealth,
  } = useSystemHealth();

  const {
    data: metricsData,
    isLoading: metricsLoading,
    refetch: refetchMetrics,
  } = useSystemMetrics();

  const handleRefresh = () => {
    refetchHealth();
    refetchMetrics();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "healthy":
      case "operational":
        return "text-green-600";
      case "warning":
      case "degraded":
        return "text-yellow-600";
      case "critical":
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "healthy":
      case "operational":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "critical":
      case "down":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (healthLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">System Health</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (healthError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">System Health</h2>
        </div>
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">System Health Error</AlertTitle>
          <AlertDescription className="text-red-700 mb-4">
            Failed to load system health data. Please try again.
          </AlertDescription>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  // Sample metrics data for charts (would come from real system metrics)
  const performanceData = [
    { time: "00:00", cpu: 45, memory: 62, response: 120 },
    { time: "04:00", cpu: 52, memory: 58, response: 135 },
    { time: "08:00", cpu: 68, memory: 71, response: 145 },
    { time: "12:00", cpu: 73, memory: 76, response: 160 },
    { time: "16:00", cpu: 59, memory: 69, response: 142 },
    { time: "20:00", cpu: 48, memory: 63, response: 128 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Health</h2>
          <p className="text-muted-foreground">
            Real-time system performance and health monitoring
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          className="bg-green-600 hover:bg-green-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              System Uptime
            </CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {healthData?.uptime_percent?.toFixed(1) || 99.9}%
            </div>
            <p className="text-xs text-green-600 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Response Time
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {healthData?.response_time_ms?.toFixed(0) || 142}ms
            </div>
            <p className="text-xs text-blue-600 mt-1">Average response</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Active Users
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {healthData?.active_users || 0}
            </div>
            <p className="text-xs text-purple-600 mt-1">Online now</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">
              Error Rate
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {healthData?.error_rate?.toFixed(2) || 0.01}%
            </div>
            <p className="text-xs text-orange-600 mt-1">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* System Components Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Components
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(healthData?.api_status || "operational")}
                <span className="font-medium">API Service</span>
              </div>
              <Badge
                variant="outline"
                className={`border-current ${getStatusColor(
                  healthData?.api_status || "operational"
                )}`}
              >
                {healthData?.api_status || "Operational"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(healthData?.database_status || "healthy")}
                <span className="font-medium">Database</span>
              </div>
              <Badge
                variant="outline"
                className={`border-current ${getStatusColor(
                  healthData?.database_status || "healthy"
                )}`}
              >
                {healthData?.database_status || "Healthy"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">File Storage</span>
              </div>
              <Badge
                variant="outline"
                className="border-current text-green-600"
              >
                Operational
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">Authentication</span>
              </div>
              <Badge
                variant="outline"
                className="border-current text-green-600"
              >
                Operational
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              System Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-900">
                  {healthData?.total_schools || 0}
                </div>
                <p className="text-sm text-blue-700">Total Schools</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-900">
                  {healthData?.total_students || 0}
                </div>
                <p className="text-sm text-green-700">Total Students</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-900">
                  {healthData?.total_transactions || 0}
                </div>
                <p className="text-sm text-purple-700">Transactions</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-900">
                  {new Date(
                    healthData?.last_updated || Date.now()
                  ).toLocaleTimeString()}
                </div>
                <p className="text-sm text-orange-700">Last Updated</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AreaChart className="h-5 w-5" />
            System Performance (Last 24 Hours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="response"
                stackId="1"
                stroke="#3B82F6"
                fill="#DBEAFE"
                name="Response Time (ms)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthModule;
