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
    <div className="h-screen flex bg-slate-50">
      {/* Left Sidebar - Conversations */}
      <div className="w-80 bg-white shadow-lg border-r border-slate-200">
        <ConversationList 
          onConversationSelect={setSelectedConversation}
          selectedConversation={selectedConversation}
        />
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {selectedConversation ? (
          <MessageThread conversation={selectedConversation} />
        ) : (
          <>
            {/* Empty State Header */}
            <div className="h-16 bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center px-6 shadow-sm">
              <MessageSquare className="w-6 h-6 text-white mr-3" />
              <div>
                <h3 className="font-semibold text-white">Welcome to Messages</h3>
                <p className="text-sm text-teal-100">Select a conversation to start messaging</p>
              </div>
            </div>

            {/* Empty State Content */}
            <div className="flex-1 flex items-center justify-center bg-slate-50">
              <div className="text-center max-w-sm">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                  Start a Conversation
                </h3>
                <p className="text-slate-500 mb-6 leading-relaxed">
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
