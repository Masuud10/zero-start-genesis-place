
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  DollarSign, 
  Users, 
  CreditCard, 
  Receipt, 
  Smartphone,
  TrendingUp,
  AlertCircle,
  Settings
} from 'lucide-react';
import { useStudentFees } from '@/hooks/useStudentFees';
import { useMpesaTransactions } from '@/hooks/useMpesaTransactions';
import FeeAssignmentDialog from './FeeAssignmentDialog';
import PaymentRecordDialog from './PaymentRecordDialog';
import MpesaPaymentDialog from './MpesaPaymentDialog';
import MpesaTransactionsPanel from './MpesaTransactionsPanel';
import { format } from 'date-fns';

const EnhancedFeeManagementPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('structures');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { studentFees, loading } = useStudentFees();
  const { transactions } = useMpesaTransactions();

  const handleAssignmentComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Calculate summary statistics
  const totalFees = studentFees.reduce((sum, fee) => sum + fee.amount, 0);
  const totalCollected = studentFees.reduce((sum, fee) => sum + fee.amount_paid, 0);
  const totalOutstanding = totalFees - totalCollected;
  const collectionRate = totalFees > 0 ? (totalCollected / totalFees) * 100 : 0;

  const recentMpesaTransactions = transactions
    .filter(t => t.transaction_status === 'Success')
    .slice(0, 5);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'partial':
        return 'secondary';
      case 'unpaid':
        return 'destructive';
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'paid';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Fee Management</h2>
          <p className="text-muted-foreground">Comprehensive fee management with M-PESA integration</p>
        </div>
        <FeeAssignmentDialog mode="class" onAssignmentComplete={handleAssignmentComplete} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Fees</p>
                <p className="text-2xl font-bold">KES {totalFees.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Collected</p>
                <p className="text-2xl font-bold text-green-600">KES {totalCollected.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-red-600">KES {totalOutstanding.toLocaleString()}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <p className="text-2xl font-bold">{collectionRate.toFixed(1)}%</p>
              </div>
              <Receipt className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
          <TabsTrigger value="mpesa">M-PESA</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Fee Collections
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentFees.map((fee) => {
                        const balance = fee.amount - fee.amount_paid;
                        const overdue = isOverdue(fee.due_date, fee.status);
                        
                        return (
                          <TableRow key={fee.id} className={overdue ? 'bg-red-50' : ''}>
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
                            <TableCell className="text-green-600 font-semibold">
                              KES {fee.amount_paid.toLocaleString()}
                            </TableCell>
                            <TableCell className={balance > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                              KES {balance.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(fee.status)}>
                                {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                                {overdue && ' (Overdue)'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={overdue ? 'text-red-600 font-medium' : ''}>
                                {format(new Date(fee.due_date), 'MMM dd, yyyy')}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <PaymentRecordDialog studentFee={fee} />
                                <MpesaPaymentDialog studentFee={fee} />
                              </div>
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
        </TabsContent>

        <TabsContent value="outstanding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Outstanding Balances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Outstanding Amount</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentFees
                      .filter(fee => fee.amount - fee.amount_paid > 0)
                      .map((fee) => {
                        const balance = fee.amount - fee.amount_paid;
                        const daysOverdue = Math.max(0, Math.floor((new Date().getTime() - new Date(fee.due_date).getTime()) / (1000 * 60 * 60 * 24)));
                        
                        return (
                          <TableRow key={fee.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{fee.student?.name || 'N/A'}</div>
                                <div className="text-sm text-gray-500">
                                  {fee.student?.admission_number}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{fee.class?.name || 'N/A'}</TableCell>
                            <TableCell className="text-red-600 font-semibold">
                              KES {balance.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {daysOverdue > 0 ? (
                                <Badge variant="destructive">{daysOverdue} days</Badge>
                              ) : (
                                <Badge variant="secondary">Not due</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(fee.status)}>
                                {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <PaymentRecordDialog studentFee={fee} />
                                <MpesaPaymentDialog studentFee={fee} />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mpesa" className="space-y-4">
          <MpesaTransactionsPanel />
        </TabsContent>

        <TabsContent value="structures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Fee Structures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Fee structures management coming soon</p>
                <FeeAssignmentDialog mode="student" onAssignmentComplete={handleAssignmentComplete} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Financial Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Advanced reporting features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent M-PESA Transactions */}
      {recentMpesaTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-green-600" />
              Recent M-PESA Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentMpesaTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">{transaction.student?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">
                        {transaction.mpesa_receipt_number} • {transaction.phone_number}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      KES {transaction.amount_paid.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(transaction.transaction_date), 'MMM dd, HH:mm')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedFeeManagementPanel;
