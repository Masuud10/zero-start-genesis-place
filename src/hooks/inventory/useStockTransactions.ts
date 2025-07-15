import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StockTransaction {
  id: number;
  transaction_date: string;
  transaction_type: 'stock_in' | 'stock_out' | 'adjustment';
  quantity_change: number;
  notes?: string;
  inventory_items?: {
    id: number;
    name: string;
    sku?: string;
  };
}

export interface InventoryStats {
  totalItems: number;
  recentTransactions: number;
  lowStockItems: number;
}

export const useStockTransactions = () => {
  return useQuery({
    queryKey: ['stock-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_transactions')
        .select(`
          *,
          inventory_items:item_id (
            id,
            name,
            sku
          )
        `)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data as StockTransaction[];
    },
  });
};

export const useRecentStockTransactions = (limit: number = 5) => {
  return useQuery({
    queryKey: ['recent-stock-transactions', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_transactions')
        .select(`
          *,
          inventory_items:item_id (
            id,
            name,
            sku
          )
        `)
        .order('transaction_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as StockTransaction[];
    },
  });
};

export const useInventoryStats = () => {
  return useQuery({
    queryKey: ['inventory-stats'],
    queryFn: async () => {
      // Get total items count
      const { count: totalItems, error: itemsError } = await supabase
        .from('inventory_items')
        .select('*', { count: 'exact', head: true });

      if (itemsError) throw itemsError;

      // Get recent transactions (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recentTransactions, error: transactionsError } = await supabase
        .from('stock_transactions')
        .select('*', { count: 'exact', head: true })
        .gte('transaction_date', sevenDaysAgo.toISOString());

      if (transactionsError) throw transactionsError;

      return {
        totalItems: totalItems || 0,
        recentTransactions: recentTransactions || 0,
        lowStockItems: 0, // This will be calculated on the frontend
      } as InventoryStats;
    },
  });
};

export const useCreateStockTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionData: {
      item_id: number;
      transaction_type: 'stock_in' | 'stock_out' | 'adjustment';
      quantity_change: number;
      notes?: string;
      supplier_id?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('inventory-transactions', {
        body: transactionData,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['recent-stock-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      toast.success('Transaction completed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to complete transaction');
    },
  });
};