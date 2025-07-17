import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Code, 
  GitBranch, 
  Server, 
  Bug, 
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const SoftwareEngineerDashboard = () => {
  // Mock data for demonstration
  const systemMetrics = {
    uptime: '99.9%',
    responseTime: '127ms',
    activeUsers: '2,847',
    deployments: 23
  };

  const recentDeployments = [
    { id: 1, service: 'API Gateway', status: 'success', time: '2 hours ago' },
    { id: 2, service: 'User Service', status: 'success', time: '5 hours ago' },
    { id: 3, service: 'Payment Service', status: 'pending', time: '1 day ago' },
  ];

  const criticalIssues = [
    { id: 1, title: 'Memory leak in user service', severity: 'high', time: '30 min ago' },
    { id: 2, title: 'Database connection timeout', severity: 'medium', time: '2 hours ago' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Engineering Dashboard</h1>
          <p className="text-muted-foreground">Monitor system health and development progress</p>
        </div>
        <Button className="gap-2">
          <Code className="h-4 w-4" />
          Deploy Latest
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemMetrics.uptime}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{systemMetrics.responseTime}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Server className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{systemMetrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployments</CardTitle>
            <GitBranch className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{systemMetrics.deployments}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deployments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Recent Deployments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentDeployments.map((deployment) => (
              <div key={deployment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {deployment.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                  <div>
                    <p className="font-medium">{deployment.service}</p>
                    <p className="text-sm text-muted-foreground">{deployment.time}</p>
                  </div>
                </div>
                <Badge variant={deployment.status === 'success' ? 'default' : 'secondary'}>
                  {deployment.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Critical Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Critical Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {criticalIssues.map((issue) => (
              <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`h-4 w-4 ${issue.severity === 'high' ? 'text-red-600' : 'text-yellow-600'}`} />
                  <div>
                    <p className="font-medium">{issue.title}</p>
                    <p className="text-sm text-muted-foreground">{issue.time}</p>
                  </div>
                </div>
                <Badge variant={issue.severity === 'high' ? 'destructive' : 'secondary'}>
                  {issue.severity}
                </Badge>
              </div>
            ))}
            {criticalIssues.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                No critical issues found
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Code className="h-6 w-6" />
              <span>Code Review</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <GitBranch className="h-6 w-6" />
              <span>Deploy Staging</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Server className="h-6 w-6" />
              <span>System Logs</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Bug className="h-6 w-6" />
              <span>Bug Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SoftwareEngineerDashboard;