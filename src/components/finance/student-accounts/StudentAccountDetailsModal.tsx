
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, CreditCard, Clock, FileText, Download } from 'lucide-react';
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

  const handlePrintStatement = () => {
    // Create a printable statement
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const statementHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Account Statement - ${account.student.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .student-info { margin-bottom: 20px; }
            .summary { margin-bottom: 20px; }
            .transactions { margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .amount { text-align: right; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Student Account Statement</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="student-info">
            <h2>Student Information</h2>
            <p><strong>Name:</strong> ${account.student.name}</p>
            <p><strong>Admission Number:</strong> ${account.student.admission_number}</p>
            <p><strong>Class:</strong> ${account.student.class_name || 'Unknown Class'}</p>
          </div>
          
          <div class="summary">
            <h2>Account Summary</h2>
            <p><strong>Total Fees:</strong> ${formatCurrency(account.totalFees)}</p>
            <p><strong>Total Paid:</strong> ${formatCurrency(account.totalPaid)}</p>
            <p><strong>Balance:</strong> ${formatCurrency(account.balance)}</p>
            <p><strong>Status:</strong> ${account.status.toUpperCase()}</p>
          </div>
          
          <div class="transactions">
            <h2>Transaction History</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th class="amount">Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${account.transactions.map(transaction => `
                  <tr>
                    <td>${new Date(transaction.transaction_date).toLocaleDateString()}</td>
                    <td>${transaction.payment_method.toUpperCase()}</td>
                    <td>${transaction.mpesa_code || 'N/A'}</td>
                    <td class="amount">${formatCurrency(transaction.amount)}</td>
                    <td>${transaction.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(statementHTML);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            Student Account Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="font-semibold">{account.student.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Admission Number</p>
                  <p className="font-semibold">{account.student.admission_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Class</p>
                  <p className="font-semibold">{account.student.class_name || 'Unknown Class'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Account Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-600">Total Fees</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {formatCurrency(account.totalFees)}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-600">Total Paid</p>
                  <p className="text-2xl font-bold text-green-800">
                    {formatCurrency(account.totalPaid)}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${account.balance > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                  <p className={`text-sm font-medium ${account.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Balance {account.balance > 0 ? 'Due' : 'Credit'}
                  </p>
                  <p className={`text-2xl font-bold ${account.balance > 0 ? 'text-red-800' : 'text-green-800'}`}>
                    {formatCurrency(Math.abs(account.balance))}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="mt-2">
                    <Badge className={getStatusColor(account.status)}>
                      {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Transaction History
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handlePrintStatement}>
                  <Download className="w-4 h-4 mr-2" />
                  Print Statement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {account.transactions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No transactions found for this student.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {account.transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {new Date(transaction.transaction_date).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {transaction.payment_method.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs">
                              {transaction.mpesa_code || 'N/A'}
                            </code>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              transaction.status === 'Success' ? 'default' : 
                              transaction.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {transaction.status}
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {account.balance > 0 && (
              <Button className="bg-green-600 hover:bg-green-700">
                <CreditCard className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentAccountDetailsModal;
