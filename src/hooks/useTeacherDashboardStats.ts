
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

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
  const { schoolId } = useSchoolScopedData();

  useEffect(() => {
    const fetchTeacherStats = async () => {
      if (!user?.id || !schoolId) {
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
        let studentCount = 0;
        if (classIds.length > 0) {
          const { count } = await supabase
            .from('students')
            .select('id', { count: 'exact' })
            .in('class_id', classIds)
            .eq('is_active', true);
          studentCount = count || 0;
        }

        // Fetch pending grades (draft status)
        const { count: pendingGradesCount } = await supabase
          .from('grades')
          .select('id', { count: 'exact' })
          .eq('submitted_by', user.id)
          .eq('status', 'draft');

        // Mock today's classes (would need timetable integration)
        const todaysClasses = Math.min(classIds.length, 3);

        setStats({
          classes: classIds.length,
          students: studentCount,
          pendingGrades: pendingGradesCount || 0,
          todaysClasses
        });

      } catch (error) {
        console.error('Error fetching teacher stats:', error);
        setStats({
          classes: 0,
          students: 0,
          pendingGrades: 0,
          todaysClasses: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherStats();
  }, [user?.id, schoolId]);

  return { stats, loading };
};
