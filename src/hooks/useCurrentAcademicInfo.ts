
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AcademicInfo {
  year: string | null;
  term: string | null;
}

export const useCurrentAcademicInfo = (schoolId?: string) => {
  const [academicInfo, setAcademicInfo] = useState<AcademicInfo>({ year: null, term: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId) {
      setLoading(false);
      return;
    }

    const fetchAcademicInfo = async () => {
      setLoading(true);
      setError(null);
      try {
        const yearPromise = supabase
          .from('academic_years')
          .select('year_name')
          .eq('school_id', schoolId)
          .eq('is_current', true)
          .maybeSingle();

        const termPromise = supabase
          .from('academic_terms')
          .select('term_name')
          .eq('school_id', schoolId)
          .eq('is_current', true)
          .maybeSingle();

        const [yearResult, termResult] = await Promise.all([yearPromise, termPromise]);

        if (yearResult.error) throw new Error(`Could not fetch current academic year: ${yearResult.error.message}`);
        if (termResult.error) throw new Error(`Could not fetch current academic term: ${termResult.error.message}`);

        const year = yearResult.data?.year_name || null;
        const term = termResult.data?.term_name || null;

        if (!year || !term) {
            setError('Current academic year or term is not set for this school. Please contact administration.');
        }

        setAcademicInfo({ year, term });

      } catch (err: any) {
        setError(err.message);
        setAcademicInfo({ year: null, term: null });
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicInfo();
  }, [schoolId]);

  return { academicInfo, loading, error };
};
