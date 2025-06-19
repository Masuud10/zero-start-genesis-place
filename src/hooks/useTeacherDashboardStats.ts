
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';
import { useSchoolScopedData } from './useSchoolScopedData';

export const useTeacherDashboardStats = (user: AuthUser) => {
  const { schoolId } = useSchoolScopedData();

  const { data: stats, isLoading: loading } = useQuery({
    queryKey: ['teacher-dashboard-stats', user?.id, schoolId],
    queryFn: async () => {
      if (!user?.id || !schoolId) return null;

      try {
        // Get classes taught by this teacher
        const { data: classes } = await supabase
          .from('classes')
          .select('id, name')
          .eq('teacher_id', user.id)
          .eq('school_id', schoolId);

        const classIds = classes?.map(c => c.id) || [];

        // Get total students in teacher's classes
        const { count: studentCount } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classIds)
          .eq('is_active', true);

        // Get subjects taught
        const { data: subjects } = await supabase
          .from('subjects')
          .select('id, name')
          .eq('teacher_id', user.id)
          .eq('school_id', schoolId);

        // Get today's attendance submissions
        const today = new Date().toISOString().split('T')[0];
        const { count: todayAttendance } = await supabase
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .eq('submitted_by', user.id)
          .eq('date', today);

        // Get pending grade submissions
        const { count: pendingGrades } = await supabase
          .from('grades')
          .select('*', { count: 'exact', head: true })
          .eq('submitted_by', user.id)
          .eq('status', 'draft');

        return {
          classCount: classes?.length || 0,
          studentCount: studentCount || 0,
          subjectCount: subjects?.length || 0,
          todayAttendance: todayAttendance || 0,
          pendingGrades: pendingGrades || 0,
          classes: classes || [],
          subjects: subjects || []
        };
      } catch (error) {
        console.error('Error fetching teacher stats:', error);
        return {
          classCount: 0,
          studentCount: 0,
          subjectCount: 0,
          todayAttendance: 0,
          pendingGrades: 0,
          classes: [],
          subjects: []
        };
      }
    },
    enabled: !!user?.id && !!schoolId
  });

  return { stats, loading };
};
