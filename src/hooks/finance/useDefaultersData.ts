
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useDefaultersData = () => {
  const [defaultersList, setDefaultersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchDefaultersData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching defaulters data for school:', user?.school_id);
      
      // Simulate some default data
      const mockData = [
        { 
          student_name: 'John Doe', 
          admission_number: 'STU001', 
          class_name: 'Grade 5', 
          outstanding_amount: 5000, 
          days_overdue: 30 
        },
        { 
          student_name: 'Jane Smith', 
          admission_number: 'STU002', 
          class_name: 'Grade 4', 
          outstanding_amount: 3000, 
          days_overdue: 15 
        },
      ];
      
      setDefaultersList(mockData);
    } catch (err: any) {
      console.error('Error fetching defaulters data:', err);
      setError(err);
      setDefaultersList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDefaultersData();
    }, 1200);

    return () => clearTimeout(timer);
  }, [user?.school_id]);

  return {
    defaultersList,
    isLoading,
    error,
    refetch: fetchDefaultersData
  };
};
