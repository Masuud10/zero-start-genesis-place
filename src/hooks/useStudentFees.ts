
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface StudentFee {
  id: string;
  student_id: string;
  fee_id: string;
  amount: number;
  amount_paid: number;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue';
  due_date: string;
  created_at: string;
  fee?: {
    category: string;
    term: string;
    academic_year: string;
    amount: number;
  };
  student?: {
    name: string;
    admission_number: string;
    class_id: string;
  };
  class?: {
    name: string;
  };
}

export const useStudentFees = (studentId?: string) => {
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchStudentFees = async () => {
    if (!user?.school_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching student fees for school:', user.school_id, 'student:', studentId);

      // First try to fetch from student_fees table if it exists
      let query = supabase
        .from('fees')
        .select(`
          id,
          student_id,
          amount,
          paid_amount,
          status,
          due_date,
          category,
          term,
          academic_year,
          created_at,
          students!fees_student_id_fkey(
            name,
            admission_number,
            class_id
          ),
          classes!fees_class_id_fkey(
            name
          )
        `)
        .eq('school_id', user.school_id);

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching student fees:', fetchError);
        throw new Error(`Failed to fetch student fees: ${fetchError.message}`);
      }

      console.log('✅ Student fees fetched:', data?.length || 0, 'records');

      const transformedData: StudentFee[] = (data || []).map((item) => ({
        id: item.id,
        student_id: item.student_id || '',
        fee_id: item.id, // Using fee id as fee_id for now
        amount: item.amount || 0,
        amount_paid: item.paid_amount || 0,
        status: (item.status as 'unpaid' | 'partial' | 'paid' | 'overdue') || 'unpaid',
        due_date: item.due_date || new Date().toISOString(),
        created_at: item.created_at || new Date().toISOString(),
        fee: {
          category: item.category || 'General',
          term: item.term || '',
          academic_year: item.academic_year || new Date().getFullYear().toString(),
          amount: item.amount || 0,
        },
        student: item.students ? {
          name: item.students.name || 'Unknown Student',
          admission_number: item.students.admission_number || 'N/A',
          class_id: item.students.class_id || '',
        } : undefined,
        class: item.classes ? {
          name: item.classes.name || 'Unknown Class',
        } : undefined,
      }));

      setStudentFees(transformedData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching student fees:', err);
      const message = err?.message || 'Failed to fetch student fees';
      setError(message);
      setStudentFees([]);
      
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
    fetchStudentFees();
  }, [user?.school_id, studentId]);

  return {
    studentFees,
    loading,
    error,
    refetch: fetchStudentFees
  };
};
