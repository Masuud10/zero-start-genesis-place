
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

  const loadMessages = async () => {
    if (!user) {
      setLoading(false);
      setError("No user found");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use the edge function to get conversations with correct schema
      const { data: conversationsResponse, error: conversationsError } = await supabase.functions.invoke('get-conversations');

      if (conversationsError) {
        throw conversationsError;
      }

      const conversationsData = conversationsResponse?.conversations || [];
      
      // Transform to match the expected Conversation interface
      const transformedConversations: Conversation[] = conversationsData.map((conv: any) => ({
        id: conv.other_participant.id, // Use participant ID as conversation identifier
        name: conv.other_participant.name,
        role: conv.other_participant.role
      }));

      setConversations(transformedConversations);
      
      // Get all messages for display (you can enhance this to get messages per conversation)
      setMessages([]);
      setError(null);
    } catch (err: unknown) {
      console.error('Error loading messages:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages. Please try again.';
      setError(errorMessage);
      setMessages([]);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      // Use edge function to create conversation and send message
      const { data: conversationResponse, error: convError } = await supabase.functions.invoke('create-conversation', {
        body: { otherParticipantId: receiverId }
      });

      if (convError) {
        throw convError;
      }

      const conversationId = conversationResponse.conversation.id;

      // Use edge function to send the message
      const { data: messageResponse, error: messageError } = await supabase.functions.invoke('send-message', {
        body: { 
          conversationId: conversationId,
          message_content: content.trim() 
        }
      });

      if (messageError) {
        throw messageError;
      }

      const newMessage: Message = {
        id: messageResponse.message.id,
        sender_id: user.id,
        receiver_id: receiverId,
        content: content.trim(),
        created_at: messageResponse.message.created_at,
        is_read: false,
        sender_name: user.name || 'Unknown',
        receiver_name: 'Unknown' // Will be populated from edge function response if needed
      };

      setMessages(prev => [newMessage, ...prev]);
      
      // Reload conversations to get the updated list
      await loadMessages();
      
      return { error: null };
    } catch (err: unknown) {
      console.error('Error sending message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message. Please try again.';
      return { error: { message: errorMessage } };
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
      return { error: { message: 'Failed to mark message as read' } };
    }
  };

  return {
    messages,
    conversations,
    loading,
    error,
    sendMessage,
    markAsRead,
    retry: loadMessages,
  };
};
