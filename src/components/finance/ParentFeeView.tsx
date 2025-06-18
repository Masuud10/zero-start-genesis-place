
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStudentFees } from '@/hooks/useFees';
import { format } from 'date-fns';

interface ParentFeeViewProps {
  studentId: string;
}

const ParentFeeView: React.FC<ParentFeeViewProps> = ({ studentId }) => {
  const { studentFees, loading } = useStudentFees(studentId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalFees = studentFees.reduce((sum, sf) => sum + (sf.fee?.amount || 0), 0);
  const totalPaid = studentFees.reduce((sum, sf) => sum + sf.amount_paid, 0);
  const totalOutstanding = totalFees - totalPaid;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fee Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading fee information...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fee Balance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Total Fees</h3>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalFees)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Paid Amount</h3>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800">Outstanding</h3>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOutstanding)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fee Details</CardTitle>
        </CardHeader>
        <CardContent>
          {studentFees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No fees have been assigned yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentFees.map((studentFee) => {
                  const feeAmount = studentFee.fee?.amount || 0;
                  const outstanding = feeAmount - studentFee.amount_paid;
                  const isOverdue = new Date(studentFee.due_date) < new Date() && studentFee.status !== 'paid';
                  
                  return (
                    <TableRow key={studentFee.id} className={isOverdue ? 'bg-red-50' : ''}>
                      <TableCell className="font-medium">
                        {studentFee.fee?.category || 'General'}
                        {isOverdue && <span className="text-red-600 text-sm ml-2">(Overdue)</span>}
                      </TableCell>
                      <TableCell>{studentFee.fee?.term}</TableCell>
                      <TableCell>{formatCurrency(feeAmount)}</TableCell>
                      <TableCell>{formatCurrency(studentFee.amount_paid)}</TableCell>
                      <TableCell>{formatCurrency(outstanding)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(studentFee.status)}>
                          {studentFee.status.charAt(0).toUpperCase() + studentFee.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                          {format(new Date(studentFee.due_date), 'MMM dd, yyyy')}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentFeeView;
