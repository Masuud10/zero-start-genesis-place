
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Defaulter {
  student_name: string;
  admission_number: string;
  class_name: string;
  outstanding_amount: number;
  days_overdue: number;
}

export const useDefaultersData = () => {
  const [defaultersList, setDefaultersList] = useState<Defaulter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchDefaultersData = async () => {
    if (!user?.school_id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: feesData, error: feesError } = await supabase
        .from('fees')
        .select(`
          *,
          students!fees_student_id_fkey(name, admission_number),
          classes!fees_class_id_fkey(name)
        `)
        .eq('school_id', user.school_id);

      if (feesError) throw feesError;

      // Find defaulters (students with overdue fees) with proper type casting
      const today = new Date();
      const data = feesData?.filter(fee => {
        const dueDate = new Date(fee.due_date);
        const isPastDue = dueDate < today;
        const feeAmount = typeof fee.amount === 'number' ? fee.amount : Number(fee.amount || 0);
        const paidAmount = typeof fee.paid_amount === 'number' ? fee.paid_amount : Number(fee.paid_amount || 0);
        const hasOutstanding = feeAmount > paidAmount;
        return isPastDue && hasOutstanding;
      }).map(fee => {
        const feeAmount = typeof fee.amount === 'number' ? fee.amount : Number(fee.amount || 0);
        const paidAmount = typeof fee.paid_amount === 'number' ? fee.paid_amount : Number(fee.paid_amount || 0);
        const dueDate = new Date(fee.due_date);
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          student_name: fee.students?.name || 'Unknown',
          admission_number: fee.students?.admission_number || 'N/A',
          class_name: fee.classes?.name || 'Unknown',
          outstanding_amount: feeAmount - paidAmount,
          days_overdue: Math.max(0, daysOverdue)
        };
      }) || [];

      setDefaultersList(data);

    } catch (err: any) {
      console.error('Error fetching defaulters data:', err);
      setError(err);
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
