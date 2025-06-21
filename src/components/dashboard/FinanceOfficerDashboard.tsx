
import React, { useState } from 'react';
import { AuthUser } from '@/types/auth';
import { useFinanceOfficerAnalytics } from '@/hooks/useFinanceOfficerAnalytics';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import FinanceKeyMetrics from '@/components/analytics/finance/FinanceKeyMetrics';
import DailyTransactionsChart from '@/components/analytics/finance/DailyTransactionsChart';
import ExpenseBreakdownChart from '@/components/analytics/finance/ExpenseBreakdownChart';
import TopDefaultersList from '@/components/analytics/finance/TopDefaultersList';

interface FinanceOfficerDashboardProps {
  user: AuthUser;
}

const FinanceOfficerDashboard: React.FC<FinanceOfficerDashboardProps> = ({ user }) => {
  console.log('💰 FinanceOfficerDashboard: Rendering for finance officer:', user.email);
  
  const [refreshKey, setRefreshKey] = useState(0);

  const filters = { term: 'current', class: 'all' };
  const { data, isLoading, error, refetch } = useFinanceOfficerAnalytics(filters);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    if (refetch) {
      refetch();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading financial overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Financial Data</AlertTitle>
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
    <div className="space-y-8" key={refreshKey}>
      {/* Single Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-100">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Welcome back, {user.name || user.email?.split('@')[0]}!
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Here's your financial overview for today
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" className="bg-white">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Financial Analytics Dashboard */}
      {data ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <FinanceKeyMetrics keyMetrics={data.keyMetrics} />
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailyTransactionsChart data={data.dailyTransactions} />
            <ExpenseBreakdownChart data={data.expenseBreakdown} />
          </div>

          {/* Defaulters List */}
          <TopDefaultersList data={data.defaultersList} />
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Financial Data Available</h3>
            <p className="text-gray-500 mb-4">
              There's no financial data to display at the moment. This could be because:
            </p>
            <ul className="text-sm text-gray-500 text-left max-w-md mx-auto space-y-1">
              <li>• No fee structures have been set up</li>
              <li>• No student fee records exist</li>
              <li>• No expenses have been recorded</li>
              <li>• Data is still being processed</li>
            </ul>
            <Button onClick={handleRefresh} className="mt-4" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceOfficerDashboard;
