
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FeeRecord } from './types';
import { transformFeeRecord } from './utils/dataTransformers';

export const useFeeData = () => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchFees = async () => {
    if (!user?.school_id) return;

    try {
      const { data, error } = await supabase
        .from('fees')
        .select(`
          *,
          student:students(name, admission_number),
          class:classes(name)
        `)
        .eq('school_id', user.school_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData: FeeRecord[] = (data || []).map(transformFeeRecord);
      
      setFees(transformedData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching fees:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [user?.school_id]);

  return {
    fees,
    loading,
    error,
    refetch: fetchFees
  };
};
