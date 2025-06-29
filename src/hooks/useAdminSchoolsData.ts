
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches all schools with their basic information for admin dashboard
 */
export function useAdminSchoolsData(refreshKey = 0) {
  return useQuery({
    queryKey: ['admin-schools', refreshKey],
    queryFn: async () => {
      console.log('📊 useAdminSchoolsData: Starting fetch...');
      
      try {
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
            curriculum_type,
            principal_name,
            principal_contact,
            principal_email,
            owner_information,
            school_type,
            status,
            subscription_plan,
            max_students,
            timezone,
            term_structure
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

      } catch (error) {
        console.error('❌ useAdminSchoolsData: Fetch error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      console.log(`📊 useAdminSchoolsData: Retry attempt ${failureCount}:`, error);
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
