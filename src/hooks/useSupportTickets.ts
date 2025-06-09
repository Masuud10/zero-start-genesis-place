
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SupportTicket {
  id: string;
  school_id?: string;
  created_by: string;
  title: string;
  description: string;
  type: 'technical' | 'feature_request' | 'billing' | 'feedback';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  attachments?: string[];
  created_at: string;
  resolved_at?: string;
  creator_name?: string;
}

export const useSupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          profiles!support_tickets_created_by_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        id: item.id,
        school_id: item.school_id,
        created_by: item.created_by,
        title: item.title,
        description: item.description,
        type: item.type as 'technical' | 'feature_request' | 'billing' | 'feedback',
        status: item.status as 'open' | 'in_progress' | 'resolved' | 'closed',
        priority: item.priority as 'low' | 'medium' | 'high' | 'urgent',
        assigned_to: item.assigned_to,
        attachments: item.attachments,
        created_at: item.created_at,
        resolved_at: item.resolved_at,
        creator_name: item.profiles?.name
      })) || [];

      setTickets(formattedData);
    } catch (error) {
      console.error('Error fetching support tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticket: Omit<SupportTicket, 'id' | 'created_at' | 'created_by'>) => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          ...ticket,
          created_by: user?.id,
          school_id: user?.school_id
        })
        .select()
        .single();

      if (error) throw error;
      await fetchTickets();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating support ticket:', error);
      return { data: null, error };
    }
  };

  return {
    tickets,
    loading,
    createTicket,
    refetch: fetchTickets
  };
};
