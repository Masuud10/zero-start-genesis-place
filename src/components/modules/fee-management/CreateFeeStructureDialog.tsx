
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { FeeStructure } from '@/types/finance';
import { Database } from '@/integrations/supabase/types';

interface CreateFeeStructureDialogProps {
  onClose: () => void;
  isOpen: boolean;
}

const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  academic_year: z.string().regex(/^\d{4}$/, 'Enter a valid year (e.g., 2025).'),
  term: z.string().min(1, 'Term is required.'),
});

type FormData = z.infer<typeof formSchema>;
type FeeStructureInsert = Database['public']['Tables']['fee_structures']['Insert'];

const createFeeStructure = async (values: FeeStructureInsert): Promise<FeeStructure> => {
  const { data, error } = await supabase
    .from('fee_structures')
    .insert(values)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const CreateFeeStructureDialog: React.FC<CreateFeeStructureDialogProps> = ({ onClose, isOpen }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      academic_year: new Date().getFullYear().toString(),
      term: '',
    },
  });

  const mutation = useMutation({
    mutationFn: createFeeStructure,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Fee structure created successfully.' });
      queryClient.invalidateQueries({ queryKey: ['feeStructures', user?.school_id] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to create fee structure: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: FormData) => {
    if (!user?.school_id) {
      toast({ title: 'Error', description: 'No school associated with your account.', variant: 'destructive' });
      return;
    }
    mutation.mutate({
      name: values.name,
      academic_year: values.academic_year,
      term: values.term,
      school_id: user.school_id,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Fee Structure</DialogTitle>
          <DialogDescription>
            Set up a new fee structure for an academic period. You can add fee items later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Structure Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Term 1 2025 Fees" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="academic_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Term 1, Semester 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Structure
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFeeStructureDialog;
