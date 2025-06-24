
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fee Account Details - {account.student.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Student Information */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="font-medium text-sm text-gray-600">Student Name</label>
              <p className="text-lg font-semibold">{account.student.name}</p>
            </div>
            <div>
              <label className="font-medium text-sm text-gray-600">Admission Number</label>
              <p className="text-lg">{account.student.admission_number}</p>
            </div>
            <div>
              <label className="font-medium text-sm text-gray-600">Class</label>
              <p className="text-lg">{account.student.class_name}</p>
            </div>
            <div>
              <label className="font-medium text-sm text-gray-600">Account Status</label>
              <Badge className={getStatusColor(account.status)}>
                {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-gray-600">Total Fees</p>
              <p className="text-2xl font-bold">{formatCurrency(account.totalFees)}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-gray-600">Amount Paid</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(account.totalPaid)}</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-gray-600">Outstanding Balance</p>
              <p className={`text-2xl font-bold ${account.outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(account.outstanding)}
              </p>
            </div>
          </div>

          {/* Fee Records */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Fee Records</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {account.feeRecords.map((fee) => {
                    const balance = fee.amount - fee.paid_amount;
                    return (
                      <TableRow key={fee.id}>
                        <TableCell>{fee.category}</TableCell>
                        <TableCell>{fee.term}</TableCell>
                        <TableCell>{formatCurrency(fee.amount)}</TableCell>
                        <TableCell className="text-green-600">{formatCurrency(fee.paid_amount)}</TableCell>
                        <TableCell className={balance > 0 ? 'text-red-600' : 'text-green-600'}>
                          {formatCurrency(balance)}
                        </TableCell>
                        <TableCell>{new Date(fee.due_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={balance === 0 ? 'default' : 'secondary'}>
                            {balance === 0 ? 'Paid' : fee.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
