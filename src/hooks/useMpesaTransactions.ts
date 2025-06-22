
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MpesaTransaction, MpesaCredentials } from './fee-management/types';
import { transformMPESATransaction } from './fee-management/utils/dataTransformers';
import { useMpesaCredentials } from './fee-management/useMpesaCredentials';

export const useMpesaTransactions = () => {
  const [transactions, setTransactions] = useState<MpesaTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use the credentials hook
  const { credentials, fetchCredentials, saveCredentials } = useMpesaCredentials();

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
          student:students(name, admission_number),
          class:classes(name)
        `)
        .eq('school_id', user.school_id)
        .order('transaction_date', { ascending: false });

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        throw new Error(`Failed to fetch M-PESA transactions: ${fetchError.message}`);
      }

      const transformedData: MpesaTransaction[] = (data || []).map(transformMPESATransaction);
      setTransactions(transformedData);
      
    } catch (err: any) {
      console.error('Error in fetchTransactions:', err);
      const errorMessage = err.message || 'Failed to fetch M-PESA transactions';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processSTKPush = async (phoneNumber: string, amount: number, studentFeeId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phone_number: phoneNumber,
          amount: amount,
          student_fee_id: studentFeeId
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "STK Push Sent",
          description: "Please check your phone and enter your M-PESA PIN",
        });
        
        // Refresh transactions after successful STK push
        await fetchTransactions();
        
        return { success: true, data };
      } else {
        throw new Error(data?.error || 'Failed to initiate M-PESA payment');
      }
    } catch (err: any) {
      console.error('STK Push error:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to initiate M-PESA payment",
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  };

  // Alias for backward compatibility
  const initiateStkPush = processSTKPush;

  useEffect(() => {
    fetchTransactions();
  }, [user?.school_id]);

  return {
    transactions,
    loading,
    error,
    credentials,
    refetch: fetchTransactions,
    fetchCredentials,
    saveCredentials,
    processSTKPush,
    initiateStkPush
  };
};
