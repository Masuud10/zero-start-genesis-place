
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useFeeCollectionData = () => {
  const [feeCollectionData, setFeeCollectionData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchFeeCollectionData = async () => {
    if (!user?.school_id) {
      console.log('No school_id available for fee collection data');
      setFeeCollectionData([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching fee collection data for school:', user.school_id);
      
      // Fetch fees grouped by class
      const { data: feesData, error: feesError } = await supabase
        .from('fees')
        .select(`
          amount,
          paid_amount,
          students!inner(
            class_id,
            classes!inner(
              id,
              name
            )
          )
        `)
        .eq('school_id', user.school_id);

      if (feesError) {
        console.error('Error fetching fee collection data:', feesError);
        throw feesError;
      }

      // Group by class and calculate totals
      const classMap = new Map();
      
      feesData?.forEach(fee => {
        const className = fee.students?.classes?.name || 'Unknown Class';
        const amount = Number(fee.amount || 0);
        const paidAmount = Number(fee.paid_amount || 0);
        
        if (!classMap.has(className)) {
          classMap.set(className, {
            class: className,
            expected: 0,
            collected: 0
          });
        }
        
        const classData = classMap.get(className);
        classData.expected += amount;
        classData.collected += paidAmount;
      });

      const collectionData = Array.from(classMap.values());
      
      // If no data, provide some default structure
      if (collectionData.length === 0) {
        setFeeCollectionData([
          { class: 'No Classes', collected: 0, expected: 0 }
        ]);
      } else {
        setFeeCollectionData(collectionData);
      }
      
    } catch (err: any) {
      console.error('Error fetching fee collection data:', err);
      setError(err);
      setFeeCollectionData([]);
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
