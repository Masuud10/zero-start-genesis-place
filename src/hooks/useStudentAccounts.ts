
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Student, FeeRecord } from '@/hooks/fee-management/types';

export interface StudentAccount {
  student: Student;
  totalFees: number;
  totalPaid: number;
  outstanding: number;
  fees: FeeRecord[];
}

export const useStudentAccounts = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [studentAccounts, setStudentAccounts] = useState<StudentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        class: student.classes && typeof student.classes === 'object' && 'name' in student.classes 
          ? { name: student.classes.name as string } 
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

  useEffect(() => {
    fetchStudentsAndFees();
  }, [user?.school_id]);

  return {
    students,
    studentAccounts,
    loading,
    error,
    refetch: fetchStudentsAndFees
  };
};
