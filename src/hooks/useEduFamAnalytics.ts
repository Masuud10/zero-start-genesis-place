// Edufam Analytics Hook: Returns summary objects for grades, attendance, and finance for edufam_admin using summary views

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalyticsPermissions } from "./useAnalyticsPermissions";

export interface AnalyticsSummary {
  grades: {
    totalGrades: number;
    averageGrade: number | null;
  };
  attendance: {
    totalRecords: number;
    attendanceRate: number | null;
  };
  finance: {
    totalCollected: number | null;
    transactionsCount: number;
  };
}

export interface AnalyticsFilter {
  schoolId?: string;
  startDate?: string;
  endDate?: string;
}

export function useEduFamAnalytics(filters: AnalyticsFilter) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { canViewSystemAnalytics } = useAnalyticsPermissions();
  const { user } = useAuth();
  const isEdufamAdmin = user?.role === "edufam_admin";
  const shouldFetch = isEdufamAdmin && canViewSystemAnalytics;

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!shouldFetch)
        throw new Error("Insufficient permissions for analytics summary.");

      // --- Grades Summary ---
      // Use `as any` to avoid TS2558 for views/not-in-types
      let gradesQuery: any = (supabase as any)
        .from("school_grades_summary")
        .select("*");

      if (filters.schoolId) {
        gradesQuery = gradesQuery.eq("school_id", filters.schoolId);
      }

      const { data: gradesData, error: gradesErr } = await gradesQuery;
      if (gradesErr) throw gradesErr;

      let gradesSummary =
        filters.schoolId && Array.isArray(gradesData)
          ? gradesData[0]
          : Array.isArray(gradesData) && gradesData.length > 0
          ? gradesData[0]
          : null;

      // --- Attendance Summary ---
      let attendanceQuery: any = (supabase as any)
        .from("school_attendance_summary")
        .select("*");

      if (filters.schoolId) {
        attendanceQuery = attendanceQuery.eq("school_id", filters.schoolId);
      }

      const { data: attendanceData, error: attendanceErr } =
        await attendanceQuery;
      if (attendanceErr) throw attendanceErr;

      let attendanceSummary =
        filters.schoolId && Array.isArray(attendanceData)
          ? attendanceData[0]
          : Array.isArray(attendanceData) && attendanceData.length > 0
          ? attendanceData[0]
          : null;

      // --- Finance Summary ---
      let financeQuery: any = (supabase as any)
        .from("school_finance_summary")
        .select("*");
      if (filters.schoolId) {
        financeQuery = financeQuery.eq("school_id", filters.schoolId);
      }

      const { data: financeData, error: financeErr } = await financeQuery;
      if (financeErr) throw financeErr;

      let financeSummary =
        filters.schoolId && Array.isArray(financeData)
          ? financeData[0]
          : Array.isArray(financeData) && financeData.length > 0
          ? financeData[0]
          : null;

      setSummary({
        grades: {
          totalGrades: gradesSummary?.grades_count ?? 0,
          averageGrade:
            gradesSummary?.average_grade !== null && gradesSummary?.average_grade !== undefined
              ? Math.round(gradesSummary?.average_grade * 10) / 10
              : null,
        },
        attendance: {
          totalRecords: attendanceSummary?.attendance_count ?? 0,
          attendanceRate:
            attendanceSummary?.attendance_rate !== null && attendanceSummary?.attendance_rate !== undefined
              ? Math.round(attendanceSummary?.attendance_rate * 10) / 10
              : null,
        },
        finance: {
          totalCollected:
            financeSummary?.total_collected !== null && financeSummary?.total_collected !== undefined
              ? Number(financeSummary?.total_collected)
              : null,
          transactionsCount: financeSummary?.transactions_count ?? 0,
        },
      });
      setError(null);
    } catch (err: any) {
      setSummary(null);
      setError(err?.message ?? "Failed to load analytics summary");
    } finally {
      setLoading(false);
    }
  }, [shouldFetch, filters.schoolId, filters.startDate, filters.endDate]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, retry: fetchSummary };
}
