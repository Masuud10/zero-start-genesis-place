
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

      // Try to get current academic term
      const { data: terms } = await supabase
        .from('academic_terms')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_current', true)
        .single();

      if (terms) {
        return {
          term: terms.term_name,
          year: terms.academic_year_id,
          academicYear: terms.academic_year_id
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
    isLoading
  };
};
