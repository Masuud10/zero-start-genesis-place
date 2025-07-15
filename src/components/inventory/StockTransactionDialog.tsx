import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInventoryItems } from '@/hooks/inventory/useInventoryItems';
import { useCreateStockTransaction } from '@/hooks/inventory/useStockTransactions';

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
  const [itemId, setItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [supplierId, setSupplierId] = useState('');

  const { data: items = [] } = useInventoryItems();
  const createTransaction = useCreateStockTransaction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemId || !quantity) {
      return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return;
    }

    await createTransaction.mutateAsync({
      item_id: parseInt(itemId),
      transaction_type: transactionType,
      quantity_change: transactionType === 'stock_out' ? -quantityNum : quantityNum,
      notes: notes || undefined,
      supplier_id: supplierId || undefined,
    });

    handleClose();
  };

  const handleClose = () => {
    setItemId('');
    setQuantity('');
    setNotes('');
    setSupplierId('');
    onClose();
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item">Item</Label>
            <Select value={itemId} onValueChange={setItemId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select an item" />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.name} {item.sku && `(${item.sku})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              required
            />
          </div>

          {transactionType === 'stock_in' && (
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier (Optional)</Label>
              <Input
                id="supplier"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                placeholder="Enter supplier name"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createTransaction.isPending}
              className="gradient-navy"
            >
              {createTransaction.isPending ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StockTransactionDialog;