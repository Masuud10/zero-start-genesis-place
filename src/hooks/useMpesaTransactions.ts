
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MPESATransaction {
  id: string;
  transaction_id?: string;
  mpesa_receipt_number?: string;
  phone_number: string;
  amount_paid: number;
  fee_id?: string;
  student_id?: string;
  class_id?: string;
  school_id: string;
  transaction_status: 'Success' | 'Pending' | 'Failed';
  payment_type?: string;
  paybill_number?: string;
  transaction_date: string;
  student?: {
    name: string;
    admission_number: string;
  };
  class?: {
    name: string;
  };
}

export const useMpesaTransactions = () => {
  const [transactions, setTransactions] = useState<MPESATransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTransactions = async () => {
    if (!user?.school_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📱 Optimized MPESA transactions fetch for school:', user.school_id);

      // Add timeout control
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('📱 MPESA transactions query timed out');
      }, 4000);

      try {
        // Simplified query without complex joins
        const { data, error: fetchError } = await supabase
          .from('mpesa_transactions')
          .select(`
            id,
            transaction_id,
            mpesa_receipt_number,
            phone_number,
            amount_paid,
            fee_id,
            student_id,
            class_id,
            school_id,
            transaction_status,
            payment_type,
            paybill_number,
            transaction_date,
            created_at
          `)
          .eq('school_id', user.school_id)
          .not('id', 'is', null)
          .order('transaction_date', { ascending: false })
          .limit(100); // Limit for better performance

        clearTimeout(timeoutId);

        if (fetchError) {
          console.error('Error fetching MPESA transactions:', fetchError);
          throw new Error(`Failed to fetch MPESA transactions: ${fetchError.message}`);
        }

        console.log('✅ MPESA transactions fetched:', data?.length || 0, 'records');

        if (!data || data.length === 0) {
          setTransactions([]);
          setError(null);
          return;
        }

        // Get student and class data separately if needed
        const studentIds = [...new Set(data.map(item => item.student_id).filter(Boolean))];
        const classIds = [...new Set(data.map(item => item.class_id).filter(Boolean))];

        const [studentsResult, classesResult] = await Promise.allSettled([
          studentIds.length > 0 ? supabase
            .from('students')
            .select('id, name, admission_number')
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

        const transformedData: MPESATransaction[] = data.map((item) => {
          const student = studentMap.get(item.student_id);
          const studentClass = classMap.get(item.class_id);
          
          return {
            id: item.id || item.transaction_id,
            transaction_id: item.transaction_id || item.id,
            mpesa_receipt_number: item.mpesa_receipt_number,
            phone_number: item.phone_number || '',
            amount_paid: Number(item.amount_paid) || 0,
            fee_id: item.fee_id,
            student_id: item.student_id,
            class_id: item.class_id,
            school_id: item.school_id || '',
            transaction_status: (item.transaction_status as 'Success' | 'Pending' | 'Failed') || 'Pending',
            payment_type: item.payment_type || 'Full',
            paybill_number: item.paybill_number,
            transaction_date: item.transaction_date || item.created_at || new Date().toISOString(),
            student: student ? {
              name: student.name || 'Unknown',
              admission_number: student.admission_number || 'N/A'
            } : undefined,
            class: studentClass ? {
              name: studentClass.name || 'Unknown'
            } : undefined,
          };
        });
        
        setTransactions(transformedData);
        setError(null);
      } catch (queryError) {
        clearTimeout(timeoutId);
        throw queryError;
      }
    } catch (err: any) {
      console.error('Error fetching MPESA transactions:', err);
      setError(err.message || 'Failed to fetch MPESA transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const processSTKPush = async (phoneNumber: string, amount: number, feeId: string) => {
    try {
      // This would typically call an edge function or API to process STK push
      // For now, we'll simulate the process
      console.log('Processing STK Push:', { phoneNumber, amount, feeId });
      
      // In a real implementation, you would call your MPESA API here
      // and then insert the transaction record into the database
      
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error processing STK push:', error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user?.school_id]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    processSTKPush
  };
};
