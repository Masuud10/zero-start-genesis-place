
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEduFamAnalytics } from "@/hooks/useEduFamAnalytics";
import { useClasses } from "@/hooks/useClasses";
import { useToast } from "@/hooks/use-toast";

// [New] For later, if we want to dynamically load schools list from Supabase
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const EduFamAdminAnalytics = () => {
  const [schoolId, setSchoolId] = useState<string | undefined>(undefined);
  const [classId, setClassId] = useState<string | undefined>(undefined);
  const [dateFilter, setDateFilter] = useState("this_month");
  const [schools, setSchools] = useState<{ id: string, name: string }[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const { user } = useAuth();

  // Load real school list for cross-school analytics (if edufam admin)
  React.useEffect(() => {
    const loadSchools = async () => {
      if (user?.role === "edufam_admin") {
        setSchoolsLoading(true);
        const { data, error } = await supabase.from("schools").select("id, name");
        setSchools(data || []);
        setSchoolsLoading(false);
      }
    };
    loadSchools();
  }, [user?.role]);

  // Date range calculation (no change here)
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

  // LOGGING for debugging & QA
  React.useEffect(() => {
    // Add details for troubleshooting real data connection
    if (loading) {
      console.log("[EduFamAdminAnalytics] Loading state...", { schoolId, classId, startDate, endDate });
    }
    if (error) {
      console.error("[EduFamAdminAnalytics] Error:", error, { schoolId, classId, startDate, endDate });
    }
    if (summary) {
      console.log("[EduFamAdminAnalytics] Loaded analytics summary:", summary);
    }
  }, [summary, loading, error, schoolId, classId, startDate, endDate]);

  // Helper: format numbers (handles null/undefined as N/A)
  const safeFormat = (value: number | null | undefined, digits = 1) => {
    if (typeof value === "number" && !isNaN(value)) return value.toFixed(digits);
    return "N/A";
  };

  // Handle error toast (one-time per error)
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Analytics Error",
        description: typeof error === "string" ? error : "Failed to load analytics",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Defensive checks for summary structure
  const gradesSummary = summary?.grades || { totalGrades: 0, avgScore: null };
  const attendanceSummary = summary?.attendance || { records: 0, avgAttendance: null };
  const financeSummary = summary?.finance || { totalAmount: null, transactionCount: 0 };

  // SCHOOL FILTER
  const schoolOptions = [{ id: "", name: "All Schools" }, ...schools];

  // LOADING state (show spinner and hint)
  if (loading || schoolsLoading) {
    return (
      <div className="w-full flex flex-col items-center gap-6">
        <div className="py-10 flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-2" />
          <span className="text-gray-600 animate-pulse">Loading analytics summary...</span>
        </div>
      </div>
    );
  }

  // ERROR state (API/fetch error)
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
            <div className="mb-4 break-words">
              {typeof error === "string" ? error : "Unknown error."}
            </div>
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

  // EMPTY state (no data)
  if (!summary || (!gradesSummary.totalGrades && !attendanceSummary.records && !financeSummary.transactionCount)) {
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

  // INCOMPLETE state (partial data; show what we have, clarify incomplete)
  const hasPartial =
    (gradesSummary.totalGrades && !attendanceSummary.records && !financeSummary.transactionCount) ||
    (!gradesSummary.totalGrades && attendanceSummary.records && !financeSummary.transactionCount) ||
    (!gradesSummary.totalGrades && !attendanceSummary.records && financeSummary.transactionCount);

  // UI
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
      {hasPartial && (
        <div className="w-full text-yellow-700 bg-yellow-100 rounded px-4 py-2 font-medium mb-4 text-sm">
          Analytics data is incomplete for the selected filters. Some categories may have no records yet.
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <div className="font-bold text-2xl">{gradesSummary.totalGrades}</div>
              <div className="text-muted-foreground">Total Grades Recorded</div>
              <div className="font-semibold mt-2">
                Avg. Score: {safeFormat(gradesSummary.avgScore)}%
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
              <div className="font-bold text-2xl">{attendanceSummary.records}</div>
              <div className="text-muted-foreground">Attendance Records</div>
              <div className="font-semibold mt-2">
                Avg. Attendance: {safeFormat(attendanceSummary.avgAttendance)}%
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
                {typeof financeSummary.totalAmount === "number" && !isNaN(financeSummary.totalAmount)
                  ? financeSummary.totalAmount.toLocaleString()
                  : "0"}
              </div>
              <div className="text-muted-foreground">Transactions: {financeSummary.transactionCount}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EduFamAdminAnalytics;
