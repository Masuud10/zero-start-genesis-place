
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { Loader2 } from 'lucide-react';

const ticketSchema = z.object({
  type: z.enum(['technical', 'feature_request', 'billing', 'feedback']),
  title: z.string().min(5, 'Subject must be at least 5 characters long.'),
  description: z.string().min(20, 'Description must be at least 20 characters long.'),
});

const CreateSupportTicketForm = () => {
    const { toast } = useToast();
    const { createTicket } = useSupportTickets();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof ticketSchema>>({
        resolver: zodResolver(ticketSchema),
        defaultValues: {
            type: 'technical',
            title: '',
            description: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof ticketSchema>) => {
        setIsSubmitting(true);
        const ticketData = {
            ...values,
            status: 'open' as const,
            priority: 'medium' as const,
        };
        
        const { error } = await createTicket(ticketData);

        if (error) {
            toast({
                title: 'Error submitting ticket',
                description: (error as any).message || 'An unknown error occurred.',
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Ticket submitted successfully!',
                description: 'Our team will get back to you shortly.',
            });
            form.reset();
        }
        setIsSubmitting(false);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ticket Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a ticket type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="technical">Technical Issue</SelectItem>
                                    <SelectItem value="billing">Billing Question</SelectItem>
                                    <SelectItem value="feature_request">Feature Request</SelectItem>
                                    <SelectItem value="feedback">General Feedback</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Issue with payment processing" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Please describe the issue in detail..." rows={8} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Ticket'
                    )}
                </Button>
            </form>
        </Form>
    );
};

export default CreateSupportTicketForm;
