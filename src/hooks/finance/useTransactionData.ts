
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DailyTransaction {
  date: string;
  amount: number;
}

export const useTransactionData = () => {
  const [dailyTransactions, setDailyTransactions] = useState<DailyTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchTransactionData = async () => {
    if (!user?.school_id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: mpesaData, error: mpesaError } = await supabase
        .from('mpesa_transactions')
        .select('*')
        .eq('school_id', user.school_id)
        .eq('transaction_status', 'Success');

      if (mpesaError) throw mpesaError;

      // Generate daily transactions data (last 30 days)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      const data = last30Days.map(date => ({
        date,
        amount: mpesaData?.filter(txn => 
          txn.transaction_date?.startsWith(date)
        ).reduce((sum, txn) => {
          const amount = typeof txn.amount_paid === 'number' ? txn.amount_paid : Number(txn.amount_paid || 0);
          return sum + amount;
        }, 0) || 0
      }));

      setDailyTransactions(data);

    } catch (err: any) {
      console.error('Error fetching transaction data:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionData();
  }, [user?.school_id]);

  return {
    dailyTransactions,
    isLoading,
    error,
    refetch: fetchTransactionData
  };
};
