
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';

interface PrincipalFinancialData {
  keyMetrics: {
    totalCollected: number;
    outstandingAmount: number;
    collectionRate: number;
    defaultersCount: number;
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
  defaultersList: Array<{
    student_name: string;
    class_name: string;
    admission_number: string;
    outstanding_amount: number;
    days_overdue: number;
  }>;
}

export const usePrincipalFinancialData = () => {
  const { user } = useAuth();
  const { schoolId } = useSchoolScopedData();
  const [data, setData] = useState<PrincipalFinancialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId || !user) {
      setIsLoading(false);
      return;
    }

    const fetchFinancialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch fees data
        const { data: feesData, error: feesError } = await supabase
          .from('fees')
          .select(`
            amount,
            paid_amount,
            status,
            due_date,
            student_id,
            students!inner(name, admission_number, class_id, classes!inner(name))
          `)
          .eq('school_id', schoolId);

        if (feesError) throw feesError;

        // Calculate key metrics
        const totalExpected = feesData?.reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0;
        const totalCollected = feesData?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;
        const outstandingAmount = totalExpected - totalCollected;
        const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

        // Calculate defaulters
        const today = new Date();
        const defaulters = feesData?.filter(fee => {
          const dueDate = new Date(fee.due_date);
          const isOverdue = dueDate < today;
          const hasOutstanding = (fee.amount || 0) > (fee.paid_amount || 0);
          return isOverdue && hasOutstanding;
        }) || [];

        // Group by class for fee collection data
        const classMap = new Map();
        feesData?.forEach(fee => {
          const className = fee.students?.classes?.name || 'Unknown';
          if (!classMap.has(className)) {
            classMap.set(className, { collected: 0, expected: 0 });
          }
          const classData = classMap.get(className);
          classData.collected += fee.paid_amount || 0;
          classData.expected += fee.amount || 0;
        });

        const feeCollectionData = Array.from(classMap.entries()).map(([className, data]) => ({
          class: className,
          collected: data.collected,
          expected: data.expected
        }));

        // Fetch recent transactions for daily trends
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('financial_transactions')
          .select('amount, created_at')
          .eq('school_id', schoolId)
          .eq('transaction_type', 'payment')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: true });

        if (transactionsError) throw transactionsError;

        // Group transactions by date
        const dailyMap = new Map();
        transactionsData?.forEach(transaction => {
          const date = new Date(transaction.created_at).toISOString().split('T')[0];
          dailyMap.set(date, (dailyMap.get(date) || 0) + (transaction.amount || 0));
        });

        const dailyTransactions = Array.from(dailyMap.entries()).map(([date, amount]) => ({
          date,
          amount
        }));

        // Format defaulters list
        const defaultersList = defaulters.slice(0, 10).map(fee => {
          const dueDate = new Date(fee.due_date);
          const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          return {
            student_name: fee.students?.name || 'Unknown',
            class_name: fee.students?.classes?.name || 'Unknown',
            admission_number: fee.students?.admission_number || 'N/A',
            outstanding_amount: (fee.amount || 0) - (fee.paid_amount || 0),
            days_overdue: daysOverdue
          };
        });

        setData({
          keyMetrics: {
            totalCollected,
            outstandingAmount,
            collectionRate,
            defaultersCount: defaulters.length
          },
          feeCollectionData,
          dailyTransactions,
          defaultersList
        });

      } catch (err: any) {
        console.error('Error fetching principal financial data:', err);
        setError(err.message || 'Failed to fetch financial data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialData();
  }, [schoolId, user]);

  return { data, isLoading, error };
};
