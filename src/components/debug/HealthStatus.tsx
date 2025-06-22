
import React from 'react';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Activity } from 'lucide-react';

const HealthStatus = () => {
  const { data: healthData, isLoading, error } = useHealthCheck();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Activity className="h-4 w-4 animate-spin mr-2" />
          Running health checks...
        </CardContent>
      </Card>
    );
  }

  if (error || !healthData) {
    return (
      <Card className="border-red-200">
        <CardContent className="flex items-center justify-center p-6 text-red-600">
          <XCircle className="h-4 w-4 mr-2" />
          Health check failed
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Health
        </CardTitle>
        <CardDescription>
          Real-time system status and health monitoring
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(healthData).map(([component, check]: [string, any]) => (
            <div key={component} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(check.status)}
                <div>
                  <div className="font-medium capitalize">{component}</div>
                  <div className="text-xs text-gray-600">{check.message}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getStatusVariant(check.status)}>
                  {check.status}
                </Badge>
                <div className="text-xs text-gray-500">
                  {check.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthStatus;
