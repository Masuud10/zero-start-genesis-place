import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService, NotificationSettings, SystemNotification } from '@/services/system/notificationService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useNotificationSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query for notification settings
  const {
    data: notificationSettings,
    isLoading: isLoadingSettings,
    error: settingsError,
    refetch: refetchSettings
  } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      console.log('🔔 useNotificationSettings: Fetching notification settings...');
      const { data, error } = await NotificationService.getNotificationSettings();
      if (error) {
        console.error('🔔 useNotificationSettings: Error fetching notification settings:', error);
        throw new Error(error);
      }
      console.log('🔔 useNotificationSettings: Notification settings fetched successfully');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });

  // Query for notification history
  const {
    data: notificationHistory = [],
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ['notification-history'],
    queryFn: async () => {
      console.log('🔔 useNotificationSettings: Fetching notification history...');
      const { data, error } = await NotificationService.getNotificationHistory();
      if (error) {
        console.error('🔔 useNotificationSettings: Error fetching notification history:', error);
        throw new Error(error);
      }
      console.log('🔔 useNotificationSettings: Notification history fetched successfully');
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
    retryDelay: 1000,
  });

  // Mutation for updating notification settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: NotificationSettings) => {
      console.log('🔔 useNotificationSettings: Updating notification settings...');
      const result = await NotificationService.updateNotificationSettings(settings);
      if (!result.success) {
        console.error('🔔 useNotificationSettings: Failed to update notification settings:', result.error);
        throw new Error(result.error || 'Failed to update notification settings');
      }
      console.log('🔔 useNotificationSettings: Notification settings updated successfully');
      return result;
    },
    onSuccess: () => {
      console.log('🔔 useNotificationSettings: Settings updated successfully, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      
      toast({
        title: "Settings Updated",
        description: "Notification settings have been updated successfully.",
      });
    },
    onError: (error: unknown) => {
      console.error('🔔 useNotificationSettings: Error updating notification settings:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update notification settings",
        variant: "destructive",
      });
    }
  });

  // Mutation for sending system notification
  const sendNotificationMutation = useMutation({
    mutationFn: async (notification: Omit<SystemNotification, 'id' | 'created_at' | 'sent_count' | 'status'>) => {
      console.log('🔔 useNotificationSettings: Sending system notification...');
      const result = await NotificationService.sendSystemNotification(notification);
      if (!result.success) {
        console.error('🔔 useNotificationSettings: Failed to send system notification:', result.error);
        throw new Error(result.error || 'Failed to send system notification');
      }
      console.log('🔔 useNotificationSettings: System notification sent successfully');
      return result;
    },
    onSuccess: (_, notification) => {
      console.log('🔔 useNotificationSettings: Notification sent successfully, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['notification-history'] });
      
      toast({
        title: "Notification Sent",
        description: `"${notification.title}" has been sent successfully.`,
      });
    },
    onError: (error: unknown) => {
      console.error('🔔 useNotificationSettings: Error sending system notification:', error);
      toast({
        title: "Send Failed",
        description: error instanceof Error ? error.message : "Failed to send system notification",
        variant: "destructive",
      });
    }
  });

  // Mutation for testing notification delivery
  const testNotificationMutation = useMutation({
    mutationFn: async (settings: NotificationSettings) => {
      console.log('🔔 useNotificationSettings: Testing notification delivery...');
      const result = await NotificationService.testSendNotification(settings);
      if (!result.success) {
        console.error('🔔 useNotificationSettings: Test notification failed:', result.details);
        throw new Error(result.details.join(', ') || 'Test notification failed');
      }
      console.log('🔔 useNotificationSettings: Test notification completed successfully');
      return result;
    },
    onSuccess: (result) => {
      console.log('🔔 useNotificationSettings: Test notification completed');
      
      const message = result.sent_count > 0 
        ? `Test notification sent successfully to ${result.sent_count} recipient(s).`
        : 'Test notification completed but no recipients were found.';
      
      toast({
        title: "Test Completed",
        description: message,
      });
    },
    onError: (error: unknown) => {
      console.error('🔔 useNotificationSettings: Error testing notification:', error);
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Failed to test notification delivery",
        variant: "destructive",
      });
    }
  });

  // Wrapper functions
  const updateSettings = (settings: NotificationSettings) => {
    console.log('🔔 useNotificationSettings: updateSettings called');
    updateSettingsMutation.mutate(settings);
  };

  const sendNotification = (notification: Omit<SystemNotification, 'id' | 'created_at' | 'sent_count' | 'status'>) => {
    console.log('🔔 useNotificationSettings: sendNotification called');
    sendNotificationMutation.mutate(notification);
  };

  const testNotification = (settings: NotificationSettings) => {
    console.log('🔔 useNotificationSettings: testNotification called');
    testNotificationMutation.mutate(settings);
  };

  // Get notification statistics
  const notificationStats = {
    totalSent: notificationHistory.length,
    recentSent: notificationHistory.filter(n => {
      const sentDate = new Date(n.created_at);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return sentDate > oneWeekAgo;
    }).length,
    highPriorityCount: notificationHistory.filter(n => n.priority === 'high').length,
    averageSentCount: notificationHistory.length > 0 
      ? Math.round(notificationHistory.reduce((sum, n) => sum + n.sent_count, 0) / notificationHistory.length)
      : 0
  };

  return {
    // Data
    notificationSettings,
    notificationHistory,
    notificationStats,
    
    // Loading states
    isLoadingSettings,
    isLoadingHistory,
    isLoading: isLoadingSettings || isLoadingHistory,
    
    // Mutation states
    isUpdatingSettings: updateSettingsMutation.isPending,
    isSendingNotification: sendNotificationMutation.isPending,
    isTestingNotification: testNotificationMutation.isPending,
    
    // Errors
    settingsError,
    historyError,
    
    // Actions
    updateSettings,
    sendNotification,
    testNotification,
    
    // Refetch functions
    refetchSettings,
    refetchHistory,
    refetch: () => {
      console.log('🔔 useNotificationSettings: Manual refetch called');
      refetchSettings();
      refetchHistory();
    }
  };
}; 