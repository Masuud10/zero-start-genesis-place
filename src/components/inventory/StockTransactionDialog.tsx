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
import { useCreateStockTransaction } from '@/hooks/inventory/useStockTransactions';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';

const transactionFormSchema = z.object({
  item_id: z.number().min(1, 'Please select an item'),
  quantity_change: z.number().min(1, 'Quantity must be greater than 0'),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionFormSchema>;

interface StockTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  transactionType: 'stock_in' | 'stock_out' | 'adjustment';
}

const StockTransactionDialog: React.FC<StockTransactionDialogProps> = ({
  open,
  onClose,
  transactionType,
}) => {
  const { data: items = [] } = useInventoryItems();
  const createMutation = useCreateStockTransaction();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      item_id: 0,
      quantity_change: 0,
      notes: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        item_id: 0,
        quantity_change: 0,
        notes: '',
      });
    }
  }, [open, form]);

  const onSubmit = (data: TransactionFormData) => {
    if (!data.item_id || data.item_id === 0) {
      form.setError('item_id', { message: 'Please select an item' });
      return;
    }
    
    const transactionData = {
      item_id: data.item_id,
      transaction_type: transactionType,
      quantity_change: transactionType === 'stock_out' ? -data.quantity_change : data.quantity_change,
      notes: data.notes,
    };

    createMutation.mutate(transactionData, {
      onSuccess: () => {
        onClose();
        form.reset();
      },
    });
  };

  const getTitle = () => {
    switch (transactionType) {
      case 'stock_in':
        return 'Add Stock';
      case 'stock_out':
        return 'Remove Stock';
      case 'adjustment':
        return 'Adjust Stock';
      default:
        return 'Stock Transaction';
    }
  };

  const getQuantityLabel = () => {
    switch (transactionType) {
      case 'stock_in':
        return 'Quantity to Add';
      case 'stock_out':
        return 'Quantity to Remove';
      case 'adjustment':
        return 'Adjustment Quantity';
      default:
        return 'Quantity';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="item_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Item</FormLabel>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an item" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          <div className="flex flex-col">
                            <span>{item.name}</span>
                            <span className="text-xs text-muted-foreground">
                              Current: {item.current_quantity} | SKU: {item.sku || 'N/A'}
                            </span>
                          </div>
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
              name="quantity_change"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getQuantityLabel()}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add any notes about this transaction..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending} 
                className="gradient-navy"
              >
                {createMutation.isPending ? 'Processing...' : getTitle()}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default StockTransactionDialog;