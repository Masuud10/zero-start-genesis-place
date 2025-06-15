
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from './useSchoolScopedData';

export interface TeacherAnalyticsSummaryData {
  avgGrade: number | null;
  gradesSubmitted: number | null;
  gradesExpected: number | null;
  attendanceRate: number | null;
}

const fetchTeacherAnalyticsSummary = async (userId: string | undefined, schoolId: string | null): Promise<TeacherAnalyticsSummaryData> => {
  if (!userId || !schoolId) {
    return {
      avgGrade: null,
      gradesSubmitted: null,
      gradesExpected: null,
      attendanceRate: null,
    };
  }

  try {
    // Fetch teacher's assigned classes for the current school
    const { data: teacherClasses, error: tcErr } = await supabase
      .from("teacher_classes")
      .select("class_id")
      .eq("teacher_id", userId)
      .eq("school_id", schoolId);
      
    if (tcErr) throw new Error("Failed to load class assignments.");
    if (!teacherClasses || teacherClasses.length === 0) {
        return { avgGrade: null, gradesSubmitted: null, gradesExpected: null, attendanceRate: null };
    }

    const classIds = teacherClasses.map(row => row.class_id);

    const [
        gradeSummaryRes,
        submittedCountRes,
        expectedCountRes,
        attendanceSummaryRes
    ] = await Promise.all([
        supabase.from("grade_summary").select("average_score").in("class_id", classIds).eq('school_id', schoolId),
        supabase.from("grades").select("id", { count: "exact", head: true }).eq("submitted_by", userId).eq("status", "finalized").in("class_id", classIds).eq('school_id', schoolId),
        supabase.from("grades").select("id", { count: "exact", head: true }).in("class_id", classIds).eq('school_id', schoolId),
        supabase.from("attendance_summary").select("attendance_percentage").in("class_id", classIds).eq('school_id', schoolId)
    ]);

    if (gradeSummaryRes.error) throw new Error("Failed to fetch grade summary.");
    let avgGrade: number | null = null;
    if (gradeSummaryRes.data && gradeSummaryRes.data.length > 0) {
        const totals = gradeSummaryRes.data
            .map(gs => typeof gs.average_score === "number" ? gs.average_score : Number(gs.average_score) || 0)
            .filter(x => !isNaN(x));
        avgGrade = totals.length ? (totals.reduce((a, b) => a + b, 0) / totals.length) : null;
    }

    if (submittedCountRes.error || expectedCountRes.error) throw new Error("Failed to fetch grade counts.");

    if (attendanceSummaryRes.error) throw new Error("Failed to fetch attendance summary.");
    let attendanceRate: number | null = null;
    if (attendanceSummaryRes.data && attendanceSummaryRes.data.length > 0) {
        const rates = attendanceSummaryRes.data
            .map(a => typeof a.attendance_percentage === "number" ? a.attendance_percentage : Number(a.attendance_percentage) || 0)
            .filter(x => !isNaN(x));
        attendanceRate = rates.length ? (rates.reduce((a, b) => a + b, 0) / rates.length) : null;
    }

    return {
        avgGrade,
        gradesSubmitted: submittedCountRes.count ?? null,
        gradesExpected: expectedCountRes.count ?? null,
        attendanceRate,
    };
  } catch (err: any) {
    console.error("Error fetching teacher analytics summary:", err);
    throw err;
  }
};


export const useTeacherAnalyticsSummary = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();

  const { data, isLoading, error } = useQuery<TeacherAnalyticsSummaryData, Error>({
    queryKey: ['teacherAnalyticsSummary', user?.id, schoolId],
    queryFn: () => fetchTeacherAnalyticsSummary(user?.id, schoolId),
    enabled: !!user?.id && !!schoolId,
  });

  return { 
    summary: data ?? { avgGrade: null, gradesSubmitted: null, gradesExpected: null, attendanceRate: null }, 
    loading: isLoading, 
    error: error?.message || null 
  };
};
