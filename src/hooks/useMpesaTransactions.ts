
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
        throw new Error(`Failed to fetch MPESA transactions: ${fetchError.message}`);
      }

      const transformedData: MPESATransaction[] = (data || []).map((item) => ({
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
      }));
      
      setTransactions(transformedData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching MPESA transactions:', err);
      setError(err.message || 'Failed to fetch MPESA transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user?.school_id]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions
  };
};
