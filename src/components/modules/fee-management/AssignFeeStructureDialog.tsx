
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useClasses } from '@/hooks/useClasses';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarDays, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { FeeStructure } from '@/types/finance';

interface AssignFeeStructureDialogProps {
    isOpen: boolean;
    onClose: () => void;
    feeStructure: FeeStructure;
}

const formSchema = z.object({
    classId: z.string().uuid('Please select a class.'),
    dueDate: z.date({ required_error: 'A due date is required.' }),
});

type FormData = z.infer<typeof formSchema>;

const assignFeeStructure = async ({ feeStructureId, classId, dueDate }: { feeStructureId: string, classId: string, dueDate: string }) => {
    const { data, error } = await supabase.functions.invoke('assign-fee-structure', {
        body: { feeStructureId, classId, dueDate },
    });

    if (error) throw new Error(error.message);
    if (data.error) throw new Error(data.error);
    return data;
};

const AssignFeeStructureDialog: React.FC<AssignFeeStructureDialogProps> = ({ isOpen, onClose, feeStructure }) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { data: classes, isLoading: isLoadingClasses } = useClasses();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });

    const mutation = useMutation({
        mutationFn: assignFeeStructure,
        onSuccess: (data) => {
            toast({ title: 'Success', description: data.message || 'Fee structure assigned to class successfully.' });
            queryClient.invalidateQueries({ queryKey: ['fees'] });
            queryClient.invalidateQueries({ queryKey: ['parentDashboardStats'] });
            onClose();
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: `Failed to assign fee structure: ${error.message}`,
                variant: 'destructive',
            });
        },
    });

    const onSubmit = (values: FormData) => {
        mutation.mutate({
            feeStructureId: feeStructure.id,
            classId: values.classId,
            dueDate: format(values.dueDate, 'yyyy-MM-dd'),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Fee Structure: {feeStructure.name}</DialogTitle>
                    <DialogDescription>
                        Assign this fee structure to a class. This will generate fee records for all active students in that class.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="classId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Class</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingClasses}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a class to assign fees" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {isLoadingClasses ? (
                                                <SelectItem value="loading" disabled>Loading classes...</SelectItem>
                                            ) : (
                                                classes?.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="dueDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Due Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Assign Fees
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default AssignFeeStructureDialog;
