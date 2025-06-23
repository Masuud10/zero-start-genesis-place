
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MPESATransaction } from './types';

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

      console.log('🔍 Fetching MPESA transactions for school:', user.school_id);

      const { data, error: fetchError } = await supabase
        .from('mpesa_transactions')
        .select(`
          *,
          students!mpesa_transactions_student_id_fkey(name, admission_number),
          classes!mpesa_transactions_class_id_fkey(name)
        `)
        .eq('school_id', user.school_id)
        .order('transaction_date', { ascending: false });

      if (fetchError) {
        console.error('Supabase error fetching MPESA transactions:', fetchError);
        throw new Error(`Failed to fetch MPESA transactions: ${fetchError.message}`);
      }

      console.log('✅ MPESA transactions fetched:', data?.length || 0, 'records');
      
      const transformedData: MPESATransaction[] = (data || []).map((item) => {
        try {
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
            student: item.students ? {
              name: item.students.name || 'Unknown',
              admission_number: item.students.admission_number || 'N/A'
            } : undefined,
            class: item.classes ? {
              name: item.classes.name || 'Unknown'
            } : undefined,
          };
        } catch (transformError) {
          console.error(`Error transforming MPESA transaction:`, transformError);
          // Return a basic structure if transformation fails
          return {
            id: item.id || item.transaction_id,
            transaction_id: item.transaction_id || item.id,
            phone_number: item.phone_number || '',
            amount_paid: Number(item.amount_paid) || 0,
            school_id: item.school_id || '',
            transaction_status: 'Pending' as const,
            payment_type: item.payment_type || 'Full',
            transaction_date: item.transaction_date || item.created_at || new Date().toISOString(),
            student: item.students ? {
              name: item.students.name || 'Unknown',
              admission_number: item.students.admission_number || 'N/A'
            } : undefined,
          };
        }
      });
      
      setMpesaTransactions(transformedData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching MPESA transactions:', err);
      setError(err.message || 'Failed to fetch MPESA transactions');
      setMpesaTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMPESATransactions();
  }, [user?.school_id]);

  return {
    mpesaTransactions,
    loading,
    error,
    refetch: fetchMPESATransactions
  };
};
