import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: number;
  content: string;
  sender_id: string;
  conversation_id: number;
  created_at: string;
}

interface Conversation {
  id: number;
  participant_ids: string[];
  created_at: string;
  other_participant?: {
    id: string;
    name: string;
    role: string;
  };
  last_message?: {
    content: string;
    created_at: string;
  };
}

export const useMessagesNew = () => {
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

      // Get conversations where the current user is a participant
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .contains('participant_ids', [user.id])
        .order('created_at', { ascending: false });

      if (conversationsError) {
        throw conversationsError;
      }

      // Transform conversations with participant details
      const transformedConversations: Conversation[] = [];
      
      for (const conv of conversationsData || []) {
        // Find the other participant (not the current user)
        const otherParticipantId = conv.participant_ids.find(id => id !== user.id);
        
        if (otherParticipantId) {
          // Get other participant's profile
          const { data: participantProfile } = await supabase
            .from('profiles')
            .select('id, name, role')
            .eq('id', otherParticipantId)
            .single();

          // Get the last message in this conversation
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          transformedConversations.push({
            id: conv.id,
            participant_ids: conv.participant_ids,
            created_at: conv.created_at,
            other_participant: participantProfile ? {
              id: participantProfile.id,
              name: participantProfile.name || 'Unknown',
              role: participantProfile.role || 'unknown'
            } : undefined,
            last_message: lastMessage ? {
              content: lastMessage.content,
              created_at: lastMessage.created_at
            } : undefined
          });
        }
      }

      setConversations(transformedConversations);
      setError(null);
    } catch (err: unknown) {
      console.error('Error loading conversations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversations. Please try again.';
      setError(errorMessage);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    if (!user || !conversationId) {
      return;
    }

    try {
      // Get messages for the specific conversation
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        throw messagesError;
      }

      setMessages(messagesData || []);
    } catch (err: unknown) {
      console.error('Error loading messages:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages. Please try again.';
      setError(errorMessage);
      setMessages([]);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user]);

  const createConversation = async (participantIds: string[]) => {
    if (!user) {
      return { error: { message: 'User not authenticated' } };
    }

    try {
      // Ensure the current user is included in the participant list
      const allParticipants = [...new Set([...participantIds, user.id])];
      
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          participant_ids: allParticipants
        })
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      // Reload conversations to include the new one
      await loadConversations();
      
      return { conversation, error: null };
    } catch (err: unknown) {
      console.error('Error creating conversation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create conversation. Please try again.';
      return { error: { message: errorMessage } };
    }
  };

  const sendMessage = async (conversationId: number, content: string) => {
    if (!user) {
      return { error: { message: 'User not authenticated' } };
    }

    if (!conversationId || !content.trim()) {
      return { error: { message: 'Conversation ID and content are required' } };
    }

    try {
      // Verify the user is a participant in this conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('participant_ids')
        .eq('id', conversationId)
        .single();

      if (convError || !conversation) {
        throw new Error('Conversation not found');
      }

      if (!conversation.participant_ids.includes(user.id)) {
        throw new Error('You are not a participant in this conversation');
      }

      // Send the message
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim()
        })
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      // Add the new message to the current messages list
      setMessages(prev => [...prev, message]);
      
      // Reload conversations to update the last message
      await loadConversations();
      
      return { message, error: null };
    } catch (err: unknown) {
      console.error('Error sending message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message. Please try again.';
      return { error: { message: errorMessage } };
    }
  };

  const startConversation = async (otherUserId: string) => {
    if (!user) {
      return { error: { message: 'User not authenticated' } };
    }

    try {
      // Check if a conversation already exists between these users
      const { data: existingConversation, error: checkError } = await supabase
        .from('conversations')
        .select('*')
        .contains('participant_ids', [user.id, otherUserId])
        .single();

      if (existingConversation) {
        return { conversation: existingConversation, error: null };
      }

      // Create a new conversation
      return await createConversation([otherUserId]);
    } catch (err: unknown) {
      console.error('Error starting conversation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start conversation. Please try again.';
      return { error: { message: errorMessage } };
    }
  };

  const getPotentialPartners = async () => {
    if (!user) {
      return [];
    }

    try {
      // Get users from the same school who are not the current user
      const { data: potentialPartners, error } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('school_id', user.school_id)
        .neq('id', user.id);

      if (error) {
        throw error;
      }

      return potentialPartners || [];
    } catch (err: unknown) {
      console.error('Error getting potential partners:', err);
      return [];
    }
  };

  return {
    messages,
    conversations,
    loading,
    error,
    sendMessage,
    loadMessages,
    createConversation,
    startConversation,
    getPotentialPartners,
    retry: loadConversations,
  };
}; 