
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Smartphone } from 'lucide-react';
import { format } from 'date-fns';

interface MpesaTransactionsSectionProps {
  transactions: any[];
}

const MpesaTransactionsSection: React.FC<MpesaTransactionsSectionProps> = ({ transactions }) => {
  const recentTransactions = transactions.slice(0, 5);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-green-600" />
          Recent M-PESA Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Smartphone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No recent M-PESA transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>M-PESA Code</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {transaction.transaction_date 
                        ? format(new Date(transaction.transaction_date), 'MMM dd, yyyy')
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {transaction.student?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.student?.admission_number}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      KES {transaction.amount_paid?.toLocaleString() || '0'}
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
  );
};

export default MpesaTransactionsSection;
