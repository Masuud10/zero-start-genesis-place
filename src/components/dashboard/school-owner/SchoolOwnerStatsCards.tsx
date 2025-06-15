
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export interface SchoolMetrics {
  totalStudents: number;
  totalTeachers: number;
  totalRevenue: number;
  outstandingFees: number;
  monthlyGrowth: number;
}

interface Props {
  metrics: SchoolMetrics;
  loading: boolean;
}

const metricsCards = [
  {
    key: "totalStudents",
    title: "Total Students",
    description: "Active enrollments",
    color: "text-blue-600",
    change: "+12% from last month"
  },
  {
    key: "totalTeachers",
    title: "Teaching Staff",
    description: "Active teachers",
    color: "text-green-600",
    change: "+2 new hires"
  },
  {
    key: "totalRevenue",
    title: "Revenue (YTD)",
    description: "Year to date",
    color: "text-emerald-600",
    change: "+5.2% growth" // This is placeholder; see main file for logic
  },
  {
    key: "outstandingFees",
    title: "Outstanding Fees",
    description: "Pending payments",
    color: "text-orange-600",
    change: "Follow up required"
  }
];

const SchoolOwnerStatsCards: React.FC<Props> = ({ metrics, loading }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {metricsCards.map((card, idx) => (
      <Card key={card.key} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading
                  ? <span className="animate-pulse">...</span>
                  : card.key === "totalRevenue" || card.key === "outstandingFees"
                  ? `$${metrics[card.key].toLocaleString()}`
                  : metrics[card.key as keyof SchoolMetrics]}
              </p>
              <p className="text-xs text-gray-500">{card.description}</p>
            </div>
            <span className={`h-8 w-8 ${card.color}`}>⬤</span>
          </div>
          <div className="text-xs text-green-600 mt-2">
            {card.key === "totalRevenue" && !loading
              ? `+${metrics.monthlyGrowth}% growth`
              : card.change}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default SchoolOwnerStatsCards;
