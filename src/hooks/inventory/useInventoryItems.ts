import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiTenantQuery } from '@/hooks/useMultiTenantQuery';
import { toast } from 'sonner';

export interface InventoryItem {
  id: number;
  name: string;
  sku?: string;
  description?: string;
  category_id?: number;
  school_id: string;
  current_quantity: number;
  reorder_level: number;
  unit_cost?: number;
  supplier_id?: number;
  created_at: string;
  updated_at: string;
  inventory_categories?: {
    name: string;
  };
  inventory_suppliers?: {
    name: string;
  };
}

export interface InventoryCategory {
  id: number;
  name: string;
  description?: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface InventorySupplier {
  id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export const useInventoryItems = () => {
  const { user } = useAuth();
  const { createSchoolScopedQuery } = useMultiTenantQuery();

  return useQuery({
    queryKey: ['inventory-items', user?.school_id],
    queryFn: async () => {
      if (!user?.school_id) {
        throw new Error('No school access');
      }

      const query = createSchoolScopedQuery('inventory_items' as any, `
        *,
        inventory_categories (
          name
        ),
        inventory_suppliers (
          name
        )
      `);
      const { data, error } = await query.order('name', { ascending: true });

      if (error) throw error;
      return data as InventoryItem[];
    },
    enabled: !!user?.school_id,
  });
};

export const useInventoryCategories = () => {
  const { user } = useAuth();
  const { createSchoolScopedQuery } = useMultiTenantQuery();

  return useQuery({
    queryKey: ['inventory-categories', user?.school_id],
    queryFn: async () => {
      if (!user?.school_id) {
        throw new Error('No school access');
      }

      const query = createSchoolScopedQuery('inventory_categories' as any, '*');
      const { data, error } = await query.order('name', { ascending: true });

      if (error) throw error;
      return data as InventoryCategory[];
    },
    enabled: !!user?.school_id,
  });
};

export const useInventorySuppliers = () => {
  const { user } = useAuth();
  const { createSchoolScopedQuery } = useMultiTenantQuery();

  return useQuery({
    queryKey: ['inventory-suppliers', user?.school_id],
    queryFn: async () => {
      if (!user?.school_id) {
        throw new Error('No school access');
      }

      const query = createSchoolScopedQuery('inventory_suppliers' as any, '*');
      const { data, error } = await query.order('name', { ascending: true });

      if (error) throw error;
      return data as InventorySupplier[];
    },
    enabled: !!user?.school_id,
  });
};

export const useLowStockItems = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['low-stock-items', user?.school_id],
    queryFn: async () => {
      if (!user?.school_id) {
        throw new Error('No school access');
      }

      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          inventory_categories (
            name
          )
        `)
        .eq('school_id', user.school_id)
        .filter('current_quantity', 'lte', 'reorder_level')
        .order('current_quantity', { ascending: true });

      if (error) throw error;
      return data as InventoryItem[];
    },
    enabled: !!user?.school_id,
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'school_id'>) => {
      if (!user?.school_id) {
        throw new Error('No school access');
      }

      const { data, error } = await supabase
        .from('inventory_items')
        .insert([{ ...itemData, school_id: user.school_id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-items'] });
      toast.success('Item created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create item');
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<InventoryItem> & { id: number }) => {
      if (!user?.school_id) {
        throw new Error('No school access');
      }

      const { data, error } = await supabase
        .from('inventory_items')
        .update(updateData)
        .eq('id', id)
        .eq('school_id', user.school_id) // Ensure multi-tenant security
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-items'] });
      toast.success('Item updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update item');
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!user?.school_id) {
        throw new Error('No school access');
      }

      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id)
        .eq('school_id', user.school_id); // Ensure multi-tenant security

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-items'] });
      toast.success('Item deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete item');
    },
  });
};