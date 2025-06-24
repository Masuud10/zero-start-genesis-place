
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface StudentAccount {
  student: {
    id: string;
    name: string;
    admission_number: string;
    class_id: string;
    class_name: string;
  };
  totalFees: number;
  totalPaid: number;
  outstanding: number;
  status: 'paid' | 'partial' | 'overdue';
  feeRecords: Array<{
    id: string;
    category: string;
    term: string;
    amount: number;
    paid_amount: number;
    due_date: string;
    status: string;
  }>;
}

export const useStudentAccounts = () => {
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

      // Fetch students with their class information
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          admission_number,
          class_id,
          classes!students_class_id_fkey(name)
        `)
        .eq('school_id', user.school_id)
        .eq('is_active', true);

      if (studentsError) throw studentsError;

      // Fetch all fees for the school
      const { data: feesData, error: feesError } = await supabase
        .from('fees')
        .select('*')
        .eq('school_id', user.school_id);

      if (feesError) throw feesError;

      // Process data to create student accounts
      const accounts: StudentAccount[] = studentsData?.map(student => {
        const studentFees = feesData?.filter(fee => fee.student_id === student.id) || [];
        
        const totalFees = studentFees.reduce((sum, fee) => {
          const amount = typeof fee.amount === 'number' ? fee.amount : Number(fee.amount || 0);
          return sum + amount;
        }, 0);

        const totalPaid = studentFees.reduce((sum, fee) => {
          const paidAmount = typeof fee.paid_amount === 'number' ? fee.paid_amount : Number(fee.paid_amount || 0);
          return sum + paidAmount;
        }, 0);

        const outstanding = totalFees - totalPaid;
        
        let status: 'paid' | 'partial' | 'overdue' = 'paid';
        if (outstanding > 0) {
          const hasOverdue = studentFees.some(fee => {
            const dueDate = new Date(fee.due_date);
            const today = new Date();
            const feeAmount = typeof fee.amount === 'number' ? fee.amount : Number(fee.amount || 0);
            const paidAmount = typeof fee.paid_amount === 'number' ? fee.paid_amount : Number(fee.paid_amount || 0);
            return dueDate < today && feeAmount > paidAmount;
          });
          status = hasOverdue ? 'overdue' : 'partial';
        }

        return {
          student: {
            id: student.id,
            name: student.name,
            admission_number: student.admission_number,
            class_id: student.class_id,
            class_name: student.classes?.name || 'Unknown'
          },
          totalFees,
          totalPaid,
          outstanding,
          status,
          feeRecords: studentFees.map(fee => ({
            id: fee.id,
            category: fee.category || 'General',
            term: fee.term,
            amount: typeof fee.amount === 'number' ? fee.amount : Number(fee.amount || 0),
            paid_amount: typeof fee.paid_amount === 'number' ? fee.paid_amount : Number(fee.paid_amount || 0),
            due_date: fee.due_date,
            status: fee.status || 'pending'
          }))
        };
      }) || [];

      setStudentAccounts(accounts);

    } catch (err: any) {
      console.error('Error fetching student accounts:', err);
      setError(err.message || 'Failed to fetch student accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentAccounts();
  }, [user?.school_id]);

  return {
    studentAccounts,
    loading,
    error,
    refetch: fetchStudentAccounts
  };
};
