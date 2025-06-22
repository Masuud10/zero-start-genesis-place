
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Search, Eye, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const StudentAccountsPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const { user } = useAuth();

  const { data: students, isLoading } = useQuery({
    queryKey: ['student-accounts', user?.school_id, searchTerm, classFilter],
    queryFn: async () => {
      let query = supabase
        .from('students')
        .select(`
          id,
          name,
          admission_number,
          class:classes(name),
          fees:fees(
            id,
            amount,
            paid_amount,
            status,
            category,
            term,
            due_date,
            academic_year
          )
        `)
        .eq('school_id', user?.school_id)
        .eq('is_active', true);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,admission_number.ilike.%${searchTerm}%`);
      }

      if (classFilter) {
        query = query.eq('class_id', classFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data?.map(student => {
        const totalFees = student.fees?.reduce((sum: number, fee: any) => sum + (fee.amount || 0), 0) || 0;
        const paidAmount = student.fees?.reduce((sum: number, fee: any) => sum + (fee.paid_amount || 0), 0) || 0;
        const outstanding = totalFees - paidAmount;

        return {
          ...student,
          totalFees,
          paidAmount,
          outstanding,
          paymentHistory: student.fees || []
        };
      }) || [];
    },
    enabled: !!user?.school_id
  });

  const { data: classes } = useQuery({
    queryKey: ['classes-for-filter', user?.school_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .eq('school_id', user?.school_id)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.school_id
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
      case 'pending':
        return <Badge className="bg-red-100 text-red-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Student Accounts
        </h3>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or admission number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classes</SelectItem>
                {classes?.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Fee Accounts</CardTitle>
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
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Total Fees</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students?.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-500">
                          {student.admission_number}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{student.class?.name}</TableCell>
                    <TableCell className="font-semibold">
                      KES {student.totalFees.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-green-600 font-semibold">
                      KES {student.paidAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-red-600 font-semibold">
                      KES {student.outstanding.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {student.outstanding === 0 ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Cleared
                        </Badge>
                      ) : student.paidAmount > 0 ? (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Partial
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <DollarSign className="h-3 w-3 mr-1" />
                          Outstanding
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedStudent(student)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>
                              {selectedStudent?.name} - Fee Account Details
                            </DialogTitle>
                          </DialogHeader>
                          {selectedStudent && (
                            <div className="space-y-6">
                              {/* Account Summary */}
                              <div className="grid grid-cols-3 gap-4">
                                <Card>
                                  <CardContent className="pt-6">
                                    <div className="text-2xl font-bold text-blue-600">
                                      KES {selectedStudent.totalFees.toLocaleString()}
                                    </div>
                                    <p className="text-sm text-gray-600">Total Fees</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="pt-6">
                                    <div className="text-2xl font-bold text-green-600">
                                      KES {selectedStudent.paidAmount.toLocaleString()}
                                    </div>
                                    <p className="text-sm text-gray-600">Amount Paid</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="pt-6">
                                    <div className="text-2xl font-bold text-red-600">
                                      KES {selectedStudent.outstanding.toLocaleString()}
                                    </div>
                                    <p className="text-sm text-gray-600">Outstanding</p>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Payment History */}
                              <div>
                                <h4 className="text-lg font-semibold mb-4">Payment History</h4>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Fee Category</TableHead>
                                      <TableHead>Term</TableHead>
                                      <TableHead>Amount</TableHead>
                                      <TableHead>Paid</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead>Due Date</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {selectedStudent.paymentHistory.map((fee: any) => (
                                      <TableRow key={fee.id}>
                                        <TableCell>{fee.category}</TableCell>
                                        <TableCell>{fee.term}</TableCell>
                                        <TableCell>KES {fee.amount.toLocaleString()}</TableCell>
                                        <TableCell>KES {(fee.paid_amount || 0).toLocaleString()}</TableCell>
                                        <TableCell>{getStatusBadge(fee.status)}</TableCell>
                                        <TableCell>{new Date(fee.due_date).toLocaleDateString()}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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

export default StudentAccountsPanel;
