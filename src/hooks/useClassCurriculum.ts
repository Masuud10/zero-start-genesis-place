import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { detectCurriculumType } from '@/utils/curriculum-detector';

export type CurriculumType = 'standard' | 'cbc' | 'igcse';

export const useClassCurriculum = (classId: string | null) => {
  const [curriculumType, setCurriculumType] = useState<CurriculumType>('standard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassCurriculum = async () => {
      if (!classId) {
        console.log('🎓 useClassCurriculum: No classId provided, using standard curriculum');
        setCurriculumType('standard');
        setLoading(false);
        return;
      }

      try {
        setError(null);
        setLoading(true);

        console.log('🎓 useClassCurriculum: Fetching curriculum for class:', classId);

        // Get curriculum type from the specific class
        const { data, error: fetchError } = await supabase
          .from('classes')
          .select('curriculum_type, curriculum, name')
          .eq('id', classId)
          .single();

        if (fetchError) {
          console.error('❌ Error fetching class curriculum type:', fetchError);
          setError('Failed to fetch class curriculum type');
          setCurriculumType('standard');
        } else {
          // Check both curriculum_type and curriculum fields
          const curriculumValue = data?.curriculum_type || data?.curriculum;
          
          console.log('🎓 useClassCurriculum: Raw curriculum data:', {
            classId,
            className: data?.name,
            curriculum_type: data?.curriculum_type,
            curriculum: data?.curriculum,
            resolvedValue: curriculumValue
          });
          
          if (!curriculumValue) {
            console.warn('⚠️ No curriculum type assigned to class:', classId);
            setError('No curriculum type assigned to this class');
            setCurriculumType('standard');
          } else {
            const detectedType = detectCurriculumType(curriculumValue);
            console.log('🎓 useClassCurriculum: Detected curriculum type:', {
              original: curriculumValue,
              detected: detectedType
            });
            
            if (detectedType === 'standard' && curriculumValue.toLowerCase() !== 'standard') {
              // If we got 'standard' but the value wasn't actually 'standard', it might be unrecognized
              const errorMsg = `Unrecognized curriculum type: ${curriculumValue}. Please update to a valid type (cbc, igcse, standard)`;
              console.warn('⚠️', errorMsg);
              setError(errorMsg);
            }
            setCurriculumType(detectedType as CurriculumType);
          }
        }
      } catch (error) {
        console.error('❌ Error in useClassCurriculum:', error);
        setError('Failed to fetch class curriculum type');
        setCurriculumType('standard');
      } finally {
        setLoading(false);
      }
    };

    fetchClassCurriculum();
  }, [classId]);

  return { curriculumType, loading, error };
}; 