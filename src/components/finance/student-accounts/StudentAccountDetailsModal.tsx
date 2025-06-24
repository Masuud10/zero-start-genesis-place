
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
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
          <DialogTitle>
            Account Details - {account.student.name || 'Unknown Student'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Student Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-semibold mb-2">Student Information</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Name:</strong> {account.student.name || 'N/A'}</p>
                <p><strong>Admission No:</strong> {account.student.admission_number || 'N/A'}</p>
                <p><strong>Class:</strong> {account.student.class_name || 'Unknown Class'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Account Summary</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Total Fees:</strong> {formatCurrency(account.totalFees)}</p>
                <p><strong>Total Paid:</strong> <span className="text-green-600">{formatCurrency(account.totalPaid)}</span></p>
                <p><strong>Balance:</strong> <span className={account.balance > 0 ? 'text-red-600' : 'text-green-600'}>{formatCurrency(account.balance)}</span></p>
                <p><strong>Status:</strong> 
                  <Badge className={`ml-2 ${getStatusColor(account.status)}`}>
                    {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                  </Badge>
                </p>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <h3 className="font-semibold mb-4">Transaction History</h3>
            {account.transactions && account.transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {account.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {transaction.transaction_date 
                            ? format(new Date(transaction.transaction_date), 'MMM dd, yyyy')
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className="capitalize">
                          {transaction.payment_method || 'N/A'}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {transaction.mpesa_code || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === 'Success' ? 'default' : 'secondary'}>
                            {transaction.status || 'Unknown'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No transactions found for this student.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentAccountDetailsModal;
