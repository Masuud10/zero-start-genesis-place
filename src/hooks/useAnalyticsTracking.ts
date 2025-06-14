
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { analyticsService, AnalyticsEvent } from '@/services/analyticsService';

export const useAnalyticsTracking = () => {
  const { user } = useAuth();
  const { currentSchool } = useSchool();

  const trackEvent = useCallback(async (
    eventType: string,
    category: string,
    metadata: Record<string, any> = {}
  ) => {
    try {
      const event: Omit<AnalyticsEvent, 'timestamp'> = {
        event_type: eventType,
        event_category: category,
        school_id: currentSchool?.id || user?.school_id,
        user_id: user?.id,
        metadata: {
          ...metadata,
          user_role: user?.role,
          timestamp: new Date().toISOString()
        }
      };

      await analyticsService.trackEvent(event);
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }, [user, currentSchool]);

  // Specific tracking methods
  const trackGradeSubmission = useCallback((gradeData: any) => {
    trackEvent('grade_submitted', 'grades', {
      student_id: gradeData.student_id,
      subject_id: gradeData.subject_id,
      score: gradeData.score,
      exam_type: gradeData.exam_type
    });
  }, [trackEvent]);

  const trackAttendanceUpdate = useCallback((attendanceData: any) => {
    trackEvent('attendance_marked', 'attendance', {
      student_id: attendanceData.student_id,
      class_id: attendanceData.class_id,
      status: attendanceData.status,
      session: attendanceData.session
    });
  }, [trackEvent]);

  const trackFinanceTransaction = useCallback((transactionData: any) => {
    trackEvent('payment_processed', 'finance', {
      student_id: transactionData.student_id,
      amount: transactionData.amount,
      payment_method: transactionData.payment_method,
      transaction_type: transactionData.transaction_type
    });
  }, [trackEvent]);

  const trackUserActivity = useCallback((activity: string, details: any = {}) => {
    trackEvent(activity, 'user_activity', {
      page: window.location.pathname,
      action: activity,
      ...details
    });
  }, [trackEvent]);

  const trackSystemEvent = useCallback((eventType: string, details: any = {}) => {
    trackEvent(eventType, 'system', details);
  }, [trackEvent]);

  return {
    trackEvent,
    trackGradeSubmission,
    trackAttendanceUpdate,
    trackFinanceTransaction,
    trackUserActivity,
    trackSystemEvent
  };
};
