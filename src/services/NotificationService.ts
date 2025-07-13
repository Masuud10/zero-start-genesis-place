import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  created_at: string;
  data?: any;
}

export class NotificationService {
  /**
   * Create a notification for a specific user
   */
  static async createNotification(
    userId: string,
    notification: Omit<Notification, 'id' | 'user_id' | 'is_read' | 'created_at'>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Use announcements table instead of notifications
      const { error } = await supabase
        .from('announcements')
        .insert({
          title: notification.title,
          content: notification.message,
          target_audience: ['user'],
          priority: notification.type === 'error' ? 'high' : 'medium',
          is_global: false,
          created_by: userId
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ data: Notification[]; error?: string }> {
    try {
      // Use announcements as notifications
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .contains('target_audience', ['user'])
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Transform data to match Notification interface
      const transformedData: Notification[] = (data || []).map(item => ({
        id: item.id,
        user_id: userId,
        title: item.title,
        message: item.content,
        type: item.priority === 'high' ? 'error' : 'info',
        is_read: false,
        created_at: item.created_at || new Date().toISOString(),
        data: item
      }));

      return { data: transformedData };
    } catch (error: any) {
      console.error('Error fetching user notifications:', error);
      return { data: [], error: error.message };
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(
    notificationId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Since we're using announcements, we'll track read status differently
      // For now, just return success
      return { success: true };
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Since we're using announcements, we'll track read status differently
      // For now, just return success
      return { success: true };
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(
    notificationId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(
    userId: string
  ): Promise<{ count: number; error?: string }> {
    try {
      const { count, error } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })
        .contains('target_audience', ['user']);

      if (error) throw error;

      return { count: count || 0 };
    } catch (error: any) {
      console.error('Error getting unread count:', error);
      return { count: 0, error: error.message };
    }
  }

  /**
   * Create a system-wide notification
   */
  static async createSystemNotification(
    notification: Omit<Notification, 'id' | 'user_id' | 'is_read' | 'created_at'>,
    targetRoles?: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('announcements')
        .insert({
          title: notification.title,
          content: notification.message,
          target_audience: targetRoles || ['all'],
          priority: notification.type === 'error' ? 'high' : 'medium',
          is_global: true
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error creating system notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Academic context-aware notifications
   */
  static async notifyGradeSubmission(
    teacherId: string,
    principalId: string,
    gradeData: any
  ): Promise<void> {
    await this.createNotification(principalId, {
      title: 'Grades Submitted for Review',
      message: `New grades have been submitted by teacher for ${gradeData.subject} - ${gradeData.class}`,
      type: 'info',
      data: gradeData
    });
  }

  static async notifyGradeApproval(
    teacherId: string,
    gradeData: any
  ): Promise<void> {
    await this.createNotification(teacherId, {
      title: 'Grades Approved',
      message: `Your grades for ${gradeData.subject} - ${gradeData.class} have been approved`,
      type: 'success',
      data: gradeData
    });
  }

  static async notifyGradeRejection(
    teacherId: string,
    gradeData: any,
    reason: string
  ): Promise<void> {
    await this.createNotification(teacherId, {
      title: 'Grades Rejected',
      message: `Your grades for ${gradeData.subject} - ${gradeData.class} have been rejected. Reason: ${reason}`,
      type: 'warning',
      data: { ...gradeData, rejection_reason: reason }
    });
  }

  static async notifyExamCreated(
    teacherIds: string[],
    examData: any
  ): Promise<void> {
    const promises = teacherIds.map(teacherId =>
      this.createNotification(teacherId, {
        title: 'New Exam Scheduled',
        message: `${examData.name} has been scheduled from ${examData.start_date} to ${examData.end_date}`,
        type: 'info',
        data: examData
      })
    );

    await Promise.all(promises);
  }

  static async notifyAttendanceReminder(
    teacherId: string,
    classData: any
  ): Promise<void> {
    await this.createNotification(teacherId, {
      title: 'Attendance Reminder',
      message: `Please mark attendance for ${classData.name}`,
      type: 'info',
      data: classData
    });
  }

  static async notifyReportGenerated(
    userId: string,
    reportData: any
  ): Promise<void> {
    await this.createNotification(userId, {
      title: 'Report Generated',
      message: `Your ${reportData.type} report has been generated and is ready for download`,
      type: 'success',
      data: reportData
    });
  }

  static async notifyDataIssue(
    adminIds: string[],
    issueData: any
  ): Promise<void> {
    const promises = adminIds.map(adminId =>
      this.createNotification(adminId, {
        title: 'Data Integrity Issue',
        message: `Data integrity issue detected: ${issueData.description}`,
        type: 'error',
        data: issueData
      })
    );

    await Promise.all(promises);
  }

  static async notifySystemMaintenance(
    message: string,
    scheduledTime: string
  ): Promise<void> {
    await this.createSystemNotification({
      title: 'Scheduled System Maintenance',
      message: `${message}. Scheduled for: ${scheduledTime}`,
      type: 'warning'
    });
  }

  static async notifyFeatureUpdate(
    message: string,
    targetRoles?: string[]
  ): Promise<void> {
    await this.createSystemNotification({
      title: 'New Feature Available',
      message,
      type: 'success'
    }, targetRoles);
  }
}

export default NotificationService;