import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  CheckCircle,
  Award,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Clock,
} from "lucide-react";

interface PrincipalStatsCardsProps {
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalSubjects: number;
    pendingApprovals: number;
    totalCertificates: number;
    attendanceRate: number;
    revenueThisMonth: number;
    outstandingFees: number;
  };
  loading: boolean;
  error: string | null;
  loadingTimeout?: boolean;
  onRetry?: () => void;
}

const PrincipalStatsCards: React.FC<PrincipalStatsCardsProps> = ({
  stats,
  loading,
  error,
  loadingTimeout = false,
  onRetry,
}) => {
  if (loading && !loadingTimeout) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (loadingTimeout) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-800">Loading Timeout</h3>
                <p className="text-sm text-yellow-700">
                  Dashboard is taking longer than expected to load.
                </p>
              </div>
            </div>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800">
                  Failed to Load Statistics
                </h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Teachers",
      value: stats.totalTeachers,
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Classes",
      value: stats.totalClasses,
      icon: School,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Subjects",
      value: stats.totalSubjects,
      icon: BookOpen,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: CheckCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      badge: stats.pendingApprovals > 0 ? "action-needed" : "up-to-date",
    },
    {
      title: "Certificates Generated",
      value: stats.totalCertificates,
      icon: Award,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Attendance Rate",
      value: `${stats.attendanceRate}%`,
      icon: TrendingUp,
      color: stats.attendanceRate >= 80 ? "text-green-600" : "text-red-600",
      bgColor: stats.attendanceRate >= 80 ? "bg-green-50" : "bg-red-50",
    },
    {
      title: "Outstanding Fees",
      value: `KES ${stats.outstandingFees.toLocaleString()}`,
      icon: DollarSign,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <Card
          key={index}
          className="hover:shadow-md transition-shadow duration-200"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
              {card.badge && (
                <Badge
                  variant={
                    card.badge === "action-needed" ? "destructive" : "secondary"
                  }
                  className="text-xs"
                >
                  {card.badge === "action-needed"
                    ? "Action Needed"
                    : "Up to Date"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {card.title === "Pending Approvals" && stats.pendingApprovals > 0
                ? `${stats.pendingApprovals} grades awaiting approval`
                : card.title === "Attendance Rate" && stats.attendanceRate < 80
                ? "Below target (80%)"
                : "Current status"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PrincipalStatsCards;
