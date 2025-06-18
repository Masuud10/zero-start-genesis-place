
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Trash2, Eye } from 'lucide-react';
import { useFees, useStudentFees } from '@/hooks/useFees';
import CreateFeeDialog from './CreateFeeDialog';
import { format } from 'date-fns';

const FeeManagementPanel: React.FC = () => {
  const { fees, loading: feesLoading, refetch: refetchFees } = useFees();
  const { studentFees, loading: studentFeesLoading } = useStudentFees();

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Fee Management</h2>
        <CreateFeeDialog onSuccess={refetchFees} />
      </div>

      <Tabs defaultValue="fees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="fees">Fee Structures</TabsTrigger>
          <TabsTrigger value="assignments">Student Assignments</TabsTrigger>
          <TabsTrigger value="payments">Payment Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle>Fee Structures</CardTitle>
            </CardHeader>
            <CardContent>
              {feesLoading ? (
                <div className="text-center py-4">Loading fees...</div>
              ) : fees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No fees created yet. Create your first fee structure above.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell className="font-medium">{fee.category || 'General'}</TableCell>
                        <TableCell>{formatCurrency(fee.amount)}</TableCell>
                        <TableCell>{fee.term}</TableCell>
                        <TableCell>{format(new Date(fee.due_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{fee.academic_year}</TableCell>
                        <TableCell>{format(new Date(fee.created_at), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Student Fee Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {studentFeesLoading ? (
                <div className="text-center py-4">Loading student fees...</div>
              ) : studentFees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No student fee assignments found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Fee Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentFees.map((studentFee) => (
                      <TableRow key={studentFee.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{studentFee.student?.name}</div>
                            <div className="text-sm text-gray-500">{studentFee.student?.admission_number}</div>
                          </div>
                        </TableCell>
                        <TableCell>{studentFee.fee?.category || 'General'}</TableCell>
                        <TableCell>{formatCurrency(studentFee.fee?.amount || 0)}</TableCell>
                        <TableCell>{formatCurrency(studentFee.amount_paid)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(studentFee.status)}>
                            {studentFee.status.charAt(0).toUpperCase() + studentFee.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(studentFee.due_date), 'MMM dd, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800">Total Collected</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      studentFees
                        .filter(sf => sf.status === 'paid')
                        .reduce((sum, sf) => sum + sf.amount_paid, 0)
                    )}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800">Partial Payments</h3>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(
                      studentFees
                        .filter(sf => sf.status === 'partial')
                        .reduce((sum, sf) => sum + sf.amount_paid, 0)
                    )}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800">Outstanding</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(
                      studentFees
                        .filter(sf => sf.status === 'unpaid')
                        .reduce((sum, sf) => sum + ((sf.fee?.amount || 0) - sf.amount_paid), 0)
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeeManagementPanel;
