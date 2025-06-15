import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface TeacherAnalyticsSummaryData {
  avgGrade: number | null;
  gradesSubmitted: number | null;
  gradesExpected: number | null;
  attendanceRate: number | null;
}

export const useTeacherAnalyticsSummary = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<TeacherAnalyticsSummaryData>({
    avgGrade: null,
    gradesSubmitted: null,
    gradesExpected: null,
    attendanceRate: null,
  });

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch teacher's assigned classes
        const { data: teacherClasses, error: tcErr } = await supabase
          .from("teacher_classes")
          .select("class_id")
          .eq("teacher_id", user.id);
          
        if (tcErr) throw new Error("Failed to load class assignments.");
        if (!teacherClasses || teacherClasses.length === 0) {
            setSummary({ avgGrade: null, gradesSubmitted: null, gradesExpected: null, attendanceRate: null });
            setLoading(false);
            return;
        }

        const classIds = teacherClasses.map(row => row.class_id);

        const [
            gradeSummaryRes,
            submittedCountRes,
            expectedCountRes,
            attendanceSummaryRes
        ] = await Promise.all([
            supabase.from("grade_summary").select("average_score").in("class_id", classIds),
            supabase.from("grades").select("id", { count: "exact", head: true }).eq("submitted_by", user.id).eq("status", "finalized").in("class_id", classIds),
            supabase.from("grades").select("id", { count: "exact", head: true }).in("class_id", classIds),
            supabase.from("attendance_summary").select("attendance_percentage").in("class_id", classIds)
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

        setSummary({
            avgGrade,
            gradesSubmitted: submittedCountRes.count ?? null,
            gradesExpected: expectedCountRes.count ?? null,
            attendanceRate,
        });

      } catch (err: any) {
        console.error("Error fetching teacher analytics summary:", err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [user?.id]);

  return { summary, loading, error };
};
