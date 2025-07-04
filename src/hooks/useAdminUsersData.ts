import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { QueryOptimizer, ApiCallWrapper } from '@/utils/apiOptimization';

/**
 * Fetches all users and their school (for admin dashboard)
 * Uses explicit relationship so PostgREST knows which foreign key to use
 */
export function useAdminUsersData(refreshKey = 0) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-users', refreshKey],
    queryFn: async () => {
      console.log('👥 Fetching admin users data...');
      const startTime = Date.now();
      
      // Guard: Check if user is authenticated and has admin role
      if (!user) {
        throw new Error('User authentication required');
      }
      
      if (!user.role) {
        throw new Error('User role not loaded yet');
      }
      
      if (user.role !== 'edufam_admin' && user.role !== 'elimisha_admin') {
        throw new Error('Access denied. Only EduFam/Elimisha administrators can access user data.');
      }
      
      try {
        const result = await ApiCallWrapper.execute(async () => {
          // Validate query parameters
          QueryOptimizer.validateQueryParams({ user_id: user.id, role: user.role });
          
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
          
          // Ensure we always return an array and validate data
          const users = Array.isArray(data) ? data : [];
          const validatedUsers = users.filter(user => {
            if (!user || !user.id) {
              console.warn('👥 useAdminUsersData: Filtering out invalid user:', user);
              return false;
            }
            return true;
          });
          
          return validatedUsers;
        }, { 
          context: 'Admin Users Data Fetch',
          timeoutMs: 15000, // 15 second timeout for large datasets
          showErrorToast: false // Don't show toast for this query
        });

        // Log query performance
        QueryOptimizer.logSlowQuery('useAdminUsersData', startTime);
        
        return result;
      } catch (error) {
        console.error('❌ useAdminUsersData: Fetch error:', error);
        throw error;
      }
    },
    enabled: !!user && !!user.role && (user.role === 'edufam_admin' || user.role === 'elimisha_admin'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      console.log(`👥 useAdminUsersData: Retry attempt ${failureCount}:`, error);
      // Don't retry on authentication or permission errors
      if (error.message.includes('authentication') || error.message.includes('Access denied')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
