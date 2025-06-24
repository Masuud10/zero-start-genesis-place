
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface StudentAccount {
  student: {
    id: string;
    name: string;
    admission_number: string;
    class_id: string;
  };
  totalFees: number;
  totalPaid: number;
  outstanding: number;
  fees: Array<{
    id: string;
    amount: number;
    paid_amount: number;
    category: string;
    term: string;
    status: string;
    due_date: string;
  }>;
}

export const useStudentAccounts = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [studentAccounts, setStudentAccounts] = useState<StudentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchStudentAccounts = async () => {
    if (!user?.school_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, name, admission_number, class_id')
        .eq('school_id', user.school_id)
        .eq('is_active', true);

      if (studentsError) throw studentsError;

      setStudents(studentsData || []);

      // Fetch fees for each student
      const studentAccountsData: StudentAccount[] = [];

      for (const student of studentsData || []) {
        const { data: feesData } = await supabase
          .from('fees')
          .select('id, amount, paid_amount, category, term, status, due_date')
          .eq('student_id', student.id)
          .eq('school_id', user.school_id);

        const fees = feesData || [];
        const totalFees = fees.reduce((sum, fee) => sum + Number(fee.amount), 0);
        const totalPaid = fees.reduce((sum, fee) => sum + Number(fee.paid_amount || 0), 0);
        const outstanding = totalFees - totalPaid;

        studentAccountsData.push({
          student,
          totalFees,
          totalPaid,
          outstanding,
          fees
        });
      }

      setStudentAccounts(studentAccountsData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching student accounts:', err);
      setError(err.message || 'Failed to fetch student accounts');
      setStudentAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentAccounts();
  }, [user?.school_id]);

  return {
    students,
    studentAccounts,
    loading,
    error,
    refetch: fetchStudentAccounts
  };
};
