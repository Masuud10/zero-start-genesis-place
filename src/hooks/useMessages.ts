
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

      // First, get conversations for the current user
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          id,
          participant_1_id,
          participant_2_id,
          last_message_preview,
          last_message_at,
          updated_at
        `)
        .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (conversationsError) {
        throw conversationsError;
      }

      // Transform conversations and get participant details
      const transformedConversations: Conversation[] = [];
      const conversationIds = conversationsData?.map(conv => conv.id) || [];

      if (conversationIds.length > 0) {
        // Get messages for all conversations
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            id,
            conversation_id,
            sender_id,
            receiver_id,
            content,
            created_at,
            is_read,
            sender:profiles!messages_sender_id_fkey(name),
            receiver:profiles!messages_receiver_id_fkey(name)
          `)
          .in('conversation_id', conversationIds)
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

        setMessages(transformedMessages);

        // Transform conversations with participant details
        for (const conv of conversationsData || []) {
          const otherParticipantId = conv.participant_1_id === user.id 
            ? conv.participant_2_id 
            : conv.participant_1_id;

          // Get other participant's profile
          const { data: participantProfile } = await supabase
            .from('profiles')
            .select('id, name, role')
            .eq('id', otherParticipantId)
            .single();

          if (participantProfile) {
            transformedConversations.push({
              id: conv.id,
              name: participantProfile.name || 'Unknown',
              role: participantProfile.role || 'unknown'
            });
          }
        }
      }

      // Get potential conversation partners from the same school
      const { data: potentialPartners, error: partnersError } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('school_id', user.school_id)
        .neq('id', user.id);

      if (partnersError) {
        throw partnersError;
      }

      // Add potential partners who don't have conversations yet
      const existingPartnerIds = transformedConversations.map(conv => conv.id);
      const newPartners = (potentialPartners || []).filter(partner => 
        !existingPartnerIds.includes(partner.id)
      );

      const allConversations = [
        ...transformedConversations,
        ...newPartners.map(partner => ({
          id: partner.id,
          name: partner.name || 'Unknown',
          role: partner.role || 'unknown'
        }))
      ];

      setConversations(allConversations);
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
      // First, check if a conversation exists between these users
      const { data: existingConversation, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1_id.eq.${user.id},participant_2_id.eq.${receiverId}),and(participant_1_id.eq.${receiverId},participant_2_id.eq.${user.id})`)
        .single();

      let conversationId: string;

      if (existingConversation) {
        conversationId = existingConversation.id;
      } else {
        // Create a new conversation
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            participant_1_id: user.id,
            participant_2_id: receiverId,
            school_id: user.school_id
          })
          .select('id')
          .single();

        if (createError) {
          throw createError;
        }

        conversationId = newConversation.id;
      }

      // Send the message
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
      
      // Reload conversations to get the new one
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
