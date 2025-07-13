
import { useState } from 'react';
import { useAnalyticsTracking } from './useAnalyticsTracking';
import { useGradeAuditLogger } from './useGradeAuditLogger';
import { rateLimiter, RateLimiter } from '@/utils/rateLimiter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useGradeSubmissionWithAudit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { trackGradeSubmission } = useAnalyticsTracking();
  const { logGradeSubmission } = useGradeAuditLogger();
  const { user } = useAuth();

  const submitGrade = async (gradeData: any) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Check rate limiting for grade submissions
    const rateLimit = rateLimiter.checkLimit({
      ...RateLimiter.GRADE_SUBMISSION_LIMIT,
      identifier: `grade_submit_${user.id}`
    });

    if (!rateLimit.allowed) {
      const resetSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      const error = `Rate limit exceeded. Please wait ${resetSeconds} seconds before submitting another grade.`;
      
      // Log failed attempt
      await logGradeSubmission(gradeData, false, error);
      return { success: false, error };
    }

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
        max_score: gradeData.max_score || 100,
        exam_type: gradeData.exam_type,
        term: gradeData.term
      });

      // Log successful grade submission
      await logGradeSubmission(completeGradeData, true);

      return { success: true, data };
    } catch (error: any) {
      console.error('Grade submission failed:', error);
      
      // Log failed grade submission
      await logGradeSubmission(gradeData, false, error.message);
      
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
