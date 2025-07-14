
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: number;
  sender_id: string;
  content: string;
  created_at: string;
  conversation_id: number;
  sender?: { id: string; name: string };
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

  const loadConversations = async () => {
    if (!user) {
      setLoading(false);
      setError("No user found");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Single API call to get conversations - avoid duplicate calls
      const { data: conversationsResponse, error: conversationsError } = await supabase.functions.invoke('get-conversations');

      if (conversationsError) {
        throw conversationsError;
      }

      const conversationsData = conversationsResponse?.conversations || [];
      
      // Transform to match the expected Conversation interface
      const transformedConversations: Conversation[] = conversationsData.map((conv: any) => ({
        id: conv.other_participant.id,
        name: conv.other_participant.name,
        role: conv.other_participant.role
      }));

      setConversations(transformedConversations);
      
      // Clear messages initially - they will be loaded per conversation
      setMessages([]);
      setError(null);
    } catch (err: unknown) {
      console.error('Error loading conversations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversations. Please try again.';
      setError(errorMessage);
      setMessages([]);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
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
        content: content.trim(),
        created_at: messageResponse.message.created_at,
        conversation_id: conversationId,
        sender: { id: user.id, name: user.name || 'Unknown' }
      };

      setMessages(prev => [newMessage, ...prev]);
      
      // Reload conversations to get the updated list
      await loadConversations();
      
      return { error: null };
    } catch (err: unknown) {
      console.error('Error sending message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message. Please try again.';
      return { error: { message: errorMessage } };
    }
  };

  const markAsRead = async (messageId: number) => {
    // Note: With the new schema, read status is not tracked per message
    // This function is kept for compatibility but doesn't do anything
    return { error: null };
  };

  return {
    messages,
    conversations,
    loading,
    error,
    sendMessage,
    markAsRead,
    retry: loadConversations,
  };
};
