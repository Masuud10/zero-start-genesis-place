import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminAuthContext } from "@/components/auth/AdminAuthProvider";
import { Badge } from "@/components/ui/badge";
import { Code, Database, Activity, Server, Bug, GitBranch } from "lucide-react";

const SoftwareEngineerDashboard: React.FC = () => {
  const { adminUser } = useAdminAuthContext();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {adminUser?.name}. Here's your technical overview.
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Code className="h-4 w-4" />
          Software Engineer
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <p className="text-xs text-muted-foreground">Uptime this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">All connections healthy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4K</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0.02%</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Development Tools
            </CardTitle>
            <CardDescription>
              Access to development and deployment tools
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-8">
              <p className="text-muted-foreground mb-4">
                Development tools and deployment management coming soon.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Available Tools:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Database Management</li>
                  <li>• API Usage Analytics</li>
                  <li>• System Logs</li>
                  <li>• Performance Monitoring</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Monitoring
            </CardTitle>
            <CardDescription>
              Real-time system performance and health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <p className="text-muted-foreground mb-4">
                Advanced monitoring dashboard coming soon.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Monitoring Features:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Real-time Metrics</li>
                  <li>• Error Tracking</li>
                  <li>• Performance Analysis</li>
                  <li>• Alert Management</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SoftwareEngineerDashboard;