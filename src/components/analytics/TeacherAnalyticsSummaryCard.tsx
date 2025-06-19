
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import RoleReportDownloadButton from "../reports/RoleReportDownloadButton";
import { useTeacherAnalyticsSummary } from "@/hooks/useTeacherAnalyticsSummary";
import { TrendingUp, TrendingDown, Minus, Users, BookOpen, CheckCircle } from "lucide-react";

const TeacherAnalyticsSummaryCard: React.FC = () => {
  const { summary, loading, error } = useTeacherAnalyticsSummary();

  if (loading) {
    return (
      <Card className="mt-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Class Analytics Overview</CardTitle>
          <p className="text-xs text-muted-foreground">Loading analytics...</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(k => (
              <Skeleton key={k} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    // Don't show error for missing class assignments - this is expected for new teachers
    if (error.includes("Failed to load class assignments")) {
      return null;
    }
    
    return (
      <Card className="mt-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Class Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Analytics Unavailable</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  // Check if we have any meaningful data
  const hasData = summary.avgGrade !== null || summary.attendanceRate !== null || summary.gradesExpected !== null;
  
  if (!hasData) {
    return (
      <Card className="mt-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Class Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Users className="h-4 w-4" />
            <AlertTitle>Getting Started</AlertTitle>
            <AlertDescription>
              Your class analytics will appear here once you start entering grades and attendance data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Calculate completion rate
  const completionRate = summary.gradesExpected && summary.gradesExpected > 0 
    ? (summary.gradesSubmitted || 0) / summary.gradesExpected 
    : 0;

  // Determine performance trend
  const getPerformanceTrend = (avgGrade: number | null) => {
    if (avgGrade === null) return null;
    if (avgGrade >= 80) return { icon: TrendingUp, color: "text-green-600", label: "Excellent" };
    if (avgGrade >= 70) return { icon: TrendingUp, color: "text-blue-600", label: "Good" };
    if (avgGrade >= 60) return { icon: Minus, color: "text-yellow-600", label: "Average" };
    return { icon: TrendingDown, color: "text-red-600", label: "Needs Attention" };
  };

  const performanceTrend = getPerformanceTrend(summary.avgGrade);

  const metrics = [
    {
      label: "Class Average",
      value: summary.avgGrade !== null ? `${summary.avgGrade.toFixed(1)}%` : "—",
      trend: performanceTrend,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Grade Completion",
      value: summary.gradesSubmitted !== null && summary.gradesExpected !== null
        ? `${summary.gradesSubmitted}/${summary.gradesExpected}`
        : "—",
      trend: {
        label: `${Math.round(completionRate * 100)}% Complete`,
        color: completionRate > 0.8 ? "text-green-600" : completionRate > 0.5 ? "text-yellow-600" : "text-red-600"
      },
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Attendance Rate",
      value: summary.attendanceRate !== null ? `${summary.attendanceRate.toFixed(1)}%` : "—",
      trend: {
        label: summary.attendanceRate !== null
          ? summary.attendanceRate > 90 ? "Excellent" 
            : summary.attendanceRate > 80 ? "Good" 
            : "Needs Attention"
          : "",
        color: summary.attendanceRate !== null
          ? summary.attendanceRate > 90 ? "text-green-600"
            : summary.attendanceRate > 80 ? "text-blue-600"
            : "text-red-600"
          : "text-gray-500"
      },
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <Card className="mt-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Class Analytics Overview</CardTitle>
          <RoleReportDownloadButton 
            type="comprehensive"
            label="Download Report"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Performance summary for your assigned classes
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div key={index} className={`p-4 border rounded-lg ${metric.bgColor} border-opacity-50`}>
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className={`h-5 w-5 ${metric.color}`} />
                  <span className="text-xs text-gray-500">{metric.label}</span>
                </div>
                
                <div className="space-y-1">
                  <p className={`text-xl font-bold ${metric.color}`}>
                    {metric.value}
                  </p>
                  
                  {metric.trend && (
                    <div className="flex items-center gap-1">
                      {metric.trend.icon && (
                        <metric.trend.icon className={`h-3 w-3 ${metric.trend.color}`} />
                      )}
                      <p className={`text-xs font-medium ${metric.trend.color}`}>
                        {metric.trend.label}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary insights */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Insights</h4>
          <div className="space-y-1 text-xs text-gray-600">
            {summary.avgGrade !== null && (
              <p>• Class performance is {summary.avgGrade >= 75 ? 'above' : summary.avgGrade >= 60 ? 'at' : 'below'} expected standards</p>
            )}
            {completionRate < 0.8 && summary.gradesExpected && summary.gradesExpected > 0 && (
              <p>• {summary.gradesExpected - (summary.gradesSubmitted || 0)} grades still pending submission</p>
            )}
            {summary.attendanceRate !== null && summary.attendanceRate < 85 && (
              <p>• Consider follow-up on student attendance patterns</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherAnalyticsSummaryCard;
