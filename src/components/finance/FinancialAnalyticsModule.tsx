
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinanceOfficerAnalytics } from '@/hooks/useFinanceOfficerAnalytics';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import FinanceKeyMetrics from '@/components/analytics/finance/FinanceKeyMetrics';
import DailyTransactionsChart from '@/components/analytics/finance/DailyTransactionsChart';
import ExpenseBreakdownChart from '@/components/analytics/finance/ExpenseBreakdownChart';
import TopDefaultersList from '@/components/analytics/finance/TopDefaultersList';

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
          <AlertDescription className="mt-2">
            There was a problem loading the financial analytics. Please try refreshing the page.
            <br />
            <small className="text-xs mt-2 block">Error: {error.message}</small>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Financial Analytics
          </h1>
          <p className="text-muted-foreground">Financial Management Center: Comprehensive school finance overview and management</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {data && (
        <>
          <FinanceKeyMetrics keyMetrics={data.keyMetrics} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailyTransactionsChart data={data.dailyTransactions} />
            <ExpenseBreakdownChart data={data.expenseBreakdown} />
          </div>

          <TopDefaultersList data={data.defaultersList} />
        </>
      )}
    </div>
  );
};

export default FinancialAnalyticsModule;
