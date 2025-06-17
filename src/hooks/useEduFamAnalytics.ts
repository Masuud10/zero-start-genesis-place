
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
      console.warn('🚫 EduFamAnalytics: Access denied - user role:', user?.role, 'canViewSystemAnalytics:', canViewSystemAnalytics);
      setError("Insufficient permissions for analytics summary.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 EduFamAnalytics: Starting fetch with filters:', filters);
      console.log('🔍 EduFamAnalytics: User details:', { 
        userId: user?.id, 
        role: user?.role, 
        schoolId: user?.school_id 
      });

      // Test database connection first
      const { data: testData, error: testError } = await supabase
        .from("schools")
        .select("id, name")
        .limit(1);

      if (testError) {
        console.error('🚫 EduFamAnalytics: Database connection test failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }

      console.log('✅ EduFamAnalytics: Database connection successful');

      // --- Grades Summary ---
      console.log('📊 EduFamAnalytics: Fetching grades summary...');
      let gradesQuery = supabase
        .from("school_grades_summary")
        .select("*");

      if (filters.schoolId) {
        gradesQuery = gradesQuery.eq("school_id", filters.schoolId);
        console.log('🔍 EduFamAnalytics: Filtering grades by school_id:', filters.schoolId);
      }

      const { data: gradesData, error: gradesErr } = await gradesQuery;
      
      if (gradesErr) {
        console.error('🚫 EduFamAnalytics: Grades query error:', {
          error: gradesErr,
          message: gradesErr.message,
          details: gradesErr.details,
          hint: gradesErr.hint,
          code: gradesErr.code
        });
        throw new Error(`Grades query failed: ${gradesErr.message}`);
      }

      console.log('📊 EduFamAnalytics: Grades data received:', gradesData);
      
      let gradesSummary;
      if (filters.schoolId) {
        gradesSummary = Array.isArray(gradesData) && gradesData.length > 0 ? gradesData[0] : null;
        console.log('📊 EduFamAnalytics: Single school grades summary:', gradesSummary);
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
        console.log('📊 EduFamAnalytics: Aggregated grades summary:', gradesSummary);
      } else {
        gradesSummary = null;
        console.log('📊 EduFamAnalytics: No grades data found');
      }

      // --- Attendance Summary ---
      console.log('📅 EduFamAnalytics: Fetching attendance summary...');
      let attendanceQuery = supabase
        .from("school_attendance_summary")
        .select("*");

      if (filters.schoolId) {
        attendanceQuery = attendanceQuery.eq("school_id", filters.schoolId);
        console.log('🔍 EduFamAnalytics: Filtering attendance by school_id:', filters.schoolId);
      }

      const { data: attendanceData, error: attendanceErr } = await attendanceQuery;
      
      if (attendanceErr) {
        console.error('🚫 EduFamAnalytics: Attendance query error:', {
          error: attendanceErr,
          message: attendanceErr.message,
          details: attendanceErr.details,
          hint: attendanceErr.hint,
          code: attendanceErr.code
        });
        throw new Error(`Attendance query failed: ${attendanceErr.message}`);
      }

      console.log('📅 EduFamAnalytics: Attendance data received:', attendanceData);
      
      let attendanceSummary;
      if (filters.schoolId) {
        attendanceSummary = Array.isArray(attendanceData) && attendanceData.length > 0 ? attendanceData[0] : null;
        console.log('📅 EduFamAnalytics: Single school attendance summary:', attendanceSummary);
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
        console.log('📅 EduFamAnalytics: Aggregated attendance summary:', attendanceSummary);
      } else {
        attendanceSummary = null;
        console.log('📅 EduFamAnalytics: No attendance data found');
      }

      // --- Finance Summary ---
      console.log('💰 EduFamAnalytics: Fetching finance summary...');
      let financeQuery = supabase
        .from("school_finance_summary")
        .select("*");
        
      if (filters.schoolId) {
        financeQuery = financeQuery.eq("school_id", filters.schoolId);
        console.log('🔍 EduFamAnalytics: Filtering finance by school_id:', filters.schoolId);
      }

      const { data: financeData, error: financeErr } = await financeQuery;
      
      if (financeErr) {
        console.error('🚫 EduFamAnalytics: Finance query error:', {
          error: financeErr,
          message: financeErr.message,
          details: financeErr.details,
          hint: financeErr.hint,
          code: financeErr.code
        });
        throw new Error(`Finance query failed: ${financeErr.message}`);
      }

      console.log('💰 EduFamAnalytics: Finance data received:', financeData);
      
      let financeSummary;
      if (filters.schoolId) {
        financeSummary = Array.isArray(financeData) && financeData.length > 0 ? financeData[0] : null;
        console.log('💰 EduFamAnalytics: Single school finance summary:', financeSummary);
      } else if (Array.isArray(financeData) && financeData.length > 0) {
        financeSummary = financeData.reduce((acc, summary) => {
          acc.total_collected += summary.total_collected || 0;
          acc.transactions_count += summary.transactions_count || 0;
          return acc;
        }, { total_collected: 0, transactions_count: 0 });
        console.log('💰 EduFamAnalytics: Aggregated finance summary:', financeSummary);
      } else {
        financeSummary = null;
        console.log('💰 EduFamAnalytics: No finance data found');
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

      console.log('✅ EduFamAnalytics: Final summary computed:', newSummary);
      setSummary(newSummary);
      setError(null);
    } catch (err: any) {
      console.error('🚫 EduFamAnalytics: Critical error occurred:', {
        error: err,
        message: err?.message,
        stack: err?.stack,
        name: err?.name,
        filters: filters,
        user: user
      });
      
      setSummary(null);
      
      // Provide more specific error messages
      let errorMessage = "Failed to load analytics data";
      if (err?.message?.includes("permission")) {
        errorMessage = "Permission denied: Unable to access analytics data";
      } else if (err?.message?.includes("network")) {
        errorMessage = "Network error: Please check your connection";
      } else if (err?.message?.includes("timeout")) {
        errorMessage = "Request timeout: Please try again";
      } else if (err?.message) {
        errorMessage = `Data fetch error: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [shouldFetch, filters.schoolId, filters.startDate, filters.endDate, user, canViewSystemAnalytics]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, retry: fetchSummary };
}
