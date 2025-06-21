
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSchoolBillingData, useBillingTransactions, useFinancialSummary } from '@/hooks/useBillingData';
import { CreditCard, DollarSign, TrendingUp, AlertCircle, RefreshCw, Loader2, Building2 } from 'lucide-react';

const BillingModule = () => {
  const { 
    data: schoolBillingData, 
    isLoading: schoolBillingLoading, 
    error: schoolBillingError,
    refetch: refetchSchoolBilling 
  } = useSchoolBillingData();

  const { 
    data: transactions, 
    isLoading: transactionsLoading, 
    error: transactionsError,
    refetch: refetchTransactions 
  } = useBillingTransactions();

  const {
    data: financialSummary,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary
  } = useFinancialSummary();

  const handleRefresh = () => {
    refetchSchoolBilling();
    refetchTransactions();
    refetchSummary();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, BadgeProps['variant']> = {
      pending: 'secondary',
      completed: 'default',
      failed: 'destructive',
      processing: 'secondary'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (schoolBillingError || transactionsError || summaryError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Billing Management</h2>
            <p className="text-muted-foreground">Manage billing and financial data across all schools</p>
          </div>
        </div>

        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Billing Data Error</AlertTitle>
          <AlertDescription className="text-red-700 mb-4">
            Failed to load billing data. Please try again.
          </AlertDescription>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  if (schoolBillingLoading || transactionsLoading || summaryLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Billing Management</h2>
            <p className="text-muted-foreground">Manage billing and financial data across all schools</p>
          </div>
        </div>

        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-4" />
          <p className="text-gray-600">Loading billing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Billing Management</h2>
          <p className="text-muted-foreground">Manage billing and financial data across all schools</p>
        </div>
        <Button onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${financialSummary?.total_revenue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">From all schools</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financialSummary?.collection_rate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              ${financialSummary?.total_paid?.toLocaleString() || 0} collected
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${financialSummary?.outstanding_amount?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Pending collection</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Schools</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schoolBillingData?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Schools in network</p>
          </CardContent>
        </Card>
      </div>

      {/* School Billing Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Schools Financial Overview</CardTitle>
          <CardDescription>
            Financial performance and billing status for all schools
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!schoolBillingData || schoolBillingData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No school billing data found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Total Transactions</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Last Transaction</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schoolBillingData.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell>
                      <div className="font-medium">{school.name}</div>
                    </TableCell>
                    <TableCell>{school.location || 'N/A'}</TableCell>
                    <TableCell>{school.total_transactions}</TableCell>
                    <TableCell>${school.total_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      {school.recent_transaction 
                        ? new Date(school.recent_transaction).toLocaleDateString()
                        : 'No transactions'
                      }
                    </TableCell>
                    <TableCell>{new Date(school.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Latest financial transactions across all schools
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 10).map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{transaction.school?.name || 'Unknown School'}</TableCell>
                    <TableCell className="capitalize">{transaction.transaction_type}</TableCell>
                    <TableCell>${transaction.amount}</TableCell>
                    <TableCell className="capitalize">{transaction.payment_method || 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingModule;
