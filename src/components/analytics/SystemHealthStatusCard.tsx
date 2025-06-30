
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Server, Database, Wifi, Shield, Clock } from 'lucide-react';

const SystemHealthStatusCard = () => {
  // Mock system health data
  const healthMetrics = [
    {
      name: 'Server Status',
      status: 'healthy',
      value: 'Online',
      icon: Server,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Database',
      status: 'healthy',
      value: 'Connected',
      icon: Database,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Network',
      status: 'healthy',
      value: '< 50ms',
      icon: Wifi,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Security',
      status: 'healthy',
      value: 'Secure',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Uptime',
      status: 'healthy',
      value: '99.9%',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  const overallStatus = healthMetrics.every(metric => metric.status === 'healthy') ? 'healthy' : 'warning';

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className={`h-5 w-5 ${overallStatus === 'healthy' ? 'text-green-600' : 'text-yellow-600'}`} />
          System Health Status
          <Badge variant={overallStatus === 'healthy' ? 'default' : 'secondary'} className="ml-auto">
            {overallStatus === 'healthy' ? 'All Systems Operational' : 'Some Issues Detected'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {healthMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.name}
                className={`${metric.bgColor} p-4 rounded-lg text-center transition-all duration-200 hover:shadow-md`}
              >
                <Icon className={`h-6 w-6 mx-auto mb-2 ${metric.color}`} />
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {metric.name}
                </div>
                <div className={`text-xs font-semibold ${metric.color}`}>
                  {metric.value}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">System Performance</h4>
              <p className="text-sm text-blue-700">All systems running optimally</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">98.7%</div>
              <div className="text-xs text-blue-500">Performance Score</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealthStatusCard;
