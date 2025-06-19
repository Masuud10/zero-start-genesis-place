
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import RoleReportDownloadButton from "../reports/RoleReportDownloadButton";
import { useTeacherAnalyticsSummary } from "@/hooks/useTeacherAnalyticsSummary";

const TeacherAnalyticsSummaryCard: React.FC = () => {
  const { summary, loading, error } = useTeacherAnalyticsSummary();

  if (loading) {
    return (
      <Card className="mt-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Class Analytics Overview</CardTitle>
          <p className="text-xs text-muted-foreground">Loading...</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {[1, 2, 3].map(k => (
              <Skeleton className="h-14 w-full" key={k} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || (summary.avgGrade === null && summary.attendanceRate === null && !loading)) {
    const errorMessage = error || "No class analytics data was found for your assignments.";
    if (errorMessage.includes("Failed to load class assignments")) {
        return null;
    }
    return (
      <Card className="mt-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Class Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Analytics unavailable</AlertTitle>
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  if (summary.avgGrade === null && summary.attendanceRate === null && summary.gradesExpected === null) {
      return (
        <Card className="mt-2">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Class Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert>
                    <AlertTitle>No Data Yet</AlertTitle>
                    <AlertDescription>
                        Analytics data for your classes is not yet available.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
      )
  }

  const metrics = [
    {
      label: "Average Grade",
      value: summary.avgGrade !== null ? `${summary.avgGrade.toFixed(1)}%` : "—",
      trend: "",
      highlight: "text-green-600",
    },
    {
      label: "Grades Submitted",
      value: summary.gradesSubmitted !== null && summary.gradesExpected !== null
          ? `${summary.gradesSubmitted}/${summary.gradesExpected}`
          : "—",
      trend: summary.gradesSubmitted !== null && summary.gradesExpected
          ? Math.round((summary.gradesSubmitted / (summary.gradesExpected || 1)) * 100) + "%"
          : "",
      highlight: "text-purple-600",
    },
    {
      label: "Attendance Rate",
      value: summary.attendanceRate !== null ? `${summary.attendanceRate.toFixed(1)}%` : "—",
      trend: summary.attendanceRate !== null
          ? summary.attendanceRate > 90 ? "Excellent" : summary.attendanceRate > 80 ? "Good" : "Needs Attention"
          : "",
      highlight: "text-blue-600",
    },
  ];

  return (
    <Card className="mt-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Class Analytics Overview</CardTitle>
          <RoleReportDownloadButton />
        </div>
        <p className="text-xs text-muted-foreground">
          Performance summary for your assigned classes
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="text-center p-3 border rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
              <p className={`text-lg font-bold ${metric.highlight}`}>
                {metric.value}
              </p>
              {metric.trend && (
                <p className="text-xs text-muted-foreground mt-1">{metric.trend}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherAnalyticsSummaryCard;
