
import { useState, useEffect, useCallback } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Expense {
  id: string;
  school_id: string;
  title: string;
  amount: number;
  category: string;
  expense_date: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSystemAdmin, schoolId } = useSchoolScopedData();
  const { toast } = useToast();

  const fetchExpenses = useCallback(async () => {
    if (!schoolId && !isSystemAdmin) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('expenses').select('*');

      if (!isSystemAdmin && schoolId) {
        query = query.eq('school_id', schoolId);
      }

      query = query.order('expense_date', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setExpenses(data || []);
      setError(null);
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch expenses';
      setError(message);
      setExpenses([]);
      toast({
        title: "Expenses Fetch Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isSystemAdmin, schoolId, toast]);

  const createExpense = async (expenseData: {
    title: string;
    amount: number;
    category: string;
    expense_date: string;
    description?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          ...expenseData,
          date: expenseData.expense_date, // Map expense_date to date for database
          school_id: schoolId,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Expense Added",
        description: `Expense ${expenseData.title} has been recorded successfully.`,
      });

      fetchExpenses();
      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to create expense';
      toast({
        title: "Create Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Expense Updated",
        description: "Expense has been updated successfully.",
      });

      fetchExpenses();
      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to update expense';
      toast({
        title: "Update Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Expense Deleted",
        description: "Expense has been deleted successfully.",
      });

      fetchExpenses();
      return { error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to delete expense';
      toast({
        title: "Delete Error",
        description: message,
        variant: "destructive",
      });
      return { error: message };
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses
  };
};
