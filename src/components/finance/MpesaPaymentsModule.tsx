
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Smartphone, RefreshCw, Settings, Filter } from 'lucide-react';
import { useMpesaTransactions } from '@/hooks/fee-management/useMpesaTransactions';
import { format } from 'date-fns';
import MpesaCredentialsDialog from './MpesaCredentialsDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MpesaPaymentsModule: React.FC = () => {
  const { mpesaTransactions, loading, error, refetch } = useMpesaTransactions();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTransactions = mpesaTransactions.filter(txn => 
    statusFilter === 'all' || txn.transaction_status.toLowerCase() === statusFilter.toLowerCase()
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'default';
      case 'failed':
      case 'error':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const totalAmount = filteredTransactions.reduce((sum, txn) => sum + (txn.amount_paid || 0), 0);
  const successfulTransactions = filteredTransactions.filter(txn => txn.transaction_status === 'Success');
  const pendingTransactions = filteredTransactions.filter(txn => txn.transaction_status === 'Pending');
  const failedTransactions = filteredTransactions.filter(txn => txn.transaction_status === 'Failed');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading M-PESA transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading M-PESA transactions: {error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Smartphone className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">KES {totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Successful</p>
              <p className="text-2xl font-bold text-green-600">{successfulTransactions.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingTransactions.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-red-600">{failedTransactions.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-600" />
              M-PESA Transactions
            </CardTitle>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="success">Successful</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <MpesaCredentialsDialog />
              <Button onClick={refetch} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Smartphone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900 mb-2">No M-PESA Transactions Found</p>
              <p className="text-gray-500">
                {statusFilter === 'all' 
                  ? "No transactions have been recorded yet."
                  : `No ${statusFilter} transactions found.`
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>M-PESA Code</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {transaction.transaction_date 
                          ? format(new Date(transaction.transaction_date), 'MMM dd, yyyy HH:mm')
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {transaction.student?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.student?.admission_number || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {transaction.phone_number || 'N/A'}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        KES {(transaction.amount_paid || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {transaction.mpesa_receipt_number || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(transaction.transaction_status)}>
                          {transaction.transaction_status || 'Unknown'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MpesaPaymentsModule;
