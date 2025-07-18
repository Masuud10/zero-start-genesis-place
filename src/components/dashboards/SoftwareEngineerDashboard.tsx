import React from "react";
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
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import UnifiedDashboardLayout from "@/components/dashboard/UnifiedDashboardLayout";
import {
  Code,
  Database,
  Server,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Settings,
  FileText,
  BarChart3,
  Cpu,
  HardDrive,
  Network,
  Bug,
  Shield,
  ActivitySquare,
  Gauge,
  Terminal,
  GitBranch,
  Cloud,
  Monitor,
} from "lucide-react";

// Import new Software Engineer features
import DatabaseQueryInspectorPage from "@/components/dashboard/software-engineer/DatabaseQueryInspectorPage";

const SoftwareEngineerDashboard: React.FC = () => {
  const { adminUser } = useAdminAuthContext();

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
    // Implement quick actions here
  };

  const stats = [
    {
      label: "System Uptime",
      value: "99.9%",
      icon: Server,
      description: "Last 30 days",
      color: "text-green-600",
    },
    {
      label: "Active Deployments",
      value: "3",
      icon: Code,
      description: "Running deployments",
      color: "text-blue-600",
    },
    {
      label: "API Response Time",
      value: "245ms",
      icon: Zap,
      description: "Average response",
      color: "text-purple-600",
    },
    {
      label: "Error Rate",
      value: "0.02%",
      icon: AlertTriangle,
      description: "Last 24 hours",
      color: "text-orange-600",
    },
  ];

  const quickActions = [
    {
      label: "Deploy Code",
      icon: Code,
      onClick: () => handleQuickAction("deploy_code"),
      variant: "default" as const,
    },
    {
      label: "View Logs",
      icon: FileText,
      onClick: () => handleQuickAction("view_logs"),
      variant: "outline" as const,
    },
    {
      label: "Monitor System",
      icon: Activity,
      onClick: () => handleQuickAction("monitor_system"),
      variant: "outline" as const,
    },
    {
      label: "Debug Issues",
      icon: Bug,
      onClick: () => handleQuickAction("debug_issues"),
      variant: "outline" as const,
    },
  ];

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: Activity,
      content: (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Status
                </CardTitle>
                <CardDescription>
                  Current system health and performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Database</p>
                        <p className="text-sm text-gray-600">
                          All systems operational
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Healthy
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">API Services</p>
                        <p className="text-sm text-gray-600">
                          Response time: 245ms
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Optimal
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium">File Storage</p>
                        <p className="text-sm text-gray-600">
                          High usage detected
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-yellow-600">
                      Warning
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className="text-sm text-gray-600">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm text-gray-600">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Disk Usage</span>
                      <span className="text-sm text-gray-600">72%</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Network</span>
                      <span className="text-sm text-gray-600">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Recent Deployments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <div>
                      <p className="font-medium text-sm">v2.1.4</p>
                      <p className="text-xs text-gray-600">2 hours ago</p>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Success
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <div>
                      <p className="font-medium text-sm">v2.1.3</p>
                      <p className="text-xs text-gray-600">1 day ago</p>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Success
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Recent Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <div>
                      <p className="font-medium text-sm">API Timeout</p>
                      <p className="text-xs text-gray-600">30 min ago</p>
                    </div>
                    <Badge variant="outline" className="text-red-600">
                      Critical
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                    <div>
                      <p className="font-medium text-sm">High Memory</p>
                      <p className="text-xs text-gray-600">2 hours ago</p>
                    </div>
                    <Badge variant="outline" className="text-yellow-600">
                      Warning
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <div>
                      <p className="font-medium text-sm">Backup Complete</p>
                      <p className="text-xs text-gray-600">1 hour ago</p>
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <div>
                      <p className="font-medium text-sm">Security Scan</p>
                      <p className="text-xs text-gray-600">3 hours ago</p>
                    </div>
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "monitoring",
      label: "Monitoring",
      icon: Monitor,
      content: (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Real-time Metrics
                </CardTitle>
                <CardDescription>Live system performance data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Requests/min</span>
                    <span className="font-medium">1,247</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Users</span>
                    <span className="font-medium">89</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error Rate</span>
                    <span className="font-medium text-green-600">0.02%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
                <CardDescription>System performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Time</span>
                    <span className="font-medium text-green-600">↓ 12%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Throughput</span>
                    <span className="font-medium text-green-600">↑ 8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uptime</span>
                    <span className="font-medium text-green-600">99.9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "database",
      label: "Database Inspector",
      icon: Database,
      content: <DatabaseQueryInspectorPage />,
    },
    {
      id: "api-monitor",
      label: "API Monitor",
      icon: Gauge,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                API Rate Limit Monitor
              </CardTitle>
              <CardDescription>
                Monitor API usage and rate limits across endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">
                        Authentication API
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Usage</span>
                          <span className="text-xs font-medium">
                            1,245 / 2,000
                          </span>
                        </div>
                        <Progress value={62.25} className="h-2" />
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Avg Response</span>
                          <span className="font-medium">156ms</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Data API</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Usage</span>
                          <span className="text-xs font-medium">
                            892 / 1,500
                          </span>
                        </div>
                        <Progress value={59.47} className="h-2" />
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Avg Response</span>
                          <span className="font-medium">203ms</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">File API</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Usage</span>
                          <span className="text-xs font-medium">567 / 800</span>
                        </div>
                        <Progress value={70.88} className="h-2" />
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Avg Response</span>
                          <span className="font-medium">89ms</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Analytics API</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Usage</span>
                          <span className="text-xs font-medium">234 / 500</span>
                        </div>
                        <Progress value={46.8} className="h-2" />
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Avg Response</span>
                          <span className="font-medium">312ms</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "deployment",
      label: "Deployment",
      icon: GitBranch,
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Deployment Pipeline
              </CardTitle>
              <CardDescription>
                Manage code deployments and releases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Code className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Production Deployment</p>
                      <p className="text-sm text-gray-600">
                        v2.1.4 • 2 hours ago
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    Success
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Cloud className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Staging Deployment</p>
                      <p className="text-sm text-gray-600">
                        v2.1.5 • In progress
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-yellow-600">
                    Running
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Terminal className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Development Build</p>
                      <p className="text-sm text-gray-600">v2.1.6 • Queued</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-gray-600">
                    Pending
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <UnifiedDashboardLayout
      role="software_engineer"
      title="Software Engineer Dashboard"
      description="Monitor system performance, manage deployments, and debug technical issues"
      stats={stats}
      quickActions={quickActions}
      tabs={tabs}
    />
  );
};

export default SoftwareEngineerDashboard;
