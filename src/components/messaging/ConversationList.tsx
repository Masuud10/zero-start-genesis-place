import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NewMessageModal } from './NewMessageModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, MessageSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  other_participant: {
    id: string;
    name: string;
    role: string;
  };
  last_message_preview?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

interface ConversationListProps {
  onConversationSelect: (conversation: Conversation) => void;
  selectedConversation: Conversation | null;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onConversationSelect,
  selectedConversation
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // Reduced API calls - only fetch when necessary
      const { data, error } = await supabase.functions.invoke('get-conversations');
      
      if (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive"
        });
        return;
      }

      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch once on mount to prevent duplicate API calls
    fetchConversations();
  }, [user]);

  // Reduced realtime subscriptions to prevent excessive API calls
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversations_minimal')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          // Only refetch on new conversations, not on every change
          console.log('New conversation created, refetching...');
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const filteredConversations = conversations.filter(conv =>
    conv.other_participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNewConversation = (conversation: Conversation) => {
    setConversations(prev => [conversation, ...prev]);
    onConversationSelect(conversation);
    setIsNewMessageOpen(false);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Messages</h2>
          <Button
            onClick={() => setIsNewMessageOpen(true)}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setIsNewMessageOpen(true)}
                variant="outline"
                className="mt-3"
              >
                Start a conversation
              </Button>
            )}
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onConversationSelect(conversation)}
              className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedConversation?.id === conversation.id 
                  ? 'bg-muted border-l-4 border-l-primary' 
                  : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getInitials(conversation.other_participant.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground truncate">
                      {conversation.other_participant.name}
                    </h3>
                    {conversation.last_message_at && (
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.last_message_at)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.last_message_preview || 'No messages yet'}
                    </p>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {conversation.other_participant.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <NewMessageModal
        isOpen={isNewMessageOpen}
        onClose={() => setIsNewMessageOpen(false)}
        onConversationCreated={handleNewConversation}
      />
    </div>
  );
};