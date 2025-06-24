
import { useCallback } from 'react';
import { useAuditLogger } from './useAuditLogger';
import { useAuth } from '@/contexts/AuthContext';

export const useGradeAuditLogger = () => {
  const { logGradeAction } = useAuditLogger();
  const { user } = useAuth();

  const logGradeSubmission = useCallback(async (gradeData: any, success: boolean, error?: string) => {
    if (!user) return;

    try {
      await logGradeAction(
        success ? 'Submit' : 'Submit Failed',
        gradeData.student_id,
        null,
        {
          score: gradeData.score,
          max_score: gradeData.max_score,
          subject_id: gradeData.subject_id,
          class_id: gradeData.class_id,
          term: gradeData.term,
          exam_type: gradeData.exam_type,
          success,
          error
        }
      );
    } catch (auditError) {
      console.error('Failed to log grade submission:', auditError);
    }
  }, [logGradeAction, user]);

  const logGradeApproval = useCallback(async (gradeIds: string[], action: string) => {
    if (!user) return;

    try {
      await logGradeAction(
        `Bulk ${action}`,
        `${gradeIds.length} grades`,
        null,
        {
          grade_ids: gradeIds,
          action,
          bulk_operation: true
        }
      );
    } catch (auditError) {
      console.error('Failed to log grade approval:', auditError);
    }
  }, [logGradeAction, user]);

  const logGradeEdit = useCallback(async (gradeId: string, oldValue: any, newValue: any) => {
    if (!user) return;

    try {
      await logGradeAction(
        'Edit',
        gradeId,
        oldValue,
        newValue
      );
    } catch (auditError) {
      console.error('Failed to log grade edit:', auditError);
    }
  }, [logGradeAction, user]);

  return {
    logGradeSubmission,
    logGradeApproval,
    logGradeEdit
  };
};
