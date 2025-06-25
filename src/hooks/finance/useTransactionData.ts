
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useTransactionData = () => {
  const [dailyTransactions, setDailyTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchTransactionData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching transaction data for school:', user?.school_id);
      
      // Simulate some default data
      const mockData = [
        { date: '2024-01-01', amount: 15000 },
        { date: '2024-01-02', amount: 12000 },
        { date: '2024-01-03', amount: 18000 },
        { date: '2024-01-04', amount: 14000 },
        { date: '2024-01-05', amount: 16000 },
      ];
      
      setDailyTransactions(mockData);
    } catch (err: any) {
      console.error('Error fetching transaction data:', err);
      setError(err);
      setDailyTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactionData();
    }, 800);

    return () => clearTimeout(timer);
  }, [user?.school_id]);

  return {
    dailyTransactions,
    isLoading,
    error,
    refetch: fetchTransactionData
  };
};
