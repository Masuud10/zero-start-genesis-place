import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuthContext } from '@/components/auth/AdminAuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, MessageSquare, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  resolved_at?: string;
}

const TeacherSupportModule = () => {
  const { adminUser } = useAdminAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch teacher's support tickets
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['teacher-support-tickets', adminUser?.id],
    queryFn: async (): Promise<SupportTicket[]> => {
      if (!adminUser?.id) return [];

      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('created_by', adminUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!adminUser?.id
  });

  // Create support ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: { title: string; description: string }) => {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          title: ticketData.title,
          description: ticketData.description,
          created_by: adminUser?.id,
          school_id: adminUser?.school_id,
          status: 'open',
          priority: 'medium',
          category: 'general'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-support-tickets'] });
      toast({
        title: "Support Ticket Created",
        description: "Your support ticket has been submitted successfully.",
      });
      setFormData({ subject: '', message: '' });
      setShowCreateForm(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create support ticket. Please try again.",
        variant: "destructive"
      });
      console.error('Error creating support ticket:', error);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both subject and message fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createTicketMutation.mutateAsync({
        title: formData.subject,
        description: formData.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'open':
        return 'default';
      case 'resolved':
        return 'secondary';
      case 'closed':
        return 'outline';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span>Loading support tickets...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
          <p className="text-gray-600 mt-1">Submit tickets and track your support requests</p>
        </div>
        
        {!showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Ticket
          </Button>
        )}
      </div>

      {/* Create Ticket Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Create Support Ticket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Subject
                </label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your issue"
                  disabled={isSubmitting}
                  maxLength={100}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Message
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Detailed description of your issue or question"
                  rows={5}
                  disabled={isSubmitting}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.message.length}/1000 characters
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !formData.subject.trim() || !formData.message.trim()}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4" />
                      Submit Ticket
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ subject: '', message: '' });
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Support Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            My Support Tickets
            {tickets && (
              <Badge variant="outline" className="ml-2">
                {tickets.length} Total
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!tickets || tickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 font-medium">No Support Tickets</p>
              <p className="text-gray-500 text-sm mt-1">
                Create your first support ticket to get help from our team
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(ticket.status)}
                        <h3 className="font-medium text-gray-900 truncate">
                          {ticket.title}
                        </h3>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {ticket.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Created: {formatDate(ticket.created_at)}</span>
                        {ticket.resolved_at && (
                          <span>Resolved: {formatDate(ticket.resolved_at)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col items-end gap-2">
                      <Badge variant={getStatusVariant(ticket.status)} className="text-xs">
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </Badge>
                      
                      {ticket.priority && (
                        <Badge 
                          variant={ticket.priority === 'high' ? 'destructive' : 'outline'} 
                          className="text-xs"
                        >
                          {ticket.priority} priority
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Information */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-sm mb-1">Need Quick Help?</h3>
              <p className="text-sm text-muted-foreground">
                For urgent issues, please contact your school administrator directly. 
                Support tickets are typically responded to within 24-48 hours during business days.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherSupportModule;