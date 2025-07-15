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
    queryKey: ['admin-users', refreshKey, user?.id, user?.role],
    queryFn: async () => {
      console.log('👥 Fetching admin users data...');
      const startTime = Date.now();
      
      // Enhanced guard: Check if user is authenticated and has admin role
      if (!user?.id) {
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
          
          // Optimized query with proper error handling and data validation
          const { data, error } = await supabase
            .from('profiles')
            .select(`
              id, name, email, role, created_at, updated_at, status, school_id,
              school:schools!fk_profiles_school(
                id, name, status
              )
            `)
            .order('created_at', { ascending: false })
            .limit(1000); // Prevent excessive data loading

          if (error) {
            console.error('❌ Error fetching users:', error);
            
            // Provide more specific error messages
            if (error.code === 'PGRST116') {
              throw new Error('Access denied: Insufficient permissions to view user data');
            } else if (error.code === 'PGRST301') {
              throw new Error('Database connection error. Please try again later.');
            } else {
              throw new Error(`Failed to fetch users: ${error.message}`);
            }
          }

          console.log('✅ Users data fetched successfully:', data?.length || 0, 'users');
          
          // Enhanced data validation and sanitization
          const users = Array.isArray(data) ? data : [];
          const validatedUsers = users.filter(userRecord => {
            // Basic validation
            if (!userRecord?.id || !userRecord.email) {
              console.warn('👥 useAdminUsersData: Filtering out invalid user:', userRecord);
              return false;
            }
            
            // Role validation
            const validRoles = ['school_owner', 'principal', 'teacher', 'parent', 'finance_officer', 'hr', 'edufam_admin', 'elimisha_admin'];
            if (!validRoles.includes(userRecord.role)) {
              console.warn('👥 useAdminUsersData: Filtering out user with invalid role:', userRecord.role);
              return false;
            }
            
            return true;
          });
          
          // Sort by most recent first for better UX
          return validatedUsers.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
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
