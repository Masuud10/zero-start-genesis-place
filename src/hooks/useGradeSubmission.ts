
import { useState } from 'react';
import { useAnalyticsTracking } from './useAnalyticsTracking';
import { supabase } from '@/integrations/supabase/client';

export const useGradeSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { trackGradeSubmission } = useAnalyticsTracking();

  const submitGrade = async (gradeData: any) => {
    setIsSubmitting(true);
    try {
      // Submit grade to database
      const { data, error } = await supabase
        .from('grades')
        .insert(gradeData)
        .select()
        .single();

      if (error) throw error;

      // Track the grade submission event
      await trackGradeSubmission({
        student_id: gradeData.student_id,
        subject_id: gradeData.subject_id,
        score: gradeData.score,
        max_score: gradeData.max_score,
        exam_type: gradeData.exam_type,
        term: gradeData.term
      });

      return { success: true, data };
    } catch (error) {
      console.error('Grade submission failed:', error);
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitGrade,
    isSubmitting
  };
};
