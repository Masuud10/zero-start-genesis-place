import { useState } from 'react';
import { useAnalyticsTracking } from './useAnalyticsTracking';
import { auditLogger } from '@/utils/auditLogger';
import { rateLimiter, RateLimiter } from '@/utils/rateLimiter';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { withDatabaseRetry } from '@/utils/enhancedErrorHandler';

export const useGradeSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { trackGradeSubmission } = useAnalyticsTracking();
  const { user } = useAuth();

  const submitGrade = async (gradeData: any) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // CRITICAL: Validate required fields and business rules
    if (!gradeData.student_id || !gradeData.subject_id || !gradeData.class_id) {
      return { success: false, error: 'Student ID, Subject ID, and Class ID are required' };
    }

    if (gradeData.score !== undefined && gradeData.score !== null) {
      if (isNaN(gradeData.score) || gradeData.score < 0) {
        return { success: false, error: 'Score must be a valid positive number' };
      }

      if (gradeData.max_score && gradeData.score > gradeData.max_score) {
        return { success: false, error: 'Score cannot exceed maximum score' };
      }
    }

    if (!gradeData.term || !gradeData.exam_type) {
      return { success: false, error: 'Term and exam type are required' };
    }

    // Check rate limiting for grade submissions
    const rateLimit = rateLimiter.checkLimit({
      ...RateLimiter.GRADE_SUBMISSION_LIMIT,
      identifier: `grade_submit_${user.id}`
    });

    if (!rateLimit.allowed) {
      const resetSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      const error = `Rate limit exceeded. Please wait ${resetSeconds} seconds before submitting another grade.`;
      
      await auditLogger.logGradeSubmission(user.id, gradeData, false, error);
      return { success: false, error };
    }

    setIsSubmitting(true);
    try {
      // CRITICAL FIX: Verify class belongs to user's school and user has permission
      const classQuery = await withDatabaseRetry(
        () => supabase
          .from('classes')
          .select('school_id, name, teacher_id')
          .eq('id', gradeData.class_id)
          .single(),
        'fetch_class_for_grade'
      );

      if (classQuery.error) {
        throw new Error(`Class not found: ${classQuery.error.message}`);
      }

      const classData = classQuery.data;
      if (!classData?.school_id) {
        throw new Error("Could not find school for the class");
      }

      // SECURITY: Verify user has permission to submit grades for this class
      const hasPermission = 
        user.role === 'edufam_admin' || 
        user.role === 'elimisha_admin' ||
        (user.school_id === classData.school_id && 
         (user.role === 'teacher' || user.role === 'principal')) ||
        (user.role === 'teacher' && classData.teacher_id === user.id);

      if (!hasPermission) {
        throw new Error("Access denied: You don't have permission to submit grades for this class");
      }

      // CRITICAL: Verify student belongs to the specified class
      const studentQuery = await withDatabaseRetry(
        () => supabase
          .from('students')
          .select('class_id, name, admission_number')
          .eq('id', gradeData.student_id)
          .eq('class_id', gradeData.class_id)
          .single(),
        'verify_student_class'
      );

      if (studentQuery.error) {
        throw new Error("Student not found in the specified class");
      }

      // BUSINESS LOGIC: Calculate percentage if score and max_score provided
      let calculatedPercentage = null;
      if (gradeData.score !== undefined && gradeData.max_score && gradeData.max_score > 0) {
        calculatedPercentage = Math.round((gradeData.score / gradeData.max_score) * 100 * 100) / 100; // Round to 2 decimals
      }

      const completeGradeData = {
        ...gradeData,
        school_id: classData.school_id,
        submitted_by: user.id,
        submitted_at: new Date().toISOString(),
        status: user.role === 'principal' ? 'approved' : 'submitted', // Auto-approve for principals
        percentage: calculatedPercentage,
        score: gradeData.score ? Number(gradeData.score) : null,
        max_score: gradeData.max_score ? Number(gradeData.max_score) : null,
      };

      // Check for duplicate grade submission
      const existingGradeQuery = await withDatabaseRetry(
        () => supabase
          .from('grades')
          .select('id')
          .eq('student_id', gradeData.student_id)
          .eq('subject_id', gradeData.subject_id)
          .eq('term', gradeData.term)
          .eq('exam_type', gradeData.exam_type)
          .maybeSingle(),
        'check_duplicate_grade'
      );

      if (existingGradeQuery.data) {
        // Update existing grade instead of creating duplicate
        const { data: updatedGrade, error: updateError } = await withDatabaseRetry(
          () => supabase
            .from('grades')
            .update(completeGradeData)
            .eq('id', existingGradeQuery.data.id)
            .select()
            .single(),
          'update_existing_grade'
        );

        if (updateError) throw updateError;

        await auditLogger.logGradeSubmission(user.id, completeGradeData, true, 'Grade updated');
        return { 
          success: true, 
          data: updatedGrade,
          message: `Grade updated successfully for ${studentQuery.data.name}`
        };
      }

      // Submit new grade to database
      const { data: newGrade, error: insertError } = await withDatabaseRetry(
        () => supabase
          .from('grades')
          .insert(completeGradeData)
          .select()
          .single(),
        'insert_new_grade'
      );

      if (insertError) throw insertError;

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
      await auditLogger.logGradeSubmission(user.id, completeGradeData, true);

      return { 
        success: true, 
        data: newGrade,
        message: `Grade submitted successfully for ${studentQuery.data.name}`
      };
    } catch (error: any) {
      console.error('Grade submission failed:', error);
      
      // Log failed grade submission
      await auditLogger.logGradeSubmission(user.id, gradeData, false, error.message);
      
      return { 
        success: false, 
        error: error.message || 'Grade submission failed',
        details: error
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitGrade,
    isSubmitting
  };
};