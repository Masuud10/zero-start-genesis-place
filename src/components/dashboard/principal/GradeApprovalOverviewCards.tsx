
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle, Send, XCircle } from 'lucide-react';

interface GradeApprovalOverviewCardsProps {
  pendingCount: number;
  approvedCount: number;
  releasedCount: number;
  rejectedCount: number;
}

export const GradeApprovalOverviewCards: React.FC<GradeApprovalOverviewCardsProps> = ({
  pendingCount,
  approvedCount,
  releasedCount,
  rejectedCount
}) => {
  const stats = [
    {
      title: 'Pending Approval',
      value: pendingCount,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Approved',
      value: approvedCount,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Released',
      value: releasedCount,
      icon: Send,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Rejected',
      value: rejectedCount,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
