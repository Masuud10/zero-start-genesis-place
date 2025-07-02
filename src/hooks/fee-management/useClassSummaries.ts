
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
    if (!user?.school_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📊 Fetching class summaries for school:', user.school_id);

      // Timeout for the query
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('📊 Class summaries query timed out');
      }, 3000);

      // Optimized query without complex joins
      const { data, error } = await supabase
        .from('fees')
        .select('class_id, amount, paid_amount')
        .eq('school_id', user.school_id)
        .not('amount', 'is', null)
        .not('class_id', 'is', null)
        .limit(300);

      clearTimeout(timeoutId);

      if (error) {
        console.error('📊 Error fetching fees for class summaries:', error);
        throw error;
      }

      console.log('📊 Processing', data?.length || 0, 'fee records');

      if (!data || data.length === 0) {
        setClassSummaries([]);
        setError(null);
        return;
      }

      // Get unique class IDs first
      const classIds = [...new Set(data.map(fee => fee.class_id).filter(Boolean))];
      
      // Fetch class names separately for better performance
      const { data: classesData } = await supabase
        .from('classes')
        .select('id, name')
        .in('id', classIds)
        .eq('school_id', user.school_id)
        .limit(50);

      const classMap = new Map((classesData || []).map(c => [c.id, c.name]));

      // Group by class and calculate summaries
      const summaries = data.reduce((acc: Record<string, any>, fee) => {
        const classId = fee.class_id;
        if (!classId) return acc;
        
        if (!acc[classId]) {
          acc[classId] = {
            class_id: classId,
            class_name: classMap.get(classId) || 'Unknown Class',
            total_amount: 0,
            paid_amount: 0,
            balance: 0,
            student_count: 0,
            total_fees: 0,
            collected: 0,
            outstanding: 0
          };
        }
        
        const amount = Number(fee.amount) || 0;
        const paidAmount = Number(fee.paid_amount) || 0;
        
        acc[classId].total_amount += amount;
        acc[classId].paid_amount += paidAmount;
        acc[classId].student_count += 1;
        
        return acc;
      }, {});

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
