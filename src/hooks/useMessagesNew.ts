import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender?: {
    name: string;
    role: string;
  };
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  participants: string[];
  last_message?: {
    content: string;
    created_at: string;
  };
}

export const useMessagesNew = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Since user context is removed, we'll need to get conversations differently
      // For now, we'll fetch all conversations or use a placeholder user ID
      const userId = 'placeholder_user_id'; // This should be provided externally

      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          created_at,
          updated_at,
          participants
        `)
        .contains('participants', [userId])
        .order('updated_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setConversations(data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          created_at,
          is_read
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    try {
      setError(null);

      // Since user context is removed, we'll use a placeholder sender ID
      const senderId = 'placeholder_sender_id'; // This should be provided externally

      const { data, error: sendError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content
        })
        .select()
        .single();

      if (sendError) {
        throw sendError;
      }

      if (data) {
        setMessages(prev => [...prev, data]);
      }

      return data;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  };

  const createConversation = async (title: string, participants: string[]) => {
    try {
      setError(null);

      const { data, error: createError } = await supabase
        .from('conversations')
        .insert({
          title,
          participants
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      if (data) {
        setConversations(prev => [data, ...prev]);
      }

      return data;
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      throw err;
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (updateError) {
        throw updateError;
      }

      setMessages(prev => 
        prev.map(msg => msg.id === messageId ? { ...msg, is_read: true } : msg)
      );
    } catch (err) {
      console.error('Error marking message as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark message as read');
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return {
    messages,
    conversations,
    loading,
    error,
    fetchMessages,
    sendMessage,
    createConversation,
    markAsRead,
    refetch: fetchConversations
  };
}; 