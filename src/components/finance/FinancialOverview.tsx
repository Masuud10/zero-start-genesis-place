import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, AlertCircle, FileText, CreditCard, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFinancialSummary } from '@/hooks/useFinancialSummary';
import { useFeeManagement } from '@/hooks/useFeeManagement';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FinancialOverview: React.FC = () => {
  const { summary, collectionTrends, loading: summaryLoading, error: summaryError, refetch: refetchSummary } = useFinancialSummary();
  const { classFeesSummary, loading: feeLoading, error: feeError, refetch: refetchFees } = useFeeManagement();

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  const handleRefresh = () => {
    refetchSummary();
    refetchFees();
  };

  if (summaryLoading || feeLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (summaryError || feeError) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load financial data: {summaryError || feeError}
          <Button onClick={handleRefresh} variant="outline" size="sm" className="ml-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Financial Management Center
          </h1>
          <p className="text-muted-foreground">Comprehensive school finance overview and management</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {summary ? formatCurrency(summary.total_collected) : 'Loading...'}
            </div>
            <p className="text-xs text-green-600 mt-1">Revenue received</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Outstanding Balance</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {summary ? formatCurrency(summary.outstanding_balance) : 'Loading...'}
            </div>
            <p className="text-xs text-red-600 mt-1">Pending payments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Expenses</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {summary ? formatCurrency(summary.total_expenses) : 'Loading...'}
            </div>
            <p className="text-xs text-blue-600 mt-1">School expenses</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">MPESA Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {summary ? summary.mpesa_transactions_count : 'Loading...'}
            </div>
            <p className="text-xs text-orange-600 mt-1">Successful transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Collection Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Collection Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {collectionTrends.length > 0 ? (
            <div className="space-y-2">
              {collectionTrends.slice(-5).map((trend, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{trend.date}</span>
                  <div className="text-right">
                    <span className="font-medium">{formatCurrency(trend.amount)}</span>
                    <span className="text-xs text-muted-foreground ml-2">({trend.transaction_count} txns)</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No recent collection data available</p>
          )}
        </CardContent>
      </Card>

      {/* Class Collection Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Class-wise Collection Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {classFeesSummary.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Class</th>
                    <th className="text-right p-2">Total Fees</th>
                    <th className="text-right p-2">Collected</th>
                    <th className="text-right p-2">Outstanding</th>
                    <th className="text-right p-2">Students</th>
                  </tr>
                </thead>
                <tbody>
                  {classFeesSummary.slice(0, 5).map((classData, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 font-medium">{classData.class_name}</td>
                      <td className="p-2 text-right">{formatCurrency(classData.total_amount || 0)}</td>
                      <td className="p-2 text-right text-green-600">{formatCurrency(classData.paid_amount || 0)}</td>
                      <td className="p-2 text-right text-red-600">{formatCurrency(classData.balance || 0)}</td>
                      <td className="p-2 text-right">{classData.student_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {classFeesSummary.length > 5 && (
                <p className="text-center text-muted-foreground text-sm mt-4">
                  Showing top 5 classes. View all in Fee Management section.
                </p>
              )}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No class fee data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialOverview;
