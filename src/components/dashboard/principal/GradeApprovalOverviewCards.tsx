
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle, Eye } from 'lucide-react';

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
  const cards = [
    {
      title: "Pending Approval",
      count: pendingCount,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    },
    {
      title: "Approved",
      count: approvedCount,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Released",
      count: releasedCount,
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Rejected",
      count: rejectedCount,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <Card key={index} className={`${card.bgColor} ${card.borderColor} border`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.count}</p>
              </div>
              <card.icon className={`h-8 w-8 ${card.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
