import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreateInventoryCategory, useUpdateInventoryCategory, type InventoryCategory } from '@/hooks/inventory/useInventoryCategories';

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  category?: InventoryCategory | null;
}

const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  open,
  onClose,
  category,
}) => {
  const createMutation = useCreateInventoryCategory();
  const updateMutation = useUpdateInventoryCategory();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  React.useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
      });
    }
  }, [category, form]);

  const onSubmit = (data: CategoryFormData) => {
    if (category) {
      updateMutation.mutate(
        { id: category.id, data },
        {
          onSuccess: () => {
            onClose();
            form.reset();
          },
        }
      );
    } else {
      // Ensure name is not empty when creating
      if (!data.name.trim()) {
        form.setError('name', { message: 'Category name is required' });
        return;
      }
      createMutation.mutate(data as { name: string; description?: string }, {
        onSuccess: () => {
          onClose();
          form.reset();
        },
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Edit Category' : 'Add New Category'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="gradient-navy">
                {isLoading ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryFormDialog;