
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useTransactionData = () => {
  const [dailyTransactions, setDailyTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchTransactionData = async () => {
    if (!user?.school_id) {
      console.log('No school_id available for transaction data');
      setDailyTransactions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching transaction data for school:', user.school_id);
      
      // Fetch financial transactions from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('financial_transactions')
        .select('amount, processed_at')
        .eq('school_id', user.school_id)
        .eq('transaction_type', 'payment')
        .gte('processed_at', thirtyDaysAgo.toISOString())
        .order('processed_at', { ascending: true });

      if (transactionsError) {
        console.error('Error fetching transaction data:', transactionsError);
        throw transactionsError;
      }

      // Group transactions by date
      const dailyMap = new Map();
      
      transactionsData?.forEach(transaction => {
        const date = new Date(transaction.processed_at).toISOString().split('T')[0];
        const amount = Number(transaction.amount || 0);
        
        if (!dailyMap.has(date)) {
          dailyMap.set(date, 0);
        }
        
        dailyMap.set(date, dailyMap.get(date) + amount);
      });

      // Convert to array format for chart
      const dailyData = Array.from(dailyMap.entries())
        .map(([date, amount]) => ({
          date: new Date(date).toLocaleDateString(),
          amount: amount
        }))
        .slice(-7); // Last 7 days
      
      // If no data, provide some default structure
      if (dailyData.length === 0) {
        const today = new Date();
        const mockData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          mockData.push({
            date: date.toLocaleDateString(),
            amount: 0
          });
        }
        setDailyTransactions(mockData);
      } else {
        setDailyTransactions(dailyData);
      }
      
    } catch (err: any) {
      console.error('Error fetching transaction data:', err);
      setError(err);
      setDailyTransactions([]);
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
