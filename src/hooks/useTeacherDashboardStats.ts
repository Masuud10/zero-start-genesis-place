
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';

interface TeacherDashboardStats {
  classes: number;
  students: number;
  pendingGrades: number;
  todaysClasses: number;
}

export function useTeacherDashboardStats(user: AuthUser) {
  const [stats, setStats] = useState<TeacherDashboardStats>({
    classes: 0,
    students: 0,
    pendingGrades: 0,
    todaysClasses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      if (!user?.id || !user?.school_id) {
        setLoading(false);
        return;
      }
      // 1. Count of classes assigned (from teacher_classes)
      const { count: classCount } = await supabase
        .from('teacher_classes')
        .select('id', { count: 'exact', head: true })
        .eq('teacher_id', user.id);

      // 2. Number of students taught (across all classes)
      const { data: teacherClassRows } = await supabase
        .from('teacher_classes')
        .select('class_id')
        .eq('teacher_id', user.id);

      const classIds: string[] = (teacherClassRows ?? []).map(row => row.class_id);

      let studentsCount = 0;
      if (classIds.length > 0) {
        const { count } = await supabase
          .from('students')
          .select('id', { count: 'exact', head: true })
          .in('class_id', classIds);
        studentsCount = count ?? 0;
      } else {
        studentsCount = 0;
      }

      // 3. Count of pending grades (status='draft', submitted_by=teacher)
      const { count: pendingGradesCount } = await supabase
        .from('grades')
        .select('id', { count: 'exact', head: true })
        .eq('submitted_by', user.id)
        .eq('status', 'draft');

      // 4. Today's classes (from teacher_classes and timetables)
      let todaysClasses = 0;
      if (classIds.length > 0) {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const { data: timetableSlots } = await supabase
          .from('timetable_slots')
          .select('id')
          .in('class_id', classIds)
          .eq('day', today);
        todaysClasses = timetableSlots?.length ?? 0;
      } else {
        todaysClasses = 0;
      }

      setStats({
        classes: classCount ?? 0,
        students: studentsCount,
        pendingGrades: pendingGradesCount ?? 0,
        todaysClasses,
      });
      setLoading(false);
    };
    fetchStats();
  }, [user.id, user.school_id]);

  return { stats, loading };
}
