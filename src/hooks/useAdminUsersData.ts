
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches all users and their school (for admin dashboard)
 * Uses explicit relationship so PostgREST knows which foreign key to use
 */
export function useAdminUsersData(refreshKey = 0) {
  return useQuery({
    queryKey: ['admin-users', refreshKey],
    queryFn: async () => {
      console.log('👥 Fetching admin users data...');
      
      // Explicit join: assumes you want the schools!fk_profiles_school relationship
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, name, email, role, created_at, school_id,
          school:schools!fk_profiles_school(
            id, name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching users:', error);
        throw new Error(`Failed to fetch users: ${error.message}`);
      }

      console.log('✅ Users data fetched successfully:', data?.length || 0, 'users');
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
}
