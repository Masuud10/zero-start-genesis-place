import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface StockTransaction {
  id: number;
  transaction_date: string;
  transaction_type: 'stock_in' | 'stock_out' | 'adjustment';
  quantity_change: number;
  notes?: string;
  item_id: number;
  user_id: string;
  created_at: string;
  inventory_items?: {
    id: number;
    name: string;
    sku?: string;
    school_id: string;
  };
}

export interface InventoryStats {
  totalItems: number;
  recentTransactions: number;
  lowStockItems: number;
  totalValue: number;
  monthlyMovement: number;
}

export const useStockTransactions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['stock-transactions', user?.school_id],
    queryFn: async () => {
      if (!user?.school_id) {
        throw new Error('No school access');
      }

      const { data, error } = await supabase
        .from('stock_transactions')
        .select(`
          *,
          inventory_items!inner (
            id,
            name,
            sku,
            school_id
          )
        `)
        .eq('inventory_items.school_id', user.school_id)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!user?.school_id,
  });
};

export const useRecentStockTransactions = (limit: number = 5) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recent-stock-transactions', user?.school_id, limit],
    queryFn: async () => {
      if (!user?.school_id) {
        throw new Error('No school access');
      }

      const { data, error } = await supabase
        .from('stock_transactions')
        .select(`
          *,
          inventory_items!inner (
            id,
            name,
            sku,
            school_id
          )
        `)
        .eq('inventory_items.school_id', user.school_id)
        .order('transaction_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as any[];
    },
    enabled: !!user?.school_id,
  });
};

export const useInventoryStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['inventory-stats', user?.school_id],
    queryFn: async () => {
      if (!user?.school_id) {
        throw new Error('No school access');
      }

      // Get total items count and value
      const { data: itemsData, error: itemsError } = await supabase
        .from('inventory_items')
        .select('current_quantity, reorder_level')
        .eq('school_id', user.school_id);

      if (itemsError) throw itemsError;

      const totalItems = itemsData?.length || 0;
      const totalValue = itemsData?.reduce((sum, item) => {
        return sum + (item.current_quantity * 50); // Mock unit cost
      }, 0) || 0;
      const lowStockCount = itemsData?.filter(item => 
        item.current_quantity <= item.reorder_level
      ).length || 0;

      // Get recent transactions (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recentTransactions, error: transactionsError } = await supabase
        .from('stock_transactions')
        .select(`
          inventory_items!inner (school_id)
        `, { count: 'exact', head: true })
        .eq('inventory_items.school_id', user.school_id)
        .gte('transaction_date', sevenDaysAgo.toISOString());

      if (transactionsError) throw transactionsError;

      // Get monthly movement value (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: monthlyMovements, error: monthlyError } = await supabase
        .from('stock_transactions')
        .select(`
          quantity_change,
          inventory_items!inner (
            school_id
          )
        `)
        .eq('inventory_items.school_id', user.school_id)
        .gte('transaction_date', thirtyDaysAgo.toISOString());

      if (monthlyError) throw monthlyError;

      const monthlyMovement = monthlyMovements?.reduce((sum, transaction) => {
        const value = Math.abs(transaction.quantity_change) * 50; // Mock unit cost
        return sum + value;
      }, 0) || 0;

      return {
        totalItems,
        recentTransactions: recentTransactions || 0,
        lowStockItems: lowStockCount,
        totalValue,
        monthlyMovement,
      } as InventoryStats;
    },
    enabled: !!user?.school_id,
  });
};

export const useCreateStockTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (transactionData: {
      item_id: number;
      transaction_type: 'stock_in' | 'stock_out' | 'adjustment';
      quantity_change: number;
      notes?: string;
    }) => {
      if (!user?.school_id) {
        throw new Error('No school access');
      }

      // First verify the item belongs to the user's school
      const { data: item, error: itemError } = await supabase
        .from('inventory_items')
        .select('id, school_id, current_quantity')
        .eq('id', transactionData.item_id)
        .eq('school_id', user.school_id)
        .single();

      if (itemError || !item) {
        throw new Error('Item not found or access denied');
      }

      // Create the transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('stock_transactions')
        .insert([{
          ...transactionData,
          transaction_date: new Date().toISOString(),
          user_id: user.id,
        }])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update the inventory item quantity
      const newQuantity = item.current_quantity + transactionData.quantity_change;
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ 
          current_quantity: Math.max(0, newQuantity),
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionData.item_id)
        .eq('school_id', user.school_id);

      if (updateError) throw updateError;

      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['recent-stock-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-items'] });
      toast.success('Transaction completed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to complete transaction');
    },
  });
};