
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calculator, RefreshCw } from 'lucide-react';
import { useSchoolBillingRecords, useBillingActions } from '@/hooks/useBillingManagement';
import { BillingManagementService } from '@/services/billing/billingManagementService';
import { format } from 'date-fns';

interface SchoolBillingDetailsProps {
  schoolId: string;
  onBack: () => void;
}

const SchoolBillingDetails: React.FC<SchoolBillingDetailsProps> = ({ 
  schoolId, 
  onBack 
}) => {
  const { data: records, isLoading, refetch } = useSchoolBillingRecords(schoolId);
  const { updateBillingStatus } = useBillingActions();
  const [subscriptionCalculation, setSubscriptionCalculation] = useState<any>(null);
  const [calculatingSubscription, setCalculatingSubscription] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getBillingTypeBadge = (type: string) => {
    return (
      <Badge variant={type === 'setup_fee' ? 'outline' : 'secondary'}>
        {type === 'setup_fee' ? 'Setup Fee' : 'Subscription'}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const handleStatusUpdate = (recordId: string, newStatus: string) => {
    updateBillingStatus.mutate({ 
      recordId, 
      status: newStatus,
      paymentMethod: newStatus === 'paid' ? 'manual' : undefined
    });
  };

  const calculateSubscriptionFee = async () => {
    setCalculatingSubscription(true);
    try {
      const result = await BillingManagementService.calculateSubscriptionFee(schoolId);
      if (result.data) {
        setSubscriptionCalculation(result.data);
      }
    } catch (error) {
      console.error('Error calculating subscription fee:', error);
    } finally {
      setCalculatingSubscription(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Loading billing details...</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!records || records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>No billing records found</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">This school has no billing records yet.</p>
        </CardContent>
      </Card>
    );
  }

  const schoolName = records[0]?.school?.name || 'Unknown School';
  const setupFees = records.filter(r => r.billing_type === 'setup_fee');
  const subscriptionFees = records.filter(r => r.billing_type === 'subscription_fee');
  
  const totalAmount = records.reduce((sum, record) => sum + Number(record.amount), 0);
  const totalPaid = records.filter(r => r.status === 'paid').reduce((sum, record) => sum + Number(record.amount), 0);
  const totalOutstanding = totalAmount - totalPaid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-xl">{schoolName}</CardTitle>
                <p className="text-sm text-muted-foreground">Billing Details</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={calculateSubscriptionFee}
                variant="outline" 
                size="sm"
                disabled={calculatingSubscription}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Subscription
              </Button>
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOutstanding)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Calculation */}
      {subscriptionCalculation && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Fee Calculation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Student Count:</span>
                <div className="text-lg font-bold">{subscriptionCalculation.student_count}</div>
              </div>
              <div>
                <span className="font-medium">Rate per Student:</span>
                <div className="text-lg font-bold">{formatCurrency(subscriptionCalculation.per_student_rate)}</div>
              </div>
              <div>
                <span className="font-medium">Calculated Amount:</span>
                <div className="text-lg font-bold text-blue-600">{formatCurrency(subscriptionCalculation.calculated_amount)}</div>
              </div>
              <div>
                <span className="font-medium">Currency:</span>
                <div className="text-lg font-bold">{subscriptionCalculation.currency}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Billing Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{getBillingTypeBadge(record.billing_type)}</TableCell>
                  <TableCell className="font-mono text-sm">{record.invoice_number}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{record.description}</div>
                      {record.student_count && (
                        <div className="text-sm text-muted-foreground">
                          {record.student_count} students
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{formatCurrency(record.amount)}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>{format(new Date(record.due_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {record.status === 'pending' && (
                        <Button
                          onClick={() => handleStatusUpdate(record.id, 'paid')}
                          size="sm"
                          disabled={updateBillingStatus.isPending}
                        >
                          Mark Paid
                        </Button>
                      )}
                      {record.status === 'paid' && (
                        <Button
                          onClick={() => handleStatusUpdate(record.id, 'pending')}
                          variant="outline"
                          size="sm"
                          disabled={updateBillingStatus.isPending}
                        >
                          Mark Pending
                        </Button>
                      )}
                      {record.status === 'pending' && (
                        <Select 
                          onValueChange={(value) => handleStatusUpdate(record.id, value)}
                          disabled={updateBillingStatus.isPending}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Change Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paid">Mark Paid</SelectItem>
                            <SelectItem value="overdue">Mark Overdue</SelectItem>
                            <SelectItem value="cancelled">Cancel</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolBillingDetails;
