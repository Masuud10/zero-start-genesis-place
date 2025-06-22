
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MpesaTransaction {
  id: string;
  transaction_id: string;
  phone_number: string;
  amount_paid: number;
  transaction_status: string;
  mpesa_receipt_number: string;
  transaction_date: string;
  student_id: string;
  fee_id: string;
  class_id: string;
  student?: {
    name: string;
    admission_number: string;
  };
  class?: {
    name: string;
  };
}

interface MpesaCredentials {
  consumer_key: string;
  consumer_secret: string;
  passkey: string;
  paybill_number: string;
}

export const useMpesaTransactions = () => {
  const [transactions, setTransactions] = useState<MpesaTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<MpesaCredentials | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTransactions = async () => {
    if (!user?.school_id) return;

    try {
      setLoading(true);
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

      // Transform the data to match our interface with proper null checks
      const transformedData: MpesaTransaction[] = (data || []).map(transaction => ({
        id: transaction.id,
        transaction_id: transaction.transaction_id || '',
        phone_number: transaction.phone_number || '',
        amount_paid: transaction.amount_paid || 0,
        transaction_status: transaction.transaction_status || '',
        mpesa_receipt_number: transaction.mpesa_receipt_number || '',
        transaction_date: transaction.transaction_date || '',
        student_id: transaction.student_id || '',
        fee_id: transaction.fee_id || '',
        class_id: transaction.class_id || '',
        student: transaction.student && transaction.student !== null && typeof transaction.student === 'object' && 'name' in transaction.student
          ? {
              name: transaction.student.name || '',
              admission_number: transaction.student.admission_number || ''
            }
          : undefined,
        class: transaction.class && transaction.class !== null && typeof transaction.class === 'object' && 'name' in transaction.class
          ? {
              name: transaction.class.name || ''
            }
          : undefined
      }));

      setTransactions(transformedData);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch M-PESA transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCredentials = async () => {
    if (!user?.school_id) return;

    try {
      const { data, error } = await supabase
        .from('mpesa_api_credentials')
        .select('*')
        .eq('school_id', user.school_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setCredentials({
          consumer_key: data.consumer_key,
          consumer_secret: data.consumer_secret,
          passkey: data.passkey,
          paybill_number: data.paybill_number
        });
      }
    } catch (err: any) {
      console.error('Error fetching M-PESA credentials:', err);
    }
  };

  const saveCredentials = async (credentialsData: MpesaCredentials) => {
    if (!user?.school_id) {
      toast({
        title: "Error",
        description: "No school ID found",
        variant: "destructive",
      });
      return { error: 'No school ID found' };
    }

    try {
      const { error } = await supabase
        .from('mpesa_api_credentials')
        .upsert({
          school_id: user.school_id,
          ...credentialsData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setCredentials(credentialsData);
      toast({
        title: "Success",
        description: "M-PESA credentials saved successfully",
      });

      return { success: true };
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to save M-PESA credentials",
        variant: "destructive",
      });
      return { error: err.message };
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

      if (data.success) {
        toast({
          title: "STK Push Sent",
          description: "Please check your phone and enter your M-PESA PIN",
        });
        return { success: true, data };
      } else {
        throw new Error(data.error || 'Failed to initiate M-PESA payment');
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to initiate M-PESA payment",
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  };

  const initiateStkPush = processSTKPush; // Alias for backward compatibility

  useEffect(() => {
    fetchTransactions();
    fetchCredentials();
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
