
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
        
        // Mock data for now - in production this would come from Supabase
        const mockMessages: Message[] = [
          {
            id: '1',
            sender_id: 'user1',
            receiver_id: user.id || '',
            content: 'Welcome to the school management system!',
            created_at: new Date().toISOString(),
            is_read: false,
            sender_name: 'Principal Smith',
            receiver_name: user.name || ''
          },
          {
            id: '2',
            sender_id: user.id || '',
            receiver_id: 'user2',
            content: 'Thank you for the update on my child\'s progress.',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            is_read: true,
            sender_name: user.name || '',
            receiver_name: 'Teacher Johnson'
          }
        ];

        const mockConversations: Conversation[] = [
          { id: 'user1', name: 'Principal Smith', role: 'Principal' },
          { id: 'user2', name: 'Teacher Johnson', role: 'Teacher' },
          { id: 'user3', name: 'Finance Officer', role: 'Finance' },
          { id: 'user4', name: 'School Admin', role: 'Admin' }
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setMessages(mockMessages);
        setConversations(mockConversations);
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
      const receiverName = conversations.find(c => c.id === receiverId)?.name || 'Unknown';
      
      const newMessage: Message = {
        id: Date.now().toString(),
        sender_id: user.id,
        receiver_id: receiverId,
        content: content.trim(),
        created_at: new Date().toISOString(),
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
