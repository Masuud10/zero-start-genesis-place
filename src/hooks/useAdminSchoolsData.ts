import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { QueryOptimizer, ApiCallWrapper } from '@/utils/apiOptimization';

/**
 * Fetches all schools with their basic information for admin dashboard
 */
export function useAdminSchoolsData(refreshKey = 0) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['admin-schools', refreshKey],
    queryFn: async () => {
      console.log('📊 useAdminSchoolsData: Starting fetch...');
      const startTime = Date.now();
      
      // Guard: Check if user is authenticated and has admin role
      if (!user) {
        throw new Error('User authentication required');
      }
      
      if (!user.role) {
        throw new Error('User role not loaded yet');
      }
      
      if (user.role !== 'edufam_admin' && user.role !== 'elimisha_admin') {
        throw new Error('Access denied. Only EduFam/Elimisha administrators can access school data.');
      }
      
      try {
        const result = await ApiCallWrapper.execute(async () => {
          // Validate query parameters
          QueryOptimizer.validateQueryParams({ user_id: user.id, role: user.role });
          
          const { data, error } = await supabase
            .from('schools')
            .select(`
              id, 
              name, 
              email, 
              phone, 
              address, 
              location,
              created_at,
              updated_at,
              owner_id,
              logo_url,
              website_url,
              motto,
              slogan,
              registration_number,
              year_established,
              owner_information,
              school_type,
              status,
              term_structure,
              curriculum_type
            `)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('❌ useAdminSchoolsData: Supabase error:', error);
            throw new Error(`Failed to fetch schools: ${error.message}`);
          }

          console.log('✅ useAdminSchoolsData: Successfully fetched schools:', {
            count: data?.length || 0,
            firstSchool: data?.[0]?.name || 'None'
          });

          // Ensure we always return an array
          const schools = Array.isArray(data) ? data : [];
          
          // Validate each school has required fields
          const validatedSchools = schools.filter(school => {
            if (!school || !school.id) {
              console.warn('📊 useAdminSchoolsData: Filtering out invalid school:', school);
              return false;
            }
            return true;
          });

          console.log('📊 useAdminSchoolsData: Validated schools:', validatedSchools.length);
          return validatedSchools;
        }, { 
          context: 'Admin Schools Data Fetch',
          timeoutMs: 15000, // 15 second timeout for large datasets
          showErrorToast: false // Don't show toast for this query
        });

        // Log query performance
        QueryOptimizer.logSlowQuery('useAdminSchoolsData', startTime);
        
        return result;
      } catch (error) {
        console.error('❌ useAdminSchoolsData: Fetch error:', error);
        throw error;
      }
    },
    enabled: !!user && !!user.role && (user.role === 'edufam_admin' || user.role === 'elimisha_admin'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      console.log(`📊 useAdminSchoolsData: Retry attempt ${failureCount}:`, error);
      // Don't retry on authentication or permission errors
      if (error.message.includes('authentication') || error.message.includes('Access denied')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
