import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useStockTransactions } from '@/hooks/inventory/useStockTransactions';
import { format } from 'date-fns';
import type { InventoryItem } from '@/hooks/inventory/useInventoryItems';

interface ItemDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  item?: InventoryItem | null;
}

const ItemDetailsDialog: React.FC<ItemDetailsDialogProps> = ({
  open,
  onClose,
  item,
}) => {
  const { data: transactions = [], isLoading } = useStockTransactions();

  if (!item) return null;

  const isLowStock = item.current_quantity <= item.reorder_level;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Item Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Item Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
              {item.description && (
                <p className="text-muted-foreground mt-1">{item.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">SKU</p>
                <p className="text-foreground">{item.sku || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <p className="text-foreground">
                  Category {item.category_id || 'None'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Supplier</p>
                <p className="text-foreground">
                  Supplier {item.supplier_id || 'None'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={isLowStock ? 'destructive' : 'default'}>
                  {item.current_quantity <= 0 
                    ? 'Out of Stock' 
                    : isLowStock 
                    ? 'Low Stock' 
                    : 'In Stock'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Quantity</p>
                <p className={`text-lg font-semibold ${isLowStock ? 'text-red-600' : 'text-foreground'}`}>
                  {item.current_quantity}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reorder Level</p>
                <p className="text-lg font-semibold text-foreground">{item.reorder_level}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Transaction History */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Transaction History</h4>
            
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-muted h-16 rounded"></div>
                ))}
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            transaction.transaction_type === 'stock_in' 
                              ? 'default' 
                              : transaction.transaction_type === 'stock_out'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {transaction.transaction_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className={`font-semibold ${
                          transaction.transaction_type === 'stock_in' 
                            ? 'text-green-600' 
                            : transaction.transaction_type === 'stock_out'
                            ? 'text-red-600'
                            : 'text-blue-600'
                        }`}>
                          {transaction.transaction_type === 'stock_in' ? '+' : 
                           transaction.transaction_type === 'stock_out' ? '-' : ''}
                          {Math.abs(transaction.quantity_change)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(transaction.transaction_date), 'MMM dd, yyyy HH:mm')}
                      </p>
                      {transaction.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Note: {transaction.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No transactions recorded for this item
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItemDetailsDialog;