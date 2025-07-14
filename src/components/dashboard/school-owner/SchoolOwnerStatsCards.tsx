import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface SchoolMetrics {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  feeCollectionRate: number;
  totalRevenue: number;
  attendanceRate: number;
  outstandingFees: number;
  monthlyGrowth: number;
}

interface SchoolOwnerStatsCardsProps {
  metrics: SchoolMetrics;
  loading: boolean;
}

const SchoolOwnerStatsCards: React.FC<SchoolOwnerStatsCardsProps> = ({
  metrics,
  loading,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-600";
    if (growth < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return "↗️";
    if (growth < 0) return "↘️";
    return "→";
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    metrics.totalStudents.toLocaleString()
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "" : "Enrolled students"}
                </p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Total number of active students enrolled in your school</p>
          </TooltipContent>
        </Tooltip>

        {/* Total Teachers */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Total Teachers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    metrics.totalTeachers.toLocaleString()
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "" : "Teaching staff"}
                </p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Total number of active teachers in your school</p>
          </TooltipContent>
        </Tooltip>

        {/* Total Classes */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Total Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    metrics.totalClasses.toLocaleString()
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "" : "Active classes"}
                </p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Total number of active classes in your school</p>
          </TooltipContent>
        </Tooltip>

        {/* Total Revenue */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    formatCurrency(metrics.totalRevenue)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "" : "Current year"}
                </p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Total revenue collected this academic year</p>
          </TooltipContent>
        </Tooltip>

        {/* Fee Collection Rate */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Collection Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    `${metrics.feeCollectionRate}%`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "" : "Fee collection efficiency"}
                </p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Percentage of fees collected vs expected</p>
          </TooltipContent>
        </Tooltip>

        {/* Outstanding Fees */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Outstanding Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    formatCurrency(metrics.outstandingFees)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "" : "Pending collection"}
                </p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Total outstanding fees yet to be collected</p>
          </TooltipContent>
        </Tooltip>

        {/* Attendance Rate */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Attendance Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-600">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    `${metrics.attendanceRate}%`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "" : "Student attendance"}
                </p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Average student attendance rate this term</p>
          </TooltipContent>
        </Tooltip>

        {/* Monthly Growth */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Monthly Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${getGrowthColor(
                    metrics.monthlyGrowth
                  )}`}
                >
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <span className="flex items-center gap-1">
                      {getGrowthIcon(metrics.monthlyGrowth)}
                      {Math.abs(metrics.monthlyGrowth).toFixed(1)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "" : "Revenue growth"}
                </p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Monthly revenue growth compared to previous month</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default SchoolOwnerStatsCards;
