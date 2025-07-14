import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { detectCurriculumType, validateCurriculumType } from '@/utils/curriculum-detector';

export type CurriculumType = 'standard' | 'cbc' | 'igcse';

interface SchoolCurriculumData {
  id: string;
  name: string;
  curriculum_type?: string;
}

export const useSchoolCurriculum = () => {
  const [curriculumType, setCurriculumType] = useState<CurriculumType>('standard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolData, setSchoolData] = useState<SchoolCurriculumData | null>(null);
  const { schoolId } = useSchoolScopedData();

  const fetchCurriculumType = useCallback(async () => {
    if (!schoolId) {
      console.log('🎓 useSchoolCurriculum: No schoolId provided, using standard curriculum');
      setCurriculumType('standard');
      setLoading(false);
      setError(null);
      setSchoolData(null);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      console.log('🎓 useSchoolCurriculum: Fetching curriculum for school:', schoolId);

      // Get curriculum type from first class in school
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name, curriculum_type')
        .eq('school_id', schoolId)
        .limit(1)
        .single();

      if (classError) {
        console.error('❌ Error fetching curriculum type from classes:', classError);
        setError('Failed to fetch curriculum type');
        setCurriculumType('standard');
        setSchoolData(null);
        return;
      }

      if (!classData) {
        console.warn('⚠️ No classes found for school:', schoolId);
        setError('No classes found for this school');
        setCurriculumType('standard');
        setSchoolData(null);
        return;
      }

      const curriculumValue = classData.curriculum_type;
      
      console.log('🎓 useSchoolCurriculum: Class-based curriculum data:', {
        schoolId,
        className: classData.name,
        curriculum_type: classData.curriculum_type,
        resolvedValue: curriculumValue
      });

      if (!curriculumValue) {
        console.warn('⚠️ No curriculum type found in classes for school:', schoolId);
        setError('No curriculum type configured for this school');
        setCurriculumType('standard');
        setSchoolData(null);
        return;
      }

      const validation = validateCurriculumType(curriculumValue);
      
      if (!validation.isValid) {
        console.warn('⚠️ Invalid curriculum type in class:', validation.error);
        setError(validation.error || 'Invalid curriculum type');
        setCurriculumType('standard');
        setSchoolData(null);
        return;
      }

      const detectedType = detectCurriculumType(curriculumValue);
      console.log('🎓 useSchoolCurriculum: Final curriculum type:', {
        original: curriculumValue,
        detected: detectedType,
        validation: validation
      });
      
      setCurriculumType(detectedType as CurriculumType);
      setSchoolData({
        id: schoolId,
        name: classData.name,
        curriculum_type: classData.curriculum_type
      });
      setError(null);
    } catch (error) {
      console.error('❌ Error fetching curriculum type:', error);
      setError('Failed to fetch curriculum type');
      setCurriculumType('standard');
      setSchoolData(null);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchCurriculumType();
  }, [fetchCurriculumType]);

  // Function to refresh curriculum data
  const refreshCurriculum = useCallback(() => {
    fetchCurriculumType();
  }, [fetchCurriculumType]);

  return { 
    curriculumType, 
    loading, 
    error, 
    schoolData,
    refreshCurriculum 
  };
};
