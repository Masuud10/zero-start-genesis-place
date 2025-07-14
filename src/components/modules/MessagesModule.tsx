import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  MessageSquare,
  Send,
  User,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const MessagesModule = () => {
  const { messages, conversations, loading, error, sendMessage } =
    useMessages();
  const { user } = useAuth();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    receiver_id: "",
    content: "",
  });
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.receiver_id || !newMessage.content.trim()) {
      toast({
        title: "Error",
        description: "Please select a recipient and enter a message",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      const { error } = await sendMessage(
        newMessage.receiver_id,
        newMessage.content
      );

      if (!error) {
        toast({
          title: "Success",
          description: "Message sent successfully",
        });
        setIsComposeOpen(false);
        setNewMessage({ receiver_id: "", content: "" });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to send message",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {error.includes("conversations") || error.includes("messages")
                ? "Unable to load messaging data. Please try again."
                : error}
            </span>
            <Button onClick={handleRetry} size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* WhatsApp-like Layout with Light Blue/Teal Theme */}
      
      {/* Left Sidebar - Conversations */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="h-16 bg-gradient-to-r from-teal-500 to-cyan-600 flex items-center justify-between px-4 text-white">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center">New Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">To</label>
                  <Select
                    value={newMessage.receiver_id}
                    onValueChange={(value) =>
                      setNewMessage((prev) => ({ ...prev, receiver_id: value }))
                    }
                    disabled={sending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      {conversations.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name} ({person.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea
                    value={newMessage.content}
                    onChange={(e) =>
                      setNewMessage((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    placeholder="Type your message..."
                    rows={4}
                    disabled={sending}
                    className="resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsComposeOpen(false)}
                    disabled={sending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={sending}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto bg-white">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Conversations</h3>
              <p className="text-gray-500 text-sm">
                Start a new conversation to begin messaging
              </p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {conversation.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {conversation.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {conversation.role}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Chat Header */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <MessageSquare className="w-6 h-6 text-teal-600 mr-3" />
          <div>
            <h3 className="font-semibold text-gray-900">Select a conversation</h3>
            <p className="text-sm text-gray-500">Choose someone to start messaging</p>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Welcome to Messages
            </h3>
            <p className="text-gray-500 mb-6">
              Send and receive messages with other users in your organization. Start by selecting a conversation or creating a new one.
            </p>
            <Button 
              onClick={() => setIsComposeOpen(true)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Start New Conversation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesModule;
