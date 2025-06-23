
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, AlertCircle } from 'lucide-react';

interface FinanceKeyMetricsProps {
  keyMetrics: {
    totalRevenue: number;
    totalCollected: number;
    outstandingAmount: number;
    collectionRate: number;
    totalStudents: number;
    defaultersCount: number;
  };
}

const FinanceKeyMetrics: React.FC<FinanceKeyMetricsProps> = ({ keyMetrics }) => {
  const metrics = [
    {
      title: 'Total Revenue',
      value: `KES ${keyMetrics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Amount Collected',
      value: `KES ${keyMetrics.totalCollected.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Outstanding Amount',
      value: `KES ${keyMetrics.outstandingAmount.toLocaleString()}`,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Collection Rate',
      value: `${keyMetrics.collectionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Students',
      value: keyMetrics.totalStudents.toLocaleString(),
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Defaulters',
      value: keyMetrics.defaultersCount.toLocaleString(),
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${metric.bgColor}`}>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metric.color}`}>
              {metric.value}
            </div>
            {metric.title === 'Collection Rate' && (
              <p className="text-xs text-gray-500 mt-1">
                of total fees expected
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FinanceKeyMetrics;
