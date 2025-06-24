
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
  const { validateSchoolAccess, isReady } = useSchoolScopedData();

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
        console.log('📊 Fetching school admin stats for:', schoolId);

        // Fetch students count
        let studentsCount = 0;
        try {
          const { count } = await supabase
            .from('students')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .eq('is_active', true);
          studentsCount = count || 0;
        } catch (err) {
          console.warn('Failed to fetch students count:', err);
        }

        // Fetch teachers count
        let teachersCount = 0;
        try {
          const { count } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .eq('role', 'teacher');
          teachersCount = count || 0;
        } catch (err) {
          console.warn('Failed to fetch teachers count:', err);
        }

        // Fetch subjects count
        let subjectsCount = 0;
        try {
          const { count } = await supabase
            .from('subjects')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', schoolId);
          subjectsCount = count || 0;
        } catch (err) {
          console.warn('Failed to fetch subjects count:', err);
        }

        // Fetch classes count
        let classesCount = 0;
        try {
          const { count } = await supabase
            .from('classes')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', schoolId);
          classesCount = count || 0;
        } catch (err) {
          console.warn('Failed to fetch classes count:', err);
        }

        // Fetch parents count
        let parentsCount = 0;
        try {
          const { count } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('school_id', schoolId)
            .eq('role', 'parent');
          parentsCount = count || 0;
        } catch (err) {
          console.warn('Failed to fetch parents count:', err);
        }

        const statsData = {
          totalStudents: studentsCount,
          totalTeachers: teachersCount,
          totalSubjects: subjectsCount,
          totalClasses: classesCount,
          totalParents: parentsCount
        };

        console.log('📊 School admin stats:', statsData);
        return statsData;

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
    enabled: !!schoolId && isReady,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once
    refetchOnWindowFocus: false
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
