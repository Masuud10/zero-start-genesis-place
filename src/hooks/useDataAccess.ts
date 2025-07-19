
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface DataAccessOptions {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  enabled?: boolean;
}

export const useDataAccess = ({ table, select = '*', filters = {}, enabled = true }: DataAccessOptions) => {
  return useQuery({
    queryKey: ['data-access', table, filters],
    queryFn: async () => {
      try {
        // Use a more generic approach to avoid type issues
        const { data, error } = await supabase
          .from(table as any)
          .select(select);

        if (error) {
          console.error(`❌ Error accessing ${table}:`, error);
          throw error;
        }

        console.log(`✅ Successfully accessed ${table}:`, data?.length || 0, 'records');
        return data || [];
      } catch (error: any) {
        console.error(`❌ Error in data access for ${table}:`, error);
        throw error;
      }
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on permission errors
      if (error?.code === 'PGRST116' || error?.message?.includes('policy')) {
        console.error(`🚫 RLS Policy Error for ${table}:`, error);
        return false;
      }
      return failureCount < 3;
    }
  });
};
