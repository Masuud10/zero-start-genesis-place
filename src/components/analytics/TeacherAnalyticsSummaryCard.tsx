import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import RoleReportDownloadButton from "../reports/RoleReportDownloadButton";
import { useTeacherAnalyticsSummary } from "@/hooks/useTeacherAnalyticsSummary";

/**
 * Fetches summary analytics for classes this teacher is assigned to:
 * - Average Grade (avg of all current students in those classes)
 * - Grades Submitted
 * - Attendance Rate (average across all assigned classes)
 */
const TeacherAnalyticsSummaryCard: React.FC = () => {
  const { summary, loading, error } = useTeacherAnalyticsSummary();

  // LOADING
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

  // ERROR / No data
  if (error || (summary.avgGrade === null && summary.attendanceRate === null && !loading)) {
    const errorMessage = error || "No class analytics data was found for your assignments.";
    if (errorMessage.includes("Failed to load class assignments")) {
        return null; // Don't show card if teacher has no classes
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


  // Format metrics ...
  const metrics = [
    {
      label: "Average Grade",
      value:
        summary.avgGrade !== null
          ? `${summary.avgGrade.toFixed(1)}%`
          : "—",
      trend: "",
      highlight: "text-green-600",
    },
    {
      label: "Grades Submitted",
      value:
        summary.gradesSubmitted !== null && summary.gradesExpected !== null
          ? `${summary.gradesSubmitted}/${summary.gradesExpected}`
          : "—",
      trend:
        summary.gradesSubmitted !== null && summary.gradesExpected
          ? Math.round(
              (summary.gradesSubmitted / (summary.gradesExpected || 1)) * 100
            ) + "%"
          : "",
      highlight: "text-purple-600",
    },
    {
      label: "Attendance Rate",
      value:
        summary.attendanceRate !== null
          ? `${summary.attendanceRate.toFixed(1)}%`
          : "—",
      trend: summary.attendanceRate !== null
        ? summary.attendanceRate > 90
          ? "Above school avg"
          : "Below school avg"
        : "",
      highlight: "text-orange-600",
    },
  ];

  return (
    <Card className="mt-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Class Analytics Overview</CardTitle>
        <p className="text-xs text-muted-foreground">
          Track student grades and attendance for your classes.
        </p>
        <div className="mt-2 flex gap-2">
          <RoleReportDownloadButton
            type="grades"
            term={"" + (new Date().getFullYear())}
            label="Grades (Excel)"
            variant="outline"
            size="sm"
          />
          <RoleReportDownloadButton
            type="attendance"
            term={"" + (new Date().getFullYear())}
            label="Attendance (Excel)"
            variant="outline"
            size="sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="flex-1 p-4 border rounded-lg bg-gray-50/50">
              <div className="text-xs text-muted-foreground">{m.label}</div>
              <div className={`text-2xl font-bold ${m.highlight}`}>{m.value}</div>
              <div className="text-xs text-muted-foreground">{m.trend}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherAnalyticsSummaryCard;
