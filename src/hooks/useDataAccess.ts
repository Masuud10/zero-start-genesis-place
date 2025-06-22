
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface DataAccessOptions {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  enabled?: boolean;
}

export const useDataAccess = ({ table, select = '*', filters = {}, enabled = true }: DataAccessOptions) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['data-access', table, filters, user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log(`🔍 Accessing ${table} with user:`, {
        userId: user.id,
        role: user.role,
        schoolId: user.school_id
      });

      let query = supabase.from(table).select(select);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      const { data, error } = await query;

      if (error) {
        console.error(`❌ Error accessing ${table}:`, error);
        throw error;
      }

      console.log(`✅ Successfully accessed ${table}:`, data?.length || 0, 'records');
      return data;
    },
    enabled: enabled && !!user,
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
