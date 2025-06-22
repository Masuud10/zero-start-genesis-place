
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Eye } from 'lucide-react';
import PaymentRecordDialog from './PaymentRecordDialog';
import MpesaPaymentDialog from './MpesaPaymentDialog';
import { format } from 'date-fns';

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

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading fee collections...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Fee Collections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Fee Amount</TableHead>
                <TableHead>Paid Amount</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentFees.map((fee) => (
                <TableRow key={fee.id}>
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
                  <TableCell className="text-green-600">
                    KES {fee.amount_paid.toLocaleString()}
                  </TableCell>
                  <TableCell className={fee.amount - fee.amount_paid > 0 ? 'text-red-600' : 'text-green-600'}>
                    KES {(fee.amount - fee.amount_paid).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(fee.status)}>
                      {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {fee.due_date ? format(new Date(fee.due_date), 'MMM dd, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <PaymentRecordDialog 
                        studentFee={fee}
                        onPaymentRecorded={onAssignmentComplete}
                      />
                      <MpesaPaymentDialog 
                        studentFee={fee}
                        onPaymentProcessed={onAssignmentComplete}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {studentFees.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No fee records found. Create fee structures and assign fees to students to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeeCollectionsTable;
