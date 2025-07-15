import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface InventoryItem {
  id: number;
  school_id: string;
  name: string;
  description?: string;
  category_id?: number;
  supplier_id?: number;
  sku?: string;
  reorder_level: number;
  current_quantity: number;
  created_at: string;
  updated_at: string;
  // Relations
  inventory_categories?: {
    id: number;
    name: string;
  };
  inventory_suppliers?: {
    id: number;
    name: string;
  };
}

export interface CreateInventoryItemData {
  name: string;
  description?: string;
  category_id?: number;
  supplier_id?: number;
  sku?: string;
  reorder_level?: number;
  current_quantity?: number;
}

export interface UpdateInventoryItemData {
  name?: string;
  description?: string;
  category_id?: number;
  supplier_id?: number;
  sku?: string;
  reorder_level?: number;
}

export const useInventoryItems = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['inventory-items', user?.school_id],
    queryFn: async (): Promise<InventoryItem[]> => {
      if (!user?.school_id) {
        throw new Error('User school not found');
      }

      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          inventory_categories:category_id (
            id,
            name
          ),
          inventory_suppliers:supplier_id (
            id,
            name
          )
        `)
        .eq('school_id', user.school_id)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.school_id && user?.role === 'finance_officer',
  });
};

export const useInventoryItem = (id: number) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['inventory-item', id],
    queryFn: async (): Promise<InventoryItem> => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          inventory_categories:category_id (
            id,
            name
          ),
          inventory_suppliers:supplier_id (
            id,
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user?.school_id && user?.role === 'finance_officer',
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateInventoryItemData): Promise<InventoryItem> => {
      if (!user?.school_id) {
        throw new Error('User school not found');
      }

      const { data: item, error } = await supabase
        .from('inventory_items')
        .insert({
          ...data,
          school_id: user.school_id,
        })
        .select()
        .single();

      if (error) throw error;
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({
        title: 'Success',
        description: 'Item created successfully',
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

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateInventoryItemData;
    }): Promise<InventoryItem> => {
      const { data: item, error } = await supabase
        .from('inventory_items')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-item'] });
      toast({
        title: 'Success',
        description: 'Item updated successfully',
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

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({
        title: 'Success',
        description: 'Item deleted successfully',
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