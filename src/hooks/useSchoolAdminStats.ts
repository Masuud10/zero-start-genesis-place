
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

        // Simplified sequential fetching with individual error handling
        const queries = [
          { name: 'students', table: 'students', filters: { school_id: schoolId, is_active: true } },
          { name: 'teachers', table: 'profiles', filters: { school_id: schoolId, role: 'teacher' } },
          { name: 'subjects', table: 'subjects', filters: { school_id: schoolId } },
          { name: 'classes', table: 'classes', filters: { school_id: schoolId } },
          { name: 'parents', table: 'profiles', filters: { school_id: schoolId, role: 'parent' } }
        ];

        const results: Record<string, number> = {};

        for (const { name, table, filters } of queries) {
          try {
            let query = supabase.from(table).select('id', { count: 'exact', head: true });
            
            // Apply filters
            Object.entries(filters).forEach(([key, value]) => {
              query = query.eq(key, value);
            });

            const { count, error } = await query;
            
            if (error) {
              console.warn(`Failed to fetch ${name}:`, error);
              results[name] = 0;
            } else {
              results[name] = count || 0;
            }
          } catch (err) {
            console.warn(`Exception fetching ${name}:`, err);
            results[name] = 0;
          }
        }

        const statsData = {
          totalStudents: results.students,
          totalTeachers: results.teachers,
          totalSubjects: results.subjects,
          totalClasses: results.classes,
          totalParents: results.parents
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
