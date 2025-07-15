import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { useStockTransactions } from '@/hooks/inventory/useStockTransactions';
import StockTransactionDialog from '@/components/inventory/StockTransactionDialog';
import { format } from 'date-fns';
import type { StockTransaction } from '@/hooks/inventory/useStockTransactions';

const StockMovementsTab: React.FC = () => {
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'stock_in' | 'stock_out' | 'adjustment'>('stock_in');

  const { data: transactions = [], isLoading } = useStockTransactions();

  const handleStockIn = () => {
    setTransactionType('stock_in');
    setTransactionDialogOpen(true);
  };

  const handleStockOut = () => {
    setTransactionType('stock_out');
    setTransactionDialogOpen(true);
  };

  const handleAdjustment = () => {
    setTransactionType('adjustment');
    setTransactionDialogOpen(true);
  };

  const columns = [
    {
      accessorKey: 'transaction_date' as keyof StockTransaction,
      header: 'Date',
      cell: ({ row }: { row: { original: StockTransaction } }) => (
        <span className="text-sm">
          {format(new Date(row.original.transaction_date), 'MMM dd, yyyy HH:mm')}
        </span>
      ),
    },
    {
      accessorKey: 'inventory_items' as keyof StockTransaction,
      header: 'Item',
      cell: ({ row }: { row: { original: StockTransaction } }) => (
        <div>
          <div className="font-medium">{row.original.inventory_items?.name}</div>
          {row.original.inventory_items?.sku && (
            <div className="text-sm text-muted-foreground">SKU: {row.original.inventory_items.sku}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'transaction_type' as keyof StockTransaction,
      header: 'Type',
      cell: ({ row }: { row: { original: StockTransaction } }) => {
        const type = row.original.transaction_type;
        const colors = {
          stock_in: 'text-green-600 bg-green-50',
          stock_out: 'text-red-600 bg-red-50',
          adjustment: 'text-blue-600 bg-blue-50',
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50'}`}>
            {type.replace('_', ' ').toUpperCase()}
          </span>
        );
      },
    },
    {
      accessorKey: 'quantity_change' as keyof StockTransaction,
      header: 'Quantity Change',
      cell: ({ row }: { row: { original: StockTransaction } }) => {
        const change = row.original.quantity_change;
        const type = row.original.transaction_type;
        return (
          <span className={`font-medium ${
            type === 'stock_in' 
              ? 'text-green-600' 
              : type === 'stock_out'
              ? 'text-red-600'
              : 'text-blue-600'
          }`}>
            {type === 'stock_in' ? '+' : type === 'stock_out' ? '-' : ''}
            {Math.abs(change)}
          </span>
        );
      },
    },
    {
      accessorKey: 'notes' as keyof StockTransaction,
      header: 'Notes',
      cell: ({ row }: { row: { original: StockTransaction } }) => (
        <span className="text-sm">{row.original.notes || '-'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stock In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleStockIn}
              className="w-full gradient-navy"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Stock
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stock Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleStockOut}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              <Minus className="h-4 w-4 mr-2" />
              Remove Stock
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Adjustment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleAdjustment}
              variant="outline"
              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Adjust Stock
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={transactions}
            loading={isLoading}
          />
        </CardContent>
      </Card>

      <StockTransactionDialog
        open={transactionDialogOpen}
        onClose={() => setTransactionDialogOpen(false)}
        transactionType={transactionType}
      />
    </div>
  );
};

export default StockMovementsTab;