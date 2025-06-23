import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Search, Eye, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Student, FeeRecord } from '@/hooks/fee-management/types';

interface StudentAccount {
  student: Student;
  totalFees: number;
  totalPaid: number;
  outstanding: number;
  fees: FeeRecord[];
}

const StudentAccountsPanel: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentAccounts, setStudentAccounts] = useState<StudentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentAccount | null>(null);

  useEffect(() => {
    fetchStudentsAndFees();
  }, [user?.school_id]);

  const fetchStudentsAndFees = async () => {
    if (!user?.school_id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch students with proper class relationship using explicit join
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          admission_number,
          class_id,
          school_id,
          classes:class_id(name)
        `)
        .eq('school_id', user.school_id);

      if (studentsError) throw studentsError;

      // Transform students data with proper error handling
      const transformedStudents: Student[] = (studentsData || []).map(student => ({
        id: student.id,
        name: student.name,
        admission_number: student.admission_number,
        class_id: student.class_id,
        school_id: student.school_id,
        class: student.classes && student.classes !== null && typeof student.classes === 'object' && 'name' in student.classes 
          ? { name: student.classes.name } 
          : { name: 'Unknown Class' }
      }));

      setStudents(transformedStudents);

      // Fetch fees for all students with explicit join
      const { data: feesData, error: feesError } = await supabase
        .from('fees')
        .select(`
          *,
          students:student_id(name, admission_number),
          classes:class_id(name)
        `)
        .eq('school_id', user.school_id);

      if (feesError) throw feesError;

      // Group fees by student and calculate totals
      const accountsMap = new Map<string, StudentAccount>();

      transformedStudents.forEach(student => {
        accountsMap.set(student.id, {
          student,
          totalFees: 0,
          totalPaid: 0,
          outstanding: 0,
          fees: []
        });
      });

      (feesData || []).forEach(fee => {
        const studentId = fee.student_id;
        const account = accountsMap.get(studentId);
        
        if (account) {
          // Ensure status is properly typed
          const validStatuses: Array<'pending' | 'paid' | 'partial' | 'overdue'> = ['pending', 'paid', 'partial', 'overdue'];
          const feeStatus = validStatuses.includes(fee.status as any) ? fee.status : 'pending';
          
          const feeRecord: FeeRecord = {
            id: fee.id,
            studentId: fee.student_id,
            amount: fee.amount || 0,
            paidAmount: fee.paid_amount || 0,
            dueDate: fee.due_date,
            term: fee.term,
            category: fee.category,
            status: feeStatus as 'pending' | 'paid' | 'partial' | 'overdue',
            studentName: account.student.name,
            admissionNumber: account.student.admission_number,
            className: account.student.class?.name || 'Unknown Class',
            academicYear: fee.academic_year,
            paymentMethod: fee.payment_method,
            paidDate: fee.paid_date,
            createdAt: fee.created_at,
            classId: fee.class_id
          };

          account.fees.push(feeRecord);
          account.totalFees += feeRecord.amount;
          account.totalPaid += feeRecord.paidAmount;
          account.outstanding = account.totalFees - account.totalPaid;
        }
      });

      setStudentAccounts(Array.from(accountsMap.values()));
    } catch (err: any) {
      console.error('Error fetching student accounts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = studentAccounts.filter(account => {
    const matchesSearch = account.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.student.admission_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || account.student.class_id === selectedClass;
    return matchesSearch && matchesClass;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading student accounts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading student accounts: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Student Accounts</h2>
          <p className="text-muted-foreground">View detailed financial records for each student</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by student name or admission number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {Array.from(new Set(students.map(s => s.class_id))).map(classId => {
              const student = students.find(s => s.class_id === classId);
              return (
                <SelectItem key={classId} value={classId}>
                  {student?.class?.name || 'Unknown'}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Student Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Total Fees</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-right">Payment Rate</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => {
                  const paymentRate = account.totalFees > 0 
                    ? ((account.totalPaid / account.totalFees) * 100).toFixed(1)
                    : '0';
                  
                  return (
                    <TableRow key={account.student.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{account.student.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {account.student.admission_number}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{account.student.class?.name}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(account.totalFees)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(account.totalPaid)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {formatCurrency(account.outstanding)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${
                          parseFloat(paymentRate) >= 80 ? 'text-green-600' :
                          parseFloat(paymentRate) >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {paymentRate}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedStudent(account)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                Student Account Details - {account.student.name}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                  <div className="text-2xl font-bold text-blue-600">
                                    {formatCurrency(account.totalFees)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Total Fees</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                  <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(account.totalPaid)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Paid</div>
                                </div>
                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                  <div className="text-2xl font-bold text-red-600">
                                    {formatCurrency(account.outstanding)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Outstanding</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                  <div className="text-2xl font-bold text-purple-600">
                                    {account.fees.length}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Fee Items</div>
                                </div>
                              </div>

                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Category</TableHead>
                                      <TableHead>Term</TableHead>
                                      <TableHead className="text-right">Amount</TableHead>
                                      <TableHead className="text-right">Paid</TableHead>
                                      <TableHead className="text-right">Balance</TableHead>
                                      <TableHead>Due Date</TableHead>
                                      <TableHead>Status</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {account.fees.map((fee) => (
                                      <TableRow key={fee.id}>
                                        <TableCell>{fee.category}</TableCell>
                                        <TableCell>{fee.term}</TableCell>
                                        <TableCell className="text-right">
                                          {formatCurrency(fee.amount)}
                                        </TableCell>
                                        <TableCell className="text-right text-green-600">
                                          {formatCurrency(fee.paidAmount)}
                                        </TableCell>
                                        <TableCell className="text-right text-red-600">
                                          {formatCurrency(fee.amount - fee.paidAmount)}
                                        </TableCell>
                                        <TableCell>
                                          {new Date(fee.dueDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                          <Badge className={getStatusColor(fee.status)}>
                                            {fee.status}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {filteredAccounts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No student accounts found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAccountsPanel;
