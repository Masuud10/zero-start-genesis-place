
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FinancialSummary {
  total_fees: number;
  total_collected: number;
  outstanding_balance: number;
  total_expenses: number;
  net_income: number;
  mpesa_transactions_count: number;
}

interface ExpenseBreakdown {
  category: string;
  amount: number;
  count: number;
}

interface CollectionTrend {
  date: string;
  amount: number;
  transaction_count: number;
}

export const useFinancialSummary = () => {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseBreakdown[]>([]);
  const [collectionTrends, setCollectionTrends] = useState<CollectionTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFinancialSummary = async () => {
    if (!user?.school_id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch financial summary using the database function
      const { data: summaryData, error: summaryError } = await supabase.rpc('get_financial_summary', {
        p_school_id: user.school_id
      });

      if (summaryError) throw summaryError;
      setSummary(summaryData);

      // Fetch expense breakdown
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('category, amount')
        .eq('school_id', user.school_id);

      if (expensesError) throw expensesError;

      // Group expenses by category
      const expenseMap = new Map<string, { amount: number; count: number }>();
      expensesData?.forEach(expense => {
        const existing = expenseMap.get(expense.category) || { amount: 0, count: 0 };
        expenseMap.set(expense.category, {
          amount: existing.amount + expense.amount,
          count: existing.count + 1
        });
      });

      const breakdown = Array.from(expenseMap.entries()).map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count
      }));
      setExpenseBreakdown(breakdown);

      // Fetch collection trends (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: trendsData, error: trendsError } = await supabase
        .from('fees')
        .select('paid_date, paid_amount')
        .eq('school_id', user.school_id)
        .not('paid_date', 'is', null)
        .gte('paid_date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (trendsError) throw trendsError;

      // Group by date
      const trendMap = new Map<string, { amount: number; count: number }>();
      trendsData?.forEach(fee => {
        if (fee.paid_date && fee.paid_amount) {
          const existing = trendMap.get(fee.paid_date) || { amount: 0, count: 0 };
          trendMap.set(fee.paid_date, {
            amount: existing.amount + fee.paid_amount,
            count: existing.count + 1
          });
        }
      });

      const trends = Array.from(trendMap.entries())
        .map(([date, data]) => ({
          date,
          amount: data.amount,
          transaction_count: data.count
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setCollectionTrends(trends);

    } catch (err: any) {
      console.error('Error fetching financial summary:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch financial summary",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.school_id) {
      fetchFinancialSummary();
    }
  }, [user?.school_id]);

  return {
    summary,
    expenseBreakdown,
    collectionTrends,
    loading,
    error,
    refetch: fetchFinancialSummary,
  };
};
