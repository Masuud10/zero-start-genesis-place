
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser } from '@/types/auth';
import { useSchoolScopedData } from './useSchoolScopedData';

export const useTeacherDashboardStats = (user: AuthUser) => {
  const { schoolId, isReady } = useSchoolScopedData();

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
          submittedGrades: 0,
          approvedGrades: 0,
          classes: [],
          subjects: []
        };
      }

      try {
        console.log('📊 Fetching teacher dashboard stats for user:', user.id, 'school:', schoolId);

        // Step 1: Get teacher's classes
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

        // Step 2: Get subjects taught by this teacher
        const { data: subjects, error: subjectsError } = await supabase
          .from('subjects')
          .select('id, name, code')
          .eq('teacher_id', user.id)
          .eq('school_id', schoolId);

        if (subjectsError) {
          console.error('Error fetching teacher subjects:', subjectsError);
        }

        // Step 3: Get student count in teacher's classes (only if classes exist)
        let studentCount = 0;
        if (classIds.length > 0) {
          const { count, error: studentError } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .in('class_id', classIds)
            .eq('is_active', true);

          if (studentError) {
            console.error('Error fetching student count:', studentError);
          } else {
            studentCount = count || 0;
          }
        }

        // Step 4: Get today's attendance submissions
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

        // Step 5: Get grade statistics
        const gradeQueries = [
          { name: 'pending', status: ['draft', 'submitted'] },
          { name: 'submitted', status: ['submitted'] },
          { name: 'approved', status: ['approved'] }
        ];

        const gradeStats: Record<string, number> = {};
        
        for (const { name, status } of gradeQueries) {
          try {
            const { count } = await supabase
              .from('grades')
              .select('*', { count: 'exact', head: true })
              .eq('submitted_by', user.id)
              .eq('school_id', schoolId)
              .in('status', status);
            
            gradeStats[name] = count || 0;
          } catch (err) {
            console.warn(`Error fetching ${name} grades:`, err);
            gradeStats[name] = 0;
          }
        }

        const statsData = {
          classCount: classes?.length || 0,
          studentCount,
          subjectCount: subjects?.length || 0,
          todayAttendance: todayAttendance || 0,
          pendingGrades: gradeStats.pending || 0,
          submittedGrades: gradeStats.submitted || 0,
          approvedGrades: gradeStats.approved || 0,
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
    enabled: !!user?.id && !!schoolId && isReady,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Reduce unnecessary refetches
    retry: 1, // Only retry once to avoid overwhelming the database
  });

  return { stats, loading, error, refetch };
};
