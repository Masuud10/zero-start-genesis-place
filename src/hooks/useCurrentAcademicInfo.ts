
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AcademicInfo {
  term: string | null;
  year: string | null;
  academicYear: string | null;
}

export const useCurrentAcademicInfo = (schoolId?: string | null) => {
  const [academicInfo, setAcademicInfo] = useState<AcademicInfo>({
    term: null,
    year: null,
    academicYear: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAcademicInfo = async () => {
      if (!schoolId) {
        // Set default values when no school
        setAcademicInfo({
          term: 'Term 1',
          year: new Date().getFullYear().toString(),
          academicYear: new Date().getFullYear().toString()
        });
        setLoading(false);
        return;
      }

      try {
        // Try to get current academic term
        const { data: termData } = await supabase
          .from('academic_terms')
          .select('term_name, academic_year_id')
          .eq('school_id', schoolId)
          .eq('is_current', true)
          .single();

        if (termData) {
          // Get academic year info
          const { data: yearData } = await supabase
            .from('academic_years')
            .select('year_name')
            .eq('id', termData.academic_year_id)
            .single();

          setAcademicInfo({
            term: termData.term_name,
            year: yearData?.year_name || new Date().getFullYear().toString(),
            academicYear: yearData?.year_name || new Date().getFullYear().toString()
          });
        } else {
          // Fallback to most recent term
          const { data: recentTerm } = await supabase
            .from('academic_terms')
            .select('term_name')
            .eq('school_id', schoolId)
            .order('start_date', { ascending: false })
            .limit(1)
            .single();

          setAcademicInfo({
            term: recentTerm?.term_name || 'Term 1',
            year: new Date().getFullYear().toString(),
            academicYear: new Date().getFullYear().toString()
          });
        }
      } catch (error) {
        console.error('Error fetching academic info:', error);
        // Set fallback values
        setAcademicInfo({
          term: 'Term 1',
          year: new Date().getFullYear().toString(),
          academicYear: new Date().getFullYear().toString()
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicInfo();
  }, [schoolId]);

  return { academicInfo, loading };
};
