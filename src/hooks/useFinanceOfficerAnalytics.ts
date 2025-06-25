
import { useFinanceMetrics } from './finance/useFinanceMetrics';
import { useFeeCollectionData } from './finance/useFeeCollectionData';
import { useTransactionData } from './finance/useTransactionData';
import { useExpenseData } from './finance/useExpenseData';
import { useDefaultersData } from './finance/useDefaultersData';
import { useState, useEffect } from 'react';

interface FinanceAnalyticsData {
  keyMetrics: {
    totalRevenue: number;
    totalCollected: number;
    outstandingAmount: number;
    totalMpesaPayments: number;
    collectionRate: number;
    totalStudents: number;
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
  expenseBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  defaultersList: Array<{
    student_name: string;
    admission_number: string;
    class_name: string;
    outstanding_amount: number;
    days_overdue: number;
  }>;
}

const getDefaultMetrics = () => ({
  totalRevenue: 0,
  totalCollected: 0,
  outstandingAmount: 0,
  totalMpesaPayments: 0,
  collectionRate: 0,
  totalStudents: 0,
  defaultersCount: 0
});

export const useFinanceOfficerAnalytics = (filters: { term: string; class: string }) => {
  const [data, setData] = useState<FinanceAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Individual hooks
  const { 
    metrics, 
    isLoading: metricsLoading, 
    error: metricsError 
  } = useFinanceMetrics();

  const { 
    feeCollectionData, 
    isLoading: feeLoading, 
    error: feeError 
  } = useFeeCollectionData();

  const { 
    dailyTransactions, 
    isLoading: transactionLoading, 
    error: transactionError 
  } = useTransactionData();

  const { 
    expenseBreakdown, 
    isLoading: expenseLoading, 
    error: expenseError 
  } = useExpenseData();

  const { 
    defaultersList, 
    isLoading: defaultersLoading, 
    error: defaultersError 
  } = useDefaultersData();

  useEffect(() => {
    // Check if all individual hooks have finished loading
    const allLoaded = !metricsLoading && !feeLoading && !transactionLoading && !expenseLoading && !defaultersLoading;
    
    if (allLoaded) {
      console.log('Finance analytics data loaded:', {
        metrics,
        feeCollectionData,
        dailyTransactions,
        expenseBreakdown,
        defaultersList
      });

      // Check for any errors
      const errors = [metricsError, feeError, transactionError, expenseError, defaultersError].filter(Boolean);
      
      if (errors.length > 0) {
        console.warn('Some finance data failed to load:', errors);
        setError(new Error(`Failed to load some financial data: ${errors.map(e => e?.message).join(', ')}`));
      } else {
        setError(null);
      }

      // Construct final data object
      const financeData: FinanceAnalyticsData = {
        keyMetrics: metrics || getDefaultMetrics(),
        feeCollectionData: feeCollectionData || [],
        dailyTransactions: dailyTransactions || [],
        expenseBreakdown: expenseBreakdown || [],
        defaultersList: defaultersList || []
      };

      setData(financeData);
      setIsLoading(false);
    }
  }, [
    metricsLoading, feeLoading, transactionLoading, expenseLoading, defaultersLoading,
    metrics, feeCollectionData, dailyTransactions, expenseBreakdown, defaultersList,
    metricsError, feeError, transactionError, expenseError, defaultersError
  ]);

  const refetch = async () => {
    console.log('Refetching finance analytics data...');
    setIsLoading(true);
    setError(null);
    // Individual hooks will handle their own refetching
  };

  return {
    data,
    isLoading,
    error,
    refetch
  };
};
