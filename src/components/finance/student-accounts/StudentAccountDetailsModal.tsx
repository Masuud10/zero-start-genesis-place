
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { StudentAccount } from '@/hooks/useStudentAccounts';

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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Student Account Details - {account.student.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Student Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Total Fees</p>
              <p className="text-lg font-semibold">{formatCurrency(account.totalFees)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paid Amount</p>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(account.totalPaid)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className={`text-lg font-semibold ${
                account.outstanding > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(account.outstanding)}
              </p>
            </div>
          </div>

          {/* Fee Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Fee Breakdown</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {account.fees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell>{fee.category}</TableCell>
                      <TableCell>{fee.term}</TableCell>
                      <TableCell>{formatCurrency(fee.amount)}</TableCell>
                      <TableCell className="text-green-600">
                        {formatCurrency(fee.paid_amount)}
                      </TableCell>
                      <TableCell className={
                        fee.amount - fee.paid_amount > 0 ? 'text-red-600' : 'text-green-600'
                      }>
                        {formatCurrency(fee.amount - fee.paid_amount)}
                      </TableCell>
                      <TableCell>
                        {new Date(fee.due_date).toLocaleDateString()}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentAccountDetailsModal;
