
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches all schools with their basic information for admin dashboard
 */
export function useAdminSchoolsData(refreshKey = 0) {
  return useQuery({
    queryKey: ['admin-schools', refreshKey],
    queryFn: async () => {
      console.log('📊 Fetching admin schools data...');
      
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
          owner_id,
          logo_url,
          website_url,
          motto,
          slogan,
          registration_number,
          year_established
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching schools:', error);
        throw new Error(`Failed to fetch schools: ${error.message}`);
      }

      console.log('✅ Schools data fetched successfully:', data?.length || 0, 'schools');
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
}
