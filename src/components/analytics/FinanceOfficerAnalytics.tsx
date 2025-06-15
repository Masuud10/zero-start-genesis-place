
import React from 'react';
import { useFinanceOfficerAnalytics } from '@/hooks/useFinanceOfficerAnalytics';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import FinanceKeyMetrics from './finance/FinanceKeyMetrics';
import FeeCollectionChart from './finance/FeeCollectionChart';
import DailyTransactionsChart from './finance/DailyTransactionsChart';
import ExpenseBreakdownChart from './finance/ExpenseBreakdownChart';
import TopDefaultersList from './finance/TopDefaultersList';
import ClassCollectionProgress from './finance/ClassCollectionProgress';

interface FinanceOfficerAnalyticsProps {
  filters: {
    term: string;
    class: string;
  };
}

const FinanceOfficerAnalytics = ({ filters }: FinanceOfficerAnalyticsProps) => {
  const { data, isLoading, error } = useFinanceOfficerAnalytics(filters);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading financial analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load financial analytics. Please try again later. <br />
          <small>{error.message}</small>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!data) {
    return <p>No data available.</p>;
  }

  const { keyMetrics, feeCollectionData, dailyTransactions, expenseBreakdown, defaultersList } = data;

  return (
    <div className="space-y-6">
      <FinanceKeyMetrics keyMetrics={keyMetrics} />
      
      <FeeCollectionChart data={feeCollectionData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyTransactionsChart data={dailyTransactions} />
        <ExpenseBreakdownChart data={expenseBreakdown} />
      </div>

      <TopDefaultersList data={defaultersList} />

      <ClassCollectionProgress data={feeCollectionData} />
    </div>
  );
};

export default FinanceOfficerAnalytics;
