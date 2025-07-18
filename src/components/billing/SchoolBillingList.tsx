
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Building2, Calendar, DollarSign } from 'lucide-react';
import { useBillingRecords } from '@/hooks/useBillingManagement';

interface SchoolBillingListProps {
  onSelectSchool: (schoolId: string) => void;
  selectedSchoolId?: string;
}

const SchoolBillingList: React.FC<SchoolBillingListProps> = ({
  onSelectSchool,
  selectedSchoolId
}) => {
  const { data: billingRecords, isLoading } = useBillingRecords();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading billing records...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse p-4 border rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group records by school
  const recordsBySchool = billingRecords?.reduce((acc, record) => {
    const schoolId = record.id; // Using record ID as fallback
    if (!acc[schoolId]) {
      acc[schoolId] = {
        school: { name: 'Unknown School', id: schoolId },
        records: []
      };
    }
    acc[schoolId].records.push(record);
    return acc;
  }, {} as Record<string, { school: any; records: any[] }>) || {};

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          School Billing Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(recordsBySchool).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No billing records found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(recordsBySchool).map(([schoolId, { school, records }]) => {
              const totalAmount = records.reduce((sum, record) => sum + (record.amount || 0), 0);
              const pendingAmount = records
                .filter(r => r.status === 'pending')
                .reduce((sum, record) => sum + (record.amount || 0), 0);
              const paidAmount = records
                .filter(r => r.status === 'paid')
                .reduce((sum, record) => sum + (record.amount || 0), 0);

              return (
                <div
                  key={schoolId}
                  className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                    selectedSchoolId === schoolId ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-semibold">{school?.name || 'Unknown School'}</h3>
                          <p className="text-sm text-muted-foreground">{school?.email}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            KES {totalAmount.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">Total Billed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            KES {paidAmount.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">Paid</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-600">
                            KES {pendingAmount.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">Pending</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">
                            {records.length}
                          </div>
                          <div className="text-xs text-muted-foreground">Total Records</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        {records.slice(0, 3).map((record) => (
                          <Badge key={record.id} className={getStatusColor(record.status)}>
                            {record.billing_type} - {record.status}
                          </Badge>
                        ))}
                        {records.length > 3 && (
                          <span className="text-sm text-muted-foreground">
                            +{records.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectSchool(schoolId)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SchoolBillingList;
