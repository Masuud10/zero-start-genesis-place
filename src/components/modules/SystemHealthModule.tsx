
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Server, Database, Wifi, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';

interface SystemMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_type: string;
  recorded_at: string;
  metadata?: any;
}

const SystemHealthModule = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSystemMetrics();
    const interval = setInterval(fetchSystemMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('system_metrics')
        .select('*')
        .order('recorded_at', { ascending: false });

      if (error) throw error;

      setMetrics(data || []);
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLatestMetric = (metricName: string) => {
    return metrics.find(m => m.metric_name === metricName);
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

  const uptime = getLatestMetric('System Uptime');
  const responseTime = getLatestMetric('Average Response Time');
  const errorRate = getLatestMetric('Error Rate');
  const userCount = getLatestMetric('Total Active Users');

  const alerts = [
    {
      type: 'info',
      title: 'System Update Scheduled',
      description: 'Maintenance window scheduled for Saturday 2:00 AM - 4:00 AM UTC',
      time: '2 hours ago'
    },
    {
      type: 'warning',
      title: 'High Memory Usage',
      description: 'Database server memory usage at 85%. Consider scaling.',
      time: '15 minutes ago'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Health</h2>
          <p className="text-muted-foreground">Monitor system performance and infrastructure health</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          All Systems Operational
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthStatus(uptime?.metric_value || 0, 'uptime').color}`}>
              {uptime?.metric_value.toFixed(2)}%
            </div>
            <Progress value={uptime?.metric_value || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthStatus(responseTime?.metric_value || 0, 'response_time').color}`}>
              {responseTime?.metric_value}ms
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
            <div className={`text-2xl font-bold ${getHealthStatus(errorRate?.metric_value || 0, 'error_rate').color}`}>
              {errorRate?.metric_value}%
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
              {userCount?.metric_value.toLocaleString()}
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
              <Badge variant="default">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4" />
                <span>API Servers</span>
              </div>
              <Badge variant="default">Healthy</Badge>
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
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert, index) => (
              <Alert key={index}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription className="mt-2">
                  {alert.description}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Clock className="w-3 h-3" />
                    {alert.time}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            Detailed system performance indicators
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
                <span className="text-sm font-medium">Disk I/O</span>
                <span className="text-sm text-muted-foreground">32%</span>
              </div>
              <Progress value={32} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Network Throughput</span>
                <span className="text-sm text-muted-foreground">78%</span>
              </div>
              <Progress value={78} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthModule;
