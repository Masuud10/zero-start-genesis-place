
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';

interface TeacherStats {
  classes: number;
  students: number;
  pendingGrades: number;
  todaysClasses: number;
}

export const useTeacherDashboardStats = (user: AuthUser) => {
  const [stats, setStats] = useState<TeacherStats>({
    classes: 0,
    students: 0,
    pendingGrades: 0,
    todaysClasses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherStats = async () => {
      if (!user?.id || !user?.school_id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch teacher's classes
        const { data: teacherClasses } = await supabase
          .from('teacher_classes')
          .select('class_id')
          .eq('teacher_id', user.id);

        const classIds = teacherClasses?.map(tc => tc.class_id) || [];

        // Fetch students in teacher's classes
        const { count: studentsCount } = await supabase
          .from('students')
          .select('id', { count: 'exact' })
          .in('class_id', classIds)
          .eq('is_active', true);

        // Fetch pending grades
        const { count: pendingGradesCount } = await supabase
          .from('grades')
          .select('id', { count: 'exact' })
          .eq('submitted_by', user.id)
          .eq('status', 'draft');

        setStats({
          classes: classIds.length,
          students: studentsCount || 0,
          pendingGrades: pendingGradesCount || 0,
          todaysClasses: Math.floor(classIds.length * 0.6) // Mock calculation
        });

      } catch (error) {
        console.error('Error fetching teacher stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherStats();
  }, [user?.id, user?.school_id]);

  return { stats, loading };
};
