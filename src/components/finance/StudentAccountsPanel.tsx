
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Search, Eye, CreditCard, AlertCircle, Loader2, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Student {
  id: string;
  name: string;
  admission_number: string;
  class: { name: string };
}

interface StudentFeeRecord {
  id: string;
  amount: number;
  paid_amount: number;
  status: string;
  due_date: string;
  category: string;
  term: string;
  academic_year: string;
  payment_method?: string;
  paid_date?: string;
}

interface StudentAccount {
  student: Student;
  totalFees: number;
  totalPaid: number;
  outstanding: number;
  fees: StudentFeeRecord[];
}

const StudentAccountsPanel: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [studentAccount, setStudentAccount] = useState<StudentAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, [user?.school_id]);

  const fetchClasses = async () => {
    if (!user?.school_id) return;

    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .eq('school_id', user.school_id)
        .order('name');

      if (error) throw error;
      setClasses(data || []);
    } catch (err: any) {
      console.error('Error fetching classes:', err);
    }
  };

  const fetchStudents = async () => {
    if (!user?.school_id) return;

    try {
      setLoading(true);
      let query = supabase
        .from('students')
        .select('id, name, admission_number, class:classes(name)')
        .eq('school_id', user.school_id)
        .eq('is_active', true)
        .order('name');

      if (selectedClass !== 'all') {
        query = query.eq('class_id', selectedClass);
      }

      const { data, error } = await query;
      if (error) throw error;

      setStudents(data || []);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAccount = async (studentId: string) => {
    if (!studentId) return;

    try {
      setLoading(true);
      setError(null);

      // Get student details
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, name, admission_number, class:classes(name)')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;

      // Get student fees
      const { data: feesData, error: feesError } = await supabase
        .from('fees')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (feesError) throw feesError;

      const fees = feesData || [];
      const totalFees = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
      const totalPaid = fees.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0);
      const outstanding = totalFees - totalPaid;

      setStudentAccount({
        student: studentData,
        totalFees,
        totalPaid,
        outstanding,
        fees,
      });
    } catch (err: any) {
      console.error('Error fetching student account:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'overdue': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchStudents();
  }, [selectedClass]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Student Accounts</h2>
          <p className="text-muted-foreground">
            View individual student fee statements and payment history
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Student
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search Student</Label>
              <Input
                id="search"
                placeholder="Search by name or admission number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="class">Filter by Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="student">Select Student</Label>
              <Select value={selectedStudent} onValueChange={(value) => {
                setSelectedStudent(value);
                fetchStudentAccount(value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {filteredStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.admission_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="ml-2">Loading student account...</p>
        </div>
      )}

      {/* Student Account Details */}
      {studentAccount && !loading && (
        <div className="space-y-6">
          {/* Student Info and Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {studentAccount.student.name} - Fee Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Admission Number</div>
                  <div className="font-medium">{studentAccount.student.admission_number}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Class</div>
                  <div className="font-medium">{studentAccount.student.class?.name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Fees</div>
                  <div className="font-medium">KES {studentAccount.totalFees.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Outstanding</div>
                  <div className={`font-medium ${studentAccount.outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    KES {studentAccount.outstanding.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Total Fees Assigned</div>
                  <div className="text-xl font-bold text-blue-900">
                    KES {studentAccount.totalFees.toLocaleString()}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Total Paid</div>
                  <div className="text-xl font-bold text-green-900">
                    KES {studentAccount.totalPaid.toLocaleString()}
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-600 font-medium">Outstanding Balance</div>
                  <div className="text-xl font-bold text-red-900">
                    KES {studentAccount.outstanding.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Records */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Fee Records
              </CardTitle>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Generate Statement
              </Button>
            </CardHeader>
            <CardContent>
              {studentAccount.fees.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No fee records found</h3>
                  <p className="text-muted-foreground">
                    No fees have been assigned to this student yet.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Payment Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentAccount.fees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell className="font-medium">{fee.category || 'N/A'}</TableCell>
                        <TableCell>{fee.term}</TableCell>
                        <TableCell>KES {fee.amount.toLocaleString()}</TableCell>
                        <TableCell>KES {fee.paid_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={fee.amount - fee.paid_amount > 0 ? 'text-red-600' : 'text-green-600'}>
                            KES {(fee.amount - fee.paid_amount).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(fee.status)}>
                            {fee.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {fee.due_date ? new Date(fee.due_date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>{fee.payment_method || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!selectedStudent && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Select a Student</h3>
              <p className="text-muted-foreground">
                Choose a student from the dropdown above to view their fee account.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentAccountsPanel;
