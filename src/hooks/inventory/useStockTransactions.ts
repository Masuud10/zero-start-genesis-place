import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface StockTransaction {
  id: number;
  item_id: number;
  transaction_type: string;
  quantity_change: number;
  notes?: string;
  transaction_date: string;
  user_id: string;
  created_at: string;
  // Relations
  inventory_items?: {
    id: number;
    name: string;
    sku?: string;
  };
}

export interface CreateStockTransactionData {
  item_id: number;
  transaction_type: 'stock_in' | 'stock_out' | 'adjustment';
  quantity_change: number;
  notes?: string;
}

export const useStockTransactions = (itemId?: number) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['stock-transactions', user?.school_id, itemId],
    queryFn: async (): Promise<StockTransaction[]> => {
      if (!user?.school_id) {
        throw new Error('User school not found');
      }

      let query = supabase
        .from('stock_transactions')
        .select(`
          *,
          inventory_items:item_id (
            id,
            name,
            sku
          )
        `);

      if (itemId) {
        query = query.eq('item_id', itemId);
      }

      const { data, error } = await query
        .order('transaction_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.school_id && user?.role === 'finance_officer',
  });
};

export const useRecentStockTransactions = (limit: number = 10) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['recent-stock-transactions', user?.school_id, limit],
    queryFn: async (): Promise<StockTransaction[]> => {
      if (!user?.school_id) {
        throw new Error('User school not found');
      }

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
      return data || [];
    },
    enabled: !!user?.school_id && user?.role === 'finance_officer',
  });
};

export const useCreateStockTransaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateStockTransactionData): Promise<StockTransaction> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data: transaction, error } = await supabase
        .from('stock_transactions')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select(`
          *,
          inventory_items:item_id (
            id,
            name,
            sku
          )
        `)
        .single();

      if (error) throw error;
      return transaction;
    },
    onSuccess: (transaction) => {
      queryClient.invalidateQueries({ queryKey: ['stock-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['recent-stock-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-item', transaction.item_id] });
      
      const actionText = transaction.transaction_type === 'stock_in' ? 'added to' : 
                        transaction.transaction_type === 'stock_out' ? 'removed from' : 'adjusted for';
      
      toast({
        title: 'Success',
        description: `Stock ${actionText} ${transaction.inventory_items?.name} successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useInventoryStats = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['inventory-stats', user?.school_id],
    queryFn: async () => {
      if (!user?.school_id) {
        throw new Error('User school not found');
      }

      // Get total items count
      const { count: totalItems, error: itemsError } = await supabase
        .from('inventory_items')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', user.school_id);

      if (itemsError) throw itemsError;

      // Get low stock items count
      // Get all items and filter low stock items on the client side
      const { data: allItems, error: lowStockError } = await supabase
        .from('inventory_items')
        .select('current_quantity, reorder_level')
        .eq('school_id', user.school_id);

      if (lowStockError) throw lowStockError;

      const lowStockCount = allItems?.filter(item => item.current_quantity <= item.reorder_level).length || 0;

      

      // Get recent transactions count (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentTransactions, error: transactionsError } = await supabase
        .from('stock_transactions')
        .select('*', { count: 'exact', head: true })
        .gte('transaction_date', sevenDaysAgo.toISOString());

      if (transactionsError) throw transactionsError;

      return {
        totalItems: totalItems || 0,
        lowStockItems: lowStockCount,
        recentTransactions: recentTransactions || 0,
      };
    },
    enabled: !!user?.school_id && user?.role === 'finance_officer',
  });
};