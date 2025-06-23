
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Smartphone, Search, Filter, Download, AlertCircle, Loader2 } from 'lucide-react';
import { useMpesaTransactions } from '@/hooks/useMpesaTransactions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MpesaPaymentsModule: React.FC = () => {
  const { transactions, loading, error, refetch } = useMpesaTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.mpesa_receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.student?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      transaction.transaction_status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading M-PESA transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
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
          <p className="text-muted-foreground">
            Manage and track M-PESA payment transactions
          </p>
        </div>
        <Button onClick={refetch} variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by phone, receipt, or student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Transactions</span>
            </div>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-green-600 rounded"></div>
              <span className="text-sm font-medium">Successful</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {transactions.filter(t => t.transaction_status === 'Success').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-yellow-600 rounded"></div>
              <span className="text-sm font-medium">Pending</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {transactions.filter(t => t.transaction_status === 'Pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-red-600 rounded"></div>
              <span className="text-sm font-medium">Failed</span>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {transactions.filter(t => t.transaction_status === 'Failed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Smartphone className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No transactions found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No transactions match your search criteria.' 
                  : 'No M-PESA transactions have been recorded yet.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt Number</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.transaction_id}>
                    <TableCell className="font-medium">
                      {transaction.mpesa_receipt_number || 'N/A'}
                    </TableCell>
                    <TableCell>{transaction.phone_number}</TableCell>
                    <TableCell>
                      {transaction.student?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      KES {transaction.amount_paid?.toLocaleString() || '0'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(transaction.transaction_status || '')}>
                        {transaction.transaction_status || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {transaction.transaction_date 
                        ? new Date(transaction.transaction_date).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MpesaPaymentsModule;
