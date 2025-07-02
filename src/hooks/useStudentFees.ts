
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

      console.log('🔍 Optimized student fees fetch for school:', user.school_id, 'student:', studentId);

      // Add timeout control
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('🔍 Student fees query timed out');
      }, 5000);

      try {
        // Optimized query without complex joins to avoid relationship issues
        let query = supabase
          .from('fees')
          .select(`
            id,
            student_id,
            class_id,
            amount,
            paid_amount,
            status,
            due_date,
            category,
            term,
            academic_year,
            created_at
          `)
          .eq('school_id', user.school_id)
          .not('id', 'is', null)
          .not('amount', 'is', null);

        if (studentId) {
          query = query.eq('student_id', studentId);
        }

        const { data, error: fetchError } = await query
          .order('created_at', { ascending: false })
          .limit(studentId ? 50 : 200); // Limit records for better performance

        clearTimeout(timeoutId);

        if (fetchError) {
          console.error('Error fetching student fees:', fetchError);
          throw new Error(`Failed to fetch student fees: ${fetchError.message}`);
        }

        console.log('✅ Student fees fetched:', data?.length || 0, 'records');

        if (!data || data.length === 0) {
          setStudentFees([]);
          setError(null);
          return;
        }

        // Get student and class data separately for better performance
        const studentIds = [...new Set(data.map(item => item.student_id).filter(Boolean))];
        const classIds = [...new Set(data.map(item => item.class_id).filter(Boolean))];

        const [studentsResult, classesResult] = await Promise.allSettled([
          studentIds.length > 0 ? supabase
            .from('students')
            .select('id, name, admission_number, class_id')
            .in('id', studentIds)
            .eq('school_id', user.school_id)
            .limit(100) : Promise.resolve({ data: [] }),
          
          classIds.length > 0 ? supabase
            .from('classes')
            .select('id, name')
            .in('id', classIds)
            .eq('school_id', user.school_id)
            .limit(50) : Promise.resolve({ data: [] })
        ]);

        const students = studentsResult.status === 'fulfilled' ? studentsResult.value.data || [] : [];
        const classes = classesResult.status === 'fulfilled' ? classesResult.value.data || [] : [];

        // Create lookup maps
        const studentMap = new Map(students.map(s => [s.id, s]));
        const classMap = new Map(classes.map(c => [c.id, c]));

        const transformedData: StudentFee[] = data.map((item) => {
          const student = studentMap.get(item.student_id);
          const studentClass = classMap.get(item.class_id);
          
          return {
            id: item.id,
            student_id: item.student_id || '',
            fee_id: item.id, // Using fee id as fee_id for now
            amount: Number(item.amount) || 0,
            amount_paid: Number(item.paid_amount) || 0,
            status: (item.status as 'unpaid' | 'partial' | 'paid' | 'overdue') || 'unpaid',
            due_date: item.due_date || new Date().toISOString(),
            created_at: item.created_at || new Date().toISOString(),
            fee: {
              category: item.category || 'General',
              term: item.term || '',
              academic_year: item.academic_year || new Date().getFullYear().toString(),
              amount: Number(item.amount) || 0,
            },
            student: student ? {
              name: student.name || 'Unknown Student',
              admission_number: student.admission_number || 'N/A',
              class_id: student.class_id || '',
            } : undefined,
            class: studentClass ? {
              name: studentClass.name || 'Unknown Class',
            } : undefined,
          };
        });

        setStudentFees(transformedData);
        setError(null);
      } catch (queryError) {
        clearTimeout(timeoutId);
        throw queryError;
      }
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
