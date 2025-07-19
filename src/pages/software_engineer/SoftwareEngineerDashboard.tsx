import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Code,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Server,
  Cpu,
  HardDrive,
  Network,
  GitBranch,
  Play,
  RotateCcw,
  TrendingUp,
  BarChart3,
  FileText,
  Settings,
  Terminal,
} from "lucide-react";
import { useDashboard } from "@/contexts/DashboardContext";
import { useUIEnhancement } from "@/contexts/UIEnhancementContext";
import {
  EnhancedCard,
  StatCard,
  MetricCard,
  ProgressCard,
} from "@/components/ui/EnhancedCard";
import { LineChart, BarChart, PieChart } from "@/components/ui/BeautifulCharts";

const SoftwareEngineerDashboard = () => {
  const {
    systemHealth,
    loadingSystemHealth,
    errorSystemHealth,
    refreshSystemHealth,
  } = useDashboard();
  const { getRoleColors, getLoadingAnimation } = useUIEnhancement();
  const [activeTab, setActiveTab] = useState("system-health");

  const roleColors = getRoleColors("software_engineer");

  if (loadingSystemHealth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {getLoadingAnimation()}
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (errorSystemHealth) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading dashboard: {errorSystemHealth}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate system statistics
  const systemStats = {
    overallStatus: systemHealth?.status || "healthy",
    cpuUsage:
      systemHealth?.metrics?.find((m) => m.metric_type === "cpu")
        ?.metric_value || "0",
    memoryUsage:
      systemHealth?.metrics?.find((m) => m.metric_type === "memory")
        ?.metric_value || "0",
    diskUsage:
      systemHealth?.metrics?.find((m) => m.metric_type === "disk")
        ?.metric_value || "0",
    errorCount: systemHealth?.errors?.length || 0,
    slowQueries: systemHealth?.slowQueries?.length || 0,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "critical":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Code className="h-6 w-6 text-purple-600" />
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    Software Engineer Dashboard
                  </h1>
                  <p className="text-muted-foreground">
                    System Health & Technical Operations
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Activity className="h-3 w-3" />
                <span>System {systemStats.overallStatus}</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="System Status"
            value={systemStats.overallStatus}
            subtitle="Overall health"
            icon={getStatusIcon(systemStats.overallStatus)}
            role="software_engineer"
            variant="gradient"
          />
          <StatCard
            title="CPU Usage"
            value={`${parseFloat(systemStats.cpuUsage)}%`}
            subtitle="Current load"
            icon={<Cpu className="h-5 w-5" />}
            role="software_engineer"
            variant="gradient"
          />
          <StatCard
            title="Memory Usage"
            value={`${parseFloat(systemStats.memoryUsage)}%`}
            subtitle="RAM utilization"
            icon={<Server className="h-5 w-5" />}
            role="software_engineer"
            variant="gradient"
          />
          <StatCard
            title="Error Count"
            value={systemStats.errorCount}
            subtitle="Last 24h"
            icon={<XCircle className="h-5 w-5" />}
            role="software_engineer"
            variant="gradient"
          />
          <StatCard
            title="Slow Queries"
            value={systemStats.slowQueries}
            subtitle="Performance issues"
            icon={<Clock className="h-5 w-5" />}
            role="software_engineer"
            variant="gradient"
          />
        </div>

        {/* Quick Actions */}
        <EnhancedCard variant="glass" animation="fade" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <span className="font-semibold">Quick Actions</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <Play className="h-6 w-6" />
              <span className="text-sm">Deploy</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <RotateCcw className="h-6 w-6" />
              <span className="text-sm">Rollback</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <Terminal className="h-6 w-6" />
              <span className="text-sm">Terminal</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <Settings className="h-6 w-6" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </EnhancedCard>

        {/* Main Dashboard Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 h-12">
            <TabsTrigger
              value="system-health"
              className="flex items-center gap-2 text-sm"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">System Health</span>
            </TabsTrigger>
            <TabsTrigger
              value="database"
              className="flex items-center gap-2 text-sm"
            >
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Database</span>
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="flex items-center gap-2 text-sm"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Logs</span>
            </TabsTrigger>
            <TabsTrigger
              value="deployments"
              className="flex items-center gap-2 text-sm"
            >
              <GitBranch className="h-4 w-4" />
              <span className="hidden sm:inline">Deployments</span>
            </TabsTrigger>
          </TabsList>

          {/* System Health Tab */}
          <TabsContent value="system-health" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnhancedCard variant="elevated" animation="fade" className="p-6">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Real-time Metrics
                </h3>
                <LineChart
                  data={[
                    { label: "00:00", value: 45 },
                    { label: "04:00", value: 52 },
                    { label: "08:00", value: 78 },
                    { label: "12:00", value: 85 },
                    { label: "16:00", value: 92 },
                    { label: "20:00", value: 67 },
                    { label: "24:00", value: 58 },
                  ]}
                  title="CPU Usage (24h)"
                  subtitle="Percentage utilization"
                  height={180}
                />
              </EnhancedCard>

              <EnhancedCard variant="elevated" animation="fade" className="p-6">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Server className="h-5 w-5 mr-2" />
                  System Status Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium text-sm">API Services</h4>
                        <p className="text-xs text-muted-foreground">
                          All endpoints responding
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium text-sm">Database</h4>
                        <p className="text-xs text-muted-foreground">
                          Connection stable
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <h4 className="font-medium text-sm">Memory Usage</h4>
                        <p className="text-xs text-muted-foreground">
                          High utilization
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Warning
                    </Badge>
                  </div>
                </div>
              </EnhancedCard>
            </div>

            {/* Performance Metrics */}
            <EnhancedCard variant="elevated" animation="slide" className="p-6">
              <h3 className="font-semibold mb-2 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Performance Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Response Times</h4>
                  <BarChart
                    data={[
                      { label: "API", value: 120 },
                      { label: "DB", value: 45 },
                      { label: "Cache", value: 8 },
                      { label: "CDN", value: 15 },
                    ]}
                    title="Average Response Time (ms)"
                    height={150}
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Error Rates</h4>
                  <PieChart
                    data={[
                      { label: "Success", value: 98.5, color: "#10b981" },
                      { label: "4xx Errors", value: 1.2, color: "#f59e0b" },
                      { label: "5xx Errors", value: 0.3, color: "#ef4444" },
                    ]}
                    title="Request Success Rate"
                  />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Resource Usage</h4>
                  <div className="space-y-3">
                    <ProgressCard
                      title="CPU"
                      value={parseFloat(systemStats.cpuUsage)}
                      max={100}
                    />
                    <ProgressCard
                      title="Memory"
                      value={parseFloat(systemStats.memoryUsage)}
                      max={100}
                    />
                    <ProgressCard
                      title="Disk"
                      value={parseFloat(systemStats.diskUsage)}
                      max={100}
                    />
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnhancedCard variant="elevated" animation="fade" className="p-6">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Slow Queries
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {systemHealth?.slowQueries
                    ?.slice(0, 5)
                    .map((query, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            Query #{index + 1}
                          </span>
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            {query.execution_time_ms}ms
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono bg-gray-50 p-2 rounded">
                          {query.query_text?.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                  {(!systemHealth?.slowQueries ||
                    systemHealth.slowQueries.length === 0) && (
                    <div className="text-center text-muted-foreground py-8">
                      No slow queries detected
                    </div>
                  )}
                </div>
              </EnhancedCard>

              <EnhancedCard variant="elevated" animation="fade" className="p-6">
                <h3 className="font-semibold mb-2 flex items-center">
                  <HardDrive className="h-5 w-5 mr-2" />
                  Database Inspector
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Terminal className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Enter SQL query..."
                      className="flex-1 px-3 py-2 border rounded-md text-sm font-mono"
                    />
                    <Button size="sm">Execute</Button>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-muted-foreground">
                      Read-only mode. Use this interface to inspect database
                      performance and structure.
                    </p>
                  </div>
                </div>
              </EnhancedCard>
            </div>

            {/* Database Analytics */}
            <EnhancedCard variant="elevated" animation="slide" className="p-6">
              <h3 className="font-semibold mb-2 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Database Analytics
              </h3>
              <BarChart
                data={[
                  { label: "Users", value: 1250 },
                  { label: "Schools", value: 45 },
                  { label: "Students", value: 8500 },
                  { label: "Transactions", value: 12500 },
                  { label: "Logs", value: 25000 },
                ]}
                title="Table Sizes (Records)"
                subtitle="Current database statistics"
                height={180}
              />
            </EnhancedCard>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnhancedCard variant="elevated" animation="fade" className="p-6">
                <h3 className="font-semibold mb-2 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Error Logs
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {systemHealth?.errors?.slice(0, 10).map((log, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {log.error_type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {log.error_message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Severity: {log.severity} • Resolved:{" "}
                        {log.resolved ? "Yes" : "No"}
                      </p>
                    </div>
                  ))}
                  {(!systemHealth?.errors ||
                    systemHealth.errors.length === 0) && (
                    <div className="text-center text-muted-foreground py-8">
                      No error logs found
                    </div>
                  )}
                </div>
              </EnhancedCard>

              <EnhancedCard variant="elevated" animation="fade" className="p-6">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Network className="h-5 w-5 mr-2" />
                  API Logs
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {/* TODO: Integrate real API logs data */}
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        GET /api/schools
                      </span>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        200
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Response time: 45ms
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        POST /api/users
                      </span>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        201
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Response time: 120ms
                    </p>
                  </div>
                </div>
              </EnhancedCard>
            </div>
          </TabsContent>

          {/* Deployments Tab */}
          <TabsContent value="deployments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnhancedCard variant="elevated" animation="fade" className="p-6">
                <h3 className="font-semibold mb-2 flex items-center">
                  <GitBranch className="h-5 w-5 mr-2" />
                  CI/CD Pipeline
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium text-sm">Admin App</h4>
                        <p className="text-xs text-muted-foreground">
                          Build #1234 • 2 minutes ago
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Success
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium text-sm">School App</h4>
                        <p className="text-xs text-muted-foreground">
                          Build #987 • 5 minutes ago
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Success
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div>
                        <h4 className="font-medium text-sm">Backend API</h4>
                        <p className="text-xs text-muted-foreground">
                          Build #567 • In progress
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Running
                    </Badge>
                  </div>
                </div>
              </EnhancedCard>

              <EnhancedCard variant="elevated" animation="fade" className="p-6">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start">
                    <Play className="h-4 w-4 mr-2" />
                    Deploy to Production
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Rollback Last Deployment
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <GitBranch className="h-4 w-4 mr-2" />
                    Create Feature Branch
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Environment Settings
                  </Button>
                </div>
              </EnhancedCard>
            </div>

            {/* Deployment History */}
            <EnhancedCard variant="elevated" animation="slide" className="p-6">
              <h3 className="font-semibold mb-2 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Deployment History
              </h3>
              <LineChart
                data={[
                  { label: "Mon", value: 3 },
                  { label: "Tue", value: 5 },
                  { label: "Wed", value: 2 },
                  { label: "Thu", value: 7 },
                  { label: "Fri", value: 4 },
                  { label: "Sat", value: 1 },
                  { label: "Sun", value: 0 },
                ]}
                title="Weekly Deployments"
                subtitle="Number of deployments per day"
                height={180}
              />
            </EnhancedCard>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default SoftwareEngineerDashboard;
