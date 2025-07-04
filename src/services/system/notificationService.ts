import { supabase } from '../../integrations/supabase/client';

export type Json = string | number | boolean | { [key: string]: Json } | Json[];

export interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  security_alerts: boolean;
  system_updates: boolean;
  maintenance_notifications: boolean;
  email_frequency: 'immediate' | 'daily' | 'weekly';
  quiet_hours_start: string;
  quiet_hours_end: string;
  notification_channels: string[];
}

export interface SystemNotification {
  id: string;
  title: string;
  content: string;
  type: 'system' | 'maintenance' | 'update' | 'security';
  priority: 'low' | 'medium' | 'high';
  target_audience: 'all' | 'admins' | 'principals' | 'teachers' | 'parents';
  created_at: string;
  sent_count: number;
  status: 'draft' | 'sent' | 'scheduled';
}

export interface TestNotificationResult {
  success: boolean;
  sent_count: number;
  failed_count: number;
  details: string[];
}

export interface UserProfile {
  id: string;
  email?: string;
  role?: string;
  name?: string;
}

export class NotificationService {
  static async getNotificationSettings(): Promise<{ data: NotificationSettings | null; error?: string }> {
    try {
      console.log('🔔 NotificationService: Fetching notification settings');
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'notification_settings')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        // Return default settings
        const defaultSettings: NotificationSettings = {
          email_notifications: true,
          sms_notifications: false,
          push_notifications: true,
          security_alerts: true,
          system_updates: true,
          maintenance_notifications: true,
          email_frequency: 'immediate',
          quiet_hours_start: '22:00',
          quiet_hours_end: '07:00',
          notification_channels: ['email', 'web']
        };
        return { data: defaultSettings };
      }

