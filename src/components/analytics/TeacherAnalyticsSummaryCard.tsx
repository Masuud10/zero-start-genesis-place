import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import RoleReportDownloadButton from "../reports/RoleReportDownloadButton";

/**
 * Fetches summary analytics for classes this teacher is assigned to:
 * - Average Grade (avg of all current students in those classes)
 * - Grades Submitted
 * - Attendance Rate (average across all assigned classes)
 */
const TeacherAnalyticsSummaryCard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    avgGrade: number | null;
    gradesSubmitted: number | null;
    gradesExpected: number | null;
    attendanceRate: number | null;
  }>({
    avgGrade: null,
    gradesSubmitted: null,
    gradesExpected: null,
    attendanceRate: null,
  });

  // NEW: teacher's main classId for targeted downloads
  const [mainClassId, setMainClassId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      // Fetch teacher's assigned classes
      const { data: teacherClasses, error: tcErr } = await supabase
        .from("teacher_classes")
        .select("class_id")
        .eq("teacher_id", user?.id ?? "none");
      if (tcErr) {
        setError("Failed to load class assignments.");
        setLoading(false);
        return;
      }

      if (!teacherClasses || teacherClasses.length === 0) {
        setSummary({
          avgGrade: null,
          gradesSubmitted: null,
          gradesExpected: null,
          attendanceRate: null,
        });
        setMainClassId(null);
        setLoading(false);
        return;
      }

      const classIds = teacherClasses.map(row => row.class_id);
      setMainClassId(classIds[0] ?? null);

      // 1. Average Grade for classes (use grade_summary or grades)
      let avgGrade: number | null = null;
      try {
        const { data: classGrades } = await supabase
          .from("grade_summary")
          .select("average_score")
          .in("class_id", classIds);
        if (classGrades && classGrades.length) {
          const totals = classGrades
            .map(gs => typeof gs.average_score === "number" ? gs.average_score : Number(gs.average_score) || 0)
            .filter(x => !isNaN(x));
          avgGrade = totals.length ? (totals.reduce((a, b) => a + b, 0) / totals.length) : null;
        }
      } catch {
        avgGrade = null;
      }

      // 2. Grades Submitted/Expected
      let gradesSubmitted = null;
      let gradesExpected = null;
      try {
        const { count: submittedCount } = await supabase
          .from("grades")
          .select("id", { count: "exact", head: true })
          .eq("submitted_by", user?.id ?? "none")
          .eq("status", "finalized")
          .in("class_id", classIds);

        const { count: expectedCount } = await supabase
          .from("grades")
          .select("id", { count: "exact", head: true })
          .in("class_id", classIds);

        gradesSubmitted = submittedCount ?? null;
        gradesExpected = expectedCount ?? null;
      } catch {
        gradesSubmitted = null;
        gradesExpected = null;
      }

      // 3. Attendance Rate: Use attendance_summary table (by class)
      let attendanceRate: number | null = null;
      try {
        const { data: classAttendance } = await supabase
          .from("attendance_summary")
          .select("attendance_percentage")
          .in("class_id", classIds);
        if (classAttendance && classAttendance.length) {
          const rates = classAttendance
            .map(a => typeof a.attendance_percentage === "number" ? a.attendance_percentage : Number(a.attendance_percentage) || 0)
            .filter(x => !isNaN(x));
          attendanceRate = rates.length ? (rates.reduce((a, b) => a + b, 0) / rates.length) : null;
        }
      } catch {
        attendanceRate = null;
      }

      setSummary({
        avgGrade,
        gradesSubmitted,
        gradesExpected,
        attendanceRate,
      });
      setLoading(false);
    })();
  }, [user?.id]);

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
  if (error || (summary.avgGrade === null && summary.attendanceRate === null)) {
    return (
      <Card className="mt-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Class Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Analytics unavailable</AlertTitle>
            <AlertDescription>
              {error || "No class analytics data was found for your assignments."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
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
        <div className="mt-2">
          <RoleReportDownloadButton
            type="grades"
            term={"" + (new Date().getFullYear())}
            label="Download Grades (Excel)"
            classId={mainClassId || undefined}
          />
          <RoleReportDownloadButton
            type="attendance"
            term={"" + (new Date().getFullYear())}
            label="Download Attendance (Excel)"
            classId={mainClassId || undefined}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="flex-1">
              <div className={`text-lg font-bold ${m.highlight}`}>{m.value}</div>
              <div className="text-xs text-muted-foreground">{m.label}</div>
              <div className="text-xs">{m.trend}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherAnalyticsSummaryCard;
