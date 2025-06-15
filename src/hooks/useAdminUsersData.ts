
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
      // Explicit join: assumes you want the schools!fk_profiles_school relationship
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, name, email, role, created_at, school_id,
          school:schools!fk_profiles_school(
            id, name
          )
        `);

      if (error) {
        throw new Error(error.message);
      }

      return Array.isArray(data) ? data : [];
    },
  });
}
