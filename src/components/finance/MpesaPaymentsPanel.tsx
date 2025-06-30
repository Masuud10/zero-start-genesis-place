import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, CreditCard, Download, Filter, RefreshCw } from 'lucide-react';
import { useMpesaTransactions } from '@/hooks/fee-management/useMpesaTransactions';

const MpesaPaymentsPanel: React.FC = () => {
  const { mpesaTransactions, loading, error, refetch } = useMpesaTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTransactions = mpesaTransactions.filter(transaction => {
    const matchesSearch = transaction.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.admission_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.mpesa_receipt_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.transaction_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  const totalAmount = filteredTransactions.reduce((sum, txn) => sum + Number(txn.amount_paid || 0), 0);
  const completedTransactions = filteredTransactions.filter(txn => txn.transaction_status === 'completed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading MPESA transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-center">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-4">Error loading MPESA transactions</p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            MPESA Payments
          </h2>
          <p className="text-muted-foreground">Monitor and manage mobile money transactions</p>
        </div>
        <Button onClick={refetch}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTransactions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{completedTransactions}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>MPESA Transaction History</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Receipt Number</th>
                      <th className="text-left p-2">Student</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Phone</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{transaction.mpesa_receipt_number || 'N/A'}</td>
                        <td className="p-2">
                          <div>
                            <p className="font-medium">{transaction.student_name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{transaction.admission_number || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="p-2 font-semibold text-green-600">
                          {formatCurrency(Number(transaction.amount_paid || 0))}
                        </td>
                        <td className="p-2">{transaction.phone_number || 'N/A'}</td>
                        <td className="p-2">
                          {transaction.transaction_date 
                            ? new Date(transaction.transaction_date).toLocaleDateString()
                            : 'N/A'
                          }
                        </td>
                        <td className="p-2">
                          <Badge className={getStatusColor(transaction.transaction_status || 'unknown')}>
                            {transaction.transaction_status || 'Unknown'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No MPESA transactions found matching your criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tab contents would filter by status */}
        <TabsContent value="completed">
          <Card>
            <CardContent className="p-6">
              <p>Completed transactions: {completedTransactions}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MpesaPaymentsPanel;
