
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';
import { useSchoolScopedData } from './useSchoolScopedData';

export const useTeacherDashboardStats = (user: AuthUser) => {
  const { schoolId } = useSchoolScopedData();

  const { data: stats, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['teacher-dashboard-stats', user?.id, schoolId],
    queryFn: async () => {
      if (!user?.id || !schoolId) {
        console.log('📊 No user ID or school ID available for teacher stats');
        return null;
      }

      try {
        console.log('📊 Fetching teacher dashboard stats for user:', user.id, 'school:', schoolId);

        // Get classes taught by this teacher
        const { data: classes, error: classesError } = await supabase
          .from('classes')
          .select('id, name')
          .eq('teacher_id', user.id)
          .eq('school_id', schoolId);

        if (classesError) {
          console.error('Error fetching teacher classes:', classesError);
          throw classesError;
        }

        const classIds = classes?.map(c => c.id) || [];
        console.log('📊 Teacher classes found:', classIds.length);

        // Get total students in teacher's classes
        const { count: studentCount, error: studentError } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classIds)
          .eq('is_active', true);

        if (studentError) {
          console.error('Error fetching student count:', studentError);
        }

        // Get subjects taught
        const { data: subjects, error: subjectsError } = await supabase
          .from('subjects')
          .select('id, name')
          .eq('teacher_id', user.id)
          .eq('school_id', schoolId);

        if (subjectsError) {
          console.error('Error fetching teacher subjects:', subjectsError);
        }

        // Get today's attendance submissions
        const today = new Date().toISOString().split('T')[0];
        const { count: todayAttendance, error: attendanceError } = await supabase
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .eq('submitted_by', user.id)
          .eq('date', today);

        if (attendanceError) {
          console.error('Error fetching attendance count:', attendanceError);
        }

        // Get pending grade submissions
        const { count: pendingGrades, error: gradesError } = await supabase
          .from('grades')
          .select('*', { count: 'exact', head: true })
          .eq('submitted_by', user.id)
          .eq('status', 'draft');

        if (gradesError) {
          console.error('Error fetching pending grades:', gradesError);
        }

        const statsData = {
          classCount: classes?.length || 0,
          studentCount: studentCount || 0,
          subjectCount: subjects?.length || 0,
          todayAttendance: todayAttendance || 0,
          pendingGrades: pendingGrades || 0,
          classes: classes || [],
          subjects: subjects || []
        };

        console.log('📊 Teacher dashboard stats compiled:', statsData);
        return statsData;

      } catch (error) {
        console.error('Error fetching teacher stats:', error);
        // Return default stats instead of throwing
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
    enabled: !!user?.id && !!schoolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return { stats, loading, error, refetch };
};
