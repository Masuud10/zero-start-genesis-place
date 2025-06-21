
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FeeStructure {
  id: string;
  school_id: string;
  name: string;
  academic_year: string;
  term: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  items?: FeeStructureItem[];
}

interface FeeStructureItem {
  id: string;
  fee_structure_id: string;
  name: string;
  description?: string;
  amount: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export const useFeeStructures = () => {
  const [data, setData] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFeeStructures = async () => {
    if (!user?.school_id) return;

    try {
      setLoading(true);
      const { data: structures, error } = await supabase
        .from('fee_structures')
        .select(`
          *,
          fee_structure_items (*)
        `)
        .eq('school_id', user.school_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setData(structures?.map(structure => ({
        ...structure,
        items: structure.fee_structure_items || []
      })) || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch fee structures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createFeeStructure = async (structureData: Partial<FeeStructure> & { items?: Omit<FeeStructureItem, 'id' | 'fee_structure_id' | 'created_at' | 'updated_at'>[] }) => {
    if (!user?.school_id) return { error: 'No school associated with user' };

    try {
      const { data: structure, error: structureError } = await supabase
        .from('fee_structures')
        .insert({
          ...structureData,
          school_id: user.school_id,
        })
        .select()
        .single();

      if (structureError) throw structureError;

      if (structureData.items && structure) {
        const items = structureData.items.map(item => ({
          ...item,
          fee_structure_id: structure.id,
        }));

        const { error: itemsError } = await supabase
          .from('fee_structure_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      toast({
        title: "Success",
        description: "Fee structure created successfully",
      });

      fetchFeeStructures(); // Refresh data
      return { data: structure, error: null };
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to create fee structure: ${err.message}`,
        variant: "destructive",
      });
      return { error: err.message };
    }
  };

  const updateFeeStructure = async (id: string, updates: Partial<FeeStructure>) => {
    try {
      const { error } = await supabase
        .from('fee_structures')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fee structure updated successfully",
      });

      fetchFeeStructures(); // Refresh data
      return { error: null };
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to update fee structure: ${err.message}`,
        variant: "destructive",
      });
      return { error: err.message };
    }
  };

  const deleteFeeStructure = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fee_structures')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fee structure deleted successfully",
      });

      fetchFeeStructures(); // Refresh data
      return { error: null };
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to delete fee structure: ${err.message}`,
        variant: "destructive",
      });
      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchFeeStructures();
  }, [user?.school_id]);

  return {
    data,
    loading,
    error,
    refetch: fetchFeeStructures,
    createFeeStructure,
    updateFeeStructure,
    deleteFeeStructure,
  };
};
