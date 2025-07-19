import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FinanceMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  outstandingFees: number;
  paidFees: number;
  pendingFees: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
}

export const useFinanceMetrics = (schoolId?: string) => {
  const [metrics, setMetrics] = useState<FinanceMetrics>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    outstandingFees: 0,
    paidFees: 0,
    pendingFees: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    monthlyProfit: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Since user context is removed, we'll use the provided schoolId or a default
      const effectiveSchoolId = schoolId || 'default';

      // Fetch revenue data
      const { data: revenueData, error: revenueError } = await supabase
        .from('fee_payments')
        .select('amount, payment_date')
        .eq('school_id', effectiveSchoolId)
        .eq('status', 'paid');

      if (revenueError) throw revenueError;

      // Fetch expenses data
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('amount, expense_date')
        .eq('school_id', effectiveSchoolId);

      if (expensesError) throw expensesError;

      // Calculate metrics
      const totalRevenue = revenueData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
      const totalExpenses = expensesData?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
      const netProfit = totalRevenue - totalExpenses;

      // Calculate monthly metrics (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const monthlyRevenue = revenueData?.filter(payment => {
        const paymentDate = new Date(payment.payment_date);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
      }).reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      const monthlyExpenses = expensesData?.filter(expense => {
        const expenseDate = new Date(expense.expense_date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      }).reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;

      const monthlyProfit = monthlyRevenue - monthlyExpenses;

      // Fetch fee status data
      const { data: feesData, error: feesError } = await supabase
        .from('student_fees')
        .select('amount, status')
        .eq('school_id', effectiveSchoolId);

      if (feesError) throw feesError;

      const outstandingFees = feesData?.filter(fee => fee.status === 'outstanding')
        .reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0;
      const paidFees = feesData?.filter(fee => fee.status === 'paid')
        .reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0;
      const pendingFees = feesData?.filter(fee => fee.status === 'pending')
        .reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0;

      setMetrics({
        totalRevenue,
        totalExpenses,
        netProfit,
        outstandingFees,
        paidFees,
        pendingFees,
        monthlyRevenue,
        monthlyExpenses,
        monthlyProfit,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch finance metrics'));
    } finally {
      setIsLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, isLoading, error, refetch: fetchMetrics };
};
