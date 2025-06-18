
import { useState, useEffect, useCallback } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Expense {
  id: string;
  school_id: string;
  title?: string;
  amount: number;
  category: string;
  date: string;
  expense_date?: string;
  description?: string;
  approved_by?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

interface CreateExpenseData {
  title: string;
  amount: number;
  category: string;
  expense_date: string;
  description?: string;
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

      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Expenses fetch error:', fetchError);
        throw new Error(`Failed to fetch expenses: ${fetchError.message}`);
      }

      console.log('Fetched expenses:', data);
      setExpenses(data || []);
      setError(null);
    } catch (err: any) {
      const message = err?.message || 'Failed to fetch expenses';
      console.error('Expenses fetch error:', err);
      setError(message);
      setExpenses([]);
      toast({
        title: "Error Loading Expenses",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isSystemAdmin, schoolId, toast]);

  const createExpense = async (expenseData: CreateExpenseData) => {
    if (!schoolId) {
      const message = 'School ID is required to create expenses';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return { data: null, error: message };
    }

    try {
      console.log('Creating expense with data:', expenseData);

      const insertData = {
        school_id: schoolId,
        title: expenseData.title,
        amount: expenseData.amount,
        category: expenseData.category,
        date: expenseData.expense_date,
        description: expenseData.description || null,
      };

      console.log('Insert data:', insertData);

      const { data, error } = await supabase
        .from('expenses')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Create expense error:', error);
        throw new Error(`Failed to create expense: ${error.message}`);
      }

      console.log('Created expense:', data);

      toast({
        title: "Success",
        description: "Expense has been recorded successfully.",
      });

      await fetchExpenses();
      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to create expense';
      console.error('Create expense error:', err);
      toast({
        title: "Error Creating Expense",
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

      if (error) {
        console.error('Update expense error:', error);
        throw new Error(`Failed to update expense: ${error.message}`);
      }

      toast({
        title: "Success",
        description: "Expense has been updated successfully.",
      });

      await fetchExpenses();
      return { data, error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to update expense';
      console.error('Update expense error:', err);
      toast({
        title: "Error Updating Expense",
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

      if (error) {
        console.error('Delete expense error:', error);
        throw new Error(`Failed to delete expense: ${error.message}`);
      }

      toast({
        title: "Success",
        description: "Expense has been deleted successfully.",
      });

      await fetchExpenses();
      return { error: null };
    } catch (err: any) {
      const message = err?.message || 'Failed to delete expense';
      console.error('Delete expense error:', err);
      toast({
        title: "Error Deleting Expense",
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
