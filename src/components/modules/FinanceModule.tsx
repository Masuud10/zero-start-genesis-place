import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, Users, FileText, Plus, Download, CreditCard } from 'lucide-react';
import { useSchoolScopedData } from '@/hooks/useSchoolScopedData';
import { DataService } from '@/services/dataService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

const FinanceModule = () => {
  const [selectedTerm, setSelectedTerm] = useState('term1');
  const [selectedClass, setSelectedClass] = useState('all');
  const [feeRecords, setFeeRecords] = useState([]);
  const [financialStats, setFinancialStats] = useState({
    totalRevenue: 0,
    collected: 0,
    pending: 0,
    expenses: 0
  });
  const [loading, setLoading] = useState(true);
  const { buildSchoolScopedQuery } = useSchoolScopedData();
  const { toast } = useToast();

  const terms = [
    { id: 'term1', name: 'Term 1' },
    { id: 'term2', name: 'Term 2' },
    { id: 'term3', name: 'Term 3' },
  ];

  const classes = [
    { id: 'all', name: 'All Classes' },
    { id: '8a', name: 'Grade 8A' },
    { id: '8b', name: 'Grade 8B' },
    { id: '7a', name: 'Grade 7A' },
    { id: '7b', name: 'Grade 7B' },
  ];

  useEffect(() => {
    fetchFinancialData();
  }, [selectedTerm, selectedClass]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      // Fetch fee records
      let query = buildSchoolScopedQuery('fees', '*');

      if (selectedTerm !== 'all') {
        query = query.eq('term', selectedTerm);
      }

      const { data: fees, error } = await query.order('due_date', { ascending: false });

      if (error) {
        console.error('Error fetching fees:', error);
        toast({
          title: "Error",
          description: "Failed to fetch financial data",
          variant: "destructive",
        });
        return;
      }

      // Fetch student and class data separately
      const { data: studentsData } = await supabase
        .from('students')
        .select('id, name, admission_number, class_id');

      const { data: classesData } = await supabase
        .from('classes')
        .select('id, name');

      // Create lookup maps
      const studentMap = new Map(studentsData?.map(s => [s.id, s]) || []);
      const classMap = new Map(classesData?.map(c => [c.id, c.name]) || []);

      // Enhance fee records with student and class info
      const enhancedFees = (fees || []).map(fee => ({
        ...fee,
        student: studentMap.get(fee.student_id),
        className: classMap.get(studentMap.get(fee.student_id)?.class_id)
      }));

      setFeeRecords(enhancedFees);

      // Calculate statistics
      const total = fees?.reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0;
      const collected = fees?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;
      const pending = total - collected;

      setFinancialStats({
        totalRevenue: total,
        collected,
        pending,
        expenses: 0 // This would come from expenses table when implemented
      });

    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch financial data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (feeId: string, amount: number, paymentMethod: string) => {
    try {
      // Record the payment transaction
      const transactionData = {
        fee_id: feeId,
        transaction_type: 'payment' as const,
        amount,
        payment_method: paymentMethod as 'mpesa' | 'cash' | 'bank_transfer' | 'card' | 'cheque',
        processed_at: new Date().toISOString(),
        academic_year: new Date().getFullYear().toString(),
        term: selectedTerm
      };

      const { error: transactionError } = await DataService.recordPayment(transactionData);
      
      if (transactionError) {
        throw transactionError;
      }

      // Update the fee record
      const fee = feeRecords.find(f => f.id === feeId);
      if (fee) {
        const newPaidAmount = (fee.paid_amount || 0) + amount;
        const status: 'pending' | 'paid' | 'partial' | 'overdue' = newPaidAmount >= fee.amount ? 'paid' : 'partial';
        
        await DataService.updateFee(feeId, {
          paid_amount: newPaidAmount,
          status,
          payment_method: paymentMethod as 'mpesa' | 'cash' | 'bank_transfer' | 'card' | 'cheque',
          paid_date: new Date().toISOString()
        });
      }

      toast({
        title: "Payment Recorded",
        description: `Payment of ${formatCurrency(amount)} has been recorded successfully.`,
      });

      fetchFinancialData(); // Refresh data
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Finance Management
          </h1>
          <p className="text-muted-foreground">Manage school finances and fee collection</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Finance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Expected this term</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(financialStats.collected)}</div>
            <p className="text-xs text-muted-foreground">
              {financialStats.totalRevenue > 0 ? 
                `${((financialStats.collected / financialStats.totalRevenue) * 100).toFixed(1)}% of target` : 
                '0% of target'
              }
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(financialStats.pending)}</div>
            <p className="text-xs text-muted-foreground">Outstanding fees</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(financialStats.expenses)}</div>
            <p className="text-xs text-muted-foreground">This term</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Financial Records</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>{term.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fees" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="fees">Fee Collection</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="reports">Financial Reports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="fees" className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.student?.name || 'Unknown Student'}
                      </TableCell>
                      <TableCell>{record.student?.admission_number || 'N/A'}</TableCell>
                      <TableCell>{record.className || 'N/A'}</TableCell>
                      <TableCell className="capitalize">{record.category}</TableCell>
                      <TableCell>{formatCurrency(record.amount)}</TableCell>
                      <TableCell>{formatCurrency(record.paid_amount || 0)}</TableCell>
                      <TableCell>{formatCurrency(record.amount - (record.paid_amount || 0))}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{format(new Date(record.due_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRecordPayment(record.id, 1000, 'mpesa')}
                          disabled={record.status === 'paid'}
                        >
                          Record Payment
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {feeRecords.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                        No financial records found for the selected criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="expenses" className="mt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Expense tracking coming soon...</p>
              </div>
            </TabsContent>
            
            <TabsContent value="reports" className="mt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Financial reports coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceModule;
