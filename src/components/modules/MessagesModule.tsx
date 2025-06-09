
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, MessageSquare, Send, User } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

const MessagesModule = () => {
  const { messages, conversations, loading, sendMessage } = useMessages();
  const { user } = useAuth();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    receiver_id: '',
    content: ''
  });

  const handleSendMessage = async () => {
    if (!newMessage.receiver_id || !newMessage.content.trim()) {
      toast({
        title: "Error",
        description: "Please select a recipient and enter a message",
        variant: "destructive"
      });
      return;
    }

    const { error } = await sendMessage(newMessage.receiver_id, newMessage.content);

    if (!error) {
      toast({
        title: "Success",
        description: "Message sent successfully"
      });
      setIsComposeOpen(false);
      setNewMessage({ receiver_id: '', content: '' });
    } else {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

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
              Compose Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compose New Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">To</label>
                <Select value={newMessage.receiver_id} onValueChange={(value) => setNewMessage(prev => ({ ...prev, receiver_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {conversations.map(person => (
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
                  onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Type your message here..."
                  rows={6}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendMessage}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {messages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Messages</h3>
              <p className="text-muted-foreground">Start a conversation by composing a new message.</p>
            </CardContent>
          </Card>
        ) : (
          messages.map((message) => (
            <Card key={message.id} className={`hover:shadow-md transition-shadow ${!message.is_read && message.receiver_id === user?.id ? 'border-blue-200 bg-blue-50/30' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">
                      {message.sender_id === user?.id ? `To: ${message.receiver_name}` : `From: ${message.sender_name}`}
                    </span>
                    {!message.is_read && message.receiver_id === user?.id && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.created_at).toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{message.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MessagesModule;
