
import { useCallback } from 'react';
import { auditLogService } from '@/services/auditLogService';

export const useAuditLogger = () => {
  const logAction = useCallback(async (
    action: string,
    targetEntity?: string,
    oldValue?: any,
    newValue?: any,
    metadata?: any
  ) => {
    try {
      await auditLogService.logAction({
        action,
        target_entity: targetEntity,
        old_value: oldValue,
        new_value: newValue,
        metadata
      });
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }
  }, []);

  // Convenience methods for common actions
  const logGradeAction = useCallback((action: string, gradeId: string, oldValue?: any, newValue?: any) => {
    return auditLogService.logGradeAction(action, gradeId, oldValue, newValue);
  }, []);

  const logAttendanceAction = useCallback((action: string, studentId: string, date: string, oldValue?: any, newValue?: any) => {
    return auditLogService.logAttendanceAction(action, studentId, date, oldValue, newValue);
  }, []);

  const logStudentAction = useCallback((action: string, studentId: string, oldValue?: any, newValue?: any) => {
    return auditLogService.logStudentAction(action, studentId, oldValue, newValue);
  }, []);

  const logPaymentAction = useCallback((action: string, paymentId: string, amount?: number, metadata?: any) => {
    return auditLogService.logPaymentAction(action, paymentId, amount, metadata);
  }, []);

  const logUserAction = useCallback((action: string, userId: string, oldValue?: any, newValue?: any) => {
    return auditLogService.logUserAction(action, userId, oldValue, newValue);
  }, []);

  const logSchoolAction = useCallback((action: string, schoolId: string, oldValue?: any, newValue?: any) => {
    return auditLogService.logSchoolAction(action, schoolId, oldValue, newValue);
  }, []);

  const logSystemAction = useCallback((action: string, metadata?: any) => {
    return auditLogService.logSystemAction(action, metadata);
  }, []);

  return {
    logAction,
    logGradeAction,
    logAttendanceAction,
    logStudentAction,
    logPaymentAction,
    logUserAction,
    logSchoolAction,
    logSystemAction
  };
};
