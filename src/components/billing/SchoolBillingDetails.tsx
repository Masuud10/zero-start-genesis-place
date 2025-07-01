
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, Calendar, DollarSign, FileText } from 'lucide-react';
import { useBillingRecords } from '@/hooks/useBillingManagement';

interface SchoolBillingDetailsProps {
  schoolId: string;
  onBack: () => void;
}

const SchoolBillingDetails: React.FC<SchoolBillingDetailsProps> = ({
  schoolId,
  onBack
}) => {
  const { data: billingRecords, isLoading } = useBillingRecords();

  const schoolRecords = billingRecords?.filter(record => record.school_id === schoolId) || [];
  const school = schoolRecords[0]?.schools;

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Loading school details...</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAmount = schoolRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
  const paidAmount = schoolRecords
    .filter(r => r.status === 'paid')
    .reduce((sum, record) => sum + (record.amount || 0), 0);
  const pendingAmount = schoolRecords
    .filter(r => r.status === 'pending')
    .reduce((sum, record) => sum + (record.amount || 0), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>{school?.name || 'School Details'}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">
                KES {totalAmount.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Billed</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                KES {paidAmount.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Paid</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                KES {pendingAmount.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Outstanding</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Billing Records ({schoolRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schoolRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No billing records found for this school</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schoolRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="font-medium capitalize">
                          {record.billing_type?.replace('_', ' ')}
                        </span>
                      </div>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status?.toUpperCase()}
                      </Badge>
                    </div>
                    
                    {record.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {record.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created: {new Date(record.created_at).toLocaleDateString()}
                      </span>
                      {record.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due: {new Date(record.due_date).toLocaleDateString()}
                        </span>
                      )}
                      {record.invoice_number && (
                        <span>Invoice: {record.invoice_number}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      KES {(record.amount || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolBillingDetails;
