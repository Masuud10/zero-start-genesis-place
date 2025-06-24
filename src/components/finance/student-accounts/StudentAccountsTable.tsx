
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import type { StudentAccount } from '@/hooks/useStudentAccounts';

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
  const getBalanceStatus = (outstanding: number) => {
    if (outstanding <= 0) return 'paid';
    if (outstanding > 0 && outstanding < 1000) return 'partial';
    return 'overdue';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No student accounts found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Admission No.</TableHead>
            <TableHead>Total Fees</TableHead>
            <TableHead>Paid Amount</TableHead>
            <TableHead>Outstanding</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => {
            const status = getBalanceStatus(account.outstanding);
            return (
              <TableRow key={account.student.id}>
                <TableCell>
                  <div className="font-medium">{account.student.name}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {account.student.admission_number}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-semibold">
                    {formatCurrency(account.totalFees)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-green-600">
                    {formatCurrency(account.totalPaid)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className={`font-semibold ${
                    account.outstanding > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatCurrency(account.outstanding)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(status)}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(account)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default StudentAccountsTable;
