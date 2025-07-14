import React, { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ConversationList } from "@/components/messaging/ConversationList";
import { MessageThread } from "@/components/messaging/MessageThread";

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

const MessagesModule = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to view messages.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar - Conversations */}
      <div className="w-80 border-r border-border bg-card">
        <ConversationList 
          onConversationSelect={setSelectedConversation}
          selectedConversation={selectedConversation}
        />
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <MessageThread conversation={selectedConversation} />
        ) : (
          <>
            {/* Empty State Header */}
            <div className="h-16 bg-card border-b border-border flex items-center px-6">
              <MessageSquare className="w-6 h-6 text-primary mr-3" />
              <div>
                <h3 className="font-semibold text-foreground">Welcome to Messages</h3>
                <p className="text-sm text-muted-foreground">Select a conversation to start messaging</p>
              </div>
            </div>

            {/* Empty State Content */}
            <div className="flex-1 flex items-center justify-center bg-muted/20">
              <div className="text-center max-w-sm">
                <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Start a Conversation
                </h3>
                <p className="text-muted-foreground mb-6">
                  Select a conversation from the sidebar or create a new one to begin messaging with other users in your organization.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesModule;
