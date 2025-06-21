
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MpesaTransaction {
  id: string;
  transaction_id: string;
  mpesa_receipt_number?: string;
  phone_number: string;
  amount_paid: number;
  fee_id?: string;
  student_id?: string;
  class_id?: string;
  transaction_date: string;
  transaction_status: 'Success' | 'Failed' | 'Pending';
  payment_type: 'Full' | 'Installment';
  paybill_number?: string;
  school_id: string;
  created_at: string;
  updated_at: string;
  student?: {
    name: string;
    admission_number: string;
  };
  class?: {
    name: string;
  };
}

interface MpesaCredentials {
  id: string;
  school_id: string;
  consumer_key: string;
  consumer_secret: string;
  passkey: string;
  paybill_number: string;
  created_at: string;
  updated_at: string;
}

export const useMpesaTransactions = () => {
  const [transactions, setTransactions] = useState<MpesaTransaction[]>([]);
  const [credentials, setCredentials] = useState<MpesaCredentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const {toast } = useToast();

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
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching MPESA transactions:', fetchError);
        throw fetchError;
      }
      
      const mappedData = (data || []).map(item => {
        let studentData = undefined;
        let classData = undefined;
        
        if (item.student && typeof item.student === 'object' && item.student !== null) {
          const student = item.student as any;
          if ('name' in student) {
            studentData = { 
              name: student.name, 
              admission_number: student.admission_number 
            };
          }
        }
        
        if (item.class && typeof item.class === 'object' && item.class !== null) {
          const classObj = item.class as any;
          if ('name' in classObj) {
            classData = { name: classObj.name };
          }
        }
          
        return {
          ...item,
          student: studentData,
          class: classData
        };
      }) as MpesaTransaction[];
      
      setTransactions(mappedData);
    } catch (err: any) {
      console.error('Error in fetchTransactions:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch MPESA transactions",
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
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching MPESA credentials:', error);
        throw error;
      }
      
      setCredentials(data);
    } catch (err: any) {
      console.error('Error fetching MPESA credentials:', err);
      // Don't show toast for credentials error as it's not critical
    }
  };

  const saveCredentials = async (credData: Omit<MpesaCredentials, 'id' | 'school_id' | 'created_at' | 'updated_at'>) => {
    if (!user?.school_id) return { error: 'No school associated with user' };

    try {
      const { data, error } = await supabase
        .from('mpesa_api_credentials')
        .upsert({
          ...credData,
          school_id: user.school_id,
        })
        .select()
        .single();

      if (error) throw error;

      setCredentials(data);
      toast({
        title: "Success",
        description: "MPESA credentials saved successfully",
      });

      return { data, error: null };
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to save MPESA credentials: ${err.message}`,
        variant: "destructive",
      });
      return { error: err.message };
    }
  };

  const initiateStkPush = async (phoneNumber: string, amount: number, studentFeeId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phone_number: phoneNumber,
          amount: amount,
          student_fee_id: studentFeeId,
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Payment Initiated",
          description: "STK push sent to your phone. Please complete the payment.",
        });
        fetchTransactions(); // Refresh transactions
      } else {
        throw new Error(data?.error || 'Failed to initiate payment');
      }

      return { data, error: null };
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: `Failed to initiate MPESA payment: ${err.message}`,
        variant: "destructive",
      });
      return { error: err.message };
    }
  };

  useEffect(() => {
    if (user?.school_id) {
      fetchTransactions();
      fetchCredentials();
    }
  }, [user?.school_id]);

  return {
    transactions,
    credentials,
    loading,
    error,
    refetch: fetchTransactions,
    fetchCredentials,
    saveCredentials,
    initiateStkPush,
  };
};
