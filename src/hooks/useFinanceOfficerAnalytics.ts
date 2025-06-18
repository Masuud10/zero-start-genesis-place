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

        // Fetch basic financial metrics
        const { data: studentFees, error: feesError } = await supabase
          .from('student_fees')
          .select(`
            *,
            fee:fees(amount, category)
          `)
          .eq('school_id', schoolId);

        if (feesError) throw feesError;

        const { data: expenses, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .eq('school_id', schoolId);

        if (expensesError) throw expensesError;

        // Calculate metrics
        const totalCollected = studentFees
          ?.filter(sf => sf.status === 'paid')
          .reduce((sum, sf) => sum + sf.amount_paid, 0) || 0;

        const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

        const totalExpected = studentFees?.reduce((sum, sf) => {
          const feeAmount = sf.fee?.amount || 0;
          return sum + feeAmount;
        }, 0) || 0;

        const outstanding = totalExpected - totalCollected;
        const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
        const defaulterCount = studentFees?.filter(sf => sf.status === 'unpaid').length || 0;

        const analyticsData: FinanceAnalyticsData = {
          keyMetrics: {
            totalCollected,
            totalExpenses,
            netProfit: totalCollected - totalExpenses,
            collectionRate,
            outstanding,
            defaulterCount,
            mpesaTransactions: 0, // Placeholder
          },
          feeCollectionData: [], // Placeholder
          dailyTransactions: [], // Placeholder
          expenseBreakdown: expenses?.reduce((acc, exp) => {
            const existing = acc.find(item => item.category === exp.category);
            if (existing) {
              existing.amount += exp.amount;
            } else {
              acc.push({ category: exp.category, amount: exp.amount });
            }
            return acc;
          }, [] as any[]) || [],
          defaultersList: studentFees?.filter(sf => sf.status === 'unpaid').slice(0, 10) || [],
        };

        setData(analyticsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching finance analytics:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [schoolId, filters]);

  return { data, isLoading, error };
};
