
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AcademicInfo {
  term: string | null;
  year: string | null;
  academicYear: string | null;
}

const fetchCurrentAcademicInfo = async (schoolId: string): Promise<AcademicInfo> => {
  console.log('📅 Fetching current academic info for school:', schoolId);

  // Fetch current academic year
  const { data: currentYear } = await supabase
    .from('academic_years')
    .select('year_name')
    .eq('school_id', schoolId)
    .eq('is_current', true)
    .single();

  // Fetch current academic term
  const { data: currentTerm } = await supabase
    .from('academic_terms')
    .select('term_name')
    .eq('school_id', schoolId)
    .eq('is_current', true)
    .single();

  const result = {
    term: currentTerm?.term_name || null,
    year: currentYear?.year_name || null,
    academicYear: currentYear?.year_name || null,
  };

  console.log('📅 Current academic info:', result);
  return result;
};

export const useCurrentAcademicInfo = (schoolId: string | null) => {
  const query = useQuery({
    queryKey: ['currentAcademicInfo', schoolId],
    queryFn: () => fetchCurrentAcademicInfo(schoolId!),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });

  return {
    academicInfo: query.data || { term: null, year: null, academicYear: null },
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
