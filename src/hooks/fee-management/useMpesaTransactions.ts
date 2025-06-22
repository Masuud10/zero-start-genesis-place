
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MPESATransaction } from './types';
import { transformMPESATransaction } from './utils/dataTransformers';

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
      
      const transformedData: MPESATransaction[] = (data || []).map(transformMPESATransaction);
      
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
