
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SystemHealthCard = () => {
  const systemHealth = [
    { metric: 'API Response Time', value: '245ms', status: 'good', target: '<300ms' },
    { metric: 'Database Performance', value: '98.2%', status: 'excellent', target: '>95%' },
    { metric: 'Error Rate', value: '0.12%', status: 'good', target: '<0.5%' },
    { metric: 'User Satisfaction', value: '4.7/5', status: 'excellent', target: '>4.0' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health Monitoring</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemHealth.map((health) => (
            <div key={health.metric} className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">{health.metric}</h4>
              <div className="text-2xl font-bold mb-1">
                <span className={
                  health.status === 'excellent' ? 'text-green-600' : 
                  health.status === 'good' ? 'text-blue-600' : 'text-red-600'
                }>
                  {health.value}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Target: {health.target}</p>
              <Badge 
                variant={
                  health.status === 'excellent' ? 'default' : 
                  health.status === 'good' ? 'secondary' : 'destructive'
                }
              >
                {health.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealthCard;
