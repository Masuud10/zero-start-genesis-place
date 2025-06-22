
import React from 'react';
import { useFinanceOfficerAnalytics } from '@/hooks/useFinanceOfficerAnalytics';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import FinanceKeyMetrics from '@/components/analytics/finance/FinanceKeyMetrics';
import DailyTransactionsChart from '@/components/analytics/finance/DailyTransactionsChart';
import ExpenseBreakdownChart from '@/components/analytics/finance/ExpenseBreakdownChart';
import TopDefaultersList from '@/components/analytics/finance/TopDefaultersList';
import ClassCollectionProgress from '@/components/analytics/finance/ClassCollectionProgress';

const FinancialAnalyticsModule: React.FC = () => {
  const filters = { term: 'current', class: 'all' };
  const { data, isLoading, error } = useFinanceOfficerAnalytics(filters);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading financial analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load financial analytics. Please try again later. <br />
            <small>{error.message}</small>
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Financial Data Available</h3>
          <p className="text-gray-500 mb-4">
            There's no financial data to display at the moment.
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <FinanceKeyMetrics keyMetrics={data.keyMetrics} />
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyTransactionsChart data={data.dailyTransactions} />
        <ExpenseBreakdownChart data={data.expenseBreakdown} />
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopDefaultersList data={data.defaultersList} />
        <ClassCollectionProgress data={data.feeCollectionData} />
      </div>
    </div>
  );
};

export default FinancialAnalyticsModule;
