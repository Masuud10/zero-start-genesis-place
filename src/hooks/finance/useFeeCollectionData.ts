
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FeeCollectionData {
  class: string;
  collected: number;
  expected: number;
}

export const useFeeCollectionData = () => {
  const [feeCollectionData, setFeeCollectionData] = useState<FeeCollectionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchFeeCollectionData = async () => {
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
          classes!fees_class_id_fkey(name)
        `)
        .eq('school_id', user.school_id);

      if (feesError) throw feesError;

      // Group fee collection by class with proper type casting
      const classGroups = feesData?.reduce((acc: any, fee) => {
        const className = fee.classes?.name || 'Unknown';
        if (!acc[className]) {
          acc[className] = { collected: 0, expected: 0 };
        }
        const feeAmount = typeof fee.amount === 'number' ? fee.amount : Number(fee.amount || 0);
        const paidAmount = typeof fee.paid_amount === 'number' ? fee.paid_amount : Number(fee.paid_amount || 0);
        
        acc[className].expected += feeAmount;
        acc[className].collected += paidAmount;
        return acc;
      }, {}) || {};

      const data = Object.entries(classGroups).map(([className, data]: [string, any]) => ({
        class: className,
        collected: typeof data.collected === 'number' ? data.collected : Number(data.collected || 0),
        expected: typeof data.expected === 'number' ? data.expected : Number(data.expected || 0)
      }));

      setFeeCollectionData(data);

    } catch (err: any) {
      console.error('Error fetching fee collection data:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeCollectionData();
  }, [user?.school_id]);

  return {
    feeCollectionData,
    isLoading,
    error,
    refetch: fetchFeeCollectionData
  };
};
