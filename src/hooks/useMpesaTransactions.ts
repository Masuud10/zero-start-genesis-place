
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

export const useMpesaTransactions = () => {
  const [transactions, setTransactions] = useState<MpesaTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

      setTransactions(data || []);
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

  useEffect(() => {
    fetchTransactions();
  }, [user?.school_id]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    processSTKPush
  };
};
