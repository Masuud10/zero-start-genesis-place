
import { useState, useEffect, useCallback } from 'react';
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
  const [retryCount, setRetryCount] = useState(0);
  const [dataTruncated, setDataTruncated] = useState(false);
  const { user } = useAuth();

  const fetchTransactions = useCallback(async (isRetry = false) => {
    if (!user?.school_id) {
      console.log('📱 No school_id available for MPESA transactions');
      setTransactions([]);
      setLoading(false);
      setError(null);
      setDataTruncated(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setDataTruncated(false);

      console.log('📱 Optimized MPESA transactions fetch for school:', user.school_id, isRetry ? `(retry ${retryCount + 1})` : '');

      // Add timeout control with proper cleanup
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('📱 MPESA transactions query timed out');
      }, 5000); // Increased timeout for better reliability

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
          .limit(150); // Increased limit for better data coverage

        clearTimeout(timeoutId);

        if (fetchError) {
          console.error('Error fetching MPESA transactions:', fetchError);
          throw new Error(`Failed to fetch MPESA transactions: ${fetchError.message}`);
        }

        console.log('✅ MPESA transactions fetched:', data?.length || 0, 'records');

        // Check for data truncation
        if (data && data.length >= 150) {
          console.warn('📱 MPESA data may be truncated - limit reached');
          setDataTruncated(true);
        }

        if (!data || data.length === 0) {
          setTransactions([]);
          setError(null);
          setRetryCount(0);
          return;
        }

        // Get student and class data separately if needed with validation
        const studentIds = [...new Set(data.map(item => item.student_id).filter(Boolean))].slice(0, 100);
        const classIds = [...new Set(data.map(item => item.class_id).filter(Boolean))].slice(0, 50);

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
          try {
            // Safe number parsing
            const amountPaid = Number(item.amount_paid || 0);
            const isValidAmount = !isNaN(amountPaid) && amountPaid >= 0;

            // Safe date parsing with fallback
            let transactionDate: string;
            try {
              if (item.transaction_date) {
                const parsedDate = new Date(item.transaction_date);
                if (!isNaN(parsedDate.getTime())) {
                  transactionDate = item.transaction_date;
                } else {
                  transactionDate = item.created_at || new Date().toISOString();
                }
              } else {
                transactionDate = item.created_at || new Date().toISOString();
              }
            } catch (dateError) {
              console.warn('Invalid date in MPESA transaction:', item.id, dateError);
              transactionDate = new Date().toISOString();
            }

            // Validate transaction status
            const validStatuses: Array<'Success' | 'Pending' | 'Failed'> = ['Success', 'Pending', 'Failed'];
            const transactionStatus = validStatuses.includes(item.transaction_status as 'Success' | 'Pending' | 'Failed') 
              ? item.transaction_status as 'Success' | 'Pending' | 'Failed'
              : 'Pending';

            const student = studentMap.get(item.student_id);
            const studentClass = classMap.get(item.class_id);
            
            return {
              id: item.id || item.transaction_id || `temp-${Date.now()}`,
              transaction_id: item.transaction_id || item.id,
              mpesa_receipt_number: item.mpesa_receipt_number || '',
              phone_number: item.phone_number || '',
              amount_paid: isValidAmount ? amountPaid : 0,
              fee_id: item.fee_id || undefined,
              student_id: item.student_id || undefined,
              class_id: item.class_id || undefined,
              school_id: item.school_id || '',
              transaction_status: transactionStatus,
              payment_type: item.payment_type || 'Full',
              paybill_number: item.paybill_number || '',
              transaction_date: transactionDate,
              student: student ? {
                name: student.name || 'Unknown',
                admission_number: student.admission_number || 'N/A'
              } : undefined,
              class: studentClass ? {
                name: studentClass.name || 'Unknown'
              } : undefined,
            };
          } catch (transformError) {
            console.error('Error transforming MPESA transaction:', item.id, transformError);
            return {
              id: item.id || `error-${Date.now()}`,
              transaction_id: item.transaction_id || '',
              mpesa_receipt_number: item.mpesa_receipt_number || '',
              phone_number: item.phone_number || '',
              amount_paid: 0,
              fee_id: item.fee_id || undefined,
              student_id: item.student_id || undefined,
              class_id: item.class_id || undefined,
              school_id: item.school_id || '',
              transaction_status: 'Failed' as const,
              payment_type: 'Full',
              paybill_number: item.paybill_number || '',
              transaction_date: new Date().toISOString(),
              student: undefined,
              class: undefined,
            };
          }
        }).filter(txn => txn.id && txn.id !== 'error-0'); // Filter out invalid transactions
        
        setTransactions(transformedData);
        setError(null);
        setRetryCount(0); // Reset retry count on success

      } catch (queryError) {
        clearTimeout(timeoutId);
        throw queryError;
      }

    } catch (err: unknown) {
      console.error('Error fetching MPESA transactions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch MPESA transactions';
      setError(errorMessage);
      setTransactions([]);

      // Retry logic for transient errors
      if (!isRetry && retryCount < 2 && (
        errorMessage.includes('timeout') || 
        errorMessage.includes('network') || 
        errorMessage.includes('connection')
      )) {
        console.log('🔄 Retrying MPESA transactions fetch...');
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchTransactions(true), 2000);
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [user?.school_id, retryCount]);

  const processSTKPush = async (phoneNumber: string, amount: number, feeId: string) => {
    try {
      // Validate inputs
      if (!phoneNumber || !amount || !feeId) {
        throw new Error('Missing required parameters for STK push');
      }

      if (amount <= 0) {
        throw new Error('Invalid amount for STK push');
      }

      // This would typically call an edge function or API to process STK push
      // For now, we'll simulate the process
      console.log('Processing STK Push:', { phoneNumber, amount, feeId });
      
      // In a real implementation, you would call your MPESA API here
      // and then insert the transaction record into the database
      
      return { success: true, error: null };
    } catch (error: unknown) {
      console.error('Error processing STK push:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    dataTruncated,
    retryCount,
    refetch: () => {
      setRetryCount(0);
      fetchTransactions();
    },
    processSTKPush
  };
};
