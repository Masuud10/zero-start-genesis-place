
import React, { useState } from 'react';
import { AuthUser } from '@/types/auth';
import { useFinanceOfficerAnalytics } from '@/hooks/useFinanceOfficerAnalytics';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { useAuth } from '@/contexts/AuthContext';

interface FinanceOfficerDashboardProps {
  user: AuthUser;
}

const FinanceOfficerDashboard: React.FC<FinanceOfficerDashboardProps> = ({ user }) => {
  console.log('💰 FinanceOfficerDashboard: Rendering for finance officer:', user.email);
  
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const filters = { term: 'current', class: 'all' };
  const { data, isLoading, error } = useFinanceOfficerAnalytics(filters);

  if (isLoading) {
      return (
          <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="ml-2">Loading financial overview...</p>
          </div>
      );
  }

  if (error) {
      return (
          <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Data</AlertTitle>
              <AlertDescription>
                  There was a problem loading the financial analytics. Please try again later.
                  <br />
                  <small className="text-xs">{error.message}</small>
              </AlertDescription>
          </Alert>
      );
  }

  if (!data) {
      return <p className="text-center text-muted-foreground mt-8">No financial data available to display.</p>;
  }

  const { keyMetrics, feeCollectionData, dailyTransactions, expenseBreakdown, defaultersList } = data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Financial Management Center</h2>
          {activeTab === 'overview' && <CreateExpenseDialog />}
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

          <TopDefaultersList data={defaultersList} />

          <ClassCollectionProgress data={feeCollectionData} />
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
