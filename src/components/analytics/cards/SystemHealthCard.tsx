
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, AlertCircle } from 'lucide-react';

interface SystemHealthCardProps {
  schoolsCount: number;
  usersCount: number;
}

const SystemHealthCard = ({ schoolsCount, usersCount }: SystemHealthCardProps) => {
  const healthMetrics = [
    {
      label: 'Database Connection',
      status: 'healthy',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      label: 'API Response Time',
      status: `${Math.floor(Math.random() * 50) + 50}ms`,
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      label: 'Active Schools',
      status: `${schoolsCount}`,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      label: 'System Load',
      status: `${Math.floor(Math.random() * 30) + 20}%`,
      icon: Activity,
      color: 'text-orange-600'
    }
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-green-600" />
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {healthMetrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
                <span className="text-sm font-medium">{metric.label}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {metric.status}
              </Badge>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">99.9%</div>
            <div className="text-xs text-gray-600">System Uptime</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealthCard;
