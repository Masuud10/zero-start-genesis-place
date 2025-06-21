
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { schoolId } = useSchoolScopedData();

  const refetch = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!schoolId) {
        setIsLoading(false);
        setError(new Error('No school ID available'));
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching finance analytics for school:', schoolId);

        // Fetch student fees with better error handling
        const { data: studentFees, error: feesError } = await supabase
          .from('student_fees')
          .select(`
            *,
            fee:fees!inner(amount, category, term, academic_year)
          `)
          .eq('school_id', schoolId);

        if (feesError) {
          console.error('Error fetching student fees:', feesError);
          // Don't throw error immediately, try to fetch other data
        }

        // Fetch expenses with better error handling
        const { data: expenses, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .eq('school_id', schoolId);

        if (expensesError) {
          console.error('Error fetching expenses:', expensesError);
        }

        // Fetch financial transactions for MPESA count
        const { data: transactions, error: transactionsError } = await supabase
          .from('financial_transactions')
          .select('payment_method, created_at, amount')
          .eq('school_id', schoolId)
          .eq('payment_method', 'mpesa');

        if (transactionsError) {
          console.error('Error fetching transactions:', transactionsError);
        }

        // Calculate metrics with fallback values
        const validStudentFees = studentFees || [];
        const validExpenses = expenses || [];
        const validTransactions = transactions || [];

        const totalCollected = validStudentFees
          .filter(sf => sf.status === 'paid')
          .reduce((sum, sf) => sum + (sf.amount_paid || 0), 0);

        const totalExpenses = validExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

        const totalExpected = validStudentFees.reduce((sum, sf) => {
          const feeAmount = sf.fee?.amount || 0;
          return sum + feeAmount;
        }, 0);

        const outstanding = Math.max(0, totalExpected - totalCollected);
        const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
        const defaulterCount = validStudentFees.filter(sf => sf.status === 'unpaid').length;
        const mpesaTransactions = validTransactions.length;

        // Prepare charts data with fallbacks
        const feeCollectionData = validStudentFees.reduce((acc, sf) => {
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
        }, [] as any[]);

        // Prepare daily transactions data
        const dailyTransactions = validTransactions.reduce((acc, transaction) => {
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
        }, [] as any[]);

        // Prepare expense breakdown
        const expenseBreakdown = validExpenses.reduce((acc, exp) => {
          const existing = acc.find(item => item.category === exp.category);
          if (existing) {
            existing.value += exp.amount || 0;
          } else {
            acc.push({ 
              category: exp.category, 
              value: exp.amount || 0,
              name: exp.category?.charAt(0).toUpperCase() + exp.category?.slice(1) || 'Unknown'
            });
          }
          return acc;
        }, [] as any[]);

        // Prepare defaulters list with mock student names since we don't have student data
        const defaultersList = validStudentFees
          .filter(sf => sf.status === 'unpaid')
          .slice(0, 10)
          .map((sf, index) => ({
            student: `Student ${sf.student_id?.slice(-4) || index + 1}`,
            class: 'N/A',
            amount: sf.fee?.amount || 0,
          }));

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
      } catch (err) {
        console.error('Error fetching finance analytics:', err);
        setError(err as Error);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [schoolId, filters.term, filters.class, refreshTrigger]);

  return { data, isLoading, error, refetch };
};
