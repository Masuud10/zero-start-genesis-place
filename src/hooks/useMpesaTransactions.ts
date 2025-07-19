
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MPESATransaction {
  id: string;
  transaction_id: string;
  amount: number;
  phone_number: string;
  status: string;
  created_at: string;
  updated_at: string;
  school_id: string;
  student_id?: string;
  fee_id?: string;
  description?: string;
  merchant_request_id?: string;
  checkout_request_id?: string;
  result_code?: string;
  result_desc?: string;
}

export const useMpesaTransactions = (schoolId?: string) => {
  const [transactions, setTransactions] = useState<MPESATransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [dataTruncated, setDataTruncated] = useState(false);

  const fetchTransactions = useCallback(async (isRetry = false) => {
    try {
      setLoading(true);
      setError(null);

      // Since user context is removed, we'll use the provided schoolId or a default
      const effectiveSchoolId = schoolId || 'default';

      console.log('🔍 Fetching MPESA transactions for school:', effectiveSchoolId);

      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('🔍 MPESA transactions query timed out');
      }, 4000);

      // Fetch transactions with limit and proper error handling
      const { data, error: fetchError } = await supabase
        .from('mpesa_transactions')
        .select(`
          id,
          transaction_id,
          amount,
          phone_number,
          status,
          created_at,
          updated_at,
          school_id,
          student_id,
          fee_id,
          description,
          merchant_request_id,
          checkout_request_id,
          result_code,
          result_desc
        `)
        .eq('school_id', effectiveSchoolId)
        .not('id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100);

      clearTimeout(timeoutId);

      if (fetchError) {
        console.error('🔍 Error fetching MPESA transactions:', fetchError);
        throw fetchError;
      }

      if (data && data.length > 0) {
        console.log('🔍 MPESA transactions loaded:', data.length);
        setTransactions(data);
        setDataTruncated(data.length >= 100);
      } else {
        console.log('🔍 No MPESA transactions found');
        setTransactions([]);
        setDataTruncated(false);
      }

      setRetryCount(0);
    } catch (err) {
      console.error('🔍 Error in MPESA transactions fetch:', err);
      
      if (isRetry && retryCount < 2) {
        console.log('🔍 Retrying MPESA transactions fetch...');
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchTransactions(true), 1000 * (retryCount + 1));
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch MPESA transactions');
        setTransactions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [schoolId, retryCount]);

  const createTransaction = async (transactionData: Omit<MPESATransaction, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);

      const { data, error: createError } = await supabase
        .from('mpesa_transactions')
        .insert({
          ...transactionData,
          school_id: schoolId || 'default'
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      if (data) {
        setTransactions(prev => [data, ...prev]);
        console.log('🔍 MPESA transaction created:', data.id);
      }

      return data;
    } catch (err) {
      console.error('🔍 Error creating MPESA transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to create MPESA transaction');
      throw err;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<MPESATransaction>) => {
    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('mpesa_transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      if (data) {
        setTransactions(prev => 
          prev.map(txn => txn.id === id ? data : txn)
        );
        console.log('🔍 MPESA transaction updated:', id);
      }

      return data;
    } catch (err) {
      console.error('🔍 Error updating MPESA transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to update MPESA transaction');
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('mpesa_transactions')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      setTransactions(prev => prev.filter(txn => txn.id !== id));
      console.log('🔍 MPESA transaction deleted:', id);
    } catch (err) {
      console.error('🔍 Error deleting MPESA transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete MPESA transaction');
      throw err;
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
    refetch: () => fetchTransactions(),
    createTransaction,
    updateTransaction,
    deleteTransaction
  };
};
