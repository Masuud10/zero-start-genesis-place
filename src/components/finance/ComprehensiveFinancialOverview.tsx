
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Users, TrendingUp, FileText, CreditCard, AlertCircle, Calculator, PlusCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFinancialSummary } from '@/hooks/useFinancialSummary';
import { useFeeManagement } from '@/hooks/useFeeManagement';
import { useMpesaTransactions } from '@/hooks/useMpesaTransactions';
import MpesaTransactionsPanel from './MpesaTransactionsPanel';
import FinanceReportsModule from '../modules/FinanceReportsModule';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ComprehensiveFinancialOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { summary, expenseBreakdown, collectionTrends, loading: summaryLoading, error: summaryError, refetch: refetchSummary } = useFinancialSummary();
  const { feeStructures, classFeesSummary, loading: feeLoading, error: feeError, refetch: refetchFees } = useFeeManagement();
  const { transactions, loading: mpesaLoading } = useMpesaTransactions();

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Financial Overview</TabsTrigger>
          <TabsTrigger value="management">Fee Management</TabsTrigger>
          <TabsTrigger value="mpesa">MPESA Payments</TabsTrigger>
          <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <CardTitle className="text-sm font-medium text-red-800">Outstanding</CardTitle>
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

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">Net Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">
                  {summary ? formatCurrency(summary.net_income) : 'Loading...'}
                </div>
                <p className="text-xs text-purple-600 mt-1">Collections - Expenses</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-800">MPESA Payments</CardTitle>
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

          {/* Collection Trends Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Collection Trends (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                {collectionTrends.length > 0 ? (
                  <div className="space-y-2">
                    {collectionTrends.slice(-7).map((trend, index) => (
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
                  <p className="text-center py-8 text-muted-foreground">No collection data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {expenseBreakdown.length > 0 ? (
                  <div className="space-y-3">
                    {expenseBreakdown.map((expense, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{expense.category}</p>
                          <p className="text-sm text-muted-foreground">{expense.count} transactions</p>
                        </div>
                        <span className="font-bold">{formatCurrency(expense.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No expense data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Class Fees Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Class-wise Fee Collection Status</CardTitle>
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
                        <th className="text-right p-2">Collection Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classFeesSummary.map((classData, index) => {
                        const collectionRate = classData.total_fees > 0 
                          ? ((classData.collected / classData.total_fees) * 100).toFixed(1)
                          : '0';
                        return (
                          <tr key={index} className="border-b">
                            <td className="p-2 font-medium">{classData.class_name}</td>
                            <td className="p-2 text-right">{formatCurrency(classData.total_fees || 0)}</td>
                            <td className="p-2 text-right text-green-600">{formatCurrency(classData.collected || 0)}</td>
                            <td className="p-2 text-right text-red-600">{formatCurrency(classData.outstanding || 0)}</td>
                            <td className="p-2 text-right">{classData.student_count}</td>
                            <td className="p-2 text-right">
                              <span className={`font-medium ${parseFloat(collectionRate) >= 80 ? 'text-green-600' : parseFloat(collectionRate) >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {collectionRate}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No class fee data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Fee Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Fee Structures</h3>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Fee Structure
                  </Button>
                </div>
                
                {feeStructures.length > 0 ? (
                  <div className="grid gap-4">
                    {feeStructures.map((structure) => (
                      <Card key={structure.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{structure.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {structure.academic_year} - {structure.term}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Created: {new Date(structure.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${structure.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {structure.is_active ? 'Active' : 'Inactive'}
                              </span>
                              <Button variant="outline" size="sm">
                                Assign to Class
                              </Button>
                            </div>
                          </div>
                          {structure.items && structure.items.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium mb-2">Fee Items:</p>
                              <div className="grid gap-2">
                                {structure.items.map((item) => (
                                  <div key={item.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                                    <span>{item.name} ({item.category})</span>
                                    <span className="font-medium">{formatCurrency(item.amount)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No fee structures created yet</p>
                    <p className="text-sm">Create your first fee structure to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mpesa">
          <MpesaTransactionsPanel />
        </TabsContent>

        <TabsContent value="reports">
          <FinanceReportsModule />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveFinancialOverview;
