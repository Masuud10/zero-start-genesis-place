import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useExpenseData = () => {
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchExpenseData = useCallback(async () => {
    if (!user?.school_id) {
      console.log('No school_id available for expense data');
      setExpenseBreakdown([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching expense data for school:', user.school_id);
      
      // Fetch expenses for the current academic year
      const currentYear = new Date().getFullYear();
      const yearStart = new Date(currentYear, 0, 1);
      
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('category, amount')
        .eq('school_id', user.school_id)
        .gte('date', yearStart.toISOString());

      if (expensesError) {
        console.error('Error fetching expense data:', expensesError);
        throw expensesError;
      }

      // Group expenses by category
      const categoryMap = new Map();
      let totalExpenses = 0;
      
      expensesData?.forEach(expense => {
        const category = expense.category || 'Other';
        const amount = Number(expense.amount || 0);
        totalExpenses += amount;
        
        if (!categoryMap.has(category)) {
          categoryMap.set(category, 0);
        }
        
        categoryMap.set(category, categoryMap.get(category) + amount);
      });

      // Convert to array format with percentages and colors
      const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
      const expenseData = Array.from(categoryMap.entries())
        .map(([category, amount], index) => ({
          category,
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
          color: colors[index % colors.length]
        }))
        .sort((a, b) => b.amount - a.amount);
      
      // If no data, provide some default structure
      if (expenseData.length === 0) {
        setExpenseBreakdown([
          { category: 'No Expenses', amount: 0, percentage: 100, color: '#9ca3af' }
        ]);
      } else {
        setExpenseBreakdown(expenseData);
      }
      
    } catch (err: unknown) {
      console.error('Error fetching expense data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setExpenseBreakdown([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.school_id]);

  useEffect(() => {
    fetchExpenseData();
  }, [fetchExpenseData]);

  return {
    expenseBreakdown,
    isLoading,
    error,
    refetch: fetchExpenseData
  };
};
