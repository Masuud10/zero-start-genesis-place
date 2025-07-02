
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

export type CurriculumType = 'standard' | 'cbc' | 'igcse';

export const useSchoolCurriculum = () => {
  const [curriculumType, setCurriculumType] = useState<CurriculumType>('standard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { schoolId } = useSchoolScopedData();

  useEffect(() => {
    const fetchCurriculumType = async () => {
      if (!schoolId) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        // Get curriculum type from first class in school since it's now class-level
        const { data, error: fetchError } = await supabase
          .from('classes')
          .select('curriculum_type')
          .eq('school_id', schoolId)
          .limit(1)
          .single();

        if (fetchError) {
          console.error('Error fetching curriculum type from classes:', fetchError);
          setError('Failed to fetch curriculum type');
          setCurriculumType('standard');
        } else {
          setCurriculumType((data?.curriculum_type as CurriculumType) || 'standard');
        }
      } catch (error) {
        console.error('Error fetching curriculum type:', error);
        setError('Failed to fetch curriculum type');
        setCurriculumType('standard');
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculumType();
  }, [schoolId]);

  return { curriculumType, loading, error };
};
