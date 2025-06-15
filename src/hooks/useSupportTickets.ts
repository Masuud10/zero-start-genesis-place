
import { useState, useEffect, useCallback } from 'react';
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

function useTimeoutPromise<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms)
    )
  ]) as Promise<T>;
}

export const useSupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = supabase
        .from('support_tickets')
        .select(`
          *,
          profiles!support_tickets_created_by_fkey(name)
        `)
        .order('created_at', { ascending: false });

      const { data, error: fetchError } = await useTimeoutPromise(
        Promise.resolve(query.then(x => x)),
        7000
      );

      if (fetchError) throw fetchError;

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
      setError(null);
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch support tickets';
      setError(message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchTickets();
    } else {
      setTickets([]);
      setLoading(false);
    }
  }, [user, fetchTickets]);

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
    } catch (error: any) {
      return { data: null, error };
    }
  };

  return {
    tickets,
    loading,
    error,
    createTicket,
    refetch: fetchTickets,
    retry: fetchTickets,
  };
};
