
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Loader2, AlertCircle } from 'lucide-react';
import { useMpesaTransactions } from '@/hooks/useMpesaTransactions';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MpesaPaymentsPanel: React.FC = () => {
  const { transactions, loading, error } = useMpesaTransactions();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading MPESA transactions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading MPESA transactions: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Smartphone className="h-6 w-6 text-green-600" />
            MPESA Payments
          </h2>
          <p className="text-muted-foreground">View and manage MPESA payment transactions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent MPESA Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No MPESA transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt Number</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {transaction.mpesa_receipt_number || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.student?.name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.student?.admission_number || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.phone_number}</TableCell>
                      <TableCell className="font-semibold">
                        KES {transaction.amount_paid.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          transaction.transaction_status === 'Success' ? 'default' :
                          transaction.transaction_status === 'Pending' ? 'secondary' : 'destructive'
                        }>
                          {transaction.transaction_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.transaction_date).toLocaleDateString()}
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

export default MpesaPaymentsPanel;
