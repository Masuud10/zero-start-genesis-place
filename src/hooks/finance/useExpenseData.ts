
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ExpenseBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export const useExpenseData = () => {
  const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchExpenseData = async () => {
    if (!user?.school_id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('school_id', user.school_id);

      if (expensesError) throw expensesError;

      // Calculate expense breakdown with colors and proper type casting
      const expenseGroups = expensesData?.reduce((acc: any, expense) => {
        const category = expense.category || 'Other';
        const currentAmount = typeof acc[category] === 'number' ? acc[category] : Number(acc[category] || 0);
        const expenseAmount = typeof expense.amount === 'number' ? expense.amount : Number(expense.amount || 0);
        acc[category] = currentAmount + expenseAmount;
        return acc;
      }, {}) || {};

      const totalExpenses = Object.values(expenseGroups).reduce((sum: number, amount) => {
        const numAmount = typeof amount === 'number' ? amount : Number(amount || 0);
        return sum + numAmount;
      }, 0);

      const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
      const data = Object.entries(expenseGroups).map(([category, amount]: [string, any], index) => {
        const numAmount = typeof amount === 'number' ? amount : Number(amount || 0);
        const numTotalExpenses = typeof totalExpenses === 'number' ? totalExpenses : Number(totalExpenses || 0);
        return {
          category,
          amount: numAmount,
          percentage: numTotalExpenses > 0 ? Number(((numAmount / numTotalExpenses) * 100).toFixed(2)) : 0,
          color: colors[index % colors.length]
        };
      });

      setExpenseBreakdown(data);

    } catch (err: any) {
      console.error('Error fetching expense data:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseData();
  }, [user?.school_id]);

  return {
    expenseBreakdown,
    isLoading,
    error,
    refetch: fetchExpenseData
  };
};
