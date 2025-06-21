
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useBillingSubscriptions, useBillingTransactions } from '@/hooks/useBillingData';
import { CreditCard, DollarSign, TrendingUp, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

const BillingModule = () => {
  const { 
    data: subscriptions, 
    isLoading: subscriptionsLoading, 
    error: subscriptionsError,
    refetch: refetchSubscriptions 
  } = useBillingSubscriptions();

  const { 
    data: transactions, 
    isLoading: transactionsLoading, 
    error: transactionsError,
    refetch: refetchTransactions 
  } = useBillingTransactions();

  const handleRefresh = () => {
    refetchSubscriptions();
    refetchTransactions();
  };

  const calculateRevenue = () => {
    if (!subscriptions) return 0;
    
    return subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => {
        const monthlyAmount = s.billing_cycle === 'yearly' ? s.amount / 12 : 
                             s.billing_cycle === 'quarterly' ? s.amount / 3 : s.amount;
        return sum + monthlyAmount;
      }, 0);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, BadgeProps['variant']> = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive',
      cancelled: 'outline',
      pending: 'secondary',
      completed: 'default',
      failed: 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (subscriptionsError || transactionsError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Billing Management</h2>
            <p className="text-muted-foreground">Manage subscriptions and billing for all schools</p>
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

  if (subscriptionsLoading || transactionsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Billing Management</h2>
            <p className="text-muted-foreground">Manage subscriptions and billing for all schools</p>
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
          <p className="text-muted-foreground">Manage subscriptions and billing for all schools</p>
        </div>
        <Button onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${calculateRevenue().toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Active subscriptions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions?.filter(s => s.status === 'active').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {subscriptions?.length || 0} total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions?.filter(t => t.status === 'pending').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${transactions?.reduce((sum, t) => sum + (t.status === 'completed' ? t.amount : 0), 0).toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>School Subscriptions</CardTitle>
          <CardDescription>
            Manage all school subscription plans and billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!subscriptions || subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No subscriptions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Billing Cycle</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.school?.name || 'Unknown School'}</div>
                        <div className="text-sm text-muted-foreground">{subscription.school?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{subscription.plan_type}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell>${subscription.amount}</TableCell>
                    <TableCell className="capitalize">{subscription.billing_cycle}</TableCell>
                    <TableCell>{new Date(subscription.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(subscription.end_date).toLocaleDateString()}</TableCell>
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
            Latest billing transactions across all schools
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
