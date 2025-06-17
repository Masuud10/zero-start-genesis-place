
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
    if (!shouldFetch) {
      setError("Insufficient permissions for analytics summary.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 EduFamAnalytics: Fetching data for filters:', filters);

      // --- Grades Summary ---
      let gradesQuery = supabase
        .from("school_grades_summary")
        .select("*");

      if (filters.schoolId) {
        gradesQuery = gradesQuery.eq("school_id", filters.schoolId);
      }

      const { data: gradesData, error: gradesErr } = await gradesQuery;
      if (gradesErr) {
        console.error('Grades query error:', gradesErr);
        throw gradesErr;
      }
      
      let gradesSummary;
      if (filters.schoolId) {
        gradesSummary = Array.isArray(gradesData) && gradesData.length > 0 ? gradesData[0] : null;
      } else if (Array.isArray(gradesData) && gradesData.length > 0) {
        const aggregated = gradesData.reduce((acc, summary) => {
          const count = summary.grades_count || 0;
          acc.grades_count += count;
          acc.total_weighted_grade += (summary.average_grade || 0) * count;
          return acc;
        }, { grades_count: 0, total_weighted_grade: 0 });
        
        gradesSummary = {
          grades_count: aggregated.grades_count,
          average_grade: aggregated.grades_count > 0 ? aggregated.total_weighted_grade / aggregated.grades_count : null
        };
      } else {
        gradesSummary = null;
      }

      // --- Attendance Summary ---
      let attendanceQuery = supabase
        .from("school_attendance_summary")
        .select("*");

      if (filters.schoolId) {
        attendanceQuery = attendanceQuery.eq("school_id", filters.schoolId);
      }

      const { data: attendanceData, error: attendanceErr } = await attendanceQuery;
      if (attendanceErr) {
        console.error('Attendance query error:', attendanceErr);
        throw attendanceErr;
      }
      
      let attendanceSummary;
      if (filters.schoolId) {
        attendanceSummary = Array.isArray(attendanceData) && attendanceData.length > 0 ? attendanceData[0] : null;
      } else if (Array.isArray(attendanceData) && attendanceData.length > 0) {
        const aggregated = attendanceData.reduce((acc, summary) => {
          const count = summary.attendance_count || 0;
          acc.attendance_count += count;
          acc.total_weighted_rate += (summary.attendance_rate || 0) * count;
          return acc;
        }, { attendance_count: 0, total_weighted_rate: 0 });

        attendanceSummary = {
          attendance_count: aggregated.attendance_count,
          attendance_rate: aggregated.attendance_count > 0 ? aggregated.total_weighted_rate / aggregated.attendance_count : null,
        };
      } else {
        attendanceSummary = null;
      }

      // --- Finance Summary ---
      let financeQuery = supabase
        .from("school_finance_summary")
        .select("*");
        
      if (filters.schoolId) {
        financeQuery = financeQuery.eq("school_id", filters.schoolId);
      }

      const { data: financeData, error: financeErr } = await financeQuery;
      if (financeErr) {
        console.error('Finance query error:', financeErr);
        throw financeErr;
      }
      
      let financeSummary;
      if (filters.schoolId) {
        financeSummary = Array.isArray(financeData) && financeData.length > 0 ? financeData[0] : null;
      } else if (Array.isArray(financeData) && financeData.length > 0) {
        financeSummary = financeData.reduce((acc, summary) => {
          acc.total_collected += summary.total_collected || 0;
          acc.transactions_count += summary.transactions_count || 0;
          return acc;
        }, { total_collected: 0, transactions_count: 0 });
      } else {
        financeSummary = null;
      }

      const newSummary: AnalyticsSummary = {
        grades: {
          totalGrades: gradesSummary?.grades_count ?? 0,
          averageGrade: gradesSummary?.average_grade !== null && gradesSummary?.average_grade !== undefined
            ? Math.round(gradesSummary?.average_grade * 10) / 10
            : null,
        },
        attendance: {
          totalRecords: attendanceSummary?.attendance_count ?? 0,
          attendanceRate: attendanceSummary?.attendance_rate !== null && attendanceSummary?.attendance_rate !== undefined
            ? Math.round(attendanceSummary?.attendance_rate * 100) / 100
            : null,
        },
        finance: {
          totalCollected: financeSummary?.total_collected !== null && financeSummary?.total_collected !== undefined
            ? Number(financeSummary?.total_collected)
            : null,
          transactionsCount: financeSummary?.transactions_count ?? 0,
        },
      };

      console.log('📊 EduFamAnalytics: Summary computed:', newSummary);
      setSummary(newSummary);
      setError(null);
    } catch (err: any) {
      console.error('🚫 EduFamAnalytics: Error:', err);
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
