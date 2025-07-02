
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'message' | 'system' | 'grade' | 'fee';
  priority: 'low' | 'medium' | 'high';
  read_at?: string;
  created_at: string;
  metadata?: any;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      try {
        // Fetch announcements with error handling
        const { data: announcements, error } = await supabase
          .from('announcement_recipients')
          .select(`
            id,
            read_at,
            created_at,
            announcements (
              title,
              content,
              priority
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.warn('🔔 Notifications: Error fetching announcements:', error);
          return [];
        }

        const notificationsList: Notification[] = [];

        // Process announcements
        announcements?.forEach(item => {
          if (item.announcements) {
            notificationsList.push({
              id: item.id,
              title: item.announcements.title,
              content: item.announcements.content,
              type: 'announcement',
              priority: (item.announcements.priority as 'low' | 'medium' | 'high') || 'medium',
              read_at: item.read_at,
              created_at: item.created_at,
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
  });

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user?.id || !notificationId) {
        throw new Error('Missing user ID or notification ID');
      }

      const { error } = await supabase
        .from('announcement_recipients')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id); // Additional security check

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('🔔 Notifications: Error marking as read:', error);
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
