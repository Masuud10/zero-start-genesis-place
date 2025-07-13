import { supabase } from '@/integrations/supabase/client';

export interface Notification {
  id: string;
  user_id: string;
  announcement_id: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  admin_communications: {
    id: string;
    title: string;
    message: string;
    priority: string;
    created_at: string;
  };
}

export class NotificationsService {
  // Get unread notifications for current user
  static async getUnreadNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          admin_communications (
            id,
            title,
            message,
            priority,
            created_at
          )
        `)
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('📢 NotificationsService: Error fetching unread notifications:', error);
        throw error;
      }

      return (data || []) as Notification[];
    } catch (error) {
      console.error('📢 NotificationsService: Error in getUnreadNotifications:', error);
      return [];
    }
  }

  // Get all notifications for current user
  static async getAllNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          admin_communications (
            id,
            title,
            message,
            priority,
            created_at
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('📢 NotificationsService: Error fetching all notifications:', error);
        throw error;
      }

      return (data || []) as Notification[];
    } catch (error) {
      console.error('📢 NotificationsService: Error in getAllNotifications:', error);
      return [];
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', userId); // Security check - user can only update their own notifications

      if (error) {
        console.error('📢 NotificationsService: Error marking notification as read:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('📢 NotificationsService: Error in markAsRead:', error);
      return { success: false, error: 'Failed to mark notification as read' };
    }
  }

  // Get notification count for user
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('📢 NotificationsService: Error fetching unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('📢 NotificationsService: Error in getUnreadCount:', error);
      return 0;
    }
  }
}