import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface InventorySupplier {
  id: number;
  school_id: string;
  name: string;
  contact_person?: string;
  phone_number?: string;
  email?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInventorySupplierData {
  name: string;
  contact_person?: string;
  phone_number?: string;
  email?: string;
  address?: string;
}

export interface UpdateInventorySupplierData {
  name?: string;
  contact_person?: string;
  phone_number?: string;
  email?: string;
  address?: string;
}

export const useInventorySuppliers = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['inventory-suppliers', user?.school_id],
    queryFn: async (): Promise<InventorySupplier[]> => {
      if (!user?.school_id) {
        throw new Error('User school not found');
      }

      const { data, error } = await supabase
        .from('inventory_suppliers')
        .select('*')
        .eq('school_id', user.school_id)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.school_id && user?.role === 'finance_officer',
  });
};

export const useCreateInventorySupplier = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateInventorySupplierData): Promise<InventorySupplier> => {
      if (!user?.school_id) {
        throw new Error('User school not found');
      }

      const { data: supplier, error } = await supabase
        .from('inventory_suppliers')
        .insert({
          ...data,
          school_id: user.school_id,
        })
        .select()
        .single();

      if (error) throw error;
      return supplier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-suppliers'] });
      toast({
        title: 'Success',
        description: 'Supplier created successfully',
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

export const useUpdateInventorySupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateInventorySupplierData;
    }): Promise<InventorySupplier> => {
      const { data: supplier, error } = await supabase
        .from('inventory_suppliers')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return supplier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-suppliers'] });
      toast({
        title: 'Success',
        description: 'Supplier updated successfully',
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

export const useDeleteInventorySupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const { error } = await supabase
        .from('inventory_suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-suppliers'] });
      toast({
        title: 'Success',
        description: 'Supplier deleted successfully',
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