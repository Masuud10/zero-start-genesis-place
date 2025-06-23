
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

      try {
        console.log('📊 Fetching teacher dashboard stats for user:', user.id, 'school:', schoolId);

        // Get classes taught by this teacher with real-time data
        const { data: classes, error: classesError } = await supabase
          .from('classes')
          .select('id, name, level, stream')
          .eq('teacher_id', user.id)
          .eq('school_id', schoolId);

        if (classesError) {
          console.error('Error fetching teacher classes:', classesError);
          throw classesError;
        }

        const classIds = classes?.map(c => c.id) || [];
        console.log('📊 Teacher classes found:', classIds.length);

        // Get real-time student count in teacher's classes
        const { count: studentCount, error: studentError } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classIds)
          .eq('is_active', true);

        if (studentError) {
          console.error('Error fetching student count:', studentError);
        }

        // Get subjects taught by this teacher with real-time data
        const { data: subjects, error: subjectsError } = await supabase
          .from('subjects')
          .select('id, name, code')
          .eq('teacher_id', user.id)
          .eq('school_id', schoolId);

        if (subjectsError) {
          console.error('Error fetching teacher subjects:', subjectsError);
        }

        // Get today's attendance submissions with accurate date handling
        const today = new Date().toISOString().split('T')[0];
        const { count: todayAttendance, error: attendanceError } = await supabase
          .from('attendance')
          .select('*', { count: 'exact', head: true })
          .eq('submitted_by', user.id)
          .eq('date', today)
          .eq('school_id', schoolId);

        if (attendanceError) {
          console.error('Error fetching attendance count:', attendanceError);
        }

        // Get pending grade submissions with real-time data
        const { count: pendingGrades, error: gradesError } = await supabase
          .from('grades')
          .select('*', { count: 'exact', head: true })
          .eq('submitted_by', user.id)
          .eq('school_id', schoolId)
          .in('status', ['draft', 'submitted']);

        if (gradesError) {
          console.error('Error fetching pending grades:', gradesError);
        }

        // Get submitted grades count for additional stats
        const { count: submittedGrades, error: submittedGradesError } = await supabase
          .from('grades')
          .select('*', { count: 'exact', head: true })
          .eq('submitted_by', user.id)
          .eq('school_id', schoolId)
          .eq('status', 'submitted');

        if (submittedGradesError) {
          console.error('Error fetching submitted grades:', submittedGradesError);
        }

        // Get approved grades count
        const { count: approvedGrades, error: approvedGradesError } = await supabase
          .from('grades')
          .select('*', { count: 'exact', head: true })
          .eq('submitted_by', user.id)
          .eq('school_id', schoolId)
          .eq('status', 'approved');

        if (approvedGradesError) {
          console.error('Error fetching approved grades:', approvedGradesError);
        }

        const statsData = {
          classCount: classes?.length || 0,
          studentCount: studentCount || 0,
          subjectCount: subjects?.length || 0,
          todayAttendance: todayAttendance || 0,
          pendingGrades: pendingGrades || 0,
          submittedGrades: submittedGrades || 0,
          approvedGrades: approvedGrades || 0,
          classes: classes || [],
          subjects: subjects || []
        };

        console.log('📊 Teacher dashboard stats compiled:', statsData);
        return statsData;

      } catch (error) {
        console.error('Error fetching teacher stats:', error);
        // Return default stats instead of throwing to prevent dashboard crashes
        return {
          classCount: 0,
          studentCount: 0,
          subjectCount: 0,
          todayAttendance: 0,
          pendingGrades: 0,
          submittedGrades: 0,
          approvedGrades: 0,
          classes: [],
          subjects: []
        };
      }
    },
    enabled: !!user?.id && !!schoolId,
    staleTime: 2 * 60 * 1000, // 2 minutes for more frequent updates
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes for real-time updates
  });

  return { stats, loading, error, refetch };
};
