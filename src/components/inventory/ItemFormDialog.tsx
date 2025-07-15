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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreateInventoryItem, useUpdateInventoryItem, type InventoryItem } from '@/hooks/inventory/useInventoryItems';
import { useInventoryCategories } from '@/hooks/inventory/useInventoryCategories';
import { useInventorySuppliers } from '@/hooks/inventory/useInventorySuppliers';

const itemFormSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  category_id: z.number().optional(),
  supplier_id: z.number().optional(),
  sku: z.string().optional(),
  reorder_level: z.number().min(0, 'Reorder level must be 0 or greater'),
  current_quantity: z.number().min(0, 'Current quantity must be 0 or greater').optional(),
});

type ItemFormData = z.infer<typeof itemFormSchema>;

interface ItemFormDialogProps {
  open: boolean;
  onClose: () => void;
  item?: InventoryItem | null;
}

const ItemFormDialog: React.FC<ItemFormDialogProps> = ({
  open,
  onClose,
  item,
}) => {
  const { data: categories = [] } = useInventoryCategories();
  const { data: suppliers = [] } = useInventorySuppliers();
  const createMutation = useCreateInventoryItem();
  const updateMutation = useUpdateInventoryItem();

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: '',
      description: '',
      category_id: undefined,
      supplier_id: undefined,
      sku: '',
      reorder_level: 0,
      current_quantity: 0,
    },
  });

  React.useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        description: item.description || '',
        category_id: item.category_id || undefined,
        supplier_id: item.supplier_id || undefined,
        sku: item.sku || '',
        reorder_level: item.reorder_level,
        current_quantity: item.current_quantity,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        category_id: undefined,
        supplier_id: undefined,
        sku: '',
        reorder_level: 0,
        current_quantity: 0,
      });
    }
  }, [item, form]);

  const onSubmit = (data: ItemFormData) => {
    const formData = {
      ...data,
      category_id: data.category_id || undefined,
      supplier_id: data.supplier_id || undefined,
    };

    if (item) {
      // For updates, exclude current_quantity from the payload
      const { current_quantity, ...updateData } = formData;
      updateMutation.mutate(
        { id: item.id, data: updateData },
        {
          onSuccess: () => {
            onClose();
            form.reset();
          },
        }
      );
    } else {
      createMutation.mutate(formData, {
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
            {item ? 'Edit Item' : 'Add New Item'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
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
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reorder_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Level</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="current_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={!!item} // Disable when editing - use stock transactions instead
                      />
                    </FormControl>
                    <FormMessage />
                    {item && (
                      <p className="text-xs text-muted-foreground">
                        Use Stock Movements to change quantity
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="gradient-navy">
                {isLoading ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ItemFormDialog;