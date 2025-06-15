
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEduFamAnalytics } from "@/hooks/useEduFamAnalytics";
import { useClasses } from "@/hooks/useClasses";
import { useToast } from "@/hooks/use-toast";

const EduFamAdminAnalytics = () => {
  // Filter UI state
  const [schoolId, setSchoolId] = useState<string | undefined>(undefined);
  const [classId, setClassId] = useState<string | undefined>(undefined);
  const [dateFilter, setDateFilter] = useState("this_month");
  // Date filter logic
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

  // Example: fetch classes for school filter. (Can be replaced if multi-school selection is expanded)
  const { classes } = useClasses();

  const { summary, loading, error, retry } = useEduFamAnalytics({
    schoolId,
    classId,
    startDate,
    endDate,
  });

  const { toast } = useToast();

  // Simulated school options for demonstration (replace with real schools)
  const schoolOptions = [
    { id: "", name: "All Schools" },
    { id: "school1", name: "Greenwood Primary" },
    { id: "school2", name: "Riverside Academy" },
    { id: "school3", name: "Sunshine School" },
    { id: "school4", name: "Oak Tree Primary" },
  ];

  // Filter UI and summary cards
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
            {loading ? (
              <div>Loading grades...</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : summary ? (
              <div>
                <div className="font-bold text-2xl">{summary.grades.totalGrades ?? 0}</div>
                <div className="text-muted-foreground">Total Grades Recorded</div>
                <div className="font-semibold mt-2">
                  Avg. Score:{" "}
                  {summary.grades.avgScore !== null
                    ? `${summary.grades.avgScore.toFixed(1)}%`
                    : "N/A"}
                </div>
              </div>
            ) : (
              <div>No data</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading attendance...</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : summary ? (
              <div>
                <div className="font-bold text-2xl">{summary.attendance.records ?? 0}</div>
                <div className="text-muted-foreground">Attendance Records</div>
                <div className="font-semibold mt-2">
                  Avg. Attendance:{" "}
                  {summary.attendance.avgAttendance !== null
                    ? `${summary.attendance.avgAttendance.toFixed(1)}%`
                    : "N/A"}
                </div>
              </div>
            ) : (
              <div>No data</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Finance</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading finances...</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : summary ? (
              <div>
                <div className="font-bold text-2xl">
                  KES{" "}
                  {summary.finance.totalAmount !== null
                    ? summary.finance.totalAmount.toLocaleString()
                    : "0"}
                </div>
                <div className="text-muted-foreground">Transactions: {summary.finance.transactionCount}</div>
              </div>
            ) : (
              <div>No data</div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Retry on error */}
      {error && (
        <div className="py-4">
          <button
            className="bg-red-100 text-red-800 px-4 py-2 rounded"
            onClick={() => retry()}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default EduFamAdminAnalytics;
