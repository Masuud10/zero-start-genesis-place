
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import FeeAssignmentDialog from './FeeAssignmentDialog';
import PaymentRecordDialog from './PaymentRecordDialog';
import MpesaPaymentDialog from './MpesaPaymentDialog';

interface FeeCollectionsTableProps {
  studentFees: any[];
  loading: boolean;
  onAssignmentComplete: () => void;
}

const FeeCollectionsTable: React.FC<FeeCollectionsTableProps> = ({
  studentFees,
  loading,
  onAssignmentComplete
}) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'partial':
        return 'secondary';
      case 'unpaid':
        return 'destructive';
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'paid';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Fee Collections
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentFees.map((fee) => {
                  const balance = fee.amount - fee.amount_paid;
                  const overdue = isOverdue(fee.due_date, fee.status);
                  
                  return (
                    <TableRow key={fee.id} className={overdue ? 'bg-red-50' : ''}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{fee.student?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">
                            {fee.student?.admission_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{fee.class?.name || 'N/A'}</TableCell>
                      <TableCell className="font-semibold">
                        KES {fee.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        KES {fee.amount_paid.toLocaleString()}
                      </TableCell>
                      <TableCell className={balance > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                        KES {balance.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(fee.status)}>
                          {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                          {overdue && ' (Overdue)'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={overdue ? 'text-red-600 font-medium' : ''}>
                          {format(new Date(fee.due_date), 'MMM dd, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <PaymentRecordDialog studentFee={fee} />
                          <MpesaPaymentDialog studentFee={fee} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeeCollectionsTable;
