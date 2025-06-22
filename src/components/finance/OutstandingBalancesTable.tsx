
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import PaymentRecordDialog from './PaymentRecordDialog';
import MpesaPaymentDialog from './MpesaPaymentDialog';

interface OutstandingBalancesTableProps {
  studentFees: any[];
}

const OutstandingBalancesTable: React.FC<OutstandingBalancesTableProps> = ({
  studentFees
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

  const outstandingFees = studentFees.filter(fee => fee.amount - fee.amount_paid > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          Outstanding Balances
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Outstanding Amount</TableHead>
                <TableHead>Days Overdue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outstandingFees.map((fee) => {
                const balance = fee.amount - fee.amount_paid;
                const daysOverdue = Math.max(0, Math.floor((new Date().getTime() - new Date(fee.due_date).getTime()) / (1000 * 60 * 60 * 24)));
                
                return (
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
                    <TableCell className="text-red-600 font-semibold">
                      KES {balance.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {daysOverdue > 0 ? (
                        <Badge variant="destructive">{daysOverdue} days</Badge>
                      ) : (
                        <Badge variant="secondary">Not due</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(fee.status)}>
                        {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                      </Badge>
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
      </CardContent>
    </Card>
  );
};

export default OutstandingBalancesTable;
