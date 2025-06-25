
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useDefaultersData = () => {
  const [defaultersList, setDefaultersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchDefaultersData = async () => {
    if (!user?.school_id) {
      console.log('No school_id available for defaulters data');
      setDefaultersList([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching defaulters data for school:', user.school_id);
      
      // Fetch overdue fees with student and class information
      const today = new Date().toISOString().split('T')[0];
      
      const { data: defaultersData, error: defaultersError } = await supabase
        .from('fees')
        .select(`
          amount,
          paid_amount,
          due_date,
          students!inner(
            name,
            admission_number,
            classes!inner(
              name
            )
          )
        `)
        .eq('school_id', user.school_id)
        .lt('due_date', today)
        .neq('status', 'paid');

      if (defaultersError) {
        console.error('Error fetching defaulters data:', defaultersError);
        throw defaultersError;
      }

      // Process defaulters data
      const processedDefaulters = defaultersData
        ?.filter(fee => {
          const amount = Number(fee.amount || 0);
          const paidAmount = Number(fee.paid_amount || 0);
          return amount > paidAmount; // Has outstanding amount
        })
        .map(fee => {
          const amount = Number(fee.amount || 0);
          const paidAmount = Number(fee.paid_amount || 0);
          const outstandingAmount = amount - paidAmount;
          
          const dueDate = new Date(fee.due_date);
          const today = new Date();
          const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            student_name: fee.students?.name || 'Unknown Student',
            admission_number: fee.students?.admission_number || 'N/A',
            class_name: fee.students?.classes?.name || 'Unknown Class',
            outstanding_amount: outstandingAmount,
            days_overdue: daysOverdue
          };
        })
        .sort((a, b) => b.outstanding_amount - a.outstanding_amount) // Sort by outstanding amount desc
        .slice(0, 10) || []; // Top 10 defaulters
      
      setDefaultersList(processedDefaulters);
      
    } catch (err: any) {
      console.error('Error fetching defaulters data:', err);
      setError(err);
      setDefaultersList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaultersData();
  }, [user?.school_id]);

  return {
    defaultersList,
    isLoading,
    error,
    refetch: fetchDefaultersData
  };
};
