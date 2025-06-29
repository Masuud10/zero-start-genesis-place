
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Users, DollarSign, Calendar } from 'lucide-react';
import { useBillingRecords } from '@/hooks/useBillingManagement';
import { format } from 'date-fns';

interface SchoolBillingListProps {
  onSelectSchool: (schoolId: string) => void;
  selectedSchoolId?: string;
}

const SchoolBillingList: React.FC<SchoolBillingListProps> = ({ 
  onSelectSchool 
}) => {
  const { data: billingRecords, isLoading, error } = useBillingRecords();

  console.log('🏫 SchoolBillingList: Rendering with records:', billingRecords?.length || 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>School Billing Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Failed to load school billing records</p>
          <p className="text-red-500 text-sm mt-2">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!billingRecords || billingRecords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>School Billing Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No billing records found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group records by school
  const schoolGroups = billingRecords.reduce((acc, record) => {
    const schoolId = record.school_id;
    const schoolName = record.school?.name || 'Unknown School';
    
    if (!acc[schoolId]) {
      acc[schoolId] = {
        schoolId,
        schoolName,
        studentCount: record.school?.student_count || 0,
        records: [],
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0
      };
    }
    
    acc[schoolId].records.push(record);
    acc[schoolId].totalAmount += Number(record.amount);
    
    if (record.status === 'paid') {
      acc[schoolId].paidAmount += Number(record.amount);
    } else if (record.status === 'pending') {
      acc[schoolId].pendingAmount += Number(record.amount);
    }
    
    return acc;
  }, {} as Record<string, any>);

  const schools = Object.values(schoolGroups);

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (school: any) => {
    if (school.pendingAmount > 0) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
    if (school.paidAmount > 0) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
    }
    return <Badge variant="outline">No Records</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          School Billing Records ({schools.length} schools)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School Name</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Paid Amount</TableHead>
                <TableHead>Pending Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools.map((school) => (
                <TableRow key={school.schoolId}>
                  <TableCell>
                    <div className="font-medium">{school.schoolName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-500" />
                      {school.studentCount}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCurrency(school.totalAmount)}
                  </TableCell>
                  <TableCell className="font-mono text-green-600">
                    {formatCurrency(school.paidAmount)}
                  </TableCell>
                  <TableCell className="font-mono text-yellow-600">
                    {formatCurrency(school.pendingAmount)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(school)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {school.records.length}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onSelectSchool(school.schoolId)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-3 w-3" />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolBillingList;
