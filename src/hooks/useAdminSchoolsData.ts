import { useQuery } from '@tanstack/react-query';
import { useConsolidatedAuth } from '@/hooks/useConsolidatedAuth';
import { supabase } from '@/integrations/supabase/client';
import { QueryOptimizer, ApiCallWrapper } from '@/utils/apiOptimization';

/**
 * Fetches all schools with their basic information for admin dashboard
 */
export const useAdminSchoolsData = () => {
  const { user } = useConsolidatedAuth();

  return useQuery({
    queryKey: ['admin-schools-data'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_schools_data');
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};
