
import React from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StudentAccount } from '@/hooks/useStudentAccounts';

interface StudentAccountsTableProps {
  accounts: StudentAccount[];
  formatCurrency: (amount: number) => string;
  onViewDetails: (account: StudentAccount) => void;
}

const StudentAccountsTable: React.FC<StudentAccountsTableProps> = ({
  accounts,
  formatCurrency,
  onViewDetails
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Class</TableHead>
            <TableHead className="text-right">Total Fees</TableHead>
            <TableHead className="text-right">Paid</TableHead>
            <TableHead className="text-right">Outstanding</TableHead>
            <TableHead className="text-right">Payment Rate</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => {
            const paymentRate = account.totalFees > 0 
              ? ((account.totalPaid / account.totalFees) * 100).toFixed(1)
              : '0';
            
            return (
              <TableRow key={account.student.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{account.student.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {account.student.admission_number}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{account.student.class?.name || 'Unknown Class'}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(account.totalFees)}
                </TableCell>
                <TableCell className="text-right text-green-600">
                  {formatCurrency(account.totalPaid)}
                </TableCell>
                <TableCell className="text-right text-red-600">
                  {formatCurrency(account.outstanding)}
                </TableCell>
                <TableCell className="text-right">
                  <span className={`font-medium ${
                    parseFloat(paymentRate) >= 80 ? 'text-green-600' :
                    parseFloat(paymentRate) >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {paymentRate}%
                  </span>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onViewDetails(account)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {accounts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No student accounts found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default StudentAccountsTable;
