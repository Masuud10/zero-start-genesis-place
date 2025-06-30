
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MPESATransaction } from './types';
import { validateUuid, validateSchoolAccess } from '@/utils/uuidValidation';

export const useMpesaTransactions = () => {
  const [mpesaTransactions, setMpesaTransactions] = useState<MPESATransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchMPESATransactions = async () => {
    if (!user?.school_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Validate school access
      const schoolValidation = validateSchoolAccess(user.school_id);
      if (!schoolValidation.isValid) {
        throw new Error(schoolValidation.error || 'Invalid school access');
      }

      const validSchoolId = schoolValidation.sanitizedValue!;
      console.log('🔍 Fetching MPESA transactions for school:', validSchoolId);

      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

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
          .eq('school_id', validSchoolId)
          .not('id', 'is', null)
          .order('transaction_date', { ascending: false })
          .limit(100);

        clearTimeout(timeoutId);

        if (fetchError) {
          console.error('Supabase error fetching MPESA transactions:', fetchError);
          throw new Error(`Failed to fetch MPESA transactions: ${fetchError.message}`);
        }

        console.log('✅ MPESA transactions fetched:', data?.length || 0, 'records');

        if (!data || data.length === 0) {
          setMpesaTransactions([]);
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
            .eq('school_id', validSchoolId)
            .limit(100) : Promise.resolve({ data: [] }),
          
          classIds.length > 0 ? supabase
            .from('classes')
            .select('id, name')
            .in('id', classIds)
            .eq('school_id', validSchoolId)
            .limit(50) : Promise.resolve({ data: [] })
        ]);

        const students = studentsResult.status === 'fulfilled' ? studentsResult.value.data || [] : [];
        const classes = classesResult.status === 'fulfilled' ? classesResult.value.data || [] : [];

        const studentMap = new Map(students.map(s => [s.id, s]));
        const classMap = new Map(classes.map(c => [c.id, c]));
        
        const transformedData: MPESATransaction[] = data.map((item) => {
          try {
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
          } catch (transformError) {
            console.error(`Error transforming MPESA transaction:`, transformError);
            return {
              id: item.id || item.transaction_id,
              transaction_id: item.transaction_id || item.id,
              phone_number: item.phone_number || '',
              amount_paid: Number(item.amount_paid) || 0,
              school_id: item.school_id || '',
              transaction_status: 'Pending' as const,
              payment_type: item.payment_type || 'Full',
              transaction_date: item.transaction_date || item.created_at || new Date().toISOString(),
            };
          }
        });
        
        setMpesaTransactions(transformedData);
        setError(null);
      } catch (queryError) {
        clearTimeout(timeoutId);
        throw queryError;
      }
    } catch (err: any) {
      console.error('Error fetching MPESA transactions:', err);
      setError(err.message || 'Failed to fetch MPESA transactions');
      setMpesaTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.school_id) {
      fetchMPESATransactions();
    } else {
      setError('User school ID is required');
      setLoading(false);
    }
  }, [user?.school_id]);

  return {
    mpesaTransactions,
    loading,
    error,
    refetch: fetchMPESATransactions
  };
};
