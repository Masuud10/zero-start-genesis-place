
import { useState } from 'react';
import { useAnalyticsTracking } from './useAnalyticsTracking';
import { supabase } from '@/integrations/supabase/client';

export const useGradeSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { trackGradeSubmission } = useAnalyticsTracking();

  const submitGrade = async (gradeData: any) => {
    setIsSubmitting(true);
    try {
      if (!gradeData.class_id) {
        throw new Error("class_id is required to submit a grade");
      }

      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('school_id')
        .eq('id', gradeData.class_id)
        .single();

      if (classError) throw classError;
      if (!classData?.school_id) throw new Error("Could not find school for the class");
      
      const completeGradeData = {
        ...gradeData,
        school_id: classData.school_id,
      };

      // Submit grade to database
      const { data, error } = await supabase
        .from('grades')
        .insert(completeGradeData)
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
