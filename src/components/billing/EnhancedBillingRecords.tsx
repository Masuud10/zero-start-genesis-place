import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Filter, Download, Loader2, Eye, Receipt, Plus } from 'lucide-react';
import { useSchoolBillingRecords, useBillingActions } from '@/hooks/useEnhancedBilling';
import { format } from 'date-fns';
import ManualFeeCreateDialog from './ManualFeeCreateDialog';

const EnhancedBillingRecords: React.FC = () => {
  const [filters, setFilters] = useState({
    status: '',
    billing_type: '',
    school_id: '',
    date_from: '',
    date_to: ''
  });

  const { data: records, isLoading, refetch } = useSchoolBillingRecords(filters);
  const { updateRecordStatus, generateInvoice, createSetupFee } = useBillingActions();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, BadgeProps['variant']> = {
      pending: 'secondary',
      paid: 'default',
      overdue: 'destructive',
      cancelled: 'outline'
    };
    
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getBillingTypeBadge = (type: string) => {
    const variants: Record<string, BadgeProps['variant']> = {
      setup_fee: 'outline',
      subscription_fee: 'secondary'
    };
    const labels: Record<string, string> = {
      setup_fee: 'Setup Fee',
      subscription_fee: 'Subscription'
    };
    return <Badge variant={variants[type] || 'secondary'}>{labels[type] || type}</Badge>;
  };

  const handleStatusUpdate = (recordId: string, newStatus: string) => {
    updateRecordStatus.mutate({ 
      recordId, 
      status: newStatus,
      paymentMethod: newStatus === 'paid' ? 'manual' : undefined
    });
  };

  const handleGenerateInvoice = (recordId: string) => {
    generateInvoice.mutate(recordId);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      billing_type: '',
      school_id: '',
      date_from: '',
      date_to: ''
    });
  };

  const formatCurrency = (amount: number, currency: string = 'KES') => {
    return `${currency} ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading billing records...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Billing Records
          </h2>
          <p className="text-muted-foreground">Manage school billing records and invoices</p>
        </div>
        <div className="flex gap-2">
          <ManualFeeCreateDialog />
          <Button variant="outline" onClick={() => refetch()}>
            <Eye className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Billing Type</Label>
              <Select value={filters.billing_type} onValueChange={(value) => handleFilterChange('billing_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="setup_fee">Setup Fee</SelectItem>
                  <SelectItem value="subscription_fee">Subscription Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>From Date</Label>
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
              />
            </div>

            <div>
              <Label>To Date</Label>
              <Input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Billing Records</CardTitle>
        </CardHeader>
        <CardContent>
          {!records || records.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No billing records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-sm">
                        {record.invoice_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.school?.name || 'Unknown School'}</div>
                          {record.school?.location && (
                            <div className="text-sm text-muted-foreground">{record.school.location}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getBillingTypeBadge(record.billing_type)}</TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(record.amount, record.currency)}
                        {record.student_count && (
                          <div className="text-sm text-muted-foreground">
                            {record.student_count} students
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>{format(new Date(record.due_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(record.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleGenerateInvoice(record.id)}
                            disabled={generateInvoice.isPending}
                          >
                            <Receipt className="h-3 w-3 mr-1" />
                            Invoice
                          </Button>
                          {record.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusUpdate(record.id, 'paid')}
                              disabled={updateRecordStatus.isPending}
                            >
                              Mark Paid
                            </Button>
                          )}
                          {record.status === 'paid' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusUpdate(record.id, 'pending')}
                              disabled={updateRecordStatus.isPending}
                            >
                              Mark Pending
                            </Button>
                          )}
                        </div>
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

export default EnhancedBillingRecords;
