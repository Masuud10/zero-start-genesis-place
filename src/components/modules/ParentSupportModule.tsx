
import React, { useState } from 'react';
import { useSupportTickets, SupportTicket } from '@/hooks/useSupportTickets';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const ParentSupportModule: React.FC = () => {
    const { user } = useAuth();
    const { tickets, loading, error, createTicket, refetch } = useSupportTickets();
    const [isCreating, setIsCreating] = useState(false);
    const [newTicket, setNewTicket] = useState({
        title: '',
        description: '',
        type: 'technical' as 'technical' | 'feature_request' | 'billing' | 'feedback',
        priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    });
    const { toast } = useToast();

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        const ticketToCreate = {
            ...newTicket,
            status: 'open' as 'open',
            school_id: user.school_id,
        };

        const { error: createError } = await createTicket(ticketToCreate as any);

        if (createError) {
            toast({
                variant: "destructive",
                title: "Error creating ticket",
                description: createError.message,
            });
        } else {
            toast({
                title: "Support ticket created",
                description: "We have received your request and will get back to you shortly.",
            });
            setNewTicket({ title: '', description: '', type: 'technical', priority: 'medium' });
            setIsCreating(false);
            refetch();
        }
    };

    const parentTickets = tickets.filter(ticket => ticket.created_by === user?.id);

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
            case 'resolved': return 'bg-green-100 text-green-800 hover:bg-green-200';
            case 'closed': return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Support Tickets</h3>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    {isCreating ? 'Cancel' : 'Create New Ticket'}
                </Button>
            </div>

            {isCreating && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create a New Support Ticket</CardTitle>
                        <CardDescription>Please describe your issue in detail.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateTicket} className="space-y-4">
                            <Input
                                placeholder="Ticket Title"
                                value={newTicket.title}
                                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                                required
                            />
                            <Textarea
                                placeholder="Describe your issue..."
                                value={newTicket.description}
                                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                required
                                rows={5}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Select onValueChange={(value) => setNewTicket({ ...newTicket, type: value as any })} defaultValue={newTicket.type}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="technical">Technical Issue</SelectItem>
                                        <SelectItem value="billing">Billing Question</SelectItem>
                                        <SelectItem value="feedback">Feedback</SelectItem>
                                        <SelectItem value="feature_request">Feature Request</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select onValueChange={(value) => setNewTicket({ ...newTicket, priority: value as any })} defaultValue={newTicket.priority}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit">Submit Ticket</Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Your Submitted Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading && <p>Loading tickets...</p>}
                    {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                    {!loading && !error && parentTickets.length === 0 && (
                        <p>You have not submitted any support tickets.</p>
                    )}
                    {!loading && parentTickets.length > 0 && (
                        <div className="space-y-4">
                            {parentTickets.map(ticket => (
                                <div key={ticket.id} className="border p-4 rounded-lg bg-background">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold">{ticket.title}</h4>
                                        <Badge className={`${getStatusBadgeVariant(ticket.status)}`}>
                                            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Created on: {new Date(ticket.created_at).toLocaleDateString()}
                                    </p>
                                    <p className="mt-2 text-sm">{ticket.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ParentSupportModule;
