
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

      // Get teacher's assigned classes
      const { data: teacherClasses, error: classesError } = await supabase
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
        .eq('school_id', schoolId);

      if (classesError) {
        console.error('Error fetching teacher classes:', classesError);
        throw classesError;
      }

      const classIds = teacherClasses?.map(tc => tc.class_id) || [];
      console.log('📚 Teacher classes found:', classIds.length);

      // Get student count across all classes
      let studentCount = 0;
      const classesWithCounts = [];
      
      if (classIds.length > 0) {
        for (const classItem of teacherClasses || []) {
          const { count } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', classItem.class_id)
            .eq('is_active', true);
          
          const classCount = count || 0;
          studentCount += classCount;
          classesWithCounts.push({
            id: classItem.class_id,
            name: classItem.classes?.name || 'Unknown',
            student_count: classCount
          });
        }
      }

      // Get teacher's subjects
      const { data: subjects, error: subjectsError } = await supabase
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
        .eq('is_active', true);

      if (subjectsError) {
        console.error('Error fetching teacher subjects:', subjectsError);
      }

      // Get today's attendance submissions
      const today = new Date().toISOString().split('T')[0];
      const { count: todayAttendance } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('submitted_by', user.id)
        .eq('date', today)
        .eq('school_id', schoolId);

      // Get grade statistics
      const { count: pendingGrades } = await supabase
        .from('grades')
        .select('*', { count: 'exact', head: true })
        .eq('submitted_by', user.id)
        .eq('school_id', schoolId)
        .in('status', ['draft', 'submitted']);

      const { count: submittedGrades } = await supabase
        .from('grades')
        .select('*', { count: 'exact', head: true })
        .eq('submitted_by', user.id)
        .eq('school_id', schoolId)
        .eq('status', 'submitted');

      const { count: approvedGrades } = await supabase
        .from('grades')
        .select('*', { count: 'exact', head: true })
        .eq('submitted_by', user.id)
        .eq('school_id', schoolId)
        .eq('status', 'approved');

      // Calculate overall attendance percentage for teacher's classes
      let attendancePercentage = 0;
      if (classIds.length > 0) {
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('status')
          .in('class_id', classIds)
          .eq('school_id', schoolId)
          .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Last 30 days

        if (attendanceData && attendanceData.length > 0) {
          const presentCount = attendanceData.filter(a => a.status === 'present').length;
          // Fixed: Enhanced attendance calculation with proper validation
          attendancePercentage = attendanceData.length > 0 && presentCount >= 0
            ? Math.round((presentCount / attendanceData.length) * 100)
            : 0;
        }
      }

      const stats: TeacherStats = {
        classCount: teacherClasses?.length || 0,
        studentCount,
        subjectCount: subjects?.length || 0,
        todayAttendance: todayAttendance || 0,
        pendingGrades: pendingGrades || 0,
        submittedGrades: submittedGrades || 0,
        approvedGrades: approvedGrades || 0,
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
    },
    enabled: !!user?.id && !!schoolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};
