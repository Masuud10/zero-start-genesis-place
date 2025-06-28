
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Eye, Plus, RefreshCw, Calendar, Search, Users, DollarSign, FileText } from 'lucide-react';
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
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Build filters object
  const filters = {
    status: filterStatus !== 'all' ? filterStatus : undefined,
    school_name: searchTerm || undefined,
    month: filterMonth || undefined,
    year: filterYear || undefined,
  };

  const { data: records, isLoading, refetch } = useBillingRecords(filters);
  const { updateBillingStatus, createSetupFee, createMonthlySubscriptions } = useBillingActions();

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
    setIsCreateModalOpen(false);
  };

  const handleExportInvoice = (recordId: string) => {
    // TODO: Implement invoice export functionality
    console.log('Export invoice for record:', recordId);
  };

  const clearFilters = () => {
    setFilterStatus('all');
    setSearchTerm('');
    setFilterMonth('');
    setFilterYear(new Date().getFullYear().toString());
  };

  // Group records by school
  const recordsBySchool = (records || []).reduce((acc, record) => {
    const schoolId = record.school_id;
    if (!acc[schoolId]) {
      acc[schoolId] = {
        school: record.school,
        records: []
      };
    }
    acc[schoolId].records.push(record);
    return acc;
  }, {} as Record<string, { school?: { id: string; name: string; student_count?: number; total_billing_amount?: number; outstanding_balance?: number }; records: BillingRecord[] }>);

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
          {/* Search and Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Months</SelectItem>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* School Billing Records */}
      {Object.entries(recordsBySchool).map(([schoolId, schoolData]) => {
        const school = schoolData.school;
        const schoolRecords = schoolData.records;
        
        // Calculate school totals
        const totalBilling = schoolRecords.reduce((sum, record) => sum + Number(record.amount), 0);
        const totalPaid = schoolRecords.filter(record => record.status === 'paid').reduce((sum, record) => sum + Number(record.amount), 0);
        const outstandingBalance = totalBilling - totalPaid;
        const studentCount = school?.student_count || 0;

        return (
          <Card 
            key={schoolId} 
            className={`cursor-pointer transition-colors hover:bg-gray-50 ${
              selectedSchoolId === schoolId ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => onSelectSchool(schoolId)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-lg">
                      {school?.name || 'Unknown School'}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-sm text-blue-600">
                      <Users className="h-4 w-4" />
                      <span>{studentCount} students</span>
                    </div>
                  </div>
                  
                  {/* School Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-medium">Total Billing</div>
                        <div className="text-green-600 font-semibold">{formatCurrency(totalBilling)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium">Total Paid</div>
                        <div className="text-blue-600 font-semibold">{formatCurrency(totalPaid)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-red-600" />
                      <div>
                        <div className="font-medium">Outstanding</div>
                        <div className="text-red-600 font-semibold">{formatCurrency(outstandingBalance)}</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {schoolRecords.length} billing record(s)
                  </p>
                </div>
                
                <div className="flex flex-col gap-2">
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
                {schoolRecords.slice(0, 3).map((record) => (
                  <div key={record.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      {getBillingTypeBadge(record.billing_type)}
                      <span className="text-sm font-medium">{formatCurrency(record.amount)}</span>
                      <span className="text-xs text-muted-foreground">
                        Due: {format(new Date(record.due_date), 'MMM dd, yyyy')}
                      </span>
                      {record.student_count && (
                        <span className="text-xs text-blue-600">
                          ({record.student_count} students)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(record.status)}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportInvoice(record.id);
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <FileText className="h-3 w-3" />
                      </Button>
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
                {schoolRecords.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{schoolRecords.length - 3} more records
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {Object.keys(recordsBySchool).length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' || filterMonth || filterYear !== new Date().getFullYear().toString()
                ? 'No billing records found matching your filters'
                : 'No billing records found'
              }
            </p>
            <div className="flex gap-2 justify-center">
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
