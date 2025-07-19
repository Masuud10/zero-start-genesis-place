import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedAnnouncement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_global: boolean;
  created_at: string;
  created_by: string;
  expiry_date?: string;
  target_audience: string[];
  attachments?: string[];
  creator?: {
    name: string;
    role: string;
  };
}

export interface AnnouncementFilters {
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
          priority,
          is_global,
          created_at,
          created_by,
          expiry_date,
          target_audience,
          attachments
        `)
        .order('created_at', { ascending: false });

      // Apply filters
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

      const enhancedData: EnhancedAnnouncement[] = data?.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        priority: item.priority as 'low' | 'medium' | 'high' | 'urgent',
        is_global: item.is_global,
        created_at: item.created_at,
        created_by: item.created_by,
        expiry_date: item.expiry_date,
        target_audience: item.target_audience || [],
        attachments: item.attachments || [],
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

      const creatorId = 'admin_user_id'; // This should be provided externally

      const { data, error: createError } = await supabase
        .from('announcements')
        .insert({
          title: announcement.title,
          content: announcement.content,
          priority: announcement.priority,
          is_global: announcement.is_global,
          expiry_date: announcement.expiry_date,
          target_audience: announcement.target_audience,
          attachments: announcement.attachments,
          created_by: creatorId
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      if (data) {
        const newAnnouncement: EnhancedAnnouncement = {
          id: data.id,
          title: data.title,
          content: data.content,
          priority: data.priority as 'low' | 'medium' | 'high' | 'urgent',
          is_global: data.is_global,
          created_at: data.created_at,
          created_by: data.created_by,
          expiry_date: data.expiry_date,
          target_audience: data.target_audience || [],
          attachments: data.attachments || []
        };
        setAnnouncements(prev => [newAnnouncement, ...prev]);
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
        const updatedAnnouncement: EnhancedAnnouncement = {
          id: data.id,
          title: data.title,
          content: data.content,
          priority: data.priority as 'low' | 'medium' | 'high' | 'urgent',
          is_global: data.is_global,
          created_at: data.created_at,
          created_by: data.created_by,
          expiry_date: data.expiry_date,
          target_audience: data.target_audience || [],
          attachments: data.attachments || []
        };
        setAnnouncements(prev => 
          prev.map(announcement => announcement.id === id ? updatedAnnouncement : announcement)
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
      const userId = 'current_user_id'; // This should be provided externally
      
      const { error: updateError } = await supabase
        .from('announcement_recipients')
        .upsert({
          announcement_id: announcementId,
          user_id: userId,
          user_role: 'admin',
          read_at: new Date().toISOString()
        });

      if (updateError) {
        throw updateError;
      }

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