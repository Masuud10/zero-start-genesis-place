import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import { analyticsService, AnalyticsEvent } from '@/services/analyticsService';

interface GradeData {
  student_id: string;
  subject_id: string;
  score: number;
  exam_type: string;
}

interface AttendanceData {
  student_id: string;
  class_id: string;
  status: string;
  session: string;
}

interface TransactionData {
  student_id: string;
  amount: number;
  payment_method: string;
  transaction_type: string;
}

interface ActivityDetails {
  [key: string]: unknown;
}

export const useAnalyticsTracking = () => {
  const { user } = useAuth();
  const { currentSchool } = useSchool();

  const trackEvent = useCallback(async (
    eventType: string,
    category: string,
    metadata: Record<string, unknown> = {}
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
  const trackGradeSubmission = useCallback((gradeData: GradeData) => {
    trackEvent('grade_submitted', 'grades', {
      student_id: gradeData.student_id,
      subject_id: gradeData.subject_id,
      score: gradeData.score,
      exam_type: gradeData.exam_type
    });
  }, [trackEvent]);

  const trackAttendanceUpdate = useCallback((attendanceData: AttendanceData) => {
    trackEvent('attendance_marked', 'attendance', {
      student_id: attendanceData.student_id,
      class_id: attendanceData.class_id,
      status: attendanceData.status,
      session: attendanceData.session
    });
  }, [trackEvent]);

  const trackFinanceTransaction = useCallback((transactionData: TransactionData) => {
    trackEvent('payment_processed', 'finance', {
      student_id: transactionData.student_id,
      amount: transactionData.amount,
      payment_method: transactionData.payment_method,
      transaction_type: transactionData.transaction_type
    });
  }, [trackEvent]);

  const trackUserActivity = useCallback((activity: string, details: ActivityDetails = {}) => {
    trackEvent(activity, 'user_activity', {
      page: window.location.pathname,
      action: activity,
      ...details
    });
  }, [trackEvent]);

  const trackSystemEvent = useCallback((eventType: string, details: ActivityDetails = {}) => {
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
