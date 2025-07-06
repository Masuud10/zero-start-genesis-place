import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useDefaultersData = () => {
  const [defaultersList, setDefaultersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchDefaultersData = useCallback(async () => {
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
      
      // Get today's date for comparison
      const today = new Date().toISOString().split('T')[0];
      
      // First, fetch overdue fees
      const { data: feesData, error: feesError } = await supabase
        .from('fees')
        .select('id, student_id, amount, paid_amount, due_date')
        .eq('school_id', user.school_id)
        .lt('due_date', today)
        .neq('status', 'paid');

      if (feesError) {
        console.error('Error fetching fees data:', feesError);
        throw feesError;
      }

      if (!feesData || feesData.length === 0) {
        setDefaultersList([]);
        return;
      }

      // Get unique student IDs from the fees
      const studentIds = [...new Set(feesData.map(fee => fee.student_id))];

      // Fetch student details with explicit join to classes
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          name,
          admission_number,
          class_id
        `)
        .in('id', studentIds)
        .eq('school_id', user.school_id);

      if (studentsError) {
        console.error('Error fetching students data:', studentsError);
        throw studentsError;
      }

      // Fetch class information separately
      const classIds = [...new Set(studentsData?.map(s => s.class_id).filter(Boolean) || [])];
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('id, name')
        .in('id', classIds);

      if (classesError) {
        console.error('Error fetching classes data:', classesError);
        throw classesError;
      }

      // Create a map for quick class lookup
      const classMap = new Map(classesData?.map(c => [c.id, c.name]) || []);

      // Process defaulters data by combining fees and student info
      const processedDefaulters = feesData
        .filter(fee => {
          const amount = Number(fee.amount || 0);
          const paidAmount = Number(fee.paid_amount || 0);
          return amount > paidAmount; // Has outstanding amount
        })
        .map(fee => {
          const student = studentsData?.find(s => s.id === fee.student_id);
          const amount = Number(fee.amount || 0);
          const paidAmount = Number(fee.paid_amount || 0);
          const outstandingAmount = amount - paidAmount;
          
          const dueDate = new Date(fee.due_date);
          const today = new Date();
          const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            student_name: student?.name || 'Unknown Student',
            admission_number: student?.admission_number || 'N/A',
            class_name: classMap.get(student?.class_id) || 'Unknown Class',
            outstanding_amount: outstandingAmount,
            days_overdue: daysOverdue
          };
        })
        .filter(defaulter => defaulter.student_name !== 'Unknown Student') // Filter out invalid records
        .sort((a, b) => b.outstanding_amount - a.outstanding_amount) // Sort by outstanding amount desc
        .slice(0, 10); // Top 10 defaulters
      
      setDefaultersList(processedDefaulters);
      
    } catch (err: unknown) {
      console.error('Error fetching defaulters data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setDefaultersList([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.school_id]);

  useEffect(() => {
    fetchDefaultersData();
  }, [fetchDefaultersData]);

  return {
    defaultersList,
    isLoading,
    error,
    refetch: fetchDefaultersData
  };
};
