
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Smartphone, Search, Filter, Download, RefreshCw, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useMpesaTransactions } from '@/hooks/useMpesaTransactions';
import { useToast } from '@/hooks/use-toast';

const MpesaPaymentsModule: React.FC = () => {
  const { transactions, loading, error, processSTKPush, refetch } = useMpesaTransactions();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSTKDialogOpen, setIsSTKDialogOpen] = useState(false);
  const [stkFormData, setSTKFormData] = useState({
    phoneNumber: '',
    amount: '',
    studentId: '',
    description: ''
  });
  const [processing, setProcessing] = useState(false);

  // Filter transactions based on search and status
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      (transaction.phone_number?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.mpesa_receipt_number?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || transaction.transaction_status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Calculate summary statistics
  const totalTransactions = transactions.length;
  const successfulTransactions = transactions.filter(t => t.transaction_status === 'Success').length;
  const pendingTransactions = transactions.filter(t => t.transaction_status === 'Pending').length;
  const failedTransactions = transactions.filter(t => t.transaction_status === 'Failed').length;
  const totalAmount = transactions
    .filter(t => t.transaction_status === 'Success')
    .reduce((sum, t) => sum + (t.amount_paid || 0), 0);

  const handleSTKPush = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stkFormData.phoneNumber || !stkFormData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    
    try {
      const result = await processSTKPush(
        stkFormData.phoneNumber,
        parseFloat(stkFormData.amount),
        stkFormData.studentId || 'direct-payment'
      );

      if (result.success) {
        toast({
          title: "STK Push Sent",
          description: "Please check your phone and enter your M-PESA PIN",
        });
        setIsSTKDialogOpen(false);
        setSTKFormData({ phoneNumber: '', amount: '', studentId: '', description: '' });
        refetch();
      }
    } catch (error) {
      console.error('STK Push error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading M-PESA transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading M-PESA transactions: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">M-PESA Payments</h2>
          <p className="text-muted-foreground">Manage and track M-PESA transactions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isSTKDialogOpen} onOpenChange={setIsSTKDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Smartphone className="w-4 h-4 mr-2" />
                New STK Push
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Initiate M-PESA Payment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSTKPush} className="space-y-4">
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={stkFormData.phoneNumber}
                    onChange={(e) => setSTKFormData({ ...stkFormData, phoneNumber: e.target.value })}
                    placeholder="0712345678"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (KES) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={stkFormData.amount}
                    onChange={(e) => setSTKFormData({ ...stkFormData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="studentId">Student ID (Optional)</Label>
                  <Input
                    id="studentId"
                    value={stkFormData.studentId}
                    onChange={(e) => setSTKFormData({ ...stkFormData, studentId: e.target.value })}
                    placeholder="Student ID or Fee ID"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={stkFormData.description}
                    onChange={(e) => setSTKFormData({ ...stkFormData, description: e.target.value })}
                    placeholder="Payment description"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsSTKDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700">
                    {processing ? 'Processing...' : 'Send STK Push'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold text-green-600">{successfulTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <div className="text-green-600 font-bold text-sm">KES</div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by phone, receipt number, or student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Smartphone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No transactions found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {formatDate(transaction.transaction_date)}
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {transaction.phone_number || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">
                          {formatCurrency(transaction.amount_paid || 0)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs">
                          {transaction.mpesa_receipt_number || 'Pending'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.student ? (
                          <div>
                            <div className="font-medium">{transaction.student.name}</div>
                            <div className="text-xs text-gray-500">{transaction.student.admission_number}</div>
                          </div>
                        ) : (
                          <span className="text-gray-500">Direct Payment</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.transaction_status || 'pending')}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MpesaPaymentsModule;
