import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, Plus, RefreshCw, Calendar } from 'lucide-react';
import { useBillingRecords, useBillingActions } from '@/hooks/useBillingManagement';
import { BillingRecord } from '@/services/billing/billingManagementService';
import { format } from 'date-fns';
import CreateMonthlySubscriptionModal from './CreateMonthlySubscriptionModal';

interface SchoolBillingListProps {
  onSelectSchool: (schoolId: string) => void;
  selectedSchoolId?: string;
}

const SchoolBillingList: React.FC<SchoolBillingListProps> = ({ 
  onSelectSchool, 
  selectedSchoolId 
}) => {
  const { data: records, isLoading, refetch } = useBillingRecords();
  const { updateBillingStatus, createSetupFee, createMonthlySubscriptions } = useBillingActions();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

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

  const handleCreateSetupFee = (schoolId: string) => {
    createSetupFee.mutate(schoolId);
  };

  const handleCreateMonthlySubscriptions = () => {
    createMonthlySubscriptions.mutate();
  };

  const handleCreateModalSuccess = () => {
    refetch(); // Refresh the billing records list
  };

  const filteredRecords = records?.filter(record => 
    filterStatus === 'all' || record.status === filterStatus
  ) || [];

  // Group records by school
  const recordsBySchool = filteredRecords.reduce((acc, record) => {
    const schoolId = record.school_id;
    if (!acc[schoolId]) {
      acc[schoolId] = {
        school: record.school,
        records: []
      };
    }
    acc[schoolId].records.push(record);
    return acc;
  }, {} as Record<string, { school?: { id: string; name: string }; records: BillingRecord[] }>);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading billing records...</CardTitle>
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

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>School Billing Management</CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Create Monthly Subscription
              </Button>
              <Button 
                onClick={handleCreateMonthlySubscriptions}
                variant="outline"
                size="sm"
                disabled={createMonthlySubscriptions.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Bulk Create Monthly
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium">Filter by Status:</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* School Billing Records */}
      {Object.entries(recordsBySchool).map(([schoolId, schoolData]) => (
        <Card 
          key={schoolId} 
          className={`cursor-pointer transition-colors hover:bg-gray-50 ${
            selectedSchoolId === schoolId ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => onSelectSchool(schoolId)}
        >
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">
                  {schoolData.school?.name || 'Unknown School'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {schoolData.records.length} billing record(s)
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateSetupFee(schoolId);
                  }}
                  variant="outline"
                  size="sm"
                  disabled={createSetupFee.isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Setup Fee
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSchool(schoolId);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {schoolData.records.slice(0, 3).map((record) => (
                <div key={record.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    {getBillingTypeBadge(record.billing_type)}
                    <span className="text-sm font-medium">{formatCurrency(record.amount)}</span>
                    <span className="text-xs text-muted-foreground">
                      Due: {format(new Date(record.due_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(record.status)}
                    {record.status === 'pending' && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(record.id, 'paid');
                        }}
                        size="sm"
                        variant="outline"
                        disabled={updateBillingStatus.isPending}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {schoolData.records.length > 3 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{schoolData.records.length - 3} more records
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {Object.keys(recordsBySchool).length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No billing records found</p>
            <div className="flex gap-2 justify-center mt-4">
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Create Monthly Subscription
              </Button>
              <Button 
                onClick={handleCreateMonthlySubscriptions}
                variant="outline"
                disabled={createMonthlySubscriptions.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Bulk Create Monthly
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Monthly Subscription Modal */}
      <CreateMonthlySubscriptionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateModalSuccess}
      />
    </div>
  );
};

export default SchoolBillingList;
