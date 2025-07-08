import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'grades' | 'attendance' | 'examinations' | 'reports' | 'analytics' | 'system';
  academic_context?: {
    academic_year_id?: string;
    term_id?: string;
    class_id?: string;
    subject_id?: string;
  };
  action_url?: string;
  is_read: boolean;
  created_at: string;
  expires_at?: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  grade_submissions: boolean;
  grade_approvals: boolean;
  attendance_alerts: boolean;
  exam_reminders: boolean;
  report_generation: boolean;
  system_alerts: boolean;
}

export class NotificationService {
  /**
   * Send a notification to a specific user
   */
  static async sendNotification(
    userId: string,
    notification: Omit<Notification, 'id' | 'user_id' | 'is_read' | 'created_at'>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          category: notification.category,
          academic_context: notification.academic_context,
          action_url: notification.action_url,
          is_read: false,
          expires_at: notification.expires_at,
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error sending notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send notifications to multiple users (e.g., all teachers in a class)
   */
  static async sendBulkNotifications(
    userIds: string[],
    notification: Omit<Notification, 'id' | 'user_id' | 'is_read' | 'created_at'>
  ): Promise<{ success: boolean; sent: number; errors: string[] }> {
    try {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        category: notification.category,
        academic_context: notification.academic_context,
        action_url: notification.action_url,
        is_read: false,
        expires_at: notification.expires_at,
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      return { success: true, sent: userIds.length, errors: [] };
    } catch (error: any) {
      console.error('Error sending bulk notifications:', error);
      return { success: false, sent: 0, errors: [error.message] };
    }
  }

  /**
   * Get user's notifications with pagination
   */
  static async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<{ data: Notification[]; count: number; error?: string }> {
    try {
      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error, count } = await query
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      return { data: data || [], count: count || 0 };
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      return { data: [], count: 0, error: error.message };
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark all user notifications as read
   */
  static async markAllAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete expired notifications
   */
  static async deleteExpiredNotifications(): Promise<{ success: boolean; deleted: number; error?: string }> {
    try {
      const { error, count } = await supabase
        .from('notifications')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) throw error;

      return { success: true, deleted: count || 0 };
    } catch (error: any) {
      console.error('Error deleting expired notifications:', error);
      return { success: false, deleted: 0, error: error.message };
    }
  }

  /**
   * Get user notification preferences
   */
  static async getNotificationPreferences(userId: string): Promise<{ data: NotificationPreferences | null; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      return { data: data || null };
    } catch (error: any) {
      console.error('Error fetching notification preferences:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Update user notification preferences
   */
  static async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error updating notification preferences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Academic context-aware notification helpers
   */
  static async notifyGradeSubmission(
    teacherId: string,
    principalId: string,
    context: { class_id: string; subject_id: string; term_id: string; academic_year_id: string }
  ): Promise<void> {
    // Notify principal about grade submission
    await this.sendNotification(principalId, {
      title: 'New Grade Submission',
      message: 'A teacher has submitted grades for review',
      type: 'info',
      category: 'grades',
      academic_context: context,
      action_url: `/principal/grades?class=${context.class_id}&subject=${context.subject_id}`,
    });
  }

  static async notifyGradeApproval(
    teacherId: string,
    context: { class_id: string; subject_id: string; term_id: string; academic_year_id: string }
  ): Promise<void> {
    // Notify teacher about grade approval
    await this.sendNotification(teacherId, {
      title: 'Grades Approved',
      message: 'Your submitted grades have been approved by the principal',
      type: 'success',
      category: 'grades',
      academic_context: context,
      action_url: `/teacher/grades?class=${context.class_id}&subject=${context.subject_id}`,
    });
  }

  static async notifyGradeRejection(
    teacherId: string,
    reason: string,
    context: { class_id: string; subject_id: string; term_id: string; academic_year_id: string }
  ): Promise<void> {
    // Notify teacher about grade rejection
    await this.sendNotification(teacherId, {
      title: 'Grades Rejected',
      message: `Your submitted grades have been rejected. Reason: ${reason}`,
      type: 'warning',
      category: 'grades',
      academic_context: context,
      action_url: `/teacher/grades?class=${context.class_id}&subject=${context.subject_id}`,
    });
  }

  static async notifyExamReminder(
    teacherIds: string[],
    examName: string,
    examDate: string,
    context: { class_id: string; term_id: string; academic_year_id: string }
  ): Promise<void> {
    // Notify teachers about upcoming exams
    await this.sendBulkNotifications(teacherIds, {
      title: 'Exam Reminder',
      message: `Reminder: ${examName} is scheduled for ${examDate}`,
      type: 'info',
      category: 'examinations',
      academic_context: context,
      action_url: `/teacher/examinations`,
    });
  }

  static async notifyAttendanceAlert(
    parentIds: string[],
    studentName: string,
    date: string,
    context: { class_id: string; term_id: string; academic_year_id: string }
  ): Promise<void> {
    // Notify parents about attendance issues
    await this.sendBulkNotifications(parentIds, {
      title: 'Attendance Alert',
      message: `${studentName} was absent on ${date}`,
      type: 'warning',
      category: 'attendance',
      academic_context: context,
      action_url: `/parent/attendance`,
    });
  }
}

export default NotificationService; 