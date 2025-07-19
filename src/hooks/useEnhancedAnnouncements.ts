
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_global: boolean;
  created_at: string;
  created_by: string;
  expires_at?: string;
  recipients?: string[];
  read_by?: string[];
  attachments?: string[];
  creator?: {
    name: string;
    role: string;
  };
}

export interface AnnouncementFilters {
  type?: string;
  priority?: string;
  isGlobal?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export const useEnhancedAnnouncements = (filters: AnnouncementFilters = {}) => {
  const [announcements, setAnnouncements] = useState<EnhancedAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Since this is an admin application, we'll fetch all announcements
    fetchAnnouncements();
  }, [filters]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('announcements')
        .select(`
          id,
          title,
          content,
          type,
          priority,
          is_global,
          created_at,
          created_by,
          expires_at,
          recipients,
          read_by,
          attachments
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.isGlobal !== undefined) {
        query = query.eq('is_global', filters.isGlobal);
      }
      if (filters.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Get creator details for each announcement
      const creatorIds = [...new Set(data?.map(item => item.created_by).filter(Boolean) || [])];
      
      const { data: creators } = await supabase
        .from('profiles')
        .select('id, name, role')
        .in('id', creatorIds);

      const creatorMap = new Map(creators?.map(c => [c.id, c]) || []);

      const enhancedData = data?.map(item => ({
        ...item,
        creator: creatorMap.get(item.created_by)
      })) || [];

      setAnnouncements(enhancedData);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async (announcement: Omit<EnhancedAnnouncement, 'id' | 'created_at' | 'created_by'>) => {
    try {
      setError(null);

      // Since user context is removed, we'll use a placeholder creator ID
      const creatorId = 'admin_user_id'; // This should be provided externally

      const { data, error: createError } = await supabase
        .from('announcements')
        .insert({
          ...announcement,
          created_by: creatorId,
          is_global: true // Admin announcements are global
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      if (data) {
        setAnnouncements(prev => [data, ...prev]);
      }

      return data;
    } catch (err) {
      console.error('Error creating announcement:', err);
      setError(err instanceof Error ? err.message : 'Failed to create announcement');
      throw err;
    }
  };

  const updateAnnouncement = async (id: string, updates: Partial<EnhancedAnnouncement>) => {
    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('announcements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      if (data) {
        setAnnouncements(prev => 
          prev.map(announcement => announcement.id === id ? data : announcement)
        );
      }

      return data;
    } catch (err) {
      console.error('Error updating announcement:', err);
      setError(err instanceof Error ? err.message : 'Failed to update announcement');
      throw err;
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
    } catch (err) {
      console.error('Error deleting announcement:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete announcement');
      throw err;
    }
  };

  const markAsRead = async (announcementId: string) => {
    try {
      // Since user context is removed, we'll use a placeholder user ID
      const userId = 'current_user_id'; // This should be provided externally
      
      const { error: updateError } = await supabase
        .from('announcement_recipients')
        .upsert({
          announcement_id: announcementId,
          user_id: userId,
          read_at: new Date().toISOString()
        });

      if (updateError) {
        throw updateError;
      }

      setAnnouncements(prev => 
        prev.map(announcement => {
          if (announcement.id === announcementId) {
            return {
              ...announcement,
              read_by: [...(announcement.read_by || []), userId]
            };
          }
          return announcement;
        })
      );
    } catch (err) {
      console.error('Error marking announcement as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark announcement as read');
    }
  };

  return {
    announcements,
    loading,
    error,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    markAsRead,
    refetch: fetchAnnouncements
  };
};
