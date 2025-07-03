import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from './useSchoolScopedData';

export interface TeacherStats {
  classCount: number;
  studentCount: number;
  subjectCount: number;
  todayAttendance: number;
  pendingGrades: number;
  submittedGrades: number;
  approvedGrades: number;
  attendancePercentage: number;
  classes: Array<{
    id: string;
    name: string;
    student_count: number;
  }>;
  subjects: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

export const useTeacherStats = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();

  return useQuery({
    queryKey: ['teacher-stats', user?.id, schoolId],
    queryFn: async (): Promise<TeacherStats> => {
      if (!user?.id || !schoolId) {
        throw new Error('User ID and School ID are required');
      }

      console.log('🔍 Fetching teacher stats for:', { userId: user.id, schoolId });

      // Set up timeout control
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('🔍 Teacher stats query timed out');
      }, 8000); // 8 second timeout

      try {
        // Optimized parallel queries
        const [teacherClassesResult, subjectsResult, todayAttendanceResult, gradeStatsResult, attendanceDataResult] = await Promise.allSettled([
          // Get teacher's assigned classes
          supabase
            .from('teacher_classes')
            .select(`
              class_id,
              classes!inner(
                id,
                name,
                level,
                stream
              )
            `)
            .eq('teacher_id', user.id)
            .eq('school_id', schoolId)
            .abortSignal(controller.signal),

          // Get teacher's subjects
          supabase
            .from('subject_teacher_assignments')
            .select(`
              subject_id,
              subjects!inner(
                id,
                name,
                code
              )
            `)
            .eq('teacher_id', user.id)
            .eq('school_id', schoolId)
            .eq('is_active', true)
            .abortSignal(controller.signal),

          // Get today's attendance submissions
          supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('submitted_by', user.id)
            .eq('date', new Date().toISOString().split('T')[0])
            .eq('school_id', schoolId)
            .abortSignal(controller.signal),

          // Get grade statistics in one query
          supabase
            .from('grades')
            .select('status')
            .eq('submitted_by', user.id)
            .eq('school_id', schoolId)
            .abortSignal(controller.signal),

          // Get attendance data for percentage calculation
          supabase
            .from('attendance')
            .select('status, class_id')
            .eq('submitted_by', user.id)
            .eq('school_id', schoolId)
            .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
            .limit(1000)
            .abortSignal(controller.signal)
        ]);

        clearTimeout(timeoutId);

        // Process teacher classes
        const teacherClasses = teacherClassesResult.status === 'fulfilled' ? teacherClassesResult.value.data : [];
        const classIds = teacherClasses?.map(tc => tc.class_id) || [];

        // Get student count across all classes efficiently
        let studentCount = 0;
        const classesWithCounts = [];
        
        if (classIds.length > 0) {
          const studentCountPromises = classIds.map(async (classId) => {
            const { count } = await supabase
              .from('students')
              .select('*', { count: 'exact', head: true })
              .eq('class_id', classId)
              .eq('is_active', true);
            return { classId, count: count || 0 };
          });

          const studentCounts = await Promise.all(studentCountPromises);
          
          for (const { classId, count } of studentCounts) {
            const classItem = teacherClasses?.find(tc => tc.class_id === classId);
            studentCount += count;
            classesWithCounts.push({
              id: classId,
              name: classItem?.classes?.name || 'Unknown',
              student_count: count
            });
          }
        }

        // Process subjects
        const subjects = subjectsResult.status === 'fulfilled' ? subjectsResult.value.data : [];

        // Process today's attendance
        const todayAttendance = todayAttendanceResult.status === 'fulfilled' ? (todayAttendanceResult.value.count || 0) : 0;

        // Process grade statistics
        const gradeData = gradeStatsResult.status === 'fulfilled' ? gradeStatsResult.value.data : [];
        const pendingGrades = gradeData.filter(g => ['draft', 'submitted'].includes(g.status)).length;
        const submittedGrades = gradeData.filter(g => g.status === 'submitted').length;
        const approvedGrades = gradeData.filter(g => g.status === 'approved').length;

        // Calculate attendance percentage
        const attendanceData = attendanceDataResult.status === 'fulfilled' ? attendanceDataResult.value.data : [];
        const presentCount = attendanceData.filter(a => a.status === 'present').length;
        const attendancePercentage = attendanceData.length > 0 ? Math.round((presentCount / attendanceData.length) * 100) : 0;

        const stats: TeacherStats = {
          classCount: teacherClasses?.length || 0,
          studentCount,
          subjectCount: subjects?.length || 0,
          todayAttendance,
          pendingGrades,
          submittedGrades,
          approvedGrades,
          attendancePercentage,
          classes: classesWithCounts,
          subjects: subjects?.map(s => ({
            id: s.subjects?.id || '',
            name: s.subjects?.name || '',
            code: s.subjects?.code || ''
          })) || []
        };

        console.log('📊 Teacher stats compiled:', stats);
        return stats;

      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Teacher stats query timed out');
        }
        throw error;
      }
    },
    enabled: !!user?.id && !!schoolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Reduce unnecessary refetches
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    retry: 1, // Only retry once to avoid overwhelming the database
    retryDelay: 2000,
  });
};
