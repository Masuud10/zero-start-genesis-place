
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ClassSummary } from './types';

export const useClassSummaries = () => {
  const [classSummaries, setClassSummaries] = useState<ClassSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchClassSummaries = async () => {
    if (!user?.school_id) return;

    try {
      const { data, error } = await supabase
        .from('fees')
        .select(`
          class_id,
          amount,
          paid_amount,
          class:classes(name)
        `)
        .eq('school_id', user.school_id);

      if (error) throw error;

      // Group by class and calculate summaries
      const summaries = data?.reduce((acc: Record<string, any>, fee) => {
        const classId = fee.class_id;
        if (!acc[classId]) {
          acc[classId] = {
            class_id: classId,
            class_name: fee.class?.name || 'Unknown',
            total_amount: 0,
            paid_amount: 0,
            balance: 0,
            student_count: 0,
            total_fees: 0,
            collected: 0,
            outstanding: 0
          };
        }
        
        acc[classId].total_amount += fee.amount || 0;
        acc[classId].paid_amount += fee.paid_amount || 0;
        acc[classId].student_count += 1;
        
        return acc;
      }, {}) || {};

      // Convert to array and calculate derived values
      const summaryArray = Object.values(summaries).map((summary: any) => ({
        ...summary,
        balance: summary.total_amount - summary.paid_amount,
        total_fees: summary.total_amount,
        collected: summary.paid_amount,
        outstanding: summary.total_amount - summary.paid_amount
      })) as ClassSummary[];

      setClassSummaries(summaryArray);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching class summaries:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassSummaries();
  }, [user?.school_id]);

  return {
    classSummaries,
    loading,
    error,
    refetch: fetchClassSummaries
  };
};
