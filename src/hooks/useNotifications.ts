
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'message' | 'system' | 'grade' | 'fee';
  priority: 'low' | 'medium' | 'high' | 'critical';
  read_at?: string;
  created_at: string;
  metadata?: any;
  admin_communications?: {
    id: string;
    title: string;
    message: string;
    priority: string;
    created_at: string;
  };
}

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // PHASE 2: Fetch unread notifications from new notifications table
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      try {
        // Fetch from new notifications table with admin_communications join
        const { data: notificationsData, error } = await supabase
          .from('notifications')
          .select(`
            id,
            is_read,
            read_at,
            created_at,
            admin_communications (
              id,
              title,
              message,
              priority,
              created_at
            )
          `)
          .eq('user_id', user.id)
          .eq('is_read', false)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('🔔 Notifications: Error fetching notifications:', error);
          return [];
        }

        const notificationsList: Notification[] = [];

        // Process notifications
        notificationsData?.forEach(item => {
          if (item.admin_communications) {
            notificationsList.push({
              id: item.id,
              title: item.admin_communications.title,
              content: item.admin_communications.message,
              type: 'announcement',
              priority: (item.admin_communications.priority as 'low' | 'medium' | 'high' | 'critical') || 'medium',
              read_at: item.read_at,
              created_at: item.created_at,
              admin_communications: item.admin_communications
            });
          }
        });

        return notificationsList.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } catch (error) {
        console.error('🔔 Notifications: Failed to fetch notifications:', error);
        return [];
      }
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute for real-time updates
  });

  // PHASE 3: Mark notification as read in new notifications table
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user?.id || !notificationId) {
        throw new Error('Missing user ID or notification ID');
      }

      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .eq('user_id', user.id); // Security check - user can only update their own notifications

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      // Don't show a success toast for mark as read
    },
    onError: (error) => {
      console.error('🔔 Notifications: Error marking as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsRead.mutate,
    isMarkingAsRead: markAsRead.isPending,
  };
};
