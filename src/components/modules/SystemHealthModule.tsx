
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useSystemHealth, useSystemMetrics } from '@/hooks/useSystemHealth';
import { Activity, Server, Database, Wifi, AlertTriangle, CheckCircle, Clock, Zap, RefreshCw, Loader2 } from 'lucide-react';

const SystemHealthModule = () => {
  const { 
    data: healthData, 
    isLoading: healthLoading, 
    error: healthError,
    refetch: refetchHealth 
  } = useSystemHealth();

  const { 
    data: metrics, 
    isLoading: metricsLoading, 
    error: metricsError,
    refetch: refetchMetrics 
  } = useSystemMetrics();

  const handleRefresh = () => {
    refetchHealth();
    refetchMetrics();
  };

  const getHealthStatus = (value: number, type: string) => {
    switch (type) {
      case 'uptime':
        if (value >= 99.5) return { status: 'excellent', color: 'text-green-600' };
        if (value >= 99.0) return { status: 'good', color: 'text-yellow-600' };
        return { status: 'poor', color: 'text-red-600' };
      case 'response_time':
        if (value <= 200) return { status: 'excellent', color: 'text-green-600' };
        if (value <= 500) return { status: 'good', color: 'text-yellow-600' };
        return { status: 'poor', color: 'text-red-600' };
      case 'error_rate':
        if (value <= 0.1) return { status: 'excellent', color: 'text-green-600' };
        if (value <= 1.0) return { status: 'good', color: 'text-yellow-600' };
        return { status: 'poor', color: 'text-red-600' };
      default:
        return { status: 'unknown', color: 'text-gray-600' };
    }
  };

  if (healthError || metricsError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">System Health</h2>
            <p className="text-muted-foreground">Monitor system performance and infrastructure health</p>
          </div>
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

  if (healthLoading || metricsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">System Health</h2>
            <p className="text-muted-foreground">Monitor system performance and infrastructure health</p>
          </div>
        </div>

        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-4" />
          <p className="text-gray-600">Loading system health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Health</h2>
          <p className="text-muted-foreground">Monitor system performance and infrastructure health</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            {healthData?.api_status === 'operational' ? 'All Systems Operational' : 'System Issues Detected'}
          </Badge>
          <Button onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthStatus(healthData?.uptime_percent || 0, 'uptime').color}`}>
              {healthData?.uptime_percent?.toFixed(2)}%
            </div>
            <Progress value={healthData?.uptime_percent || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthStatus(healthData?.response_time_ms || 0, 'response_time').color}`}>
              {Math.round(healthData?.response_time_ms || 0)}ms
            </div>
            <p className="text-xs text-muted-foreground">Average API response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthStatus(healthData?.error_rate || 0, 'error_rate').color}`}>
              {healthData?.error_rate?.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {healthData?.active_users?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>
      </div>

      {/* Infrastructure Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Infrastructure Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>Database</span>
              </div>
              <Badge variant={healthData?.database_status === 'healthy' ? 'default' : 'destructive'}>
                {healthData?.database_status || 'Unknown'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4" />
                <span>API Servers</span>
              </div>
              <Badge variant={healthData?.api_status === 'operational' ? 'default' : 'destructive'}>
                {healthData?.api_status || 'Unknown'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                <span>CDN</span>
              </div>
              <Badge variant="default">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Load Balancer</span>
              </div>
              <Badge variant="secondary">Monitoring</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Health Check</span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {healthData?.last_updated ? new Date(healthData.last_updated).toLocaleString() : 'Never'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">System Metrics</span>
              <span className="text-sm text-muted-foreground">
                {metrics?.length || 0} recorded
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Monitoring Status</span>
              <Badge variant="default">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>
            Real-time system performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-muted-foreground">45%</span>
              </div>
              <Progress value={45} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-muted-foreground">68%</span>
              </div>
              <Progress value={68} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Database Connections</span>
                <span className="text-sm text-muted-foreground">32%</span>
              </div>
              <Progress value={32} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">API Response Time</span>
                <span className="text-sm text-muted-foreground">{Math.round(healthData?.response_time_ms || 0)}ms</span>
              </div>
              <Progress value={Math.min((healthData?.response_time_ms || 0) / 500 * 100, 100)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthModule;
