
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from './useSchoolScopedData';

interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  totalClasses: number;
  totalParents: number;
}

export const useSchoolAdminStats = (schoolId?: string) => {
  const { validateSchoolAccess } = useSchoolScopedData();

  const { data: stats, isLoading: loading, error } = useQuery({
    queryKey: ['school-admin-stats', schoolId],
    queryFn: async (): Promise<SchoolStats> => {
      if (!schoolId) {
        return {
          totalStudents: 0,
          totalTeachers: 0,
          totalSubjects: 0,
          totalClasses: 0,
          totalParents: 0
        };
      }

      // Validate school access
      if (!validateSchoolAccess(schoolId)) {
        throw new Error('Access denied to school data');
      }

      try {
        // Use Promise.allSettled to handle partial failures gracefully
        const [
          studentsResult,
          teachersResult,
          subjectsResult,
          classesResult,
          parentsResult
        ] = await Promise.allSettled([
          supabase
            .from('students')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .eq('is_active', true),
          supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .eq('role', 'teacher'),
          supabase
            .from('subjects')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', schoolId),
          supabase
            .from('classes')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', schoolId),
          supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .eq('role', 'parent')
        ]);

        const getCount = (result: PromiseSettledResult<any>): number => {
          if (result.status === 'fulfilled') {
            return result.value.count || 0;
          } else {
            console.warn('Failed to fetch count:', result.reason);
            return 0;
          }
        };

        return {
          totalStudents: getCount(studentsResult),
          totalTeachers: getCount(teachersResult),
          totalSubjects: getCount(subjectsResult),
          totalClasses: getCount(classesResult),
          totalParents: getCount(parentsResult)
        };
      } catch (error) {
        console.error('Error fetching school admin stats:', error);
        // Return zeros instead of throwing to prevent UI crashes
        return {
          totalStudents: 0,
          totalTeachers: 0,
          totalSubjects: 0,
          totalClasses: 0,
          totalParents: 0
        };
      }
    },
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry permission errors
      if (error?.message?.includes('Access denied')) {
        return false;
      }
      return failureCount < 2;
    }
  });

  return { 
    stats: stats || {
      totalStudents: 0,
      totalTeachers: 0,
      totalSubjects: 0,
      totalClasses: 0,
      totalParents: 0
    }, 
    loading: loading || false,
    error 
  };
};
