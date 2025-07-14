import React, { useState } from 'react';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { LogIn, MessageSquare } from 'lucide-react';

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

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Authentication Required
            </h2>
            <p className="text-muted-foreground">
              Please log in to access your messages and start conversations.
            </p>
          </div>
          <Alert>
            <LogIn className="h-4 w-4" />
            <AlertDescription>
              You need to be logged in to use the messaging feature.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Left Pane - Conversation List */}
      <div className="w-1/3 border-r border-border bg-card">
        <ConversationList 
          onConversationSelect={setSelectedConversation}
          selectedConversation={selectedConversation}
        />
      </div>

      {/* Right Pane - Chat Window */}
      <div className="flex-1">
        {selectedConversation ? (
          <ChatWindow 
            conversation={selectedConversation}
            onConversationUpdate={setSelectedConversation}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-muted/30">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Welcome to Messages
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Select a conversation from the list to start messaging, or create a new conversation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};