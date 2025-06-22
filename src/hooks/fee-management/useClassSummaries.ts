
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
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name')
        .eq('school_id', user.school_id);

      if (classError) throw classError;

      const summaries: ClassSummary[] = [];
      
      for (const cls of classData || []) {
        const { data: feeData, error: feeError } = await supabase
          .from('fees')
          .select('amount, paid_amount, student_id')
          .eq('class_id', cls.id)
          .eq('school_id', user.school_id);

        if (feeError) continue;

        const totalAmount = feeData?.reduce((sum, fee) => sum + (fee.amount || 0), 0) || 0;
        const paidAmount = feeData?.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0) || 0;
        const studentCount = new Set(feeData?.map(fee => fee.student_id).filter(Boolean)).size;
        const balance = totalAmount - paidAmount;

        const summary: ClassSummary = {
          class_id: cls.id,
          class_name: cls.name,
          total_amount: totalAmount,
          paid_amount: paidAmount,
          balance: balance,
          student_count: studentCount,
          // Add legacy aliases for backward compatibility
          total_fees: totalAmount,
          collected: paidAmount,
          outstanding: balance
        };

        summaries.push(summary);
      }

      setClassSummaries(summaries);
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
