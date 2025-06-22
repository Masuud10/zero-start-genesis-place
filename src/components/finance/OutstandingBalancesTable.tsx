
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface OutstandingBalancesTableProps {
  studentFees: any[];
}

const OutstandingBalancesTable: React.FC<OutstandingBalancesTableProps> = ({ studentFees }) => {
  const outstandingFees = studentFees.filter(fee => 
    (fee.amount - fee.amount_paid) > 0
  ).sort((a, b) => (b.amount - b.amount_paid) - (a.amount - a.amount_paid));

  const getTotalOutstanding = () => {
    return outstandingFees.reduce((sum, fee) => sum + (fee.amount - fee.amount_paid), 0);
  };

  const getStatusColor = (fee: any) => {
    const outstanding = fee.amount - fee.amount_paid;
    const daysOverdue = fee.due_date 
      ? Math.floor((new Date().getTime() - new Date(fee.due_date).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    if (daysOverdue > 30) return 'destructive';
    if (daysOverdue > 0) return 'secondary';
    return 'outline';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Outstanding Balances
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total Outstanding</div>
            <div className="text-lg font-bold text-red-600">
              KES {getTotalOutstanding().toLocaleString()}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {outstandingFees.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium">All fees are up to date!</p>
            <p>No outstanding balances found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Fee Amount</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outstandingFees.map((fee) => {
                  const outstanding = fee.amount - fee.amount_paid;
                  const daysOverdue = fee.due_date 
                    ? Math.floor((new Date().getTime() - new Date(fee.due_date).getTime()) / (1000 * 60 * 60 * 24))
                    : 0;
                    
                  return (
                    <TableRow key={fee.id} className={daysOverdue > 30 ? 'bg-red-50' : daysOverdue > 0 ? 'bg-yellow-50' : ''}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{fee.student?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">
                            {fee.student?.admission_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{fee.class?.name || 'N/A'}</TableCell>
                      <TableCell className="font-semibold">
                        KES {fee.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-green-600">
                        KES {fee.amount_paid.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-bold text-red-600">
                        KES {outstanding.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {fee.due_date ? format(new Date(fee.due_date), 'MMM dd, yyyy') : 'N/A'}
                        {daysOverdue > 0 && (
                          <div className="text-xs text-red-600">
                            {daysOverdue} days overdue
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(fee)}>
                          {daysOverdue > 30 ? 'Critical' : daysOverdue > 0 ? 'Overdue' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OutstandingBalancesTable;
