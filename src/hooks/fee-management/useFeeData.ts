
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FeeRecord {
  id: string;
  student_id: string;
  class_id: string;
  amount: number;
  paid_amount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  due_date: string;
  academic_year: string;
  term: string;
  category: string;
  student?: {
    name: string;
    admission_number: string;
  };
  class?: {
    name: string;
  };
}

export const useFeeData = () => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchFees = async () => {
    if (!user?.school_id) return;

    try {
      const { data, error } = await supabase
        .from('fees')
        .select(`
          *,
          student:students(name, admission_number),
          class:classes(name)
        `)
        .eq('school_id', user.school_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData: FeeRecord[] = (data || []).map(fee => {
        // Safe student data extraction
        let studentData: { name: string; admission_number: string } | undefined;
        if (fee.student && 
            typeof fee.student === 'object' && 
            fee.student !== null &&
            'name' in fee.student) {
          const student = fee.student as any;
          studentData = {
            name: String(student.name || ''),
            admission_number: String(student.admission_number || '')
          };
        }

        // Safe class data extraction
        let classData: { name: string } | undefined;
        if (fee.class && 
            typeof fee.class === 'object' && 
            fee.class !== null &&
            'name' in fee.class) {
          const classObj = fee.class as any;
          classData = {
            name: String(classObj.name || '')
          };
        }

        return {
          id: fee.id,
          student_id: fee.student_id || '',
          class_id: fee.class_id || '',
          amount: fee.amount || 0,
          paid_amount: fee.paid_amount || 0,
          status: (['pending', 'partial', 'paid', 'overdue'].includes(fee.status) 
            ? fee.status 
            : 'pending') as 'pending' | 'partial' | 'paid' | 'overdue',
          due_date: fee.due_date || '',
          academic_year: fee.academic_year || '',
          term: fee.term || '',
          category: fee.category || '',
          student: studentData,
          class: classData
        };
      });
      
      setFees(transformedData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching fees:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [user?.school_id]);

  return {
    fees,
    loading,
    error,
    refetch: fetchFees
  };
};
