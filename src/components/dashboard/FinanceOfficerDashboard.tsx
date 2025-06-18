
import React, { useState } from 'react';
import { AuthUser } from '@/types/auth';
import { useFinanceOfficerAnalytics } from '@/hooks/useFinanceOfficerAnalytics';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FinanceKeyMetrics from '@/components/analytics/finance/FinanceKeyMetrics';
import FeeCollectionChart from '@/components/analytics/finance/FeeCollectionChart';
import DailyTransactionsChart from '@/components/analytics/finance/DailyTransactionsChart';
import ExpenseBreakdownChart from '@/components/analytics/finance/ExpenseBreakdownChart';
import TopDefaultersList from '@/components/analytics/finance/TopDefaultersList';
import ClassCollectionProgress from '@/components/analytics/finance/ClassCollectionProgress';
import FeeManagementPanel from '@/components/finance/FeeManagementPanel';
import FinanceReportsPanel from '@/components/finance/FinanceReportsPanel';
import CreateExpenseDialog from '@/components/finance/CreateExpenseDialog';

interface FinanceOfficerDashboardProps {
  user: AuthUser;
}

const FinanceOfficerDashboard: React.FC<FinanceOfficerDashboardProps> = ({ user }) => {
  console.log('💰 FinanceOfficerDashboard: Rendering for finance officer:', user.email);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  const filters = { term: 'current', class: 'all' };
  const { data, isLoading, error } = useFinanceOfficerAnalytics(filters);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
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

  if (!data) {
    return (
      <div className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Financial Data</AlertTitle>
          <AlertDescription>
            No financial data is available to display. This might be because:
            <ul className="list-disc ml-6 mt-2">
              <li>No fees have been assigned to students yet</li>
              <li>No expenses have been recorded</li>
              <li>You don't have permission to view this school's financial data</li>
            </ul>
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  const { keyMetrics, feeCollectionData, dailyTransactions, expenseBreakdown, defaultersList } = data;

  return (
    <div className="space-y-6" key={refreshKey}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Financial Management Center</h2>
          <p className="text-muted-foreground">Manage fees, expenses, and financial analytics with integrated payment methods</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'overview' && <CreateExpenseDialog />}
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Financial Overview</TabsTrigger>
          <TabsTrigger value="fees">Fee Management</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <FinanceKeyMetrics keyMetrics={keyMetrics} />
          
          <FeeCollectionChart data={feeCollectionData} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailyTransactionsChart data={dailyTransactions} />
            <ExpenseBreakdownChart data={expenseBreakdown} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopDefaultersList data={defaultersList} />
            <ClassCollectionProgress data={feeCollectionData} />
          </div>
        </TabsContent>

        <TabsContent value="fees">
          <FeeManagementPanel />
        </TabsContent>

        <TabsContent value="reports">
          <FinanceReportsPanel />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <FinanceKeyMetrics keyMetrics={keyMetrics} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailyTransactionsChart data={dailyTransactions} />
            <ExpenseBreakdownChart data={expenseBreakdown} />
          </div>

          <TopDefaultersList data={defaultersList} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceOfficerDashboard;
