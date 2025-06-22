
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MPESATransaction {
  id: string;
  transaction_id: string;
  mpesa_receipt_number: string;
  phone_number: string;
  amount_paid: number;
  transaction_date: string;
  transaction_status: string;
  student?: {
    name: string;
    admission_number: string;
  };
  class?: {
    name: string;
  };
}

export const useMpesaTransactions = () => {
  const [mpesaTransactions, setMpesaTransactions] = useState<MPESATransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchMPESATransactions = async () => {
    if (!user?.school_id) return;

    try {
      const { data, error } = await supabase
        .from('mpesa_transactions')
        .select(`
          *,
          student:students(name, admission_number),
          class:classes(name)
        `)
        .eq('school_id', user.school_id)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      
      const transformedData: MPESATransaction[] = (data || []).map(transaction => ({
        id: transaction.id,
        transaction_id: transaction.transaction_id || '',
        mpesa_receipt_number: transaction.mpesa_receipt_number || '',
        phone_number: transaction.phone_number || '',
        amount_paid: transaction.amount_paid || 0,
        transaction_date: transaction.transaction_date || '',
        transaction_status: transaction.transaction_status || '',
        student: (transaction.student && typeof transaction.student === 'object' && transaction.student !== null && 'name' in transaction.student && transaction.student.name !== null)
          ? { 
              name: String(transaction.student.name || ''), 
              admission_number: String((transaction.student as any)?.admission_number || '') 
            }
          : undefined,
        class: (transaction.class && typeof transaction.class === 'object' && transaction.class !== null && 'name' in transaction.class && transaction.class.name !== null)
          ? { name: String(transaction.class.name || '') }
          : undefined
      }));
      
      setMpesaTransactions(transformedData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching MPESA transactions:', err);
      setError(err.message);
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
