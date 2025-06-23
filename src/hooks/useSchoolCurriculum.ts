
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type CurriculumType = 'cbc' | 'igcse' | 'standard';

interface UseSchoolCurriculumReturn {
  curriculumType: CurriculumType;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSchoolCurriculum = (): UseSchoolCurriculumReturn => {
  const { user } = useAuth();
  const [curriculumType, setCurriculumType] = useState<CurriculumType>('standard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchoolCurriculum = async () => {
    if (!user?.school_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🎓 Fetching curriculum for school:', user.school_id);

      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('curriculum_type')
        .eq('id', user.school_id)
        .single();

      if (schoolError) {
        console.error('Error fetching school curriculum:', schoolError);
        setError('Failed to fetch school curriculum type');
        setCurriculumType('standard'); // fallback
        return;
      }

      // Map database values to our curriculum types
      const dbCurriculumType = school?.curriculum_type?.toLowerCase();
      let detectedCurriculum: CurriculumType = 'standard';

      if (dbCurriculumType === 'cbc') {
        detectedCurriculum = 'cbc';
      } else if (dbCurriculumType === 'igcse') {
        detectedCurriculum = 'igcse';
      } else if (dbCurriculumType === 'standard' || dbCurriculumType === 'traditional') {
        detectedCurriculum = 'standard';
      }

      console.log('🎓 School curriculum detected:', detectedCurriculum, 'from DB value:', dbCurriculumType);
      setCurriculumType(detectedCurriculum);

    } catch (err: any) {
      console.error('Error in fetchSchoolCurriculum:', err);
      setError(err.message || 'Failed to fetch curriculum type');
      setCurriculumType('standard'); // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolCurriculum();
  }, [user?.school_id]);

  return {
    curriculumType,
    loading,
    error,
    refetch: fetchSchoolCurriculum
  };
};
