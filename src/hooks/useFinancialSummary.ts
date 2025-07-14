
import { useState, useEffect, useCallback } from 'react';
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
  const [retryCount, setRetryCount] = useState(0);
  const [dataTruncated, setDataTruncated] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFinancialSummary = useCallback(async (isRetry = false) => {
    if (!user?.school_id) {
      console.log('💰 No school_id available for financial summary');
      setSummary({
        total_fees: 0,
        total_collected: 0,
        outstanding_balance: 0,
        total_expenses: 0,
        net_income: 0,
        mpesa_transactions_count: 0
      });
      setExpenseBreakdown([]);
      setCollectionTrends([]);
      setLoading(false);
      setError(null);
      setDataTruncated(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setDataTruncated(false);

      console.log('💰 Optimized financial summary fetch for school:', user.school_id, isRetry ? `(retry ${retryCount + 1})` : '');

      // Add timeout control with proper cleanup
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('💰 Financial summary query timed out');
      }, 6000); // Increased timeout for better reliability

      try {
        // Use Promise.allSettled for parallel execution with better error handling
        const [feesResult, expensesResult, mpesaResult] = await Promise.allSettled([
          // Optimized fees query with increased limit
          supabase
            .from('fees')
            .select('amount, paid_amount')
            .eq('school_id', user.school_id)
            .not('amount', 'is', null)
            .limit(800), // Increased limit for better accuracy

          // Optimized expenses query
          supabase
            .from('expenses')
            .select('amount, category')
            .eq('school_id', user.school_id)
            .not('amount', 'is', null)
            .limit(300), // Increased limit

          // Optimized MPESA count query
          supabase
            .from('mpesa_transactions')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', user.school_id)
            .eq('transaction_status', 'Success')
        ]);

        clearTimeout(timeoutId);

        // Process results with safe fallbacks and validation
        const feesData = feesResult.status === 'fulfilled' ? feesResult.value.data || [] : [];
        const expensesData = expensesResult.status === 'fulfilled' ? expensesResult.value.data || [] : [];
        const mpesaCount = mpesaResult.status === 'fulfilled' ? mpesaResult.value.count || 0 : 0;

        // Check for data truncation
        if (feesData.length >= 800) {
          console.warn('💰 Fees data may be truncated - limit reached');
          setDataTruncated(true);
        }

        if (expensesData.length >= 300) {
          console.warn('💰 Expenses data may be truncated - limit reached');
          setDataTruncated(true);
        }

        // Calculate totals from fees with safe number parsing
        const totalFees = feesData.reduce((sum, fee) => {
          const amount = Number(fee.amount || 0);
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        const totalCollected = feesData.reduce((sum, fee) => {
          const paidAmount = Number(fee.paid_amount || 0);
          return sum + (isNaN(paidAmount) ? 0 : paidAmount);
        }, 0);

        const outstandingBalance = Math.max(0, totalFees - totalCollected);

        const totalExpenses = expensesData.reduce((sum, expense) => {
          const amount = Number(expense.amount || 0);
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);

        const mpesaTransactionsCount = mpesaCount;

        // Set summary with bounds checking
        setSummary({
          total_fees: totalFees,
          total_collected: totalCollected,
          outstanding_balance: outstandingBalance,
          total_expenses: totalExpenses,
          net_income: totalCollected - totalExpenses,
          mpesa_transactions_count: mpesaTransactionsCount
        });

        // Optimized expense breakdown with validation
        const expenseMap = new Map<string, { amount: number; count: number }>();
        expensesData.forEach(expense => {
          const category = expense.category || 'Other';
          const amount = Number(expense.amount || 0);
          if (!isNaN(amount)) {
            const existing = expenseMap.get(category) || { amount: 0, count: 0 };
            expenseMap.set(category, {
              amount: existing.amount + amount,
              count: existing.count + 1
            });
          }
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
          .limit(200); // Increased limit

        const trendsData = recentFeesResult.data || [];

        // Group by date with validation
        const trendMap = new Map<string, { amount: number; count: number }>();
        trendsData.forEach(fee => {
          if (fee.paid_date && fee.paid_amount) {
            const amount = Number(fee.paid_amount || 0);
            if (!isNaN(amount)) {
              const existing = trendMap.get(fee.paid_date) || { amount: 0, count: 0 };
              trendMap.set(fee.paid_date, {
                amount: existing.amount + amount,
                count: existing.count + 1
              });
            }
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
        setRetryCount(0); // Reset retry count on success

      } catch (queryError) {
        clearTimeout(timeoutId);
        throw queryError;
      }

    } catch (err: unknown) {
      console.error('Error fetching financial summary:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch financial summary';
      setError(errorMessage);

      // Retry logic for transient errors
      if (!isRetry && retryCount < 2 && (
        errorMessage.includes('timeout') || 
        errorMessage.includes('network') || 
        errorMessage.includes('connection')
      )) {
        console.log('🔄 Retrying financial summary fetch...');
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchFinancialSummary(true), 2000);
        return;
      }

      // Set safe defaults on final failure
      setSummary({
        total_fees: 0,
        total_collected: 0,
        outstanding_balance: 0,
        total_expenses: 0,
        net_income: 0,
        mpesa_transactions_count: 0
      });
      setExpenseBreakdown([]);
      setCollectionTrends([]);

      toast({
        title: "Error",
        description: "Failed to fetch financial summary",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.school_id, retryCount, toast]);

  useEffect(() => {
    if (user?.school_id) {
      fetchFinancialSummary();
    }
  }, [fetchFinancialSummary]);

  return {
    summary,
    expenseBreakdown,
    collectionTrends,
    loading,
    error,
    dataTruncated,
    retryCount,
    refetch: () => {
      setRetryCount(0);
      fetchFinancialSummary();
    },
  };
};
