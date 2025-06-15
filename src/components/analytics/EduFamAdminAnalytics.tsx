import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEduFamAnalytics } from "@/hooks/useEduFamAnalytics";
import { useClasses } from "@/hooks/useClasses";
import { useToast } from "@/hooks/use-toast";

const EduFamAdminAnalytics = () => {
  const [schoolId, setSchoolId] = useState<string | undefined>(undefined);
  const [classId, setClassId] = useState<string | undefined>(undefined);
  const [dateFilter, setDateFilter] = useState("this_month");

  // Improved: Always valid date range
  const now = new Date();
  let startDate: string | undefined;
  let endDate: string | undefined;
  if (dateFilter === "this_month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
  } else if (dateFilter === "last_month") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();
  } else {
    startDate = undefined;
    endDate = undefined;
  }

  const { classes } = useClasses();

  const { summary, loading, error, retry } = useEduFamAnalytics({
    schoolId,
    classId,
    startDate,
    endDate,
  });

  const { toast } = useToast();

  // Debug: Log analytic state
  React.useEffect(() => {
    console.log("[EduFamAdminAnalytics] State update", {
      summary, loading, error, schoolId, classId, startDate, endDate
    });
    if (error) {
      console.error("[EduFamAdminAnalytics] Error:", error);
    }
  }, [summary, loading, error, schoolId, classId, startDate, endDate]);

  const schoolOptions = [
    { id: "", name: "All Schools" },
    { id: "school1", name: "Greenwood Primary" },
    { id: "school2", name: "Riverside Academy" },
    { id: "school3", name: "Sunshine School" },
    { id: "school4", name: "Oak Tree Primary" },
  ];

  // Helper to safely format numbers that could be undefined or null
  const safeFormat = (value: number | null | undefined, digits = 1) => {
    if (typeof value === "number" && !isNaN(value)) {
      return value.toFixed(digits);
    }
    return "N/A";
  };

  // LOGGING for debugging
  React.useEffect(() => {
    if (error) {
      console.error("❌ Analytics Fetch Error:", error);
      toast({
        title: "Analytics Error",
        description: typeof error === "string" ? error : "Failed to load analytics",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // If loading or error, show a single card that spans all columns
  if (loading) {
    return (
      <div className="w-full flex flex-col items-center gap-6">
        <div className="py-10 flex flex-col items-center">
          <span className="text-gray-600 animate-pulse">Loading analytics summary...</span>
          <div className="w-12 h-12 mt-4 animate-spin rounded-full border-t-2 border-blue-500 border-solid"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col items-center gap-6">
        <Card className="bg-red-50 border-red-200 max-w-xl w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Analytics Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-700 font-medium mb-2">
              Failed to load analytics summary.
            </div>
            <div className="mb-4">{typeof error === "string" ? error : "Unknown error."}</div>
            <button
              className="bg-red-100 text-red-800 px-4 py-2 rounded"
              onClick={() => retry()}
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle summary being null (no results)
  if (!summary) {
    console.warn("[EduFamAdminAnalytics] No summary data returned.");
    return (
      <div className="w-full flex flex-col items-center gap-6">
        <Card className="max-w-xl w-full">
          <CardHeader>
            <CardTitle>No Analytics Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-gray-500">
              There is no analytics data available for the selected criteria. Try adjusting the filters, or check that schools are submitting grades, attendance, and finances.
            </div>
            <button
              className="bg-blue-100 text-blue-800 px-4 py-2 rounded"
              onClick={() => retry()}
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={schoolId ?? ""} onValueChange={val => setSchoolId(val || undefined)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by school" />
          </SelectTrigger>
          <SelectContent>
            {schoolOptions.map(opt => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={classId ?? ""} onValueChange={val => setClassId(val || undefined)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Classes</SelectItem>
            {classes.map(cls => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="all_time">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <div className="font-bold text-2xl">{summary?.grades.totalGrades ?? 0}</div>
              <div className="text-muted-foreground">Total Grades Recorded</div>
              <div className="font-semibold mt-2">
                Avg. Score: {safeFormat(summary?.grades.avgScore)}%
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <div className="font-bold text-2xl">{summary?.attendance.records ?? 0}</div>
              <div className="text-muted-foreground">Attendance Records</div>
              <div className="font-semibold mt-2">
                Avg. Attendance: {safeFormat(summary?.attendance.avgAttendance)}%
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Finance</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <div className="font-bold text-2xl">
                KES{" "}
                {typeof summary?.finance.totalAmount === "number" && !isNaN(summary.finance.totalAmount)
                  ? summary.finance.totalAmount.toLocaleString()
                  : "0"}
              </div>
              <div className="text-muted-foreground">Transactions: {summary?.finance.transactionCount ?? 0}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EduFamAdminAnalytics;
