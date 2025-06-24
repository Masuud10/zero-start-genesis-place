
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface StudentAccount {
  student: {
    id: string;
    name: string;
    admission_number: string;
    class_id: string;
    class_name?: string;
  };
  totalFees: number;
  totalPaid: number;
  balance: number;
  status: 'paid' | 'partial' | 'overdue' | 'unpaid';
  transactions: Array<{
    id: string;
    amount: number;
    payment_method: string;
    transaction_date: string;
    mpesa_code?: string;
    status: string;
  }>;
}

export const useStudentAccounts = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [studentAccounts, setStudentAccounts] = useState<StudentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchStudentAccounts = async () => {
    if (!user?.school_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching student accounts for school:', user.school_id);

      // Fetch students with their classes
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

      if (studentsError) {
        throw new Error(`Failed to fetch students: ${studentsError.message}`);
      }

      setStudents(studentsData || []);

      // Fetch fees for all students
      const { data: feesData, error: feesError } = await supabase
        .from('fees')
        .select('*')
        .eq('school_id', user.school_id);

      if (feesError) {
        console.warn('Error fetching fees:', feesError);
      }

      // Fetch MPESA transactions
      const { data: mpesaData, error: mpesaError } = await supabase
        .from('mpesa_transactions')
        .select('*')
        .eq('school_id', user.school_id);

      if (mpesaError) {
        console.warn('Error fetching MPESA transactions:', mpesaError);
      }

      // Create student accounts
      const accounts: StudentAccount[] = (studentsData || []).map((student) => {
        const studentFees = (feesData || []).filter(fee => fee.student_id === student.id);
        const studentTransactions = (mpesaData || []).filter(txn => txn.student_id === student.id);

        const totalFees = studentFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
        const totalPaid = studentFees.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) +
                          studentTransactions.reduce((sum, txn) => sum + (txn.amount_paid || 0), 0);
        const balance = totalFees - totalPaid;

        let status: 'paid' | 'partial' | 'overdue' | 'unpaid' = 'unpaid';
        if (balance <= 0) {
          status = 'paid';
        } else if (totalPaid > 0) {
          status = 'partial';
        } else {
          // Check for overdue fees
          const hasOverdue = studentFees.some(fee => 
            new Date(fee.due_date) < new Date() && fee.status !== 'paid'
          );
          status = hasOverdue ? 'overdue' : 'unpaid';
        }

        const transactions = [
          ...studentTransactions.map(txn => ({
            id: txn.id,
            amount: txn.amount_paid || 0,
            payment_method: 'mpesa',
            transaction_date: txn.transaction_date || txn.created_at,
            mpesa_code: txn.mpesa_receipt_number,
            status: txn.transaction_status || 'pending'
          }))
        ];

        return {
          student: {
            id: student.id,
            name: student.name || 'Unknown Student',
            admission_number: student.admission_number || 'N/A',
            class_id: student.class_id || '',
            class_name: student.classes?.name || 'Unknown Class',
          },
          totalFees,
          totalPaid,
          balance,
          status,
          transactions
        };
      });

      setStudentAccounts(accounts);
      console.log('✅ Student accounts processed:', accounts.length);
      
    } catch (err: any) {
      console.error('Error fetching student accounts:', err);
      const message = err?.message || 'Failed to fetch student accounts';
      setError(message);
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
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
