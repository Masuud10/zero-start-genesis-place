
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

      console.log('💰 Optimized financial summary fetch for school:', user.school_id);

      // Add timeout control
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('💰 Financial summary query timed out');
      }, 5000);

      try {
        // Use Promise.allSettled for parallel execution with better error handling
        const [feesResult, expensesResult, mpesaResult] = await Promise.allSettled([
          // Optimized fees query
          supabase
            .from('fees')
            .select('amount, paid_amount')
            .eq('school_id', user.school_id)
            .not('amount', 'is', null)
            .limit(500),

          // Optimized expenses query
          supabase
            .from('expenses')
            .select('amount, category')
            .eq('school_id', user.school_id)
            .not('amount', 'is', null)
            .limit(200),

          // Optimized MPESA count query
          supabase
            .from('mpesa_transactions')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', user.school_id)
            .eq('transaction_status', 'Success')
        ]);

        clearTimeout(timeoutId);

        // Process results with safe fallbacks
        const feesData = feesResult.status === 'fulfilled' ? feesResult.value.data || [] : [];
        const expensesData = expensesResult.status === 'fulfilled' ? expensesResult.value.data || [] : [];
        const mpesaCount = mpesaResult.status === 'fulfilled' ? mpesaResult.value.count || 0 : 0;

        // Calculate totals from fees
        const totalFees = feesData.reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0);
        const totalCollected = feesData.reduce((sum, fee) => sum + (Number(fee.paid_amount) || 0), 0);
        const outstandingBalance = Math.max(0, totalFees - totalCollected);

        const totalExpenses = expensesData.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);

        const mpesaTransactionsCount = mpesaCount;

        // Set summary
        setSummary({
          total_fees: totalFees,
          total_collected: totalCollected,
          outstanding_balance: outstandingBalance,
          total_expenses: totalExpenses,
          net_income: totalCollected - totalExpenses,
          mpesa_transactions_count: mpesaTransactionsCount
        });

        // Optimized expense breakdown
        const expenseMap = new Map<string, { amount: number; count: number }>();
        expensesData.forEach(expense => {
          const category = expense.category || 'Other';
          const existing = expenseMap.get(category) || { amount: 0, count: 0 };
          expenseMap.set(category, {
            amount: existing.amount + (Number(expense.amount) || 0),
            count: existing.count + 1
          });
        });

        const breakdown = Array.from(expenseMap.entries()).slice(0, 10).map(([category, data]) => ({
          category,
          amount: data.amount,
          count: data.count
        }));
        setExpenseBreakdown(breakdown);

        // Optimized collection trends (last 30 days) using existing fees data
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

        // Get recent collection data efficiently
        const recentFeesResult = await supabase
          .from('fees')
          .select('paid_date, paid_amount')
          .eq('school_id', user.school_id)
          .not('paid_date', 'is', null)
          .not('paid_amount', 'is', null)
          .gte('paid_date', thirtyDaysAgoStr)
          .limit(100);

        const trendsData = recentFeesResult.data || [];

        // Group by date
        const trendMap = new Map<string, { amount: number; count: number }>();
        trendsData.forEach(fee => {
          if (fee.paid_date && fee.paid_amount) {
            const existing = trendMap.get(fee.paid_date) || { amount: 0, count: 0 };
            trendMap.set(fee.paid_date, {
              amount: existing.amount + (Number(fee.paid_amount) || 0),
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
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-30); // Keep only last 30 days

        setCollectionTrends(trends);
      } catch (queryError) {
        clearTimeout(timeoutId);
        throw queryError;
      }

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
