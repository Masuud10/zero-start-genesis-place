
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StudentAccount } from '@/hooks/useStudentAccounts';

interface StudentAccountDetailsModalProps {
  account: StudentAccount | null;
  isOpen: boolean;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => string;
}

const StudentAccountDetailsModal: React.FC<StudentAccountDetailsModalProps> = ({
  account,
  isOpen,
  onClose,
  formatCurrency,
  getStatusColor
}) => {
  if (!account) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Student Account Details - {account.student.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(account.totalFees)}
              </div>
              <div className="text-sm text-muted-foreground">Total Fees</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(account.totalPaid)}
              </div>
              <div className="text-sm text-muted-foreground">Paid</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(account.outstanding)}
              </div>
              <div className="text-sm text-muted-foreground">Outstanding</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {account.fees.length}
              </div>
              <div className="text-sm text-muted-foreground">Fee Items</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {account.fees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell>{fee.category}</TableCell>
                    <TableCell>{fee.term}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(fee.amount)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(fee.paidAmount)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {formatCurrency(fee.amount - fee.paidAmount)}
                    </TableCell>
                    <TableCell>
                      {new Date(fee.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(fee.status)}>
                        {fee.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentAccountDetailsModal;
