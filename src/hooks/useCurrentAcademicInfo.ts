
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCurrentAcademicInfo = (schoolId: string | null) => {
  const { data: academicInfo, isLoading } = useQuery({
    queryKey: ['academic-info', schoolId],
    queryFn: async () => {
      if (!schoolId) {
        return {
          term: 'Term 1',
          year: new Date().getFullYear().toString(),
          academicYear: `${new Date().getFullYear()}`
        };
      }

      // Try to get current academic term with academic year name
      const { data: terms, error } = await supabase
        .from('academic_terms')
        .select(`
          *,
          academic_years!inner(
            year_name
          )
        `)
        .eq('school_id', schoolId)
        .eq('is_current', true)
        .maybeSingle(); // Use maybeSingle to handle no results gracefully

      // Log error for debugging but don't throw
      if (error) {
        console.warn('Error fetching academic terms:', error);
      }

      if (terms && terms.academic_years) {
        return {
          term: terms.term_name,
          year: terms.academic_years.year_name,
          academicYear: terms.academic_years.year_name
        };
      }

      // Fallback: try to get current academic year directly
      const { data: currentYear } = await supabase
        .from('academic_years')
        .select('year_name')
        .eq('school_id', schoolId)
        .eq('is_current', true)
        .maybeSingle();

      if (currentYear) {
        return {
          term: 'Term 1',
          year: currentYear.year_name,
          academicYear: currentYear.year_name
        };
      }

      // Fallback to default values
      return {
        term: 'Term 1',
        year: new Date().getFullYear().toString(),
        academicYear: `${new Date().getFullYear()}`
      };
    },
    enabled: true
  });

  return {
    academicInfo: academicInfo || {
      term: 'Term 1',
      year: new Date().getFullYear().toString(),
      academicYear: `${new Date().getFullYear()}`
    },
    isLoading,
    loading: isLoading
  };
};
