
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender_name: string;
  receiver_name: string;
}

interface Conversation {
  id: string;
  name: string;
  role: string;
}

export const useMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch real messages from Supabase
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey(name),
            receiver:profiles!messages_receiver_id_fkey(name)
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (messagesError) {
          throw messagesError;
        }

        // Transform messages data
        const transformedMessages: Message[] = (messagesData || []).map(msg => ({
          id: msg.id,
          sender_id: msg.sender_id,
          receiver_id: msg.receiver_id,
          content: msg.content,
          created_at: msg.created_at,
          is_read: msg.is_read,
          sender_name: msg.sender?.name || 'Unknown',
          receiver_name: msg.receiver?.name || 'Unknown'
        }));

        // Fetch potential conversation partners from the same school
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('profiles')
          .select('id, name, role')
          .eq('school_id', user.school_id)
          .neq('id', user.id);

        if (conversationsError) {
          throw conversationsError;
        }

        const transformedConversations: Conversation[] = (conversationsData || []).map(profile => ({
          id: profile.id,
          name: profile.name,
          role: profile.role
        }));
        
        setMessages(transformedMessages);
        setConversations(transformedConversations);
      } catch (err) {
        console.error('Error loading messages:', err);
        setError('Failed to load messages. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [user]);

  const sendMessage = async (receiverId: string, content: string) => {
    if (!user) {
      return { error: { message: 'User not authenticated' } };
    }

    if (!receiverId || !content.trim()) {
      return { error: { message: 'Receiver and content are required' } };
    }

    try {
      // Generate a conversation ID based on the participants
      const conversationId = [user.id, receiverId].sort().join('-');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content: content.trim(),
          school_id: user.school_id,
          conversation_id: conversationId
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Refresh messages
      const receiverName = conversations.find(c => c.id === receiverId)?.name || 'Unknown';
      
      const newMessage: Message = {
        id: data.id,
        sender_id: user.id,
        receiver_id: receiverId,
        content: content.trim(),
        created_at: data.created_at,
        is_read: false,
        sender_name: user.name || 'Unknown',
        receiver_name: receiverName
      };

      setMessages(prev => [newMessage, ...prev]);
      return { error: null };
    } catch (err) {
      console.error('Error sending message:', err);
      return { error: { message: 'Failed to send message. Please try again.' } };
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .eq('receiver_id', user?.id);

      if (error) {
        throw error;
      }

      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
      return { error: null };
    } catch (err) {
      console.error('Error marking message as read:', err);
      return { error: { message: 'Failed to mark message as read' } };
    }
  };

  return {
    messages,
    conversations,
    loading,
    error,
    sendMessage,
    markAsRead
  };
};
