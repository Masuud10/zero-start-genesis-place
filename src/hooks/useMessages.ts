
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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

  useEffect(() => {
    // Simulate loading messages
    const loadMessages = async () => {
      setLoading(true);
      
      // Mock data
      const mockMessages: Message[] = [
        {
          id: '1',
          sender_id: 'user1',
          receiver_id: user?.id || '',
          content: 'Welcome to the school management system!',
          created_at: new Date().toISOString(),
          is_read: false,
          sender_name: 'Principal Smith',
          receiver_name: user?.name || ''
        },
        {
          id: '2',
          sender_id: user?.id || '',
          receiver_id: 'user2',
          content: 'Thank you for the update on my child\'s progress.',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_read: true,
          sender_name: user?.name || '',
          receiver_name: 'Teacher Johnson'
        }
      ];

      const mockConversations: Conversation[] = [
        { id: 'user1', name: 'Principal Smith', role: 'Principal' },
        { id: 'user2', name: 'Teacher Johnson', role: 'Teacher' },
        { id: 'user3', name: 'Finance Officer', role: 'Finance' },
        { id: 'user4', name: 'School Admin', role: 'Admin' }
      ];

      setTimeout(() => {
        setMessages(mockMessages);
        setConversations(mockConversations);
        setLoading(false);
      }, 1000);
    };

    if (user) {
      loadMessages();
    }
  }, [user]);

  const sendMessage = async (receiverId: string, content: string) => {
    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender_id: user?.id || '',
        receiver_id: receiverId,
        content,
        created_at: new Date().toISOString(),
        is_read: false,
        sender_name: user?.name || '',
        receiver_name: conversations.find(c => c.id === receiverId)?.name || ''
      };

      setMessages(prev => [newMessage, ...prev]);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    messages,
    conversations,
    loading,
    sendMessage
  };
};
