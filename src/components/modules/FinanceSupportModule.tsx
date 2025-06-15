
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import CreateSupportTicketForm from './CreateSupportTicketForm';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const FinanceSupportModule = () => {
    const { tickets, loading, error, refetch } = useSupportTickets();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'open': return 'default';
            case 'in_progress': return 'secondary';
            case 'resolved': return 'outline';
            case 'closed': return 'destructive';
            default: return 'secondary';
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="ml-2">Loading your tickets...</p>
                </div>
            );
        }

        if (error) {
            return (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Tickets</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            );
        }

        if (tickets.length === 0) {
            return (
                <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Support Tickets Found</h3>
                    <p className="text-muted-foreground mt-1">
                        Get started by creating your first support ticket.
                    </p>
                    <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Ticket
                    </Button>
                </div>
            );
        }

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                            <TableCell className="font-medium">{ticket.title}</TableCell>
                            <TableCell>
                                <Badge variant="outline">{ticket.type.replace('_', ' ')}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={ticket.priority === 'high' || ticket.priority === 'urgent' ? 'destructive' : 'secondary'}>
                                    {ticket.priority}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(ticket.status)}>
                                    {ticket.status.replace('_', ' ')}
                                </Badge>
                            </TableCell>
                            <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">My Support Tickets</h2>
                    <p className="text-muted-foreground">
                        Track the status of your support requests here.
                    </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Ticket
                </Button>
            </div>
            <Card>
                <CardContent className="pt-6">
                    {renderContent()}
                </CardContent>
            </Card>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>Create a New Support Ticket</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <CreateSupportTicketForm onSuccess={() => {
                            setIsCreateDialogOpen(false);
                            refetch();
                        }} />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FinanceSupportModule;
