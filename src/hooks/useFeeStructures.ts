
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FeeStructure } from '@/types/finance';

const fetchFeeStructures = async (schoolId: string): Promise<FeeStructure[]> => {
  if (!schoolId) {
    return [];
  }
  const { data, error } = await supabase
    .from('fee_structures')
    .select('*')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching fee structures:', error);
    throw new Error(error.message);
  }

  return data || [];
};

export const useFeeStructures = () => {
  const { user } = useAuth();
  const schoolId = user?.school_id;

  return useQuery<FeeStructure[], Error>({
    queryKey: ['feeStructures', schoolId],
    queryFn: () => fetchFeeStructures(schoolId!),
    enabled: !!schoolId,
  });
};
