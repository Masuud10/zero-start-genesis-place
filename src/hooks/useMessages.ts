
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  attachments?: string[];
  conversation_id: string;
  created_at: string;
  sender_name?: string;
  receiver_name?: string;
}

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchConversations();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(name),
          receiver:profiles!messages_receiver_id_fkey(name)
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        ...item,
        sender_name: item.sender?.name,
        receiver_name: item.receiver?.name
      })) || [];

      setMessages(formattedData);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role')
        .neq('id', user?.id);

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const sendMessage = async (receiverId: string, content: string, conversationId?: string) => {
    try {
      const finalConversationId = conversationId || `${user?.id}-${receiverId}`;
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user?.id,
          receiver_id: receiverId,
          content,
          conversation_id: finalConversationId
        })
        .select()
        .single();

      if (error) throw error;
      await fetchMessages();
      return { data, error: null };
    } catch (error) {
      console.error('Error sending message:', error);
      return { data: null, error };
    }
  };

  return {
    messages,
    conversations,
    loading,
    sendMessage,
    refetch: fetchMessages
  };
};
