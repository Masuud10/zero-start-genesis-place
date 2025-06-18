
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, DollarSign, Users, Calendar, CreditCard } from 'lucide-react';
import { useFees, useStudentFees } from '@/hooks/useFees';
import FeeAssignmentDialog from './FeeAssignmentDialog';
import PaymentDialog from './PaymentDialog';
import { useToast } from '@/hooks/use-toast';

const FeeManagementPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  const { fees, loading: feesLoading, error: feesError } = useFees();
  const { studentFees, loading: studentFeesLoading, updateStudentFeePayment } = useStudentFees();
  const { toast } = useToast();

  const handlePaymentUpdate = async (studentFeeId: string, amountPaid: number, status: 'paid' | 'unpaid' | 'partial') => {
    try {
      await updateStudentFeePayment(studentFeeId, amountPaid, status);
      toast({
        title: "Success",
        description: "Payment updated successfully",
      });
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  const filteredStudentFees = studentFees.filter(sf => 
    sf.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sf.student?.admission_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sf.fee?.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals with proper null checks and using the fees table structure
  const totalFees = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
  const totalPaid = studentFees.reduce((sum, sf) => sum + (sf.amount_paid || 0), 0);
  const totalOutstanding = totalFees - totalPaid;
  const collectionRate = totalFees > 0 ? (totalPaid / totalFees) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Fee Management</h3>
        <FeeAssignmentDialog />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalFees.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Total Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">KES {totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-orange-600" />
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">KES {totalOutstanding.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Collection Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="student-fees">Student Fees</TabsTrigger>
          <TabsTrigger value="fee-structures">Fee Structures</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Fee Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentFees.slice(0, 10).map((sf) => (
                  <div key={sf.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{sf.student?.name || 'Unknown Student'}</p>
                      <p className="text-sm text-gray-500">
                        {sf.fee?.category} - {sf.fee?.term} | {sf.student?.admission_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={sf.status === 'paid' ? 'default' : sf.status === 'partial' ? 'secondary' : 'destructive'}>
                        {sf.status}
                      </Badge>
                      <p className="text-sm mt-1">KES {sf.amount_paid.toLocaleString()} / {sf.fee?.amount?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="student-fees" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by student name, admission number, or fee category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">Student</th>
                      <th className="text-left p-4">Fee Details</th>
                      <th className="text-left p-4">Amount</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Due Date</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentFeesLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center p-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredStudentFees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-gray-500">
                          No student fees found
                        </td>
                      </tr>
                    ) : (
                      filteredStudentFees.map((sf) => (
                        <tr key={sf.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{sf.student?.name || 'Unknown'}</p>
                              <p className="text-sm text-gray-500">{sf.student?.admission_number}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{sf.fee?.category}</p>
                              <p className="text-sm text-gray-500">{sf.fee?.term} {sf.fee?.academic_year}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium">KES {sf.fee?.amount?.toLocaleString()}</p>
                              <p className="text-sm text-gray-500">Paid: KES {sf.amount_paid.toLocaleString()}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant={sf.status === 'paid' ? 'default' : sf.status === 'partial' ? 'secondary' : 'destructive'}>
                              {sf.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{new Date(sf.due_date).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <PaymentDialog
                              studentFeeId={sf.id}
                              studentName={sf.student?.name || 'Unknown Student'}
                              feeAmount={sf.fee?.amount || 0}
                              amountPaid={sf.amount_paid}
                              trigger={
                                <Button size="sm" variant="outline">
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Record Payment
                                </Button>
                              }
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fee-structures">
          <Card>
            <CardHeader>
              <CardTitle>Fee Structures</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Fee structure management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeeManagementPanel;
