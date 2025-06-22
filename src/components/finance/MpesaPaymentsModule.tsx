
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Smartphone, Search, Filter, Download, RefreshCw, Settings, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const MpesaPaymentsModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['mpesa-transactions', user?.school_id, searchTerm, statusFilter, dateRange],
    queryFn: async () => {
      if (!user?.school_id) return [];

      let query = supabase
        .from('mpesa_transactions')
        .select(`
          *,
          students!mpesa_transactions_student_id_fkey(name, admission_number),
          classes!mpesa_transactions_class_id_fkey(name),
          fees!mpesa_transactions_fee_id_fkey(category, amount)
        `)
        .eq('school_id', user.school_id)
        .order('transaction_date', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('transaction_status', statusFilter);
      }

      if (searchTerm) {
        query = query.or(`phone_number.ilike.%${searchTerm}%,transaction_id.ilike.%${searchTerm}%,mpesa_receipt_number.ilike.%${searchTerm}%`);
      }

      if (dateRange !== 'all') {
        const days = parseInt(dateRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        query = query.gte('transaction_date', startDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.school_id
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'Failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleExportTransactions = async () => {
    try {
      // Create CSV content
      const csvHeaders = ['Transaction ID', 'Date', 'Student', 'Phone', 'Amount', 'Status', 'M-PESA Code'];
      const csvData = transactions?.map(tx => [
        tx.transaction_id || '',
        format(new Date(tx.transaction_date), 'yyyy-MM-dd HH:mm'),
        tx.students?.name || 'N/A',
        tx.phone_number,
        tx.amount_paid,
        tx.transaction_status,
        tx.mpesa_receipt_number || ''
      ]) || [];

      const csvContent = [csvHeaders, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mpesa-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: "M-PESA transactions exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export transactions",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            M-PESA Payments
          </h1>
          <p className="text-muted-foreground">Manage M-PESA transactions and payment processing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" onClick={handleExportTransactions}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {transactions?.filter(tx => tx.transaction_status === 'Success').length || 0}
            </div>
            <p className="text-sm text-gray-600">Successful</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {transactions?.filter(tx => tx.transaction_status === 'Pending').length || 0}
            </div>
            <p className="text-sm text-gray-600">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {transactions?.filter(tx => tx.transaction_status === 'Failed').length || 0}
            </div>
            <p className="text-sm text-gray-600">Failed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              KES {transactions?.filter(tx => tx.transaction_status === 'Success')
                .reduce((sum, tx) => sum + (tx.amount_paid || 0), 0).toLocaleString() || 0}
            </div>
            <p className="text-sm text-gray-600">Total Collected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by phone, transaction ID, or M-PESA code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Success">Success</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            M-PESA Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>M-PESA Code</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.transaction_date), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.students?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">
                          {transaction.students?.admission_number}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{transaction.phone_number}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      KES {transaction.amount_paid.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.transaction_status)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {transaction.mpesa_receipt_number || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Transaction ID</label>
                  <p className="text-sm text-gray-600 font-mono">{selectedTransaction.transaction_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">M-PESA Receipt</label>
                  <p className="text-sm text-gray-600 font-mono">{selectedTransaction.mpesa_receipt_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Student</label>
                  <p className="text-sm text-gray-600">{selectedTransaction.students?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone Number</label>
                  <p className="text-sm text-gray-600">{selectedTransaction.phone_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Amount</label>
                  <p className="text-sm text-gray-600 font-semibold">KES {selectedTransaction.amount_paid.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedTransaction.transaction_status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <p className="text-sm text-gray-600">
                    {format(new Date(selectedTransaction.transaction_date), 'PPpp')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Fee Category</label>
                  <p className="text-sm text-gray-600">{selectedTransaction.fees?.category || 'N/A'}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MpesaPaymentsModule;
