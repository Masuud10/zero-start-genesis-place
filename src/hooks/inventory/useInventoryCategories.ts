import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface InventoryCategory {
  id: number;
  school_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInventoryCategoryData {
  name: string;
  description?: string;
}

export interface UpdateInventoryCategoryData {
  name?: string;
  description?: string;
}

export const useInventoryCategories = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['inventory-categories', user?.school_id],
    queryFn: async (): Promise<InventoryCategory[]> => {
      if (!user?.school_id) {
        throw new Error('User school not found');
      }

      const { data, error } = await supabase
        .from('inventory_categories')
        .select('*')
        .eq('school_id', user.school_id)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.school_id && user?.role === 'finance_officer',
  });
};

export const useCreateInventoryCategory = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateInventoryCategoryData): Promise<InventoryCategory> => {
      if (!user?.school_id) {
        throw new Error('User school not found');
      }

      const { data: category, error } = await supabase
        .from('inventory_categories')
        .insert({
          ...data,
          school_id: user.school_id,
        })
        .select()
        .single();

      if (error) throw error;
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-categories'] });
      toast({
        title: 'Success',
        description: 'Category created successfully',
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

export const useUpdateInventoryCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateInventoryCategoryData;
    }): Promise<InventoryCategory> => {
      const { data: category, error } = await supabase
        .from('inventory_categories')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-categories'] });
      toast({
        title: 'Success',
        description: 'Category updated successfully',
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

export const useDeleteInventoryCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const { error } = await supabase
        .from('inventory_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-categories'] });
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
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