
import { useQuery } from '@tanstack/react-query';
import { SchoolService } from '@/services/schoolService';

export function useAdminSchoolsData(refreshKey: number) {
  return useQuery({
    queryKey: ['admin-schools', refreshKey],
    queryFn: async () => {
      console.log('🏫 EduFamAdmin: Fetching schools data');
      try {
        const result = await SchoolService.getAllSchools();
        if (result.error) {
          console.error('🏫 EduFamAdmin: School fetch error:', result.error);
          throw new Error(result.error.message || 'Failed to fetch schools');
        }
        const schools = result.data || [];
        console.log('🏫 EduFamAdmin: Schools fetched successfully:', schools.length);
        return schools.filter(school => school && typeof school === 'object' && school.id);
      } catch (error) {
        console.error('🏫 EduFamAdmin: Exception fetching schools:', error);
        throw error;
      }
    },
    retry: (failureCount) => {
      console.log('🏫 EduFamAdmin: Retry attempt', failureCount, 'for schools');
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });
}
