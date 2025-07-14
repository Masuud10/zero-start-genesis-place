import React, { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { useMessagesNew } from "@/hooks/useMessagesNew";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const MessagesModuleNew = () => {
  const {
    conversations,
    messages,
    loading,
    error,
    sendMessage,
    loadMessages,
    startConversation,
    getPotentialPartners,
  } = useMessagesNew();

  const { user } = useAuth();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(null);
  const [potentialPartners, setPotentialPartners] = useState<
    Array<{ id: string; name: string; role: string }>
  >([]);
  const [newMessage, setNewMessage] = useState({
    receiver_id: "",
    content: "",
  });
  const [sending, setSending] = useState(false);
  const [messageContent, setMessageContent] = useState("");

  // Load potential conversation partners
  useEffect(() => {
    const loadPartners = async () => {
      if (user) {
        const partners = await getPotentialPartners();
        setPotentialPartners(partners);
      }
    };
    loadPartners();
  }, [user, getPotentialPartners]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation, loadMessages]);

  const handleStartConversation = async () => {
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
      // Start a conversation with the selected user
      const { conversation, error: convError } = await startConversation(
        newMessage.receiver_id
      );

      if (convError) {
        toast({
          title: "Error",
          description: convError.message || "Failed to start conversation",
          variant: "destructive",
        });
        return;
      }

      if (conversation) {
        // Send the initial message
        const { error: msgError } = await sendMessage(
          conversation.id,
          newMessage.content
        );

        if (msgError) {
          toast({
            title: "Error",
            description: msgError.message || "Failed to send message",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Success",
          description: "Conversation started and message sent successfully",
        });

        setIsComposeOpen(false);
        setNewMessage({ receiver_id: "", content: "" });
        setSelectedConversation(conversation.id);
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

  const handleSendMessage = async () => {
    if (!selectedConversation || !messageContent.trim()) {
      toast({
        title: "Error",
        description: "Please select a conversation and enter a message",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      const { error } = await sendMessage(
        selectedConversation,
        messageContent.trim()
      );

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to send message",
          variant: "destructive",
        });
        return;
      }

      setMessageContent("");
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
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

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={handleRetry}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const selectedConv = conversations.find(
    (conv) => conv.id === selectedConversation
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
            Messages
          </h1>
          <p className="text-muted-foreground">Communicate with other users</p>
        </div>

        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              New Conversation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Start New Conversation</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Recipient</label>
                <Select
                  value={newMessage.receiver_id}
                  onValueChange={(value) =>
                    setNewMessage((prev) => ({ ...prev, receiver_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {potentialPartners.map((partner) => (
                      <SelectItem key={partner.id} value={partner.id}>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          {partner.name} ({partner.role})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage.content}
                  onChange={(e) =>
                    setNewMessage((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsComposeOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStartConversation}
                  disabled={
                    sending ||
                    !newMessage.receiver_id ||
                    !newMessage.content.trim()
                  }
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Start Conversation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">
                  Start a new conversation to begin messaging
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conversation.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {conversation.other_participant?.name || "Unknown"}
                        </p>
                        <p className="text-sm opacity-75">
                          {conversation.other_participant?.role || "Unknown"}
                        </p>
                        {conversation.last_message && (
                          <p className="text-xs opacity-60 truncate">
                            {conversation.last_message.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedConv
                ? `Chat with ${
                    selectedConv.other_participant?.name || "Unknown"
                  }`
                : "Select a conversation to start messaging"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedConversation ? (
              <div className="text-center p-8 text-muted-foreground">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a conversation from the list to view messages</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Messages List */}
                <div className="h-96 overflow-y-auto space-y-2 p-4 border rounded-lg">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs p-3 rounded-lg ${
                            message.sender_id === user.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs opacity-60 mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    rows={2}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sending || !messageContent.trim()}
                    className="self-end"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MessagesModuleNew;
