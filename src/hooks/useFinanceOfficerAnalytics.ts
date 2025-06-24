
import { useFinanceMetrics } from './finance/useFinanceMetrics';
import { useFeeCollectionData } from './finance/useFeeCollectionData';
import { useTransactionData } from './finance/useTransactionData';
import { useExpenseData } from './finance/useExpenseData';
import { useDefaultersData } from './finance/useDefaultersData';

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

export const useFinanceOfficerAnalytics = (filters: { term: string; class: string }) => {
  const { metrics, isLoading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useFinanceMetrics();
  const { feeCollectionData, isLoading: feeLoading, error: feeError, refetch: refetchFee } = useFeeCollectionData();
  const { dailyTransactions, isLoading: transactionLoading, error: transactionError, refetch: refetchTransaction } = useTransactionData();
  const { expenseBreakdown, isLoading: expenseLoading, error: expenseError, refetch: refetchExpense } = useExpenseData();
  const { defaultersList, isLoading: defaultersLoading, error: defaultersError, refetch: refetchDefaulters } = useDefaultersData();

  const isLoading = metricsLoading || feeLoading || transactionLoading || expenseLoading || defaultersLoading;
  const error = metricsError || feeError || transactionError || expenseError || defaultersError;

  const data: FinanceAnalyticsData | null = metrics ? {
    keyMetrics: metrics,
    feeCollectionData,
    dailyTransactions,
    expenseBreakdown,
    defaultersList
  } : null;

  const refetch = () => {
    refetchMetrics();
    refetchFee();
    refetchTransaction();
    refetchExpense();
    refetchDefaulters();
  };

  return {
    data,
    isLoading,
    error,
    refetch
  };
};