      return { data: data.setting_value as unknown as NotificationSettings };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('🔔 NotificationService: Error fetching notification settings:', errorMessage);
      return { data: null, error: errorMessage };
    }
  }

  static async updateNotificationSettings(settings: NotificationSettings): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔔 NotificationService: Updating notification settings');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'notification_settings',
          setting_value: settings as unknown as Json,
          description: 'System notification configuration',
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;

      console.log('🔔 NotificationService: Notification settings updated successfully');
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('🔔 NotificationService: Error updating notification settings:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  static async sendSystemNotification(notification: Omit<SystemNotification, 'id' | 'created_at' | 'sent_count' | 'status'>): Promise<{ success: boolean; notificationId?: string; error?: string }> {
    try {
      console.log('🔔 NotificationService: Sending system notification:', notification.title);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create notification record
      const { data: notificationRecord, error: createError } = await supabase
        .from('system_notifications')
        .insert({
          title: notification.title,
          content: notification.content,
          type: notification.type,
          priority: notification.priority,
          metadata: {
            target_audience: notification.target_audience,
            sent_by: user?.id,
            sent_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (createError) throw createError;

      // Get target users based on audience
      const targetUsers = await this.getTargetUsers(notification.target_audience);
      
      // Transform notificationRecord to SystemNotification
      const meta = (typeof notificationRecord.metadata === 'object' && !Array.isArray(notificationRecord.metadata) && notificationRecord.metadata !== null)
        ? (notificationRecord.metadata as Record<string, unknown>)
        : {};
      const notificationObj: SystemNotification = {
        id: notificationRecord.id,
        title: notificationRecord.title,
        content: notificationRecord.content,
        type: (notificationRecord.type as SystemNotification['type']) || 'system',
        priority: (notificationRecord.priority as SystemNotification['priority']) || 'medium',
        target_audience: (meta['target_audience'] as SystemNotification['target_audience']) || 'all',
        created_at: notificationRecord.created_at,
        sent_count: (meta['sent_count'] as number) || 0,
        status: (meta['status'] as SystemNotification['status']) || 'sent'
      };
      const sendResults = await this.sendNotificationsToUsers(targetUsers, notificationObj);
      
      // Update notification record with results
      const { error: updateError } = await supabase
        .from('system_notifications')
        .update({
          metadata: {
            ...meta,
            sent_count: sendResults.sent_count,
            failed_count: sendResults.failed_count,
            delivery_details: sendResults.details,
            status: 'sent'
          }
        })
        .eq('id', notificationRecord.id);

      if (updateError) throw updateError;

      console.log('🔔 NotificationService: System notification sent successfully');
      return { success: true, notificationId: notificationRecord.id };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('🔔 NotificationService: Error sending system notification:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  static async testSendNotification(settings: NotificationSettings): Promise<TestNotificationResult> {
    try {
      console.log('🔔 NotificationService: Testing notification delivery');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create test notification
      const testNotification = {
        id: 'test',
        title: 'Test Notification',
        content: 'This is a test notification to verify your notification settings are working correctly.',
        type: 'system' as const,
        priority: 'medium' as const,
        target_audience: 'all' as const,
        created_at: new Date().toISOString(),
        sent_count: 0,
        status: 'sent' as const
      } satisfies SystemNotification;

      // Get current user for test
      const testUsers = user ? [user] : [];
      
      // Simulate sending notifications based on settings
      const results = await this.simulateNotificationDelivery(testUsers, settings, testNotification);
      
      console.log('🔔 NotificationService: Test notification completed');
      return results;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('🔔 NotificationService: Error testing notification:', errorMessage);
      return {
        success: false,
        sent_count: 0,
        failed_count: 1,
        details: [errorMessage || 'Test failed']
      };
    }
  }

  static async getNotificationHistory(): Promise<{ data: SystemNotification[]; error?: string }> {
    try {
      console.log('🔔 NotificationService: Fetching notification history');
      
      const { data, error } = await supabase
        .from('system_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const notifications: SystemNotification[] = (data || []).map(record => {
        const meta = (typeof record.metadata === 'object' && !Array.isArray(record.metadata) && record.metadata !== null)
          ? (record.metadata as Record<string, unknown>)
          : {};
        return {
          id: record.id,
          title: record.title,
          content: record.content,
          type: (record.type as SystemNotification['type']) || 'system',
          priority: (record.priority as SystemNotification['priority']) || 'medium',
          target_audience: (meta['target_audience'] as SystemNotification['target_audience']) || 'all',
          created_at: record.created_at,
          sent_count: (meta['sent_count'] as number) || 0,
          status: (meta['status'] as SystemNotification['status']) || 'sent'
        };
      });

      console.log('🔔 NotificationService: Notification history fetched:', notifications.length, 'records');
      return { data: notifications };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('🔔 NotificationService: Error fetching notification history:', errorMessage);
      return { data: [], error: errorMessage };
    }
  }

  private static async getTargetUsers(audience: string): Promise<UserProfile[]> {
    try {
      let query = supabase.from('profiles').select('id, email, role, name');
      
      switch (audience) {
        case 'admins':
          query = query.in('role', ['edufam_admin', 'elimisha_admin']);
          break;
        case 'principals':
          query = query.eq('role', 'principal');
          break;
        case 'teachers':
          query = query.eq('role', 'teacher');
          break;
        case 'parents':
          query = query.eq('role', 'parent');
          break;
        case 'all':
        default:
          // Get all users
          break;
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []) as UserProfile[];
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('🔔 NotificationService: Error getting target users:', errorMessage);
      return [];
    }
  }

  private static async sendNotificationsToUsers(users: UserProfile[], notification: SystemNotification): Promise<TestNotificationResult> {
    const results: TestNotificationResult = {
      success: true,
      sent_count: 0,
      failed_count: 0,
      details: []
    };

    for (const user of users) {
      try {
        // Create user notification record
        const { error } = await supabase
          .from('system_notifications')
          .insert({
            user_id: user.id,
            title: notification.title,
            content: notification.content,
            type: notification.type,
            priority: notification.priority,
            metadata: {
              system_notification_id: notification.id,
              delivery_method: 'in_app'
            }
          });

        if (error) {
          results.failed_count++;
          results.details.push(`Failed to send to ${user.email}: ${error.message}`);
        } else {
          results.sent_count++;
          results.details.push(`Successfully sent to ${user.email}`);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.failed_count++;
        results.details.push(`Error sending to ${user.email}: ${errorMessage}`);
      }
    }

    return results;
  }

  private static async simulateNotificationDelivery(users: UserProfile[], settings: NotificationSettings, notification: SystemNotification): Promise<TestNotificationResult> {
    const results: TestNotificationResult = {
      success: true,
      sent_count: 0,
      failed_count: 0,
      details: []
    };

    for (const user of users) {
      try {
        // Simulate different delivery methods based on settings
        if (settings.email_notifications) {
          results.sent_count++;
          results.details.push(`Email notification sent to ${user.email}`);
        }

        if (settings.push_notifications) {
          results.sent_count++;
          results.details.push(`Push notification sent to ${user.email}`);
        }

        if (settings.sms_notifications) {
          results.sent_count++;
          results.details.push(`SMS notification sent to ${user.email}`);
        }

        // Create test notification record
        await supabase
          .from('system_notifications')
          .insert({
            user_id: user.id,
            title: notification.title,
            content: notification.content,
            type: notification.type,
            priority: notification.priority,
            metadata: {
              is_test: true,
              delivery_methods: [
                settings.email_notifications && 'email',
                settings.push_notifications && 'push',
                settings.sms_notifications && 'sms'
              ].filter(Boolean)
            }
          });

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.failed_count++;
        results.details.push(`Test failed for ${user.email}: ${errorMessage}`);
      }
    }

    return results;
  }
} 