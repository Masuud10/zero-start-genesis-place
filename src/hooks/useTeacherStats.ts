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

      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          // Step 1: Get teacher's assigned classes
          const { data: teacherClassesData, error: classesError } = await supabase
            .from('subject_teacher_assignments')
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
            .eq('is_active', true)
            .not('class_id', 'is', null);

          if (classesError) {
            console.error('Error fetching teacher classes:', classesError);
            throw classesError;
          }

          const teacherClasses = teacherClassesData || [];
          const classIds = teacherClasses.map(tc => tc.class_id).filter(Boolean);

          // Step 2: Get unique subjects for this teacher
          const { data: subjectsData, error: subjectsError } = await supabase
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
            .not('subject_id', 'is', null);

          if (subjectsError) {
            console.error('Error fetching subjects:', subjectsError);
            throw subjectsError;
          }

          // Get unique subjects
          const uniqueSubjects = subjectsData
            ?.map(s => s.subjects)
            .filter(Boolean)
            .filter((subject, index, self) => 
              index === self.findIndex(s => s.id === subject.id)
            ) || [];

          // Step 3: Get student count for assigned classes
          let studentCount = 0;
          const classesWithCounts = [];
          
          if (classIds.length > 0) {
            const studentCountPromises = classIds.map(async (classId) => {
              const { count } = await supabase
                .from('students')
                .select('*', { count: 'exact', head: true })
                .eq('class_id', classId)
                .eq('school_id', schoolId)
                .eq('is_active', true);
              return { classId, count: count || 0 };
            });

            const studentCounts = await Promise.all(studentCountPromises);
            
            for (const { classId, count } of studentCounts) {
              const classItem = teacherClasses.find(tc => tc.class_id === classId);
              studentCount += count;
              classesWithCounts.push({
                id: classId,
                name: classItem?.classes?.name || 'Unknown Class',
                student_count: count
              });
            }
          }

          // Step 4: Get today's attendance count
          const { count: todayAttendanceCount, error: attendanceError } = await supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('submitted_by', user.id)
            .eq('date', new Date().toISOString().split('T')[0])
            .eq('school_id', schoolId);

          if (attendanceError) {
            console.error('Error fetching today\'s attendance:', attendanceError);
          }

          // Step 5: Get grade statistics for teacher's assigned classes
          let pendingGrades = 0;
          let submittedGrades = 0;
          let approvedGrades = 0;

          if (classIds.length > 0) {
            const { data: gradeData, error: gradeError } = await supabase
              .from('grades')
              .select('status')
              .eq('submitted_by', user.id)
              .eq('school_id', schoolId)
              .in('class_id', classIds);

            if (!gradeError && gradeData) {
              pendingGrades = gradeData.filter(g => ['draft', 'submitted'].includes(g.status)).length;
              submittedGrades = gradeData.filter(g => g.status === 'submitted').length;
              approvedGrades = gradeData.filter(g => g.status === 'approved').length;
            }
          }

          // Step 6: Calculate attendance percentage for last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const { data: attendanceData, error: attendanceDataError } = await supabase
            .from('attendance')
            .select('status')
            .eq('submitted_by', user.id)
            .eq('school_id', schoolId)
            .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
            .limit(1000);

          // Add warning if data might be truncated
          if (attendanceData && attendanceData.length === 1000) {
            console.warn('⚠️ Attendance data may be truncated (1000 records fetched)');
          }

          let attendancePercentage = 0;
          if (!attendanceDataError && attendanceData && attendanceData.length > 0) {
            const presentCount = attendanceData.filter(a => a.status === 'present').length;
            attendancePercentage = Math.round((presentCount / attendanceData.length) * 100);
          }

          const stats: TeacherStats = {
            classCount: teacherClasses.length,
            studentCount,
            subjectCount: uniqueSubjects.length,
            todayAttendance: todayAttendanceCount || 0,
            pendingGrades,
            submittedGrades,
            approvedGrades,
            attendancePercentage,
            classes: classesWithCounts,
            subjects: uniqueSubjects.map(s => ({
              id: s.id || '',
              name: s.name || '',
              code: s.code || ''
            }))
          };

          // Add warning if all metrics are zero (possible data issue)
          if (stats.classCount === 0 && stats.studentCount === 0 && stats.subjectCount === 0) {
            console.warn('⚠️ All teacher metrics are zero - possible data or assignment issue');
          }

          console.log('📊 Teacher stats compiled:', stats);
          return stats;

        } catch (error) {
          attempts++;
          console.error(`Error in useTeacherStats (attempt ${attempts}/${maxAttempts}):`, error);
          
          // If this is the last attempt, throw the error
          if (attempts >= maxAttempts) {
            throw error;
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
        }
      }

      // This should never be reached, but TypeScript requires it
      throw new Error('Failed to fetch teacher stats after all retry attempts');
    },
    enabled: !!user?.id && !!schoolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    retry: 1, // Let our custom retry logic handle it
    retryDelay: 2000,
  });
};
