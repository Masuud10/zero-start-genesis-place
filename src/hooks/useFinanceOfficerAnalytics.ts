
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FinanceAnalyticsData {
  keyMetrics: {
    totalCollected: number;
    outstandingAmount: number;
    totalMpesaPayments: number;
    collectionRate: number;
  };
  feeCollectionData: Array<{
    class: string;
    collected: number;
    expected: number;
  }>;
  dailyTransactions: Array<{
    date: string;
    amount: number;
  }>;
  expenseBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  defaultersList: Array<{
    student_name: string;
    admission_number: string;
    class_name: string;
    outstanding_amount: number;
    days_overdue: number;
  }>;
}

export const useFinanceOfficerAnalytics = (filters: { term: string; class: string }) => {
  const [data, setData] = useState<FinanceAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchAnalytics = async () => {
    if (!user?.school_id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch fees data
      const { data: feesData, error: feesError } = await supabase
        .from('fees')
        .select(`
          *,
          students(name, admission_number),
          classes(name)
        `)
        .eq('school_id', user.school_id);

      if (feesError) throw feesError;

      // Fetch MPESA transactions
      const { data: mpesaData, error: mpesaError } = await supabase
        .from('mpesa_transactions')
        .select('*')
        .eq('school_id', user.school_id)
        .eq('transaction_status', 'Success');

      if (mpesaError) throw mpesaError;

      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('school_id', user.school_id);

      if (expensesError) throw expensesError;

      // Calculate key metrics
      const totalFees = feesData?.reduce((sum, fee) => sum + Number(fee.amount), 0) || 0;
      const totalPaid = feesData?.reduce((sum, fee) => sum + Number(fee.paid_amount || 0), 0) || 0;
      const outstandingAmount = totalFees - totalPaid;
      const totalMpesaPayments = mpesaData?.reduce((sum, txn) => sum + Number(txn.amount_paid), 0) || 0;
      const collectionRate = totalFees > 0 ? Math.round((totalPaid / totalFees) * 100) : 0;

      // Group fee collection by class
      const classGroups = feesData?.reduce((acc: any, fee) => {
        const className = fee.classes?.name || 'Unknown';
        if (!acc[className]) {
          acc[className] = { collected: 0, expected: 0 };
        }
        acc[className].expected += Number(fee.amount);
        acc[className].collected += Number(fee.paid_amount || 0);
        return acc;
      }, {}) || {};

      const feeCollectionData = Object.entries(classGroups).map(([className, data]: [string, any]) => ({
        class: className,
        collected: data.collected,
        expected: data.expected
      }));

      // Generate daily transactions data (last 30 days)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const dailyTransactions = last30Days.map(date => ({
        date,
        amount: mpesaData?.filter(txn => 
          txn.transaction_date?.startsWith(date)
        ).reduce((sum, txn) => sum + Number(txn.amount_paid), 0) || 0
      }));

      // Calculate expense breakdown
      const expenseGroups = expensesData?.reduce((acc: any, expense) => {
        const category = expense.category || 'Other';
        acc[category] = (acc[category] || 0) + Number(expense.amount);
        return acc;
      }, {}) || {};

      const totalExpenses = Object.values(expenseGroups).reduce((sum: number, amount) => sum + (amount as number), 0);
      const expenseBreakdown = Object.entries(expenseGroups).map(([category, amount]: [string, any]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      }));

      // Find defaulters (students with overdue fees)
      const today = new Date();
      const defaultersList = feesData?.filter(fee => {
        const dueDate = new Date(fee.due_date);
        const isPastDue = dueDate < today;
        const hasOutstanding = Number(fee.amount) > Number(fee.paid_amount || 0);
        return isPastDue && hasOutstanding;
      }).map(fee => ({
        student_name: fee.students?.name || 'Unknown',
        admission_number: fee.students?.admission_number || 'N/A',
        class_name: fee.classes?.name || 'Unknown',
        outstanding_amount: Number(fee.amount) - Number(fee.paid_amount || 0),
        days_overdue: Math.floor((today.getTime() - new Date(fee.due_date).getTime()) / (1000 * 60 * 60 * 24))
      })) || [];

      setData({
        keyMetrics: {
          totalCollected: totalPaid,
          outstandingAmount,
          totalMpesaPayments,
          collectionRate
        },
        feeCollectionData,
        dailyTransactions,
        expenseBreakdown,
        defaultersList
      });

    } catch (err: any) {
      console.error('Error fetching finance analytics:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user?.school_id, filters.term, filters.class]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchAnalytics
  };
};
