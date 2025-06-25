
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useExpenseData = () => {
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchExpenseData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching expense data for school:', user?.school_id);
      
      // Simulate some default data
      const mockData = [
        { category: 'Salaries', amount: 50000, percentage: 50, color: '#3b82f6' },
        { category: 'Utilities', amount: 15000, percentage: 15, color: '#ef4444' },
        { category: 'Supplies', amount: 20000, percentage: 20, color: '#10b981' },
        { category: 'Maintenance', amount: 15000, percentage: 15, color: '#f59e0b' },
      ];
      
      setExpenseBreakdown(mockData);
    } catch (err: any) {
      console.error('Error fetching expense data:', err);
      setError(err);
      setExpenseBreakdown([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExpenseData();
    }, 600);

    return () => clearTimeout(timer);
  }, [user?.school_id]);

  return {
    expenseBreakdown,
    isLoading,
    error,
    refetch: fetchExpenseData
  };
};
