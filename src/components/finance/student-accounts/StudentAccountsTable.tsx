
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
        <p className="text-gray-500">No student accounts found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Total Fees</TableHead>
            <TableHead>Paid Amount</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.student.id}>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {account.student.name || 'Unknown Student'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {account.student.admission_number || 'N/A'}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {account.student.class_name || 'Unknown Class'}
              </TableCell>
              <TableCell className="font-semibold">
                {formatCurrency(account.totalFees)}
              </TableCell>
              <TableCell className="text-green-600 font-semibold">
                {formatCurrency(account.totalPaid)}
              </TableCell>
              <TableCell className={`font-semibold ${
                account.balance > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(account.balance)}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(account.status)}>
                  {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => onViewDetails(account)}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StudentAccountsTable;
