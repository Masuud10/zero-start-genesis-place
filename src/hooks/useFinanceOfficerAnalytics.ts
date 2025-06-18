
import { useState, useEffect } from 'react';
import { useSchoolScopedData } from './useSchoolScopedData';
import { supabase } from '@/integrations/supabase/client';

interface FinanceAnalyticsData {
  keyMetrics: {
    totalCollected: number;
    totalExpenses: number;
    netProfit: number;
    collectionRate: number;
    outstanding: number;
    defaulterCount: number;
    mpesaTransactions: number;
  };
  feeCollectionData: any[];
  dailyTransactions: any[];
  expenseBreakdown: any[];
  defaultersList: any[];
}

export const useFinanceOfficerAnalytics = (filters: { term: string; class: string }) => {
  const [data, setData] = useState<FinanceAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { schoolId } = useSchoolScopedData();

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!schoolId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Fetching finance analytics for school:', schoolId);

        // Fetch student fees with proper error handling
        const { data: studentFees, error: feesError } = await supabase
          .from('student_fees')
          .select(`
            *,
            fee:fees!inner(amount, category, term, academic_year)
          `)
          .eq('school_id', schoolId);

        if (feesError) {
          console.error('Error fetching student fees:', feesError);
          throw new Error(`Failed to fetch student fees: ${feesError.message}`);
        }

        // Fetch expenses with proper error handling
        const { data: expenses, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .eq('school_id', schoolId);

        if (expensesError) {
          console.error('Error fetching expenses:', expensesError);
          throw new Error(`Failed to fetch expenses: ${expensesError.message}`);
        }

        // Fetch financial transactions for MPESA count - select all required fields
        const { data: transactions, error: transactionsError } = await supabase
          .from('financial_transactions')
          .select('payment_method, created_at, amount')
          .eq('school_id', schoolId)
          .eq('payment_method', 'mpesa');

        if (transactionsError) {
          console.error('Error fetching transactions:', transactionsError);
        }

        // Calculate metrics safely
        const totalCollected = studentFees
          ?.filter(sf => sf.status === 'paid')
          .reduce((sum, sf) => sum + (sf.amount_paid || 0), 0) || 0;

        const totalExpenses = expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;

        const totalExpected = studentFees?.reduce((sum, sf) => {
          const feeAmount = sf.fee?.amount || 0;
          return sum + feeAmount;
        }, 0) || 0;

        const outstanding = Math.max(0, totalExpected - totalCollected);
        const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
        const defaulterCount = studentFees?.filter(sf => sf.status === 'unpaid').length || 0;
        const mpesaTransactions = transactions?.length || 0;

        // Prepare fee collection data for charts
        const feeCollectionData = studentFees?.reduce((acc, sf) => {
          const term = sf.fee?.term || 'Unknown';
          const existing = acc.find(item => item.term === term);
          if (existing) {
            existing.collected += sf.amount_paid || 0;
            existing.expected += sf.fee?.amount || 0;
          } else {
            acc.push({
              term,
              collected: sf.amount_paid || 0,
              expected: sf.fee?.amount || 0,
            });
          }
          return acc;
        }, [] as any[]) || [];

        // Prepare daily transactions data
        const dailyTransactions = transactions?.reduce((acc, transaction) => {
          const date = new Date(transaction.created_at).toISOString().split('T')[0];
          const existing = acc.find(item => item.date === date);
          if (existing) {
            existing.count += 1;
            existing.amount += transaction.amount || 0;
          } else {
            acc.push({
              date,
              count: 1,
              amount: transaction.amount || 0,
            });
          }
          return acc;
        }, [] as any[]) || [];

        // Prepare expense breakdown
        const expenseBreakdown = expenses?.reduce((acc, exp) => {
          const existing = acc.find(item => item.category === exp.category);
          if (existing) {
            existing.amount += exp.amount || 0;
          } else {
            acc.push({ 
              category: exp.category, 
              amount: exp.amount || 0,
              name: exp.category.charAt(0).toUpperCase() + exp.category.slice(1)
            });
          }
          return acc;
        }, [] as any[]) || [];

        // Prepare defaulters list
        const defaultersList = studentFees
          ?.filter(sf => sf.status === 'unpaid')
          .slice(0, 10)
          .map(sf => ({
            id: sf.id,
            student_id: sf.student_id,
            amount: sf.fee?.amount || 0,
            term: sf.fee?.term || 'Unknown',
            due_date: sf.due_date,
          })) || [];

        const analyticsData: FinanceAnalyticsData = {
          keyMetrics: {
            totalCollected,
            totalExpenses,
            netProfit: totalCollected - totalExpenses,
            collectionRate: Math.round(collectionRate * 10) / 10,
            outstanding,
            defaulterCount,
            mpesaTransactions,
          },
          feeCollectionData,
          dailyTransactions,
          expenseBreakdown,
          defaultersList,
        };

        console.log('Finance analytics data:', analyticsData);
        setData(analyticsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching finance analytics:', err);
        setError(err as Error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [schoolId, filters.term, filters.class]);

  return { data, isLoading, error };
};
