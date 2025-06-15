
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Helper types
export interface AnalyticsSummary {
  grades: {
    totalGrades: number;
    avgScore: number | null;
  };
  attendance: {
    records: number;
    avgAttendance: number | null;
  };
  finance: {
    totalAmount: number | null;
    transactionCount: number;
  };
}

export interface AnalyticsFilter {
  schoolId?: string;
  classId?: string;
  startDate?: string;
  endDate?: string;
}

// Main hook
export function useEduFamAnalytics(filters: AnalyticsFilter) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Grades aggregation
      let gradesQuery = supabase
        .from("grades")
        .select("score, max_score", { count: "exact" }) as any;
      if (filters.schoolId) gradesQuery = gradesQuery.eq("school_id", filters.schoolId);
      if (filters.classId) gradesQuery = gradesQuery.eq("class_id", filters.classId);
      if (filters.startDate) gradesQuery = gradesQuery.gte("created_at", filters.startDate);
      if (filters.endDate) gradesQuery = gradesQuery.lte("created_at", filters.endDate);

      const {
        data: grades_raw,
        count: gradesCount,
        error: gradesErr
      } = await gradesQuery;

      if (gradesErr) throw gradesErr;
      const grades: any[] = Array.isArray(grades_raw) ? grades_raw : [];
      const totalGrades = gradesCount ?? 0;
      const validScores = grades
        .map((g) =>
          g.max_score && g.max_score > 0 ? (g.score * 100) / g.max_score : null
        )
        .filter((v) => v !== null);
      const avgScore =
        validScores.length > 0
          ? validScores.reduce((sum, v) => sum + (v as number), 0) /
            validScores.length
          : null;

      // Attendance aggregation
      let attendanceQuery = supabase
        .from("attendance")
        .select("status", { count: "exact" }) as any;
      if (filters.schoolId) attendanceQuery = attendanceQuery.eq("school_id", filters.schoolId);
      if (filters.classId) attendanceQuery = attendanceQuery.eq("class_id", filters.classId);
      if (filters.startDate) attendanceQuery = attendanceQuery.gte("date", filters.startDate);
      if (filters.endDate) attendanceQuery = attendanceQuery.lte("date", filters.endDate);

      const {
        data: attendance_raw,
        count: attendanceCount,
        error: attErr
      } = await attendanceQuery;

      if (attErr) throw attErr;
      const attendance: any[] = Array.isArray(attendance_raw) ? attendance_raw : [];
      const records = attendanceCount ?? 0;
      const presentCount = attendance.filter((a) => a.status === "present").length;
      const avgAttendance = records > 0 ? (presentCount * 100) / records : null;

      // Finance aggregation
      let financeQuery = supabase
        .from("financial_transactions")
        .select("amount", { count: "exact" }) as any;
      if (filters.schoolId) financeQuery = financeQuery.eq("school_id", filters.schoolId);
      if (filters.startDate) financeQuery = financeQuery.gte("created_at", filters.startDate);
      if (filters.endDate) financeQuery = financeQuery.lte("created_at", filters.endDate);

      const {
        data: finance_raw,
        count: transactionCount,
        error: finErr
      } = await financeQuery;

      if (finErr) throw finErr;
      const finance: any[] = Array.isArray(finance_raw) ? finance_raw : [];
      const totalAmount = finance.reduce((sum, f) => sum + (f.amount || 0), 0) || null;

      setSummary({
        grades: {
          totalGrades,
          avgScore,
        },
        attendance: {
          records,
          avgAttendance,
        },
        finance: {
          totalAmount,
          transactionCount: transactionCount ?? 0,
        },
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics summary");
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [
    filters.schoolId,
    filters.classId,
    filters.startDate,
    filters.endDate
  ]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, retry: fetchSummary };
}

// ... end of file
