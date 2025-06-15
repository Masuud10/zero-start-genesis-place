
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
      const {
        data: grades_raw,
        count: gradesCount,
        error: gradesErr
      }: {
        data: any[];
        count: number | null;
        error: any;
      } = await supabase
        .from("grades")
        .select("score, max_score", { count: "exact" })
        .eq(filters.schoolId ? "school_id" : "", filters.schoolId ?? "")
        .eq(filters.classId ? "class_id" : "", filters.classId ?? "")
        .gte(filters.startDate ? "created_at" : "", filters.startDate ?? "")
        .lte(filters.endDate ? "created_at" : "", filters.endDate ?? "");

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
      const {
        data: attendance_raw,
        count: attendanceCount,
        error: attErr
      }: {
        data: any[];
        count: number | null;
        error: any;
      } = await supabase
        .from("attendance")
        .select("status", { count: "exact" })
        .eq(filters.schoolId ? "school_id" : "", filters.schoolId ?? "")
        .eq(filters.classId ? "class_id" : "", filters.classId ?? "")
        .gte(filters.startDate ? "date" : "", filters.startDate ?? "")
        .lte(filters.endDate ? "date" : "", filters.endDate ?? "");

      if (attErr) throw attErr;
      const attendance: any[] = Array.isArray(attendance_raw) ? attendance_raw : [];
      const records = attendanceCount ?? 0;
      const presentCount = attendance.filter((a) => a.status === "present").length;
      const avgAttendance = records > 0 ? (presentCount * 100) / records : null;

      // Finance aggregation
      const {
        data: finance_raw,
        count: transactionCount,
        error: finErr
      }: {
        data: any[];
        count: number | null;
        error: any;
      } = await supabase
        .from("financial_transactions")
        .select("amount", { count: "exact" })
        .eq(filters.schoolId ? "school_id" : "", filters.schoolId ?? "")
        // No classId join for finance
        .gte(filters.startDate ? "created_at" : "", filters.startDate ?? "")
        .lte(filters.endDate ? "created_at" : "", filters.endDate ?? "");

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
