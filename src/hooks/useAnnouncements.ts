
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  target_audience: string[];
  created_by: string;
  school_id?: string;
  expiry_date?: string;
  attachments?: string[];
  is_global: boolean;
  created_at: string;
  creator_name?: string;
}

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAnnouncements();
    }
  }, [user]);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          profiles!announcements_created_by_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        ...item,
        creator_name: item.profiles?.name
      })) || [];

      setAnnouncements(formattedData);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async (announcement: Omit<Announcement, 'id' | 'created_at' | 'created_by'>) => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          ...announcement,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      await fetchAnnouncements();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating announcement:', error);
      return { data: null, error };
    }
  };

  return {
    announcements,
    loading,
    createAnnouncement,
    refetch: fetchAnnouncements
  };
};
