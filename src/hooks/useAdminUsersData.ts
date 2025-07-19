import { useQuery } from '@tanstack/react-query';
import { useConsolidatedAuth } from '@/hooks/useConsolidatedAuth';
import { supabase } from '@/integrations/supabase/client';

export const useAdminUsersData = () => {
  const { user } = useConsolidatedAuth();

  return useQuery({
    queryKey: ['admin-users-data'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_users_data');
      
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
