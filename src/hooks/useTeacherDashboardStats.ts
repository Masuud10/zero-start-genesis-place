
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';

interface TeacherDashboardStats {
  classes: number;
  students: number;
  pendingGrades: number;
  todaysClasses: number;
}

interface TeacherClassesRow {
  class_id: string;
}

interface Student {
  id: string;
}

interface TimetableSlot {
  id: string;
}

export function useTeacherDashboardStats(user: AuthUser) {
  const [stats, setStats] = useState<TeacherDashboardStats>({
    classes: 0,
    students: 0,
    pendingGrades: 0,
    todaysClasses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!user?.id || !user?.school_id) {
      setLoading(false);
      setError("Missing user ID or school ID");
      return;
    }
    try {
      // 1. Count of classes assigned (from teacher_classes)
      const { count: classCount, error: classErr } = await supabase
        .from('teacher_classes')
        .select('id', { count: 'exact', head: true })
        .eq('teacher_id', user.id);
      if (classErr) throw classErr;

      // 2. Number of students taught (across all classes)
      const { data: teacherClassRows, error: tcErr } = await supabase
        .from('teacher_classes')
        .select('class_id')
        .eq('teacher_id', user.id) as { data: TeacherClassesRow[] | null; error: Error | null; };
      if (tcErr) throw tcErr;

      const classIds: string[] = (teacherClassRows ?? []).map(row => row.class_id);

      let studentsCount = 0;
      if (Array.isArray(classIds) && classIds.length > 0) {
        const { count, error: scErr } = await supabase
          .from('students')
          .select('id', { count: 'exact', head: true })
          .in('class_id', classIds as string[]);
        if (scErr) throw scErr;
        studentsCount = count ?? 0;
      } else {
        studentsCount = 0;
      }

      // 3. Count of pending grades (status='draft', submitted_by=teacher)
      const { count: pendingGradesCount, error: pgErr } = await supabase
        .from('grades')
        .select('id', { count: 'exact', head: true })
        .eq('submitted_by', user.id)
        .eq('status', 'draft');
      if (pgErr) throw pgErr;

      // 4. Today's classes (from teacher_classes and timetables)
      let todaysClasses = 0;
      if (Array.isArray(classIds) && classIds.length > 0) {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const { data: timetableSlots, error: ttErr } = await supabase
          .from('timetable_slots')
          .select('id') as { data: TimetableSlot[] | null; error: Error | null };
        // Filter by class_id only if classIds is not empty
        let filteredSlots: TimetableSlot[] = [];
        if (timetableSlots && timetableSlots.length > 0) {
          filteredSlots = timetableSlots.filter(slot => classIds.includes((slot as any).class_id));
        }
        if (ttErr) throw ttErr;
        // This could be optimized as a .in() but doing this avoids TypeScript recursion
        todaysClasses = filteredSlots.filter(slot => {
          const slotDay = (slot as any).day?.toLowerCase?.() ?? '';
          return slotDay === today;
        }).length;
      } else {
        todaysClasses = 0;
      }

      setStats({
        classes: classCount ?? 0,
        students: studentsCount,
        pendingGrades: pendingGradesCount ?? 0,
        todaysClasses,
      });
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch dashboard stats");
      setStats({
        classes: 0,
        students: 0,
        pendingGrades: 0,
        todaysClasses: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [user.id, user.school_id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, retry: fetchStats };
}

// ... end of file
