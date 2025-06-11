
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const SystemHealthMonitor = () => {
  const systemHealth = [
    { service: 'Database', status: 'healthy', uptime: 99.9, responseTime: '2ms' },
    { service: 'API Gateway', status: 'healthy', uptime: 99.8, responseTime: '15ms' },
    { service: 'File Storage', status: 'warning', uptime: 98.5, responseTime: '45ms' },
    { service: 'Email Service', status: 'healthy', uptime: 99.7, responseTime: '120ms' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>⚡</span>
          <span>System Health Monitor</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {systemHealth.map((service) => (
            <div key={service.service} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{service.service}</p>
                <p className="text-sm text-muted-foreground">Response: {service.responseTime}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <Progress value={service.uptime} className="w-20 h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{service.uptime}% uptime</p>
                </div>
                <Badge variant={service.status === 'healthy' ? 'default' : service.status === 'warning' ? 'secondary' : 'destructive'}>
                  {service.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealthMonitor;
