
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

export type CurriculumType = 'standard' | 'cbc' | 'igcse';

export const useSchoolCurriculum = () => {
  const [curriculumType, setCurriculumType] = useState<CurriculumType>('standard');
  const [loading, setLoading] = useState(true);
  const { schoolId } = useSchoolScopedData();

  useEffect(() => {
    const fetchCurriculumType = async () => {
      if (!schoolId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('schools')
          .select('curriculum_type')
          .eq('id', schoolId)
          .single();

        if (error) {
          console.error('Error fetching curriculum type:', error);
          setCurriculumType('standard');
        } else {
          setCurriculumType((data?.curriculum_type as CurriculumType) || 'standard');
        }
      } catch (error) {
        console.error('Error fetching curriculum type:', error);
        setCurriculumType('standard');
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculumType();
  }, [schoolId]);

  return { curriculumType, loading };
};
