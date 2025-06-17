
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSchoolAdminStats = (schoolId?: string) => {
  const { data: stats, isLoading: loading } = useQuery({
    queryKey: ['school-admin-stats', schoolId],
    queryFn: async () => {
      if (!schoolId) {
        return {
          totalStudents: 0,
          totalTeachers: 0,
          totalSubjects: 0,
          totalClasses: 0,
          totalParents: 0
        };
      }

      try {
        // Fetch all stats in parallel
        const [
          studentsResult,
          teachersResult,
          subjectsResult,
          classesResult,
          parentsResult
        ] = await Promise.allSettled([
          supabase.from('students').select('id', { count: 'exact' }).eq('school_id', schoolId).eq('is_active', true),
          supabase.from('profiles').select('id', { count: 'exact' }).eq('school_id', schoolId).eq('role', 'teacher'),
          supabase.from('subjects').select('id', { count: 'exact' }).eq('school_id', schoolId),
          supabase.from('classes').select('id', { count: 'exact' }).eq('school_id', schoolId),
          supabase.from('profiles').select('id', { count: 'exact' }).eq('school_id', schoolId).eq('role', 'parent')
        ]);

        return {
          totalStudents: studentsResult.status === 'fulfilled' ? (studentsResult.value.count || 0) : 0,
          totalTeachers: teachersResult.status === 'fulfilled' ? (teachersResult.value.count || 0) : 0,
          totalSubjects: subjectsResult.status === 'fulfilled' ? (subjectsResult.value.count || 0) : 0,
          totalClasses: classesResult.status === 'fulfilled' ? (classesResult.value.count || 0) : 0,
          totalParents: parentsResult.status === 'fulfilled' ? (parentsResult.value.count || 0) : 0
        };
      } catch (error) {
        console.error('Error fetching school admin stats:', error);
        return {
          totalStudents: 0,
          totalTeachers: 0,
          totalSubjects: 0,
          totalClasses: 0,
          totalParents: 0
        };
      }
    },
    enabled: !!schoolId
  });

  return { stats: stats || {
    totalStudents: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    totalClasses: 0,
    totalParents: 0
  }, loading };
};
